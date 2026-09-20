import { parseInt10, parseNumbers } from '../engine/frame'
import type { Algorithm, Cell, Role, StepGen } from '../engine/types'

const code = `function knapsack(weights, values, cap) {
  const n = weights.length
  const dp = grid(n + 1, cap + 1, 0)
  for (let i = 1; i <= n; i++) {
    for (let c = 0; c <= cap; c++) {
      dp[i][c] = dp[i - 1][c]
      const w = weights[i - 1]
      if (w <= c) {
        const take = values[i - 1] + dp[i - 1][c - w]
        if (take > dp[i][c]) dp[i][c] = take
      }
    }
  }
  return dp[n][cap]
}`

function* run(input: Record<string, string | number>): StepGen {
  const weights = parseNumbers(input.weights, 'weights')
  const values = parseNumbers(input.values, 'values')
  if (weights.length !== values.length) throw new Error('Give one value per weight.')
  if (weights.some((w) => w <= 0)) throw new Error('Every weight has to be positive.')
  const cap = parseInt10(input.cap, 'capacity')
  if (!Number.isInteger(cap) || cap < 1 || cap > 14) throw new Error('Capacity must be a whole number between 1 and 14.')
  if (weights.length > 6) throw new Error('Keep it to 6 items so the table fits.')

  const n = weights.length
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(cap + 1).fill(0))

  const view = (marks: Record<string, Role> = {}, label = 'best value, by item and capacity') => ({
    kind: 'grid' as const,
    label,
    corner: 'item \\ cap',
    rowLabels: ['none', ...weights.map((w, i) => `w${w} v${values[i]}`)],
    colLabels: Array.from({ length: cap + 1 }, (_, c) => c),
    cells: dp.map<Cell[]>((row, i) => row.map<Cell>((v, c) => ({ value: v, role: marks[`${i},${c}`] ?? 'idle' }))),
  })

  yield {
    line: [2, 3],
    note: `${n} items and a bag that holds ${cap}. Each item is all or nothing, which is what the 0-1 means, and that is exactly why greed fails: the best value per kilo can still be the wrong thing to take.`,
    views: [view()],
    vars: { items: n, capacity: cap },
  }

  yield {
    line: 3,
    note: `The table answers a smaller question in every cell: using only the first i items, with only c capacity, what is the best value? Row 0 is all zeros because no items means no value, and that row is what everything else is eventually built from.`,
    views: [view(Object.fromEntries(Array.from({ length: cap + 1 }, (_, c) => [`0,${c}`, 'window' as Role])))],
    vars: { items: n, capacity: cap },
  }

  for (let i = 1; i <= n; i++) {
    const w = weights[i - 1]
    const v = values[i - 1]

    for (let c = 0; c <= cap; c++) {
      const skip = dp[i - 1][c]
      const fits = w <= c
      const take = fits ? v + dp[i - 1][c - w] : -1
      dp[i][c] = fits && take > skip ? take : skip

      const marks: Record<string, Role> = { [`${i},${c}`]: 'active', [`${i - 1},${c}`]: 'compare' }
      if (fits) marks[`${i - 1},${c - w}`] = 'window'

      yield {
        line: fits ? [6, 11] : 6,
        note: fits
          ? `Item ${i} weighs ${w} and is worth ${v}, and ${c} capacity is enough to carry it. Two choices only. Skip it and keep ${skip}, the answer one row up at the same capacity. Or take it: ${v} plus whatever was best with ${c - w} left over, which is ${dp[i - 1][c - w]}, so ${take}. Keep ${dp[i][c]}.`
          : `Item ${i} weighs ${w} and only ${c} capacity is left, so there is no choice to make. Copy the answer from the row above.`,
        views: [view(marks)],
        vars: fits
          ? { item: i, capacity: c, skip, take, best: dp[i][c] }
          : { item: i, capacity: c, 'too heavy': `${w} > ${c}`, best: dp[i][c] },
      }
    }
  }

  const chosen: number[] = []
  let c = cap
  for (let i = n; i >= 1; i--) {
    if (dp[i][c] !== dp[i - 1][c]) {
      chosen.push(i)
      c -= weights[i - 1]
    }
  }
  chosen.reverse()

  yield {
    line: 15,
    note: `The bottom right cell is the answer: ${dp[n][cap]}, using every item and the whole bag. Walking back up tells you which items were taken, because a cell that differs from the one above it is a cell where taking won. Items taken: ${chosen.length ? chosen.join(', ') : 'none'}.`,
    views: [view({ [`${n},${cap}`]: 'match' })],
    vars: { 'best value': dp[n][cap], 'items taken': chosen.join(', ') || 'none' },
    result: `best value ${dp[n][cap]}${chosen.length ? ` from item${chosen.length === 1 ? '' : 's'} ${chosen.join(', ')}` : ''}`,
  }
}

export const knapsack: Algorithm = {
  id: 'knapsack-01',
  name: '0-1 Knapsack',
  rank: 206,
  tier: 2,
  blurb: 'Take it or leave it, and the table remembers every partial bag.',
  realWorld:
    'Cloud bin packing puts this in front of a scheduler every time it places pods on nodes, and portfolio selection under a budget is the same shape. Cutting stock, where a mill decides how to slice a steel coil with least waste, has been solved this way since the 1960s.',
  idea:
    'Every item is a yes or a no, so the answer for the first i items at capacity c is the better of two things: the answer without this item, or this item plus the best answer for the capacity it leaves behind. Both of those already sit in the row above, which is why the table can be filled in one sweep with no recursion.',
  useWhen:
    'A budget, a capacity or a target, and a set of things each usable once. Subset sum, partition into equal halves and target sum are all this with the values stripped out. If items can be reused instead, the row you read from is the current one rather than the one above, and it becomes coin change.',
  pitfall:
    'Reaching for greedy. Sorting by value per unit weight is correct for fractional knapsack, where you can take half an item, and it is wrong here. Having a two-item counterexample ready is worth more than the algorithm. The other trap is the index shift: row i is item i - 1, because row 0 has to mean no items at all.',
  complexity: { time: 'O(n * capacity)', space: 'O(n * capacity)' },
  code,
  inputs: [
    { name: 'weights', label: 'weights', kind: 'numbers', value: '1, 3, 4, 5' },
    { name: 'values', label: 'values', kind: 'numbers', value: '1, 4, 5, 7' },
    { name: 'cap', label: 'capacity', kind: 'number', value: 7 },
  ],
  run,
}
