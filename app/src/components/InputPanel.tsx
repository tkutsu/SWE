import type { InputField } from '../engine/types'

type Props = {
  fields: InputField[]
  values: Record<string, string | number>
  onChange: (name: string, value: string) => void
  onReset: () => void
}

export function InputPanel({ fields, values, onChange, onReset }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-slate-500">input</span>
        <button onClick={onReset} className="text-[11px] text-slate-500 underline-offset-2 hover:text-slate-300 hover:underline">
          reset to default
        </button>
      </div>
      {fields.map((f) => (
        <label key={f.name} className="flex flex-col gap-1">
          <span className="text-[11px] text-slate-400">{f.label}</span>
          {f.kind === 'text' && String(values[f.name] ?? '').includes('\n') ? (
            <textarea
              value={String(values[f.name] ?? '')}
              onChange={(e) => onChange(f.name, e.target.value)}
              rows={5}
              spellCheck={false}
              className="rounded-md border border-slate-700 bg-slate-950 px-2.5 py-2 font-mono text-[16px] text-slate-200 outline-none focus:border-amber-400/60 sm:text-xs"
            />
          ) : (
            <input
              type={f.kind === 'number' ? 'number' : 'text'}
              value={String(values[f.name] ?? '')}
              onChange={(e) => onChange(f.name, e.target.value)}
              spellCheck={false}
              className="h-11 rounded-md border border-slate-700 bg-slate-950 px-2.5 font-mono text-[16px] text-slate-200 outline-none focus:border-amber-400/60 sm:h-auto sm:py-1.5 sm:text-xs"
            />
          )}
          {f.hint && <span className="text-[10px] text-slate-600">{f.hint}</span>}
        </label>
      ))}
    </div>
  )
}
