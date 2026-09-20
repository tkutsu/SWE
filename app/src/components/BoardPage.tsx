import { caveats, latency, sorts, structures } from '../lib/board'
import { ConceptVisual } from './ConceptVisual'

/**
 * A reference page rather than a lesson, so it carries no checkbox for the
 * same reason the router does not.
 */
export function BoardPage() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <h2 className="text-xl font-semibold leading-tight sm:text-2xl">The complexity board</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
        Every walkthrough shows its own two badges, and two badges on two separate pages cannot be compared, which is
        the only reason anyone looks a complexity up in the first place. So here they are in one place. The growth
        curves and what a million items costs live on the Big O concept page and are not repeated.
      </p>

      <Section title="Latency numbers to know">
        <ConceptVisual visual={latency} />
      </Section>

      <Section title="Data structures, side by side">
        <ConceptVisual visual={structures} />
      </Section>

      <Section title="The sorts, side by side">
        <ConceptVisual visual={sorts} />
      </Section>

      <Section title="Six places the table lies to you">
        <div className="flex flex-col gap-4">
          {caveats.map((c) => (
            <div key={c.title} className="border-l-2 border-rose-800/70 pl-4">
              <h4 className="text-[13px] font-medium text-rose-200/90">{c.title}</h4>
              <p className="mt-1 text-[13px] leading-relaxed text-slate-400">{c.body}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 rounded-lg border border-slate-800 bg-slate-950/40 p-4 sm:p-5">
      <h3 className="text-[13px] font-semibold uppercase tracking-wider text-amber-500/90">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  )
}
