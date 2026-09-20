import { useState } from 'react'
import type { Intro } from '../lib/intros'
import { ConceptVisual } from './ConceptVisual'
import { CostBars } from './CostBars'
import { Visualizer } from './Visualizer'

/**
 * Sits above the player, because a step-by-step trace is only interesting once
 * you already want the answer.
 *
 * Two columns on a wide screen, because one column of prose capped at a
 * readable measure left the right half of the panel empty and pushed the
 * player's first frame off a 900px screen. On a phone it is the scene and the
 * picture, and everything else waits behind one toggle: the thing that moves
 * is the reel, and it should not be two screens down.
 */
export function IntroPanel({ intro, realWorld }: { intro: Intro; realWorld?: string }) {
  const [open, setOpen] = useState(false)
  const hasPicture = Boolean(intro.visual || intro.views)
  const show = open ? 'block' : 'hidden'

  return (
    <div className="mb-5 rounded-lg border border-slate-800 bg-slate-950/40 lg:mb-6">
      <div className="border-l-2 border-amber-500/70 px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex flex-col lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-6">
          <p className="order-1 text-[15px] leading-relaxed text-slate-100 sm:text-base lg:col-start-1 lg:row-start-1">
            {intro.scene}
          </p>

          <div className="order-2 mt-4 flex flex-col gap-4 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0">
            {intro.visual && (
              <div className="rounded-md border border-slate-800 bg-slate-950/60 px-3 py-3 sm:px-4">
                <ConceptVisual visual={intro.visual} />
              </div>
            )}
            {intro.views && (
              <div className="rounded-md border border-slate-800 bg-slate-950/60 px-3 py-3 sm:px-4">
                <Visualizer views={intro.views} roles={new Set()} />
              </div>
            )}
            {intro.cost && (
              <div className={`${show} lg:block`}>
                <CostBars cost={intro.cost} />
              </div>
            )}
          </div>

          <div className={`order-3 ${show} lg:col-start-1 lg:row-start-2 lg:block`}>
            {realWorld && (
              <p className="mt-3 text-[13px] leading-relaxed text-slate-300">
                <span className="mr-2 text-[11px] uppercase tracking-wider text-amber-500/90">Where this runs</span>
                {realWorld}
              </p>
            )}
            <p className="mt-3 text-[13px] leading-relaxed text-slate-400">
              <span className="mr-2 text-[11px] uppercase tracking-wider text-amber-500/90">Why it wins</span>
              {intro.payoff}
            </p>
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className={`order-4 mt-3 flex items-center gap-2 self-start text-[12px] text-slate-500 hover:text-slate-300 lg:hidden ${
              hasPicture || intro.cost || realWorld ? '' : 'hidden'
            }`}
            aria-expanded={open}
          >
            <span className={`text-[9px] transition-transform ${open ? 'rotate-90' : ''}`}>&#9654;</span>
            {open ? 'Hide why it wins' : 'Why it wins'}
          </button>
        </div>
      </div>
    </div>
  )
}
