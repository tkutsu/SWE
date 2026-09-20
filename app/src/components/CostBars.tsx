import type { Cost } from '../lib/intros'

const fmt = (n: number) => n.toLocaleString('en-GB')

/** "5,000x less" reads better than "0.0002 of". */
function ratio(naive: number, smart: number) {
  if (smart <= 0 || naive <= smart) return undefined
  const times = naive / smart
  const rounded = times >= 100 ? Math.round(times / 10) * 10 : Math.round(times)
  return `${fmt(rounded)}x`
}

/**
 * The payoff, as a picture.
 *
 * Linear, on purpose. A log scale drew 10,000 against 50,000,000 as a bar half
 * the width of the other one, so a 5,000x win looked like 2x, and someone who
 * reads the bar rather than the caption read it wrong. The sliver is the point.
 * The small bar gets a 3px floor so it never disappears entirely, and the
 * multiplier is the largest thing in the box because it is the claim.
 */
export function CostBars({ cost }: { cost: Cost }) {
  const top = Math.max(cost.naive, cost.smart)
  const pct = (n: number) => (top > 0 ? (n / top) * 100 : 0)
  const gain = ratio(cost.naive, cost.smart)

  const rows: { label: string; value: number; tone: string }[] = [
    { label: 'the obvious way', value: cost.naive, tone: 'bg-rose-500/70' },
    { label: 'this', value: cost.smart, tone: 'bg-emerald-400' },
  ]

  return (
    <div className="rounded-md border border-slate-800 bg-slate-950/60 px-3 py-3 sm:px-4">
      {gain && (
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold leading-none text-emerald-300">{gain}</span>
          <span className="text-[12px] text-slate-400">fewer</span>
        </div>
      )}
      <div className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">{cost.unit}</div>

      <div className="mt-3 flex flex-col gap-2">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="flex items-baseline justify-between gap-3 text-[11px]">
              <span className="text-slate-500">{r.label}</span>
              <span className="font-mono tabular-nums text-slate-300">{fmt(r.value)}</span>
            </div>
            <div className="mt-1 h-2 rounded-sm bg-slate-900">
              {/* A floor of 3px, so the winning bar is a sliver rather than nothing. */}
              <div className={`h-full rounded-sm ${r.tone}`} style={{ width: `max(3px, ${pct(r.value)}%)` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
