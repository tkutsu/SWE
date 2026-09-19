import type { StackItem } from '../../engine/types'
import { ROLE_CLASS } from './roles'

export function StackView({
  items,
  label,
  orientation = 'vertical',
}: {
  items: StackItem[]
  label?: string
  orientation?: 'vertical' | 'horizontal'
}) {
  return (
    <div>
      {label && <div className="mb-2 text-xs uppercase tracking-wider text-slate-500">{label}</div>}
      {items.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-700 px-3 py-2 font-mono text-xs text-slate-600">empty</div>
      ) : (
        <div className={orientation === 'vertical' ? 'flex flex-col gap-1' : 'flex flex-wrap gap-1'}>
          {items.map((item, i) => (
            <div
              key={i}
              className={`rounded border px-2.5 py-1 font-mono text-xs transition-colors duration-200 ${ROLE_CLASS[item.role ?? 'idle']}`}
            >
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
