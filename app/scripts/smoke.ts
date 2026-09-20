/** Runs every algorithm on its default input and checks the frames are sane. */
import { loadAllAlgorithms } from '../src/algorithms/registry'
import { conceptIndex } from '../src/lib/conceptIndex'
import { conceptGroups, findConcept } from '../src/lib/concepts'
import { conceptVisuals } from '../src/lib/conceptVisuals'
import { guideGroups } from '../src/lib/guides'
import { tonesUsed, type Visual } from '../src/lib/visual'
import { guideIndex } from '../src/lib/guidesIndex'
import { INTERVIEW_CONCEPT_GROUPS } from '../src/lib/sections'
import { allRoadmapItems, roadmap, sortingExtras } from '../src/lib/roadmap'
import type { Algorithm } from '../src/engine/types'

const algorithms: Algorithm[] = await loadAllAlgorithms()
const byId = (id: string): Algorithm | undefined => algorithms.find((a) => a.id === id)

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
  for (const item of allRoadmapItems) {
    if (!item.algoId) continue
    const found = byId(item.algoId)
    if (!found) fail(`roadmap rank ${item.rank} points at "${item.algoId}", which does not exist`)
    else if (found.rank !== item.rank) fail(`roadmap rank ${item.rank} points at ${found.id}, which claims rank ${found.rank}`)
    else if (found.tier !== item.tier) fail(`${found.id} tier disagrees between roadmap and module`)
  }
  const unlinked = algorithms.filter((a) => !allRoadmapItems.some((r) => r.algoId === a.id))
  if (unlinked.length) fail(`not reachable from the sidebar: ${unlinked.map((a) => a.id).join(', ')}`)
  for (const a of algorithms) {
    for (const field of ['idea', 'useWhen', 'pitfall', 'realWorld'] as const) {
      if (a[field].length < 40) fail(`${a.id} has a thin "${field}"`)
    }
  }
  const vague = algorithms.filter((a) => !/[A-Z]|\d/.test(a.realWorld.slice(1)))
  if (vague.length) fail(`realWorld names nothing concrete for: ${vague.map((a) => a.id).join(', ')}`)
  if (roadmap.length !== 30) fail(`the priority list should be 30 rows, found ${roadmap.length}`)
  if (roadmap.some((r) => r.rank > 100)) fail('a sorting extra leaked into the ranked priority list')
  if (sortingExtras.some((r) => !r.algoId)) fail('a sorting extra has no algorithm behind it')
  console.log(`  ${algorithms.length} algorithms: ${roadmap.filter((r) => r.algoId).length} ranked, ${sortingExtras.length} extra sorts`)
  console.log(`  every realWorld note names a real system`)

  // Concepts
  const cids = conceptGroups.flatMap((g) => g.concepts.map((c) => c.id))
  if (new Set(cids).size !== cids.length) fail('two concepts share an id')
  for (const id of cids) if (!findConcept(id)) fail(`concept "${id}" is not findable by id`)
  for (const g of conceptGroups) {
    if (g.concepts.length === 0) fail(`concept group "${g.name}" is empty`)
    for (const c of g.concepts) {
      if (c.answer.length < 60) fail(`concept "${c.id}" has a thin answer`)
      if (!c.question.trim()) fail(`concept "${c.id}" has no question`)
    }
  }
  // Answers should be general technical explanations. A date, a company name or
  // a first-person anecdote means something specific to one person got through.
  const PERSONAL = /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.? ?20\d\d\b|\bmy (?:interview|employer|manager|company)\b|\bi was asked\b/i
  const leaked = conceptGroups.flatMap((g) => g.concepts).filter((c) => PERSONAL.test(`${c.question} ${c.answer}`))
  if (leaked.length) fail(`something specific to one person got into: ${leaked.map((c) => c.id).join(', ')}`)
  const noVisual = cids.filter((id) => !conceptVisuals[id])
  if (noVisual.length) fail(`no diagram for: ${noVisual.join(', ')}`)
  const orphanVisual = Object.keys(conceptVisuals).filter((id) => !cids.includes(id))
  if (orphanVisual.length) fail(`diagram for a concept that no longer exists: ${orphanVisual.join(', ')}`)
  for (const [id, v] of Object.entries(conceptVisuals)) {
    // A flow edge pointing at a node that is not there renders as a silent gap.
    if (v.kind === 'flow') {
      const nodeIds = new Set(v.nodes.map((n) => n.id))
      for (const e of v.edges) {
        if (!nodeIds.has(e.from) || !nodeIds.has(e.to)) fail(`${id}: flow edge ${e.from}->${e.to} names a missing node`)
      }
    }
    if (v.kind === 'timeline') {
      for (const lane of v.lanes) {
        for (const e of lane.events) {
          if (e.at < 0 || e.at > v.span) fail(`${id}: timeline event at ${e.at} is outside the span of ${v.span}`)
        }
      }
    }
    if (v.kind === 'table') {
      for (const row of v.rows) {
        if (row.length !== v.head.length) fail(`${id}: a table row has ${row.length} cells but the head has ${v.head.length}`)
      }
    }
  }
  // Guides
  const gids = guideGroups.flatMap((g) => g.guides.map((x) => x.id))
  if (new Set(gids).size !== gids.length) fail('two guides share an id')
  if (gids.some((id) => cids.includes(id))) fail('a guide and a concept share an id')
  for (const group of guideGroups) {
    if (group.guides.length === 0) fail(`guide group "${group.name}" is empty`)
    for (const g of group.guides) {
      if (!g.blurb || g.blurb.length < 30) fail(`guide "${g.id}" has a thin blurb`)
      if (g.sections.length === 0) fail(`guide "${g.id}" has no sections`)
      for (const sec of g.sections) {
        if (!sec.heading.trim()) fail(`guide "${g.id}" has a section with no heading`)
        if (!sec.body && (!sec.items || sec.items.length === 0)) {
          fail(`guide "${g.id}" section "${sec.heading}" has neither body nor items`)
        }
      }
      if (g.visual?.kind === 'flow') {
        const ids = new Set(g.visual.nodes.map((n) => n.id))
        for (const e of g.visual.edges) {
          if (!ids.has(e.from) || !ids.has(e.to)) fail(`guide "${g.id}": flow edge ${e.from}->${e.to} names a missing node`)
        }
      }
    }
  }
  const withVisual = guideGroups.flatMap((g) => g.guides).filter((g) => g.visual).length
  console.log(`  ${gids.length} guides across ${guideGroups.length} groups, ${withVisual} with a diagram`)

  // The light indexes drive the sidebar, so drift there means a dead nav entry.
  const fullConcepts = conceptGroups.flatMap((g) => g.concepts.map((c) => c.id))
  const idxConcepts = conceptIndex.flatMap((g) => g.concepts.map((c) => c.id))
  if (JSON.stringify(fullConcepts) !== JSON.stringify(idxConcepts)) {
    fail('conceptIndex has drifted from concepts.ts, regenerate with scripts/build-concepts.py')
  }
  for (const g of conceptIndex) {
    for (const c of g.concepts) {
      const full = findConcept(c.id)
      if (full && full.concept.question !== c.question) fail(`conceptIndex question for "${c.id}" does not match`)
    }
  }
  const fullGuides = guideGroups.flatMap((g) => g.guides.map((x) => `${x.id}|${x.title}`))
  const idxGuides = guideIndex.flatMap((g) => g.guides.map((x) => `${x.id}|${x.title}`))
  if (JSON.stringify(fullGuides) !== JSON.stringify(idxGuides)) {
    fail('guidesIndex has drifted from guides.ts, they must list the same ids and titles in the same order')
  }
  if (JSON.stringify(conceptIndex.map((g) => g.id)) !== JSON.stringify(conceptGroups.map((g) => g.id))) {
    fail('conceptIndex groups do not match concepts.ts')
  }
  if (JSON.stringify(guideIndex.map((g) => g.id)) !== JSON.stringify(guideGroups.map((g) => g.id))) {
    fail('guidesIndex groups do not match guides.ts')
  }
  console.log(`  light indexes match their full data`)

  for (const id of INTERVIEW_CONCEPT_GROUPS) {
    if (!conceptIndex.some((g) => g.id === id)) {
      fail(`INTERVIEW_CONCEPT_GROUPS names "${id}", which is not a concept group`)
    }
  }
  const interviewCount = conceptIndex.filter((g) => INTERVIEW_CONCEPT_GROUPS.includes(g.id)).length
  console.log(`  ${conceptIndex.length - interviewCount} subject groups, ${interviewCount + guideIndex.length} under Interview`)

  // Colour has to carry judgement. A list where every item is the same
  // non-neutral tone is decoration pretending to be signal.
  const itemTones = (v: Visual): string[] => {
    if (v.kind === 'compare') return v.columns.map((c) => c.tone ?? 'neutral')
    if (v.kind === 'boxes') return v.items.map((i) => i.tone ?? 'neutral')
    if (v.kind === 'stack') return v.layers.map((l) => l.tone ?? 'neutral')
    return []
  }
  const allVisuals: [string, Visual][] = [
    ...Object.entries(conceptVisuals),
    ...guideGroups.flatMap((g) => g.guides.filter((x) => x.visual).map((x) => [x.id, x.visual!] as [string, Visual])),
  ]
  for (const [id, v] of allVisuals) {
    const tones = itemTones(v)
    if (tones.length >= 3 && new Set(tones).size === 1 && tones[0] !== 'neutral') {
      fail(`${id}: every item is "${tones[0]}", so the colour says nothing. Use neutral.`)
    }
    // venn and triangle carry their own highlighting and have no tones by design.
    if (v.kind !== 'venn' && v.kind !== 'triangle' && tonesUsed(v).size === 0) {
      fail(`${id}: no tones at all`)
    }
  }
  console.log(`  ${allVisuals.length} diagrams, none using colour as decoration`)

  const shapes = new Set(Object.values(conceptVisuals).map((v) => v.kind))
  console.log(`  ${cids.length} concepts across ${conceptGroups.length} groups, all general`)
  console.log(`  every concept has a diagram, ${shapes.size} shapes in use`)
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
expect('quicksort sorts', lastResult('quick-sort', { nums: '5, 2, 8, 1, 9, 3' }), '1, 2, 3, 5, 8, 9')
expect('quicksort on sorted input', lastResult('quick-sort', { nums: '1, 2, 3, 4, 5' }), '1, 2, 3, 4, 5')
expect('insertion sort sorts', lastResult('insertion-sort', { nums: '5, 2, 8, 1, 9' }), '1, 2, 5, 8, 9')
expect('selection sort sorts', lastResult('selection-sort', { nums: '5, 2, 8, 1, 9' }), '1, 2, 5, 8, 9')
expect('bubble sort sorts', lastResult('bubble-sort', { nums: '5, 2, 8, 1' }), '1, 2, 5, 8')
expect('bubble sort exits early', lastResult('bubble-sort', { nums: '1, 2, 3, 4' }), '1, 2, 3, 4')
expect('heapsort sorts', lastResult('heap-sort', { nums: '5, 2, 8, 1, 9, 3' }), '1, 2, 3, 5, 8, 9')
expect('counting sort sorts', lastResult('counting-sort', { nums: '4, 2, 2, 8, 3, 3, 1' }), '1, 2, 2, 3, 3, 4, 8')
expect('radix sort sorts', lastResult('radix-sort', { nums: '170, 45, 75, 90, 2, 802, 24' }), '2, 24, 45, 75, 90, 170, 802')
{
  // Every sort must agree on the same shuffled input.
  const input = '9, 1, 8, 2, 7, 3'
  const want = '1, 2, 3, 7, 8, 9'
  for (const id of ['merge-sort', 'quick-sort', 'insertion-sort', 'selection-sort', 'heap-sort']) {
    const got = lastResult(id, { nums: input })
    if (got !== want) fail(`${id} gave "${got}" for ${input}, expected "${want}"`)
  }
  console.log(`  ${'all comparison sorts agree'.padEnd(34)} ${want}`)
}
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
