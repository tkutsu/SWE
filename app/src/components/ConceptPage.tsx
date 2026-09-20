import { useState } from 'react'
import type { Concept, ConceptGroup } from '../lib/concepts'
import type { Visual } from '../lib/visual'
import { followUps } from '../lib/followUps'
import { labels } from '../lib/labels'
import { ALWAYS_SHOW, useFlag } from '../lib/prefs'
import { related } from '../lib/related'
import type { Selection } from '../lib/selection'
import { ConceptVisual } from './ConceptVisual'
import { Hook } from './Hook'
import { PageFooter } from './PageFooter'

/** A trailing "Expect the follow-up ..." belongs on its own, not buried in prose. */
const FOLLOW_UP = /^(?:Expect the follow-?up|They(?:'ll| will| often) ask|Follow-?ups?\b)/i

export function ConceptPage({
  group,
  concept,
  visual,
  done,
  onToggle,
  onNext,
  onPrev,
  position,
  nextTitle,
  onOpen,
}: {
  group: ConceptGroup
  concept: Concept
  visual?: Visual | Visual[]
  done: boolean
  onToggle: () => void
  onNext?: () => void
  onPrev?: () => void
  position: string
  nextTitle?: string
  onOpen: (sel: Selection) => void
}) {
  const [alwaysShow, toggleAlways] = useFlag(ALWAYS_SHOW)
  // Deliberately not persisted. The second pass over a concept is the pass
  // recall is for, and a remembered reveal never asks.
  const [revealed, setRevealed] = useState(false)
  const open = alwaysShow || revealed

  const all = concept.answer.split(/\n\s*\n/).filter(Boolean)
  const paragraphs = all.filter((p) => !FOLLOW_UP.test(p.trim()))
  // A line written into the answer wins; the map covers everything else.
  const inAnswer = all.filter((p) => FOLLOW_UP.test(p.trim()))
  const next = inAnswer.length ? inAnswer : (followUps[concept.id] ?? [])
  const links = (related[concept.id] ?? []).filter((k) => labels[k])

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wider">
        <span className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-slate-400">{group.name}</span>
        <span className="text-slate-600">{position}</span>
      </div>

      <h2 className="text-xl font-semibold leading-tight sm:text-2xl">{concept.question}</h2>

      <Hook text={concept.hook} />

      {visual && (
        <div className="mt-5 rounded-lg border border-slate-800 bg-slate-950/40 p-4 sm:p-5">
          <ConceptVisual visual={visual} />
        </div>
      )}

      {/*
        Reading an answer that is already on screen feels like knowing it.
        Saying it first and then checking is the thing that actually transfers
        to a room, so the answer is one click away rather than zero.
      */}
      {open ? (
        <div className="mt-5 rounded-lg border border-slate-800 bg-slate-950/40 p-4 sm:p-5">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <span className="text-[10px] uppercase tracking-wider text-slate-500">say this, out loud, in about a minute</span>
            <button onClick={toggleAlways} className="shrink-0 text-[10px] text-slate-600 hover:text-slate-400">
              {alwaysShow ? 'ask me first next time' : 'always show'}
            </button>
          </div>
          {paragraphs.map((p, i) => (
            <p key={i} className={`text-[15px] leading-relaxed text-slate-200 ${i > 0 ? 'mt-3' : ''}`}>
              {p.replace(/\n/g, ' ')}
            </p>
          ))}
        </div>
      ) : (
        <button
          onClick={() => setRevealed(true)}
          className="mt-5 flex w-full flex-col items-start rounded-lg border border-dashed border-slate-700 bg-slate-950/40 px-4 py-5 text-left transition-colors hover:border-amber-500/50 hover:bg-slate-900/60 sm:px-5"
        >
          <span className="text-[15px] text-slate-200">Say it out loud first, then reveal</span>
          <span className="mt-1 text-[12px] text-slate-500">
            Thirty seconds of trying to say it beats a minute of reading it.
          </span>
        </button>
      )}

      {open && next.length > 0 && (
        <div className="mt-4 rounded-lg border border-amber-500/25 bg-amber-400/[0.06] p-4 sm:p-5">
          <h3 className="mb-2.5 text-xs uppercase tracking-wider text-amber-500/90">They will ask next</h3>
          <ul className="flex flex-col gap-2">
            {next.map((p, i) => (
              <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-slate-300">
                <span className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500/50" />
                <span>{p.replace(/\n/g, ' ')}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {links.length > 0 && (
        <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/40 p-4 sm:p-5">
          <h3 className="mb-2.5 text-xs uppercase tracking-wider text-slate-500">Reads well next to</h3>
          <div className="flex flex-wrap gap-2">
            {links.map((key) => {
              const [kind, id] = [key.slice(0, key.indexOf(':')), key.slice(key.indexOf(':') + 1)]
              return (
                <button
                  key={key}
                  onClick={() => onOpen({ kind, id } as Selection)}
                  className="rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-[12px] text-slate-300 transition-colors hover:border-slate-600 hover:text-slate-100"
                >
                  {labels[key]}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <PageFooter
        done={done}
        onToggle={onToggle}
        doneOn="Marked as known"
        doneOff="Mark as known"
        onPrev={onPrev}
        onNext={onNext}
        nextTitle={nextTitle}
      />

      <p className="mt-4 text-[13px] leading-relaxed text-slate-500">
        Do not memorise the wording. Know the idea, one concrete example, and one tradeoff. If you can give it in your
        own words with an example from something you have actually built, that lands better than a clean definition.
      </p>
    </div>
  )
}
