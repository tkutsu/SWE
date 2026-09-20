import { Suspense, lazy, useCallback, useEffect, useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { curriculumItems } from './lib/curriculum'
import { labels } from './lib/labels'
import { useProgress } from './lib/progress'
import { checkKey, type Selection } from './lib/selection'

/**
 * The shell, and nothing else. It knows what is selected, what is ticked and
 * what order things come in; every page and all of its data arrive on demand.
 * That is why the first load is the sidebar rather than 51 generators, 119
 * concept answers and 141 diagrams.
 */
const AlgoPage = lazy(() => import('./components/AlgoPage').then((m) => ({ default: m.AlgoPage })))
const ConceptLoader = lazy(() => import('./components/ConceptLoader').then((m) => ({ default: m.ConceptLoader })))
const GuideLoader = lazy(() => import('./components/GuideLoader').then((m) => ({ default: m.GuideLoader })))
const PatternRouter = lazy(() => import('./components/PatternRouter').then((m) => ({ default: m.PatternRouter })))
const BoardPage = lazy(() => import('./components/BoardPage').then((m) => ({ default: m.BoardPage })))

/** One order for everything, so Next leaves a concept and lands on the algorithm that uses it. */
const order: Selection[] = curriculumItems.map((i) =>
  i.kind === 'page' ? ({ kind: i.id } as Selection) : ({ kind: i.kind, id: i.id } as Selection),
)

function Loading() {
  return <div className="h-40 animate-pulse rounded-lg border border-slate-800 bg-slate-950/40" aria-label="loading" />
}

export default function App() {
  const [selection, setSelection] = useState<Selection>({ kind: 'router' })
  const [menuOpen, setMenuOpen] = useState(false)
  const [progress, setProgress] = useState(0)
  const { done, toggle, isDone } = useProgress()

  const pick = useCallback((next: Selection) => {
    setSelection(next)
    window.scrollTo({ top: 0 })
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const selfKey = checkKey(selection)
  const pos = order.findIndex((o) => checkKey(o) === selfKey)
  const goPrev = pos > 0 ? () => pick(order[pos - 1]) : undefined
  const goNext = pos >= 0 && pos < order.length - 1 ? () => pick(order[pos + 1]) : undefined
  const title = labels[selection.kind === 'algo' || selection.kind === 'concept' || selection.kind === 'guide'
    ? `${selection.kind}:${selection.id}`
    : `page:${selection.kind}`] ?? ''

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
            <div className="h-full bg-amber-400 transition-all duration-200" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
          <Suspense fallback={<Loading />}>
            {selection.kind === 'router' ? (
              <PatternRouter onOpen={(id) => pick({ kind: 'algo', id })} />
            ) : selection.kind === 'board' ? (
              <BoardPage />
            ) : selection.kind === 'guide' ? (
              <GuideLoader
                id={selection.id}
                done={isDone(selfKey)}
                onToggle={() => toggle(selfKey)}
                onPrev={goPrev}
                onNext={goNext}
              />
            ) : selection.kind === 'concept' ? (
              <ConceptLoader
                id={selection.id}
                done={isDone(selfKey)}
                onToggle={() => toggle(selfKey)}
                position={`${pos + 1} of ${order.length}`}
                onPrev={goPrev}
                onNext={goNext}
              />
            ) : (
              <AlgoPage id={selection.id} isDone={isDone} toggle={toggle} onProgress={setProgress} />
            )}
          </Suspense>
        </main>
      </div>
    </div>
  )
}
