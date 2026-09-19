export function VarsPanel({ vars }: { vars?: Record<string, string | number | boolean> }) {
  const entries = Object.entries(vars ?? {})
  if (entries.length === 0) return null

  return (
    <div>
      <div className="mb-2 text-xs uppercase tracking-wider text-slate-500">watch</div>
      <div className="flex flex-col gap-1">
        {entries.map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-3 border-b border-slate-800/60 pb-1 text-xs">
            <span className="font-mono text-slate-500">{k}</span>
            <span className="font-mono text-slate-200">{String(v)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
