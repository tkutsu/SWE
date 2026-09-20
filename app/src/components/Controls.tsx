type Props = {
  index: number
  total: number
  atEnd: boolean
  onNext: () => void
  onPrev: () => void
}

const btn =
  'flex h-11 flex-1 items-center justify-center rounded-md border border-slate-700 bg-slate-800 px-4 text-sm text-slate-200 transition-colors active:bg-slate-700 disabled:opacity-40 lg:h-9 lg:flex-none lg:hover:bg-slate-700'

/**
 * Two buttons and a position. Stepping is the point of the page, and autoplay
 * was working against it: frames advance whether or not the one on screen has
 * landed, which is the opposite of what a step-through is for.
 *
 * Sticky to the bottom of the viewport on phones so stepping stays under the
 * thumb while the visualisation scrolls above it. Static in the flow on large
 * screens where there is room for it inline.
 */
export function Controls(p: Props) {
  return (
    <div className="sticky bottom-0 z-20 -mx-4 border-t border-slate-800 bg-slate-900/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none">
      <div className="flex items-center gap-3">
        <button className={btn} onClick={p.onPrev} disabled={p.index === 0}>
          Back
        </button>
        <span className="shrink-0 font-mono text-xs tabular-nums text-slate-500">
          {p.index + 1} / {p.total}
        </span>
        <button className={btn} onClick={p.onNext} disabled={p.atEnd}>
          Next
        </button>
      </div>
    </div>
  )
}
