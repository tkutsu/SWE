import type { Cell, Marker } from '../../engine/types'
import { ROLE_CLASS } from './roles'

export function ArrayView({ cells, markers, label }: { cells: Cell[]; markers?: Marker[]; label?: string }) {
  const at = (i: number) => (markers ?? []).filter((m) => m.index === i)

  return (
    <div className="min-w-0">
      {label && <div className="mb-2 text-xs uppercase tracking-wider text-slate-500">{label}</div>}
      <div className="flex flex-wrap gap-1 sm:gap-1.5">
        {cells.map((cell, i) => (
          <div key={i} className="flex flex-col items-center gap-0.5 sm:gap-1">
            <div className="h-4 text-[10px] font-medium leading-4 text-amber-300">
              {at(i).map((m) => m.name).join(' ')}
            </div>
            <div
              className={`flex h-9 min-w-9 items-center justify-center rounded-md border px-1.5 font-mono text-xs transition-colors duration-200 sm:h-11 sm:min-w-11 sm:px-2 sm:text-sm ${ROLE_CLASS[cell.role ?? 'idle']}`}
            >
              {cell.value}
            </div>
            <div className="text-[10px] leading-3 text-slate-500">{cell.sub ?? i}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
