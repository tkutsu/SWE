import { problemUrl, type Problem } from '../lib/practice'
import { problemMeta } from '../lib/practiceMeta'

const LEVEL_STYLE = {
  easy: 'border-emerald-700/70 bg-emerald-950/40 text-emerald-300',
  medium: 'border-amber-500/40 bg-amber-400/10 text-amber-300',
  hard: 'border-rose-800/70 bg-rose-950/30 text-rose-300',
} as const

/**
 * The end of the page, because drilling comes after understanding. Sits below
 * the four cards so the walkthrough still closes on what people get wrong.
 *
 * Titles and difficulty come from the generated metadata rather than from this
 * file, so they cannot drift from what leetcode actually serves.
 */
export function PracticePanel({ problems }: { problems: Problem[] }) {
  const counts = { easy: 0, medium: 0, hard: 0 }
  for (const p of problems) {
    const m = problemMeta[p.slug]
    if (m) counts[m.level]++
  }

  return (
    <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/40 p-4 lg:mt-6">
      <h3 className="mb-1 text-xs uppercase tracking-wider text-slate-500">
        Now drill it &#183; {problems.length} {problems.length === 1 ? 'problem' : 'problems'}
      </h3>
      <p className="mb-3 text-[12px] leading-relaxed text-slate-600">
        {counts.easy} easy, {counts.medium} medium, {counts.hard} hard, roughly in that order. Opens on leetcode.com.
      </p>
      <ul className="flex flex-col gap-2">
        {problems.map((p) => {
          const meta = problemMeta[p.slug]
          return (
            <li key={p.slug} className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span
                className={`shrink-0 rounded border px-1.5 py-0.5 font-mono text-[10px] leading-none ${
                  meta ? LEVEL_STYLE[meta.level] : 'border-slate-700 text-slate-500'
                }`}
              >
                {meta ? meta.level : '?'}
              </span>
              <a
                href={problemUrl(p.slug)}
                target="_blank"
                rel="noreferrer"
                className="text-[13px] text-slate-300 underline decoration-slate-700 decoration-dotted underline-offset-4 transition-colors hover:text-amber-200 hover:decoration-amber-500/60"
              >
                {meta ? meta.title : p.slug}
              </a>
              {meta?.premium && (
                <span className="shrink-0 rounded border border-slate-700 px-1.5 py-0.5 text-[10px] leading-none text-slate-500">
                  premium
                </span>
              )}
              {p.note && <span className="text-[12px] leading-relaxed text-slate-500">{p.note}</span>}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
