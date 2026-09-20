import { cells, parseInt10, parseNumbers } from '../engine/frame'
import type { Algorithm, MapEntry, Role, StepGen } from '../engine/types'

const code = `function twoSum(nums, target) {
  const seen = new Map()
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i]
    if (seen.has(need)) {
      return [seen.get(need), i]
    }
    seen.set(nums[i], i)
  }
  return []
}`

function* run(input: Record<string, string | number>): StepGen {
  const nums = parseNumbers(input.nums, 'nums')
  const target = parseInt10(input.target, 'target')

  const seen = new Map<number, number>()
  const entries = (): MapEntry[] =>
    [...seen.entries()].map(([key, value]) => ({ key, value: `index ${value}` }))

  yield {
    line: 2,
    note: `The brute force is to try every pair, which is O(n squared). The trick is to ask a different question: for each number, has its partner already gone past? A Map answers that in O(1), so one pass is enough.`,
    views: [
      { kind: 'array', label: 'nums', cells: cells(nums) },
      { kind: 'map', label: 'seen (value -> index)', entries: [], empty: 'empty' },
    ],
    vars: { target },
  }

  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i]

    yield {
      line: [3, 4],
      note: `At index ${i} the value is ${nums[i]}. To reach ${target} we would need ${need} to be sitting somewhere to the left.`,
      views: [
        { kind: 'array', label: 'nums', cells: cells(nums, { [i]: 'active' }) },
        { kind: 'map', label: 'seen (value -> index)', entries: entries(), empty: 'empty' },
      ],
      vars: { i, 'nums[i]': nums[i], need, target },
    }

    if (seen.has(need)) {
      const j = seen.get(need)!
      yield {
        line: [5, 6],
        note: `${need} is in the map, stored back at index ${j}. That pair sums to ${target}, so the answer is [${j}, ${i}]. One pass, no nested loop.`,
        views: [
          { kind: 'array', label: 'nums', cells: cells(nums, { [i]: 'match', [j]: 'match' }) },
          {
            kind: 'map',
            label: 'seen (value -> index)',
            entries: entries().map((e) => (e.key === need ? { ...e, role: 'match' as Role } : e)),
          },
        ],
        vars: { i, j, need, target },
        result: `[${j}, ${i}]  ->  ${nums[j]} + ${nums[i]} = ${target}`,
      }
      return
    }

    yield {
      line: [5, 8],
      note: `${need} is not in the map yet. Record that ${nums[i]} lives at index ${i}, so a later number can find it. Storing after the lookup is what stops an element pairing with itself.`,
      views: [
        { kind: 'array', label: 'nums', cells: cells(nums, { [i]: 'compare' }) },
        {
          kind: 'map',
          label: 'seen (value -> index)',
          entries: [...entries(), { key: nums[i], value: `index ${i}`, role: 'active' }],
        },
      ],
      vars: { i, 'nums[i]': nums[i], need, target },
    }

    seen.set(nums[i], i)
  }

  yield {
    line: 10,
    note: `The loop ran out of elements without a hit, so no pair adds up to ${target}.`,
    views: [
      { kind: 'array', label: 'nums', cells: cells(nums) },
      { kind: 'map', label: 'seen (value -> index)', entries: entries() },
    ],
    vars: { target },
    result: 'no pair found',
  }
}

export const twoSum: Algorithm = {
  id: 'two-sum',
  name: 'Two Sum (hash map)',
  blurb: 'Find two indices whose values add to a target, in one pass.',
  realWorld:
    'Every language runtime is built on one. Python resolves an object attribute through a dict, caching layers everywhere are a HashMap with a timeout, and deduplicating a stream of events is the same single-pass lookup you are watching here.',
  idea:
    'A hash map turns "have I seen this before?" from a scan into a single lookup. Walk the array once, and at each element ask whether the number that would complete the pair is already stored. If it is, you are done. If not, store the current number and move on. The map is doing the work the inner loop used to do.',
  useWhen:
    'Any time a brute force has a nested loop whose inner job is really a search for a value. Counting, deduping, grouping and "have I seen this" all collapse the same way.',
  pitfall:
    'Storing the current number before you do the lookup. Then an element can match itself and you return [i, i]. Look first, store second.',
  complexity: { time: 'O(n)', space: 'O(n)' },
  code,
  inputs: [
    { name: 'nums', label: 'nums', kind: 'numbers', value: '2, 7, 11, 15, 3, 6', hint: 'comma or space separated' },
    { name: 'target', label: 'target', kind: 'number', value: 17 },
  ],
  run,
}
