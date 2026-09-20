import { useEffect, useRef, useState } from 'react'
import { CHANCES, CHANCE_LABEL, MAPS, curriculum, curriculumItems, type Item } from '../lib/curriculum'
import { doneCountIn, keyOf, phases, placeOf, tracks } from '../lib/journey'
import { labels } from '../lib/labels'
import { minutes } from '../lib/minutes'
import { CHANCE_DOT } from '../lib/chance'
import { checkKey, same, type Selection } from '../lib/selection'

type Props = {
  current: Selection
  onPick: (sel: Selection) => void
  open: boolean
  onClose: () => void
  isDone: (key: string) => boolean
  toggle: (key: string) => void
}

/**
 * From the generated index rather than from the data, so naming 205 things
 * does not drag concepts, guides and 51 algorithm modules into the first chunk.
 */
const labelOf = (item: Item): string => labels[keyOf(item)] ?? item.id

const toSelection = (item: Item): Selection => ({ kind: item.kind, id: item.id }) as Selection

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
  const row = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (selected) row.current?.scrollIntoView({ block: 'nearest' })
  }, [selected])

  return (
    <div
      ref={row}
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
        <span className="mt-[1px] shrink-0 text-[10px] tabular-nums text-slate-600">{minutes[key]}m</span>
      </button>
    </div>
  )
}

/** Reference pages. Not read in sequence and not counted, so no tick, no dot. */
function MapRow({ id, current, pick }: { id: string; current: Selection; pick: (sel: Selection) => void }) {
  const sel = { kind: id } as Selection
  const selected = same(current, sel)
  return (
    <button
      onClick={() => pick(sel)}
      className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[13px] transition-colors ${
        selected ? 'bg-amber-400/15 text-amber-200' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-300'
      }`}
    >
      <span className="text-slate-600">&#9723;</span>
      {labels[`page:${id}`] ?? id}
    </button>
  )
}

export function Sidebar({ current, onPick, open, onClose, isDone, toggle }: Props) {
  const [byChance, setByChance] = useState(false)

  const currentPhase = placeOf.get(checkKey(current))?.phase.name
  // Collapsed by default. 31 topics in one column is a scrollbar, not a map.
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(currentPhase ? [currentPhase] : []))

  // Whatever you are reading stays open, including after a deep link or Next
  // carries you into a phase you had collapsed.
  useEffect(() => {
    if (!currentPhase) return
    setExpanded((prev) => (prev.has(currentPhase) ? prev : new Set([currentPhase])))
  }, [currentPhase])

  const all = curriculum.flatMap((t) => t.items)
  const total = all.length
  // Counted over the curriculum rather than from the size of the done set,
  // which also holds keys for pages that have since left it.
  const doneCount = doneCountIn(curriculumItems, isDone)

  const pick = (sel: Selection) => {
    onPick(sel)
    onClose()
  }
  const rowProps = { current, isDone, toggle, pick }

  let lastTrack = ''

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-slate-950/70 lg:hidden" onClick={onClose} aria-hidden />}

      <nav
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-800 bg-slate-950 transition-transform duration-200 lg:sticky lg:top-0 lg:z-0 lg:h-dvh lg:w-72 lg:translate-x-0 lg:self-start ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="contents"
      >
        <div className="border-b border-slate-800 px-4 py-4">
          <div className="flex items-start justify-between">
            <div>
              <button onClick={() => pick({ kind: 'home' })} className="text-sm font-semibold text-slate-100 hover:text-amber-200">
                SWE
              </button>
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

        <div className="border-b border-slate-800 px-2 py-2">
          <div className="px-2 pb-1 text-[10px] uppercase tracking-wider text-slate-600">Maps</div>
          {MAPS.map((id) => (
            <MapRow key={id} id={id} current={current} pick={pick} />
          ))}
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
                      <Row key={keyOf(item)} item={item} {...rowProps} context={placeOf.get(keyOf(item))?.topic.name} />
                    ))}
                  </div>
                )
              })
            : phases.map((phase) => {
                const showTrack = phase.track !== lastTrack
                lastTrack = phase.track
                const arc = tracks.find((t) => t.track === phase.track)
                const phaseDone = doneCountIn(phase.items, isDone)
                const isOpen = expanded.has(phase.name)

                return (
                  <div key={phase.name} className="mb-2">
                    {showTrack && arc && (
                      <div className="mt-3 mb-2 rounded bg-slate-900 px-2 py-2 first:mt-0">
                        <div className="flex items-baseline justify-between">
                          <div className="text-[12px] font-semibold text-slate-200">{arc.track}</div>
                          <div className="text-[10px] tabular-nums text-slate-500">
                            {doneCountIn(arc.items, isDone)}/{arc.items.length}
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() =>
                        setExpanded((prev) => {
                          const next = new Set(prev)
                          if (next.has(phase.name)) next.delete(phase.name)
                          else next.add(phase.name)
                          return next
                        })
                      }
                      className="w-full px-2 pt-2 pb-1 text-left"
                      aria-expanded={isOpen}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] text-slate-600 transition-transform ${isOpen ? 'rotate-90' : ''}`}>&#9654;</span>
                        <span className="min-w-0 flex-1 truncate text-[11px] font-semibold uppercase tracking-wider text-amber-500/90">
                          {phase.name}
                        </span>
                        <span className="shrink-0 text-[10px] tabular-nums text-slate-600">
                          {phaseDone}/{phase.items.length}
                        </span>
                      </div>
                      <div className="mt-1.5 ml-4 h-0.5 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full bg-emerald-600 transition-all duration-300"
                          style={{ width: `${phase.items.length ? (phaseDone / phase.items.length) * 100 : 0}%` }}
                        />
                      </div>
                    </button>

                    {isOpen &&
                      phase.topics.map((topic) => (
                        <div key={topic.id} className="mb-2">
                          {!(phase.topics.length === 1 && topic.name === phase.name) && (
                            <div className="flex items-baseline gap-2 px-2 pb-1 pt-1.5">
                              <span className="min-w-0 flex-1 truncate text-[10px] uppercase tracking-wider text-slate-600">
                                {topic.name}
                              </span>
                              <span className="shrink-0 text-[10px] tabular-nums text-slate-700">
                                {doneCountIn(topic.items, isDone)}/{topic.items.length}
                              </span>
                            </div>
                          )}
                          {topic.items.map((item) => (
                            <Row key={keyOf(item)} item={item} {...rowProps} />
                          ))}
                        </div>
                      ))}
                  </div>
                )
              })}
        </div>
      </nav>
    </>
  )
}
