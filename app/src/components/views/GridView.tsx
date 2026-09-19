import type { Cell, GridMarker } from '../../engine/types'
import { ROLE_CLASS } from './roles'

type Props = {
  cells: Cell[][]
  label?: string
  rowLabels?: (string | number)[]
  colLabels?: (string | number)[]
  corner?: string
  markers?: GridMarker[]
}

const head = 'flex items-center justify-center font-mono text-[10px] text-slate-500'

export function GridView({ cells, label, rowLabels, colLabels, corner }: Props) {
  const labelled = Boolean(rowLabels || colLabels)

  return (
    <div className="min-w-0">
      {label && <div className="mb-2 text-xs uppercase tracking-wider text-slate-500">{label}</div>}
      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <div className="inline-flex flex-col gap-1">
          {colLabels && (
            <div className="flex gap-1">
              {labelled && <div className={`${head} h-8 w-8 shrink-0 sm:h-9 sm:w-9`}>{corner ?? ''}</div>}
              {colLabels.map((c, i) => (
                <div key={i} className={`${head} h-8 w-8 shrink-0 sm:h-9 sm:w-9`}>
                  {c}
                </div>
              ))}
            </div>
          )}
          {cells.map((row, r) => (
            <div key={r} className="flex gap-1">
              {rowLabels && <div className={`${head} h-8 w-8 shrink-0 sm:h-9 sm:w-9`}>{rowLabels[r] ?? ''}</div>}
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
