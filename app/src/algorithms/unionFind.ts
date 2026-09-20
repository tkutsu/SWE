import type { Algorithm, Cell, GraphEdge, GraphNode, Role, StepGen } from '../engine/types'

const code = `function find(parent, x) {
  while (parent[x] !== x) {
    parent[x] = parent[parent[x]]
    x = parent[x]
  }
  return x
}

function union(parent, size, a, b) {
  const ra = find(parent, a)
  const rb = find(parent, b)
  if (ra === rb) return false
  if (size[ra] < size[rb]) swap(ra, rb)
  parent[rb] = ra
  size[ra] += size[rb]
  return true
}`

type Edge = { a: number; b: number }

function parseEdges(raw: string, n: number): Edge[] {
  const out: Edge[] = []
  for (const part of raw.split(/[,\n]+/).map((s) => s.trim()).filter(Boolean)) {
    const m = part.match(/^(\d+)\s*[-> ]\s*(\d+)$/)
    if (!m) throw new Error(`Cannot read "${part}". Write connections as 0-1, one per comma.`)
    const a = Number(m[1])
    const b = Number(m[2])
    if (a >= n || b >= n) throw new Error(`Node ${Math.max(a, b)} does not exist. There are ${n} nodes, 0 to ${n - 1}.`)
    out.push({ a, b })
  }
  if (out.length === 0) throw new Error('Give it some connections, like 0-1, 2-3.')
  if (out.length > 12) throw new Error('Keep it to 12 connections.')
  return out
}

function* run(input: Record<string, string | number>): StepGen {
  const n = Number(input.n)
  if (!Number.isInteger(n) || n < 2 || n > 9) throw new Error('Node count must be a whole number between 2 and 9.')
  const edges = parseEdges(String(input.edges), n)

  const parent = Array.from({ length: n }, (_, i) => i)
  const size = new Array<number>(n).fill(1)
  const joined: Edge[] = []

  const findNoCompress = (x: number): number => {
    while (parent[x] !== x) x = parent[x]
    return x
  }

  const perRow = Math.min(5, n)
  const gNodes = (roles: Record<number, Role> = {}): GraphNode[] =>
    Array.from({ length: n }, (_, i) => ({
      id: String(i),
      label: i,
      x: i % perRow,
      y: Math.floor(i / perRow),
      role: roles[i] ?? 'idle',
      sub: `root ${findNoCompress(i)}`,
    }))

  /** Only edges already unioned are drawn, so the picture is the forest, not the input. */
  const gEdges = (roles: Record<string, Role> = {}): GraphEdge[] =>
    joined.map((e) => ({ from: String(e.a), to: String(e.b), directed: false, role: roles[`${e.a}-${e.b}`] ?? 'visited' }))

  const parentCells = (roles: Record<number, Role> = {}): Cell[] =>
    parent.map((p, i) => ({ value: p, role: roles[i] ?? (p === i ? 'match' : 'window'), sub: String(i) }))

  const views = (nodeRoles: Record<number, Role> = {}, edgeRoles: Record<string, Role> = {}) => [
    { kind: 'graph' as const, label: 'components (only merged links drawn)', nodes: gNodes(nodeRoles), edges: gEdges(edgeRoles) },
    { kind: 'array' as const, label: 'parent[i]', cells: parentCells(nodeRoles) },
  ]

  const components = () => new Set(Array.from({ length: n }, (_, i) => findNoCompress(i))).size

  yield {
    line: 1,
    note:
      'Every node starts as its own component, so parent[i] is i. The structure never stores which component a node is in directly. It stores a parent, and the component is whatever you reach by following parents to a node that points at itself.',
    views: views(),
    vars: { nodes: n, components: n },
  }

  for (const e of edges) {
    yield {
      line: [10, 11, 12],
      note: `Connect ${e.a} and ${e.b}. First find the root of each by walking up the parent chain.`,
      views: views({ [e.a]: 'active', [e.b]: 'active' }),
      vars: { a: e.a, b: e.b },
    }

    const ra = findNoCompress(e.a)
    const rb = findNoCompress(e.b)

    if (ra === rb) {
      yield {
        line: 13,
        note: `Both walk up to root ${ra}, so ${e.a} and ${e.b} are already in the same component. Adding this link would create a cycle, so skip it. In Kruskal's algorithm this exact check is what rejects edges that would close a loop.`,
        views: views({ [e.a]: 'compare', [e.b]: 'compare', [ra]: 'match' }),
        vars: { a: e.a, b: e.b, 'root of a': ra, 'root of b': rb, merged: false },
      }
      continue
    }

    yield {
      line: [11, 12],
      note: `${e.a} sits under root ${ra} (${size[ra]} node${size[ra] === 1 ? '' : 's'}), ${e.b} sits under root ${rb} (${size[rb]}). Different roots, so these are different components and the merge is real.`,
      views: views({ [ra]: 'compare', [rb]: 'compare', [e.a]: 'active', [e.b]: 'active' }),
      vars: { 'root of a': ra, 'root of b': rb, 'size a': size[ra], 'size b': size[rb] },
    }

    const big = size[ra] >= size[rb] ? ra : rb
    const small = big === ra ? rb : ra

    parent[small] = big
    size[big] += size[small]
    joined.push(e)

    yield {
      line: [14, 15, 16],
      note: `Hang the smaller tree under the larger one: parent[${small}] becomes ${big}. Attaching small to large is what keeps the trees shallow. Do it the other way round often enough and the structure degenerates into a linked list, and find goes from nearly constant to linear.`,
      views: views({ [big]: 'match', [small]: 'visited' }, { [`${e.a}-${e.b}`]: 'match' }),
      vars: { 'new root': big, 'now size': size[big], components: components() },
    }
  }

  yield {
    line: 17,
    note: `All connections processed. ${components()} component${components() === 1 ? '' : 's'} remain. Every node's component is found by following parents to a self-pointing root, and with union by size plus path compression that walk is effectively constant time.`,
    views: views(),
    vars: { components: components(), roots: Array.from({ length: n }, (_, i) => i).filter((i) => parent[i] === i).join(', ') },
    result: `${components()} component${components() === 1 ? '' : 's'}`,
  }
}

export const unionFind: Algorithm = {
  id: 'union-find',
  name: 'Union-Find (disjoint set)',
  blurb: 'Track which things are connected, with near constant time merges and queries.',
  realWorld:
    'Network designers use it inside Kruskal to lay out a minimum spanning tree. Image segmentation merges neighbouring pixels into regions the same way, and so does any friend circles or account merging feature.',
  idea:
    'Each component is a tree, and the component is named by its root. Find walks up to the root. Union finds both roots and hangs one under the other. Two optimisations make it fast: always attach the smaller tree to the larger so the trees stay shallow, and flatten the path as you walk it so later finds are shorter. Together they give an amortised cost so close to constant that it is treated as constant in practice.',
  useWhen:
    'Connected components, Kruskal for minimum spanning tree, detecting whether an edge closes a cycle, accounts merge, and grid problems where islands join as you add cells. If the question only asks whether two things are connected and never asks for the path, this beats BFS.',
  pitfall:
    'Writing union as parent[a] = b using the nodes rather than their roots. That silently loses whole components. Always union roots, never the nodes you were handed.',
  complexity: { time: 'near O(1) amortised per operation', space: 'O(n)' },
  code,
  inputs: [
    { name: 'n', label: 'node count', kind: 'number', value: 7, hint: '2 to 9, labelled from 0' },
    { name: 'edges', label: 'connections', kind: 'text', value: '0-1, 2-3, 1-2, 4-5, 0-3', hint: 'try adding 0-2 to see a cycle rejected' },
  ],
  run,
}
