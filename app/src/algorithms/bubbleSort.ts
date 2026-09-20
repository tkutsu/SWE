import { cells, parseNumbers } from '../engine/frame'
import type { Algorithm, Role, StepGen } from '../engine/types'

const code = `function bubbleSort(a) {
  for (let pass = 0; pass < a.length - 1; pass++) {
    let swapped = false
    for (let j = 0; j < a.length - 1 - pass; j++) {
      if (a[j] > a[j + 1]) {
        swap(a, j, j + 1)
        swapped = true
      }
    }
    if (!swapped) return
  }
}`

function* run(input: Record<string, string | number>): StepGen {
  const a = parseNumbers(input.nums, 'nums')
  if (a.length < 2) throw new Error('Give it at least two numbers.')
  if (a.length > 8) throw new Error('Keep it to 8 values, bubble sort generates a lot of steps.')

  let swaps = 0

  const paint = (lockedFrom: number, extra: Record<number, Role> = {}) => {
    const roles: Record<number, Role> = {}
    for (let k = 0; k < a.length; k++) roles[k] = k >= lockedFrom ? 'match' : 'idle'
    return cells(a, { ...roles, ...extra })
  }

  const views = (lockedFrom: number, extra: Record<number, Role> = {}) => [
    { kind: 'array' as const, label: 'array (green tail is final)', cells: paint(lockedFrom, extra) },
  ]

  yield {
    line: 2,
    note:
      'Walk the array comparing neighbours and swapping any that are out of order. Each full pass drags the largest remaining value to the end, like a bubble rising, so after one pass the last element is final, after two the last two are, and so on.',
    views: views(a.length),
    vars: { n: a.length },
  }

  for (let pass = 0; pass < a.length - 1; pass++) {
    let swapped = false
    const lockedFrom = a.length - pass

    yield {
      line: [2, 3],
      note: `Pass ${pass + 1}. The last ${pass} element${pass === 1 ? '' : 's'} ${pass === 0 ? 'are not settled yet' : 'are already final, so this pass only needs to reach index ' + (lockedFrom - 2)}.`,
      views: views(lockedFrom),
      vars: { pass: pass + 1, 'compares up to': lockedFrom - 2, swaps },
    }

    for (let j = 0; j < a.length - 1 - pass; j++) {
      const outOfOrder = a[j] > a[j + 1]
      yield {
        line: [4, 5],
        note: `Compare ${a[j]} and ${a[j + 1]}. ${outOfOrder ? 'Out of order, so swap them.' : 'Already in order, leave them.'}`,
        views: views(lockedFrom, { [j]: outOfOrder ? 'active' : 'compare', [j + 1]: outOfOrder ? 'active' : 'compare' }),
        vars: { pass: pass + 1, j, left: a[j], right: a[j + 1], swaps },
      }
      if (outOfOrder) {
        const t = a[j]
        a[j] = a[j + 1]
        a[j + 1] = t
        swapped = true
        swaps++
      }
    }

    if (!swapped) {
      yield {
        line: 10,
        note: `A whole pass with no swaps means nothing is out of order anywhere, so the array is sorted and the remaining passes would do nothing. This early exit is the only thing that makes bubble sort O(n) on sorted input, and without it there is no argument for using it at all.`,
        views: views(0, Object.fromEntries(a.map((_, k) => [k, 'match' as Role]))),
        vars: { pass: pass + 1, swaps, 'early exit': true },
      }
      break
    }

    yield {
      line: 9,
      note: `Pass ${pass + 1} done. ${a[lockedFrom - 1]} has bubbled to index ${lockedFrom - 1} and is now final.`,
      views: views(lockedFrom - 1),
      vars: { pass: pass + 1, settled: a[lockedFrom - 1], swaps },
    }
  }

  yield {
    line: 12,
    note: `Sorted in ${swaps} swap${swaps === 1 ? '' : 's'}. Worth knowing so you can explain why you would not use it: quadratic time with a large constant, and every element moves one position at a time rather than jumping to where it belongs.`,
    views: views(0, Object.fromEntries(a.map((_, k) => [k, 'match' as Role]))),
    vars: { sorted: a.join(', '), swaps },
    result: a.join(', '),
  }
}

export const bubbleSort: Algorithm = {
  id: 'bubble-sort',
  name: 'Bubble sort',
  blurb: 'Swap adjacent pairs until a pass makes no swaps. Mostly here as a baseline.',
  realWorld:
    'Effectively never used in production. It survives in teaching because the swapped flag makes it O(n) on already sorted data, and because being able to say precisely why it loses to insertion sort, which does the same number of comparisons with a third of the writes, is a real answer.',
  idea:
    'Compare each adjacent pair and swap when they are out of order. One pass guarantees the largest remaining element reaches the end, so each pass shrinks the unsorted region by one. If a pass completes without swapping anything, no pair is out of order, which means the whole array is sorted and you can stop.',
  useWhen:
    'As a point of comparison, not as an implementation. If an interviewer asks you to sort something and you reach for this, the follow-up will be why.',
  pitfall:
    'Leaving out the swapped flag, which throws away the only good property it has. Also forgetting to shrink the inner loop by the pass count, which repeatedly re-compares elements already known to be final.',
  complexity: { time: 'O(n squared) worst, O(n) on sorted input', space: 'O(1)' },
  code,
  inputs: [{ name: 'nums', label: 'nums', kind: 'numbers', value: '5, 2, 8, 1', hint: 'max 8, it produces a lot of steps' }],
  run,
}
