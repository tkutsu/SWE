import { Suspense, lazy, useCallback, useEffect, useState } from 'react'
import { Loading } from './components/Loading'
import { Sidebar } from './components/Sidebar'
import { curriculumItems } from './lib/curriculum'
import { doneCountIn, placeOf } from './lib/journey'
import { labels } from './lib/labels'
import { useProgress } from './lib/progress'
import { useSession } from './lib/session'
import { Toast } from './components/Toast'
import { checkKey, fromHash, rememberLast, toHash, type Selection } from './lib/selection'

/**
 * The shell, and nothing else. It knows what is selected, what is ticked and
 * what order things come in; every page and all of its data arrive on demand.
 * That is why the first load is the sidebar rather than 51 generators, 119
 * concept answers and 141 diagrams.
 */
const AlgoPage = lazy(() => import('./components/AlgoPage').then((m) => ({ default: m.AlgoPage })))
const ConceptLoader = lazy(() => import('./components/ConceptLoader').then((m) => ({ default: m.ConceptLoader })))
const GuideLoader = lazy(() => import('./components/GuideLoader').then((m) => ({ default: m.GuideLoader })))
const HomePage = lazy(() => import('./components/HomePage').then((m) => ({ default: m.HomePage })))
const PatternRouter = lazy(() => import('./components/PatternRouter').then((m) => ({ default: m.PatternRouter })))
const BoardPage = lazy(() => import('./components/BoardPage').then((m) => ({ default: m.BoardPage })))

/**
 * One order for everything, so Next leaves a concept and lands on the
 * algorithm that uses it. The two reference pages are deliberately absent:
 * they are maps, not stops, so Prev/Next steps over them.
 */
const order: Selection[] = curriculumItems.map((i) => ({ kind: i.kind, id: i.id }) as Selection)

const HOME: Selection = { kind: 'home' }

/**
 * A deep link wins, otherwise Home. Resuming moved to the Continue button on
 * Home: opening straight back onto the last page meant the home screen was
 * never seen twice.
 */
const initialSelection = (): Selection => fromHash(window.location.hash) ?? HOME

export default function App() {
  const [selection, setSelection] = useState<Selection>(initialSelection)
  const [menuOpen, setMenuOpen] = useState(false)
  const [progress, setProgress] = useState(0)
  const { toggle, isDone } = useProgress()
  const { start: startSession, clear: clearSession, nextIn } = useSession()
  const [beat, setBeat] = useState<{ text: string; done: number; total: number } | null>(null)

  /**
   * Ticking something off used to change a number in a sidebar nobody was
   * looking at. Say what moved, briefly.
   */
  const toggleWithBeat = useCallback(
    (key: string) => {
      const turningOn = !isDone(key)
      toggle(key)
      const place = placeOf.get(key)
      if (turningOn && place) {
        const done = doneCountIn(place.topic.items, isDone) + 1
        setBeat({ text: `${done} of ${place.topic.items.length} in ${place.topic.name}`, done, total: place.topic.items.length })
      }
    },
    [toggle, isDone],
  )

  useEffect(() => {
    if (!beat) return
    const t = setTimeout(() => setBeat(null), 1800)
    return () => clearTimeout(t)
  }, [beat])

  /**
   * Navigation goes through the URL rather than around it, so a click, a deep
   * link and the browser back button all arrive the same way.
   */
  const pick = useCallback((next: Selection) => {
    if (window.location.hash === toHash(next)) {
      setSelection(next)
      window.scrollTo({ top: 0 })
    } else {
      window.location.hash = toHash(next)
    }
  }, [])

  useEffect(() => {
    // An empty or unreadable hash on first paint gets replaced rather than
    // pushed, so Back does not land on the URL you never chose.
    if (!fromHash(window.location.hash)) {
      window.history.replaceState(null, '', toHash(selection))
    }
    const onHash = () => {
      const next = fromHash(window.location.hash)
      if (!next) return
      setSelection(next)
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
    // Runs once: after mount the hash is the only source of truth.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    rememberLast(selection)
  }, [selection])

  const selfKey = checkKey(selection)
  const pos = order.findIndex((o) => checkKey(o) === selfKey)
  const prevSel = pos > 0 ? order[pos - 1] : undefined
  // A sitting started on Home overrides the reading order, so its three items
  // behave as one thing rather than three places you have to find again.
  const sessionNext = nextIn(selfKey)
  const sessionSel = sessionNext ? order.find((o) => checkKey(o) === sessionNext) : undefined
  const nextSel = sessionSel ?? (pos >= 0 && pos < order.length - 1 ? order[pos + 1] : undefined)
  const goPrev = prevSel ? () => pick(prevSel) : undefined
  const goNext = nextSel ? () => pick(nextSel) : undefined
  const nextTitle = nextSel ? labels[checkKey(nextSel)] : undefined

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        return
      }
      const el = e.target as HTMLElement | null
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT')) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      // Arrows belong to the player, so paging gets j/k and the brackets.
      if (e.key === 'k' || e.key === '[') goPrev?.()
      else if (e.key === 'j' || e.key === ']') goNext?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goPrev, goNext])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const title = labels[selfKey] ?? ''
  // A nearby finish line pulls you along; "5 of 207" does the opposite.
  const place = placeOf.get(selfKey)
  const position = place ? `${place.n} of ${place.of} in ${place.topic.name}` : ''

  return (
    <div className="flex min-h-dvh bg-slate-900 text-slate-100">
      <Sidebar
        current={selection}
        onPick={pick}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        isDone={isDone}
        toggle={toggleWithBeat}
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
            {selection.kind === 'home' ? (
              <HomePage isDone={isDone} onPick={pick} onStartSession={startSession} onClearSession={clearSession} />
            ) : selection.kind === 'router' ? (
              <PatternRouter onOpen={(id) => pick({ kind: 'algo', id })} />
            ) : selection.kind === 'board' ? (
              <BoardPage />
            ) : selection.kind === 'guide' ? (
              <GuideLoader
                id={selection.id}
                done={isDone(selfKey)}
                onToggle={() => toggleWithBeat(selfKey)}
                position={position}
                onPrev={goPrev}
                onNext={goNext}
                nextTitle={nextTitle}
              />
            ) : selection.kind === 'concept' ? (
              <ConceptLoader
                id={selection.id}
                done={isDone(selfKey)}
                onToggle={() => toggleWithBeat(selfKey)}
                position={position}
                onPrev={goPrev}
                onNext={goNext}
                nextTitle={nextTitle}
                onOpen={pick}
              />
            ) : (
              <AlgoPage
                id={selection.id}
                isDone={isDone}
                toggle={toggleWithBeat}
                onProgress={setProgress}
                position={position}
                onPrev={goPrev}
                onNext={goNext}
                nextTitle={nextTitle}
              />
            )}
          </Suspense>
        </main>
      </div>

      {beat && <Toast text={beat.text} done={beat.done} total={beat.total} />}
    </div>
  )
}
