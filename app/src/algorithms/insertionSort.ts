import { cells, parseNumbers } from '../engine/frame'
import type { Algorithm, Role, StepGen } from '../engine/types'

const code = `function insertionSort(a) {
  for (let i = 1; i < a.length; i++) {
    const key = a[i]
    let j = i - 1
    while (j >= 0 && a[j] > key) {
      a[j + 1] = a[j]
      j--
    }
    a[j + 1] = key
  }
}`

function* run(input: Record<string, string | number>): StepGen {
  const a = parseNumbers(input.nums, 'nums')
  if (a.length < 2) throw new Error('Give it at least two numbers.')

  let shifts = 0

  const paint = (sortedUpTo: number, extra: Record<number, Role> = {}) => {
    const roles: Record<number, Role> = {}
    for (let k = 0; k < a.length; k++) roles[k] = k <= sortedUpTo ? 'window' : 'idle'
    return cells(a, { ...roles, ...extra })
  }

  const views = (sortedUpTo: number, extra: Record<number, Role> = {}, markers?: { name: string; index: number }[]) => [
    { kind: 'array' as const, label: 'array (left part is always sorted)', cells: paint(sortedUpTo, extra), markers },
  ]

  yield {
    line: 2,
    note:
      'This is how people sort a hand of cards. The left part of the array is kept sorted at all times, starting with just the first element, which is trivially sorted. Each round takes the next element and slides it left into its place.',
    views: views(0, { 0: 'match' }),
    vars: { sorted: a[0], remaining: a.length - 1 },
  }

  for (let i = 1; i < a.length; i++) {
    const key = a[i]
    yield {
      line: [2, 3],
      note: `Take ${key} out of index ${i}. Everything to its left, ${a.slice(0, i).join(', ')}, is already sorted. The job is to slide ${key} back until it lands in the right spot.`,
      views: views(i - 1, { [i]: 'active' }, [{ name: 'key', index: i }]),
      vars: { i, key, 'sorted part': a.slice(0, i).join(', ') },
    }

    let j = i - 1
    let moved = 0
    while (j >= 0 && a[j] > key) {
      yield {
        line: [5, 6],
        note: `${a[j]} is greater than ${key}, so it has to move one place right to open up room. Note this shifts rather than swaps, which is half the writes of a swap-based sort.`,
        views: views(i, { [j]: 'compare', [j + 1]: 'frontier' }, [{ name: 'j', index: j }]),
        vars: { i, key, 'a[j]': a[j], shifts: shifts + moved },
      }
      a[j + 1] = a[j]
      j--
      moved++
    }
    shifts += moved

    a[j + 1] = key
    yield {
      line: 9,
      note:
        moved === 0
          ? `${key} is already at least as large as everything to its left, so nothing shifted and it stays put. On nearly sorted input this happens almost every time, which is why insertion sort is linear on data that is close to ordered.`
          : `${a[j]} ${j >= 0 ? `at index ${j} is not greater than ${key}, so the gap is where ${key} belongs` : `is off the start of the array, so ${key} belongs at the front`}. Drop it into index ${j + 1}.`,
      views: views(i, { [j + 1]: 'match' }),
      vars: { i, key, 'landed at': j + 1, 'shifts this round': moved },
    }
  }

  yield {
    line: 11,
    note: `Sorted in ${shifts} shift${shifts === 1 ? '' : 's'}. Quadratic in the worst case, but only n comparisons and no shifts at all on already sorted input, and it is stable. Those properties are why Timsort and introsort both hand small runs to insertion sort instead of recursing further.`,
    views: views(a.length - 1, Object.fromEntries(a.map((_, k) => [k, 'match' as Role]))),
    vars: { sorted: a.join(', '), shifts },
    result: a.join(', '),
  }
}

export const insertionSort: Algorithm = {
  id: 'insertion-sort',
  name: 'Insertion sort',
  rank: 102,
  tier: 2,
  blurb: 'Keep the left side sorted, slide each new element back into place.',
  realWorld:
    'Timsort, used by Python sorted() and Java Arrays.sort, falls back to insertion sort for runs shorter than about 32 elements, because below that size it beats the asymptotically better algorithms. Introsort in C++ does the same.',
  idea:
    'Maintain the invariant that everything to the left is sorted. Take the next element, then shift larger elements one place right until the gap is in the correct position, and drop it in. It shifts rather than swaps, so each move is one write rather than three, and it stops as soon as it meets something smaller.',
  useWhen:
    'Small arrays, nearly sorted data, and as the base case inside a bigger sort. Also when data arrives one item at a time and you need the collection sorted at every moment, because it is online in a way merge sort and quicksort are not.',
  pitfall:
    'Dismissing it as a toy. It is the fastest option below roughly 32 elements, it is stable, it is in place, and it is adaptive. Knowing exactly when a quadratic algorithm is the right answer is more useful than reciting that it is quadratic.',
  complexity: { time: 'O(n squared) worst, O(n) on sorted input', space: 'O(1)' },
  code,
  inputs: [{ name: 'nums', label: 'nums', kind: 'numbers', value: '5, 2, 8, 1, 9', hint: 'try 1, 2, 3, 4, 5 to see the best case' }],
  run,
}
