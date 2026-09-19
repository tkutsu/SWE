/** Runs every algorithm on its default input and checks the frames are sane. */
import { algorithms, byId } from '../src/algorithms'
import { roadmap } from '../src/lib/roadmap'

let failures = 0
const fail = (msg: string) => {
  console.error(`  FAIL ${msg}`)
  failures++
}

console.log('== traces ==')
for (const algo of algorithms) {
  const lineCount = algo.code.split('\n').length
  const input = Object.fromEntries(algo.inputs.map((f) => [f.name, f.value]))
  let frames = 0
  let sawResult = false

  try {
    for (const f of algo.run(input)) {
      frames++
      const lines = Array.isArray(f.line) ? f.line : [f.line]
      for (const l of lines) {
        if (l < 1 || l > lineCount) fail(`${algo.id} frame ${frames} points at line ${l}, code has ${lineCount}`)
      }
      if (!f.note || f.note.length < 10) fail(`${algo.id} frame ${frames} has no useful note`)
      if (!f.views || f.views.length === 0) fail(`${algo.id} frame ${frames} has no views`)
      if (f.result) sawResult = true
      if (frames > 5000) {
        fail(`${algo.id} did not terminate within 5000 frames`)
        break
      }
    }
  } catch (e) {
    fail(`${algo.id} threw: ${e instanceof Error ? e.message : String(e)}`)
  }

  if (frames === 0) fail(`${algo.id} produced no frames`)
  if (!sawResult) fail(`${algo.id} never set a result`)
  console.log(`  ${algo.id.padEnd(22)} ${String(frames).padStart(4)} frames, ${lineCount} code lines`)
}

console.log('\n== structure ==')
{
  const ranks = algorithms.map((a) => a.rank)
  if (new Set(ranks).size !== ranks.length) fail('two algorithms share a rank')
  const ids = algorithms.map((a) => a.id)
  if (new Set(ids).size !== ids.length) fail('two algorithms share an id')
  for (const item of roadmap) {
    if (!item.algoId) continue
    const found = byId(item.algoId)
    if (!found) fail(`roadmap rank ${item.rank} points at "${item.algoId}", which does not exist`)
    else if (found.rank !== item.rank) fail(`roadmap rank ${item.rank} points at ${found.id}, which claims rank ${found.rank}`)
    else if (found.tier !== item.tier) fail(`${found.id} tier disagrees between roadmap and module`)
  }
  const unlinked = algorithms.filter((a) => !roadmap.some((r) => r.algoId === a.id))
  if (unlinked.length) fail(`not reachable from the sidebar: ${unlinked.map((a) => a.id).join(', ')}`)
  for (const a of algorithms) {
    for (const field of ['idea', 'useWhen', 'pitfall'] as const) {
      if (a[field].length < 40) fail(`${a.id} has a thin "${field}"`)
    }
  }
  console.log(`  ${algorithms.length} algorithms, ${roadmap.filter((r) => r.algoId).length} of ${roadmap.length} roadmap rows wired up`)
}

console.log('\n== bad input is rejected, not crashed on ==')
const bad: [string, Record<string, string | number>][] = [
  ['two-sum', { nums: '', target: 9 }],
  ['two-sum', { nums: '1, abc', target: 9 }],
  ['sliding-window', { s: '' }],
  ['bfs-grid', { grid: '....\n....' }],
  ['bfs-grid', { grid: 'S..\n..E.' }],
  ['backtracking-subsets', { nums: '1, 2, 3, 4, 5' }],
  ['min-heap', { values: '1, 2, 3', extract: 9 }],
  ['coin-change', { coins: '0', amount: 5 }],
  ['edit-distance', { a: 'elephantine', b: 'ros' }],
  ['merge-intervals', { intervals: 'nonsense' }],
  ['topological-sort', { edges: 'A--B' }],
  ['dijkstra', { edges: 'A-B:0', start: 'A' }],
  ['dijkstra', { edges: 'A-B:3', start: 'Z' }],
  ['union-find', { n: 3, edges: '0-9' }],
  ['trie', { words: 'cat, 42', query: 'cat' }],
  ['quickselect', { nums: '1, 2, 3', k: 9 }],
  ['matrix-rotate', { n: 99 }],
  ['lru-cache', { capacity: 3, ops: 'frobnicate x' }],
  ['reservoir-sampling', { stream: '1, 2, 3', k: 0, seed: 1 }],
  ['sieve', { n: 2 }],
  ['group-anagrams', { words: 'eat, tea9' }],
  ['bit-manipulation', { nums: '1, 2, 9999' }],
]
for (const [id, input] of bad) {
  const algo = byId(id)
  if (!algo) {
    fail(`bad-input case names "${id}", which does not exist`)
    continue
  }
  try {
    for (const _ of algo.run(input)) break
    fail(`${id} accepted bad input ${JSON.stringify(input)}`)
  } catch (e) {
    if (!(e instanceof Error) || !e.message) fail(`${id} threw a non-Error for ${JSON.stringify(input)}`)
  }
}
console.log(`  ${bad.length} malformed inputs, all rejected with a readable message`)

console.log('\n== answers ==')
const lastResult = (id: string, input: Record<string, string | number>) => {
  const algo = byId(id)!
  let out = ''
  for (const f of algo.run(input)) if (f.result) out = f.result
  return out
}

const expect = (label: string, got: string, want: string) => {
  if (got !== want) fail(`${label}: got "${got}", expected "${want}"`)
  else console.log(`  ${label.padEnd(34)} ${got}`)
}
const expectContains = (label: string, got: string, want: string) => {
  if (!got.includes(want)) fail(`${label}: got "${got}", expected it to contain "${want}"`)
  else console.log(`  ${label.padEnd(34)} ${got}`)
}

expectContains('two-sum finds the pair', lastResult('two-sum', { nums: '2, 7, 11, 15, 3, 6', target: 17 }), '= 17')
expect('binary-search hits', lastResult('binary-search', { nums: '1, 3, 5, 7, 9, 11', target: 7 }).split(',')[0], 'index 3')
expectContains('binary-search misses', lastResult('binary-search', { nums: '1, 3, 5, 7, 9, 11', target: 8 }), '-1')
expectContains('bfs finds shortest path', lastResult('bfs-grid', { grid: 'S..\n.#.\n..E' }), '4 steps')
expect('heap extracts sorted', lastResult('min-heap', { values: '5, 3, 8, 1, 9, 2, 7', extract: 7 }).replace(/^extracted /, '').replace(/, heap.*$/, ''), '1, 2, 3, 5, 7, 8, 9')
{
  const subsets = lastResult('backtracking-subsets', { nums: '1, 2, 3, 4' }).split('  ').filter(Boolean)
  if (subsets.length !== 16) fail(`subsets of 4 gave ${subsets.length}, expected 16`)
  else if (new Set(subsets).size !== 16) fail('subsets contains duplicates, the path copy is aliased')
  else console.log(`  ${'subsets of 4 are 16 and distinct'.padEnd(34)} ok`)
}
expect('inorder on a BST is sorted', lastResult('inorder-traversal', { values: '8, 3, 10, 1, 6, 14, 4, 7, 13' }), '1, 3, 4, 6, 7, 8, 10, 13, 14')
expect('coin change picks fewest', lastResult('coin-change', { coins: '1, 3, 4', amount: 6 }), '2 coins')
expectContains('coin change spots impossible', lastResult('coin-change', { coins: '5', amount: 3 }), '-1')
expect('edit distance horse to ros', lastResult('edit-distance', { a: 'horse', b: 'ros' }), '3 edits')
expect('merge sort sorts', lastResult('merge-sort', { nums: '5, 2, 8, 1, 9, 3' }), '1, 2, 3, 5, 8, 9')
expect('intervals merge', lastResult('merge-intervals', { intervals: '1,3  2,6  8,10  9,12  15,18' }), '[1, 6]  [8, 12]  [15, 18]')
expect('daily temperatures', lastResult('monotonic-stack', { temps: '73, 74, 75, 71, 69, 72, 76, 73' }), '1, 1, 4, 2, 1, 1, 0, 0')
expectContains('linked list reverses', lastResult('reverse-linked-list', { values: '1, 2, 3, 4, 5' }), '5 -> 4 -> 3 -> 2 -> 1')
expectContains('toposort spots a cycle', lastResult('topological-sort', { edges: 'A>B, B>C, C>A' }), 'cycle')
{
  // Every edge must be respected by the produced order.
  const order = lastResult('topological-sort', { edges: 'A>B, A>C, B>D, C>D, D>E, C>F, F>E' }).split(' -> ')
  const edges: [string, string][] = [['A','B'],['A','C'],['B','D'],['C','D'],['D','E'],['C','F'],['F','E']]
  const bad = edges.filter(([u, v]) => order.indexOf(u) > order.indexOf(v))
  if (order.length !== 6) fail(`toposort returned ${order.length} nodes, expected 6`)
  else if (bad.length) fail(`toposort violates ${bad.map(([u, v]) => `${u}->${v}`).join(', ')}`)
  else console.log(`  ${'toposort respects every edge'.padEnd(34)} ${order.join(' -> ')}`)
}
expect('union-find counts components', lastResult('union-find', { n: 7, edges: '0-1, 2-3, 1-2, 4-5, 0-3' }), '3 components')
expectContains('trie finds a stored word', lastResult('trie', { words: 'cat, car, card, dog', query: 'car' }), 'found')
expectContains('trie rejects a bare prefix', lastResult('trie', { words: 'card, dog', query: 'car' }), 'prefix, not a stored word')
expect('dijkstra distances', lastResult('dijkstra', { edges: 'A-B:4, A-C:2, C-B:1, B-D:5, C-D:8, D-E:2', start: 'A' }), 'A=0  B=3  C=2  D=8  E=10')
expectContains('xor isolates the loner', lastResult('bit-manipulation', { nums: '4, 1, 2, 1, 2' }), '4  (binary')
expectContains('prefix sums count subarrays', lastResult('prefix-sums', { nums: '3, 4, 7, 2, -3, 1, 4, 2', k: 7 }), '4 subarrays')
expectContains('quickselect 3rd smallest', lastResult('quickselect', { nums: '7, 2, 9, 4, 1, 8, 3', k: 3 }), '3rd smallest is 3')
expect('matrix rotates clockwise', lastResult('matrix-rotate', { n: 3 }), '7 4 1  |  8 5 2  |  9 6 3')
expectContains('smallest missing positive', lastResult('cyclic-sort', { nums: '3, 4, -1, 1' }), 'is 2')
expectContains('smallest missing when full', lastResult('cyclic-sort', { nums: '1, 2, 3' }), 'is 4')
expect('bst delete keeps order', lastResult('bst-delete', { values: '8, 3, 10, 1, 6, 14, 4, 7, 13', remove: 3 }), '1, 4, 6, 7, 8, 10, 13, 14')
expect('bst delete a leaf', lastResult('bst-delete', { values: '8, 3, 10, 1, 6', remove: 1 }), '3, 6, 8, 10')
{
  const got = lastResult('reservoir-sampling', { stream: '10, 20, 30, 40, 50, 60, 70, 80', k: 3, seed: 7 })
  const sample = got.split('  (')[0].split(', ')
  if (sample.length !== 3) fail(`reservoir returned ${sample.length} items, expected 3`)
  else if (new Set(sample).size !== 3) fail('reservoir returned a duplicate')
  else console.log(`  ${'reservoir keeps k distinct items'.padEnd(34)} ${sample.join(', ')}`)
}
expect('lru evicts least recent', lastResult('lru-cache', { capacity: 3, ops: 'put a=1, put b=2, put c=3, get a, put d=4, get b' }), 'd=4, a=1, c=3')
expect('inversions of a reversal', lastResult('count-inversions', { nums: '5, 4, 3, 2, 1' }), '10 inversions')
expect('inversions of sorted input', lastResult('count-inversions', { nums: '1, 2, 3, 4' }), '0 inversions')
expectContains('jump game reachable', lastResult('jump-game', { nums: '2, 3, 1, 1, 4' }), 'true')
expectContains('jump game blocked', lastResult('jump-game', { nums: '3, 2, 1, 0, 4' }), 'false')
expectContains('sieve to 30', lastResult('sieve', { n: 30 }), '10 primes: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29')
expect('anagrams group', lastResult('group-anagrams', { words: 'eat, tea, tan, ate, nat, bat' }), '[eat, tea, ate]  [tan, nat]  [bat]')

console.log(failures === 0 ? '\nall good' : `\n${failures} failure(s)`)
process.exit(failures === 0 ? 0 : 1)
