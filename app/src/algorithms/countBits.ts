import { parseInt10 } from '../engine/frame'
import type { Algorithm, Cell, Role, StepGen } from '../engine/types'

const code = `function popcount(n) {
  let count = 0
  while (n !== 0) {
    n = n & (n - 1)
    count++
  }
  return count
}`

const WIDTH = 12

/** Most significant bit first, which is how the number reads on paper. */
function bitCells(n: number, roles: Record<number, Role> = {}): Cell[] {
  const out: Cell[] = []
  for (let i = WIDTH - 1; i >= 0; i--) {
    const bit = (n >> i) & 1
    out.push({ value: bit, role: roles[i] ?? (bit ? 'window' : 'idle'), sub: String(1 << i) })
  }
  return out
}

function lowestSetBit(n: number): number {
  for (let i = 0; i < WIDTH; i++) if ((n >> i) & 1) return i
  return -1
}

function* run(input: Record<string, string | number>): StepGen {
  const start = parseInt10(input.n, 'n')
  if (!Number.isInteger(start) || start < 0 || start >= 1 << WIDTH) {
    throw new Error(`n must be a whole number from 0 to ${(1 << WIDTH) - 1}.`)
  }

  let n = start
  let count = 0

  yield {
    line: 2,
    note: `Counting the set bits of ${start}. The obvious loop tests all ${WIDTH} bit positions one by one whatever the number is. This one runs once per set bit, so a number with two bits set takes two turns no matter how wide it is.`,
    views: [{ kind: 'array', label: `${start} in binary`, cells: bitCells(n) }],
    vars: { n, count, 'set bits': bitCells(n).filter((c) => c.value === 1).length },
  }

  while (n !== 0) {
    const low = lowestSetBit(n)
    const minus = n - 1

    yield {
      line: 4,
      note: `The lowest set bit is the ${1 << low} column. Subtracting 1 flips it to 0 and turns every 0 below it into a 1, because that is what borrowing does. So n - 1 is ${minus}.`,
      views: [
        { kind: 'array', label: `n = ${n}`, cells: bitCells(n, { [low]: 'active' }) },
        { kind: 'array', label: `n - 1 = ${minus}`, cells: bitCells(minus, { [low]: 'compare' }) },
      ],
      vars: { n, 'n - 1': minus, 'lowest set bit': 1 << low, count },
    }

    const next = n & minus
    const changedRoles: Record<number, Role> = { [low]: 'excluded' }
    for (let i = 0; i < low; i++) changedRoles[i] = 'excluded'

    yield {
      line: [4, 5],
      note: `Above that column the two numbers are identical, so AND keeps those bits untouched. At the column itself one side is 0. Below it, one side is all 1s and the other all 0s. The AND therefore clears exactly one bit, the lowest, and changes nothing else. n becomes ${next} and the count rises to ${count + 1}.`,
      views: [
        { kind: 'array', label: `n & (n - 1) = ${next}`, cells: bitCells(next, changedRoles) },
        { kind: 'array', label: `was ${n}`, cells: bitCells(n, { [low]: 'excluded' }) },
      ],
      vars: { n: next, cleared: 1 << low, count: count + 1 },
    }

    n = next
    count++
  }

  yield {
    line: 7,
    note: `n has reached 0, so every set bit has been cleared and counted. ${start} has ${count} set bit${count === 1 ? '' : 's'}, found in ${count} turn${count === 1 ? '' : 's'} rather than ${WIDTH} bit tests.`,
    views: [{ kind: 'array', label: `${start} in binary`, cells: bitCells(start, Object.fromEntries(Array.from({ length: WIDTH }, (_, i) => [i, ((start >> i) & 1 ? 'match' : 'idle') as Role]))) }],
    vars: { answer: count, turns: count, 'a bit-by-bit loop would take': WIDTH },
    result: `${start} has ${count} set bit${count === 1 ? '' : 's'}`,
  }
}

export const countBits: Algorithm = {
  id: 'count-bits',
  name: 'Counting Set Bits',
  blurb: 'n & (n - 1) clears the lowest set bit, so the loop runs once per bit that is set.',
  realWorld:
    'Population count is a single CPU instruction now because it is everywhere underneath: bitset cardinality in search engines, Hamming distance between hashes for near-duplicate detection, and chess engines counting pieces on a 64-bit board.',
  idea:
    'Subtracting 1 from a number flips its lowest set bit to 0 and every 0 below it to 1, which is just how borrowing works in binary. ANDing that with the original keeps the untouched high bits, kills the bit that flipped, and zeroes the borrowed run underneath. One bit removed per turn, exactly, so the loop length is the answer rather than the width of the word.',
  useWhen:
    'Any popcount, Hamming distance, or subset enumeration. The wider family matters more than the trick: n & (n - 1) clears the lowest bit, n & -n isolates it, and n & (n - 1) being 0 is the fastest test for a power of two.',
  pitfall:
    'Doing it by hand when the language has a built-in, and reaching for it when the real question was "count bits for every number from 0 to n". That one is dynamic programming: bits[i] = bits[i >> 1] + (i & 1), which is O(n) total rather than this run per number.',
  complexity: { time: 'O(set bits)', space: 'O(1)' },
  code,
  inputs: [{ name: 'n', label: 'n', kind: 'number', value: 156, hint: `0 to ${(1 << WIDTH) - 1}` }],
  run,
}
