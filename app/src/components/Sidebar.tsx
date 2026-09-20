import { conceptGroups, type ConceptGroup } from '../lib/concepts'
import { guideGroups } from '../lib/guides'
import { isInterviewGroup } from '../lib/sections'
import { TIER_LABEL, allRoadmapItems, roadmap, sortingExtras } from '../lib/roadmap'
import { checkKey, same, type Selection } from '../lib/selection'

const TIERS = [1, 2, 3, 4] as const

type Props = {
  current: Selection
  onPick: (sel: Selection) => void
  open: boolean
  onClose: () => void
  isDone: (key: string) => boolean
  toggle: (key: string) => void
  doneCount: number
}

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
        on
          ? 'border-emerald-500 bg-emerald-500 text-slate-900'
          : 'border-slate-700 text-transparent hover:border-slate-500'
      }`}
    >
      {on ? '✓' : '✓'}
    </button>
  )
}

function Row({
  label,
  badge,
  selected,
  ready,
  done,
  onPick,
  onToggle,
}: {
  label: string
  badge?: string
  selected: boolean
  ready: boolean
  done: boolean
  onPick: () => void
  onToggle: () => void
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded px-2 py-2 transition-colors lg:py-1.5 ${
        selected ? 'bg-amber-400/15' : ready ? 'hover:bg-slate-800' : ''
      }`}
    >
      {ready ? (
        <Tick on={done} onClick={onToggle} label={label} />
      ) : (
        <span className="h-5 w-5 shrink-0" aria-hidden />
      )}
      <button
        disabled={!ready}
        onClick={onPick}
        className={`flex min-w-0 flex-1 items-center gap-2 text-left text-[13px] ${
          selected ? 'text-amber-200' : ready ? 'text-slate-300' : 'cursor-default text-slate-600'
        }`}
      >
        {badge !== undefined && (
          <span className={`w-5 shrink-0 text-right font-mono text-[11px] ${selected ? 'text-amber-400' : 'text-slate-600'}`}>
            {badge}
          </span>
        )}
        <span className={`flex-1 leading-tight ${done && !selected ? 'text-slate-500 line-through decoration-slate-700' : ''}`}>
          {label}
        </span>
        {!ready && <span className="text-[9px] uppercase tracking-wide text-slate-700">soon</span>}
      </button>
    </div>
  )
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return <div className="px-2 pb-1.5 pt-1 text-[10px] uppercase tracking-wider text-slate-600">{children}</div>
}

/** Heavier than a group label. Marks the shift from subject matter to craft. */
function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-2 mb-1 border-t-2 border-slate-700 px-2 pt-3">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-500/90">{children}</div>
    </div>
  )
}

type RowProps = {
  current: Selection
  isDone: (key: string) => boolean
  toggle: (key: string) => void
  pick: (sel: Selection) => void
}

function ConceptGroupRows({ group, current, isDone, toggle, pick }: { group: ConceptGroup } & RowProps) {
  return (
    <div className="mb-2">
      <div className="px-2 pb-1 pt-1.5 text-[11px] font-medium text-slate-400">{group.name}</div>
      {group.concepts.map((c) => {
        const sel: Selection = { kind: 'concept', id: c.id }
        return (
          <Row
            key={c.id}
            label={c.question}
            selected={same(current, sel)}
            ready
            done={isDone(checkKey(sel))}
            onPick={() => pick(sel)}
            onToggle={() => toggle(checkKey(sel))}
          />
        )
      })}
    </div>
  )
}

export function Sidebar({ current, onPick, open, onClose, isDone, toggle, doneCount }: Props) {
  const total =
    allRoadmapItems.filter((r) => r.algoId).length +
    conceptGroups.reduce((n, g) => n + g.concepts.length, 0) +
    guideGroups.reduce((n, g) => n + g.guides.length, 0)

  const pick = (sel: Selection) => {
    onPick(sel)
    onClose()
  }
  const rowProps: RowProps = { current, isDone, toggle, pick }

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-slate-950/70 lg:hidden" onClick={onClose} aria-hidden />}

      <nav
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-800 bg-slate-950 transition-transform duration-200 lg:static lg:z-0 lg:w-72 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="contents"
      >
        <div className="flex items-start justify-between border-b border-slate-800 px-4 py-4">
          <div>
            <h1 className="text-sm font-semibold text-slate-100">SWE</h1>
            <p className="mt-1 text-xs text-slate-500">
              {doneCount} of {total} done
            </p>
            <div className="mt-2 h-1 w-32 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${total ? (doneCount / total) * 100 : 0}%` }}
              />
            </div>
          </div>
          <button
            onClick={onClose}
            className="-mr-1 -mt-1 flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-800 hover:text-slate-200 lg:hidden"
            aria-label="close menu"
          >
            &#215;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-2 py-3">
          {TIERS.map((tier) => (
            <div key={tier} className="mb-3">
              <GroupLabel>{TIER_LABEL[tier]}</GroupLabel>
              {roadmap
                .filter((r) => r.tier === tier)
                .map((item) => {
                  const sel: Selection = { kind: 'algo', id: item.algoId ?? '' }
                  return (
                    <Row
                      key={item.rank}
                      label={item.name}
                      badge={String(item.rank)}
                      selected={Boolean(item.algoId) && same(current, sel)}
                      ready={Boolean(item.algoId)}
                      done={isDone(checkKey(sel))}
                      onPick={() => item.algoId && pick(sel)}
                      onToggle={() => item.algoId && toggle(checkKey(sel))}
                    />
                  )
                })}
            </div>
          ))}

          <div className="mb-3 border-t border-slate-800 pt-2">
            <GroupLabel>The other sorts</GroupLabel>
            {sortingExtras.map((item) => {
              const sel: Selection = { kind: 'algo', id: item.algoId ?? '' }
              return (
                <Row
                  key={item.rank}
                  label={item.name}
                  selected={same(current, sel)}
                  ready
                  done={isDone(checkKey(sel))}
                  onPick={() => pick(sel)}
                  onToggle={() => toggle(checkKey(sel))}
                />
              )
            })}
          </div>

          <div className="border-t border-slate-800 pt-2">
            <GroupLabel>Concepts, the explain-it-out-loud half</GroupLabel>
            {conceptGroups
              .filter((g) => !isInterviewGroup(g.id))
              .map((group) => (
                <ConceptGroupRows key={group.id} group={group} {...rowProps} />
              ))}
          </div>

          <SectionHeader>Interview</SectionHeader>

          {guideGroups.map((group) => (
            <div key={group.id} className="mb-3">
              <GroupLabel>{group.name}</GroupLabel>
              {group.guides.map((g) => {
                const sel: Selection = { kind: 'guide', id: g.id }
                return (
                  <Row
                    key={g.id}
                    label={g.title}
                    selected={same(current, sel)}
                    ready
                    done={isDone(checkKey(sel))}
                    onPick={() => pick(sel)}
                    onToggle={() => toggle(checkKey(sel))}
                  />
                )
              })}
            </div>
          ))}

          {conceptGroups
            .filter((g) => isInterviewGroup(g.id))
            .map((group) => (
              <div key={group.id} className="mb-3">
                <GroupLabel>{group.name}</GroupLabel>
                {group.concepts.map((c) => {
                  const sel: Selection = { kind: 'concept', id: c.id }
                  return (
                    <Row
                      key={c.id}
                      label={c.question}
                      selected={same(current, sel)}
                      ready
                      done={isDone(checkKey(sel))}
                      onPick={() => pick(sel)}
                      onToggle={() => toggle(checkKey(sel))}
                    />
                  )
                })}
              </div>
            ))}
        </div>
      </nav>
    </>
  )
}
