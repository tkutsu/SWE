type Props = {
  index: number
  total: number
  playing: boolean
  speed: number
  atEnd: boolean
  onToggle: () => void
  onNext: () => void
  onPrev: () => void
  onReset: () => void
  onSeek: (i: number) => void
  onSpeed: (s: number) => void
}

const btn =
  'flex h-11 items-center justify-center rounded-md border border-slate-700 bg-slate-800 px-3 text-sm text-slate-200 transition-colors active:bg-slate-700 disabled:opacity-40 lg:h-9 lg:hover:bg-slate-700'

/**
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

      <div className="mt-2.5 flex items-center gap-2">
        <button className={btn} onClick={p.onReset} disabled={p.index === 0 && !p.playing} aria-label="reset">
          Reset
        </button>
        <button className={`${btn} flex-1 lg:flex-none`} onClick={p.onPrev} disabled={p.index === 0}>
          Back
        </button>
        <button
          className="flex h-11 flex-1 items-center justify-center rounded-md bg-amber-400 px-4 text-sm font-medium text-slate-900 transition-colors active:bg-amber-500 lg:h-9 lg:flex-none lg:hover:bg-amber-300"
          onClick={p.onToggle}
        >
          {p.playing ? 'Pause' : p.atEnd ? 'Replay' : 'Play'}
        </button>
        <button className={`${btn} flex-1 lg:flex-none`} onClick={p.onNext} disabled={p.atEnd}>
          Step
        </button>
        <select
          value={p.speed}
          onChange={(e) => p.onSpeed(Number(e.target.value))}
          aria-label="speed"
          className="h-11 shrink-0 rounded-md border border-slate-700 bg-slate-800 px-1.5 text-xs text-slate-300 lg:h-9"
        >
          <option value={0.5}>0.5x</option>
          <option value={1}>1x</option>
          <option value={2}>2x</option>
          <option value={4}>4x</option>
        </select>
      </div>
    </div>
  )
}
