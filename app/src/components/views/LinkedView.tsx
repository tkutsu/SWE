import type { LinkedNode } from '../../engine/types'
import { FILL, STROKE, TEXT } from './svgColors'

const W = 56
const H = 38
const GAP = 34
const TOP = 34
const PAD = 10

type Props = {
  order: string[]
  nodes: Record<string, LinkedNode>
  pointers?: { name: string; id: string | null }[]
  label?: string
}

/**
 * Boxes keep their left-to-right slot while `next` pointers move, so reversing a
 * list reads as arrows flipping rather than boxes shuffling. A pointer that runs
 * backwards is drawn as an arc above the row so it cannot be confused with a
 * forward one.
 */
export function LinkedView({ order, nodes, pointers, label }: Props) {
  const slot = (id: string) => order.indexOf(id)
  const x = (i: number) => PAD + i * (W + GAP)
  const width = PAD * 2 + order.length * (W + GAP) + 24
  const height = TOP + H + 44

  const nullX = x(order.length)

  return (
    <div className="min-w-0">
      {label && <div className="mb-2 text-xs uppercase tracking-wider text-slate-500">{label}</div>}
      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <svg width={width} height={height} role="img" aria-label="linked list">
          <defs>
            <marker id="ll-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
            </marker>
            <marker id="ll-arrow-on" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#fbbf24" />
            </marker>
          </defs>

          {order.map((id) => {
            const node = nodes[id]
            if (!node) return null
            const i = slot(id)
            const from = x(i) + W
            const midY = TOP + H / 2
            const on = node.role === 'active'

            if (node.next === null) {
              return (
                <g key={`e${id}`}>
                  <line x1={from} y1={midY} x2={from + GAP - 8} y2={midY} stroke={on ? '#fbbf24' : '#64748b'} strokeWidth={2} markerEnd={on ? 'url(#ll-arrow-on)' : 'url(#ll-arrow)'} />
                  <text x={from + GAP + 4} y={midY + 4} fontSize={11} fontFamily="ui-monospace, monospace" fill="#64748b">
                    null
                  </text>
                </g>
              )
            }

            const j = slot(node.next)
            if (j < 0) return null
            const to = x(j) + (j > i ? 0 : W)
            const backwards = j < i

            if (!backwards) {
              return (
                <line
                  key={`e${id}`}
                  x1={from}
                  y1={midY}
                  x2={to - 8}
                  y2={midY}
                  stroke={on ? '#fbbf24' : '#64748b'}
                  strokeWidth={2}
                  markerEnd={on ? 'url(#ll-arrow-on)' : 'url(#ll-arrow)'}
                />
              )
            }

            // Backward pointer: arc over the top so direction is unmistakable.
            const sx = x(i) + W / 2
            const ex = x(j) + W / 2
            const lift = TOP - 18
            return (
              <path
                key={`e${id}`}
                d={`M ${sx} ${TOP} C ${sx} ${lift}, ${ex} ${lift}, ${ex + 8} ${TOP}`}
                fill="none"
                stroke={on ? '#fbbf24' : '#64748b'}
                strokeWidth={2}
                markerEnd={on ? 'url(#ll-arrow-on)' : 'url(#ll-arrow)'}
              />
            )
          })}

          {order.map((id) => {
            const node = nodes[id]
            if (!node) return null
            const i = slot(id)
            const role = node.role ?? 'idle'
            return (
              <g key={id}>
                <rect
                  x={x(i)}
                  y={TOP}
                  width={W}
                  height={H}
                  rx={6}
                  fill={FILL[role]}
                  stroke={role === 'active' ? '#fcd34d' : STROKE[role]}
                  strokeWidth={role === 'active' ? 2.5 : 1.5}
                />
                <text
                  x={x(i) + W / 2}
                  y={TOP + H / 2 + 4}
                  textAnchor="middle"
                  fill={TEXT[role]}
                  fontSize={13}
                  fontFamily="ui-monospace, monospace"
                >
                  {node.label}
                </text>
                {node.sub !== undefined && (
                  <text x={x(i) + W / 2} y={TOP + H + 14} textAnchor="middle" fill="#64748b" fontSize={10} fontFamily="ui-monospace, monospace">
                    {node.sub}
                  </text>
                )}
              </g>
            )
          })}

          {(pointers ?? []).map((p, k) => {
            const i = p.id === null ? order.length : slot(p.id)
            if (i < 0) return null
            const cx = p.id === null ? nullX + 12 : x(i) + W / 2
            return (
              <text
                key={p.name}
                x={cx}
                y={TOP - 8 - k * 12}
                textAnchor="middle"
                fontSize={11}
                fontWeight={600}
                fontFamily="ui-monospace, monospace"
                fill="#fcd34d"
              >
                {p.name}
              </text>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
