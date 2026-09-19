export function CodePanel({ code, line }: { code: string; line: number | number[] }) {
  const active = new Set(Array.isArray(line) ? line : [line])
  const lines = code.split('\n')

  return (
    <pre className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/70 py-3 font-mono text-[11px] leading-5 sm:text-[13px] sm:leading-6">
      {lines.map((text, i) => {
        const n = i + 1
        const on = active.has(n)
        return (
          <div
            key={n}
            className={`flex min-w-max px-3 transition-colors duration-150 ${
              on ? 'bg-amber-400/15 border-l-2 border-amber-400' : 'border-l-2 border-transparent'
            }`}
          >
            <span className={`mr-4 w-5 shrink-0 select-none text-right text-[11px] ${on ? 'text-amber-400' : 'text-slate-600'}`}>
              {n}
            </span>
            <code className={on ? 'text-amber-50' : 'text-slate-400'}>{text || ' '}</code>
          </div>
        )
      })}
    </pre>
  )
}
