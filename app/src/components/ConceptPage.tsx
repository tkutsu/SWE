import type { Concept, ConceptGroup } from '../lib/concepts'
import type { Visual } from '../lib/visual'
import { ConceptVisual } from './ConceptVisual'

/**
 * Concepts have no algorithm to step through, so they get a reading page
 * rather than a player. The answer is sized for 30 to 60 seconds of talking.
 */
export function ConceptPage({
  group,
  concept,
  visual,
  done,
  onToggle,
  onNext,
  onPrev,
  position,
}: {
  group: ConceptGroup
  concept: Concept
  visual?: Visual | Visual[]
  done: boolean
  onToggle: () => void
  onNext?: () => void
  onPrev?: () => void
  position: string
}) {
  const paragraphs = concept.answer.split(/\n\s*\n/).filter(Boolean)

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wider">
        <span className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-slate-400">{group.name}</span>
        <span className="text-slate-600">{position}</span>
      </div>

      <h2 className="text-xl font-semibold leading-tight sm:text-2xl">{concept.question}</h2>

      {visual && (
        <div className="mt-5 rounded-lg border border-slate-800 bg-slate-950/40 p-4 sm:p-5">
          <ConceptVisual visual={visual} />
        </div>
      )}

      <div className="mt-5 rounded-lg border border-slate-800 bg-slate-950/40 p-4 sm:p-5">
        <div className="mb-3 text-[10px] uppercase tracking-wider text-slate-500">say this, out loud, in about a minute</div>
        {paragraphs.map((p, i) => (
          <p key={i} className={`text-[15px] leading-relaxed text-slate-200 ${i > 0 ? 'mt-3' : ''}`}>
            {p.replace(/\n/g, ' ')}
          </p>
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
          {done ? 'Marked as known' : 'Mark as known'}
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

      <p className="mt-4 text-[13px] leading-relaxed text-slate-500">
        Do not memorise the wording. Know the idea, one concrete example, and one tradeoff. If you can give it in your
        own words with an example from something you have actually built, that lands better than a clean definition.
      </p>
    </div>
  )
}
