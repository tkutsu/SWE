import { cells, parseNumbers } from '../engine/frame'
import type { Algorithm, Role, StepGen } from '../engine/types'

const code = `function quicksort(a, lo, hi) {
  if (lo >= hi) return
  const p = partition(a, lo, hi)
  quicksort(a, lo, p - 1)
  quicksort(a, p + 1, hi)
}

function partition(a, lo, hi) {
  const pivot = a[hi]
  let i = lo
  for (let j = lo; j < hi; j++) {
    if (a[j] < pivot) {
      swap(a, i, j)
      i++
    }
  }
  swap(a, i, hi)
  return i
}`

function* run(input: Record<string, string | number>): StepGen {
  const a = parseNumbers(input.nums, 'nums')
  if (a.length < 2) throw new Error('Give it at least two numbers.')
  if (a.length > 9) throw new Error('Keep it to 9 values so the recursion stays followable.')

  const settled = new Set<number>()

  const paint = (lo: number, hi: number, extra: Record<number, Role> = {}) => {
    const roles: Record<number, Role> = {}
    for (let k = 0; k < a.length; k++) {
      roles[k] = settled.has(k) ? 'match' : k >= lo && k <= hi ? 'window' : 'excluded'
    }
    return cells(a, { ...roles, ...extra })
  }

  const views = (lo: number, hi: number, extra: Record<number, Role> = {}, markers?: { name: string; index: number }[]) => [
    { kind: 'array' as const, label: 'array (sorted in place)', cells: paint(lo, hi, extra), markers },
  ]

  yield {
    line: 1,
    note:
      'Quicksort does its work on the way down, unlike merge sort which does it on the way up. Partition puts one element in its final place and splits the rest into smaller and larger, then each side is sorted the same way. No merge step and no extra array.',
    views: views(0, a.length - 1),
    vars: { input: a.join(', ') },
  }

  function* sort(lo: number, hi: number, depth: number): StepGen {
    if (lo >= hi) {
      if (lo === hi) settled.add(lo)
      yield {
        line: 2,
        note:
          lo === hi
            ? `Range [${lo}, ${hi}] is a single element, ${a[lo]}, which is already in place.`
            : `Range [${lo}, ${hi}] is empty, nothing to do.`,
        views: views(lo, hi),
        vars: { lo, hi, depth },
      }
      return
    }

    const pivot = a[hi]
    yield {
      line: [3, 9, 10],
      note: `Partition [${lo}, ${hi}] around the pivot ${pivot}, taken from the right end. i marks the boundary of the "smaller than pivot" region, which starts empty.`,
      views: views(lo, hi, { [hi]: 'active' }, [{ name: 'pivot', index: hi }]),
      vars: { lo, hi, pivot, depth },
    }

    let i = lo
    for (let j = lo; j < hi; j++) {
      const smaller = a[j] < pivot
      yield {
        line: [11, 12],
        note: `${a[j]} at index ${j} is ${smaller ? `below ${pivot}, so swap it to index ${i} and push the boundary right` : `not below ${pivot}, so it stays on the large side and the boundary does not move`}.`,
        views: views(lo, hi, { [j]: 'active', [hi]: 'compare', ...(i !== j ? { [i]: 'frontier' } : {}) }, [
          { name: 'i', index: i },
          { name: 'j', index: j },
        ]),
        vars: { j, 'a[j]': a[j], pivot, boundary: i },
      }
      if (smaller) {
        const t = a[i]
        a[i] = a[j]
        a[j] = t
        i++
      }
    }

    const t = a[i]
    a[i] = a[hi]
    a[hi] = t
    settled.add(i)

    yield {
      line: [17, 18],
      note: `Swap the pivot into index ${i}, the boundary. Everything left is smaller, everything right is larger, so ${pivot} is now in its final sorted position and never moves again.`,
      views: views(lo, hi, { [i]: 'match' }, [{ name: 'p', index: i }]),
      vars: { 'pivot final index': i, depth },
    }

    yield {
      line: 4,
      note: `Sort the left side [${lo}, ${i - 1}] the same way. The pivot itself is excluded, which is what guarantees the recursion shrinks.`,
      views: views(lo, i - 1),
      vars: { lo, hi: i - 1, depth },
    }
    yield* sort(lo, i - 1, depth + 1)

    yield {
      line: 5,
      note: `Now the right side [${i + 1}, ${hi}].`,
      views: views(i + 1, hi),
      vars: { lo: i + 1, hi, depth },
    }
    yield* sort(i + 1, hi, depth + 1)
  }

  yield* sort(0, a.length - 1, 0)

  yield {
    line: 6,
    note: `Sorted: ${a.join(', ')}. Notice nothing was ever copied into a second array. That in-place property, and the good cache behaviour that comes with it, is why quicksort usually beats merge sort in practice despite the worse worst case.`,
    views: views(0, a.length - 1),
    vars: { sorted: a.join(', ') },
    result: a.join(', '),
  }
}

export const quickSort: Algorithm = {
  id: 'quick-sort',
  name: 'Quicksort',
  blurb: 'Partition around a pivot, then sort each side. In place, no merge.',
  realWorld:
    'The C standard library qsort, and most standard library sorts for primitive types where stability does not matter. V8 used quicksort for arrays for years before switching to Timsort for stability.',
  idea:
    'Partitioning places one element where it belongs and guarantees everything left of it is smaller and everything right is larger. Then the two sides are independent subproblems. Merge sort splits trivially and does the work merging; quicksort does the work splitting and has nothing left to do afterwards. The catch is that the split depends on the pivot, so a bad pivot gives an uneven split.',
  useWhen:
    'The default in-place comparison sort. Its partition step is also the engine behind quickselect, Dutch national flag partitioning, and sorting colours or categories in one pass.',
  pitfall:
    'Always taking the first or last element as pivot. On already sorted input every partition peels off one element and it degrades to O(n squared), which is the exact case a nervous interviewer will hand you. Random or median-of-three pivots fix it. It is also not stable, so it is the wrong choice for sorting objects by a secondary key.',
  complexity: { time: 'O(n log n) average, O(n squared) worst', space: 'O(log n) for the recursion' },
  code,
  inputs: [{ name: 'nums', label: 'nums', kind: 'numbers', value: '5, 2, 8, 1, 9, 3', hint: 'max 9. Try 1, 2, 3, 4, 5 to see the worst case.' }],
  run,
}
