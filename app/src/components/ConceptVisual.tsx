import { TONE_BOX, TONE_HEAD, TONE_SVG, tonesUsed, type Tone, type Visual } from '../lib/visual'

const TONE_MEANING: Record<Exclude<Tone, 'neutral'>, string> = {
  good: 'the default, what to reach for',
  accent: 'situational, or has a catch',
  bad: 'the trap',
  muted: 'superseded',
}

/**
 * Only the colours actually used, so the key is never noise, and once per
 * page rather than once per diagram: Big O carries two diagrams and printed
 * the same four lines under each of them.
 */
function Key({ visuals }: { visuals: Visual[] }) {
  const all = new Set(visuals.flatMap((v) => [...tonesUsed(v)]))
  const used = [...all].filter((t): t is Exclude<Tone, 'neutral'> => t !== 'neutral')
  if (used.length === 0) return null
  const order: Tone[] = ['good', 'accent', 'bad', 'muted']
  used.sort((a, b) => order.indexOf(a) - order.indexOf(b))

  return (
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-slate-800 pt-3">
      {used.map((t) => (
        <div key={t} className="flex items-center gap-1.5">
          <span className={`inline-block h-3 w-3 rounded-sm border ${TONE_BOX[t]}`} />
          <span className="text-[11px] text-slate-500">{TONE_MEANING[t]}</span>
        </div>
      ))}
    </div>
  )
}

const t = (x?: Tone): Tone => x ?? 'neutral'

function Caption({ text }: { text?: string }) {
  if (!text) return null
  return <p className="mt-3 text-[12px] leading-relaxed text-slate-500">{text}</p>
}

function Compare({ v }: { v: Extract<Visual, { kind: 'compare' }> }) {
  const cols = v.columns.length
  return (
    <div>
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
      <Caption text={v.caption} />
    </div>
  )
}

function Timeline({ v }: { v: Extract<Visual, { kind: 'timeline' }> }) {
  const W = 620
  const LANE_H = 46
  const LABEL_W = 108
  const height = v.lanes.length * LANE_H + 26
  const x = (n: number) => LABEL_W + (n / v.span) * (W - LABEL_W - 14)

  return (
    <div>
      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <svg width={W} height={height} role="img" aria-label="timeline">
          {v.lanes.map((lane, li) => {
            const y = li * LANE_H + 14
            return (
              <g key={li}>
                <text x={0} y={y + 18} fontSize={11} fill="#94a3b8" fontFamily="ui-sans-serif, system-ui">
                  {lane.label}
                </text>
                <line x1={LABEL_W} y1={y + 14} x2={W - 14} y2={y + 14} stroke="#1e293b" strokeWidth={2} />
                {lane.events.map((e, ei) => {
                  const c = TONE_SVG[t(e.tone)]
                  const w = e.width ? (e.width / v.span) * (W - LABEL_W - 14) : 0
                  return w > 0 ? (
                    <g key={ei}>
                      <rect x={x(e.at)} y={y + 4} width={Math.max(w, 6)} height={20} rx={4} fill={c.fill} stroke={c.stroke} />
                      <text x={x(e.at) + 6} y={y + 18} fontSize={10} fill={c.text} fontFamily="ui-monospace, monospace">
                        {e.label}
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
      <Caption text={v.caption} />
    </div>
  )
}

function Stack({ v }: { v: Extract<Visual, { kind: 'stack' }> }) {
  const n = v.layers.length
  return (
    <div>
      <div className="flex flex-col items-center gap-1.5">
        {v.layers.map((l, i) => {
          const width = v.shape === 'pyramid' ? `${45 + (i / Math.max(1, n - 1)) * 55}%` : '100%'
          return (
            <div
              key={i}
              style={{ width }}
              className={`rounded-lg border px-3 py-2.5 text-center ${TONE_BOX[t(l.tone)]}`}
            >
              <div className="text-[13px] font-medium">{l.label}</div>
              {l.detail && <div className="mt-0.5 text-[11px] text-slate-400">{l.detail}</div>}
            </div>
          )
        })}
      </div>
      <Caption text={v.caption} />
    </div>
  )
}

/**
 * Boxes were a fixed 116px whatever was written in them, so a sub of "not
 * garbage collected" ran out of its box at every width. Columns are now as
 * wide as their widest line, and the whole drawing scales down rather than
 * scrolling, which is what used to hide the last node on a phone.
 */
function Flow({ v }: { v: Extract<Visual, { kind: 'flow' }> }) {
  const MIN_W = 116
  const NH = 46
  const GX = 52
  const GY = 34
  // SVG has no text metrics without measuring, and these two faces are close
  // enough to constant width at these sizes for a layout estimate.
  const textW = (s: string | number | undefined, perChar: number) => (s === undefined ? 0 : String(s).length * perChar)
  const needed = (n: { label: string | number; sub?: string | number }) =>
    Math.max(MIN_W, textW(n.label, 7) + 16, textW(n.sub, 6) + 16)

  const cols = Math.max(...v.nodes.map((n) => n.x)) + 1
  const colW: number[] = Array.from({ length: cols }, (_, i) =>
    Math.max(MIN_W, ...v.nodes.filter((n) => n.x === i).map(needed)),
  )
  const colX: number[] = colW.reduce<number[]>((acc, _, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + colW[i - 1] + GX)
    return acc
  }, [])

  const at = (id: string) => v.nodes.find((n) => n.id === id)
  const px = (n: { x: number; y: number }) => ({ x: colX[n.x], y: n.y * (NH + GY) })
  const wOf = (n: { x: number }) => colW[n.x]
  const cx = (n: { x: number; y: number }) => px(n).x + wOf(n) / 2
  const cy = (n: { x: number; y: number }) => px(n).y + NH / 2

  const width = colX[cols - 1] + colW[cols - 1] + 4
  const height = Math.max(...v.nodes.map((n) => n.y)) * (NH + GY) + NH + 20

  return (
    <div>
      <div className="-mx-1 px-1 pb-1">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width={width}
          height={height}
          style={{ width: '100%', maxWidth: width, height: 'auto' }}
          role="img"
          aria-label="flow diagram"
        >
          <defs>
            {(['neutral', 'good', 'bad', 'accent', 'muted'] as Tone[]).map((tone) => (
              <marker key={tone} id={`fa-${tone}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill={TONE_SVG[tone].stroke} />
              </marker>
            ))}
          </defs>

          {v.edges.map((e, i) => {
            const a = at(e.from)
            const b = at(e.to)
            if (!a || !b) return null
            const tone = t(e.tone)
            const sameRow = a.y === b.y
            const x1 = sameRow ? (b.x > a.x ? px(a).x + wOf(a) : px(a).x) : cx(a)
            const y1 = sameRow ? cy(a) : b.y > a.y ? px(a).y + NH : px(a).y
            const x2 = sameRow ? (b.x > a.x ? px(b).x - 8 : px(b).x + wOf(b) + 8) : cx(b)
            const y2 = sameRow ? cy(b) : b.y > a.y ? px(b).y - 8 : px(b).y + NH + 8
            const mx = (x1 + x2) / 2
            const my = (y1 + y2) / 2
            return (
              <g key={i}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={TONE_SVG[tone].stroke}
                  strokeWidth={2}
                  strokeDasharray={e.dashed ? '5 4' : undefined}
                  markerEnd={`url(#fa-${tone})`}
                />
                {e.label && (
                  <>
                    <rect x={mx - e.label.length * 3 - 4} y={my - 9} width={e.label.length * 6 + 8} height={16} rx={4} fill="#0f172a" />
                    <text x={mx} y={my + 3} textAnchor="middle" fontSize={10} fill="#94a3b8" fontFamily="ui-monospace, monospace">
                      {e.label}
                    </text>
                  </>
                )}
              </g>
            )
          })}

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
      <Caption text={v.caption} />
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
      <Caption text={v.caption} />
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
    <div>
      <svg width={320} height={214} role="img" aria-label="pick two of three" className="max-w-full">
        <polygon
          points={pts.map((p) => p.join(',')).join(' ')}
          fill="#0f172a"
          stroke="#334155"
          strokeWidth={2}
        />
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
      <Caption text={v.caption} />
    </div>
  )
}

function Table({ v }: { v: Extract<Visual, { kind: 'table' }> }) {
  return (
    <div>
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
      <Caption text={v.caption} />
    </div>
  )
}

function Chart({ v }: { v: Extract<Visual, { kind: 'chart' }> }) {
  const W = 420
  const H = 210
  const PAD_L = 34
  const PAD_B = 26
  const PAD_R = 76
  const px = (x: number) => PAD_L + x * (W - PAD_L - PAD_R)
  const py = (y: number) => H - PAD_B - y * (H - PAD_B - 14)

  return (
    <div>
      <div className="-mx-1 px-1 pb-1">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width={W}
          height={H}
          style={{ width: '100%', maxWidth: W, height: 'auto' }}
          role="img"
          aria-label="growth curves"
        >
          <line x1={PAD_L} y1={H - PAD_B} x2={W - PAD_R} y2={H - PAD_B} stroke="#334155" strokeWidth={1.5} />
          <line x1={PAD_L} y1={14} x2={PAD_L} y2={H - PAD_B} stroke="#334155" strokeWidth={1.5} />
          <text x={(PAD_L + W - PAD_R) / 2} y={H - 6} textAnchor="middle" fontSize={10} fill="#64748b">
            {v.xLabel}
          </text>
          <text x={10} y={16} fontSize={10} fill="#64748b">
            {v.yLabel}
          </text>

          {/*
            A series that ends at the top ran off the chart rather than
            levelling off, and its label lands mid-plot instead of in the right
            margin. Those get stacked a row apart so two of them never collide.
          */}
          {(() => {
            let stacked = 0
            return v.series.map((serie, i) => {
            const c = TONE_SVG[t(serie.tone)]
            const d = serie.points.map((p, j) => `${j === 0 ? 'M' : 'L'} ${px(p[0])} ${py(p[1])}`).join(' ')
            const last = serie.points[serie.points.length - 1]
            const runsOff = last[1] > 0.9 && last[0] < 0.9
            const row = runsOff ? stacked++ : 0
            return (
              <g key={i}>
                <path d={d} fill="none" stroke={c.stroke} strokeWidth={2.5} strokeLinecap="round" />
                <text
                  x={px(last[0]) + 6}
                  y={py(last[1]) + 4 + row * 14}
                  fontSize={11}
                  fill={c.stroke}
                  fontFamily="ui-monospace, monospace"
                >
                  {serie.label}
                </text>
              </g>
            )
            })
          })()}
        </svg>
      </div>
      <Caption text={v.caption} />
    </div>
  )
}

function Boxes({ v }: { v: Extract<Visual, { kind: 'boxes' }> }) {
  const cols = v.columns ?? 2
  const grid =
    cols === 4 ? 'sm:grid-cols-4' : cols === 3 ? 'sm:grid-cols-3' : cols === 1 ? 'grid-cols-1' : 'sm:grid-cols-2'
  return (
    <div>
      <div className={`grid gap-2.5 ${grid}`}>
        {v.items.map((it, i) => (
          <div key={i} className={`rounded-lg border px-3 py-2.5 ${TONE_BOX[t(it.tone)]}`}>
            <div className="text-[13px] font-medium">{it.label}</div>
            {it.detail && <div className="mt-1 text-[11.5px] leading-snug text-slate-400">{it.detail}</div>}
          </div>
        ))}
      </div>
      <Caption text={v.caption} />
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
        </div>
      ))}
      <Key visuals={all} />
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
