import type { GraphEdge, GraphNode, Role } from '../../engine/types'
import { FILL, STROKE, TEXT } from './svgColors'

const UNIT = 74
const R = 20
const PAD = 26

type Pt = { x: number; y: number }

/** Pulls the arrow head back to the rim of the target circle instead of its centre. */
function trim(from: Pt, to: Pt, back: number) {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const len = Math.hypot(dx, dy) || 1
  return { x: to.x - (dx / len) * back, y: to.y - (dy / len) * back }
}

export function GraphView({ nodes, edges, label }: { nodes: GraphNode[]; edges: GraphEdge[]; label?: string }) {
  const at = (id: string) => nodes.find((n) => n.id === id)
  const px = (n: { x: number; y: number }) => ({ x: n.x * UNIT + PAD + R, y: n.y * UNIT + PAD + R })

  const width = Math.max(...nodes.map((n) => n.x), 0) * UNIT + (PAD + R) * 2
  const height = Math.max(...nodes.map((n) => n.y), 0) * UNIT + (PAD + R) * 2

  return (
    <div className="min-w-0">
      {label && <div className="mb-2 text-xs uppercase tracking-wider text-slate-500">{label}</div>}
      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <svg width={width} height={height} role="img" aria-label="graph">
          <defs>
            {(['idle', 'active', 'compare', 'match', 'visited', 'excluded'] as Role[]).map((role) => (
              <marker
                key={role}
                id={`arrow-${role}`}
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill={STROKE[role]} />
              </marker>
            ))}
          </defs>

          {edges.map((e, i) => {
            const a = at(e.from)
            const b = at(e.to)
            if (!a || !b) return null
            const pa = px(a)
            const pb = px(b)
            const end = e.directed === false ? pb : trim(pa, pb, R + 7)
            const role = e.role ?? 'idle'
            const mid = { x: (pa.x + end.x) / 2, y: (pa.y + end.y) / 2 }
            return (
              <g key={i}>
                <line
                  x1={pa.x}
                  y1={pa.y}
                  x2={end.x}
                  y2={end.y}
                  stroke={STROKE[role]}
                  strokeWidth={role === 'idle' ? 2 : 3}
                  markerEnd={e.directed === false ? undefined : `url(#arrow-${role})`}
                />
                {e.label !== undefined && (
                  <>
                    <circle cx={mid.x} cy={mid.y} r={10} fill="#0f172a" />
                    <text
                      x={mid.x}
                      y={mid.y + 4}
                      textAnchor="middle"
                      fontSize={11}
                      fontFamily="ui-monospace, monospace"
                      fill={role === 'idle' ? '#94a3b8' : STROKE[role]}
                    >
                      {e.label}
                    </text>
                  </>
                )}
              </g>
            )
          })}

          {nodes.map((n) => {
            const p = px(n)
            const role = n.role ?? 'idle'
            return (
              <g key={n.id}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={R}
                  fill={FILL[role]}
                  stroke={role === 'active' ? '#fcd34d' : STROKE[role]}
                  strokeWidth={role === 'active' ? 3 : 1.5}
                />
                <text
                  x={p.x}
                  y={p.y + 4}
                  textAnchor="middle"
                  fill={TEXT[role]}
                  fontSize={13}
                  fontFamily="ui-monospace, monospace"
                >
                  {n.label}
                </text>
                {n.sub !== undefined && (
                  <text x={p.x} y={p.y + R + 14} textAnchor="middle" fill="#64748b" fontSize={10} fontFamily="ui-monospace, monospace">
                    {n.sub}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
