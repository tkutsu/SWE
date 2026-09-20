/**
 * The bottom of every page: tick it off, then move.
 *
 * It was copied between the concept page and the guide page and missing
 * entirely from the algorithm page, which meant the only way out of a
 * walkthrough was the sidebar. One component, three callers.
 */
export function PageFooter({
  done,
  onToggle,
  doneOn,
  doneOff,
  onPrev,
  onNext,
  nextTitle,
}: {
  done: boolean
  onToggle: () => void
  doneOn: string
  doneOff: string
  onPrev?: () => void
  onNext?: () => void
  nextTitle?: string
}) {
  const btn =
    'flex h-11 items-center rounded-md border border-slate-700 bg-slate-800 px-3 text-sm text-slate-200 transition-colors hover:bg-slate-700 disabled:opacity-40 lg:h-9'

  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onToggle}
          className={`flex h-11 items-center gap-2 rounded-md border px-4 text-sm transition-colors lg:h-9 ${
            done
              ? 'border-emerald-600 bg-emerald-600/15 text-emerald-300'
              : 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
          }`}
        >
          <span>{done ? '✓' : ''}</span>
          {done ? doneOn : doneOff}
        </button>
        <div className="flex-1" />
        <button onClick={onPrev} disabled={!onPrev} className={btn}>
          Previous
        </button>
        <button onClick={onNext} disabled={!onNext} className={btn}>
          Next
        </button>
      </div>
      {nextTitle && onNext && (
        <button onClick={onNext} className="mt-2 block max-w-full truncate text-left text-[12px] text-slate-500 hover:text-slate-300">
          Next: {nextTitle}
        </button>
      )}
    </div>
  )
}
