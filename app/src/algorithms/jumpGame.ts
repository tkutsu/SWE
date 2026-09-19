import { cells, parseNumbers } from '../engine/frame'
import type { Algorithm, Role, StepGen } from '../engine/types'

const code = `function canJump(nums) {
  let reach = 0
  for (let i = 0; i < nums.length; i++) {
    if (i > reach) return false
    reach = Math.max(reach, i + nums[i])
    if (reach >= nums.length - 1) return true
  }
  return true
}`

function* run(input: Record<string, string | number>): StepGen {
  const nums = parseNumbers(input.nums, 'nums')
  if (nums.length === 0) throw new Error('Give it some jump lengths.')
  if (nums.some((n) => n < 0)) throw new Error('Jump lengths cannot be negative.')

  const last = nums.length - 1
  let reach = 0

  const views = (i: number, extra: Record<number, Role> = {}) => [
    {
      kind: 'array' as const,
      label: 'max jump length from each index',
      cells: cells(
        nums,
        {
          ...Object.fromEntries(nums.map((_, k) => [k, (k <= reach ? 'window' : 'idle') as Role])),
          ...(i >= 0 ? { [i]: 'active' as Role } : {}),
          ...extra,
        },
      ),
      markers: [
        ...(i >= 0 ? [{ name: 'i', index: i }] : []),
        { name: 'reach', index: Math.min(reach, last) },
      ],
    },
  ]

  yield {
    line: 2,
    note:
      'The exhaustive version tries every jump from every position, which explodes. The greedy insight is that you never need to know which route got you somewhere, only how far you can possibly get. One number, the furthest reachable index, is enough state for the whole problem.',
    views: views(-1),
    vars: { reach: 0, target: last },
  }

  for (let i = 0; i < nums.length; i++) {
    if (i > reach) {
      yield {
        line: [3, 4],
        note: `Index ${i} is beyond the furthest reachable index ${reach}. There is a gap that no combination of earlier jumps can cross, so the end is unreachable. Everything from here on is irrelevant.`,
        views: views(i, { [i]: 'excluded' }),
        vars: { i, reach, blocked: true },
        result: 'false, the end is not reachable',
      }
      return
    }

    const candidate = i + nums[i]
    const improved = candidate > reach

    yield {
      line: 5,
      note: `Index ${i} is reachable, and from it you can jump up to ${nums[i]}, landing as far as index ${candidate}. ${
        improved ? `That extends the reach from ${reach} to ${candidate}.` : `The reach is already ${reach}, so this adds nothing.`
      }`,
      views: views(i, improved ? { [Math.min(candidate, last)]: 'compare' } : {}),
      vars: { i, 'jump length': nums[i], 'could reach': candidate, 'current reach': reach },
    }

    if (improved) reach = candidate

    if (reach >= last) {
      yield {
        line: 6,
        note: `Reach is ${reach}, which covers the last index ${last}. The end is reachable, so stop early. Note this never worked out the actual route, and it did not need to.`,
        views: views(i, { [last]: 'match' }),
        vars: { i, reach, target: last },
        result: 'true, the end is reachable',
      }
      return
    }
  }

  yield {
    line: 8,
    note: `Walked the whole array without ever falling behind the reach, so the end is reachable.`,
    views: views(-1, { [last]: 'match' }),
    vars: { reach, target: last },
    result: 'true, the end is reachable',
  }
}

export const jumpGame: Algorithm = {
  id: 'jump-game',
  name: 'Greedy: jump game',
  rank: 28,
  tier: 4,
  blurb: 'Track only the furthest reachable index. Nothing else matters.',
  realWorld:
    'Reachability under a budget: can a vehicle reach the depot given the charge available at each stop. The same greedy shape drives Huffman coding inside gzip and JPEG, and deciding which files a CDN keeps at the edge.',
  idea:
    'The exchange argument is what makes greedy valid here. Suppose some route reaches the end. Then at every index along it, the route never needed to land beyond the furthest index reachable so far, so replacing its choices with "always keep the furthest reach" cannot make things worse. That means the single number is a complete summary of the state, and one left to right pass decides the answer.',
  useWhen:
    'Jump game and its minimum-jumps variant, gas station, task scheduler, partition labels, and merging or removing intervals greedily. The tell is that a locally best choice provably cannot rule out a globally best answer.',
  pitfall:
    'Reaching for DP. It works and it is O(n squared), and interviewers usually want the greedy. The real risk is the opposite though: greedy is wrong far more often than it looks, so be ready to justify why the exchange argument holds rather than asserting that it does.',
  complexity: { time: 'O(n)', space: 'O(1)' },
  code,
  inputs: [{ name: 'nums', label: 'jump lengths', kind: 'numbers', value: '1, 2, 1, 1, 0, 2, 3, 1', hint: 'try 3, 2, 1, 0, 4 for a failure' }],
  run,
}
