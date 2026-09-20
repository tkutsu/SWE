type Props = {
  index: number
  total: number
  atEnd: boolean
  onNext: () => void
  onPrev: () => void
  onSeek: (i: number) => void
}

const btn =
  'flex h-11 flex-1 items-center justify-center rounded-md border border-slate-700 bg-slate-800 px-4 text-sm text-slate-200 transition-colors active:bg-slate-700 disabled:opacity-40 lg:h-9 lg:flex-none lg:hover:bg-slate-700'

/**
 * Stepping and scrubbing, and nothing that moves on its own. Autoplay was
 * working against the page, since a frame advanced whether or not the one on
 * screen had landed. The scrubber is the opposite: it only moves when you move
 * it, and it is the one way to jump straight to a step you remember.
 *
 * Sticky to the bottom of the viewport on phones so stepping stays under the
 * thumb while the visualisation scrolls above it. Static in the flow on large
 * screens where there is room for it inline.
 */
export function Controls(p: Props) {
  return (
    <div className="sticky bottom-0 z-20 -mx-4 border-t border-slate-800 bg-slate-900/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none">
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={Math.max(0, p.total - 1)}
          value={p.index}
          onChange={(e) => p.onSeek(Number(e.target.value))}
          className="h-1.5 min-w-0 flex-1 cursor-pointer accent-amber-400"
          aria-label="step"
        />
        <span className="shrink-0 font-mono text-xs tabular-nums text-slate-500">
          {p.index + 1} / {p.total}
        </span>
      </div>

      <div className="mt-2.5 flex items-center gap-3">
        <button className={btn} onClick={p.onPrev} disabled={p.index === 0}>
          Back
        </button>
        <button className={btn} onClick={p.onNext} disabled={p.atEnd}>
          Next
        </button>
      </div>
    </div>
  )
}
