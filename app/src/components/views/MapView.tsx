import type { MapEntry } from '../../engine/types'
import { ROLE_CLASS } from './roles'

export function MapView({ entries, label, empty }: { entries: MapEntry[]; label?: string; empty?: string }) {
  return (
    <div>
      {label && <div className="mb-2 text-xs uppercase tracking-wider text-slate-500">{label}</div>}
      {entries.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-700 px-3 py-2 font-mono text-xs text-slate-600">
          {empty ?? 'empty'}
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {entries.map((e, i) => (
            <div
              key={i}
              className={`rounded-md border px-2.5 py-1.5 font-mono text-xs transition-colors duration-200 ${ROLE_CLASS[e.role ?? 'idle']}`}
            >
              <span className="opacity-70">{e.key}</span>
              <span className="mx-1.5 opacity-40">to</span>
              <span>{e.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
