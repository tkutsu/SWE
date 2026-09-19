import { cells, parseInt10, parseNumbers } from '../engine/frame'
import type { Algorithm, Role, StepGen } from '../engine/types'

const code = `function binarySearch(sorted, target) {
  let lo = 0
  let hi = sorted.length - 1
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2)
    if (sorted[mid] === target) return mid
    if (sorted[mid] < target) lo = mid + 1
    else hi = mid - 1
  }
  return -1
}`

function* run(input: Record<string, string | number>): StepGen {
  const raw = parseNumbers(input.nums, 'nums')
  const nums = [...raw].sort((a, b) => a - b)
  const target = parseInt10(input.target, 'target')

  const paint = (lo: number, hi: number, extra: Record<number, Role> = {}) => {
    const roles: Record<number, Role> = {}
    for (let i = 0; i < nums.length; i++) roles[i] = i < lo || i > hi ? 'excluded' : 'window'
    return cells(nums, { ...roles, ...extra })
  }

  let lo = 0
  let hi = nums.length - 1
  let steps = 0

  yield {
    line: [2, 3],
    note: `Searching ${nums.length} sorted values. A linear scan would take up to ${nums.length} looks. Halving the range each time needs about ${Math.ceil(Math.log2(nums.length + 1))}.`,
    views: [{ kind: 'array', label: 'sorted', cells: paint(lo, hi), markers: [{ name: 'lo', index: lo }, { name: 'hi', index: hi }] }],
    vars: { lo, hi, target, 'range size': hi - lo + 1 },
  }

  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2)
    steps++

    yield {
      line: [4, 5],
      note: `The live range is indices ${lo} to ${hi}. Look at the middle, index ${mid}, which holds ${nums[mid]}. Writing mid as lo + (hi - lo) / 2 rather than (lo + hi) / 2 avoids overflow in languages with fixed-width ints.`,
      views: [{ kind: 'array', label: 'sorted', cells: paint(lo, hi, { [mid]: 'active' }), markers: [{ name: 'lo', index: lo }, { name: 'mid', index: mid }, { name: 'hi', index: hi }] }],
      vars: { lo, mid, hi, 'sorted[mid]': nums[mid], target, 'range size': hi - lo + 1 },
    }

    if (nums[mid] === target) {
      yield {
        line: 6,
        note: `${nums[mid]} is the target. Found at index ${mid} after ${steps} look${steps === 1 ? '' : 's'}.`,
        views: [{ kind: 'array', label: 'sorted', cells: paint(lo, hi, { [mid]: 'match' }), markers: [{ name: 'mid', index: mid }] }],
        vars: { mid, target, looks: steps },
        result: `index ${mid}, found in ${steps} look${steps === 1 ? '' : 's'}`,
      }
      return
    }

    if (nums[mid] < target) {
      const discarded = mid - lo + 1
      yield {
        line: 7,
        note: `${nums[mid]} is below ${target}. Because the array is sorted, everything from index ${lo} to ${mid} is also below the target. That is ${discarded} value${discarded === 1 ? '' : 's'} eliminated in one comparison.`,
        views: [{ kind: 'array', label: 'sorted', cells: paint(lo, hi, Object.fromEntries(Array.from({ length: discarded }, (_, k) => [lo + k, 'excluded' as Role]))), markers: [{ name: 'mid', index: mid }] }],
        vars: { lo, mid, hi, discarded, target },
      }
      lo = mid + 1
    } else {
      const discarded = hi - mid + 1
      yield {
        line: 8,
        note: `${nums[mid]} is above ${target}, so index ${mid} and everything to its right is too large. ${discarded} value${discarded === 1 ? '' : 's'} eliminated.`,
        views: [{ kind: 'array', label: 'sorted', cells: paint(lo, hi, Object.fromEntries(Array.from({ length: discarded }, (_, k) => [mid + k, 'excluded' as Role]))), markers: [{ name: 'mid', index: mid }] }],
        vars: { lo, mid, hi, discarded, target },
      }
      hi = mid - 1
    }
  }

  yield {
    line: 10,
    note: `lo passed hi, so the live range is empty. ${target} is not in the array. Note where lo ended up: ${lo} is exactly where the target would be inserted to keep the array sorted, which is what lowerBound returns.`,
    views: [{ kind: 'array', label: 'sorted', cells: cells(nums, Object.fromEntries(nums.map((_, i) => [i, 'excluded' as Role]))) }],
    vars: { lo, hi, target, looks: steps },
    result: `-1 (not found; insertion point would be index ${lo})`,
  }
}

export const binarySearch: Algorithm = {
  id: 'binary-search',
  name: 'Binary Search',
  rank: 4,
  tier: 1,
  blurb: 'Halve the live range every comparison.',
  realWorld:
    'git bisect is binary search over commits, which is why finding the commit that broke a build takes about ten steps across a thousand commits instead of a thousand. Database indexes and autoscaling capacity searches halve the same way.',
  idea:
    'Keep a range that is guaranteed to contain the answer if it exists anywhere. Probe the middle, and use the sorted order to prove one half cannot contain the target. Discard it. The range shrinks geometrically, so a million elements take twenty looks. The same shape works on an answer space that is not an array at all: if you can write a yes-or-no predicate that flips exactly once as the candidate grows, you can binary search it.',
  useWhen:
    'Sorted data, or any monotonic predicate over a numeric answer. Minimum capacity, minimum speed, kth smallest, and "smallest x such that f(x) is true" are all this pattern wearing a costume.',
  pitfall:
    'The loop boundary. `lo <= hi` with `hi = mid - 1` terminates, `lo < hi` with `hi = mid` needs a different mid rounding or it spins forever. Pick one template, prove it terminates once, and use it every time.',
  complexity: { time: 'O(log n)', space: 'O(1)' },
  code,
  inputs: [
    { name: 'nums', label: 'nums', kind: 'numbers', value: '1, 3, 5, 7, 9, 11, 13, 15, 17', hint: 'gets sorted automatically' },
    { name: 'target', label: 'target', kind: 'number', value: 17 },
  ],
  run,
}
