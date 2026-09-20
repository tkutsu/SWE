import { labels } from '../lib/labels'
import { minutes } from '../lib/minutes'
import { curriculumItems } from '../lib/curriculum'
import { doneCountIn, firstUndone, keyOf, placeOf, tracks } from '../lib/journey'
import type { Selection } from '../lib/selection'
import { Ring } from './Ring'

const selectionFor = (item: { kind: 'algo' | 'concept' | 'guide'; id: string }): Selection =>
  ({ kind: item.kind, id: item.id }) as Selection

/**
 * The landing page, and mostly a picture.
 *
 * What used to be here was the pattern router: a wall of tables that only
 * means anything once you already know the patterns, which is the opposite of
 * what someone opening the app on day one needs. This answers one question
 * instead, which is "where was I, and what is next".
 */
export function HomePage({ isDone, onPick }: { isDone: (key: string) => boolean; onPick: (sel: Selection) => void }) {
  const doneAll = doneCountIn(curriculumItems, isDone)
  const resume = firstUndone(curriculumItems, isDone)
  const place = resume ? placeOf.get(keyOf(resume)) : undefined

  return (
    <div className="mx-auto w-full max-w-3xl">
      <h2 className="text-xl font-semibold leading-tight sm:text-2xl">Everything the loop asks for, in order</h2>
      <p className="mt-1.5 text-sm text-slate-400">
        {doneAll} of {curriculumItems.length} done. Nothing here needs anything below it.
      </p>

      {resume ? (
        <button
          onClick={() => onPick(selectionFor(resume))}
          className="mt-5 flex w-full items-center gap-4 rounded-lg border border-amber-500/40 bg-amber-400/[0.07] px-4 py-4 text-left transition-colors hover:bg-amber-400/[0.12] sm:px-5"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] uppercase tracking-wider text-amber-500/90">Continue</span>
            <span className="mt-1 block truncate text-[15px] font-medium text-slate-100">{labels[keyOf(resume)]}</span>
            {place && (
              <span className="mt-0.5 block text-[12px] text-slate-500">
                {place.n} of {place.of} in {place.topic.name} · {minutes[keyOf(resume)]} min
              </span>
            )}
          </span>
          <span className="shrink-0 text-lg text-amber-400">&rarr;</span>
        </button>
      ) : (
        <div className="mt-5 rounded-lg border border-emerald-700/60 bg-emerald-950/30 px-4 py-4 text-[15px] text-emerald-200">
          Every item is ticked. Switch the sidebar to "By chance" and go again on the ones marked "expect it".
        </div>
      )}

      <div className="mt-6 flex flex-col gap-4">
        {tracks.map((arc) => {
          const trackDone = doneCountIn(arc.items, isDone)
          const up = firstUndone(arc.items, isDone)
          return (
            <section key={arc.track} className="rounded-lg border border-slate-800 bg-slate-950/40 p-4 sm:p-5">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-[15px] font-semibold text-slate-100">{arc.track}</h3>
                <span className="shrink-0 text-[12px] tabular-nums text-slate-500">
                  {trackDone} / {arc.items.length}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-3">
                {arc.phases.map((phase) => (
                  <div key={phase.name} className="flex items-center gap-2">
                    <Ring done={doneCountIn(phase.items, isDone)} total={phase.items.length} />
                    <span className="text-[12px] leading-tight text-slate-400">{phase.name}</span>
                  </div>
                ))}
              </div>

              {up && (
                <button
                  onClick={() => onPick(selectionFor(up))}
                  className="mt-3.5 flex w-full items-center gap-2 border-t border-slate-800 pt-3 text-left text-[13px] text-slate-400 transition-colors hover:text-slate-200"
                >
                  <span className="text-[11px] uppercase tracking-wider text-slate-600">Next up</span>
                  <span className="min-w-0 flex-1 truncate">{labels[keyOf(up)]}</span>
                  <span className="shrink-0 text-[11px] text-slate-600">{minutes[keyOf(up)]} min</span>
                </button>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
