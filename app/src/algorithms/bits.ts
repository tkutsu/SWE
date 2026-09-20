import { parseNumbers } from '../engine/frame'
import type { Algorithm, Cell, Role, StepGen } from '../engine/types'

const code = `function singleNumber(nums) {
  let x = 0
  for (const n of nums) {
    x ^= n
  }
  return x
}`

const WIDTH = 8

const bits = (n: number, roles: Record<number, Role> = {}): Cell[] =>
  Array.from({ length: WIDTH }, (_, k) => {
    const bit = WIDTH - 1 - k
    return { value: (n >> bit) & 1, role: roles[bit] ?? ((n >> bit) & 1 ? 'window' : 'idle'), sub: String(bit) }
  })

function* run(input: Record<string, string | number>): StepGen {
  const nums = parseNumbers(input.nums, 'nums')
  if (nums.length === 0) throw new Error('Give it some numbers.')
  if (nums.some((n) => n < 0 || n > 255)) throw new Error('Keep the values between 0 and 255 so eight bits are enough to draw.')

  let x = 0

  const views = (i: number, changed: Record<number, Role> = {}) => [
    {
      kind: 'array' as const,
      label: 'input',
      cells: nums.map((v, k) => ({ value: v, role: (k === i ? 'active' : k < i ? 'excluded' : 'idle') as Role, sub: ' ' })),
    },
    { kind: 'array' as const, label: `running total x = ${x}`, cells: bits(x, changed) },
    ...(i >= 0 && i < nums.length
      ? [{ kind: 'array' as const, label: `current value ${nums[i]}`, cells: bits(nums[i]) }]
      : []),
  ]

  yield {
    line: 2,
    note:
      'XOR has two properties that make this work. A number XOR itself is zero, and XOR does not care about order. So if every value appears twice except one, XOR-ing the whole list cancels the pairs no matter how they are arranged, and the loner survives. Start at 0, which is XOR’s identity.',
    views: views(-1),
    vars: { x: 0, count: nums.length },
  }

  for (let i = 0; i < nums.length; i++) {
    const before = x
    const after = x ^ nums[i]
    const flipped: Record<number, Role> = {}
    for (let b = 0; b < WIDTH; b++) if (((before >> b) & 1) !== ((after >> b) & 1)) flipped[b] = 'active'

    yield {
      line: [3, 4],
      note: `XOR in ${nums[i]}. A bit flips exactly where ${nums[i]} has a 1, because XOR means "differ". x goes from ${before} to ${after}.`,
      views: views(i, flipped),
      vars: { i, value: nums[i], 'x before': before, 'x after': after },
    }

    x = after

    yield {
      line: 4,
      note: `x is now ${x}${x === 0 ? ', back to zero, which means everything seen so far has cancelled out in pairs' : ''}.`,
      views: views(i),
      vars: { i, x },
    }
  }

  const counts = new Map<number, number>()
  for (const n of nums) counts.set(n, (counts.get(n) ?? 0) + 1)
  const odd = [...counts.entries()].filter(([, c]) => c % 2 === 1).map(([v]) => v)

  yield {
    line: 6,
    note:
      odd.length === 1
        ? `Everything paired off except ${odd[0]}, which is what is left in x. One pass, one integer of memory, no hash map and no sorting.`
        : `${odd.length === 0 ? 'Every value appeared an even number of times, so everything cancelled and x is 0.' : `More than one value appeared an odd number of times (${odd.join(', ')}), so x is their combined XOR rather than a single answer. The trick only isolates one loner.`}`,
    views: views(-1, Object.fromEntries(Array.from({ length: WIDTH }, (_, b) => [b, ((x >> b) & 1 ? 'match' : 'idle') as Role]))),
    vars: { x, binary: x.toString(2).padStart(WIDTH, '0') },
    result: `${x}  (binary ${x.toString(2).padStart(WIDTH, '0')})`,
  }
}

export const bitManipulation: Algorithm = {
  id: 'bit-manipulation',
  name: 'Bit manipulation (XOR trick)',
  blurb: 'Pairs cancel under XOR, so the odd one out survives a single pass.',
  realWorld:
    'Unix file permissions are three bits per group, which is what chmod 755 is setting. Feature flags, bitmap indexes in databases, Bloom filters and chess engine bitboards all pack a set into a single integer.',
  idea:
    'XOR is its own inverse: a value XOR itself is zero. It is also commutative and associative, so the order you combine things in does not matter. Put those together and XOR-ing a whole list makes every duplicated pair vanish regardless of where the duplicates sit, leaving only the value that had no partner. One integer of memory does what a hash map would otherwise need.',
  useWhen:
    'Single number, missing number, finding the two non-duplicated values, swapping without a temp, and subset enumeration with masks. More generally, any time you need a set of flags to fit in one integer.',
  pitfall:
    'Assuming it generalises. If a value appears three times rather than twice, XOR does not cancel it and the trick fails. Also n & (n - 1) clearing the lowest set bit, and n & -n isolating it, are worth memorising, because reconstructing them under pressure is a waste of time.',
  complexity: { time: 'O(n)', space: 'O(1)' },
  code,
  inputs: [{ name: 'nums', label: 'nums', kind: 'numbers', value: '4, 1, 2, 1, 2', hint: 'every value twice except one, 0 to 255' }],
  run,
}
