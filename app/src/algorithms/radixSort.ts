import { parseNumbers } from '../engine/frame'
import type { Algorithm, Cell, Role, StackItem, StepGen } from '../engine/types'

const code = `function radixSort(a) {
  const max = Math.max(...a)
  for (let place = 1; Math.floor(max / place) > 0; place *= 10) {
    const buckets = Array.from({ length: 10 }, () => [])
    for (const v of a) {
      buckets[Math.floor(v / place) % 10].push(v)
    }
    a = buckets.flat()
  }
  return a
}`

function* run(input: Record<string, string | number>): StepGen {
  let a = parseNumbers(input.nums, 'nums')
  if (a.length < 2) throw new Error('Give it at least two numbers.')
  if (a.some((v) => v < 0)) throw new Error('This version needs non-negative values.')
  if (a.some((v) => v > 999)) throw new Error('Keep values to three digits so the passes stay short.')
  if (a.length > 10) throw new Error('Keep it to 10 values.')

  const max = Math.max(...a)
  const digitOf = (v: number, place: number) => Math.floor(v / place) % 10

  const arrayCells = (roles: Record<number, Role> = {}, place?: number): Cell[] =>
    a.map((v, i) => ({
      value: v,
      role: roles[i] ?? 'idle',
      sub: place ? String(digitOf(v, place)) : ' ',
    }))

  const bucketViews = (buckets: number[][], active?: number) =>
    buckets.map((b, d) => ({
      kind: 'stack' as const,
      label: `bucket ${d}`,
      items: b.map((v) => ({ label: String(v), role: (d === active ? 'active' : 'window') as Role })) as StackItem[],
      orientation: 'horizontal' as const,
    }))

  yield {
    line: 2,
    note: `Comparison sorts ask "which of these two is bigger". Radix sort never asks. It sorts by the last digit, then the next, and so on, and because each pass is stable, the work of the earlier passes survives. After the final pass the whole array is in order.`,
    views: [{ kind: 'array' as const, label: 'input', cells: arrayCells() }],
    vars: { n: a.length, max, passes: String(max).length },
  }

  let place = 1
  let pass = 0

  while (Math.floor(max / place) > 0) {
    pass++
    const name = place === 1 ? 'ones' : place === 10 ? 'tens' : 'hundreds'

    yield {
      line: [3, 4],
      note: `Pass ${pass}, sorting by the ${name} digit. Ten buckets, one per digit. The captions under the values show the digit being used this pass.`,
      views: [{ kind: 'array' as const, label: `input, ${name} digit shown below`, cells: arrayCells({}, place) }],
      vars: { pass, place, digit: name },
    }

    const buckets: number[][] = Array.from({ length: 10 }, () => [])

    for (let i = 0; i < a.length; i++) {
      const d = digitOf(a[i], place)
      buckets[d].push(a[i])
      yield {
        line: [5, 6],
        note: `${a[i]} has ${name} digit ${d}, so it joins bucket ${d}. Values are appended, so two numbers with the same digit keep the order they already had. That is the stability the next pass depends on.`,
        views: [
          { kind: 'array' as const, label: `input, ${name} digit shown below`, cells: arrayCells({ [i]: 'active' }, place) },
          ...bucketViews(buckets, d),
        ],
        vars: { pass, value: a[i], digit: d },
      }
    }

    a = buckets.flat()

    yield {
      line: 8,
      note: `Empty the buckets back out in order, 0 through 9: ${a.join(', ')}. The array is now correctly sorted by everything up to and including the ${name} digit.`,
      views: [
        { kind: 'array' as const, label: 'after this pass', cells: a.map((v) => ({ value: v, role: 'match' as Role, sub: ' ' })) },
      ],
      vars: { pass, result: a.join(', ') },
    }

    place *= 10
  }

  yield {
    line: 10,
    note: `Sorted in ${pass} pass${pass === 1 ? '' : 'es'}: ${a.join(', ')}. The cost is the number of digits times n, so for fixed-width keys it is linear. It only beats a comparison sort when the keys are short relative to how many of them there are.`,
    views: [{ kind: 'array' as const, label: 'sorted', cells: a.map((v) => ({ value: v, role: 'match' as Role, sub: ' ' })) }],
    vars: { sorted: a.join(', '), passes: pass },
    result: a.join(', '),
  }
}

export const radixSort: Algorithm = {
  id: 'radix-sort',
  name: 'Radix sort',
  blurb: 'Sort by one digit at a time, least significant first, using a stable pass each time.',
  realWorld:
    'Sorting large volumes of fixed-width keys: IP addresses, fixed precision timestamps, database record ids. GPU sorting libraries lean on it heavily because counting digits parallelises cleanly in a way comparison sorts do not.',
  idea:
    'Sort by the least significant digit, then the next, and so on up to the most significant. The trick is that each pass must be stable, so when the current digits tie, the order established by the previous passes is preserved. After the pass on the most significant digit the array is fully sorted, without a single comparison between two values.',
  useWhen:
    'Many items with short fixed-width keys. It is the reason sorting a billion 32 bit integers can beat n log n in practice, and it is the standard answer when an interviewer asks whether sorting can ever be faster than n log n.',
  pitfall:
    'Using an unstable sort for the per-digit pass, which destroys the result of every earlier pass and gives an array sorted only by the final digit. Also starting from the most significant digit, which needs a different recursive structure and is not this algorithm.',
  complexity: { time: 'O(d * (n + 10)), d = number of digits', space: 'O(n)' },
  code,
  inputs: [{ name: 'nums', label: 'nums', kind: 'numbers', value: '170, 45, 75, 90, 2, 802, 24', hint: 'non-negative, max 3 digits, max 10 values' }],
  run,
}
