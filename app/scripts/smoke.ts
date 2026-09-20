/** Runs every algorithm on its default input and checks the frames are sane. */
import { algorithms, byId } from '../src/algorithms'
import { conceptGroups, findConcept } from '../src/lib/concepts'
import { conceptVisuals } from '../src/lib/conceptVisuals'
import { guideGroups } from '../src/lib/guides'
import { MAPS, TRACKS, curriculum, curriculumItems } from '../src/lib/curriculum'
import { labels } from '../src/lib/labels'
import { minutes } from '../src/lib/minutes'
import { conceptHooks } from '../src/lib/conceptHooks'
import { followUps } from '../src/lib/followUps'
import { intros } from '../src/lib/intros'
import { related } from '../src/lib/related'
import { scenarios } from '../src/lib/scenarios'
import { lazyAlgorithms } from '../src/algorithms/lazy'
import { practice } from '../src/lib/practice'
import { problemMeta } from '../src/lib/practiceMeta'
import { tonesUsed, type Visual } from '../src/lib/visual'


let failures = 0
const fail = (msg: string) => {
  console.error(`  FAIL ${msg}`)
  failures++
}

/** Monospace at 10px, the size every label in these drawings is set in. */
const monoW = (s: string) => s.length * 6

/**
 * Everything that can go wrong in a drawing without anyone noticing, since
 * nothing here throws: an edge to a node that is not there renders as a silent
 * gap, and a label longer than the space it sits in renders on top of whatever
 * is behind it. Thirty-nine edge labels across twenty pages were clipped this
 * way and every one of them read as a shorter, wrong word.
 */
function checkVisual(id: string, v: Visual) {
  if (v.kind === 'flow') {
    const nodeIds = new Set(v.nodes.map((n) => n.id))
    for (const e of v.edges) {
      if (!nodeIds.has(e.from) || !nodeIds.has(e.to)) fail(`${id}: flow edge ${e.from}->${e.to} names a missing node`)
      // The column gap grows to fit a label, so a long one does not overlap
      // any more; it stretches the drawing until the text is small instead.
      if (e.label && e.label.length > 16) fail(`${id}: flow edge label "${e.label}" is too long to sit between two boxes`)
    }
  }
  if (v.kind === 'timeline') {
    // The axis stretches to fit the tightest bar, up to the point where
    // stretching starts shrinking the whole drawing. Past that, text is cut.
    const wanted = v.lanes.flatMap((l) => l.events.filter((e) => e.width).map((e) => ((monoW(e.label) + 14) * v.span) / e.width!))
    const plot = Math.min(760, Math.max(498, ...wanted))
    for (const lane of v.lanes) {
      for (const e of lane.events) {
        if (e.at < 0 || e.at > v.span) fail(`${id}: timeline event at ${e.at} is outside the span of ${v.span}`)
        if (e.width && monoW(e.label) + 12 > (e.width / v.span) * plot) {
          fail(`${id}: timeline label "${e.label}" does not fit its bar and would be cut`)
        }
      }
    }
  }
  if (v.kind === 'table') {
    for (const row of v.rows) {
      if (row.length !== v.head.length) fail(`${id}: a table row has ${row.length} cells but the head has ${v.head.length}`)
    }
  }
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
  const ids = algorithms.map((a) => a.id)
  if (new Set(ids).size !== ids.length) fail('two algorithms share an id')
  for (const a of algorithms) {
    for (const field of ['idea', 'useWhen', 'pitfall', 'realWorld'] as const) {
      if (a[field].length < 40) fail(`${a.id} has a thin "${field}"`)
    }
  }
  const vague = algorithms.filter((a) => !/[A-Z]|\d/.test(a.realWorld.slice(1)))
  if (vague.length) fail(`realWorld names nothing concrete for: ${vague.map((a) => a.id).join(', ')}`)
  console.log(`  ${algorithms.length} algorithms, every realWorld note naming a real system`)

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
  for (const [id, v] of Object.entries(conceptVisuals).flatMap(([k, val]) =>
    (Array.isArray(val) ? val : [val]).map((x) => [k, x] as [string, Visual]),
  )) {
    checkVisual(id, v)
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
      for (const v of Array.isArray(g.visual) ? g.visual : g.visual ? [g.visual] : []) {
        checkVisual(`guide "${g.id}"`, v)
      }
    }
  }
  // The curriculum is the only ordering, so anything missing from it is
  // unreachable and anything extra points at something that no longer exists.
  {
    const have: Record<string, Set<string>> = {
      algo: new Set(algorithms.map((x) => x.id)),
      concept: new Set(conceptGroups.flatMap((g) => g.concepts.map((x) => x.id))),
      guide: new Set(guideGroups.flatMap((g) => g.guides.map((x) => x.id))),
    }
    // The maps sit outside the reading order, so they are reachable through
    // the pinned block rather than through the curriculum. They still have to
    // name something the shell can render.
    for (const id of MAPS) if (!(`page:${id}` in labels)) fail(`map "${id}" has no label, so the sidebar cannot name it`)
    const seen = new Set<string>()
    for (const i of curriculumItems) {
      const key = `${i.kind}:${i.id}`
      if (seen.has(key)) fail(`curriculum lists ${key} twice`)
      seen.add(key)
      if (!have[i.kind]?.has(i.id)) fail(`curriculum lists ${key}, which does not exist`)
    }
    for (const [kind, ids] of Object.entries(have)) {
      for (const id of ids) if (!seen.has(`${kind}:${id}`)) fail(`${kind}:${id} is not in the curriculum, so nothing links to it`)
    }
    for (const t of curriculum) if (t.items.length === 0) fail(`curriculum topic "${t.name}" is empty`)

    // A phase or a track whose topics are not contiguous renders its heading
    // twice and reads as two different things with the same name.
    const contiguous = (label: string, values: string[]) => {
      const firstSeen = new Map<string, number>()
      values.forEach((v, i) => { if (!firstSeen.has(v)) firstSeen.set(v, i) })
      let prev = -1
      for (const v of values) {
        const at = firstSeen.get(v) as number
        if (at < prev) fail(`${label} "${v}" is split: its topics are not contiguous`)
        prev = at
      }
      return firstSeen.size
    }
    const phaseCount = contiguous('phase', curriculum.map((t) => t.phase))
    const trackCount = contiguous('track', curriculum.map((t) => t.track))
    for (const t of curriculum) {
      if (!TRACKS.includes(t.track)) fail(`topic "${t.name}" claims track "${t.track}", which is not one of the four`)
    }

    // The whole point of the reading order: nothing appears before something
    // it needs. The old order claimed recursion came before quicksort and then
    // listed quicksort eighty rows earlier, because nothing checked.
    {
      const at = new Map<string, number>()
      curriculumItems.forEach((i, n) => at.set(`${i.kind}:${i.id}`, n))
      let edges = 0
      curriculumItems.forEach((item, n) => {
        const self = `${item.kind}:${item.id}`
        for (const need of item.needs ?? []) {
          edges++
          if (need === self) {
            fail(`${self} needs itself`)
            continue
          }
          const pos = at.get(need)
          if (pos === undefined) fail(`${self} needs "${need}", which is not in the curriculum`)
          else if (pos > n) fail(`${self} comes before "${need}", which it needs`)
        }
      })
      console.log(`  ${edges} prerequisites, every one of them satisfied before it is used`)
    }

    console.log(`  ${curriculumItems.length} items across ${curriculum.length} topics, ${phaseCount} phases, ${trackCount} tracks, all reachable`)
  }

  // Every page needs a way in. Nothing high-chance is allowed to open cold;
  // the rest is a warning, because the content job is ongoing and a warning
  // that stays visible is more use than a failing build nobody can green.
  {
    let warned = 0
    const hookFor = (kind: string, id: string): string | undefined => {
      if (kind === 'algo') return intros[id]?.scene
      if (kind === 'guide') return guideGroups.flatMap((g) => g.guides).find((x) => x.id === id)?.hook
      return findConcept(id)?.concept.hook ?? conceptHooks[id]
    }
    for (const item of curriculumItems) {
      const hook = hookFor(item.kind, item.id)
      if (hook && hook.length < 30) fail(`${item.kind}:${item.id} has a hook too thin to be one`)
      else if (!hook) {
        if (item.chance === 'high') fail(`${item.kind}:${item.id} is high chance and opens cold, with no hook`)
        else {
          console.log(`  WARN ${item.kind}:${item.id} has no hook`)
          warned++
        }
      }
    }
    for (const a of algorithms) if (!intros[a.id]) fail(`${a.id} has no intro, so its page opens on complexity`)
    for (const id of Object.keys(intros)) if (!byId(id)) fail(`intro for "${id}", which is not an algorithm`)
    for (const id of Object.keys(conceptHooks)) if (!findConcept(id)) fail(`hook for "${id}", which is not a concept`)

    /*
      Scenario frames are written by hand rather than produced by a generator,
      so the checks a trace gets for free have to be spelled out here. A note
      too short to teach anything, a frame with nothing drawn in it, or a line
      number pointing past the end of the snippet are all silent in the UI.
    */
    for (const [id, s] of Object.entries(scenarios)) {
      if (!findConcept(id)) fail(`scenario for "${id}", which is not a concept`)
      if (s.frames.length < 3) fail(`${id}: a scenario of ${s.frames.length} frames is a diagram with buttons`)
      const lineCount = s.code ? s.code.split('\n').length : 0
      s.frames.forEach((f, i) => {
        if (!f.note || f.note.length < 40) fail(`${id} frame ${i + 1} has no useful note`)
        if (!f.views.length) fail(`${id} frame ${i + 1} draws nothing`)
        for (const l of Array.isArray(f.line) ? f.line : [f.line]) {
          if (l < 0 || l > lineCount) fail(`${id} frame ${i + 1} points at line ${l}, the code has ${lineCount}`)
          if (l > 0 && !s.code) fail(`${id} frame ${i + 1} highlights a line but the scenario has no code`)
        }
      })
      if (!s.frames[s.frames.length - 1].result) fail(`${id}: the last frame does not say what happened`)
    }

    // A cost panel exists to show a gap. Two numbers the wrong way round, or
    // the same number twice, draws a picture that argues against the page.
    let withCost = 0
    for (const [id, intro] of Object.entries(intros)) {
      if (!intro.cost) continue
      withCost++
      const { naive, smart, unit } = intro.cost
      if (!(naive > smart)) fail(`${id}: cost claims ${naive} against ${smart}, which is not a win`)
      if (smart < 0 || !Number.isFinite(naive)) fail(`${id}: cost is not a pair of real counts`)
      if (unit.length < 10) fail(`${id}: cost unit "${unit}" does not say what is being counted`)
    }

    // Related links are hand-written, so a rename silently breaks them.
    for (const [id, keys] of Object.entries(related)) {
      if (!findConcept(id)) fail(`related lists "${id}", which is not a concept`)
      for (const key of keys) {
        if (!(key in labels)) fail(`${id} is related to "${key}", which does not exist`)
        if (key === `concept:${id}`) fail(`${id} is related to itself`)
      }
    }

    // Same rule as hooks: a high chance concept without them opens a strip
    // that is empty on the page people actually revise from.
    let noFollowUps = 0
    for (const id of Object.keys(followUps)) {
      if (!findConcept(id)) fail(`followUps lists "${id}", which is not a concept`)
      if (followUps[id].length === 0) fail(`followUps for "${id}" is empty; omit the key instead`)
      for (const q of followUps[id]) if (q.length < 15) fail(`${id}: "${q}" is too short to be a question`)
    }
    for (const item of curriculumItems) {
      if (item.kind !== 'concept') continue
      const has = followUps[item.id] || /^(?:Expect the follow-?up|They(?:'ll| will| often) ask)/im.test(findConcept(item.id)?.concept.answer ?? '')
      if (has) continue
      if (item.chance === 'high') fail(`concept:${item.id} is high chance and has no follow-up questions`)
      else noFollowUps++
    }

    console.log(`  every high chance item has a hook, ${warned} lower ones still without`)
    console.log(`  every high chance concept has follow-ups, ${noFollowUps} lower ones still without`)
    console.log(`  ${withCost} of ${algorithms.length} intros show the cost as two numbers`)
    console.log(`  ${Object.keys(related).length} concepts link onward, every target real`)
  }

  // The two generated indexes exist so the shell can name and reach everything
  // without importing it. Drift between them and the data is exactly what sank
  // the previous attempt at code splitting, so it is checked rather than hoped.
  {
    const expect: Record<string, string> = { 'page:router': 'Which pattern is this?', 'page:board': 'The complexity board' }
    for (const a of algorithms) expect[`algo:${a.id}`] = a.name
    for (const g of conceptGroups) for (const c of g.concepts) expect[`concept:${c.id}`] = c.question
    for (const g of guideGroups) for (const x of g.guides) expect[`guide:${x.id}`] = x.title
    for (const [k, v] of Object.entries(expect)) {
      if (!(k in labels)) fail(`labels is missing ${k}; rerun scripts/build-labels.ts`)
      else if (labels[k] !== v) fail(`labels has "${labels[k]}" for ${k}, the data says "${v}"`)
    }
    for (const k of Object.keys(labels)) if (!(k in expect)) fail(`labels names ${k}, which no longer exists`)

    for (const i of curriculumItems) {
      const key = `${i.kind}:${i.id}`
      if (!minutes[key]) fail(`no time estimate for ${key}; rerun scripts/build-labels.ts`)
    }
    for (const k of Object.keys(minutes)) if (!(k in labels)) fail(`minutes names ${k}, which no longer exists`)

    for (const a of algorithms) if (!lazyAlgorithms[a.id]) fail(`no lazy import for ${a.id}; rerun scripts/build-labels.ts`)
    for (const id of Object.keys(lazyAlgorithms)) if (!byId(id)) fail(`lazy import for ${id}, which is not an algorithm`)
    console.log(`  ${Object.keys(labels).length} labels and ${Object.keys(lazyAlgorithms).length} lazy imports, both in step`)
  }

  // Practice problems. The metadata is generated from the live problem list by
  // scripts/check-practice.py, so a slug missing from it is a slug that either
  // never existed or was renamed, and either way it is a dead link.
  {
    const entries = Object.entries(practice)
    for (const [algoId, problems] of entries) {
      if (!byId(algoId)) fail(`practice lists problems for "${algoId}", which is not an algorithm`)
      if (problems.length === 0) fail(`practice for "${algoId}" is empty; omit the key instead`)
      const slugs = problems.map((p) => p.slug)
      const dupe = slugs.find((s, i) => slugs.indexOf(s) !== i)
      if (dupe) fail(`${algoId} lists "${dupe}" twice`)
      for (const p of problems) {
        if (!problemMeta[p.slug]) fail(`${algoId}: "${p.slug}" has no metadata, so it is not a real problem`)
      }
    }
    const covered = entries.length
    const total = Object.values(practice).reduce((n, v) => n + v.length, 0)
    console.log(`  ${total} practice problems across ${covered} of ${algorithms.length} algorithms, every slug verified`)
  }

  const withVisual = guideGroups.flatMap((g) => g.guides).filter((g) => g.visual).length
  console.log(`  ${gids.length} guides across ${guideGroups.length} groups, ${withVisual} with a diagram`)



  // Colour has to carry judgement. A list where every item is the same
  // non-neutral tone is decoration pretending to be signal.
  const itemTones = (v: Visual): string[] => {
    if (v.kind === 'compare') return v.columns.map((c) => c.tone ?? 'neutral')
    if (v.kind === 'boxes') return v.items.map((i) => i.tone ?? 'neutral')
    if (v.kind === 'stack') return v.layers.map((l) => l.tone ?? 'neutral')
    return []
  }
  const flat = (v: Visual | Visual[]): Visual[] => (Array.isArray(v) ? v : [v])
  const allVisuals: [string, Visual][] = [
    ...Object.entries(conceptVisuals).flatMap(([id, v]) => flat(v).map((x) => [id, x] as [string, Visual])),
    ...guideGroups.flatMap((g) =>
      g.guides.filter((x) => x.visual).flatMap((x) => flat(x.visual!).map((v) => [x.id, v] as [string, Visual])),
    ),
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

  const shapes = new Set(allVisuals.map(([, v]) => v.kind))
  // Chart points are pre-normalised, so anything outside 0..1 draws off-canvas.
  for (const [id, v] of allVisuals) {
    if (v.kind !== 'chart') continue
    for (const serie of v.series) {
      for (const [x, y] of serie.points) {
        if (x < 0 || x > 1 || y < 0 || y > 1) fail(`${id}: chart point (${x}, ${y}) is outside 0..1`)
      }
      if (serie.points.length < 2) fail(`${id}: series "${serie.label}" needs at least two points`)
    }
  }
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
