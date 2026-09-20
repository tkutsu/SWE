import { cells, parseNumbers } from '../engine/frame'
import type { Algorithm, Role, StepGen } from '../engine/types'

const code = `function selectionSort(a) {
  for (let i = 0; i < a.length - 1; i++) {
    let min = i
    for (let j = i + 1; j < a.length; j++) {
      if (a[j] < a[min]) min = j
    }
    if (min !== i) swap(a, i, min)
  }
}`

function* run(input: Record<string, string | number>): StepGen {
  const a = parseNumbers(input.nums, 'nums')
  if (a.length < 2) throw new Error('Give it at least two numbers.')

  let swaps = 0
  let comparisons = 0

  const paint = (done: number, extra: Record<number, Role> = {}) => {
    const roles: Record<number, Role> = {}
    for (let k = 0; k < a.length; k++) roles[k] = k < done ? 'match' : 'idle'
    return cells(a, { ...roles, ...extra })
  }

  const views = (done: number, extra: Record<number, Role> = {}, markers?: { name: string; index: number }[]) => [
    { kind: 'array' as const, label: 'array', cells: paint(done, extra), markers },
  ]

  yield {
    line: 2,
    note:
      'Repeatedly find the smallest remaining element and put it at the front of the unsorted part. Unlike insertion sort, the sorted region is final from the moment it is written, because the smallest of what remains can never need to move again.',
    views: views(0),
    vars: { n: a.length },
  }

  for (let i = 0; i < a.length - 1; i++) {
    let min = i
    yield {
      line: 3,
      note: `Looking for the smallest value in [${i}, ${a.length - 1}]. Start by assuming it is ${a[i]} at index ${i}.`,
      views: views(i, { [i]: 'active' }, [{ name: 'min', index: min }]),
      vars: { i, 'current min': a[min], 'at index': min },
    }

    for (let j = i + 1; j < a.length; j++) {
      comparisons++
      const better = a[j] < a[min]
      yield {
        line: [4, 5],
        note: `${a[j]} at index ${j} ${better ? `is smaller than ${a[min]}, so it becomes the new candidate` : `is not smaller than ${a[min]}, so the candidate is unchanged`}.`,
        views: views(i, { [j]: 'active', [min]: 'compare' }, [
          { name: 'min', index: min },
          { name: 'j', index: j },
        ]),
        vars: { i, j, 'a[j]': a[j], 'current min': a[min], comparisons },
      }
      if (better) min = j
    }

    if (min !== i) {
      const t = a[i]
      a[i] = a[min]
      a[min] = t
      swaps++
      yield {
        line: 7,
        note: `${a[i]} is the smallest of what was left, so swap it into index ${i}. That is one swap for this entire pass, no matter how far it travelled.`,
        views: views(i + 1, { [i]: 'match', [min]: 'frontier' }),
        vars: { i, placed: a[i], swaps },
      }
    } else {
      yield {
        line: 7,
        note: `${a[i]} was already the smallest remaining, so no swap is needed. Selection sort never does a wasted write.`,
        views: views(i + 1, { [i]: 'match' }),
        vars: { i, placed: a[i], swaps },
      }
    }
  }

  yield {
    line: 9,
    note: `Sorted in ${comparisons} comparisons and only ${swaps} swap${swaps === 1 ? '' : 's'}. The comparison count is fixed at about n squared over 2 regardless of the input, so unlike insertion sort it gets no benefit from data that is already in order. What it does guarantee is at most n-1 writes, which is its one real advantage.`,
    views: views(a.length),
    vars: { sorted: a.join(', '), comparisons, swaps },
    result: a.join(', '),
  }
}

export const selectionSort: Algorithm = {
  id: 'selection-sort',
  name: 'Selection sort',
  rank: 103,
  tier: 2,
  blurb: 'Find the smallest remaining, swap it to the front. Minimum possible writes.',
  realWorld:
    'Rare in general purpose code, but it is the minimum-writes sort. On storage where a write is far more expensive than a read, such as EEPROM or flash with limited erase cycles, doing exactly n-1 swaps rather than potentially n squared matters more than the comparison count.',
  idea:
    'Scan the unsorted region for its smallest element and swap it into the boundary position. That position is then final. The comparison count is the same on every input, sorted or not, because the scan cannot stop early: proving something is the minimum requires looking at everything.',
  useWhen:
    'Almost never for speed. Reach for it when writes are expensive and reads are cheap, or when you need a simple in-place sort with a hard bound on the number of moves.',
  pitfall:
    'Confusing it with insertion sort. Selection sort scans the unsorted part to find a minimum; insertion sort scans the sorted part to find a position. Selection sort is also not stable in its usual swap-based form, which surprises people who assume all simple sorts are.',
  complexity: { time: 'O(n squared) always', space: 'O(1), at most n-1 swaps' },
  code,
  inputs: [{ name: 'nums', label: 'nums', kind: 'numbers', value: '5, 2, 8, 1, 9', hint: 'max 24' }],
  run,
}
