import { cells, parseNumbers } from '../engine/frame'
import type { Algorithm, Role, StepGen } from '../engine/types'

const code = `function maxSubarray(nums) {
  let best = nums[0]
  let here = nums[0]
  for (let i = 1; i < nums.length; i++) {
    here = Math.max(nums[i], here + nums[i])
    best = Math.max(best, here)
  }
  return best
}`

function* run(input: Record<string, string | number>): StepGen {
  const nums = parseNumbers(input.nums, 'nums')
  if (nums.length < 2) throw new Error('Give it at least two numbers.')

  let here = nums[0]
  let best = nums[0]
  let start = 0
  let bs = 0
  let be = 0

  const view = (i: number, from: number, to: number, bestFrom: number, bestTo: number) => {
    const roles: Record<number, Role> = {}
    for (let k = bestFrom; k <= bestTo; k++) roles[k] = 'match'
    for (let k = from; k <= to; k++) roles[k] = k === i ? 'active' : 'window'
    if (roles[i] === undefined) roles[i] = 'active'
    return { kind: 'array' as const, label: 'green is the best so far, blue is the run being extended', cells: cells(nums, roles) }
  }

  yield {
    line: [2, 3],
    note: `Find the contiguous run with the largest sum. Checking every run is O(n squared). Kadane's does it in one pass by carrying exactly two numbers, and the whole insight is what the first one means.`,
    views: [view(0, 0, 0, 0, 0)],
    vars: { here, best },
  }

  for (let i = 1; i < nums.length; i++) {
    const extended = here + nums[i]
    const restart = extended < nums[i]

    yield {
      line: 5,
      note: restart
        ? `The run ending at the previous element summed to ${here}, and ${here} is a burden rather than a head start: ${nums[i]} alone beats ${here} plus ${nums[i]}. So drop everything before here and start a fresh run at index ${i}. That is the entire algorithm.`
        : `The best run ending at the previous element summed to ${here}, which is worth keeping, so extend it. The run ending at index ${i} is worth ${extended}.`,
      views: [view(i, restart ? i : start, i, bs, be)],
      vars: { i, 'nums[i]': nums[i], 'extend to': extended, 'start fresh at': nums[i], restart },
    }

    if (restart) {
      here = nums[i]
      start = i
    } else {
      here = extended
    }

    if (here > best) {
      best = here
      bs = start
      be = i
      yield {
        line: 6,
        note: `${here} beats the best seen so far, so record it. The run from index ${bs} to ${be} is the answer unless something later beats it.`,
        views: [view(i, start, i, bs, be)],
        vars: { i, here, best, 'best run': `${bs} to ${be}` },
      }
    }
  }

  yield {
    line: 8,
    note: `One pass, two variables, no extra memory. The best run is indices ${bs} to ${be}, summing to ${best}. Note that "here" never looked further back than one step: the decision to restart threw away all the history it would have needed.`,
    views: [view(nums.length - 1, bs, be, bs, be)],
    vars: { best, 'from index': bs, 'to index': be },
    result: `${best}, from index ${bs} to ${be}`,
  }
}

export const kadane: Algorithm = {
  id: 'kadane',
  name: "Kadane's Algorithm",
  blurb: 'One pass, two variables, and one decision: extend or restart.',
  realWorld:
    'The best window to have held a stock is this exact computation on daily changes, and anomaly detection over a metric stream uses it to find the worst sustained stretch. Image processing uses the 2D version to find the brightest rectangular region.',
  idea:
    'Walk left to right carrying the best sum of a run that ends exactly here. At each element there are only two candidates: extend the previous run, or start again from this element alone. Starting again wins precisely when the previous run summed to something negative, because then it is a burden rather than a head start. Keep the largest value that quantity has ever taken.',
  useWhen:
    'Maximum or minimum contiguous sum, and the variants around it: circular arrays, maximum product, the best day to buy and sell. If the answer is a contiguous run and you can state what "best run ending here" means, this shape applies.',
  pitfall:
    'Initialising best to 0. On an all-negative array the answer is the least negative element, and starting at 0 returns 0, which is a run of nothing. Start both variables at the first element. The other trap is being asked for the indices rather than the sum, which needs a start pointer you only move on a restart.',
  complexity: { time: 'O(n)', space: 'O(1)' },
  code,
  inputs: [{ name: 'nums', label: 'nums', kind: 'numbers', value: '-2, 1, -3, 4, -1, 2, 1, -5, 4' }],
  run,
}
