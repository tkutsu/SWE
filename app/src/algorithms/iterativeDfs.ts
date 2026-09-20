import type { Algorithm, GraphEdge, GraphNode, Role, StackItem, StepGen } from '../engine/types'

const code = `function dfs(start, adj) {
  const stack = [start]
  const seen = new Set()
  const order = []
  while (stack.length) {
    const node = stack.pop()
    if (seen.has(node)) continue
    seen.add(node)
    order.push(node)
    for (const next of adj[node].slice().reverse()) {
      if (!seen.has(next)) stack.push(next)
    }
  }
  return order
}`

const LAYOUT: Record<string, { x: number; y: number }> = {
  A: { x: 1, y: 0 },
  B: { x: 0, y: 1 },
  C: { x: 2, y: 1 },
  D: { x: 0, y: 2 },
  E: { x: 1, y: 2 },
  F: { x: 2, y: 2 },
}

function parseAdj(raw: string): Record<string, string[]> {
  const adj: Record<string, string[]> = {}
  for (const part of raw.split(/[,\n]+/).map((s) => s.trim()).filter(Boolean)) {
    const m = part.match(/^([A-F])\s*-\s*([A-F])$/i)
    if (!m) throw new Error(`Cannot read "${part}". Write edges as A-B, using letters A to F.`)
    const a = m[1].toUpperCase()
    const b = m[2].toUpperCase()
    ;(adj[a] ??= []).push(b)
    ;(adj[b] ??= []).push(a)
  }
  if (!Object.keys(adj).length) throw new Error('Give it some edges, like A-B, A-C.')
  return adj
}

function* run(input: Record<string, string | number>): StepGen {
  const adj = parseAdj(String(input.edges))
  const start = String(input.start).trim().toUpperCase()
  if (!adj[start]) throw new Error(`Node ${start} has no edges. Start somewhere in the graph.`)
  for (const k of Object.keys(adj)) if (!LAYOUT[k]) throw new Error(`Node ${k} is not one of A to F.`)
  for (const k of Object.keys(adj)) adj[k].sort()

  const ids = Object.keys(adj).sort()
  const stack: string[] = [start]
  const seen = new Set<string>()
  const order: string[] = []

  const nodes = (extra: Record<string, Role> = {}): GraphNode[] =>
    ids.map((id) => ({
      id,
      label: id,
      ...LAYOUT[id],
      role: extra[id] ?? (seen.has(id) ? 'visited' : stack.includes(id) ? 'frontier' : 'idle'),
      sub: order.includes(id) ? `#${order.indexOf(id) + 1}` : undefined,
    }))

  const edges = (): GraphEdge[] => {
    const out: GraphEdge[] = []
    for (const a of ids) for (const b of adj[a]) if (a < b) out.push({ from: a, to: b, directed: false })
    return out
  }

  const stackView = (topRole: Role = 'active') => ({
    kind: 'stack' as const,
    label: 'the stack, top at the right',
    orientation: 'horizontal' as const,
    items: stack.map<StackItem>((id, i) => ({ label: id, role: i === stack.length - 1 ? topRole : 'frontier' })),
  })

  const orderView = () => ({
    kind: 'stack' as const,
    label: 'visit order',
    orientation: 'horizontal' as const,
    items: order.map<StackItem>((id) => ({ label: id, role: 'visited' })),
  })

  yield {
    line: [2, 4],
    note: `The same depth-first traversal recursion gives you, with the call stack written down explicitly instead. Worth doing once, because it is what you fall back on when the graph is deep enough that recursion would overflow.`,
    views: [{ kind: 'graph', label: 'the graph', nodes: nodes({ [start]: 'frontier' }), edges: edges() }, stackView()],
    vars: { start, stack: stack.join(' ') },
  }

  let guard = 0
  while (stack.length) {
    if (guard++ > 200) break
    const node = stack.pop() as string

    if (seen.has(node)) {
      yield {
        line: 7,
        note: `${node} came off the stack but has already been visited. This is the difference from the recursive version: a node can be pushed several times, by several neighbours, before any of those copies is popped. So the check happens on the way out, not on the way in.`,
        views: [{ kind: 'graph', label: 'the graph', nodes: nodes({ [node]: 'excluded' }), edges: edges() }, stackView(), orderView()],
        vars: { popped: node, already: 'visited', stack: stack.join(' ') || 'empty' },
      }
      continue
    }

    seen.add(node)
    order.push(node)
    const pushed = adj[node].filter((x) => !seen.has(x))
    for (const next of [...adj[node]].reverse()) if (!seen.has(next)) stack.push(next)

    yield {
      line: [8, 12],
      note: `Pop ${node}, mark it visited, and push its unvisited neighbours${pushed.length ? `: ${pushed.join(', ')}` : ', of which there are none'}. They go on reversed, so the first neighbour alphabetically ends up on top and comes off next. Without that reversal this visits neighbours in the opposite order to the recursive version, which is the detail that catches people.`,
      views: [{ kind: 'graph', label: 'the graph', nodes: nodes({ [node]: 'active' }), edges: edges() }, stackView(), orderView()],
      vars: { visiting: node, pushed: pushed.join(', ') || 'none', stack: stack.join(' ') || 'empty', visited: order.length },
    }
  }

  yield {
    line: 14,
    note: `The stack is empty, so everything reachable from ${start} has been visited. Order: ${order.join(', ')}. Depth first goes as deep as it can before backing up, which is why this is the traversal for "is there a path" and the wrong one for "what is the shortest path".`,
    views: [{ kind: 'graph', label: 'the graph', nodes: nodes(), edges: edges() }, orderView()],
    vars: { visited: order.length, order: order.join(' ') },
    result: `visited ${order.length}: ${order.join(', ')}`,
  }
}

export const iterativeDfs: Algorithm = {
  id: 'iterative-dfs',
  name: 'Iterative DFS',
  rank: 208,
  tier: 1,
  blurb: 'The call stack, written down, so nothing can overflow.',
  realWorld:
    'Every recursive descent you have written has this hiding inside it, and it is what a garbage collector uses to walk an object graph that may be millions of nodes deep. Filesystem walkers use it for the same reason: directory trees are occasionally pathological.',
  idea:
    'Recursion keeps the frontier on the call stack, where you cannot see it and cannot control its size. Move it into an array and the traversal is identical: pop a node, visit it, push its unvisited neighbours. The pushed neighbours go on in reverse, so the first one comes off first and the order matches the recursive version exactly.',
  useWhen:
    'Any depth-first walk where the depth could be large, since a graph of 100,000 nodes will overflow the call stack and this will not. Also whenever you need to pause, resume or inspect a traversal, because the state is a value you hold rather than a stack you cannot reach.',
  pitfall:
    'Marking nodes as seen when you push rather than when you pop. Both work, and they produce different orders, and only the pop version matches recursion. The related trap is forgetting that the same node can be pushed several times before any copy is popped, so the check has to happen on the way out.',
  complexity: { time: 'O(V + E)', space: 'O(V)' },
  code,
  inputs: [
    { name: 'edges', label: 'edges', kind: 'text', value: 'A-B, A-C, B-D, B-E, C-F, E-F', hint: 'letters A to F' },
    { name: 'start', label: 'start at', kind: 'text', value: 'A' },
  ],
  run,
}
