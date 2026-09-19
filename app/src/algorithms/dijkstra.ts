import type { Algorithm, GraphEdge, GraphNode, MapEntry, Role, StepGen } from '../engine/types'

const code = `function dijkstra(graph, start) {
  const dist = { [start]: 0 }
  const heap = [[0, start]]
  const done = new Set()
  while (heap.length) {
    const [d, n] = popMin(heap)
    if (done.has(n)) continue
    done.add(n)
    for (const [m, w] of graph[n]) {
      if (d + w < (dist[m] ?? Infinity)) {
        dist[m] = d + w
        heap.push([dist[m], m])
      }
    }
  }
  return dist
}`

type Edge = { a: string; b: string; w: number }

function parseGraph(raw: string): { nodes: string[]; edges: Edge[] } {
  const edges: Edge[] = []
  const nodes: string[] = []
  const add = (n: string) => {
    if (!nodes.includes(n)) nodes.push(n)
  }
  for (const part of raw.split(/[,\n]+/).map((s) => s.trim()).filter(Boolean)) {
    const m = part.match(/^(\w+)\s*-\s*(\w+)\s*:\s*(\d+)$/)
    if (!m) throw new Error(`Cannot read "${part}". Write edges as A-B:4, one per comma.`)
    const w = Number(m[3])
    if (w <= 0) throw new Error(`Edge ${m[1]}-${m[2]} has weight ${w}. Dijkstra needs positive weights.`)
    add(m[1])
    add(m[2])
    edges.push({ a: m[1], b: m[2], w })
  }
  if (edges.length === 0) throw new Error('Give it some weighted edges, like A-B:4, B-C:2.')
  if (nodes.length > 8) throw new Error('Keep it to 8 nodes.')
  return { nodes, edges }
}

function* run(input: Record<string, string | number>): StepGen {
  const { nodes, edges } = parseGraph(String(input.edges))
  const start = String(input.start).trim()
  if (!nodes.includes(start)) throw new Error(`Start node "${start}" is not in the graph. Pick one of ${nodes.join(', ')}.`)

  const adj: Record<string, { to: string; w: number }[]> = Object.fromEntries(nodes.map((n) => [n, []]))
  for (const e of edges) {
    adj[e.a].push({ to: e.b, w: e.w })
    adj[e.b].push({ to: e.a, w: e.w })
  }

  // Lay the graph out in rings by hop count from the start, which keeps it readable.
  const hop: Record<string, number> = { [start]: 0 }
  let ring = [start]
  while (ring.length) {
    const next: string[] = []
    for (const n of ring) for (const { to } of adj[n]) if (hop[to] === undefined) { hop[to] = hop[n] + 1; next.push(to) }
    ring = next
  }
  for (const n of nodes) hop[n] ??= 0
  const perRing: Record<number, string[]> = {}
  for (const n of nodes) (perRing[hop[n]] ??= []).push(n)
  const pos: Record<string, { x: number; y: number }> = {}
  for (const [lv, group] of Object.entries(perRing)) group.forEach((n, i) => (pos[n] = { x: i, y: Number(lv) }))

  const dist: Record<string, number> = { [start]: 0 }
  const done = new Set<string>()
  let heap: [number, string][] = [[0, start]]

  const show = (n: string) => (dist[n] === undefined ? '-' : String(dist[n]))

  const gNodes = (roles: Record<string, Role> = {}): GraphNode[] =>
    nodes.map((n) => ({
      id: n,
      label: n,
      x: pos[n].x,
      y: pos[n].y,
      role: roles[n] ?? (done.has(n) ? 'visited' : dist[n] !== undefined ? 'frontier' : 'idle'),
      sub: show(n),
    }))

  const gEdges = (roles: Record<string, Role> = {}): GraphEdge[] =>
    edges.map((e) => ({ from: e.a, to: e.b, label: e.w, directed: false, role: roles[`${e.a}-${e.b}`] ?? roles[`${e.b}-${e.a}`] ?? 'idle' }))

  const heapView = (): MapEntry[] =>
    [...heap].sort((x, y) => x[0] - y[0]).map(([d, n]) => ({ key: n, value: d, role: done.has(n) ? 'excluded' : 'frontier' }))

  const views = (nodeRoles: Record<string, Role> = {}, edgeRoles: Record<string, Role> = {}) => [
    { kind: 'graph' as const, label: 'graph (node caption is the best distance known)', nodes: gNodes(nodeRoles), edges: gEdges(edgeRoles) },
    { kind: 'map' as const, label: 'priority queue (distance, node)', entries: heapView(), empty: 'empty' },
  ]

  yield {
    line: [2, 3],
    note: `Start at ${start} with distance 0. Everything else is unknown. This is BFS with one change: instead of a plain queue, a priority queue always hands back the closest unfinished node. That is the only difference, and it is what makes weights work.`,
    views: views({ [start]: 'active' }),
    vars: { start },
  }

  while (heap.length) {
    heap.sort((x, y) => x[0] - y[0])
    const [d, n] = heap[0]
    heap = heap.slice(1)

    if (done.has(n)) {
      yield {
        line: 7,
        note: `${n} came off the queue again at distance ${d}, but it was already finalised at ${dist[n]}. Stale entries are normal: rather than updating a value inside the heap, you push a better one and ignore the old. Skip it.`,
        views: views({ [n]: 'excluded' }),
        vars: { popped: n, 'stale distance': d, 'final distance': dist[n] },
      }
      continue
    }

    done.add(n)
    yield {
      line: [6, 8],
      note: `${n} is the closest unfinished node, at distance ${d}. Because every edge weight is positive, no route discovered later can beat it, so ${d} is final. That argument is the whole proof, and it is exactly what breaks if a weight is negative.`,
      views: views({ [n]: 'active' }),
      vars: { finalised: n, distance: d, remaining: nodes.length - done.size },
    }

    for (const { to, w } of adj[n]) {
      const candidate = d + w
      const known = dist[to]
      const better = known === undefined || candidate < known

      yield {
        line: [9, 10],
        note: `From ${n}, the edge to ${to} costs ${w}, so going through ${n} gives ${d} + ${w} = ${candidate}. ${
          known === undefined
            ? `${to} had no known route, so this is an improvement.`
            : better
              ? `That beats the ${known} already recorded, so it is an improvement.`
              : `The recorded ${known} is already as good, so ignore this route.`
        }`,
        views: views({ [n]: 'active', [to]: better ? 'compare' : 'idle' }, { [`${n}-${to}`]: better ? 'compare' : 'idle' }),
        vars: { from: n, to, weight: w, candidate, 'known best': known ?? '-' },
      }

      if (better) {
        dist[to] = candidate
        heap = [...heap, [candidate, to]]
        yield {
          line: [11, 12],
          note: `Record ${to} at ${candidate} and push it onto the queue. This is relaxation: an edge is relaxed when it improves the best known route to its far end.`,
          views: views({ [to]: 'frontier' }, { [`${n}-${to}`]: 'match' }),
          vars: { updated: to, 'new distance': candidate, 'queue size': heap.length },
        }
      }
    }
  }

  const unreachable = nodes.filter((n) => dist[n] === undefined)
  yield {
    line: 16,
    note: `The queue is empty, so every reachable node is finalised. ${
      unreachable.length ? `${unreachable.join(', ')} could not be reached from ${start} at all.` : `Every node was reached.`
    } Each node is finalised once and each edge relaxed at most once per endpoint, which is where the edges times log nodes bound comes from.`,
    views: views(),
    vars: Object.fromEntries(nodes.map((n) => [n, show(n)])),
    result: nodes.map((n) => `${n}=${show(n)}`).join('  '),
  }
}

export const dijkstra: Algorithm = {
  id: 'dijkstra',
  name: 'Dijkstra (weighted shortest path)',
  rank: 18,
  tier: 3,
  blurb: 'BFS with a priority queue instead of a plain queue.',
  realWorld:
    'Every route your phone hands you comes from a variant of this. Link state routing protocols like OSPF run it to build forwarding tables, and game pathfinding uses A star, which is Dijkstra with a hint about the direction of the goal.',
  idea:
    'BFS works because a plain queue hands back nodes in order of hop count. With weights, hop count is no longer distance, so swap the queue for a priority queue that hands back the closest unfinished node. When a node comes off the queue, no unexplored route can be shorter, because every remaining path starts with something at least as far away and all weights are positive. So its distance is final, and you never revisit it.',
  useWhen:
    'Shortest path where edges have different positive costs: maps, latency, cheapest flights with a hop limit, path of maximum probability. If all the weights are equal, plain BFS is simpler and faster.',
  pitfall:
    'Negative edge weights. The finality argument collapses, and Dijkstra confidently returns wrong answers rather than failing loudly. Use Bellman-Ford there. The other one is forgetting the `done` check when popping, which is needed because the heap holds stale entries by design.',
  complexity: { time: 'O(E log V)', space: 'O(V + E)' },
  code,
  inputs: [
    { name: 'edges', label: 'weighted edges', kind: 'text', value: 'A-B:4, A-C:2, C-B:1, B-D:5, C-D:8, D-E:2', hint: 'A-B:4 means an edge of cost 4' },
    { name: 'start', label: 'start at', kind: 'text', value: 'A' },
  ],
  run,
}
