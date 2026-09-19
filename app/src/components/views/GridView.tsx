import type { Cell } from '../../engine/types'
import { ROLE_CLASS } from './roles'

export function GridView({ cells, label }: { cells: Cell[][]; label?: string }) {
  return (
    <div className="min-w-0">
      {label && <div className="mb-2 text-xs uppercase tracking-wider text-slate-500">{label}</div>}
      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <div className="inline-flex flex-col gap-1">
          {cells.map((row, r) => (
            <div key={r} className="flex gap-1">
              {row.map((cell, c) => (
                <div
                  key={c}
                  className={`flex h-8 w-8 shrink-0 flex-col items-center justify-center rounded border font-mono text-[11px] transition-colors duration-200 sm:h-9 sm:w-9 sm:text-xs ${ROLE_CLASS[cell.role ?? 'idle']}`}
                >
                  <span className="leading-none">{cell.value}</span>
                  {cell.sub !== undefined && <span className="text-[9px] leading-none opacity-70">{cell.sub}</span>}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
