import type { Role, TreeNode } from '../../engine/types'

const FILL: Record<Role, string> = {
  idle: '#1e293b',
  active: '#fbbf24',
  compare: '#0ea5e9',
  match: '#10b981',
  window: '#4338ca',
  excluded: '#0f172a',
  visited: '#10b981',
  frontier: '#0284c7',
  path: '#10b981',
  wall: '#020617',
}

const TEXT: Record<Role, string> = {
  idle: '#e2e8f0',
  active: '#0f172a',
  compare: '#ffffff',
  match: '#ffffff',
  window: '#e0e7ff',
  excluded: '#475569',
  visited: '#ffffff',
  frontier: '#ffffff',
  path: '#ffffff',
  wall: '#334155',
}

const GAP_X = 52
const GAP_Y = 68
const R = 19

/**
 * Classic tidy-enough layout: x from the inorder position, y from the depth.
 * Good enough for the tree sizes this app allows, and it never overlaps.
 */
function layout(root: string | null, nodes: Record<string, TreeNode>) {
  const pos: Record<string, { x: number; y: number }> = {}
  let counter = 0
  let maxDepth = 0

  const walk = (id: string | undefined, depth: number) => {
    if (!id || !nodes[id]) return
    walk(nodes[id].left, depth + 1)
    pos[id] = { x: counter++ * GAP_X + R + 8, y: depth * GAP_Y + R + 8 }
    maxDepth = Math.max(maxDepth, depth)
    walk(nodes[id].right, depth + 1)
  }
  walk(root ?? undefined, 0)

  return { pos, width: counter * GAP_X + R * 2 + 8, height: (maxDepth + 1) * GAP_Y + R }
}

export function TreeView({ root, nodes, label }: { root: string | null; nodes: Record<string, TreeNode>; label?: string }) {
  const { pos, width, height } = layout(root, nodes)
  const edges: { from: string; to: string }[] = []
  for (const n of Object.values(nodes)) {
    if (n.left && pos[n.left]) edges.push({ from: n.id, to: n.left })
    if (n.right && pos[n.right]) edges.push({ from: n.id, to: n.right })
  }

  return (
    <div className="min-w-0">
      {label && <div className="mb-2 text-xs uppercase tracking-wider text-slate-500">{label}</div>}
      <div className="-mx-1 overflow-x-auto px-1 pb-1">
      <svg width={width} height={height} role="img" aria-label="binary tree">
        {edges.map((e, i) => (
          <line
            key={i}
            x1={pos[e.from].x}
            y1={pos[e.from].y}
            x2={pos[e.to].x}
            y2={pos[e.to].y}
            stroke="#334155"
            strokeWidth={2}
          />
        ))}
        {Object.values(nodes).map((n) =>
          pos[n.id] ? (
            <g key={n.id} className="transition-all duration-200">
              <circle
                cx={pos[n.id].x}
                cy={pos[n.id].y}
                r={R}
                fill={FILL[n.role ?? 'idle']}
                stroke={n.role === 'active' ? '#fcd34d' : '#475569'}
                strokeWidth={n.role === 'active' ? 3 : 1.5}
              />
              <text
                x={pos[n.id].x}
                y={pos[n.id].y + 4}
                textAnchor="middle"
                fill={TEXT[n.role ?? 'idle']}
                fontSize={13}
                fontFamily="ui-monospace, monospace"
              >
                {n.value}
              </text>
            </g>
          ) : null,
        )}
      </svg>
      </div>
    </div>
  )
}
