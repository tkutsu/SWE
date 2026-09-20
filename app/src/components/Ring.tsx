/** A progress ring. Small enough that a phase can wear one without a legend. */
export function Ring({ done, total, size = 34 }: { done: number; total: number; size?: number }) {
  const r = size / 2 - 3
  const circumference = 2 * Math.PI * r
  const pct = total ? done / total : 0
  const complete = total > 0 && done === total

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0" role="img" aria-label={`${done} of ${total} done`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-800" />
      {/* A rounded cap on a zero-length arc still paints a dot, which reads as
          "started" when nothing has been. Draw the arc only once there is one. */}
      {pct > 0 && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${circumference * pct} ${circumference}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className={complete ? 'text-emerald-400' : 'text-amber-400'}
        />
      )}
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        className={`text-[9px] tabular-nums ${complete ? 'fill-emerald-300' : 'fill-slate-400'}`}
      >
        {complete ? '✓' : Math.round(pct * 100)}
      </text>
    </svg>
  )
}
