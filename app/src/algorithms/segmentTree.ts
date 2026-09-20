import { cells, parseInt10, parseNumbers } from '../engine/frame'
import type { Algorithm, GraphEdge, GraphNode, Role, StepGen } from '../engine/types'

const code = `function build(nums, node, lo, hi, tree) {
  if (lo === hi) { tree[node] = nums[lo]; return }
  const mid = (lo + hi) >> 1
  build(nums, 2 * node, lo, mid, tree)
  build(nums, 2 * node + 1, mid + 1, hi, tree)
  tree[node] = tree[2 * node] + tree[2 * node + 1]
}

function update(node, lo, hi, i, val, tree) {
  if (lo === hi) { tree[node] = val; return }
  const mid = (lo + hi) >> 1
  if (i <= mid) update(2 * node, lo, mid, i, val, tree)
  else update(2 * node + 1, mid + 1, hi, i, val, tree)
  tree[node] = tree[2 * node] + tree[2 * node + 1]
}`

type Seg = { node: number; lo: number; hi: number }

function* run(input: Record<string, string | number>): StepGen {
  const nums = parseNumbers(input.nums, 'nums')
  if (nums.length < 2 || nums.length > 8) throw new Error('Give between 2 and 8 numbers so the tree fits.')
  const at = parseInt10(input.index, 'index')
  if (!Number.isInteger(at) || at < 0 || at >= nums.length) throw new Error(`index must be between 0 and ${nums.length - 1}.`)
  const val = parseInt10(input.value, 'value')

  const n = nums.length
  const tree: Record<number, number> = {}
  const span: Record<number, Seg> = {}

  const build = (node: number, lo: number, hi: number) => {
    span[node] = { node, lo, hi }
    if (lo === hi) {
      tree[node] = nums[lo]
      return
    }
    const mid = (lo + hi) >> 1
    build(2 * node, lo, mid)
    build(2 * node + 1, mid + 1, hi)
    tree[node] = tree[2 * node] + tree[2 * node + 1]
  }
  build(1, 0, n - 1)

  const depthOf = (node: number) => Math.floor(Math.log2(node))
  const maxDepth = Math.max(...Object.keys(tree).map((k) => depthOf(Number(k))))

  const nodes = (marks: Record<number, Role> = {}): GraphNode[] =>
    Object.values(span).map((s) => {
      const d = depthOf(s.node)
      const perRow = 2 ** d
      const idx = s.node - perRow
      return {
        id: String(s.node),
        label: tree[s.node],
        x: ((idx + 0.5) * 2 ** maxDepth) / perRow - 0.5,
        y: d,
        role: marks[s.node] ?? 'idle',
        sub: s.lo === s.hi ? `[${s.lo}]` : `${s.lo}..${s.hi}`,
      }
    })

  const links = (): GraphEdge[] =>
    Object.values(span).flatMap((s) =>
      s.lo === s.hi ? [] : [
        { from: String(s.node), to: String(2 * s.node), directed: false },
        { from: String(s.node), to: String(2 * s.node + 1), directed: false },
      ],
    )

  const arrayView = (marks: Record<number, Role> = {}) => ({
    kind: 'array' as const,
    label: 'the array',
    cells: cells(nums, marks),
  })

  yield {
    line: [1, 7],
    note: `Prefix sums answer any range in one subtraction, and they fall apart the moment a value changes, because every prefix after it is wrong. Rebuilding is O(n) per update. A segment tree keeps range queries fast and makes updates fast too, by storing sums over ranges rather than over prefixes.`,
    views: [arrayView(), { kind: 'graph', label: 'segment tree, each node covers a range', nodes: nodes({ 1: 'match' }), edges: links() }],
    vars: { n, 'root covers': `0..${n - 1}`, 'root sum': tree[1] },
  }

  yield {
    line: 6,
    note: `Every leaf is one element and every internal node is the sum of its two children, so the root is the total. A node covering ${n} elements sits ${maxDepth} level${maxDepth === 1 ? '' : 's'} above the leaves, which is why both operations are logarithmic: they touch one node per level.`,
    views: [
      arrayView(Object.fromEntries(nums.map((_, i) => [i, 'window' as Role]))),
      { kind: 'graph', label: 'segment tree, each node covers a range', nodes: nodes(), edges: links() },
    ],
    vars: { levels: maxDepth + 1, 'nodes touched per operation': maxDepth + 1 },
  }

  const path: number[] = []
  let node = 1
  let lo = 0
  let hi = n - 1
  while (lo !== hi) {
    path.push(node)
    const mid = (lo + hi) >> 1
    if (at <= mid) {
      node = 2 * node
      hi = mid
    } else {
      node = 2 * node + 1
      lo = mid + 1
    }
    yield {
      line: [12, 13],
      note: `Updating index ${at}. At this node the range splits at ${mid}, and ${at} is ${at <= mid ? 'on the left' : 'on the right'}, so descend that way. Only one child is ever visited, which is the whole reason this is log n and not n.`,
      views: [
        arrayView({ [at]: 'active' }),
        { kind: 'graph', label: 'descending to the leaf', nodes: nodes({ ...Object.fromEntries(path.map((p) => [p, 'visited' as Role])), [node]: 'active' }), edges: links() },
      ],
      vars: { index: at, 'now covering': `${lo}..${hi}`, depth: path.length },
    }
  }
  path.push(node)

  const old = tree[node]
  tree[node] = val
  yield {
    line: 10,
    note: `The leaf for index ${at} held ${old}. Set it to ${val}. Everything above it is now stale by exactly ${val - old}, and fixing that is the walk back up.`,
    views: [
      arrayView({ [at]: 'match' }),
      { kind: 'graph', label: 'leaf updated, ancestors now stale', nodes: nodes({ [node]: 'match' }), edges: links() },
    ],
    vars: { index: at, from: old, to: val, difference: val - old },
  }

  for (let k = path.length - 2; k >= 0; k--) {
    const p = path[k]
    const before = tree[p]
    tree[p] = tree[2 * p] + tree[2 * p + 1]
    yield {
      line: 14,
      note: `Recompute node covering ${span[p].lo}..${span[p].hi} from its two children: ${tree[2 * p]} plus ${tree[2 * p + 1]} is ${tree[p]}, where it was ${before}. Nothing off this path changed, so nothing off this path is touched.`,
      views: [
        arrayView({ [at]: 'match' }),
        { kind: 'graph', label: 'repairing on the way up', nodes: nodes({ [p]: 'active', [2 * p]: 'compare', [2 * p + 1]: 'compare' }), edges: links() },
      ],
      vars: { node: `${span[p].lo}..${span[p].hi}`, was: before, now: tree[p] },
    }
  }

  nums[at] = val
  yield {
    line: 14,
    note: `Done. The update touched ${path.length} nodes out of ${Object.keys(tree).length}, one per level. A prefix sum array would have had to rewrite every entry after index ${at}, and a plain array would make the range query O(n) instead. This is the structure that gives you both in log n.`,
    views: [arrayView({ [at]: 'match' }), { kind: 'graph', label: 'segment tree, consistent again', nodes: nodes({ 1: 'match' }), edges: links() }],
    vars: { 'new total': tree[1], 'nodes touched': path.length, 'nodes in tree': Object.keys(tree).length },
    result: `index ${at} set to ${val}, total now ${tree[1]}, ${path.length} nodes touched`,
  }
}

export const segmentTree: Algorithm = {
  id: 'segment-tree',
  name: 'Segment Tree',
  blurb: 'Range queries and updates, both in log n, when prefix sums cannot cope.',
  realWorld:
    'Time-series databases use this shape to answer "sum over this window" while points are still arriving, and a spreadsheet recalculating a SUM over a column you just edited is doing the same repair walk. Competitive programming leans on it constantly.',
  idea:
    'Prefix sums make range queries free and updates ruinous, because changing one element invalidates every prefix after it. Store sums over ranges instead of over prefixes: each node covers an interval and holds the total for it, its children split that interval in half. An update touches exactly one node per level on the way down and repairs one per level on the way up.',
  useWhen:
    'Range queries mixed with updates. If the array never changes, use prefix sums, which are simpler and faster. If it does, this is the answer, and it generalises beyond sums: min, max and gcd all work, because the only requirement is that combining two children is associative.',
  pitfall:
    'Reaching for it when prefix sums would do, which is most of the time, and when a Fenwick tree would do, which is simpler to write for plain sums. Also the array indexing: a node at index i has children at 2i and 2i+1, so the array must be four times n rather than two, to survive sizes that are not powers of two.',
  complexity: { time: 'O(log n) per query or update', space: 'O(n)' },
  code,
  inputs: [
    { name: 'nums', label: 'nums', kind: 'numbers', value: '3, 1, 4, 1, 5, 9, 2, 6' },
    { name: 'index', label: 'update index', kind: 'number', value: 5 },
    { name: 'value', label: 'new value', kind: 'number', value: 0 },
  ],
  run,
}
