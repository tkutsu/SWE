import { useCallback, useEffect, useMemo, useState } from 'react'
import { algorithms, byId } from './algorithms'
import { CodePanel } from './components/CodePanel'
import { ConceptPage } from './components/ConceptPage'
import { Controls } from './components/Controls'
import { GuidePage } from './components/GuidePage'
import { InputPanel } from './components/InputPanel'
import { IntroPanel } from './components/IntroPanel'
import { PracticePanel } from './components/PracticePanel'
import { BoardPage } from './components/BoardPage'
import { PatternRouter } from './components/PatternRouter'
import { Sidebar } from './components/Sidebar'
import { VarsPanel } from './components/VarsPanel'
import { Visualizer } from './components/Visualizer'
import { usePlayer } from './engine/usePlayer'
import { conceptGroups, findConcept } from './lib/concepts'
import { conceptVisuals } from './lib/conceptVisuals'
import { guideGroups } from './lib/guides'
import { intros } from './lib/intros'
import { practice } from './lib/practice'
import { useProgress } from './lib/progress'
import { checkKey, type Selection } from './lib/selection'
import type { Algorithm } from './engine/types'

const defaults = (algo: Algorithm): Record<string, string | number> =>
  Object.fromEntries(algo.inputs.map((f) => [f.name, f.value]))

const conceptOrder = conceptGroups.flatMap((g) => g.concepts.map((c) => c.id))
const guideOrder = guideGroups.flatMap((g) => g.guides.map((x) => x.id))

function findGuide(id: string) {
  for (const group of guideGroups) {
    const guide = group.guides.find((g) => g.id === id)
    if (guide) return { group, guide }
  }
  return undefined
}

export default function App() {
  const [selection, setSelection] = useState<Selection>({ kind: 'router' })
  const [menuOpen, setMenuOpen] = useState(false)
  const { done, toggle, isDone } = useProgress()

  const algo = (selection.kind === 'algo' ? byId(selection.id) : undefined) ?? algorithms[0]
  const concept = selection.kind === 'concept' ? findConcept(selection.id) : undefined
  const guide = selection.kind === 'guide' ? findGuide(selection.id) : undefined

  // Seeded from whatever is actually on screen, not from the first algorithm,
  // so landing straight on a walkthrough gets that walkthrough's inputs.
  const [inputs, setInputs] = useState<Record<string, string | number>>(() => defaults(algo))

  const pick = useCallback((next: Selection) => {
    setSelection(next)
    if (next.kind === 'algo') {
      const a = byId(next.id)
      if (a) setInputs(defaults(a))
    }
    window.scrollTo({ top: 0 })
  }, [])

  const player = usePlayer(algo, inputs)
  const { toggle: togglePlay, next, prev } = player
  const showingReading = selection.kind !== 'algo'

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT')) return
      if (e.key === 'Escape') {
        setMenuOpen(false)
        return
      }
      if (showingReading) return
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        next()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prev()
      } else if (e.key === ' ') {
        e.preventDefault()
        togglePlay()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev, togglePlay, showingReading])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const progress = useMemo(
    () => (player.frames.length > 1 ? (player.index / (player.frames.length - 1)) * 100 : 0),
    [player.index, player.frames.length],
  )

  const conceptPos = selection.kind === 'concept' ? conceptOrder.indexOf(selection.id) : -1
  const guidePos = selection.kind === 'guide' ? guideOrder.indexOf(selection.id) : -1
  const selfKey = checkKey(selection)

  const title =
    selection.kind === 'board'
      ? 'The complexity board'
      : selection.kind === 'router'
      ? 'Which pattern is this?'
      : guide
        ? guide.guide.title
        : concept
          ? concept.concept.question
          : `#${algo.rank <= 100 ? algo.rank : ''} ${algo.name}`.trim()

  return (
    <div className="flex min-h-dvh bg-slate-900 text-slate-100">
      <Sidebar
        current={selection}
        onPick={pick}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        isDone={isDone}
        toggle={toggle}
        doneCount={done.size}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-20 bg-slate-900">
          <div className="flex items-center gap-3 border-b border-slate-800 px-4 py-2.5 lg:hidden">
            <button
              onClick={() => setMenuOpen(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-slate-700 bg-slate-800 text-slate-300 active:bg-slate-700"
              aria-label="open menu"
            >
              <span className="text-lg leading-none">&#8801;</span>
            </button>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-slate-100">{title}</div>
            </div>
          </div>
          <div className="h-0.5 bg-slate-800">
            <div
              className="h-full bg-amber-400 transition-all duration-200"
              style={{ width: showingReading ? '0%' : `${progress}%` }}
            />
          </div>
        </div>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
          {selection.kind === 'router' ? (
            <PatternRouter onOpen={(id) => pick({ kind: 'algo', id })} />
          ) : selection.kind === 'board' ? (
            <BoardPage />
          ) : guide ? (
            <GuidePage
              group={guide.group}
              guide={guide.guide}
              done={isDone(selfKey)}
              onToggle={() => toggle(selfKey)}
              onPrev={guidePos > 0 ? () => pick({ kind: 'guide', id: guideOrder[guidePos - 1] }) : undefined}
              onNext={
                guidePos >= 0 && guidePos < guideOrder.length - 1
                  ? () => pick({ kind: 'guide', id: guideOrder[guidePos + 1] })
                  : undefined
              }
            />
          ) : concept ? (
            <ConceptPage
              group={concept.group}
              concept={concept.concept}
              visual={conceptVisuals[concept.concept.id]}
              done={isDone(selfKey)}
              onToggle={() => toggle(selfKey)}
              position={`${conceptPos + 1} of ${conceptOrder.length}`}
              onPrev={conceptPos > 0 ? () => pick({ kind: 'concept', id: conceptOrder[conceptPos - 1] }) : undefined}
              onNext={
                conceptPos >= 0 && conceptPos < conceptOrder.length - 1
                  ? () => pick({ kind: 'concept', id: conceptOrder[conceptPos + 1] })
                  : undefined
              }
            />
          ) : (
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
                      playing={player.playing}
                      speed={player.speed}
                      atEnd={player.atEnd}
                      onToggle={player.toggle}
                      onNext={player.next}
                      onPrev={player.prev}
                      onReset={player.reset}
                      onSeek={player.seek}
                      onSpeed={player.setSpeed}
                    />
                    <p className="hidden text-[11px] text-slate-600 lg:block">arrow keys step, space plays</p>
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
          )}
        </main>
      </div>
    </div>
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
