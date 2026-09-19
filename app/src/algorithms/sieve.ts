import type { Algorithm, Cell, Role, StepGen } from '../engine/types'

const code = `function sieve(n) {
  const prime = new Array(n + 1).fill(true)
  prime[0] = prime[1] = false
  for (let p = 2; p * p <= n; p++) {
    if (!prime[p]) continue
    for (let m = p * p; m <= n; m += p) {
      prime[m] = false
    }
  }
  return prime
}`

function* run(input: Record<string, string | number>): StepGen {
  const n = Number(input.n)
  if (!Number.isInteger(n) || n < 4 || n > 60) throw new Error('n must be a whole number between 4 and 60.')

  const prime = new Array<boolean>(n + 1).fill(true)
  prime[0] = false
  prime[1] = false

  const cols = 10
  const rows = Math.ceil((n + 1) / cols)

  const grid = (roles: Record<number, Role> = {}): Cell[][] =>
    Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => {
        const v = r * cols + c
        if (v > n) return { value: '', role: 'idle' as Role }
        return { value: v, role: roles[v] ?? (v < 2 ? 'excluded' : prime[v] ? 'match' : 'excluded') }
      }),
    )

  const views = (roles: Record<number, Role> = {}) => [
    { kind: 'grid' as const, label: 'numbers up to ' + n + ' (green means still prime)', cells: grid(roles) },
  ]

  yield {
    line: [2, 3],
    note: `Testing each number for primality one at a time costs a division loop per number. The sieve inverts that: instead of asking "is this prime", it takes each prime and crosses off everything it divides. Start by assuming everything is prime, except 0 and 1 which are not by definition.`,
    views: views(),
    vars: { n, 'assumed prime': n - 1 },
  }

  for (let p = 2; p * p <= n; p++) {
    if (!prime[p]) {
      yield {
        line: 5,
        note: `${p} was already crossed off by a smaller prime, so it is composite. Anything it would cross off has already been handled by that smaller prime's own pass. Skip it.`,
        views: views({ [p]: 'excluded' }),
        vars: { p, 'is prime': false },
      }
      continue
    }

    yield {
      line: [4, 6],
      note: `${p} survived, so it is prime. Cross off its multiples, starting at ${p} squared = ${p * p}. Anything smaller than that, like ${2 * p}, has a factor below ${p} and was already crossed off on an earlier pass, so starting lower would just repeat work.`,
      views: views({ [p]: 'active' }),
      vars: { p, 'start crossing at': p * p },
    }

    const crossed: number[] = []
    for (let m = p * p; m <= n; m += p) {
      if (prime[m]) crossed.push(m)
      prime[m] = false
    }

    yield {
      line: 7,
      note:
        crossed.length > 0
          ? `Crossed off ${crossed.join(', ')}. Each is ${p} times something, so none of them can be prime.`
          : `Nothing new to cross off. Every multiple of ${p} in range was already eliminated.`,
      views: views({ [p]: 'match', ...Object.fromEntries(crossed.map((m) => [m, 'compare' as Role])) }),
      vars: { p, 'newly crossed off': crossed.join(', ') || 'none' },
    }
  }

  const primes = prime.map((ok, v) => (ok ? v : -1)).filter((v) => v >= 2)

  yield {
    line: 10,
    note: `The loop stopped at p where p squared exceeds ${n}. Anything composite left would need a factor above the square root paired with one below it, and the one below would already have crossed it off. So everything still standing is prime: ${primes.join(', ')}. The whole thing costs about n log log n, which is very close to linear.`,
    views: views(),
    vars: { primes: primes.join(', '), count: primes.length },
    result: `${primes.length} primes: ${primes.join(', ')}`,
  }
}

export const sieve: Algorithm = {
  id: 'sieve',
  name: 'Math: sieve of Eratosthenes',
  rank: 29,
  tier: 4,
  blurb: 'Cross off multiples instead of testing each number for primality.',
  realWorld:
    'Generating the primes that RSA key generation needs. Hash table implementations pick prime table sizes to spread keys evenly, and checksum schemes lean on primes for the same reason.',
  idea:
    'Turn the question around. Rather than asking of each number whether anything divides it, take each prime and eliminate everything it divides. Two optimisations do the real work: start crossing off at p squared, because smaller multiples of p already have a smaller prime factor and were handled earlier, and stop the outer loop once p squared passes n, because any composite left would need a factor below the square root that would already have caught it.',
  useWhen:
    'Any problem needing many primes rather than one, factorisation over a range, counting primes, and as preprocessing when a problem repeatedly asks about divisibility. For testing a single large number, trial division or Miller-Rabin is the right tool instead.',
  pitfall:
    'Starting the inner loop at 2p rather than p squared, and running the outer loop to n rather than the square root of n. Both give correct answers while doing far more work, and both are what the interviewer is watching for.',
  complexity: { time: 'O(n log log n)', space: 'O(n)' },
  code,
  inputs: [{ name: 'n', label: 'up to', kind: 'number', value: 30, hint: '4 to 60' }],
  run,
}
