import { cells, parseInt10, parseNumbers } from '../engine/frame'
import type { Algorithm, Role, StepGen } from '../engine/types'

const code = `function pairSum(sorted, target) {
  let lo = 0
  let hi = sorted.length - 1
  while (lo < hi) {
    const sum = sorted[lo] + sorted[hi]
    if (sum === target) return [lo, hi]
    if (sum < target) lo++
    else hi--
  }
  return []
}`

function* run(input: Record<string, string | number>): StepGen {
  const raw = parseNumbers(input.nums, 'nums')
  const nums = [...raw].sort((a, b) => a - b)
  const target = parseInt10(input.target, 'target')

  const paint = (lo: number, hi: number, extra: Record<number, Role> = {}) => {
    const roles: Record<number, Role> = {}
    for (let i = 0; i < nums.length; i++) {
      if (i < lo || i > hi) roles[i] = 'excluded'
      else roles[i] = 'window'
    }
    roles[lo] = 'compare'
    roles[hi] = 'compare'
    return cells(nums, { ...roles, ...extra })
  }

  let lo = 0
  let hi = nums.length - 1

  const sortedNote =
    JSON.stringify(raw) === JSON.stringify(nums)
      ? 'The array is already sorted, which is the precondition this technique needs.'
      : `Sorted first: ${raw.join(', ')} becomes ${nums.join(', ')}. Two pointers only works on sorted data, because moving a pointer has to change the sum in a predictable direction.`

  yield {
    line: [2, 3],
    note: `${sortedNote} Put one pointer at each end. The pair they point at is the smallest-possible-large and largest-possible-small combination, so every move shrinks the search in a direction you can reason about.`,
    views: [{ kind: 'array', label: 'sorted', cells: paint(lo, hi), markers: [{ name: 'lo', index: lo }, { name: 'hi', index: hi }] }],
    vars: { lo, hi, target },
  }

  while (lo < hi) {
    const sum = nums[lo] + nums[hi]

    yield {
      line: [4, 5],
      note: `${nums[lo]} + ${nums[hi]} = ${sum}, and we want ${target}.`,
      views: [{ kind: 'array', label: 'sorted', cells: paint(lo, hi), markers: [{ name: 'lo', index: lo }, { name: 'hi', index: hi }] }],
      vars: { lo, hi, sum, target },
    }

    if (sum === target) {
      yield {
        line: 6,
        note: `Exact hit. The pair at indices ${lo} and ${hi} sums to ${target}.`,
        views: [{ kind: 'array', label: 'sorted', cells: paint(lo, hi, { [lo]: 'match', [hi]: 'match' }), markers: [{ name: 'lo', index: lo }, { name: 'hi', index: hi }] }],
        vars: { lo, hi, sum, target },
        result: `${nums[lo]} + ${nums[hi]} = ${target} at indices [${lo}, ${hi}]`,
      }
      return
    }

    if (sum < target) {
      yield {
        line: 7,
        note: `${sum} is short of ${target}. Everything to the left of lo is even smaller, so no pair using ${nums[lo]} can ever reach the target. Move lo right and discard it.`,
        views: [{ kind: 'array', label: 'sorted', cells: paint(lo, hi, { [lo]: 'excluded' }), markers: [{ name: 'lo', index: lo }, { name: 'hi', index: hi }] }],
        vars: { lo, hi, sum, target },
      }
      lo++
    } else {
      yield {
        line: 8,
        note: `${sum} overshoots ${target}. Anything right of hi is even bigger, so ${nums[hi]} is too large for any partner. Move hi left and discard it.`,
        views: [{ kind: 'array', label: 'sorted', cells: paint(lo, hi, { [hi]: 'excluded' }), markers: [{ name: 'lo', index: lo }, { name: 'hi', index: hi }] }],
        vars: { lo, hi, sum, target },
      }
      hi--
    }
  }

  yield {
    line: 10,
    note: 'The pointers met. Every candidate pair has been ruled out, so nothing sums to the target.',
    views: [{ kind: 'array', label: 'sorted', cells: cells(nums, Object.fromEntries(nums.map((_, i) => [i, 'excluded' as Role]))) }],
    vars: { target },
    result: 'no pair found',
  }
}

export const twoPointers: Algorithm = {
  id: 'two-pointers',
  name: 'Two Pointers (pair sum)',
  rank: 2,
  tier: 1,
  blurb: 'Close in from both ends of a sorted array, discarding a candidate every step.',
  idea:
    'On sorted data, the sum at the two ends tells you which end is wrong. Too small means the left value is too small for any partner, because every remaining partner is smaller than the one you just tried. Too big means the right value is too large. Either way you eliminate an entire element per step, so n steps cover all n squared pairs.',
  useWhen:
    'Sorted input, or input you are allowed to sort, plus a condition that is monotonic as the pointers move. Also in-place partitioning, palindrome checks, and merging.',
  pitfall:
    'Using it on unsorted data. The elimination argument is the whole technique and it depends entirely on the ordering. If sorting is not allowed, reach for a hash map instead.',
  complexity: { time: 'O(n log n) with the sort, O(n) if already sorted', space: 'O(1)' },
  code,
  inputs: [
    { name: 'nums', label: 'nums', kind: 'numbers', value: '1, 3, 4, 6, 8, 11, 13', hint: 'gets sorted automatically' },
    { name: 'target', label: 'target', kind: 'number', value: 17 },
  ],
  run,
}
