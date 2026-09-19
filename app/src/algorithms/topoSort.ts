import type { Algorithm, GraphEdge, GraphNode, Role, StackItem, StepGen } from '../engine/types'

const code = `function topoSort(nodes, edges) {
  const indeg = countIncoming(nodes, edges)
  const queue = nodes.filter((n) => indeg[n] === 0)
  const order = []
  while (queue.length) {
    const n = queue.shift()
    order.push(n)
    for (const m of neighbours(n)) {
      indeg[m]--
      if (indeg[m] === 0) queue.push(m)
    }
  }
  return order.length === nodes.length ? order : 'cycle'
}`

type Edge = { from: string; to: string }

function parseGraph(raw: string): { nodes: string[]; edges: Edge[] } {
  const edges: Edge[] = []
  const nodes: string[] = []
  const add = (n: string) => {
    if (!nodes.includes(n)) nodes.push(n)
  }
  for (const part of raw.split(/[,\n]+/).map((s) => s.trim()).filter(Boolean)) {
    const m = part.match(/^(\w+)\s*(?:->|>)\s*(\w+)$/)
    if (!m) throw new Error(`Cannot read "${part}". Write edges as A>B, one per comma.`)
    add(m[1])
    add(m[2])
    edges.push({ from: m[1], to: m[2] })
  }
  if (nodes.length === 0) throw new Error('Give it some edges, like A>B, A>C, B>D.')
  if (nodes.length > 9) throw new Error(`${nodes.length} nodes is too many to draw clearly. Keep it to 9.`)
  return { nodes, edges }
}

/** Longest path layering, so every edge points strictly downwards when drawn. */
function layout(nodes: string[], edges: Edge[]): Record<string, { x: number; y: number }> {
  const layer: Record<string, number> = Object.fromEntries(nodes.map((n) => [n, 0]))
  for (let pass = 0; pass < nodes.length; pass++) {
    let moved = false
    for (const e of edges) {
      if (layer[e.to] < layer[e.from] + 1) {
        layer[e.to] = layer[e.from] + 1
        moved = true
      }
    }
    if (!moved) break
  }
  const perLayer: Record<number, string[]> = {}
  for (const n of nodes) (perLayer[layer[n]] ??= []).push(n)
  const pos: Record<string, { x: number; y: number }> = {}
  for (const [lv, group] of Object.entries(perLayer)) {
    group.forEach((n, i) => {
      pos[n] = { x: i, y: Number(lv) }
    })
  }
  return pos
}

function* run(input: Record<string, string | number>): StepGen {
  const { nodes, edges } = parseGraph(String(input.edges))
  const pos = layout(nodes, edges)

  const indeg: Record<string, number> = Object.fromEntries(nodes.map((n) => [n, 0]))
  for (const e of edges) indeg[e.to]++

  const out: string[] = []
  let queue: string[] = nodes.filter((n) => indeg[n] === 0)
  const removed = new Set<string>()

  const gNodes = (roles: Record<string, Role> = {}): GraphNode[] =>
    nodes.map((n) => ({
      id: n,
      label: n,
      x: pos[n].x,
      y: pos[n].y,
      role: roles[n] ?? (removed.has(n) ? 'visited' : queue.includes(n) ? 'frontier' : 'idle'),
      sub: removed.has(n) ? 'done' : `in ${indeg[n]}`,
    }))

  const gEdges = (roles: Record<string, Role> = {}): GraphEdge[] =>
    edges.map((e) => ({
      from: e.from,
      to: e.to,
      role: roles[`${e.from}>${e.to}`] ?? (removed.has(e.from) ? 'excluded' : 'idle'),
    }))

  const views = (nodeRoles: Record<string, Role> = {}, edgeRoles: Record<string, Role> = {}) => [
    { kind: 'graph' as const, label: 'dependency graph (arrow means must come first)', nodes: gNodes(nodeRoles), edges: gEdges(edgeRoles) },
    {
      kind: 'stack' as const,
      label: 'queue: in-degree is already zero',
      items: queue.map((n) => ({ label: n, role: 'frontier' as Role })) as StackItem[],
      orientation: 'horizontal' as const,
    },
    {
      kind: 'stack' as const,
      label: `order so far (${out.length} of ${nodes.length})`,
      items: out.map((n) => ({ label: n, role: 'match' as Role })) as StackItem[],
      orientation: 'horizontal' as const,
    },
  ]

  yield {
    line: 2,
    note:
      'A topological order lists every node before anything that depends on it. In-degree counts how many prerequisites a node still has. A node with in-degree zero has nothing blocking it, so it is safe to take right now.',
    views: views(),
    vars: { nodes: nodes.length, edges: edges.length },
  }

  yield {
    line: 3,
    note: `Nodes with no incoming edges: ${queue.join(', ') || 'none'}. ${
      queue.length === 0
        ? 'Every node has a prerequisite, which already means there is a cycle and no valid order exists.'
        : 'These can all be taken immediately, in any order.'
    }`,
    views: views(Object.fromEntries(queue.map((n) => [n, 'frontier' as Role]))),
    vars: { queue: queue.join(', ') || 'empty' },
  }

  while (queue.length) {
    const n = queue[0]
    queue = queue.slice(1)
    out.push(n)
    removed.add(n)

    yield {
      line: [5, 6, 7],
      note: `Take ${n}. Its prerequisites are all satisfied, so it goes into the order at position ${out.length}. Now its outgoing edges no longer block anything, so remove them.`,
      views: views({ [n]: 'active' }, Object.fromEntries(edges.filter((e) => e.from === n).map((e) => [`${e.from}>${e.to}`, 'compare' as Role]))),
      vars: { taking: n, position: out.length },
    }

    for (const e of edges.filter((x) => x.from === n)) {
      indeg[e.to]--
      const freed = indeg[e.to] === 0
      if (freed) queue = [...queue, e.to]

      yield {
        line: [8, 9, 10],
        note: `Edge ${n} to ${e.to} is gone, so ${e.to} has one fewer prerequisite: ${indeg[e.to]}. ${
          freed ? `That was the last one, so ${e.to} joins the queue.` : `${e.to} is still blocked by ${indeg[e.to]} other${indeg[e.to] === 1 ? '' : 's'}.`
        }`,
        views: views({ [n]: 'visited', [e.to]: freed ? 'frontier' : 'compare' }, { [`${e.from}>${e.to}`]: 'excluded' }),
        vars: { from: n, to: e.to, 'in-degree now': indeg[e.to], queued: freed },
      }
    }
  }

  const complete = out.length === nodes.length
  yield {
    line: 13,
    note: complete
      ? `Every node came out, so the order is valid: ${out.join(' -> ')}. Each node entered the queue exactly once, when its last prerequisite was removed.`
      : `Only ${out.length} of ${nodes.length} nodes came out. The rest (${nodes.filter((n) => !removed.has(n)).join(', ')}) are stuck with a non-zero in-degree, each waiting on another. That is a cycle, and no valid order exists. This is why Kahn's algorithm doubles as a cycle detector.`,
    views: views(Object.fromEntries(nodes.filter((n) => !removed.has(n)).map((n) => [n, 'excluded' as Role]))),
    vars: { ordered: out.length, total: nodes.length },
    result: complete ? out.join(' -> ') : `cycle detected, stuck on ${nodes.filter((n) => !removed.has(n)).join(', ')}`,
  }
}

export const topoSort: Algorithm = {
  id: 'topological-sort',
  name: 'Graphs: topological sort (Kahn)',
  rank: 15,
  tier: 2,
  blurb: 'Repeatedly take whatever has no remaining prerequisites.',
  realWorld:
    'Make, Bazel and webpack all decide build order this way. Package managers resolving install order, spreadsheets recalculating after an edit, and CI pipelines with job dependencies are the same problem, and every one of them needs the cycle detection too.',
  idea:
    'Count how many prerequisites each node has. Anything at zero is free to take now. Take it, remove its outgoing edges, and any node whose count drops to zero becomes free in turn. If you get every node out, the order is valid. If the queue empties early, whatever is left is deadlocked on itself, which is exactly a cycle. The same algorithm answers "what order" and "is there a cycle" at once.',
  useWhen:
    'Course schedules, build systems, task dependencies, package resolution. Any question phrased as "X must come before Y". The DFS variant with a colouring scheme is the other standard answer, and it detects cycles too.',
  pitfall:
    'Forgetting the final length check. Without it a cyclic graph returns a partial order that looks like a real answer. Also building the in-degree map from the wrong end of each edge, which inverts the whole result.',
  complexity: { time: 'O(nodes + edges)', space: 'O(nodes + edges)' },
  code,
  inputs: [
    {
      name: 'edges',
      label: 'edges',
      kind: 'text',
      value: 'A>B, A>C, B>D, C>D, D>E, C>F, F>E',
      hint: 'A>B means A before B. Try adding E>A to see a cycle.',
    },
  ],
  run,
}
