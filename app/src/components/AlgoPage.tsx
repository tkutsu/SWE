import { useEffect, useMemo, useState } from 'react'
import { lazyAlgorithms } from '../algorithms/lazy'
import { CodePanel } from './CodePanel'
import { Loading } from './Loading'
import { PageFooter } from './PageFooter'
import { Controls } from './Controls'
import { InputPanel } from './InputPanel'
import { IntroPanel } from './IntroPanel'
import { PracticePanel } from './PracticePanel'
import { VarsPanel } from './VarsPanel'
import { Visualizer } from './Visualizer'
import { usePlayer } from '../engine/usePlayer'
import { rolesUsed } from '../engine/roles'
import { CHANCE_LABEL, chanceOf } from '../lib/curriculum'
import { CHANCE_CHIP } from '../lib/chance'
import { intros } from '../lib/intros'
import { practice } from '../lib/practice'
import type { Algorithm } from '../engine/types'

const defaults = (algo: Algorithm): Record<string, string | number> =>
  Object.fromEntries(algo.inputs.map((f) => [f.name, f.value]))

/**
 * The player, and everything only it needs: the 51 generators, the practice
 * lists and the intros. Loaded on demand, so opening a concept page never
 * costs you the algorithms.
 */
type PageProps = {
  isDone: (key: string) => boolean
  toggle: (key: string) => void
  onProgress: (pct: number) => void
  position: string
  onPrev?: () => void
  onNext?: () => void
  nextTitle?: string
}

export function AlgoPage({ id, ...rest }: PageProps & { id: string }) {
  const [algo, setAlgo] = useState<Algorithm | undefined>(undefined)

  useEffect(() => {
    let live = true
    const load = lazyAlgorithms[id]
    if (!load) return
    setAlgo(undefined)
    void load().then((a) => {
      if (live) setAlgo(a)
    })
    return () => {
      live = false
    }
  }, [id])

  if (!algo) return <Loading />
  return <Player algo={algo} {...rest} />
}

/**
 * Split out so every hook below runs against a loaded algorithm, rather than
 * being guarded by a conditional return above them.
 */
function Player({ algo, isDone, toggle, onProgress, position, onPrev, onNext, nextTitle }: PageProps & { algo: Algorithm }) {
  const [inputs, setInputs] = useState<Record<string, string | number>>(() => defaults(algo))
  const [showCode, setShowCode] = useState(false)
  const [showInput, setShowInput] = useState(false)

  useEffect(() => {
    setInputs(defaults(algo))
  }, [algo])

  const player = usePlayer(algo, inputs)
  const { next, prev } = player
  const selfKey = `algo:${algo.id}`

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT')) return
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        next()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prev()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev])

  // Across the whole trace, not this frame, so the legend does not grow a new
  // key under you as you step.
  const roles = useMemo(() => rolesUsed(player.frames.flatMap((f) => f.views)), [player.frames])

  const progress = useMemo(
    () => (player.frames.length > 1 ? (player.index / (player.frames.length - 1)) * 100 : 0),
    [player.index, player.frames.length],
  )
  useEffect(() => {
    onProgress(progress)
    return () => onProgress(0)
  }, [progress, onProgress])

  return (
    <>
      <header className="mb-5 hidden lg:block">
        <div className="flex items-baseline gap-3">
          <h2 className="text-2xl font-semibold">{algo.name}</h2>
          <span className="text-[11px] uppercase tracking-wider text-slate-600">{position}</span>
        </div>
        <p className="mt-1.5 text-sm text-slate-400">{algo.blurb}</p>
      </header>

      <div className="mb-5 lg:mb-6">
        <p className="text-sm text-slate-400 lg:hidden">{algo.blurb}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-[11px]">
          {chanceOf('algo', algo.id) && (
            <span className={`rounded border px-2 py-1 font-sans ${CHANCE_CHIP[chanceOf('algo', algo.id)!]}`}>
              {CHANCE_LABEL[chanceOf('algo', algo.id)!]} in an interview
            </span>
          )}
          <button
            onClick={() => toggle(selfKey)}
            className={`rounded border px-2 py-1 font-sans transition-colors ${
              isDone(selfKey)
                ? 'border-emerald-600 bg-emerald-600/15 text-emerald-300'
                : 'border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {isDone(selfKey) ? '✓ done' : 'mark done'}
          </button>
        </div>
      </div>

      {intros[algo.id] && <IntroPanel intro={intros[algo.id]} realWorld={algo.realWorld} />}

      {player.error ? (
        <div className="rounded-lg border border-rose-800 bg-rose-950/40 px-4 py-3 text-sm text-rose-200">
          {player.error}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-6">
          <section className="flex min-w-0 flex-col gap-4 lg:gap-5">
            <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3 sm:p-5">
              <Visualizer views={player.current.views} roles={roles} />
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
              <div className="mb-1.5 text-xs uppercase tracking-wider text-slate-500">step {player.index + 1}</div>
              <p className="text-[15px] leading-relaxed text-slate-200">{player.current.note}</p>
              {player.current.result && (
                <div className="mt-3 overflow-x-auto rounded-md border border-emerald-800 bg-emerald-950/40 px-3 py-2 font-mono text-sm text-emerald-200">
                  {player.current.result}
                </div>
              )}
              {player.atEnd && onNext && (
                <button
                  onClick={() => {
                    if (!isDone(selfKey)) toggle(selfKey)
                    onNext()
                  }}
                  className="mt-3 flex w-full items-center gap-2 rounded-md border border-amber-500/40 bg-amber-400/[0.07] px-3 py-2.5 text-left text-[13px] text-amber-200 transition-colors hover:bg-amber-400/[0.12]"
                >
                  <span className="min-w-0 flex-1 truncate">
                    {isDone(selfKey) ? 'Go to' : 'Mark done and go to'} {nextTitle}
                  </span>
                  <span className="shrink-0">&rarr;</span>
                </button>
              )}
            </div>

            <Controls
              index={player.index}
              total={player.frames.length}
              atEnd={player.atEnd}
              onNext={player.next}
              onPrev={player.prev}
              onSeek={player.seek}
            />
            <p className="hidden text-[11px] text-slate-600 lg:block">arrow keys step</p>

            <div className="rounded-lg border border-slate-800 bg-slate-950/40">
              <button
                onClick={() => setShowInput((v) => !v)}
                className="flex w-full items-center justify-between px-4 py-2.5 text-[13px] text-slate-400 transition-colors hover:text-slate-200"
                aria-expanded={showInput}
              >
                <span>Run it on your own input</span>
                <span className={`text-[9px] transition-transform ${showInput ? 'rotate-90' : ''}`}>&#9654;</span>
              </button>
              {showInput && (
                <div className="border-t border-slate-800 px-4 pb-4 pt-3">
                  <InputPanel
                    fields={algo.inputs}
                    values={inputs}
                    onChange={(name, value) => setInputs((v) => ({ ...v, [name]: value }))}
                    onReset={() => setInputs(defaults(algo))}
                  />
                </div>
              )}
            </div>
          </section>

          <aside className="flex min-w-0 flex-col gap-4 lg:gap-5">
            <button
              onClick={() => setShowCode((v) => !v)}
              className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/40 px-4 py-2.5 text-[13px] text-slate-400 transition-colors hover:text-slate-200 lg:hidden"
              aria-expanded={showCode}
            >
              <span>{showCode ? 'Hide the code' : 'Show the code'}</span>
              <span className={`text-[9px] transition-transform ${showCode ? 'rotate-90' : ''}`}>&#9654;</span>
            </button>
            <div className={showCode ? '' : 'hidden lg:block'}>
              <CodePanel code={algo.code} line={player.current.line} />
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
              <VarsPanel vars={player.current.vars} />
            </div>
          </aside>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:mt-8">
        <Card title="The idea" body={algo.idea} complexity={algo.complexity} />
        <Card title="Reach for it when" body={algo.useWhen} />
        <Card title="What people get wrong" body={algo.pitfall} tone="rose" />
      </div>

      {practice[algo.id] && <PracticePanel problems={practice[algo.id]} />}

      <PageFooter
        done={isDone(selfKey)}
        onToggle={() => toggle(selfKey)}
        doneOn="Marked as done"
        doneOff="Mark as done"
        onPrev={onPrev}
        onNext={onNext}
        nextTitle={nextTitle}
      />
    </>
  )
}

function Card({
  title,
  body,
  tone,
  complexity,
}: {
  title: string
  body: string
  tone?: 'amber' | 'rose'
  complexity?: { time: string; space: string }
}) {
  const box =
    tone === 'rose'
      ? 'border-rose-900/60 bg-rose-950/20'
      : tone === 'amber'
        ? 'border-amber-500/25 bg-amber-400/[0.06]'
        : 'border-slate-800 bg-slate-950/40'
  const head = tone === 'rose' ? 'text-rose-400' : tone === 'amber' ? 'text-amber-500/90' : 'text-slate-500'

  return (
    <div className={`rounded-lg border p-4 ${box}`}>
      <h3 className={`mb-2 text-xs uppercase tracking-wider ${head}`}>{title}</h3>
      <p className="text-[13px] leading-relaxed text-slate-300">{body}</p>
      {complexity && (
        <div className="mt-3 flex flex-wrap gap-2 font-mono text-[11px]">
          <span className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-slate-300">time {complexity.time}</span>
          <span className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-slate-300">space {complexity.space}</span>
        </div>
      )}
    </div>
  )
}
