import type { Algorithm, GraphEdge, GraphNode, Role, StepGen } from '../engine/types'

const code = `function insert(root, word) {
  let node = root
  for (const ch of word) {
    if (!node.children[ch]) {
      node.children[ch] = newNode()
    }
    node = node.children[ch]
  }
  node.isWord = true
}

function search(root, word) {
  let node = root
  for (const ch of word) {
    if (!node.children[ch]) return false
    node = node.children[ch]
  }
  return node.isWord
}`

type TrieNode = { id: string; ch: string; children: Record<string, string>; isWord: boolean; depth: number }

function* run(input: Record<string, string | number>): StepGen {
  const words = String(input.words)
    .split(/[\s,]+/)
    .map((w) => w.trim().toLowerCase())
    .filter(Boolean)
  if (words.length === 0) throw new Error('Give it some words, like cat, car, card, dog.')
  if (words.length > 6) throw new Error('Keep it to 6 words so the trie fits on screen.')
  for (const w of words) {
    if (!/^[a-z]+$/.test(w)) throw new Error(`"${w}" has characters other than letters.`)
    if (w.length > 6) throw new Error(`"${w}" is longer than 6 letters, which makes the trie too deep.`)
  }
  const query = String(input.query).trim().toLowerCase()
  if (!query) throw new Error('Give it a word to search for.')

  const nodes: Record<string, TrieNode> = {
    root: { id: 'root', ch: '*', children: {}, isWord: false, depth: 0 },
  }

  /** x from a left-to-right walk of the leaves, y from depth. Same idea as the tree layout. */
  const layout = (): Record<string, { x: number; y: number }> => {
    const pos: Record<string, { x: number; y: number }> = {}
    let col = 0
    const walk = (id: string) => {
      const kids = Object.keys(nodes[id].children).sort()
      if (kids.length === 0) {
        pos[id] = { x: col++, y: nodes[id].depth }
        return
      }
      const xs: number[] = []
      for (const k of kids) {
        walk(nodes[id].children[k])
        xs.push(pos[nodes[id].children[k]].x)
      }
      pos[id] = { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: nodes[id].depth }
    }
    walk('root')
    return pos
  }

  const gNodes = (roles: Record<string, Role> = {}): GraphNode[] => {
    const pos = layout()
    return Object.values(nodes).map((n) => ({
      id: n.id,
      label: n.ch,
      x: pos[n.id].x,
      y: pos[n.id].y,
      role: roles[n.id] ?? (n.isWord ? 'match' : 'idle'),
      sub: n.isWord ? 'word' : undefined,
    }))
  }

  const gEdges = (roles: Record<string, Role> = {}): GraphEdge[] =>
    Object.values(nodes).flatMap((n) =>
      Object.entries(n.children).map(([, child]) => ({
        from: n.id,
        to: child,
        role: roles[child] ?? 'idle',
        directed: false,
      })),
    )

  const views = (nodeRoles: Record<string, Role> = {}, edgeRoles: Record<string, Role> = {}) => [
    { kind: 'graph' as const, label: 'trie (green means a word ends here)', nodes: gNodes(nodeRoles), edges: gEdges(edgeRoles) },
  ]

  yield {
    line: 1,
    note:
      'A trie stores words by their letters, not as whole strings. Words sharing a prefix share the path for it, so "car" and "card" walk the same three nodes before diverging. Lookup costs the length of the word and does not care how many words are stored.',
    views: views({ root: 'active' }),
    vars: { 'words to insert': words.join(', ') },
  }

  for (const word of words) {
    let cur = 'root'
    yield {
      line: [1, 2],
      note: `Insert "${word}". Start at the root and walk down one letter at a time.`,
      views: views({ root: 'active' }),
      vars: { inserting: word },
    }

    for (let i = 0; i < word.length; i++) {
      const ch = word[i]
      const existing = nodes[cur].children[ch]

      if (existing) {
        cur = existing
        yield {
          line: [3, 7],
          note: `"${ch}" already hangs off this node, shared with a word inserted earlier. Walk into it rather than creating anything. This sharing is the whole reason a trie saves space on a dictionary.`,
          views: views({ [cur]: 'active' }, { [cur]: 'compare' }),
          vars: { inserting: word, at: word.slice(0, i + 1), created: false },
        }
      } else {
        const id = `${cur}/${ch}${i}`
        nodes[id] = { id, ch, children: {}, isWord: false, depth: nodes[cur].depth + 1 }
        nodes[cur].children[ch] = id
        cur = id
        yield {
          line: [4, 5, 6, 7],
          note: `No "${ch}" branch here yet, so create one. The path from the root now spells "${word.slice(0, i + 1)}".`,
          views: views({ [cur]: 'active' }, { [cur]: 'match' }),
          vars: { inserting: word, at: word.slice(0, i + 1), created: true },
        }
      }
    }

    nodes[cur].isWord = true
    yield {
      line: 9,
      note: `Mark the last node as the end of a word. Without this flag the trie cannot tell "car" from the prefix of "card", and every prefix would look like a stored word.`,
      views: views({ [cur]: 'match' }),
      vars: { inserted: word },
    }
  }

  yield {
    line: 12,
    note: `All ${words.length} words are in. Now search for "${query}", following exactly the same walk.`,
    views: views({ root: 'active' }),
    vars: { searching: query },
  }

  let cur = 'root'
  for (let i = 0; i < query.length; i++) {
    const ch = query[i]
    const next = nodes[cur].children[ch]
    if (!next) {
      yield {
        line: [14, 15],
        note: `No "${ch}" branch from here, so no stored word starts with "${query.slice(0, i + 1)}". The search stops now, after ${i + 1} step${i === 0 ? '' : 's'}, without touching the rest of the trie.`,
        views: views({ [cur]: 'excluded' }),
        vars: { searching: query, 'stuck after': query.slice(0, i), found: false },
        result: `"${query}" not found`,
      }
      return
    }
    cur = next
    yield {
      line: [15, 16],
      note: `Follow "${ch}". Now sitting on the node for "${query.slice(0, i + 1)}".`,
      views: views({ [cur]: 'active' }, { [cur]: 'compare' }),
      vars: { searching: query, at: query.slice(0, i + 1) },
    }
  }

  const found = nodes[cur].isWord
  yield {
    line: 18,
    note: found
      ? `Reached the end of "${query}" and the node is flagged as a word, so it was stored. The lookup took ${query.length} steps regardless of how many words the trie holds.`
      : `Reached the end of "${query}", but this node is not flagged as a word. "${query}" is a prefix of something stored, not a stored word itself. This is the distinction the flag exists for, and it is what separates search from startsWith.`,
    views: views({ [cur]: found ? 'match' : 'compare' }),
    vars: { searching: query, 'is a stored word': found },
    result: found ? `"${query}" found` : `"${query}" is a prefix, not a stored word`,
  }
}

export const trie: Algorithm = {
  id: 'trie',
  name: 'Trie (prefix tree)',
  rank: 17,
  tier: 3,
  blurb: 'Words stored as paths of letters, so shared prefixes are stored once.',
  realWorld:
    'The dropdown under a search box is a trie walk. Routers do longest prefix matching on IP addresses with one, and T9 on old phone keypads was the same structure.',
  idea:
    'Each edge is a letter and each path from the root spells a prefix. Words that start the same share nodes, so a dictionary of similar words collapses into a compact tree. Lookup walks one node per character, so it costs the length of the query and is completely independent of how many words are stored. A boolean on each node marks where a real word ends, which is what lets the structure distinguish a stored word from a mere prefix.',
  useWhen:
    'Autocomplete, spell check, prefix search, word games, and IP routing tables. Also whenever a problem repeatedly asks "which stored strings start with this", where a hash map of whole words cannot help you.',
  pitfall:
    'Leaving out the end-of-word flag. Without it every prefix looks like a stored word, so searching for "car" in a trie holding only "card" wrongly returns true. It is the single most common trie bug.',
  complexity: { time: 'O(length of the word) for insert and search', space: 'O(total characters)' },
  code,
  inputs: [
    { name: 'words', label: 'insert these', kind: 'text', value: 'cat, car, card, dog', hint: 'max 6 words, letters only' },
    { name: 'query', label: 'then search for', kind: 'text', value: 'car', hint: 'try "ca" to see the prefix case' },
  ],
  run,
}
