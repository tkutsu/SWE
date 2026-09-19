import { TIER_LABEL, roadmap } from '../lib/roadmap'

const TIERS = [1, 2, 3, 4] as const

type Props = { current: string; onPick: (id: string) => void; open: boolean; onClose: () => void }

export function Sidebar({ current, onPick, open, onClose }: Props) {
  const done = roadmap.filter((r) => r.algoId).length

  return (
    <>
      {/* Backdrop, mobile only. Static sidebar on lg means it is never rendered there. */}
      {open && <div className="fixed inset-0 z-30 bg-slate-950/70 lg:hidden" onClick={onClose} aria-hidden />}

      <nav
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-800 bg-slate-950 transition-transform duration-200 lg:static lg:z-0 lg:w-64 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="algorithms"
      >
        <div className="flex items-start justify-between border-b border-slate-800 px-4 py-4">
          <div>
            <h1 className="text-sm font-semibold text-slate-100">Algos and Structs</h1>
            <p className="mt-1 text-xs text-slate-500">
              {done} of {roadmap.length} walkthroughs built
            </p>
          </div>
          <button
            onClick={onClose}
            className="-mr-1 -mt-1 flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-800 hover:text-slate-200 lg:hidden"
            aria-label="close menu"
          >
            &#215;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-2 py-3">
          {TIERS.map((tier) => (
            <div key={tier} className="mb-4">
              <div className="px-2 pb-1.5 text-[10px] uppercase tracking-wider text-slate-600">{TIER_LABEL[tier]}</div>
              {roadmap
                .filter((r) => r.tier === tier)
                .map((item) => {
                  const ready = Boolean(item.algoId)
                  const active = item.algoId === current
                  return (
                    <button
                      key={item.rank}
                      disabled={!ready}
                      onClick={() => {
                        if (!item.algoId) return
                        onPick(item.algoId)
                        onClose()
                      }}
                      className={`flex w-full items-center gap-2 rounded px-2 py-2.5 text-left text-[13px] transition-colors lg:py-1.5 ${
                        active
                          ? 'bg-amber-400/15 text-amber-200'
                          : ready
                            ? 'text-slate-300 active:bg-slate-800 lg:hover:bg-slate-800'
                            : 'cursor-default text-slate-600'
                      }`}
                    >
                      <span className={`w-5 shrink-0 text-right font-mono text-[11px] ${active ? 'text-amber-400' : 'text-slate-600'}`}>
                        {item.rank}
                      </span>
                      <span className="flex-1 leading-tight">{item.name}</span>
                      {!ready && <span className="text-[9px] uppercase tracking-wide text-slate-700">soon</span>}
                    </button>
                  )
                })}
            </div>
          ))}
        </div>
      </nav>
    </>
  )
}
