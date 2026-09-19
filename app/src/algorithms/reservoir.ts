import { parseInt10, parseNumbers } from '../engine/frame'
import type { Algorithm, Role, StepGen } from '../engine/types'

const code = `function reservoirSample(stream, k) {
  const keep = []
  let seen = 0
  for (const item of stream) {
    seen++
    if (keep.length < k) {
      keep.push(item)
    } else {
      const j = randomInt(seen)
      if (j < k) keep[j] = item
    }
  }
  return keep
}`

/** Deterministic PRNG, so the same input always gives the same walkthrough. */
function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function* run(input: Record<string, string | number>): StepGen {
  const stream = parseNumbers(input.stream, 'stream')
  if (stream.length === 0) throw new Error('Give it a stream of values.')
  const k = parseInt10(input.k, 'k')
  if (k < 1 || k > stream.length) throw new Error(`k must be between 1 and ${stream.length}.`)
  const seed = parseInt10(input.seed, 'seed')
  const rand = mulberry32(seed)

  const keep: number[] = []
  let seen = 0

  const views = (i: number, keepRoles: Record<number, Role> = {}) => [
    {
      kind: 'array' as const,
      label: 'stream (arriving one at a time, length unknown in advance)',
      cells: stream.map((v, idx) => ({
        value: v,
        role: (idx === i ? 'active' : idx < i ? 'excluded' : 'idle') as Role,
        sub: idx <= i ? ' ' : '?',
      })),
    },
    {
      kind: 'array' as const,
      label: `reservoir (holds ${k})`,
      cells: keep.length
        ? keep.map((v, idx) => ({ value: v, role: keepRoles[idx] ?? ('match' as Role), sub: String(idx) }))
        : [{ value: '-', role: 'idle' as Role }],
    },
  ]

  yield {
    line: [2, 3],
    note: `Pick ${k} item${k === 1 ? '' : 's'} uniformly at random from a stream whose length you do not know and cannot store. You cannot pick a random index because there is no length yet, and you cannot keep everything. The reservoir holds the current answer at all times, and stays a valid uniform sample after every single item.`,
    views: views(-1),
    vars: { k, seed },
  }

  for (let i = 0; i < stream.length; i++) {
    seen++
    const item = stream[i]

    if (keep.length < k) {
      keep.push(item)
      yield {
        line: [6, 7],
        note: `The reservoir is not full yet, so ${item} goes straight in. While fewer than ${k} items have arrived, keeping all of them is trivially the correct sample.`,
        views: views(i, { [keep.length - 1]: 'active' }),
        vars: { seen, item, 'reservoir size': keep.length },
      }
      continue
    }

    const j = Math.floor(rand() * seen)
    const lucky = j < k

    yield {
      line: [9, 10],
      note: `Item number ${seen} is ${item}. It should end up in the sample with probability ${k}/${seen}. Roll a number in 0 to ${seen - 1}: got ${j}. ${
        lucky ? `${j} is below ${k}, so ${item} gets in and evicts whatever sits at slot ${j}.` : `${j} is not below ${k}, so ${item} is discarded.`
      }`,
      views: views(i, lucky ? { [j]: 'compare' } : {}),
      vars: { seen, item, roll: j, 'probability of keeping': `${k}/${seen}`, kept: lucky },
    }

    if (lucky) {
      const evicted = keep[j]
      keep[j] = item
      yield {
        line: 10,
        note: `${item} replaces ${evicted} at slot ${j}. The reason this stays uniform: every item currently in the reservoir survives this round with probability ${seen - 1}/${seen} multiplied through, and that cancels exactly against its earlier higher chance. Every item ever seen ends up with the same ${k}/${seen} probability.`,
        views: views(i, { [j]: 'active' }),
        vars: { seen, 'replaced': evicted, 'with': item, 'at slot': j },
      }
    }
  }

  yield {
    line: 13,
    note: `The stream ended after ${seen} items and the reservoir holds ${keep.join(', ')}. Every one of the ${seen} items had exactly a ${k}-in-${seen} chance of being here, and the memory used never exceeded ${k} slots regardless of stream length.`,
    views: views(stream.length),
    vars: { seen, sample: keep.join(', ') },
    result: `${keep.join(', ')}  (from ${seen} items, ${k} in ${seen} chance each)`,
  }
}

export const reservoir: Algorithm = {
  id: 'reservoir-sampling',
  name: 'Reservoir sampling',
  rank: 25,
  tier: 4,
  blurb: 'Uniform random pick from a stream you cannot measure or store.',
  realWorld:
    'Keeping one request in a thousand for tracing, when you have no idea how many requests today will bring. Log pipelines and telemetry systems hold a bounded sample of an unbounded stream exactly this way.',
  idea:
    'Hold the answer at all times. The first k items go straight into the reservoir. After that, item number n replaces a random existing slot with probability k over n. The invariant is that after every item, the reservoir is a uniform sample of everything seen so far, which means you can stop at any moment and the answer is already correct. Memory is k, independent of how long the stream turns out to be.',
  useWhen:
    'Sampling log lines, picking a random node from a linked list of unknown length, random element from a stream, and A/B bucketing where the population is not known upfront. It appears at companies that deal with streaming data.',
  pitfall:
    'Rolling the random number against k rather than against the count seen so far. That biases heavily toward early items. The probability has to shrink as the stream grows, which is the entire mechanism.',
  complexity: { time: 'O(n)', space: 'O(k)' },
  code,
  inputs: [
    { name: 'stream', label: 'stream', kind: 'numbers', value: '10, 20, 30, 40, 50, 60, 70, 80' },
    { name: 'k', label: 'sample size k', kind: 'number', value: 3 },
    { name: 'seed', label: 'random seed', kind: 'number', value: 7, hint: 'change it to get a different run' },
  ],
  run,
}
