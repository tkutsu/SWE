import { cells, parseInt10, parseNumbers } from '../engine/frame'
import type { Algorithm, Role, StepGen } from '../engine/types'

const code = `function minCapacity(weights, days) {
  let lo = Math.max(...weights)
  let hi = weights.reduce((a, b) => a + b, 0)
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2)
    if (daysNeeded(weights, mid) <= days) hi = mid
    else lo = mid + 1
  }
  return lo
}

function daysNeeded(weights, cap) {
  let days = 1
  let load = 0
  for (const w of weights) {
    if (load + w > cap) { days++; load = 0 }
    load += w
  }
  return days
}`

/** Greedily pack in order. Returns the day each package sails on. */
function pack(weights: number[], cap: number): { days: number; dayOf: number[] } {
  const dayOf: number[] = []
  let days = 1
  let load = 0
  for (const w of weights) {
    if (load + w > cap) {
      days++
      load = 0
    }
    load += w
    dayOf.push(days)
  }
  return { days, dayOf }
}

function* run(input: Record<string, string | number>): StepGen {
  const weights = parseNumbers(input.weights, 'weights')
  if (weights.some((w) => w <= 0)) throw new Error('Every weight has to be positive.')
  const limit = parseInt10(input.days, 'days')
  if (!Number.isInteger(limit) || limit < 1 || limit > weights.length) {
    throw new Error(`days must be a whole number between 1 and ${weights.length}, the number of packages.`)
  }

  const low0 = Math.max(...weights)
  const high0 = weights.reduce((a, b) => a + b, 0)
  if (high0 - low0 > 40) throw new Error('That answer space is too wide to draw. Use smaller weights.')

  /** Every candidate capacity, drawn as the thing being searched. */
  const space = Array.from({ length: high0 - low0 + 1 }, (_, i) => low0 + i)
  const at = (cap: number) => cap - low0

  const spaceView = (lo: number, hi: number, extra: Record<number, Role> = {}) => {
    const roles: Record<number, Role> = {}
    for (let i = 0; i < space.length; i++) roles[i] = i < at(lo) || i > at(hi) ? 'excluded' : 'window'
    return { kind: 'array' as const, label: 'candidate capacities', cells: cells(space, { ...roles, ...extra }) }
  }

  const packView = (cap: number) => {
    const { dayOf } = pack(weights, cap)
    const roles: Record<number, Role> = {}
    const subs: Record<number, string> = {}
    weights.forEach((_, i) => {
      roles[i] = dayOf[i] % 2 === 1 ? 'window' : 'compare'
      subs[i] = `day ${dayOf[i]}`
    })
    return { kind: 'array' as const, label: `packing at capacity ${cap}`, cells: cells(weights, roles, subs) }
  }

  let lo = low0
  let hi = high0
  let probes = 0

  yield {
    line: [2, 3],
    note: `There is no array to search here. The thing being searched is every capacity the ship could have, from ${low0} (it must at least carry the heaviest single package) up to ${high0} (carry everything in one day). That range is the array.`,
    views: [spaceView(lo, hi), { kind: 'array', label: 'packages, in order', cells: cells(weights) }],
    vars: { lo, hi, 'candidates left': hi - lo + 1, 'days allowed': limit },
  }

  yield {
    line: [12, 19],
    note: `What makes this searchable is that the answer flips exactly once. A capacity that works means every larger capacity also works, and one that fails means every smaller one fails too. So the candidates are sorted by true or false even though nobody sorted them.`,
    views: [spaceView(lo, hi)],
    vars: { lo, hi, 'days allowed': limit },
  }

  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2)
    probes++
    const { days } = pack(weights, mid)
    const ok = days <= limit

    yield {
      line: 5,
      note: `Probe the middle of what is left: capacity ${mid}. The only question is whether the packages fit in ${limit} day${limit === 1 ? '' : 's'} at that capacity.`,
      views: [spaceView(lo, hi, { [at(mid)]: 'active' }), packView(mid)],
      vars: { lo, mid, hi, probes },
    }

    yield {
      line: [15, 19],
      note: `Pack greedily in order, starting a new day whenever the next package would overflow. Capacity ${mid} needs ${days} day${days === 1 ? '' : 's'}, and ${limit} ${limit === 1 ? 'is' : 'are'} allowed, so ${mid} ${ok ? 'works' : 'is too small'}.`,
      views: [spaceView(lo, hi, { [at(mid)]: ok ? 'match' : 'excluded' }), packView(mid)],
      vars: { capacity: mid, 'days needed': days, 'days allowed': limit, feasible: ok },
    }

    if (ok) {
      const dropped = hi - mid
      yield {
        line: 6,
        note: `${mid} works, so every capacity above it works too and none of them can be the smallest. Throw away ${dropped} candidate${dropped === 1 ? '' : 's'}. Keep ${mid} itself, because it is still the best answer seen.`,
        views: [spaceView(lo, mid, { [at(mid)]: 'match' })],
        vars: { lo, hi: mid, discarded: dropped, probes },
      }
      hi = mid
    } else {
      const dropped = mid - lo + 1
      yield {
        line: 7,
        note: `${mid} is too small, so everything below it is too small as well. Throw away ${dropped} candidate${dropped === 1 ? '' : 's'}, including ${mid}.`,
        views: [spaceView(mid + 1, hi)],
        vars: { lo: mid + 1, hi, discarded: dropped, probes },
      }
      lo = mid + 1
    }
  }

  const { days } = pack(weights, lo)
  yield {
    line: 9,
    note: `lo and hi have met, so one candidate is left and it has to be the answer. Capacity ${lo} carries everything in ${days} day${days === 1 ? '' : 's'}, and ${lo - 1} would not. Found in ${probes} probe${probes === 1 ? '' : 's'} rather than ${space.length} checks.`,
    views: [spaceView(lo, lo, { [at(lo)]: 'match' }), packView(lo)],
    vars: { answer: lo, probes, 'candidates checked one by one would be': space.length },
    result: `minimum capacity ${lo}, found in ${probes} probe${probes === 1 ? '' : 's'}`,
  }
}

export const binarySearchAnswer: Algorithm = {
  id: 'binary-search-answer',
  name: 'Binary Search on the Answer',
  rank: 201,
  tier: 2,
  blurb: 'Search a range of possible answers instead of an array.',
  realWorld:
    'Autoscalers do this to find the smallest instance count that keeps latency under target, and build systems do it to find the largest parallelism that does not thrash. Anywhere you tune a knob until something stops failing, the search is this one.',
  idea:
    'Nothing here is sorted and there is no array to look in. What there is, is a numeric answer with a lower and an upper bound, and a yes-or-no question about a candidate whose answer flips exactly once as the candidate grows. That flip is all binary search ever needed. Probe the middle, ask the question, and throw away the half that cannot hold the smallest true value.',
  useWhen:
    'The question says minimum, maximum, smallest, largest or "the least k such that", and you can write a checker that says whether a given candidate works. Minimum ship capacity, slowest eating speed, smallest largest sum, minimum days. If checking is easy but constructing is hard, this is the pattern.',
  pitfall:
    'Two things. Proving monotonicity, which people skip: if a larger candidate could fail where a smaller one succeeded, the search is invalid and the answer is silently wrong. And the boundary, since this template uses lo < hi with hi = mid, not hi = mid - 1, because mid may itself be the answer.',
  complexity: { time: 'O(n log(hi - lo))', space: 'O(1)' },
  code,
  inputs: [
    { name: 'weights', label: 'package weights', kind: 'numbers', value: '3, 2, 2, 4, 1, 4', hint: 'must ship in this order' },
    { name: 'days', label: 'days allowed', kind: 'number', value: 3 },
  ],
  run,
}
