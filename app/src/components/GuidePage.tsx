import type { Guide, GuideGroup } from '../lib/guides'
import { ConceptVisual } from './ConceptVisual'

/**
 * Design exercises, behavioural prep and the study plan. Longer than a concept
 * and with no algorithm to run, so it reads as a structured page.
 */
export function GuidePage({
  group,
  guide,
  done,
  onToggle,
  onNext,
  onPrev,
}: {
  group: GuideGroup
  guide: Guide
  done: boolean
  onToggle: () => void
  onNext?: () => void
  onPrev?: () => void
}) {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-2 text-[11px] uppercase tracking-wider">
        <span className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-slate-400">{group.name}</span>
      </div>

      <h2 className="text-xl font-semibold leading-tight sm:text-2xl">{guide.title}</h2>
      <p className="mt-1.5 text-sm text-slate-400">{guide.blurb}</p>

      {guide.visual && (
        <div className="mt-5 rounded-lg border border-slate-800 bg-slate-950/40 p-4 sm:p-5">
          <ConceptVisual visual={guide.visual} />
        </div>
      )}

      <div className="mt-5 flex flex-col gap-4">
        {guide.sections.map((s, i) => (
          <section key={i} className="rounded-lg border border-slate-800 bg-slate-950/40 p-4 sm:p-5">
            <h3 className="text-[13px] font-semibold uppercase tracking-wider text-amber-500/90">{s.heading}</h3>
            {s.body && <p className="mt-2.5 text-[14px] leading-relaxed text-slate-200">{s.body}</p>}
            {s.items && (
              <ul className="mt-2.5 flex flex-col gap-2">
                {s.items.map((it, j) => (
                  <li key={j} className="flex gap-2.5 text-[14px] leading-relaxed text-slate-200">
                    <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-slate-600" />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          onClick={onToggle}
          className={`flex h-11 items-center gap-2 rounded-md border px-4 text-sm transition-colors lg:h-9 ${
            done
              ? 'border-emerald-600 bg-emerald-600/15 text-emerald-300'
              : 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
          }`}
        >
          <span>{done ? '✓' : ''}</span>
          {done ? 'Marked as done' : 'Mark as done'}
        </button>
        <div className="flex-1" />
        <button
          onClick={onPrev}
          disabled={!onPrev}
          className="flex h-11 items-center rounded-md border border-slate-700 bg-slate-800 px-3 text-sm text-slate-200 transition-colors hover:bg-slate-700 disabled:opacity-40 lg:h-9"
        >
          Previous
        </button>
        <button
          onClick={onNext}
          disabled={!onNext}
          className="flex h-11 items-center rounded-md border border-slate-700 bg-slate-800 px-3 text-sm text-slate-200 transition-colors hover:bg-slate-700 disabled:opacity-40 lg:h-9"
        >
          Next
        </button>
      </div>
    </div>
  )
}
