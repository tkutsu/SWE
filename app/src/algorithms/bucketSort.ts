import { cells, parseNumbers } from '../engine/frame'
import type { Algorithm, Role, StackItem, StepGen } from '../engine/types'

const code = `function bucketSort(a, k) {
  const lo = Math.min(...a)
  const hi = Math.max(...a)
  const buckets = Array.from({ length: k }, () => [])
  for (const v of a) {
    const i = Math.floor(((v - lo) / (hi - lo + 1)) * k)
    buckets[i].push(v)
  }
  for (const b of buckets) insertionSort(b)
  return buckets.flat()
}`

function* run(input: Record<string, string | number>): StepGen {
  const a = parseNumbers(input.nums, 'nums')
  if (a.length < 4 || a.length > 16) throw new Error('Give between 4 and 16 numbers.')
  const k = Number(input.buckets)
  if (!Number.isInteger(k) || k < 2 || k > 6) throw new Error('Bucket count must be a whole number between 2 and 6.')

  const lo = Math.min(...a)
  const hi = Math.max(...a)
  const span = hi - lo + 1
  const idx = (v: number) => Math.min(k - 1, Math.floor(((v - lo) / span) * k))

  const buckets: number[][] = Array.from({ length: k }, () => [])

  const bucketViews = (active = -1, sortedUpTo = -1) =>
    buckets.map((b, i) => ({
      kind: 'stack' as const,
      label: `bucket ${i}: ${Math.floor(lo + (i * span) / k)} to ${Math.floor(lo + ((i + 1) * span) / k) - 1}`,
      orientation: 'horizontal' as const,
      items: b.map<StackItem>((v) => ({ label: String(v), role: (i === active ? 'active' : i <= sortedUpTo ? 'match' : 'window') as Role })),
    }))

  yield {
    line: [2, 4],
    note: `Every comparison sort is stuck at n log n. Bucket sort steps around that by not comparing across the whole array: spread the values into ${k} ranges, sort each small pile, then read the piles out in order. It only works if the values are spread out reasonably evenly, and that assumption is the whole trade.`,
    views: [{ kind: 'array', label: 'the array', cells: cells(a) }, ...bucketViews()],
    vars: { n: a.length, buckets: k, range: `${lo} to ${hi}` },
  }

  for (let i = 0; i < a.length; i++) {
    const b = idx(a[i])
    buckets[b].push(a[i])
    yield {
      line: [6, 7],
      note: `${a[i]} falls in bucket ${b}. The bucket is worked out by arithmetic, not by comparing against anything, which is why scattering all ${a.length} values is O(n).`,
      views: [
        { kind: 'array', label: 'the array', cells: cells(a, { [i]: 'active' }) },
        ...bucketViews(b),
      ],
      vars: { value: a[i], 'into bucket': b, scattered: i + 1 },
    }
  }

  const sizes = buckets.map((b) => b.length)
  yield {
    line: 9,
    note: `Everything is scattered. Bucket sizes are ${sizes.join(', ')}. This is the moment the whole thing is decided: if the sizes are even, each pile is tiny and sorting it costs almost nothing. If one bucket holds everything, you have just run insertion sort on the original array and paid O(n squared).`,
    views: [...bucketViews()],
    vars: { sizes: sizes.join(', '), largest: Math.max(...sizes), 'ideal size': (a.length / k).toFixed(1) },
  }

  for (let b = 0; b < k; b++) {
    buckets[b].sort((x, y) => x - y)
    yield {
      line: 9,
      note: buckets[b].length
        ? `Sort bucket ${b} on its own: ${buckets[b].join(', ')}. Insertion sort is the usual choice here precisely because the piles are expected to be small, and it is linear on data that is nearly sorted already.`
        : `Bucket ${b} is empty, so there is nothing to sort.`,
      views: [...bucketViews(-1, b)],
      vars: { bucket: b, size: buckets[b].length, contents: buckets[b].join(', ') || 'empty' },
    }
  }

  const out = buckets.flat()
  yield {
    line: 10,
    note: `Concatenate the buckets in order and the array is sorted, with no comparison ever made between values in different buckets. That is where the saving comes from: bucket 0 is known to be below bucket 1 by construction.`,
    views: [{ kind: 'array', label: 'sorted', cells: cells(out, Object.fromEntries(out.map((_, i) => [i, 'match' as Role]))) }],
    vars: { sorted: out.join(', '), buckets: k },
    result: out.join(', '),
  }
}

export const bucketSort: Algorithm = {
  id: 'bucket-sort',
  name: 'Bucket Sort',
  blurb: 'Scatter into ranges, sort each small pile, read them back in order.',
  realWorld:
    'Histogram building and percentile estimation over metrics are this without the final sort, and database query planners bucket column values to estimate selectivity. It is also how external sorts split a file too large for memory into chunks that each fit.',
  idea:
    'Comparison sorting cannot beat n log n, so stop comparing across the whole array. If the values are spread roughly evenly across a known range, arithmetic alone says which of k ranges a value belongs to. Scattering is one pass, each bucket is small enough that a simple quadratic sort on it is cheap, and concatenating needs no comparisons at all because bucket order is range order.',
  useWhen:
    'Values spread fairly evenly over a known range, especially floats in 0 to 1, where counting sort cannot help because there are no discrete keys to count. Also as a first pass on data too large for memory, where each bucket becomes a chunk you sort separately.',
  pitfall:
    'The even distribution assumption, which is doing all the work and is usually unstated. Skewed data puts everything in one bucket and the whole thing degrades to whatever you sort the buckets with, which is typically O(n squared). Say the assumption out loud, and say what happens when it fails.',
  complexity: { time: 'O(n + k) average, O(n^2) worst', space: 'O(n + k)' },
  code,
  inputs: [
    { name: 'nums', label: 'nums', kind: 'numbers', value: '29, 25, 3, 49, 9, 37, 21, 43' },
    { name: 'buckets', label: 'buckets', kind: 'number', value: 4 },
  ],
  run,
}
