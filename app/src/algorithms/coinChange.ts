import { parseInt10, parseNumbers } from '../engine/frame'
import type { Algorithm, Cell, Role, StepGen } from '../engine/types'

const code = `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity)
  dp[0] = 0
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (c > a) continue
      dp[a] = Math.min(dp[a], dp[a - c] + 1)
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount]
}`

const INF = Number.POSITIVE_INFINITY
const cellText = (v: number) => (v === INF ? '-' : String(v))

function* run(input: Record<string, string | number>): StepGen {
  const coins = parseNumbers(input.coins, 'coins').filter((c) => c > 0)
  if (coins.length === 0) throw new Error('Give it at least one positive coin value.')
  const amount = parseInt10(input.amount, 'amount')
  if (amount < 0 || amount > 24) throw new Error('Keep the amount between 0 and 24 so the table stays readable.')

  const dp = new Array<number>(amount + 1).fill(INF)
  dp[0] = 0

  const table = (roles: Record<number, Role> = {}): Cell[] =>
    dp.map((v, i) => ({ value: cellText(v), role: roles[i] ?? (v === INF ? 'idle' : 'window'), sub: String(i) }))

  const views = (roles: Record<number, Role> = {}, coinRole?: number) => [
    { kind: 'array' as const, label: 'dp[a] = fewest coins that make a', cells: table(roles) },
    {
      kind: 'array' as const,
      label: 'coins',
      cells: coins.map((c, i) => ({ value: c, role: (i === coinRole ? 'active' : 'idle') as Role, sub: ' ' })),
    },
  ]

  yield {
    line: [2, 3],
    note:
      'Work bottom up. dp[a] is the fewest coins that add to a, and it is built from answers you already have rather than from a recursive call. dp[0] is 0 because zero coins make zero. Everything else starts at infinity, meaning "no way to make this yet".',
    views: views({ 0: 'match' }),
    vars: { amount, coins: coins.join(', ') },
  }

  for (let a = 1; a <= amount; a++) {
    yield {
      line: 4,
      note: `Now solve for amount ${a}. Every smaller amount is already solved, so the only question is which coin to use last.`,
      views: views({ [a]: 'active' }),
      vars: { a, 'dp[a]': cellText(dp[a]) },
    }

    for (let ci = 0; ci < coins.length; ci++) {
      const c = coins[ci]
      if (c > a) {
        yield {
          line: [5, 6],
          note: `Coin ${c} is bigger than ${a}, so it cannot be the last coin. Skip it.`,
          views: views({ [a]: 'active' }, ci),
          vars: { a, coin: c, 'dp[a]': cellText(dp[a]) },
        }
        continue
      }

      const prev = dp[a - c]
      const candidate = prev === INF ? INF : prev + 1
      const better = candidate < dp[a]

      yield {
        line: 7,
        note:
          prev === INF
            ? `If ${c} were the last coin, the rest would be ${a - c}, but dp[${a - c}] is still unreachable, so this route gives nothing.`
            : `If ${c} is the last coin, the rest is ${a - c}, which needs dp[${a - c}] = ${prev} coins. So this route costs ${candidate}. ${
                better ? `That beats the current ${cellText(dp[a])}, so take it.` : `The current ${cellText(dp[a])} is already as good or better, so keep it.`
              }`,
        views: views({ [a]: 'active', [a - c]: 'compare' }, ci),
        vars: { a, coin: c, 'dp[a - c]': cellText(prev), candidate: cellText(candidate), 'dp[a]': cellText(dp[a]) },
      }

      if (better) dp[a] = candidate
    }

    yield {
      line: 8,
      note:
        dp[a] === INF
          ? `No combination of these coins makes ${a}. dp[${a}] stays unreachable.`
          : `dp[${a}] settles at ${dp[a]}. It will never change again, which is what makes this O(amount * coins) instead of exponential.`,
      views: views({ [a]: dp[a] === INF ? 'excluded' : 'match' }),
      vars: { a, 'dp[a]': cellText(dp[a]) },
    }
  }

  yield {
    line: 10,
    note:
      dp[amount] === INF
        ? `dp[${amount}] is still unreachable, so these coins cannot make ${amount}. Return -1.`
        : `dp[${amount}] = ${dp[amount]}. The table was filled once, each entry read a constant number of earlier entries, and no subproblem was solved twice. That reuse is the whole point of dynamic programming.`,
    views: views({ [amount]: dp[amount] === INF ? 'excluded' : 'match' }),
    vars: { amount, answer: dp[amount] === INF ? -1 : dp[amount] },
    result: dp[amount] === INF ? '-1 (cannot be made)' : `${dp[amount]} coins`,
  }
}

export const coinChange: Algorithm = {
  id: 'coin-change',
  name: 'DP 1D: coin change',
  blurb: 'Fewest coins for an amount, built up from every smaller amount.',
  realWorld:
    'Making change is the literal case, but the shape is everywhere: splitting a payment across several balances, choosing which video bitrates to cache, and the line breaking that LaTeX and browsers do to justify a paragraph.',
  idea:
    'The recursive version asks "what is the cheapest way to make a?" and branches on which coin to use last. That tree repeats the same subproblems over and over. Turn it around: solve every amount from 1 upwards and store the answer, so each subproblem is solved once and read many times. The three stages are recursion, then memoised recursion, then this table, and they are the same algorithm with the work arranged differently.',
  useWhen:
    'Any problem where the answer for n is built from a fixed set of smaller answers, and the same subproblems keep reappearing. Climbing stairs, house robber, word break and longest increasing subsequence are the same shape.',
  pitfall:
    'Adding 1 to an unreachable entry. If dp[a - c] is infinity there is no route through that coin, and guarding it is what stops bogus small answers propagating. The other one is looping the coins outside the amounts when the problem counts combinations, which quietly changes what you are computing.',
  complexity: { time: 'O(amount * coins)', space: 'O(amount)' },
  code,
  inputs: [
    { name: 'coins', label: 'coins', kind: 'numbers', value: '1, 3, 4' },
    { name: 'amount', label: 'amount', kind: 'number', value: 6, hint: 'max 24' },
  ],
  run,
}
