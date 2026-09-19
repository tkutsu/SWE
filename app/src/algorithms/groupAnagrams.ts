import type { Algorithm, MapEntry, Role, StepGen } from '../engine/types'

const code = `function groupAnagrams(words) {
  const groups = new Map()
  for (const word of words) {
    const key = [...word].sort().join('')
    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key).push(word)
  }
  return [...groups.values()]
}`

function* run(input: Record<string, string | number>): StepGen {
  const words = String(input.words)
    .split(/[\s,]+/)
    .map((w) => w.trim().toLowerCase())
    .filter(Boolean)
  if (words.length === 0) throw new Error('Give it some words, like eat, tea, tan, ate, nat, bat.')
  if (words.length > 10) throw new Error('Keep it to 10 words.')
  for (const w of words) if (!/^[a-z]+$/.test(w)) throw new Error(`"${w}" has characters other than letters.`)

  const groups = new Map<string, string[]>()

  const entries = (highlight?: string): MapEntry[] =>
    [...groups.entries()].map(([key, list]) => ({
      key,
      value: list.join(', '),
      role: key === highlight ? ('active' as Role) : ('match' as Role),
    }))

  const views = (i: number, highlight?: string, keyCells?: string[]) => [
    {
      kind: 'array' as const,
      label: 'words',
      cells: words.map((w, k) => ({
        value: w,
        role: (k === i ? 'active' : k < i ? 'excluded' : 'idle') as Role,
        sub: ' ',
      })),
    },
    ...(keyCells
      ? [
          {
            kind: 'array' as const,
            label: 'letters of the current word, sorted into the key',
            cells: keyCells.map((c) => ({ value: c, role: 'compare' as Role, sub: ' ' })),
          },
        ]
      : []),
    { kind: 'map' as const, label: 'signature to the words that share it', entries: entries(highlight), empty: 'empty' },
  ]

  yield {
    line: 2,
    note:
      'Comparing every word against every other is O(n squared) comparisons. Instead, give each word a signature that is identical for anagrams and different otherwise, then group by it. Sorting the letters is the simplest such signature: anagrams are by definition the same multiset of letters, so they sort to the same string.',
    views: views(-1),
    vars: { words: words.length },
  }

  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    const sorted = [...word].sort()
    const key = sorted.join('')

    yield {
      line: [3, 4],
      note: `"${word}" sorts to "${key}". Every anagram of "${word}" produces exactly this string, and nothing else does.`,
      views: views(i, undefined, sorted),
      vars: { word, signature: key },
    }

    const isNew = !groups.has(key)
    if (isNew) groups.set(key, [])
    groups.get(key)!.push(word)

    yield {
      line: isNew ? [5, 6, 7, 8] : 8,
      note: isNew
        ? `No group for "${key}" yet, so start one and put "${word}" in it.`
        : `"${key}" already has a group holding ${groups.get(key)!.slice(0, -1).join(', ')}. Add "${word}" to it. One map lookup, no comparison against any other word.`,
      views: views(i, key),
      vars: { word, signature: key, 'new group': isNew, groups: groups.size },
    }
  }

  const result = [...groups.values()]
  yield {
    line: 10,
    note: `${result.length} group${result.length === 1 ? '' : 's'} from ${words.length} words, in one pass. The sorting of each word costs k log k where k is the word length, which is why the total is n times k log k rather than plain n. Counting letters into a 26 slot array instead of sorting brings it down to n times k, which is the follow-up optimisation worth mentioning.`,
    views: views(words.length),
    vars: { groups: result.length },
    result: result.map((g) => `[${g.join(', ')}]`).join('  '),
  }
}

export const groupAnagrams: Algorithm = {
  id: 'group-anagrams',
  name: 'Strings: group anagrams',
  rank: 30,
  tier: 4,
  blurb: 'Give each word a canonical signature, then group by it in a hash map.',
  realWorld:
    'Deduplicating files by hashing their contents, so identical files group together whatever they are named. Search engines normalise a query to a canonical form before looking it up for exactly the same reason.',
  idea:
    'Rather than comparing words to each other, map each word to something that is identical for all its anagrams. Sorting the letters does it, since anagrams are the same letters in a different order. Then a hash map does the grouping in one pass, and no word is ever compared to another word directly. The general move, canonicalise then group, solves a whole family of problems.',
  useWhen:
    'Group anagrams, valid anagram, finding duplicate files by content, grouping shifted strings. Any time the question is "which of these are equivalent under some transformation", find the canonical form of that transformation.',
  pitfall:
    'Stopping at the sort. The interviewer will usually ask for better, and the answer is to count letters into a fixed 26 element array and use that as the key, which drops the log factor. Also, sorting mutates in JavaScript, so spread the string before sorting rather than sorting something you still need.',
  complexity: { time: 'O(n * k log k), or O(n * k) with letter counts', space: 'O(n * k)' },
  code,
  inputs: [{ name: 'words', label: 'words', kind: 'text', value: 'eat, tea, tan, ate, nat, bat', hint: 'max 10, letters only' }],
  run,
}
