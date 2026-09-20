import type { Cost } from '../lib/intros'

const fmt = (n: number) => n.toLocaleString('en-GB')

/** "5,000 times less" reads better than "0.0002 of". */
function ratio(naive: number, smart: number) {
  if (smart <= 0 || naive <= smart) return undefined
  const times = naive / smart
  const rounded = times >= 100 ? Math.round(times / 10) * 10 : Math.round(times)
  return `${fmt(rounded)}x less`
}

/**
 * The payoff, as a picture.
 *
 * Almost every payoff paragraph already contains the two numbers; a sentence
 * saying "50 million against 10,000" asks you to hold both and divide. Bars do
 * that for you. Log scale, because on a linear one the smart bar is invisible,
 * and an invisible bar is not a comparison.
 */
export function CostBars({ cost }: { cost: Cost }) {
  const scale = (n: number) => {
    const top = Math.log10(Math.max(cost.naive, cost.smart) + 1)
    return top > 0 ? Math.max(4, (Math.log10(n + 1) / top) * 100) : 4
  }
  const gain = ratio(cost.naive, cost.smart)

  const rows: { label: string; value: number; tone: string }[] = [
    { label: 'the obvious way', value: cost.naive, tone: 'bg-rose-500/70' },
    { label: 'this', value: cost.smart, tone: 'bg-emerald-500/80' },
  ]

  return (
    <div className="rounded-md border border-slate-800 bg-slate-950/60 px-3 py-3 sm:px-4">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[10px] uppercase tracking-wider text-slate-500">{cost.unit}</span>
        {gain && <span className="text-[11px] font-medium text-emerald-300">{gain}</span>}
      </div>
      <div className="mt-2.5 flex flex-col gap-2">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="flex items-baseline justify-between gap-3 text-[11px]">
              <span className="text-slate-500">{r.label}</span>
              <span className="font-mono tabular-nums text-slate-300">{fmt(r.value)}</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-sm bg-slate-900">
              <div className={`h-full rounded-sm ${r.tone}`} style={{ width: `${scale(r.value)}%` }} />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[10px] text-slate-600">log scale, so the shorter bar stays visible</p>
    </div>
  )
}
