import { parseInt10, parseNumbers } from '../engine/frame'
import type { Algorithm, MapEntry, Role, StepGen } from '../engine/types'

const code = `function subarraysWithSum(nums, k) {
  const seen = new Map([[0, 1]])
  let running = 0
  let count = 0
  for (let i = 0; i < nums.length; i++) {
    running += nums[i]
    count += seen.get(running - k) ?? 0
    seen.set(running, (seen.get(running) ?? 0) + 1)
  }
  return count
}`

function* run(input: Record<string, string | number>): StepGen {
  const nums = parseNumbers(input.nums, 'nums')
  const k = parseInt10(input.k, 'k')

  const seen = new Map<number, number>([[0, 1]])
  let running = 0
  let count = 0
  const prefix: number[] = []
  const hits: [number, number][] = []

  const entries = (highlight?: number): MapEntry[] =>
    [...seen.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([key, value]) => ({ key, value: `seen ${value}x`, role: key === highlight ? ('compare' as Role) : undefined }))

  const views = (i: number, roles: Record<number, Role> = {}) => [
    {
      kind: 'array' as const,
      label: 'nums',
      cells: nums.map((v, idx) => ({ value: v, role: roles[idx] ?? ((idx === i ? 'active' : idx < i ? 'window' : 'idle') as Role) })),
    },
    {
      kind: 'array' as const,
      label: 'running prefix sum after each index',
      cells: prefix.length
        ? prefix.map((v, idx) => ({ value: v, role: (idx === i ? 'active' : 'window') as Role, sub: String(idx) }))
        : [{ value: '-', role: 'idle' as Role }],
    },
    { kind: 'map' as const, label: 'prefix sums seen so far, with counts', entries: entries() },
  ]

  yield {
    line: [2, 3, 4],
    note: `Checking every subarray is O(n squared). Instead note that the sum from i to j is prefix[j] minus prefix[i-1]. So asking "which subarray ending here sums to ${k}" becomes "have I seen the prefix sum ${k} less than the current one". A map answers that instantly. The map starts with 0 seen once, standing for the empty prefix before the array begins.`,
    views: views(-1),
    vars: { k, count: 0 },
  }

  for (let i = 0; i < nums.length; i++) {
    running += nums[i]
    prefix.push(running)

    yield {
      line: [5, 6],
      note: `Add ${nums[i]}. The prefix sum up to index ${i} is now ${running}.`,
      views: views(i),
      vars: { i, 'nums[i]': nums[i], 'prefix sum': running, k, count },
    }

    const need = running - k
    const found = seen.get(need) ?? 0

    yield {
      line: 7,
      note: `A subarray ending at index ${i} sums to ${k} exactly when it starts just after a prefix of ${running} - ${k} = ${need}. ${
        found > 0
          ? `That prefix has been seen ${found} time${found === 1 ? '' : 's'}, so ${found} subarray${found === 1 ? '' : 's'} ending here qualif${found === 1 ? 'ies' : 'y'}.`
          : `That prefix has never occurred, so no subarray ending here works.`
      }`,
      views: [
        views(i)[0],
        views(i)[1],
        { kind: 'map' as const, label: 'prefix sums seen so far, with counts', entries: entries(need) },
      ],
      vars: { i, 'prefix sum': running, 'looking for': need, 'found': found, count: count + found },
    }

    if (found > 0) {
      count += found
      hits.push([i, found])
    }

    seen.set(running, (seen.get(running) ?? 0) + 1)

    yield {
      line: 8,
      note: `Record that prefix ${running} has now occurred${(seen.get(running) ?? 0) > 1 ? ` ${seen.get(running)} times` : ''}. Counting occurrences rather than storing a single index matters: several different starting points can give the same prefix sum, and each is a separate valid subarray.`,
      views: views(i),
      vars: { i, 'prefix sum': running, count },
    }
  }

  yield {
    line: 10,
    note: `${count} subarray${count === 1 ? '' : 's'} sum to ${k}. One pass, and note this works with negative numbers, which is exactly where the sliding window approach would fail, because the running sum is no longer monotonic.`,
    views: views(-1, Object.fromEntries(nums.map((_, idx) => [idx, 'window' as Role]))),
    vars: { count, k },
    result: `${count} subarray${count === 1 ? '' : 's'} summing to ${k}`,
  }
}

export const prefixSums: Algorithm = {
  id: 'prefix-sums',
  name: 'Prefix sums (subarray sum equals k)',
  rank: 20,
  tier: 3,
  blurb: 'Range sums become subtractions, and the search for a start becomes a map lookup.',
  realWorld:
    'Analytics dashboards answer how many events fell between two dates with one subtraction rather than a scan. The two dimensional version, the integral image, is what made real time face detection fast enough to ship.',
  idea:
    'Precompute the running total up to each index. Then the sum of any range is one subtraction of two of those totals. That alone turns repeated range queries from linear into constant. Pair it with a hash map of totals already seen and you can answer "how many subarrays ending here sum to k" in one lookup, which collapses the whole problem to a single pass.',
  useWhen:
    'Repeated range sum queries, subarray sum equals k, counting subarrays divisible by k, and the difference array trick for applying many range updates cheaply. In two dimensions the same idea gives rectangle sums in constant time.',
  pitfall:
    'Seeding the map without the entry mapping 0 to 1. Without it, any subarray starting at index 0 is missed, because there is no recorded empty prefix for it to subtract. Also storing a boolean rather than a count, which undercounts whenever the same prefix sum occurs more than once.',
  complexity: { time: 'O(n)', space: 'O(n)' },
  code,
  inputs: [
    { name: 'nums', label: 'nums', kind: 'numbers', value: '3, 4, 7, 2, -3, 1, 4, 2' },
    { name: 'k', label: 'target sum k', kind: 'number', value: 7 },
  ],
  run,
}
