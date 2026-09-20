import { useMemo, useState } from 'react'
import { rolesUsed } from '../engine/roles'
import type { Scenario } from '../lib/scenarios'
import { CodePanel } from './CodePanel'
import { Controls } from './Controls'
import { Visualizer } from './Visualizer'

/**
 * The algorithm pages hold attention because something moves when you press a
 * key. This is that, for a concept: the same `Frame`s and the same views,
 * stepped by hand rather than produced by a generator.
 *
 * Deliberately not `usePlayer`: that one owns running a generator against
 * inputs and reporting the errors it throws, and none of that exists here. The
 * frames are already a list.
 */
export function ScenarioPlayer({ scenario }: { scenario: Scenario }) {
  const [index, setIndex] = useState(0)
  const frame = scenario.frames[index]
  const atEnd = index === scenario.frames.length - 1

  // Across the whole scenario rather than this frame, so the legend does not
  // grow a new key under you as you step.
  const roles = useMemo(() => rolesUsed(scenario.frames.flatMap((f) => f.views)), [scenario.frames])

  return (
    <div className="mt-5 rounded-lg border border-slate-800 bg-slate-950/40 p-4 sm:p-5">
      <h3 className="mb-4 text-xs uppercase tracking-wider text-slate-500">{scenario.title}</h3>

      {/*
        Code across the top rather than in a side column. These snippets are a
        handful of lines and the lines are long, so beside the drawing they
        were cut off mid-call, which is the one thing a code panel must not do.
      */}
      <div className="flex min-w-0 flex-col gap-4">
        {scenario.code && <CodePanel code={scenario.code} line={frame.line} />}

        <Visualizer views={frame.views} roles={roles} />

        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3.5">
          <p className="text-[14px] leading-relaxed text-slate-200">{frame.note}</p>
          {frame.result && (
            <div className="mt-3 overflow-x-auto rounded-md border border-emerald-800 bg-emerald-950/40 px-3 py-2 font-mono text-[13px] text-emerald-200">
              {frame.result}
            </div>
          )}
        </div>

        <Controls
          index={index}
          total={scenario.frames.length}
          atEnd={atEnd}
          onNext={() => setIndex((i) => Math.min(i + 1, scenario.frames.length - 1))}
          onPrev={() => setIndex((i) => Math.max(i - 1, 0))}
          onSeek={setIndex}
        />
      </div>
    </div>
  )
}
