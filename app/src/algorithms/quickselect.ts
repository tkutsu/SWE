import { cells, parseInt10, parseNumbers } from '../engine/frame'
import type { Algorithm, Role, StepGen } from '../engine/types'

const code = `function quickselect(a, k) {
  let lo = 0
  let hi = a.length - 1
  for (;;) {
    const p = partition(a, lo, hi)
    if (p === k) return a[p]
    if (p < k) lo = p + 1
    else hi = p - 1
  }
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

/** 1st, 2nd, 3rd, 4th, and correct for the teens. */
function ordinal(n: number): string {
  const tens = n % 100
  if (tens >= 11 && tens <= 13) return `${n}th`
  return `${n}${['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`
}

function* run(input: Record<string, string | number>): StepGen {
  const a = parseNumbers(input.nums, 'nums')
  if (a.length < 2) throw new Error('Give it at least two numbers.')
  const k = parseInt10(input.k, 'k')
  if (k < 1 || k > a.length) throw new Error(`k must be between 1 and ${a.length}.`)
  const target = k - 1

  const paint = (lo: number, hi: number, extra: Record<number, Role> = {}) => {
    const roles: Record<number, Role> = {}
    for (let i = 0; i < a.length; i++) roles[i] = i < lo || i > hi ? 'excluded' : 'window'
    return cells(a, { ...roles, ...extra })
  }

  const views = (lo: number, hi: number, extra: Record<number, Role> = {}, markers?: { name: string; index: number }[]) => [
    { kind: 'array' as const, label: 'array (rearranged in place)', cells: paint(lo, hi, extra), markers },
  ]

  let lo = 0
  let hi = a.length - 1
  let comparisons = 0

  yield {
    line: [2, 3],
    note: `Looking for the ${ordinal(k)} smallest, which is index ${target} once sorted. Sorting the whole array would be O(n log n), but you do not need the other elements in order. Partitioning puts one element exactly where it belongs and tells you which side to keep looking in.`,
    views: views(lo, hi),
    vars: { k, 'target index': target },
  }

  for (;;) {
    const pivot = a[hi]
    yield {
      line: [13, 14, 15],
      note: `Partition the range [${lo}, ${hi}] around the pivot ${pivot}, taken from the end. Everything smaller will end up to its left, everything larger to its right.`,
      views: views(lo, hi, { [hi]: 'active' }, [{ name: 'pivot', index: hi }]),
      vars: { lo, hi, pivot },
    }

    let i = lo
    for (let j = lo; j < hi; j++) {
      comparisons++
      const smaller = a[j] < pivot
      yield {
        line: [16, 17],
        note: `${a[j]} at index ${j} is ${smaller ? `below ${pivot}, so swap it into the small region and grow that region by one` : `not below ${pivot}, so leave it where it is`}.`,
        views: views(lo, hi, { [j]: 'active', [hi]: 'compare', ...(i !== j ? { [i]: 'frontier' } : {}) }, [
          { name: 'i', index: i },
          { name: 'j', index: j },
        ]),
        vars: { j, 'a[j]': a[j], pivot, 'boundary i': i },
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

    yield {
      line: [20, 21],
      note: `Swap the pivot into index ${i}. Everything left of it is smaller and everything right is larger, so ${pivot} is now in its final sorted position, even though neither side is sorted.`,
      views: views(lo, hi, { [i]: 'match' }, [{ name: 'p', index: i }]),
      vars: { 'pivot landed at': i, 'target index': target, comparisons },
    }

    if (i === target) {
      yield {
        line: 6,
        note: `The pivot landed exactly on index ${target}, so ${a[i]} is the answer. ${comparisons} comparisons, and the array was never fully sorted.`,
        views: views(0, a.length - 1, { [i]: 'match' }),
        vars: { answer: a[i], comparisons },
        result: `${ordinal(k)} smallest is ${a[i]} (${comparisons} comparisons)`,
      }
      return
    }

    if (i < target) {
      yield {
        line: 7,
        note: `Index ${i} is left of the target ${target}, so the answer is somewhere to the right. Discard indices ${lo} to ${i} entirely and never look at them again. That discarding is why this averages linear time rather than n log n: each round throws away a chunk instead of recursing into both halves.`,
        views: views(i + 1, hi),
        vars: { discarded: i - lo + 1, 'new lo': i + 1, hi },
      }
      lo = i + 1
    } else {
      yield {
        line: 8,
        note: `Index ${i} is right of the target ${target}, so the answer is to the left. Discard from ${i} to ${hi}.`,
        views: views(lo, i - 1),
        vars: { discarded: hi - i + 1, lo, 'new hi': i - 1 },
      }
      hi = i - 1
    }
  }
}

export const quickselect: Algorithm = {
  id: 'quickselect',
  name: 'Quickselect (kth smallest)',
  blurb: 'Partition, then recurse into one side only.',
  realWorld:
    'Reporting p99 latency means finding one element near the top of millions of samples without sorting any of them. Median filters for image denoising do the same thing per pixel.',
  idea:
    'Partitioning places one element in its final position and splits the rest into smaller and larger. Compare that position against the index you want. If it matches you are done. If not, the answer lies entirely on one side, so you throw the other side away instead of sorting it. Because each round discards roughly half the remaining elements, the total work is n plus n/2 plus n/4, which sums to linear on average rather than n log n.',
  useWhen:
    'Kth largest or smallest, median, and top-k when you do not need the k in sorted order. This is the answer when you say "heap, O(n log k)" and the interviewer asks whether you can do better.',
  pitfall:
    'The worst case is O(n squared) on already sorted input with a last-element pivot, because every partition peels off one element. Choosing a random pivot fixes it, and saying so unprompted is the point of the question. Also note this mutates the input, which matters if the caller still needs the original order.',
  complexity: { time: 'O(n) average, O(n squared) worst', space: 'O(1)' },
  code,
  inputs: [
    { name: 'nums', label: 'nums', kind: 'numbers', value: '7, 2, 9, 4, 1, 8, 3' },
    { name: 'k', label: 'k (1 = smallest)', kind: 'number', value: 3 },
  ],
  run,
}
