import { useState } from 'react'
import { CHANCES, CHANCE_LABEL, curriculum, type Item } from '../lib/curriculum'
import { labels } from '../lib/labels'
import { CHANCE_DOT } from '../lib/chance'
import { checkKey, same, type Selection } from '../lib/selection'

type Props = {
  current: Selection
  onPick: (sel: Selection) => void
  open: boolean
  onClose: () => void
  isDone: (key: string) => boolean
  toggle: (key: string) => void
  doneCount: number
}

/**
 * From the generated index rather than from the data, so naming 207 things
 * does not drag concepts, guides and 51 algorithm modules into the first chunk.
 */
const labelOf = (item: Item): string => labels[`${item.kind}:${item.id}`] ?? item.id

const toSelection = (item: Item): Selection =>
  item.kind === 'page' ? ({ kind: item.id } as Selection) : ({ kind: item.kind, id: item.id } as Selection)

function Tick({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      role="checkbox"
      aria-checked={on}
      aria-label={`mark ${label} done`}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border text-[11px] leading-none transition-colors ${
        on ? 'border-emerald-500 bg-emerald-500 text-slate-900' : 'border-slate-700 text-transparent hover:border-slate-500'
      }`}
    >
      ✓
    </button>
  )
}

function Row({
  item,
  current,
  isDone,
  toggle,
  pick,
  context,
}: {
  item: Item
  current: Selection
  isDone: (key: string) => boolean
  toggle: (key: string) => void
  pick: (sel: Selection) => void
  /** The topic name, shown only when the list is not grouped by topic. */
  context?: string
}) {
  const sel = toSelection(item)
  const key = checkKey(sel)
  const label = labelOf(item)
  const selected = same(current, sel)
  const done = isDone(key)

  return (
    <div
      className={`flex items-start gap-2 rounded px-2 py-2 transition-colors lg:py-1.5 ${
        selected ? 'bg-amber-400/15' : 'hover:bg-slate-800'
      }`}
    >
      <Tick on={done} onClick={() => toggle(key)} label={label} />
      <button
        onClick={() => pick(sel)}
        className={`flex min-w-0 flex-1 items-start gap-2 text-left text-[13px] ${
          selected ? 'text-amber-200' : 'text-slate-300'
        }`}
      >
        <span
          title={`${CHANCE_LABEL[item.chance]} in an interview`}
          className={`mt-[6px] h-2 w-2 shrink-0 rounded-full ${CHANCE_DOT[item.chance]}`}
        />
        <span className="min-w-0 flex-1">
          <span className={`block leading-tight ${done && !selected ? 'text-slate-500 line-through decoration-slate-700' : ''}`}>
            {label}
          </span>
          {context && <span className="block text-[10px] leading-tight text-slate-600">{context}</span>}
        </span>
      </button>
    </div>
  )
}

export function Sidebar({ current, onPick, open, onClose, isDone, toggle, doneCount }: Props) {
  const [byChance, setByChance] = useState(false)

  const all = curriculum.flatMap((t) => t.items)
  const total = all.filter((i) => i.kind !== 'page').length
  const topicOf = new Map(curriculum.flatMap((t) => t.items.map((i) => [`${i.kind}:${i.id}`, t.name] as const)))

  const pick = (sel: Selection) => {
    onPick(sel)
    onClose()
  }
  const rowProps = { current, isDone, toggle, pick }

  let lastPhase = ''

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-slate-950/70 lg:hidden" onClick={onClose} aria-hidden />}

      <nav
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-800 bg-slate-950 transition-transform duration-200 lg:static lg:z-0 lg:w-72 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="contents"
      >
        <div className="border-b border-slate-800 px-4 py-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-sm font-semibold text-slate-100">SWE</h1>
              <p className="mt-1 text-xs text-slate-500">
                {doneCount} of {total} done
              </p>
            </div>
            <button
              onClick={onClose}
              className="-mr-1 -mt-1 flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-800 hover:text-slate-200 lg:hidden"
              aria-label="close menu"
            >
              &#215;
            </button>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${total ? (doneCount / total) * 100 : 0}%` }}
            />
          </div>

          <div className="mt-3 flex rounded-md border border-slate-800 p-0.5 text-[11px]">
            {[
              { on: false, label: 'Reading order' },
              { on: true, label: 'By chance' },
            ].map((o) => (
              <button
                key={o.label}
                onClick={() => setByChance(o.on)}
                className={`flex-1 rounded px-2 py-1 transition-colors ${
                  byChance === o.on ? 'bg-slate-800 text-slate-200' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>

          <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1">
            {CHANCES.map((ch) => (
              <span key={ch} className="flex items-center gap-1.5 text-[10px] text-slate-500">
                <span className={`h-2 w-2 rounded-full ${CHANCE_DOT[ch]}`} />
                {CHANCE_LABEL[ch]}
              </span>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-2 py-3">
          {byChance
            ? CHANCES.map((ch) => {
                const items = all.filter((i) => i.chance === ch)
                if (!items.length) return null
                return (
                  <div key={ch} className="mb-3">
                    <div className="mt-2 mb-1 border-t-2 border-slate-800 px-2 pt-3">
                      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        <span className={`h-2 w-2 rounded-full ${CHANCE_DOT[ch]}`} />
                        {CHANCE_LABEL[ch]}
                        <span className="font-normal text-slate-600">{items.length}</span>
                      </div>
                    </div>
                    {items.map((item) => (
                      <Row
                        key={`${item.kind}:${item.id}`}
                        item={item}
                        {...rowProps}
                        context={topicOf.get(`${item.kind}:${item.id}`)}
                      />
                    ))}
                  </div>
                )
              })
            : curriculum.map((topic) => {
                const showPhase = topic.phase !== lastPhase
                lastPhase = topic.phase
                return (
                  <div key={topic.id} className="mb-3">
                    {showPhase && (
                      <div className="mt-2 mb-1 border-t-2 border-slate-700 px-2 pt-3">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-500/90">{topic.phase}</div>
                      </div>
                    )}
                    <div className="px-2 pb-1.5 pt-1 text-[10px] uppercase tracking-wider text-slate-600">{topic.name}</div>
                    {topic.items.map((item) => (
                      <Row key={`${item.kind}:${item.id}`} item={item} {...rowProps} />
                    ))}
                  </div>
                )
              })}
        </div>
      </nav>
    </>
  )
}
