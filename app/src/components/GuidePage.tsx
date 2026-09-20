import { useRef, useState } from 'react'
import type { Guide, GuideGroup } from '../lib/guides'
import { ConceptVisual } from './ConceptVisual'
import { Hook } from './Hook'
import { PageFooter } from './PageFooter'

/**
 * Design exercises, behavioural prep and the study plan. Longer than a concept
 * and with no algorithm to run, so it reads as a structured page.
 *
 * Every section used to be open at the same visual weight, which for a system
 * design exercise is many screens of equal-looking text. One section at a
 * time, and the headings hoisted into a strip above them: for the design
 * exercises that strip is the method itself, so it doubles as the thing worth
 * memorising.
 */
export function GuidePage({
  group,
  guide,
  done,
  onToggle,
  onNext,
  onPrev,
  position,
  nextTitle,
}: {
  group: GuideGroup
  guide: Guide
  done: boolean
  onToggle: () => void
  onNext?: () => void
  onPrev?: () => void
  position: string
  nextTitle?: string
}) {
  const [open, setOpen] = useState<Set<number>>(() => new Set([0]))
  const refs = useRef<(HTMLElement | null)[]>([])

  const toggleSection = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })

  const jump = (i: number) => {
    setOpen((prev) => new Set(prev).add(i))
    refs.current[i]?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }

  const allOpen = open.size === guide.sections.length

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wider">
        <span className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-slate-400">{group.name}</span>
        <span className="text-slate-600">{position}</span>
      </div>

      <h2 className="text-xl font-semibold leading-tight sm:text-2xl">{guide.title}</h2>

      {/*
        The hook goes above the blurb. The blurb is a one-line summary of what
        the page covers, which is a useful thing to read second and a flat thing
        to read first.
      */}
      <Hook text={guide.hook} />
      <p className={`text-sm text-slate-400 ${guide.hook ? 'mt-3' : 'mt-1.5'}`}>{guide.blurb}</p>

      {guide.visual && (
        <div className="mt-5 rounded-lg border border-slate-800 bg-slate-950/40 p-4 sm:p-5">
          <ConceptVisual visual={guide.visual} />
        </div>
      )}

      {guide.sections.length > 1 && (
        <div className="mt-5 rounded-lg border border-slate-800 bg-slate-950/40 p-4 sm:p-5">
          <div className="mb-2.5 flex items-baseline justify-between gap-3">
            <h3 className="text-xs uppercase tracking-wider text-slate-500">The shape of it</h3>
            <button
              onClick={() => setOpen(allOpen ? new Set([0]) : new Set(guide.sections.map((_, i) => i)))}
              className="shrink-0 text-[11px] text-slate-600 hover:text-slate-400"
            >
              {allOpen ? 'collapse all' : 'expand all'}
            </button>
          </div>
          <ol className="flex flex-wrap gap-2">
            {guide.sections.map((s, i) => (
              <li key={i}>
                <button
                  onClick={() => jump(i)}
                  className="flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-[12px] text-slate-300 transition-colors hover:border-slate-600 hover:text-slate-100"
                >
                  <span className="font-mono text-[10px] text-slate-500">{i + 1}</span>
                  {s.heading}
                </button>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="mt-5 flex flex-col gap-3">
        {guide.sections.map((s, i) => {
          const isOpen = open.has(i)
          return (
            <section
              key={i}
              ref={(el) => {
                refs.current[i] = el
              }}
              className="scroll-mt-16 rounded-lg border border-slate-800 bg-slate-950/40"
            >
              <button
                onClick={() => toggleSection(i)}
                className="flex w-full items-center gap-2.5 px-4 py-3.5 text-left sm:px-5"
                aria-expanded={isOpen}
              >
                <span className="font-mono text-[10px] text-slate-600">{i + 1}</span>
                <h3 className="min-w-0 flex-1 text-[13px] font-semibold uppercase tracking-wider text-amber-500/90">
                  {s.heading}
                </h3>
                <span className={`shrink-0 text-[9px] text-slate-600 transition-transform ${isOpen ? 'rotate-90' : ''}`}>
                  &#9654;
                </span>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 sm:px-5 sm:pb-5">
                  {s.body && <p className="text-[14px] leading-relaxed text-slate-200">{s.body}</p>}
                  {s.items && (
                    <ul className={`flex flex-col gap-2 ${s.body ? 'mt-2.5' : ''}`}>
                      {s.items.map((it, j) => (
                        <li key={j} className="flex gap-2.5 text-[14px] leading-relaxed text-slate-200">
                          <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-slate-600" />
                          <span>{it}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </section>
          )
        })}
      </div>

      <PageFooter
        done={done}
        onToggle={onToggle}
        doneOn="Marked as done"
        doneOff="Mark as done"
        onPrev={onPrev}
        onNext={onNext}
        nextTitle={nextTitle}
      />
    </div>
  )
}
