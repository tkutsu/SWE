import { parseNumbers } from '../engine/frame'
import type { Algorithm, Cell, Role, StepGen } from '../engine/types'

const code = `function countingSort(a, max) {
  const count = new Array(max + 1).fill(0)
  for (const v of a) count[v]++
  for (let i = 1; i <= max; i++) {
    count[i] += count[i - 1]
  }
  const out = new Array(a.length)
  for (let i = a.length - 1; i >= 0; i--) {
    count[a[i]]--
    out[count[a[i]]] = a[i]
  }
  return out
}`

function* run(input: Record<string, string | number>): StepGen {
  const a = parseNumbers(input.nums, 'nums')
  if (a.length < 2) throw new Error('Give it at least two numbers.')
  if (a.some((v) => v < 0)) throw new Error('Counting sort needs non-negative values. Shift the range first if yours are negative.')
  const max = Math.max(...a)
  if (max > 12) throw new Error(`The largest value is ${max}. Keep values to 12 or below so the count table fits.`)

  const count = new Array<number>(max + 1).fill(0)
  const out = new Array<number | null>(a.length).fill(null)

  const countCells = (roles: Record<number, Role> = {}): Cell[] =>
    count.map((v, i) => ({ value: v, role: roles[i] ?? (v > 0 ? 'window' : 'idle'), sub: String(i) }))

  const outCells = (roles: Record<number, Role> = {}): Cell[] =>
    out.map((v, i) => ({ value: v === null ? '' : v, role: roles[i] ?? (v === null ? 'idle' : 'match'), sub: String(i) }))

  const views = (
    inputRoles: Record<number, Role> = {},
    countRoles: Record<number, Role> = {},
    outRoles: Record<number, Role> = {},
    countLabel = 'count[v]: how many of each value',
  ) => [
    { kind: 'array' as const, label: 'input', cells: a.map((v, i) => ({ value: v, role: inputRoles[i] ?? 'idle', sub: ' ' })) },
    { kind: 'array' as const, label: countLabel, cells: countCells(countRoles) },
    { kind: 'array' as const, label: 'output', cells: outCells(outRoles) },
  ]

  yield {
    line: 2,
    note: `Every comparison sort needs at least n log n comparisons, but that bound only applies if you compare. When the values are small integers you can skip comparing entirely and use the value itself as an index. The count table has one slot per possible value, 0 to ${max}.`,
    views: views(),
    vars: { n: a.length, max },
  }

  for (let i = 0; i < a.length; i++) {
    count[a[i]]++
    yield {
      line: 3,
      note: `${a[i]} appears, so increment slot ${a[i]}. No comparison happened, just an array index.`,
      views: views({ [i]: 'active' }, { [a[i]]: 'active' }),
      vars: { i, value: a[i], [`count[${a[i]}]`]: count[a[i]] },
    }
  }

  yield {
    line: 4,
    note: `Every value is counted: ${count.map((c, v) => `${v} appears ${c}x`).filter((_, v) => count[v] > 0).join(', ')}. Now turn the counts into running totals, so each slot says how many values are less than or equal to it. That total is exactly the position just past where that value belongs.`,
    views: views(),
    vars: { counts: count.join(', ') },
  }

  for (let i = 1; i <= max; i++) {
    const before = count[i]
    count[i] += count[i - 1]
    yield {
      line: 5,
      note: `Slot ${i} held ${before}. Add slot ${i - 1}'s running total of ${count[i - 1]} to get ${count[i]}, meaning ${count[i]} value${count[i] === 1 ? '' : 's'} in the input are ${i} or smaller.`,
      views: views({}, { [i]: 'active', [i - 1]: 'compare' }, {}, 'count[v]: how many values are v or smaller'),
      vars: { i, was: before, now: count[i] },
    }
  }

  yield {
    line: [7, 8],
    note: `Now place each value. Walking the input backwards is what makes this stable: equal values keep their original relative order, because the last one encountered takes the highest slot. That stability is the reason counting sort can be used inside radix sort.`,
    views: views({}, {}, {}, 'count[v]: how many values are v or smaller'),
    vars: { phase: 'place', direction: 'right to left' },
  }

  for (let i = a.length - 1; i >= 0; i--) {
    const v = a[i]
    count[v]--
    out[count[v]] = v
    yield {
      line: [9, 10],
      note: `${v} at input index ${i}: slot ${v} says ${count[v] + 1} values are ${v} or smaller, so ${v} belongs at output index ${count[v]}. Decrement the slot so the next ${v} lands just to the left.`,
      views: views({ [i]: 'active' }, { [v]: 'compare' }, { [count[v]]: 'active' }, 'count[v]: how many values are v or smaller'),
      vars: { i, value: v, 'placed at': count[v] },
    }
  }

  yield {
    line: 12,
    note: `Sorted: ${out.join(', ')}. Linear in n plus the size of the value range, with no comparisons anywhere. The catch is in that second term: if the values ranged to a million, the count table would too, and this would be far worse than a comparison sort.`,
    views: views({}, {}, Object.fromEntries(out.map((_, i) => [i, 'match' as Role])), 'count[v]: how many values are v or smaller'),
    vars: { sorted: out.join(', ') },
    result: out.join(', '),
  }
}

export const countingSort: Algorithm = {
  id: 'counting-sort',
  name: 'Counting sort',
  blurb: 'Use the value as an index. No comparisons, so the n log n bound does not apply.',
  realWorld:
    'Image processing sorts pixel intensities in the range 0 to 255 this way when building histograms. It is also the stable inner pass that radix sort runs once per digit, which is where most of its real use comes from.',
  idea:
    'The n log n lower bound is a statement about comparison sorts. If the keys are small integers you can use the key itself as an array index and never compare anything. Count how many of each value there are, turn those counts into running totals so each says how many values are at most that big, then walk the input backwards placing each value at the position its total points to.',
  useWhen:
    'Small integer keys with a range comparable to the number of items: ages, grades, pixel values, bucket ids. If the range is much larger than the input, the count table dominates and this stops being worth it.',
  pitfall:
    'Walking the input forwards during the placement pass. It still sorts, but it is no longer stable, which silently breaks radix sort if you use it there. Also forgetting that the space cost is the value range, not the input size.',
  complexity: { time: 'O(n + k), k = value range', space: 'O(n + k)' },
  code,
  inputs: [{ name: 'nums', label: 'nums', kind: 'numbers', value: '4, 2, 2, 8, 3, 3, 1', hint: 'non-negative, max value 12' }],
  run,
}
