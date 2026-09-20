import type { Algorithm, GraphEdge, GraphNode, Role, StepGen } from '../engine/types'

const code = `function kruskal(n, edges) {
  edges.sort((a, b) => a.w - b.w)
  const parent = Array.from({ length: n }, (_, i) => i)
  const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])))

  const tree = []
  let total = 0
  for (const e of edges) {
    const ra = find(e.a)
    const rb = find(e.b)
    if (ra === rb) continue
    parent[rb] = ra
    tree.push(e)
    total += e.w
    if (tree.length === n - 1) break
  }
  return { tree, total }
}`

type Edge = { a: number; b: number; w: number }

function parseEdges(raw: string, n: number): Edge[] {
  const out: Edge[] = []
  for (const part of raw.split(/[,\n]+/).map((s) => s.trim()).filter(Boolean)) {
    const m = part.match(/^(\d+)\s*-\s*(\d+)\s*:\s*(\d+)$/)
    if (!m) throw new Error(`Cannot read "${part}". Write edges as 0-1:4, one per comma.`)
    const a = Number(m[1])
    const b = Number(m[2])
    const w = Number(m[3])
    if (a >= n || b >= n) throw new Error(`Node ${Math.max(a, b)} does not exist. There are ${n} nodes, 0 to ${n - 1}.`)
    if (a === b) throw new Error('An edge from a node to itself is always a cycle. Remove it.')
    out.push({ a, b, w })
  }
  if (out.length < n - 1) throw new Error(`Only ${out.length} edges for ${n} nodes. A spanning tree needs at least ${n - 1}.`)
  if (out.length > 14) throw new Error('Keep it to 14 edges so the steps stay readable.')
  return out
}

function* run(input: Record<string, string | number>): StepGen {
  const n = Number(input.n)
  if (!Number.isInteger(n) || n < 3 || n > 8) throw new Error('Node count must be a whole number between 3 and 8.')
  const edges = parseEdges(String(input.edges), n)

  /** Two rows, the second running right to left, so a ring reads as a ring. */
  const top = Math.ceil(n / 2)
  const pos = (i: number) => (i < top ? { x: i, y: 0 } : { x: top - 1 - (i - top), y: 1 })

  const parent = Array.from({ length: n }, (_, i) => i)
  const find = (x: number): number => {
    while (parent[x] !== x) x = parent[x]
    return x
  }

  const sorted = [...edges].sort((a, b) => a.w - b.w)
  const key = (e: Edge) => `${e.a}-${e.b}`
  const state = new Map<string, Role>()

  const nodes = (roles: Record<number, Role> = {}): GraphNode[] =>
    Array.from({ length: n }, (_, i) => ({ id: String(i), label: i, ...pos(i), role: roles[i] ?? 'idle', sub: `set ${find(i)}` }))

  const gEdges = (active?: Edge): GraphEdge[] =>
    edges.map((e) => ({
      from: String(e.a),
      to: String(e.b),
      label: e.w,
      // A spanning tree is undirected. Arrowheads would assert a direction the
      // problem does not have.
      directed: false,
      role: active && key(active) === key(e) ? 'active' : (state.get(key(e)) ?? 'idle'),
    }))

  const queue = (idx: number) => ({
    kind: 'stack' as const,
    label: 'edges, lightest first',
    orientation: 'horizontal' as const,
    items: sorted.map((e, i) => ({
      label: `${e.a}-${e.b} (${e.w})`,
      role: (i === idx ? 'active' : i < idx ? (state.get(key(e)) ?? 'idle') : 'idle') as Role,
    })),
  })

  const tree: Edge[] = []
  let total = 0

  yield {
    line: 2,
    note: `A spanning tree connects all ${n} nodes with exactly ${n - 1} edges. Of the many that exist, we want the cheapest. Kruskal's whole idea is greed: sort the edges by weight and take each one unless it would close a cycle.`,
    views: [{ kind: 'graph', label: 'the graph', nodes: nodes(), edges: gEdges() }, queue(-1)],
    vars: { nodes: n, edges: edges.length, 'edges needed': n - 1 },
  }

  for (let i = 0; i < sorted.length; i++) {
    const e = sorted[i]
    const ra = find(e.a)
    const rb = find(e.b)
    const cycle = ra === rb

    yield {
      line: [9, 10],
      note: `Cheapest edge not yet looked at: ${e.a}-${e.b}, weight ${e.w}. The only question is whether ${e.a} and ${e.b} are already connected by edges taken earlier.`,
      views: [
        { kind: 'graph', label: 'the graph', nodes: nodes({ [e.a]: 'compare', [e.b]: 'compare' }), edges: gEdges(e) },
        queue(i),
      ],
      vars: { edge: `${e.a}-${e.b}`, weight: e.w, [`set of ${e.a}`]: ra, [`set of ${e.b}`]: rb },
    }

    if (cycle) {
      state.set(key(e), 'excluded')
      yield {
        line: 11,
        note: `Both ends are already in set ${ra}, so there is a path between them. Adding this edge would make a cycle, and a tree has none. Skip it. Note that we never had to search for that path: the set id answered it.`,
        views: [{ kind: 'graph', label: 'the graph', nodes: nodes({ [e.a]: 'excluded', [e.b]: 'excluded' }), edges: gEdges() }, queue(i)],
        vars: { edge: `${e.a}-${e.b}`, weight: e.w, rejected: 'would close a cycle', 'tree size': tree.length },
      }
      continue
    }

    parent[rb] = ra
    tree.push(e)
    total += e.w
    state.set(key(e), 'match')

    yield {
      line: [12, 14],
      note: `Different sets, so this edge joins two pieces that were not connected. Take it, merge the sets, and the tree grows to ${tree.length} of the ${n - 1} edges it needs. Running total ${total}.`,
      views: [{ kind: 'graph', label: 'the graph', nodes: nodes({ [e.a]: 'match', [e.b]: 'match' }), edges: gEdges() }, queue(i)],
      vars: { edge: `${e.a}-${e.b}`, weight: e.w, total, 'tree size': tree.length, 'still needed': n - 1 - tree.length },
    }

    if (tree.length === n - 1) {
      yield {
        line: 15,
        note: `${n - 1} edges for ${n} nodes, so everything is connected and adding anything else would make a cycle. Stop. Any edges still in the queue are heavier than what we took, which is exactly why greed was safe here.`,
        views: [{ kind: 'graph', label: 'minimum spanning tree', nodes: nodes(), edges: gEdges() }, queue(i)],
        vars: { total, edges: tree.length, unexamined: sorted.length - i - 1 },
        result: `total weight ${total}: ${tree.map((x) => `${x.a}-${x.b}`).join(', ')}`,
      }
      return
    }
  }

  yield {
    line: 17,
    note: `Every edge has been considered. The tree has ${tree.length} edges for ${n} nodes, so the graph was not fully connected to begin with and this is a spanning forest rather than a tree.`,
    views: [{ kind: 'graph', label: 'spanning forest', nodes: nodes(), edges: gEdges() }, queue(sorted.length)],
    vars: { total, edges: tree.length },
    result: `total weight ${total}, but only ${tree.length} of ${n - 1} edges: the graph is disconnected`,
  }
}

export const kruskal: Algorithm = {
  id: 'kruskal',
  name: "Kruskal's MST",
  blurb: 'Sort the edges, take each one that does not close a cycle.',
  realWorld:
    'Laying cable, pipe or road between towns for the least total length is the original problem, and it is still how network designers pick which links to build. Clustering algorithms use it too: cut the k - 1 heaviest edges of the tree and you have k clusters.',
  idea:
    'Take edges cheapest first. An edge is safe unless both of its ends are already connected, because then it adds nothing and closes a cycle. That leaves one question to answer fast, over and over: are these two nodes already in the same piece? Union-Find answers it in near-constant time without ever walking the graph, which is what makes the greedy sweep practical.',
  useWhen:
    'Minimum spanning tree, minimum cost to connect all points, and clustering by cutting the heaviest tree edges. If the problem says connect everything for the least total and the edges are undirected, this is it.',
  pitfall:
    "Confusing it with Dijkstra. Dijkstra minimises the distance from one source to each node; Kruskal minimises the total of all edges used. They answer different questions and the MST path between two nodes is often not the shortest path. Also, greed only works because of the cut property, so say that out loud rather than asserting that it works.",
  complexity: { time: 'O(E log E)', space: 'O(V)' },
  code,
  inputs: [
    { name: 'n', label: 'nodes', kind: 'number', value: 6, hint: '3 to 8, numbered from 0' },
    { name: 'edges', label: 'edges', kind: 'text', value: '0-1:1, 1-2:2, 0-2:3, 2-3:4, 3-4:5, 1-4:6, 4-5:7, 2-5:8', hint: 'a-b:weight' },
  ],
  run,
}
