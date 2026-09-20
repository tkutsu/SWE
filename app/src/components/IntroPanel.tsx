import type { Intro } from '../lib/intros'
import { ConceptVisual } from './ConceptVisual'
import { CostBars } from './CostBars'
import { Visualizer } from './Visualizer'

/**
 * Sits above the player, because a step-by-step trace is only interesting once
 * you already want the answer. Wide measure, larger type, no code and no
 * notation: this is what you read before deciding to press play.
 *
 * Order is hook, then picture, then the rest. "git bisect is this" is a hook,
 * so `realWorld` is here rather than in a card below the walkthrough, which is
 * where it used to sit despite the README claiming otherwise.
 */
export function IntroPanel({ intro, realWorld }: { intro: Intro; realWorld?: string }) {
  const hasPicture = Boolean(intro.cost || intro.visual || intro.views)

  return (
    <div className="mb-5 rounded-lg border border-slate-800 bg-slate-950/40 lg:mb-6">
      <div className="border-l-2 border-amber-500/70 px-4 py-4 sm:px-5 sm:py-5">
        <p className="max-w-2xl text-[15px] leading-relaxed text-slate-100 sm:text-base">{intro.scene}</p>

        {realWorld && (
          <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-slate-300">
            <span className="mr-2 text-[11px] uppercase tracking-wider text-amber-500/90">Where this runs</span>
            {realWorld}
          </p>
        )}

        {hasPicture && (
          <div className="mt-4 flex flex-col gap-4">
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
            {intro.cost && <CostBars cost={intro.cost} />}
          </div>
        )}

        <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-slate-400">
          <span className="mr-2 text-[11px] uppercase tracking-wider text-amber-500/90">Why it wins</span>
          {intro.payoff}
        </p>
      </div>
    </div>
  )
}
