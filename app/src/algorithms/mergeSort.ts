import { cells, parseNumbers } from '../engine/frame'
import type { Algorithm, Role, StepGen } from '../engine/types'

const code = `function mergeSort(a, lo, hi) {
  if (hi - lo <= 1) return
  const mid = (lo + hi) >> 1
  mergeSort(a, lo, mid)
  mergeSort(a, mid, hi)
  merge(a, lo, mid, hi)
}

function merge(a, lo, mid, hi) {
  const buf = []
  let i = lo
  let j = mid
  while (i < mid && j < hi) {
    if (a[i] <= a[j]) buf.push(a[i++])
    else buf.push(a[j++])
  }
  while (i < mid) buf.push(a[i++])
  while (j < hi) buf.push(a[j++])
  for (let k = 0; k < buf.length; k++) a[lo + k] = buf[k]
}`

function* run(input: Record<string, string | number>): StepGen {
  const a = parseNumbers(input.nums, 'nums')
  if (a.length > 10) throw new Error(`${a.length} values makes for a very long walkthrough. Keep it to 10.`)
  if (a.length < 2) throw new Error('Give it at least two numbers.')

  const span = (lo: number, hi: number, extra: Record<number, Role> = {}) => {
    const roles: Record<number, Role> = {}
    for (let k = 0; k < a.length; k++) roles[k] = k >= lo && k < hi ? 'window' : 'excluded'
    return cells(a, { ...roles, ...extra })
  }

  const views = (lo: number, hi: number, extra: Record<number, Role> = {}, buf?: number[]) => {
    const out = [{ kind: 'array' as const, label: 'array', cells: span(lo, hi, extra) }]
    if (buf) {
      out.push({
        kind: 'array' as const,
        label: 'merge buffer',
        cells: buf.length ? buf.map((v) => ({ value: v, role: 'match' as Role })) : [{ value: '-', role: 'idle' as Role }],
      })
    }
    return out
  }

  yield {
    line: 1,
    note:
      'Merge sort splits until the pieces are single elements, which are sorted by definition, then merges sorted pieces back together. All the real work happens on the way up, in merge. The split is just bookkeeping.',
    views: views(0, a.length),
    vars: { input: a.join(', ') },
  }

  function* sort(lo: number, hi: number, depth: number): StepGen {
    if (hi - lo <= 1) {
      yield {
        line: 2,
        note: `Range [${lo}, ${hi}) holds ${hi - lo === 0 ? 'nothing' : `one element, ${a[lo]}`}. A single element is already sorted, so return straight away. This is the base case the whole recursion bottoms out on.`,
        views: views(lo, hi, hi - lo === 1 ? { [lo]: 'match' } : {}),
        vars: { lo, hi, depth },
      }
      return
    }

    const mid = (lo + hi) >> 1
    yield {
      line: 3,
      note: `Split [${lo}, ${hi}) at ${mid}. Left half is [${lo}, ${mid}), right half is [${mid}, ${hi}). Nothing is compared yet.`,
      views: views(lo, hi, { [mid]: 'active' }),
      vars: { lo, mid, hi, depth },
    }

    yield {
      line: 4,
      note: `Sort the left half [${lo}, ${mid}) first. Trust the recursion to return it fully sorted.`,
      views: views(lo, mid),
      vars: { lo, mid, hi, depth, going: 'left' },
    }
    yield* sort(lo, mid, depth + 1)

    yield {
      line: 5,
      note: `Left half is sorted: ${a.slice(lo, mid).join(', ')}. Now do the same to the right half [${mid}, ${hi}).`,
      views: views(mid, hi),
      vars: { lo, mid, hi, depth, going: 'right' },
    }
    yield* sort(mid, hi, depth + 1)

    yield {
      line: [6, 9],
      note: `Both halves are sorted now: ${a.slice(lo, mid).join(', ')} and ${a.slice(mid, hi).join(', ')}. Merge them. Because each half is sorted, the smallest remaining value is always at the front of one of them, so one comparison per output element is enough.`,
      views: views(lo, hi, { ...Object.fromEntries(Array.from({ length: mid - lo }, (_, k) => [lo + k, 'compare' as Role])) }),
      vars: { lo, mid, hi, left: a.slice(lo, mid).join(', '), right: a.slice(mid, hi).join(', ') },
    }

    const buf: number[] = []
    let i = lo
    let j = mid

    while (i < mid && j < hi) {
      const takeLeft = a[i] <= a[j]
      yield {
        line: [14, 15, 16],
        note: `Front of the left half is ${a[i]}, front of the right half is ${a[j]}. ${
          takeLeft
            ? `${a[i]} is smaller or equal, so it goes out first. Using <= rather than < is what keeps merge sort stable: equal elements keep their original order.`
            : `${a[j]} is smaller, so it goes out first.`
        }`,
        views: views(lo, hi, { [i]: takeLeft ? 'active' : 'compare', [j]: takeLeft ? 'compare' : 'active' }, buf),
        vars: { 'left front': a[i], 'right front': a[j], taking: takeLeft ? a[i] : a[j] },
      }
      if (takeLeft) buf.push(a[i++])
      else buf.push(a[j++])
    }

    if (i < mid || j < hi) {
      const rest = i < mid ? a.slice(i, mid) : a.slice(j, hi)
      yield {
        line: [18, 19],
        note: `One half ran out. The other still holds ${rest.join(', ')}, already in order, so it can be copied across without any more comparisons.`,
        views: views(lo, hi, Object.fromEntries(rest.map((_, k) => [(i < mid ? i : j) + k, 'compare' as Role])), buf),
        vars: { remaining: rest.join(', ') },
      }
    }
    while (i < mid) buf.push(a[i++])
    while (j < hi) buf.push(a[j++])

    for (let k = 0; k < buf.length; k++) a[lo + k] = buf[k]

    yield {
      line: 20,
      note: `Copy the buffer back over [${lo}, ${hi}). That range is now sorted: ${buf.join(', ')}. Note that merge needs somewhere to put the output, which is why merge sort uses O(n) extra space where quicksort uses none.`,
      views: views(lo, hi, Object.fromEntries(buf.map((_, k) => [lo + k, 'match' as Role]))),
      vars: { lo, hi, merged: buf.join(', ') },
    }
  }

  yield* sort(0, a.length, 0)

  yield {
    line: 7,
    note: `Sorted: ${a.join(', ')}. Each level of recursion does O(n) work merging, and there are log n levels, which is where O(n log n) comes from. Unlike quicksort there is no bad pivot to worry about, so that bound holds in the worst case too.`,
    views: views(0, a.length, Object.fromEntries(a.map((_, k) => [k, 'match' as Role]))),
    vars: { sorted: a.join(', ') },
    result: a.join(', '),
  }
}

export const mergeSort: Algorithm = {
  id: 'merge-sort',
  name: 'Merge sort',
  rank: 11,
  tier: 2,
  blurb: 'Split to single elements, then merge sorted runs back together.',
  realWorld:
    'Python sorted() and Java Arrays.sort both use Timsort, which is merge sort with existing sorted runs detected first. Sorting a file larger than memory is done by merging sorted chunks off disk.',
  idea:
    'Two sorted lists can be combined in one pass, because the smallest value left is always at the front of one of them. Merge sort takes that fact and works backwards: split the array until every piece is trivially sorted, then merge pairs on the way back up. Each level of the recursion merges n elements in total and there are log n levels, so it is O(n log n) always, not just on average.',
  useWhen:
    'You rarely implement it, but the merge step shows up on its own: merging k sorted lists, counting inversions, external sorting, and any question where you already have sorted runs. Knowing merge cold is worth more than knowing the recursion.',
  pitfall:
    'Using < instead of <= when picking from the left half. That breaks stability, which matters the moment you are sorting objects by one key and expect ties to keep their earlier order.',
  complexity: { time: 'O(n log n) worst case', space: 'O(n)' },
  code,
  inputs: [{ name: 'nums', label: 'nums', kind: 'numbers', value: '5, 2, 8, 1, 9, 3', hint: 'max 10' }],
  run,
}
