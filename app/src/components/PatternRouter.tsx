import { useState } from 'react'
import { bands, budget, ladders, type Ladder, type Signal } from '../lib/patterns'
import { TONE_BOX, TONE_HEAD, type Tone } from '../lib/visual'
import { ConceptVisual } from './ConceptVisual'

/**
 * The map, rather than a lesson. Every other page answers "how does this
 * work"; this one answers "which one is this", which is the question a problem
 * statement actually asks. It is the only page that links outward to the rest,
 * so it carries no checkbox: you do not finish a map, you keep coming back.
 */
export function PatternRouter({ onOpen }: { onOpen: (algoId: string) => void }) {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <h2 className="text-xl font-semibold leading-tight sm:text-2xl">Which pattern is this?</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
        Interviews do not hand you an algorithm, they hand you a paragraph. This is the paragraph read backwards: the
        cues that appear in a problem, the pattern each one points at, and the reason the implication holds. Click a
        pattern to open its walkthrough.
      </p>

      <Section title="Read the constraint first" defaultOpen>
        <ConceptVisual visual={budget} />
      </Section>

      {bands.map((band) => (
        <Section key={band.id} title={band.name} blurb={band.blurb}>
          <div className="flex flex-col divide-y divide-slate-800/80">
            {band.signals.map((s) => (
              <SignalRow key={s.cue} signal={s} onOpen={onOpen} />
            ))}
          </div>
        </Section>
      ))}

      <Section
        title={'When they say "can you do better"'}
        blurb="The rungs matter less than the prompts between them. Hearing the prompt is most of the skill, because it tells you which axis you are being asked to improve: time, space, or the assumption you quietly made."
      >
        <div className="flex flex-col gap-6">
          {ladders.map((l) => (
            <LadderView key={l.id} ladder={l} onOpen={onOpen} />
          ))}
        </div>
      </Section>
    </div>
  )
}

/**
 * Collapsed by default, the first band open. Fine as a reference, too dense as
 * a page: every band expanded is several screens of table before you reach the
 * one you came for.
 */
function Section({
  title,
  blurb,
  defaultOpen = false,
  children,
}: {
  title: string
  blurb?: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section className="mt-4 rounded-lg border border-slate-800 bg-slate-950/40">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-2.5 p-4 text-left sm:p-5"
        aria-expanded={open}
      >
        <span className={`mt-[3px] shrink-0 text-[9px] text-slate-600 transition-transform ${open ? 'rotate-90' : ''}`}>
          &#9654;
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-semibold uppercase tracking-wider text-amber-500/90">{title}</span>
          {blurb && <span className="mt-2 block text-[13px] leading-relaxed text-slate-400">{blurb}</span>}
        </span>
      </button>
      {open && <div className="px-4 pb-4 sm:px-5 sm:pb-5">{children}</div>}
    </section>
  )
}

/** The pattern itself: a chip that opens the walkthrough when one exists. */
function PatternChip({ label, tone, algoId, onOpen }: { label: string; tone: Tone; algoId?: string; onOpen: (id: string) => void }) {
  const box = `inline-flex items-center gap-1.5 rounded border px-2 py-1 text-[13px] leading-tight ${TONE_BOX[tone]}`
  if (!algoId) return <span className={box}>{label}</span>
  return (
    <button onClick={() => onOpen(algoId)} className={`${box} transition-opacity hover:opacity-80`}>
      <span>{label}</span>
      <span aria-hidden className="text-[10px] opacity-60">
        &#8599;
      </span>
    </button>
  )
}

function SignalRow({ signal, onOpen }: { signal: Signal; onOpen: (id: string) => void }) {
  const tone = signal.tone ?? 'neutral'
  return (
    <div className="grid gap-x-5 gap-y-2 py-3.5 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
      <div className="flex items-start gap-2">
        <span aria-hidden className={`mt-[3px] shrink-0 text-xs ${TONE_HEAD[tone]}`}>
          &#9656;
        </span>
        <span className="text-[13px] leading-snug text-slate-200">{signal.cue}</span>
      </div>
      <div className="min-w-0">
        <PatternChip label={signal.pattern} tone={tone} algoId={signal.algoId} onOpen={onOpen} />
        <p className="mt-1.5 text-[13px] leading-relaxed text-slate-400">{signal.why}</p>
      </div>
    </div>
  )
}

/**
 * The chain, drawn vertically so the interviewer's prompt sits on the link
 * between two moves rather than beside them. The prompt is the cause; the next
 * rung is the effect.
 */
function LadderView({ ladder, onOpen }: { ladder: Ladder; onOpen: (id: string) => void }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3.5 sm:p-4">
      <p className="text-[13px] font-medium text-slate-200">{ladder.opening}</p>
      <div className="mt-3">
        {ladder.rungs.map((r, i) => {
          const tone = r.tone ?? 'neutral'
          return (
            <div key={i}>
              {r.prompt && (
                <div className="ml-3 flex items-center gap-2.5 border-l-2 border-amber-500/40 py-2 pl-4 sm:ml-4">
                  <span className="text-[13px] italic leading-snug text-amber-200/90">"{r.prompt}"</span>
                </div>
              )}
              <div className={`flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded border px-3 py-2 ${TONE_BOX[tone]}`}>
                {r.algoId ? (
                  <button
                    onClick={() => onOpen(r.algoId as string)}
                    className="text-left text-[13px] leading-snug underline decoration-dotted underline-offset-4 transition-opacity hover:opacity-80"
                  >
                    {r.move}
                    <span aria-hidden className="ml-1.5 text-[10px] opacity-60">
                      &#8599;
                    </span>
                  </button>
                ) : (
                  <span className="text-[13px] leading-snug">{r.move}</span>
                )}
                <span className="ml-auto shrink-0 font-mono text-[11px] opacity-70">{r.cost}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
