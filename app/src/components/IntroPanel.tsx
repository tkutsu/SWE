import type { Intro } from '../lib/intros'

/**
 * Sits above the player, because a step-by-step trace is only interesting once
 * you already want the answer. Wide measure, larger type, no code and no
 * notation: this is the paragraph you read before deciding to press play.
 */
export function IntroPanel({ intro }: { intro: Intro }) {
  return (
    <div className="mb-5 rounded-lg border border-slate-800 bg-slate-950/40 lg:mb-6">
      <div className="border-l-2 border-amber-500/70 px-4 py-4 sm:px-5 sm:py-5">
        <p className="max-w-2xl text-[15px] leading-relaxed text-slate-100 sm:text-base">{intro.scene}</p>
        <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-slate-400">
          <span className="mr-2 text-[11px] uppercase tracking-wider text-amber-500/90">Why it wins</span>
          {intro.payoff}
        </p>
      </div>
    </div>
  )
}
