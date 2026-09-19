import { cells, parseNumbers } from '../engine/frame'
import type { Algorithm, Role, StepGen } from '../engine/types'

const code = `function count(a, lo, hi) {
  if (hi - lo <= 1) return 0
  const mid = (lo + hi) >> 1
  let total = count(a, lo, mid) + count(a, mid, hi)
  const buf = []
  let i = lo
  let j = mid
  while (i < mid && j < hi) {
    if (a[i] <= a[j]) {
      buf.push(a[i++])
    } else {
      total += mid - i
      buf.push(a[j++])
    }
  }
  while (i < mid) buf.push(a[i++])
  while (j < hi) buf.push(a[j++])
  copyBack(a, lo, buf)
  return total
}`

function* run(input: Record<string, string | number>): StepGen {
  const a = parseNumbers(input.nums, 'nums')
  if (a.length < 2) throw new Error('Give it at least two numbers.')
  if (a.length > 8) throw new Error('Keep it to 8 values so the recursion stays followable.')

  const original = [...a]
  let total = 0

  const paint = (lo: number, hi: number, extra: Record<number, Role> = {}) => {
    const roles: Record<number, Role> = {}
    for (let k = 0; k < a.length; k++) roles[k] = k >= lo && k < hi ? 'window' : 'excluded'
    return cells(a, { ...roles, ...extra })
  }

  const views = (lo: number, hi: number, extra: Record<number, Role> = {}, buf?: number[]) => {
    const out = [{ kind: 'array' as const, label: 'array (being sorted as a side effect)', cells: paint(lo, hi, extra) }]
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
      'An inversion is a pair where a bigger value sits before a smaller one. Counting them by checking every pair is O(n squared). Merge sort already compares elements across a divide, so it can count them for free: the counting rides along on the sorting.',
    views: views(0, a.length),
    vars: { input: original.join(', ') },
  }

  function* solve(lo: number, hi: number): StepGen {
    if (hi - lo <= 1) return

    const mid = (lo + hi) >> 1
    yield {
      line: [3, 4],
      note: `Split [${lo}, ${hi}). Inversions come in three kinds: entirely in the left half, entirely in the right half, and straddling the two. Recursion handles the first two, so this level only has to count the ones that straddle.`,
      views: views(lo, hi, { [mid]: 'active' }),
      vars: { lo, mid, hi, total },
    }

    yield* solve(lo, mid)
    yield* solve(mid, hi)

    yield {
      line: [5, 6, 7],
      note: `Both halves are sorted now: ${a.slice(lo, mid).join(', ')} and ${a.slice(mid, hi).join(', ')}. Sorting them does not lose any straddling inversions, because every left element still sits before every right element in the original array.`,
      views: views(lo, hi, Object.fromEntries(Array.from({ length: mid - lo }, (_, k) => [lo + k, 'compare' as Role]))),
      vars: { left: a.slice(lo, mid).join(', '), right: a.slice(mid, hi).join(', '), total },
    }

    const buf: number[] = []
    let i = lo
    let j = mid

    while (i < mid && j < hi) {
      if (a[i] <= a[j]) {
        yield {
          line: [9, 10],
          note: `${a[i]} on the left is not greater than ${a[j]} on the right, so this pair is in order. Take ${a[i]} and count nothing.`,
          views: views(lo, hi, { [i]: 'active', [j]: 'compare' }, buf),
          vars: { left: a[i], right: a[j], inversions: 0, total },
        }
        buf.push(a[i++])
      } else {
        const added = mid - i
        total += added
        yield {
          line: [12, 13],
          note: `${a[j]} on the right is smaller than ${a[i]} on the left. Because the left half is sorted, every one of the ${added} element${added === 1 ? '' : 's'} from index ${i} to ${mid - 1} is also bigger than ${a[j]}, and every one sits before it in the original array. So this single comparison counts ${added} inversion${added === 1 ? '' : 's'} at once. That is the whole trick.`,
          views: views(lo, hi, { [j]: 'active', ...Object.fromEntries(Array.from({ length: added }, (_, k) => [i + k, 'compare' as Role])) }, buf),
          vars: { left: a[i], right: a[j], 'counted now': added, total },
        }
        buf.push(a[j++])
      }
    }

    while (i < mid) buf.push(a[i++])
    while (j < hi) buf.push(a[j++])
    for (let k = 0; k < buf.length; k++) a[lo + k] = buf[k]

    yield {
      line: [17, 18, 19],
      note: `Range [${lo}, ${hi}) merged to ${buf.join(', ')}. Running total is ${total}.`,
      views: views(lo, hi, Object.fromEntries(buf.map((_, k) => [lo + k, 'match' as Role]))),
      vars: { merged: buf.join(', '), total },
    }
  }

  yield* solve(0, a.length)

  yield {
    line: 20,
    note: `${total} inversion${total === 1 ? '' : 's'} in ${original.join(', ')}. The array came out sorted too, which was never the goal, just the vehicle. Same O(n log n) as merge sort, because counting added no extra passes.`,
    views: views(0, a.length, Object.fromEntries(a.map((_, k) => [k, 'match' as Role]))),
    vars: { input: original.join(', '), inversions: total },
    result: `${total} inversion${total === 1 ? '' : 's'}`,
  }
}

export const countInversions: Algorithm = {
  id: 'count-inversions',
  name: 'Divide and conquer: count inversions',
  rank: 27,
  tier: 4,
  blurb: 'Merge sort that counts the pairs it had to reorder.',
  realWorld:
    'Kendall tau, the standard measure of how far two rankings disagree, is inversion counting with a scale factor. Search and recommender teams use it to decide whether a new ranking model actually beats the one already in production.',
  idea:
    'Split the pairs by where they live. Both elements on the left, both on the right, or one on each side. Recursion covers the first two, so each level only has to count the straddling pairs, and the merge step is already comparing exactly those. When a right element is taken before a left one, everything remaining on the sorted left half is also greater than it, so one comparison counts a whole block of inversions at once.',
  useWhen:
    'Counting inversions directly, "how far from sorted is this", reverse pairs, count of smaller elements after self, and closest pair of points. The transferable idea is to classify what you are counting by which side of the divide it falls on.',
  pitfall:
    'Adding one instead of mid minus i. The block counting is the only reason this beats the brute force, and getting it wrong gives an answer that is close enough to look plausible on small inputs.',
  complexity: { time: 'O(n log n)', space: 'O(n)' },
  code,
  inputs: [{ name: 'nums', label: 'nums', kind: 'numbers', value: '5, 4, 3, 2, 1', hint: 'max 8. Reversed input gives the most inversions.' }],
  run,
}
