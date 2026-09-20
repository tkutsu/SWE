import type { Algorithm, GraphEdge, GraphNode, Role, StackItem, StepGen } from '../engine/types'

const code = `function prim(n, adj) {
  const inTree = new Array(n).fill(false)
  const heap = [[0, 0, -1]]
  const tree = []
  let total = 0
  while (heap.length && tree.length < n - 1) {
    heap.sort((a, b) => a[0] - b[0])
    const [w, node, from] = heap.shift()
    if (inTree[node]) continue
    inTree[node] = true
    if (from >= 0) { tree.push([from, node]); total += w }
    for (const [next, weight] of adj[node]) {
      if (!inTree[next]) heap.push([weight, next, node])
    }
  }
  return { tree, total }
}`

type Edge = { a: number; b: number; w: number }

function parseEdges(raw: string, n: number): Edge[] {
  const out: Edge[] = []
  for (const part of raw.split(/[,\n]+/).map((s) => s.trim()).filter(Boolean)) {
    const m = part.match(/^(\d+)\s*-\s*(\d+)\s*:\s*(\d+)$/)
    if (!m) throw new Error(`Cannot read "${part}". Write edges as 0-1:4, one per comma.`)
    const [a, b, w] = [Number(m[1]), Number(m[2]), Number(m[3])]
    if (a >= n || b >= n) throw new Error(`Node ${Math.max(a, b)} does not exist. There are ${n} nodes, 0 to ${n - 1}.`)
    if (a === b) throw new Error('An edge from a node to itself cannot be in a tree.')
    out.push({ a, b, w })
  }
  if (out.length < n - 1) throw new Error(`Only ${out.length} edges for ${n} nodes. A spanning tree needs at least ${n - 1}.`)
  if (out.length > 14) throw new Error('Keep it to 14 edges.')
  return out
}

function* run(input: Record<string, string | number>): StepGen {
  const n = Number(input.n)
  if (!Number.isInteger(n) || n < 3 || n > 8) throw new Error('Node count must be a whole number between 3 and 8.')
  const edges = parseEdges(String(input.edges), n)

  const top = Math.ceil(n / 2)
  const pos = (i: number) => (i < top ? { x: i, y: 0 } : { x: top - 1 - (i - top), y: 1 })

  const adj: [number, number][][] = Array.from({ length: n }, () => [])
  for (const e of edges) {
    adj[e.a].push([e.b, e.w])
    adj[e.b].push([e.a, e.w])
  }

  const inTree = new Array<boolean>(n).fill(false)
  const chosen = new Set<string>()
  const key = (a: number, b: number) => [a, b].sort((x, y) => x - y).join('-')

  let heap: [number, number, number][] = [[0, 0, -1]]
  let total = 0
  const tree: [number, number][] = []

  const nodes = (extra: Record<number, Role> = {}): GraphNode[] =>
    Array.from({ length: n }, (_, i) => ({
      id: String(i),
      label: i,
      ...pos(i),
      role: extra[i] ?? (inTree[i] ? 'visited' : heap.some(([, node]) => node === i) ? 'frontier' : 'idle'),
    }))

  const gEdges = (active?: [number, number]): GraphEdge[] =>
    edges.map((e) => ({
      from: String(e.a),
      to: String(e.b),
      label: e.w,
      directed: false,
      role: active && key(active[0], active[1]) === key(e.a, e.b) ? 'active' : chosen.has(key(e.a, e.b)) ? 'match' : 'idle',
    }))

  const heapView = () => ({
    kind: 'stack' as const,
    label: 'frontier, cheapest first',
    orientation: 'horizontal' as const,
    items: [...heap]
      .sort((a, b) => a[0] - b[0])
      .map<StackItem>(([w, node, from], i) => ({
        label: from < 0 ? `start ${node}` : `${from}->${node} (${w})`,
        role: (i === 0 ? 'active' : inTree[node] ? 'excluded' : 'frontier') as Role,
      })),
  })

  yield {
    line: [2, 3],
    note: `Same goal as Kruskal, opposite method. Kruskal sorts every edge once and grows several pieces that eventually join. Prim grows one tree outward from a single node, always taking the cheapest edge leaving what it has built so far.`,
    views: [{ kind: 'graph', label: 'the graph', nodes: nodes(), edges: gEdges() }, heapView()],
    vars: { nodes: n, edges: edges.length, 'edges needed': n - 1 },
  }

  let guard = 0
  while (heap.length && tree.length < n - 1) {
    if (guard++ > 200) break
    heap.sort((a, b) => a[0] - b[0])
    const [w, node, from] = heap.shift() as [number, number, number]

    if (inTree[node]) {
      yield {
        line: 9,
        note: `The cheapest thing on the frontier reaches node ${node}, which is already in the tree. It got queued earlier by a different neighbour and is now stale, so drop it. This is the same stale-entry situation Dijkstra has, for the same reason.`,
        views: [{ kind: 'graph', label: 'the graph', nodes: nodes({ [node]: 'excluded' }), edges: gEdges() }, heapView()],
        vars: { skipped: `${from}->${node}`, reason: 'already in the tree', 'tree size': tree.length },
      }
      continue
    }

    inTree[node] = true
    if (from >= 0) {
      chosen.add(key(from, node))
      tree.push([from, node])
      total += w
    }

    const added = adj[node].filter(([next]) => !inTree[next])
    for (const [next, weight] of adj[node]) if (!inTree[next]) heap.push([weight, next, node])

    yield {
      line: [10, 15],
      note:
        from < 0
          ? `Start at node ${node}. It costs nothing to include the first node, and every edge leaving it joins the frontier.`
          : `Cheapest edge leaving the tree is ${from} to ${node}, weight ${w}. Take it. Node ${node} joins the tree, total rises to ${total}, and the ${added.length} edge${added.length === 1 ? '' : 's'} leaving ${node} join the frontier.`,
      views: [{ kind: 'graph', label: 'the graph', nodes: nodes({ [node]: 'active' }), edges: gEdges(from >= 0 ? [from, node] : undefined) }, heapView()],
      vars: { added: node, weight: from < 0 ? 0 : w, total, 'tree size': tree.length, frontier: heap.length },
    }
  }

  yield {
    line: 17,
    note: `${tree.length} edges for ${n} nodes, so the tree is complete at total weight ${total}. Kruskal on the same graph gives the same total, and often a different set of edges when weights tie. Prim wins on dense graphs because it never looks at edges leaving the part of the graph it has not reached.`,
    views: [{ kind: 'graph', label: 'minimum spanning tree', nodes: nodes(), edges: gEdges() }, heapView()],
    vars: { total, edges: tree.length },
    result: `total weight ${total}: ${tree.map(([a, b]) => `${a}-${b}`).join(', ')}`,
  }
}

export const prim: Algorithm = {
  id: 'prim',
  name: "Prim's MST",
  blurb: 'Grow one tree outward, always by the cheapest edge leaving it.',
  realWorld:
    'Network and circuit layout use it where the graph is dense, since every pair of points is a candidate link and sorting all of those edges the way Kruskal would is the expensive part. Maze generation uses it too, with random weights.',
  idea:
    'Start anywhere. Repeatedly take the cheapest edge that has one end inside the tree and one end outside, and pull that node in. It is Dijkstra with one line changed: Dijkstra orders the queue by distance from the source, Prim orders it by the weight of the single edge. That is the whole difference between shortest paths and a minimum spanning tree.',
  useWhen:
    'Minimum spanning tree on a dense graph, where the number of edges approaches the number of nodes squared. On a sparse graph Kruskal is usually simpler to write and just as fast, so knowing both and saying which fits is the better answer.',
  pitfall:
    'Believing the MST contains the shortest path between two nodes. It very often does not, and that confusion with Dijkstra is the thing being probed. Also the stale heap entries: a node can be queued by several neighbours, so the check for "already in the tree" has to happen when it comes off the heap.',
  complexity: { time: 'O(E log V)', space: 'O(V + E)' },
  code,
  inputs: [
    { name: 'n', label: 'nodes', kind: 'number', value: 6, hint: '3 to 8, numbered from 0' },
    { name: 'edges', label: 'edges', kind: 'text', value: '0-1:1, 1-2:2, 0-2:3, 2-3:4, 3-4:5, 1-4:6, 4-5:7, 2-5:8', hint: 'a-b:weight' },
  ],
  run,
}
