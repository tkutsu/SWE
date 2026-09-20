import { useEffect, useMemo, useState } from 'react'
import { lazyAlgorithms } from '../algorithms/lazy'
import { CodePanel } from './CodePanel'
import { Controls } from './Controls'
import { InputPanel } from './InputPanel'
import { IntroPanel } from './IntroPanel'
import { PracticePanel } from './PracticePanel'
import { VarsPanel } from './VarsPanel'
import { Visualizer } from './Visualizer'
import { usePlayer } from '../engine/usePlayer'
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
export function AlgoPage({
  id,
  isDone,
  toggle,
  onProgress,
}: {
  id: string
  isDone: (key: string) => boolean
  toggle: (key: string) => void
  onProgress: (pct: number) => void
}) {
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

  if (!algo) return <div className="h-40 animate-pulse rounded-lg border border-slate-800 bg-slate-950/40" aria-label="loading" />
  return <Player algo={algo} isDone={isDone} toggle={toggle} onProgress={onProgress} />
}

/**
 * Split out so every hook below runs against a loaded algorithm, rather than
 * being guarded by a conditional return above them.
 */
function Player({
  algo,
  isDone,
  toggle,
  onProgress,
}: {
  algo: Algorithm
  isDone: (key: string) => boolean
  toggle: (key: string) => void
  onProgress: (pct: number) => void
}) {
  const [inputs, setInputs] = useState<Record<string, string | number>>(() => defaults(algo))

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
          {algo.rank <= 100 && <span className="font-mono text-sm text-slate-600">#{algo.rank}</span>}
          <h2 className="text-2xl font-semibold">{algo.name}</h2>
        </div>
        <p className="mt-1.5 text-sm text-slate-400">{algo.blurb}</p>
      </header>

      <div className="mb-5 lg:mb-6">
        <p className="text-sm text-slate-400 lg:hidden">{algo.blurb}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-[11px]">
          <span className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-slate-300">
            time {algo.complexity.time}
          </span>
          <span className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-slate-300">
            space {algo.complexity.space}
          </span>
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

      {intros[algo.id] && <IntroPanel intro={intros[algo.id]} />}

      {player.error ? (
        <div className="rounded-lg border border-rose-800 bg-rose-950/40 px-4 py-3 text-sm text-rose-200">
          {player.error}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-6">
          <section className="flex min-w-0 flex-col gap-4 lg:gap-5">
            <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3 sm:p-5">
              <Visualizer views={player.current.views} />
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
              <div className="mb-1.5 text-xs uppercase tracking-wider text-slate-500">step {player.index + 1}</div>
              <p className="text-[15px] leading-relaxed text-slate-200">{player.current.note}</p>
              {player.current.result && (
                <div className="mt-3 overflow-x-auto rounded-md border border-emerald-800 bg-emerald-950/40 px-3 py-2 font-mono text-sm text-emerald-200">
                  {player.current.result}
                </div>
              )}
            </div>

            <Controls
              index={player.index}
              total={player.frames.length}
              atEnd={player.atEnd}
              onNext={player.next}
              onPrev={player.prev}
            />
            <p className="hidden text-[11px] text-slate-600 lg:block">arrow keys step</p>
          </section>

          <aside className="flex min-w-0 flex-col gap-4 lg:gap-5">
            <CodePanel code={algo.code} line={player.current.line} />
            <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
              <VarsPanel vars={player.current.vars} />
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
              <InputPanel
                fields={algo.inputs}
                values={inputs}
                onChange={(name, value) => setInputs((v) => ({ ...v, [name]: value }))}
                onReset={() => setInputs(defaults(algo))}
              />
            </div>
          </aside>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:mt-8">
        <Card title="The idea" body={algo.idea} />
        <Card title="Reach for it when" body={algo.useWhen} />
        <Card title="Where this actually runs" body={algo.realWorld} tone="amber" />
        <Card title="What people get wrong" body={algo.pitfall} tone="rose" />
      </div>

      {practice[algo.id] && <PracticePanel problems={practice[algo.id]} />}
    </>
  )
}

function Card({ title, body, tone }: { title: string; body: string; tone?: 'amber' | 'rose' }) {
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
    </div>
  )
}
