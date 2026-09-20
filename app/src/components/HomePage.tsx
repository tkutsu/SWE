import { labels } from '../lib/labels'
import { minutes } from '../lib/minutes'
import { curriculumItems } from '../lib/curriculum'
import { doneCountIn, firstUndone, keyOf, placeOf, tracks } from '../lib/journey'
import { checkKey, recallLast, type Selection } from '../lib/selection'
import { sessionMinutes, suggestSession } from '../lib/session'
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
export function HomePage({
  isDone,
  onPick,
  onStartSession,
  onClearSession,
}: {
  isDone: (key: string) => boolean
  onPick: (sel: Selection) => void
  onStartSession: (keys: string[]) => void
  onClearSession: () => void
}) {
  const doneAll = doneCountIn(curriculumItems, isDone)

  /**
   * Where you actually were, not where the list says you should be. Someone
   * who jumped around wants the page they left, and only falls back to the
   * first unticked item when that page is finished or gone.
   */
  const last = recallLast()
  const lastKey = last ? checkKey(last) : undefined
  const resumable = lastKey && placeOf.has(lastKey) && !isDone(lastKey) ? last : undefined
  const resume = resumable ?? firstUndone(curriculumItems, isDone)
  const resumeKey = resume ? checkKey(resume as Selection) : undefined
  const place = resumeKey ? placeOf.get(resumeKey) : undefined

  const session = suggestSession(isDone)
  const total = sessionMinutes(session)

  return (
    <div className="mx-auto w-full max-w-3xl">
      <h2 className="text-xl font-semibold leading-tight sm:text-2xl">Everything the loop asks for, in order</h2>
      <p className="mt-1.5 text-sm text-slate-400">
        {doneAll} of {curriculumItems.length} done. Nothing here needs anything below it.
      </p>

      {/*
        Three items, not 205. The number that gets a sitting started is the one
        you can picture finishing.
      */}
      {session.length > 0 && (
        <section className="mt-5 rounded-lg border border-amber-500/40 bg-amber-400/[0.07] p-4 sm:p-5">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-[11px] uppercase tracking-wider text-amber-500/90">Today</h3>
            <span className="shrink-0 text-[12px] text-slate-400">{total} min total</span>
          </div>

          <ol className="mt-3 flex flex-col gap-1.5">
            {session.map((item, i) => (
              <li key={keyOf(item)}>
                <button
                  onClick={() => {
                    onStartSession(session.map(keyOf))
                    onPick(selectionFor(item))
                  }}
                  className="flex w-full items-baseline gap-2.5 rounded px-2 py-1.5 text-left transition-colors hover:bg-amber-400/10"
                >
                  <span className="shrink-0 font-mono text-[11px] text-slate-600">{i + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-[14px] text-slate-100">{labels[keyOf(item)]}</span>
                  <span className="shrink-0 text-[11px] tabular-nums text-slate-500">{minutes[keyOf(item)]}m</span>
                </button>
              </li>
            ))}
          </ol>

          <button
            onClick={() => {
              onStartSession(session.map(keyOf))
              onPick(selectionFor(session[0]))
            }}
            className="mt-3 flex h-11 w-full items-center justify-center rounded-md border border-amber-500/50 bg-amber-400/15 text-sm font-medium text-amber-100 transition-colors hover:bg-amber-400/25 lg:h-10"
          >
            Start these three
          </button>
          <p className="mt-2 text-[11px] text-slate-500">Next carries you through all three, then hands you back to the list.</p>
        </section>
      )}

      {resume ? (
        <button
          onClick={() => {
            onClearSession()
            onPick(resume as Selection)
          }}
          className="mt-4 flex w-full items-center gap-4 rounded-lg border border-slate-800 bg-slate-950/40 px-4 py-4 text-left transition-colors hover:border-slate-700 hover:bg-slate-900/60 sm:px-5"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] uppercase tracking-wider text-slate-500">
              {resumable ? 'Back to where you were' : 'Continue'}
            </span>
            <span className="mt-1 block truncate text-[15px] font-medium text-slate-100">{resumeKey ? labels[resumeKey] : ''}</span>
            {place && (
              <span className="mt-0.5 block text-[12px] text-slate-500">
                {place.n} of {place.of} in {place.topic.name} · {resumeKey ? minutes[resumeKey] : 0} min
              </span>
            )}
          </span>
          <span className="shrink-0 text-lg text-slate-500">&rarr;</span>
        </button>
      ) : (
        <div className="mt-4 rounded-lg border border-emerald-700/60 bg-emerald-950/30 px-4 py-4 text-[15px] text-emerald-200">
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

              <div className="mt-3 grid grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-2">
                {arc.phases.map((phase) => {
                  const n = doneCountIn(phase.items, isDone)
                  return (
                    <div key={phase.name} className="flex items-center gap-2.5">
                      <Ring done={n} total={phase.items.length} />
                      <span className="min-w-0 flex-1 text-[12px] leading-tight text-slate-400">
                        {phase.name}
                        <span className="ml-1.5 tabular-nums text-slate-600">
                          {n}/{phase.items.length}
                        </span>
                      </span>
                    </div>
                  )
                })}
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
