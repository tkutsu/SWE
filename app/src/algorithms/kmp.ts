import { cells } from '../engine/frame'
import type { Algorithm, Role, StepGen } from '../engine/types'

const code = `function kmp(text, pat) {
  const lps = buildLps(pat)
  let i = 0
  let j = 0
  while (i < text.length) {
    if (text[i] === pat[j]) { i++; j++ }
    else if (j > 0) j = lps[j - 1]
    else i++
    if (j === pat.length) return i - j
  }
  return -1
}

function buildLps(pat) {
  const lps = [0]
  let len = 0
  for (let i = 1; i < pat.length; i++) {
    while (len > 0 && pat[i] !== pat[len]) len = lps[len - 1]
    if (pat[i] === pat[len]) len++
    lps[i] = len
  }
  return lps
}`

function buildLps(pat: string): number[] {
  const lps = [0]
  let len = 0
  for (let i = 1; i < pat.length; i++) {
    while (len > 0 && pat[i] !== pat[len]) len = lps[len - 1]
    if (pat[i] === pat[len]) len++
    lps[i] = len
  }
  return lps
}

function* run(input: Record<string, string | number>): StepGen {
  const text = String(input.text).trim()
  const pat = String(input.pattern).trim()
  if (!text || !pat) throw new Error('Give it both a text and a pattern.')
  if (pat.length > text.length) throw new Error('The pattern is longer than the text, so it cannot be in there.')
  if (text.length > 30) throw new Error('Keep the text under 30 characters so the steps stay readable.')

  const lps = buildLps(pat)
  const T = [...text]
  const P = [...pat]

  const textView = (i: number, j: number, role: Role = 'compare') => {
    const roles: Record<number, Role> = {}
    for (let k = 0; k < j; k++) roles[i - j + k] = 'match'
    if (i < T.length) roles[i] = role
    return { kind: 'array' as const, label: 'text', cells: cells(T, roles) }
  }

  const patView = (j: number, role: Role = 'compare') => {
    const roles: Record<number, Role> = {}
    for (let k = 0; k < j; k++) roles[k] = 'match'
    if (j < P.length) roles[j] = role
    return { kind: 'array' as const, label: 'pattern', cells: cells(P, roles) }
  }

  const lpsView = (at = -1) => ({
    kind: 'array' as const,
    label: 'lps: longest prefix that is also a suffix, per position',
    cells: cells(lps, at >= 0 ? { [at]: 'active' } : {}, Object.fromEntries(P.map((c, k) => [k, c]))),
  })

  yield {
    line: 2,
    note: `The naive search restarts the pattern from scratch after every mismatch, re-reading text it has already seen. KMP never moves backwards in the text at all. The price is one precomputed table.`,
    views: [textView(0, 0), patView(0), lpsView()],
    vars: { text: text.length, pattern: pat.length },
  }

  yield {
    line: [15, 23],
    note: `That table answers one question per position: of the pattern up to here, how long is the longest prefix that is also a suffix? For "${pat}" it is [${lps.join(', ')}]. When a mismatch happens after j matched characters, those lps[j-1] characters are already known to match, so the pattern slides forward and j drops rather than resetting to zero.`,
    views: [patView(-1), lpsView(lps.length - 1)],
    vars: { lps: lps.join(', ') },
  }

  let i = 0
  let j = 0
  let comparisons = 0

  while (i < T.length) {
    comparisons++
    if (T[i] === P[j]) {
      yield {
        line: 6,
        note: `text[${i}] and pattern[${j}] are both "${T[i]}". Advance both. ${j + 1} character${j === 0 ? '' : 's'} of the pattern now matched.`,
        views: [textView(i, j, 'active'), patView(j, 'active'), lpsView()],
        vars: { i, j, matched: j + 1, comparisons },
      }
      i++
      j++
      if (j === P.length) {
        yield {
          line: 10,
          note: `The whole pattern matched, ending at index ${i - 1}, so it starts at index ${i - j}. Found in ${comparisons} comparison${comparisons === 1 ? '' : 's'} with the text pointer never once going backwards.`,
          views: [textView(i, j, 'match'), patView(P.length, 'match')],
          vars: { 'found at': i - j, comparisons },
          result: `found at index ${i - j}, in ${comparisons} comparisons`,
        }
        return
      }
    } else if (j > 0) {
      const back = lps[j - 1]
      yield {
        line: 7,
        note: `text[${i}] is "${T[i]}" and pattern[${j}] is "${P[j]}", so they differ after ${j} matched. The naive answer is to slide the pattern one place and start again at text[${i - j + 1}]. Instead, lps says the first ${back} character${back === 1 ? '' : 's'} of the pattern already match what is behind us, so j drops to ${back} and i does not move.`,
        views: [textView(i, j, 'excluded'), patView(j, 'excluded'), lpsView(j - 1)],
        vars: { i, j, 'j becomes': back, 'i stays at': i, comparisons },
      }
      j = back
    } else {
      yield {
        line: 8,
        note: `text[${i}] is "${T[i]}" and the pattern is at its start, so there is nothing matched to fall back on. Move along the text by one.`,
        views: [textView(i, 0, 'excluded'), patView(0, 'excluded'), lpsView()],
        vars: { i, j, comparisons },
      }
      i++
    }
  }

  yield {
    line: 12,
    note: `The text is exhausted without a full match. "${pat}" is not in the text. ${comparisons} comparisons for ${T.length} characters, and the text index only ever went forwards.`,
    views: [{ kind: 'array', label: 'text', cells: cells(T, Object.fromEntries(T.map((_, k) => [k, 'excluded' as Role]))) }, patView(0)],
    vars: { comparisons, result: 'not found' },
    result: `-1, "${pat}" is not in the text`,
  }
}

export const kmp: Algorithm = {
  id: 'kmp',
  name: 'KMP String Matching',
  rank: 209,
  tier: 4,
  blurb: 'Never re-read the text, by remembering what the pattern shares with itself.',
  realWorld:
    'grep, editor find, and intrusion detection systems scanning packets for signatures all need matching that cannot afford to backtrack over a stream. Bioinformatics runs it over genomes, where re-reading is not an option at that size.',
  idea:
    'After a mismatch, the naive search throws away everything it learned and slides the pattern one place. But the characters that just matched are characters of the pattern, so the pattern already knows how much of itself is repeated. Precompute, for each position, the longest prefix that is also a suffix. On a mismatch, jump the pattern forward by that much and leave the text pointer exactly where it is.',
  useWhen:
    'Substring search where you cannot backtrack, usually because the text is a stream, or where the pattern has repeated structure that makes naive matching quadratic. In an interview it is more often a recognition question than an implementation one, so being able to explain the lps table is worth more than writing it.',
  pitfall:
    'The lps table itself, which is built by running the pattern against itself and is where almost every bug lives. Also knowing when not to use it: for one search over ordinary text, the built-in indexOf is optimised and simpler, and Rabin-Karp is the better answer when you need to search for many patterns at once.',
  complexity: { time: 'O(n + m)', space: 'O(m)' },
  code,
  inputs: [
    { name: 'text', label: 'text', kind: 'text', value: 'ababcabcabababd' },
    { name: 'pattern', label: 'pattern', kind: 'text', value: 'ababd' },
  ],
  run,
}
