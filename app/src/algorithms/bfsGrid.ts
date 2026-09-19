import type { Algorithm, Cell, Role, StackItem, StepGen } from '../engine/types'

const code = `function bfs(grid, start, goal) {
  const queue = [start]
  const dist = { [start]: 0 }
  while (queue.length) {
    const cur = queue.shift()
    if (cur === goal) return dist[cur]
    for (const next of neighbours(cur)) {
      if (isWall(next) || next in dist) continue
      dist[next] = dist[cur] + 1
      queue.push(next)
    }
  }
  return -1
}`

type Pos = { r: number; c: number }
const key = (p: Pos) => `${p.r},${p.c}`

function* run(input: Record<string, string | number>): StepGen {
  const rows = String(input.grid)
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  if (rows.length === 0) throw new Error('The grid is empty.')
  const width = rows[0].length
  if (rows.some((r) => r.length !== width)) throw new Error('Every row of the grid must be the same width.')
  if (rows.length * width > 240) throw new Error('That grid is large enough to make the walkthrough unreadable. Keep it under 240 cells.')

  let start: Pos | null = null
  let goal: Pos | null = null
  rows.forEach((row, r) =>
    [...row].forEach((ch, c) => {
      if (ch === 'S') start = { r, c }
      if (ch === 'E') goal = { r, c }
    }),
  )
  if (!start) throw new Error('No start cell. Mark one with S.')
  if (!goal) throw new Error('No goal cell. Mark one with E.')
  const from: Pos = start
  const to: Pos = goal

  const isWall = (p: Pos) => rows[p.r][p.c] === '#'
  const inside = (p: Pos) => p.r >= 0 && p.r < rows.length && p.c >= 0 && p.c < width

  const dist = new Map<string, number>()
  const parent = new Map<string, string>()
  let queue: Pos[] = [from]
  dist.set(key(from), 0)

  const render = (cur: Pos | null, extra: Record<string, Role> = {}): Cell[][] =>
    rows.map((row, r) =>
      [...row].map((ch, c) => {
        const k = `${r},${c}`
        let role: Role = 'idle'
        if (ch === '#') role = 'wall'
        else if (dist.has(k)) role = queue.some((q) => key(q) === k) ? 'frontier' : 'visited'
        if (cur && cur.r === r && cur.c === c) role = 'active'
        if (extra[k]) role = extra[k]
        return { value: ch === '.' ? '' : ch, role, sub: dist.has(k) && ch !== '#' ? String(dist.get(k)) : undefined }
      }),
    )

  const queueView = (): StackItem[] => queue.map((p) => ({ label: `(${p.r},${p.c})`, role: 'frontier' as Role }))

  yield {
    line: [2, 3],
    note:
      'BFS explores in rings: every cell one step away, then every cell two steps away, and so on. That ordering is why the first time you reach the goal you have reached it by a shortest path. A queue is what enforces the ordering, and the distance map doubles as the visited set.',
    views: [
      { kind: 'grid', label: 'grid', cells: render(null) },
      { kind: 'stack', label: 'queue (FIFO)', items: queueView(), orientation: 'horizontal' },
    ],
    vars: { start: `(${from.r},${from.c})`, goal: `(${to.r},${to.c})` },
  }

  const moves: [number, number, string][] = [
    [-1, 0, 'up'],
    [1, 0, 'down'],
    [0, -1, 'left'],
    [0, 1, 'right'],
  ]

  while (queue.length) {
    const cur = queue[0]
    queue = queue.slice(1)
    const d = dist.get(key(cur))!

    yield {
      line: [4, 5],
      note: `Take (${cur.r},${cur.c}) off the front of the queue. It sits ${d} step${d === 1 ? '' : 's'} from the start. Everything still in the queue is at distance ${d} or ${d + 1}, never less, and that invariant is the whole proof.`,
      views: [
        { kind: 'grid', label: 'grid', cells: render(cur) },
        { kind: 'stack', label: 'queue (FIFO)', items: queueView(), orientation: 'horizontal' },
      ],
      vars: { current: `(${cur.r},${cur.c})`, distance: d, 'queue size': queue.length },
    }

    if (cur.r === to.r && cur.c === to.c) {
      const path: string[] = []
      let walk: string | undefined = key(cur)
      while (walk) {
        path.push(walk)
        walk = parent.get(walk)
      }
      const onPath = Object.fromEntries(path.map((k) => [k, 'path' as Role]))
      yield {
        line: 6,
        note: `Reached the goal. Because BFS pops cells in distance order, this is guaranteed to be the shortest path, ${d} steps. No other cell at distance ${d} could have got here sooner.`,
        views: [
          { kind: 'grid', label: 'grid', cells: render(null, onPath) },
          { kind: 'stack', label: 'queue (FIFO)', items: queueView(), orientation: 'horizontal' },
        ],
        vars: { distance: d, 'cells explored': dist.size },
        result: `shortest path = ${d} steps (explored ${dist.size} cells)`,
      }
      return
    }

    for (const [dr, dc, name] of moves) {
      const next = { r: cur.r + dr, c: cur.c + dc }
      if (!inside(next)) continue
      const k = key(next)
      if (isWall(next)) {
        yield {
          line: 8,
          note: `${name.charAt(0).toUpperCase() + name.slice(1)} from (${cur.r},${cur.c}) is a wall. Skip it.`,
          views: [
            { kind: 'grid', label: 'grid', cells: render(cur, { [k]: 'compare' }) },
            { kind: 'stack', label: 'queue (FIFO)', items: queueView(), orientation: 'horizontal' },
          ],
          vars: { current: `(${cur.r},${cur.c})`, looking: `${name} -> wall` },
        }
        continue
      }
      if (dist.has(k)) {
        yield {
          line: 8,
          note: `${name.charAt(0).toUpperCase() + name.slice(1)} is (${next.r},${next.c}), already reached at distance ${dist.get(k)}. Any route through here now would be at least as long, so skip it. This check is what stops BFS looping forever.`,
          views: [
            { kind: 'grid', label: 'grid', cells: render(cur, { [k]: 'compare' }) },
            { kind: 'stack', label: 'queue (FIFO)', items: queueView(), orientation: 'horizontal' },
          ],
          vars: { current: `(${cur.r},${cur.c})`, looking: `${name} -> seen at ${dist.get(k)}` },
        }
        continue
      }
      dist.set(k, d + 1)
      parent.set(k, key(cur))
      queue = [...queue, next]
      yield {
        line: [9, 10],
        note: `${name.charAt(0).toUpperCase() + name.slice(1)} is (${next.r},${next.c}), unvisited and walkable. Its distance is ${d + 1}. Mark it now, at push time rather than pop time, or it can be queued twice.`,
        views: [
          { kind: 'grid', label: 'grid', cells: render(cur) },
          { kind: 'stack', label: 'queue (FIFO)', items: queueView(), orientation: 'horizontal' },
        ],
        vars: { current: `(${cur.r},${cur.c})`, discovered: `(${next.r},${next.c})`, 'at distance': d + 1, 'queue size': queue.length },
      }
    }
  }

  yield {
    line: 12,
    note: 'The queue drained with the goal never reached. Walls cut it off from the start entirely.',
    views: [
      { kind: 'grid', label: 'grid', cells: render(null) },
      { kind: 'stack', label: 'queue (FIFO)', items: [], orientation: 'horizontal' },
    ],
    vars: { 'cells explored': dist.size },
    result: 'unreachable',
  }
}

export const bfsGrid: Algorithm = {
  id: 'bfs-grid',
  name: 'BFS (shortest path on a grid)',
  rank: 5,
  tier: 1,
  blurb: 'Explore in rings from the start, so the first arrival is the shortest one.',
  idea:
    'A queue processes cells in the order they were discovered, which on an unweighted graph means in order of distance from the start. Every cell you pop is at distance d, and everything it discovers is at d plus one. Mark cells as seen when you push them, not when you pop them, and the whole thing runs in O(cells).',
  useWhen:
    'Shortest path where every edge costs the same, level order traversal, flood fill, and anything phrased as "minimum number of moves". If edges have different weights, this becomes Dijkstra and the queue becomes a heap.',
  pitfall:
    'Marking visited at pop time instead of push time. The same cell then gets queued by several neighbours before any of them is processed, and the queue blows up.',
  complexity: { time: 'O(rows * cols)', space: 'O(rows * cols)' },
  code,
  inputs: [
    {
      name: 'grid',
      label: 'grid',
      kind: 'text',
      value: 'S..#....\n.#.#.##.\n.#......\n...#.#E.',
      hint: 'S start, E goal, # wall, . open',
    },
  ],
  run,
}
