import { useCallback, useEffect, useMemo, useState } from 'react'
import { algorithms, byId } from './algorithms'
import { CodePanel } from './components/CodePanel'
import { Controls } from './components/Controls'
import { InputPanel } from './components/InputPanel'
import { Sidebar } from './components/Sidebar'
import { VarsPanel } from './components/VarsPanel'
import { Visualizer } from './components/Visualizer'
import { usePlayer } from './engine/usePlayer'
import type { Algorithm } from './engine/types'

const defaults = (algo: Algorithm): Record<string, string | number> =>
  Object.fromEntries(algo.inputs.map((f) => [f.name, f.value]))

export default function App() {
  const [id, setId] = useState(algorithms[0].id)
  const algo = byId(id) ?? algorithms[0]
  const [inputs, setInputs] = useState<Record<string, string | number>>(() => defaults(algo))
  const [menuOpen, setMenuOpen] = useState(false)

  const pick = useCallback((next: string) => {
    const a = byId(next)
    if (!a) return
    setId(next)
    setInputs(defaults(a))
    window.scrollTo({ top: 0 })
  }, [])

  const player = usePlayer(algo, inputs)
  const { toggle, next, prev } = player

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
      } else if (e.key === ' ') {
        e.preventDefault()
        toggle()
      } else if (e.key === 'Escape') {
        setMenuOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev, toggle])

  // The drawer covers the page on phones, so the page behind it must not scroll.
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

  return (
    <div className="flex min-h-dvh bg-slate-900 text-slate-100">
      <Sidebar current={algo.id} onPick={pick} open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Progress bar doubles as the mobile header border. */}
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
              <div className="truncate text-sm font-medium text-slate-100">
                <span className="font-mono text-slate-600">#{algo.rank}</span> {algo.name}
              </div>
            </div>
          </div>
          <div className="h-0.5 bg-slate-800">
            <div className="h-full bg-amber-400 transition-all duration-200" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
          <header className="mb-5 hidden lg:block">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-sm text-slate-600">#{algo.rank}</span>
              <h2 className="text-2xl font-semibold">{algo.name}</h2>
            </div>
            <p className="mt-1.5 text-sm text-slate-400">{algo.blurb}</p>
          </header>

          <div className="mb-4 lg:mb-5">
            <p className="text-sm text-slate-400 lg:hidden">{algo.blurb}</p>
            <div className="mt-3 flex flex-wrap gap-2 font-mono text-[11px]">
              <span className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-slate-300">
                time {algo.complexity.time}
              </span>
              <span className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-slate-300">
                space {algo.complexity.space}
              </span>
            </div>
          </div>

          <div className="mb-5 rounded-lg border border-amber-500/25 bg-amber-400/[0.06] px-4 py-3 lg:mb-6">
            <div className="mb-1.5 text-[10px] uppercase tracking-wider text-amber-500/90">
              where this actually runs
            </div>
            <p className="text-[13px] leading-relaxed text-slate-300">{algo.realWorld}</p>
          </div>

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

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3 lg:mt-8">
            <Card title="The idea" body={algo.idea} />
            <Card title="Reach for it when" body={algo.useWhen} />
            <Card title="What people get wrong" body={algo.pitfall} accent />
          </div>
        </main>
      </div>
    </div>
  )
}

function Card({ title, body, accent }: { title: string; body: string; accent?: boolean }) {
  return (
    <div
      className={`rounded-lg border p-4 ${accent ? 'border-rose-900/60 bg-rose-950/20' : 'border-slate-800 bg-slate-950/40'}`}
    >
      <h3 className={`mb-2 text-xs uppercase tracking-wider ${accent ? 'text-rose-400' : 'text-slate-500'}`}>{title}</h3>
      <p className="text-[13px] leading-relaxed text-slate-300">{body}</p>
    </div>
  )
}
