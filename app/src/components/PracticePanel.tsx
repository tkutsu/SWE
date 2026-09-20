import { problemUrl, type Problem } from '../lib/practice'

/**
 * The end of the page, because drilling comes after understanding. Sits below
 * the four cards so the walkthrough still closes on what people get wrong.
 */
export function PracticePanel({ problems }: { problems: Problem[] }) {
  return (
    <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/40 p-4 lg:mt-6">
      <h3 className="mb-1 text-xs uppercase tracking-wider text-slate-500">
        Now drill it &#183; {problems.length} {problems.length === 1 ? 'problem' : 'problems'}
      </h3>
      <p className="mb-3 text-[12px] leading-relaxed text-slate-600">
        Roughly in order of difficulty. Opens on leetcode.com.
      </p>
      <ul className="flex flex-col gap-1.5">
        {problems.map((p) => (
          <li key={p.slug} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <a
              href={problemUrl(p.slug)}
              target="_blank"
              rel="noreferrer"
              className="text-[13px] text-slate-300 underline decoration-slate-700 decoration-dotted underline-offset-4 transition-colors hover:text-amber-200 hover:decoration-amber-500/60"
            >
              {p.title}
            </a>
            {p.note && <span className="text-[12px] leading-relaxed text-slate-500">{p.note}</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}
