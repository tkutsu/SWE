import { useNarrow } from '../lib/media'
import { TONE_BOX, TONE_HEAD, TONE_SVG, tonesUsed, type Tone, type Visual } from '../lib/visual'

/** Short, because the key now shares a line with the caption. */
const TONE_MEANING: Record<Exclude<Tone, 'neutral'>, string> = {
  good: 'reach for this',
  accent: 'has a catch',
  bad: 'the trap',
  muted: 'superseded',
}

/**
 * A chart labels every curve, a venn says what green means underneath itself
 * and a triangle marks the two it picked. Printing a key for those explains a
 * colour nobody had to decode.
 */
const SELF_LABELLING = new Set(['chart', 'venn', 'triangle'])

const t = (x?: Tone): Tone => x ?? 'neutral'

/** Monospace at these sizes is close enough to constant width to lay out against. */
const monoW = (s: string, size = 10) => s.length * size * 0.6

/**
 * The caption and the colour key are one row, not two. The key used to sit on
 * its own line under every diagram on every page, which is a line of furniture
 * on a page whose job is to get read.
 */
function CaptionRow({ caption, visuals }: { caption?: string; visuals: Visual[] }) {
  const relevant = visuals.filter((v) => !SELF_LABELLING.has(v.kind))
  const all = new Set(relevant.flatMap((v) => [...tonesUsed(v)]))
  const order: Tone[] = ['good', 'accent', 'bad', 'muted']
  const used = [...all]
    .filter((x): x is Exclude<Tone, 'neutral'> => x !== 'neutral')
    .sort((a, b) => order.indexOf(a) - order.indexOf(b))

  if (!caption && used.length === 0) return null

  return (
    <p className="mt-3 text-[12px] leading-relaxed text-slate-500">
      {caption}
      {used.map((x) => (
        <span key={x} className="ml-3 inline-flex items-center gap-1.5 whitespace-nowrap text-[11px] text-slate-600">
          <span className={`inline-block h-2.5 w-2.5 rounded-sm border ${TONE_BOX[x]}`} />
          {TONE_MEANING[x]}
        </span>
      ))}
    </p>
  )
}

function Compare({ v }: { v: Extract<Visual, { kind: 'compare' }> }) {
  const cols = v.columns.length
  return (
    <div className={`grid gap-3 ${cols === 3 ? 'sm:grid-cols-3' : cols === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-4'}`}>
      {v.columns.map((c, i) => (
        <div key={i} className={`rounded-lg border p-3 ${TONE_BOX[t(c.tone)]}`}>
          <div className={`text-[13px] font-semibold ${TONE_HEAD[t(c.tone)]}`}>{c.title}</div>
          {c.sub && <div className="mt-0.5 text-[11px] text-slate-500">{c.sub}</div>}
          <ul className="mt-2 flex flex-col gap-1.5">
            {c.rows.map((r, j) => (
              <li key={j} className="flex gap-1.5 text-[12px] leading-snug text-slate-300">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-slate-600" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

/**
 * The axis stretches until the tightest labelled bar fits its own words, which
 * is what stopped "do you find your own weak point" running out of the far end
 * of the chart. Past a point stretching makes the drawing scale down instead,
 * so a label that still does not fit is cut with the whole of it on hover.
 */
function Timeline({ v }: { v: Extract<Visual, { kind: 'timeline' }> }) {
  const LANE_H = 46
  const LABEL_W = 108
  const RIGHT = 14
  const BASE = 498
  const MAX = 760

  const wanted = v.lanes.flatMap((lane) =>
    lane.events.filter((e) => e.width).map((e) => ((monoW(e.label) + 14) * v.span) / e.width!),
  )
  const plot = Math.min(MAX, Math.max(BASE, ...wanted))
  const W = LABEL_W + plot + RIGHT
  const height = v.lanes.length * LANE_H + 26
  const x = (n: number) => LABEL_W + (n / v.span) * plot

  const fit = (label: string, room: number) => {
    const chars = Math.floor(room / 6)
    return label.length <= chars ? label : `${label.slice(0, Math.max(1, chars - 3))}...`
  }

  return (
    <div className="-mx-1 px-1 pb-1">
      <svg
        viewBox={`0 0 ${W} ${height}`}
        width={W}
        height={height}
        style={{ width: '100%', maxWidth: Math.round(W * 1.3), height: 'auto' }}
        role="img"
        aria-label="timeline"
      >
        {v.lanes.map((lane, li) => {
          const y = li * LANE_H + 14
          return (
            <g key={li}>
              <text x={0} y={y + 18} fontSize={11} fill="#94a3b8" fontFamily="ui-sans-serif, system-ui">
                {lane.label}
              </text>
              <line x1={LABEL_W} y1={y + 14} x2={W - RIGHT} y2={y + 14} stroke="#1e293b" strokeWidth={2} />
              {lane.events.map((e, ei) => {
                const c = TONE_SVG[t(e.tone)]
                const w = e.width ? (e.width / v.span) * plot : 0
                return w > 0 ? (
                  <g key={ei}>
                    <title>{e.label}</title>
                    <rect x={x(e.at)} y={y + 4} width={Math.max(w, 6)} height={20} rx={4} fill={c.fill} stroke={c.stroke} />
                    <text x={x(e.at) + 6} y={y + 18} fontSize={10} fill={c.text} fontFamily="ui-monospace, monospace">
                      {fit(e.label, w - 12)}
                    </text>
                  </g>
                ) : (
                  <g key={ei}>
                    <circle cx={x(e.at)} cy={y + 14} r={6} fill={c.fill} stroke={c.stroke} strokeWidth={2} />
                    <text x={x(e.at)} y={y + 1} fontSize={10} textAnchor="middle" fill={c.stroke} fontFamily="ui-monospace, monospace">
                      {e.label}
                    </text>
                  </g>
                )
              })}
            </g>
          )
        })}
        <text x={LABEL_W} y={height - 2} fontSize={10} fill="#475569">
          time
        </text>
      </svg>
    </div>
  )
}

function Stack({ v }: { v: Extract<Visual, { kind: 'stack' }> }) {
  const n = v.layers.length
  return (
    <div className="flex flex-col items-center gap-1.5">
      {v.layers.map((l, i) => {
        const width = v.shape === 'pyramid' ? `${45 + (i / Math.max(1, n - 1)) * 55}%` : '100%'
        return (
          <div key={i} style={{ width }} className={`rounded-lg border px-3 py-2.5 text-center ${TONE_BOX[t(l.tone)]}`}>
            <div className="text-[13px] font-medium">{l.label}</div>
            {l.detail && <div className="mt-0.5 text-[11px] text-slate-400">{l.detail}</div>}
          </div>
        )
      })}
    </div>
  )
}

/**
 * Columns are as wide as their widest line, and the gap after a column is as
 * wide as the longest label that has to sit in it. A fixed 52px gap put 39 edge
 * labels across 20 pages underneath the boxes they ran between: the event loop
 * read "and off" because "hand off" started under the box to its left.
 *
 * On a phone the whole thing is transposed and read top to bottom, because four
 * columns squeezed into 390px is a correct drawing at an unreadable size.
 */
function Flow({ v: given }: { v: Extract<Visual, { kind: 'flow' }> }) {
  const narrow = useNarrow()
  const MIN_W = 116
  const NH = 46
  const GX = 52
  const GY = 34
  const DIP = 30
  const SIDE = 26

  const wide = Math.max(...given.nodes.map((n) => n.x)) + 1
  const v =
    narrow && wide > 2 ? { ...given, nodes: given.nodes.map((n) => ({ ...n, x: n.y, y: n.x })) } : given

  const textW = (s: string | number | undefined, perChar: number) =>
    s === undefined ? 0 : String(s).length * perChar
  const needed = (n: { label: string | number; sub?: string | number }) =>
    Math.max(MIN_W, textW(n.label, 7) + 16, textW(n.sub, 6) + 16)

  const at = (id: string) => v.nodes.find((n) => n.id === id)
  const cols = Math.max(...v.nodes.map((n) => n.x)) + 1
  const colW: number[] = Array.from({ length: cols }, (_, i) =>
    Math.max(MIN_W, ...v.nodes.filter((n) => n.x === i).map(needed)),
  )

  // Only a label on a horizontal edge between neighbouring columns competes for
  // the gap; anything reaching further already crosses a whole column.
  const gap: number[] = Array.from({ length: cols }, () => GX)
  for (const e of v.edges) {
    const a = at(e.from)
    const b = at(e.to)
    if (!e.label || !a || !b || a.y !== b.y || Math.abs(a.x - b.x) !== 1) continue
    gap[Math.min(a.x, b.x)] = Math.max(gap[Math.min(a.x, b.x)], monoW(e.label) + 24)
  }

  const colX: number[] = colW.reduce<number[]>((acc, _, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + colW[i - 1] + gap[i - 1])
    return acc
  }, [])

  const px = (n: { x: number; y: number }) => ({ x: colX[n.x], y: n.y * (NH + GY) })
  const wOf = (n: { x: number }) => colW[n.x]
  const cx = (n: { x: number; y: number }) => px(n).x + wOf(n) / 2
  const cy = (n: { x: number; y: number }) => px(n).y + NH / 2

  const boxW = colX[cols - 1] + colW[cols - 1] + 4
  const boxH = Math.max(...v.nodes.map((n) => n.y)) * (NH + GY) + NH + 20
  const detour = boxW + SIDE

  /**
   * An edge that skips a column used to be a straight line, which ran it
   * through whichever box was standing in the way, and through that box's own
   * labels. Eight pages drew one. Those go round instead: under the row, or
   * out past the right edge for the transposed layout on a phone.
   */
  const geometry = v.edges.flatMap((e) => {
    const a = at(e.from)
    const b = at(e.to)
    if (!a || !b) return []
    const sameRow = a.y === b.y
    const skipsCol = sameRow && Math.abs(a.x - b.x) > 1
    const skipsRow = a.x === b.x && Math.abs(a.y - b.y) > 1

    if (skipsCol) {
      const x1 = cx(a)
      const x2 = cx(b)
      const y1 = px(a).y + NH
      const ctrl = y1 + DIP + 12
      return [{
        e,
        d: `M ${x1} ${y1} Q ${(x1 + x2) / 2} ${ctrl} ${x2} ${y1 + 8}`,
        mx: (x1 + x2) / 2,
        my: 0.25 * y1 + 0.5 * ctrl + 0.25 * (y1 + 8),
        dips: true,
        out: 0,
      }]
    }
    if (skipsRow) {
      const y1 = cy(a)
      const y2 = cy(b)
      const x1 = px(a).x + wOf(a)
      const x2 = px(b).x + wOf(b) + 8
      const ctrl = detour + 12
      const mx = 0.25 * x1 + 0.5 * ctrl + 0.25 * x2
      return [{
        e,
        d: `M ${x1} ${y1} Q ${ctrl} ${(y1 + y2) / 2} ${x2} ${y2}`,
        mx,
        my: (y1 + y2) / 2,
        dips: false,
        out: mx + (e.label ? monoW(e.label) / 2 + 6 : 4),
      }]
    }

    const x1 = sameRow ? (b.x > a.x ? px(a).x + wOf(a) : px(a).x) : cx(a)
    const y1 = sameRow ? cy(a) : b.y > a.y ? px(a).y + NH : px(a).y
    const x2 = sameRow ? (b.x > a.x ? px(b).x - 8 : px(b).x + wOf(b) + 8) : cx(b)
    const y2 = sameRow ? cy(b) : b.y > a.y ? px(b).y - 8 : px(b).y + NH + 8
    return [{ e, d: `M ${x1} ${y1} L ${x2} ${y2}`, mx: (x1 + x2) / 2, my: (y1 + y2) / 2, dips: false, out: 0 }]
  })

  const width = Math.max(boxW, ...geometry.map((g) => g.out))
  // boxH already carries 20px below the last row; a dipping edge and its label
  // reach about 35px past it, so this is the difference and not the whole dip.
  const height = boxH + (geometry.some((g) => g.dips) ? 18 : 0)

  return (
    <div className="-mx-1 px-1 pb-1">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        // Allowed to grow past its natural size. A three-box drawing was pinned
        // at 452px inside a 730px card, which made the picture the smallest
        // thing on a page whose whole point is the picture.
        style={{ width: '100%', maxWidth: Math.round(width * 1.5), height: 'auto' }}
        role="img"
        aria-label="flow diagram"
      >
        <defs>
          {(['neutral', 'good', 'bad', 'accent', 'muted'] as Tone[]).map((tone) => (
            <marker
              key={tone}
              id={`fa-${tone}`}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill={TONE_SVG[tone].stroke} />
            </marker>
          ))}
        </defs>

        {geometry.map((g, i) => (
          <path
            key={i}
            d={g.d}
            fill="none"
            stroke={TONE_SVG[t(g.e.tone)].stroke}
            strokeWidth={2}
            strokeDasharray={g.e.dashed ? '5 4' : undefined}
            markerEnd={`url(#fa-${t(g.e.tone)})`}
          />
        ))}

        {/* Every label after every line, or one edge draws through another's. */}
        {geometry.map((g, i) =>
          g.e.label ? (
            <g key={i}>
              <rect
                x={g.mx - (monoW(g.e.label) + 8) / 2}
                y={g.my - 9}
                width={monoW(g.e.label) + 8}
                height={16}
                rx={4}
                fill="#0f172a"
              />
              <text x={g.mx} y={g.my + 3} textAnchor="middle" fontSize={10} fill="#94a3b8" fontFamily="ui-monospace, monospace">
                {g.e.label}
              </text>
            </g>
          ) : null,
        )}

        {v.nodes.map((n) => {
          const c = TONE_SVG[t(n.tone)]
          const p = px(n)
          return (
            <g key={n.id}>
              <rect x={p.x} y={p.y} width={wOf(n)} height={NH} rx={8} fill={c.fill} stroke={c.stroke} strokeWidth={1.5} />
              <text
                x={p.x + wOf(n) / 2}
                y={p.y + (n.sub ? 20 : 27)}
                textAnchor="middle"
                fontSize={12}
                fill={c.text}
                fontFamily="ui-sans-serif, system-ui"
              >
                {n.label}
              </text>
              {n.sub && (
                <text x={p.x + wOf(n) / 2} y={p.y + 34} textAnchor="middle" fontSize={10} fill="#94a3b8" fontFamily="ui-monospace, monospace">
                  {n.sub}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function Venn({ v }: { v: Extract<Visual, { kind: 'venn' }> }) {
  const ON = '#10b981'
  const OFF = '#1e293b'

  return (
    <div>
      <div className="flex flex-wrap gap-4">
        {v.variants.map((va, i) => (
          <figure key={i} className="m-0">
            <svg width={146} height={82} role="img" aria-label={va.label}>
              <defs>
                <clipPath id={`vc-${i}`}>
                  <circle cx={56} cy={40} r={30} />
                </clipPath>
              </defs>
              <circle cx={56} cy={40} r={30} fill={va.leftOnly ? ON : OFF} opacity={va.leftOnly ? 0.6 : 0.55} />
              <circle cx={90} cy={40} r={30} fill={va.rightOnly ? ON : OFF} opacity={va.rightOnly ? 0.6 : 0.55} />
              <g clipPath={`url(#vc-${i})`}>
                <circle cx={90} cy={40} r={30} fill={va.both ? ON : OFF} opacity={va.both ? 0.95 : 0.8} />
              </g>
              <circle cx={56} cy={40} r={30} fill="none" stroke="#64748b" strokeWidth={1.25} />
              <circle cx={90} cy={40} r={30} fill="none" stroke="#64748b" strokeWidth={1.25} />
              <text x={34} y={44} textAnchor="middle" fontSize={10} fill="#cbd5e1" fontFamily="ui-monospace, monospace">
                {v.left}
              </text>
              <text x={112} y={44} textAnchor="middle" fontSize={10} fill="#cbd5e1" fontFamily="ui-monospace, monospace">
                {v.right}
              </text>
              <text x={73} y={78} textAnchor="middle" fontSize={11} fill="#94a3b8" fontFamily="ui-monospace, monospace">
                {va.label}
              </text>
            </svg>
          </figure>
        ))}
      </div>
      <p className="mt-1 text-[11px] text-slate-600">green is what comes back</p>
    </div>
  )
}

function Triangle({ v }: { v: Extract<Visual, { kind: 'triangle' }> }) {
  const pts: [number, number][] = [
    [160, 24],
    [36, 186],
    [284, 186],
  ]
  const picked = new Set(v.pick ?? [])
  return (
    <svg
      viewBox="0 0 320 214"
      width={320}
      height={214}
      style={{ width: '100%', maxWidth: 460, height: 'auto' }}
      role="img"
      aria-label="pick two of three"
    >
      <polygon points={pts.map((p) => p.join(',')).join(' ')} fill="#0f172a" stroke="#334155" strokeWidth={2} />
      {pts.map((p, i) => {
        const chosen = picked.has(i)
        const c = TONE_SVG[chosen ? 'good' : 'muted']
        return (
          <g key={i}>
            <circle cx={p[0]} cy={p[1]} r={28} fill={c.fill} stroke={chosen ? c.stroke : '#475569'} strokeWidth={chosen ? 3 : 1.5} />
            <text x={p[0]} y={p[1] + 4} textAnchor="middle" fontSize={12} fill={chosen ? c.text : '#cbd5e1'} fontFamily="ui-sans-serif, system-ui">
              {v.vertices[i]}
            </text>
            {v.subs && (
              <text x={p[0]} y={p[1] + (i === 0 ? -36 : 46)} textAnchor="middle" fontSize={10} fill="#64748b">
                {v.subs[i]}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

function Table({ v }: { v: Extract<Visual, { kind: 'table' }> }) {
  return (
    <div className="-mx-1 overflow-x-auto px-1">
      <table className="w-full min-w-[420px] border-collapse text-left">
        <thead>
          <tr>
            {v.head.map((h, i) => (
              <th key={i} className="border-b border-slate-700 pb-2 pr-3 text-[11px] uppercase tracking-wider text-slate-500">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {v.rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => {
                const text = typeof cell === 'string' ? cell : cell.text
                const tone = typeof cell === 'string' ? 'neutral' : t(cell.tone)
                return (
                  <td
                    key={j}
                    className={`border-b border-slate-800/70 py-2 pr-3 align-top text-[12px] leading-snug ${
                      j === 0 ? 'font-mono ' : ''
                    }${TONE_HEAD[tone] === 'text-slate-400' ? 'text-slate-300' : TONE_HEAD[tone]}`}
                  >
                    {text}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Chart({ v }: { v: Extract<Visual, { kind: 'chart' }> }) {
  const W = 420
  const H = 210
  const PAD_L = 34
  const PAD_B = 26
  const PAD_R = 76
  const PAD_T = 24
  const px = (x: number) => PAD_L + x * (W - PAD_L - PAD_R)
  const py = (y: number) => H - PAD_B - y * (H - PAD_B - PAD_T)

  return (
    <div className="-mx-1 px-1 pb-1">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        style={{ width: '100%', maxWidth: Math.round(W * 1.5), height: 'auto' }}
        role="img"
        aria-label="growth curves"
      >
        <line x1={PAD_L} y1={H - PAD_B} x2={W - PAD_R} y2={H - PAD_B} stroke="#334155" strokeWidth={1.5} />
        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={H - PAD_B} stroke="#334155" strokeWidth={1.5} />
        <text x={(PAD_L + W - PAD_R) / 2} y={H - 6} textAnchor="middle" fontSize={10} fill="#64748b">
          {v.xLabel}
        </text>
        <text x={10} y={16} fontSize={10} fill="#64748b">
          {v.yLabel}
        </text>

        {/*
          A series that ends at the top ran off the chart rather than
          levelling off. Its label goes above the plot area, because beside
          the line means on top of whichever curve is still climbing there.
        */}
        {v.series.map((serie, i) => {
          const c = TONE_SVG[t(serie.tone)]
          const d = serie.points.map((p, j) => `${j === 0 ? 'M' : 'L'} ${px(p[0])} ${py(p[1])}`).join(' ')
          const last = serie.points[serie.points.length - 1]
          const runsOff = last[1] > 0.9 && last[0] < 0.9
          return (
            <g key={i}>
              <path d={d} fill="none" stroke={c.stroke} strokeWidth={2.5} strokeLinecap="round" />
              <text
                x={px(last[0]) + (runsOff ? 2 : 6)}
                y={runsOff ? PAD_T - 8 : py(last[1]) + 4}
                fontSize={11}
                fill={c.stroke}
                fontFamily="ui-monospace, monospace"
              >
                {serie.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function Boxes({ v }: { v: Extract<Visual, { kind: 'boxes' }> }) {
  const cols = v.columns ?? 2
  const grid =
    cols === 4 ? 'sm:grid-cols-4' : cols === 3 ? 'sm:grid-cols-3' : cols === 1 ? 'grid-cols-1' : 'sm:grid-cols-2'
  return (
    <div className={`grid gap-2.5 ${grid}`}>
      {v.items.map((it, i) => (
        <div key={i} className={`rounded-lg border px-3 py-2.5 ${TONE_BOX[t(it.tone)]}`}>
          <div className="text-[13px] font-medium">{it.label}</div>
          {it.detail && <div className="mt-1 text-[11.5px] leading-snug text-slate-400">{it.detail}</div>}
        </div>
      ))}
    </div>
  )
}

/** A concept may carry several diagrams; they stack with a rule between them. */
export function ConceptVisual({ visual }: { visual: Visual | Visual[] }) {
  const all = Array.isArray(visual) ? visual : [visual]
  return (
    <div className="flex flex-col gap-5">
      {all.map((v, i) => (
        <div key={i} className={i > 0 ? 'border-t border-slate-800 pt-5' : ''}>
          <Body visual={v} />
          <CaptionRow caption={v.caption} visuals={i === all.length - 1 ? all : []} />
        </div>
      ))}
    </div>
  )
}

function Body({ visual }: { visual: Visual }) {
  switch (visual.kind) {
    case 'compare':
      return <Compare v={visual} />
    case 'timeline':
      return <Timeline v={visual} />
    case 'stack':
      return <Stack v={visual} />
    case 'flow':
      return <Flow v={visual} />
    case 'venn':
      return <Venn v={visual} />
    case 'triangle':
      return <Triangle v={visual} />
    case 'table':
      return <Table v={visual} />
    case 'boxes':
      return <Boxes v={visual} />
    case 'chart':
      return <Chart v={visual} />
  }
}
