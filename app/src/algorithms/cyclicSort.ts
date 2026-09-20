import { cells, parseNumbers } from '../engine/frame'
import type { Algorithm, Role, StepGen } from '../engine/types'

const code = `function firstMissing(a) {
  let i = 0
  while (i < a.length) {
    const want = a[i] - 1
    if (a[i] >= 1 && a[i] <= a.length && a[i] !== a[want]) {
      swap(a, i, want)
    } else {
      i++
    }
  }
  for (let k = 0; k < a.length; k++) {
    if (a[k] !== k + 1) return k + 1
  }
  return a.length + 1
}`

function* run(input: Record<string, string | number>): StepGen {
  const a = parseNumbers(input.nums, 'nums')
  if (a.length === 0) throw new Error('Give it some numbers.')
  if (a.length > 10) throw new Error('Keep it to 10 values so the swaps stay followable.')

  const home = (v: number) => v - 1
  const settled = (i: number) => a[i] === i + 1

  const paint = (extra: Record<number, Role> = {}) => {
    const roles: Record<number, Role> = {}
    for (let i = 0; i < a.length; i++) roles[i] = settled(i) ? 'match' : 'idle'
    return cells(a, { ...roles, ...extra })
  }

  const views = (extra: Record<number, Role> = {}, markers?: { name: string; index: number }[]) => [
    { kind: 'array' as const, label: 'array (value v belongs at index v-1)', cells: paint(extra), markers },
  ]

  yield {
    line: 2,
    note: `The values are meant to be 1 to ${a.length}, so each value has exactly one correct slot: value v belongs at index v-1. That means the array can act as its own hash table, and no extra memory is needed at all. Walk left to right, sending each value home until the current slot is correct.`,
    views: views(),
    vars: { n: a.length, input: a.join(', ') },
  }

  let i = 0
  let swaps = 0
  let guard = 0

  while (i < a.length) {
    if (guard++ > a.length * 4) throw new Error('The swap loop did not settle, which should be impossible. Check the input.')

    const v = a[i]
    const want = home(v)
    const inRange = v >= 1 && v <= a.length

    if (!inRange) {
      yield {
        line: [4, 5, 8],
        note: `${v} is outside 1 to ${a.length}, so it has no home slot here and can never be the answer. Leave it and move on. Values like this are just occupying space that the real answer would have wanted.`,
        views: views({ [i]: 'excluded' }, [{ name: 'i', index: i }]),
        vars: { i, value: v, 'in range': false },
      }
      i++
      continue
    }

    if (a[want] === v) {
      yield {
        line: [5, 8],
        note:
          want === i
            ? `${v} is already at index ${i}, which is its home. Move on.`
            : `${v} wants index ${want}, but index ${want} already holds ${v}. This is a duplicate, and swapping would loop forever. Leave it and move on. This guard is what stops the algorithm spinning.`,
        views: views({ [i]: want === i ? 'match' : 'excluded', [want]: 'compare' }, [{ name: 'i', index: i }]),
        vars: { i, value: v, 'home index': want, duplicate: want !== i },
      }
      i++
      continue
    }

    yield {
      line: [4, 5, 6],
      note: `${v} at index ${i} belongs at index ${want}, which currently holds ${a[want]}. Swap them. i does not advance, because whatever lands at index ${i} needs checking too.`,
      views: views({ [i]: 'active', [want]: 'compare' }, [{ name: 'i', index: i }, { name: 'home', index: want }]),
      vars: { i, value: v, 'home index': want, 'displacing': a[want] },
    }

    const t = a[i]
    a[i] = a[want]
    a[want] = t
    swaps++

    yield {
      line: 6,
      note: `Swapped. ${v} is home at index ${want} and will never move again. That is why this is linear despite the nested-looking loop: each swap permanently places one value, so there can be at most n of them.`,
      views: views({ [want]: 'match', [i]: 'active' }, [{ name: 'i', index: i }]),
      vars: { i, swaps },
    }
  }

  yield {
    line: 11,
    note: 'Every value that has a home is in it. Now one scan finds the first index whose value is wrong, and that index plus one is the smallest missing positive.',
    views: views(),
    vars: { swaps, array: a.join(', ') },
  }

  for (let k = 0; k < a.length; k++) {
    if (a[k] !== k + 1) {
      yield {
        line: [12, 13],
        note: `Index ${k} should hold ${k + 1} but holds ${a[k]}. So ${k + 1} is missing, and since every smaller value was in place, it is the smallest one missing.`,
        views: views({ [k]: 'active' }, [{ name: 'k', index: k }]),
        vars: { k, expected: k + 1, found: a[k] },
        result: `smallest missing positive is ${k + 1}`,
      }
      return
    }
  }

  yield {
    line: 15,
    note: `Every slot holds exactly the value it should, so 1 through ${a.length} are all present and the smallest missing positive is ${a.length + 1}. The whole thing ran in linear time using no memory beyond the input array, which is what makes this problem interesting.`,
    views: views(),
    vars: { answer: a.length + 1 },
    result: `smallest missing positive is ${a.length + 1}`,
  }
}

export const cyclicSort: Algorithm = {
  id: 'cyclic-sort',
  name: 'Cyclic sort (smallest missing positive)',
  blurb: 'When values are bounded by the array length, the array is its own hash table.',
  realWorld:
    'Working out which packet sequence numbers never arrived, or which IDs are missing from a range, without allocating a second structure to track what you have seen.',
  idea:
    'If the values are meant to be 1 to n, then each value has exactly one correct index and the array can index itself. Walk through it and repeatedly swap the current value into its home slot until the current slot is correct, then move on. Each swap puts one value permanently in place, so despite the inner loop the total number of swaps is at most n. Afterwards one scan finds the first slot that is wrong.',
  useWhen:
    'Anything phrased as "the array contains numbers in the range 1 to n" and asking for a missing value, a duplicate, all missing values, or the first missing positive. The constraint on the range is the signal, and it is almost always there on purpose.',
  pitfall:
    'Not guarding against duplicates. If the home slot already holds the same value, swapping does nothing and the loop spins forever. Checking a[i] !== a[want] rather than comparing indices handles both duplicates and already-correct positions in one condition.',
  complexity: { time: 'O(n)', space: 'O(1)' },
  code,
  inputs: [{ name: 'nums', label: 'nums', kind: 'numbers', value: '3, 4, -1, 1', hint: 'try 1, 2, 0 or 7, 8, 9, 11' }],
  run,
}
