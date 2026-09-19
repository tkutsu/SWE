import type { Algorithm, Cell, Role, StepGen } from '../engine/types'

const code = `function merge(intervals) {
  intervals.sort((x, y) => x[0] - y[0])
  const out = [intervals[0]]
  for (let i = 1; i < intervals.length; i++) {
    const last = out[out.length - 1]
    const cur = intervals[i]
    if (cur[0] <= last[1]) {
      last[1] = Math.max(last[1], cur[1])
    } else {
      out.push(cur)
    }
  }
  return out
}`

type Span = [number, number]

function parseIntervals(raw: string): Span[] {
  const found = [...raw.matchAll(/(-?\d+)\s*[,\-: ]\s*(-?\d+)/g)]
  if (found.length === 0) throw new Error('Write intervals as pairs, like 1,3  2,6  8,10.')
  if (found.length > 8) throw new Error('Keep it to 8 intervals so the timeline stays readable.')
  return found.map((m) => {
    const lo = Number(m[1])
    const hi = Number(m[2])
    if (hi < lo) throw new Error(`Interval ${lo},${hi} ends before it starts.`)
    return [lo, hi] as Span
  })
}

function* run(input: Record<string, string | number>): StepGen {
  const raw = parseIntervals(String(input.intervals))
  const sorted = [...raw].sort((x, y) => x[0] - y[0])
  const lo = Math.min(...sorted.map((s) => s[0]))
  const hi = Math.max(...sorted.map((s) => s[1]))
  const width = hi - lo + 1
  if (width > 22) throw new Error('The intervals span too wide a range to draw. Keep them within about 20 units.')

  const ticks = Array.from({ length: width }, (_, k) => lo + k)

  /** One row per interval, columns are time. Covered cells are filled. */
  const timeline = (rows: Span[], roles: Record<number, Role> = {}): Cell[][] =>
    rows.map((s, i) =>
      ticks.map((t) => ({
        value: t >= s[0] && t <= s[1] ? '' : '',
        role: t >= s[0] && t <= s[1] ? (roles[i] ?? 'window') : 'idle',
      })),
    )

  const label = (s: Span) => `${s[0]},${s[1]}`

  const views = (rows: Span[], roles: Record<number, Role>, title: string, out?: Span[]) => {
    const v = [
      {
        kind: 'grid' as const,
        label: title,
        cells: timeline(rows, roles),
        rowLabels: rows.map(label),
        colLabels: ticks,
        corner: '',
      },
    ]
    if (out) {
      v.push({
        kind: 'grid' as const,
        label: `merged so far (${out.length})`,
        cells: timeline(out, Object.fromEntries(out.map((_, i) => [i, 'match' as Role]))),
        rowLabels: out.map(label),
        colLabels: ticks,
        corner: '',
      })
    }
    return v
  }

  yield {
    line: 1,
    note: `Unsorted, "does anything overlap this one?" means checking all the others, which is O(n squared). Sorting by start time removes that: once the list is ordered, the only interval that can overlap the current one is the one you just kept.`,
    views: views(raw, {}, 'input order'),
    vars: { intervals: raw.map(label).join('  ') },
  }

  yield {
    line: 2,
    note: `Sorted by start: ${sorted.map(label).join('  ')}. Now a single left to right sweep is enough.`,
    views: views(sorted, {}, 'sorted by start'),
    vars: { sorted: sorted.map(label).join('  ') },
  }

  const out: Span[] = [[sorted[0][0], sorted[0][1]]]

  yield {
    line: 3,
    note: `Start the output with the earliest interval, ${label(sorted[0])}. Nothing before it can extend it, because nothing starts earlier.`,
    views: views(sorted, { 0: 'match' }, 'sorted by start', out),
    vars: { kept: out.map(label).join('  ') },
  }

  for (let i = 1; i < sorted.length; i++) {
    const cur = sorted[i]
    const last = out[out.length - 1]
    const overlaps = cur[0] <= last[1]

    yield {
      line: [4, 5, 6, 7],
      note: `Next is ${label(cur)}. The last kept interval ends at ${last[1]}. ${
        overlaps
          ? `${cur[0]} is not past ${last[1]}, so they touch or overlap and must become one.`
          : `${cur[0]} is past ${last[1]}, so there is a clear gap between them.`
      }`,
      views: views(sorted, { [i]: 'active' }, 'sorted by start', out),
      vars: { current: label(cur), 'last kept ends': last[1], overlaps },
    }

    if (overlaps) {
      const before = label(last)
      last[1] = Math.max(last[1], cur[1])
      yield {
        line: 8,
        note: `Extend the kept interval from ${before} to ${label(last)}. Taking the max matters: ${label(cur)} might sit entirely inside the one already kept, and blindly assigning its end would shrink the range.`,
        views: views(sorted, { [i]: 'compare' }, 'sorted by start', out),
        vars: { merged: label(last) },
      }
    } else {
      out.push([cur[0], cur[1]])
      yield {
        line: 10,
        note: `No overlap, so ${label(cur)} starts a new output interval. Because the list is sorted by start, nothing later can reach back over that gap.`,
        views: views(sorted, { [i]: 'match' }, 'sorted by start', out),
        vars: { kept: out.map(label).join('  ') },
      }
    }
  }

  yield {
    line: 13,
    note: `Done in one pass: ${out.map(label).join('  ')}. The sort costs O(n log n) and dominates, but the sweep itself is linear.`,
    views: views(sorted, {}, 'sorted by start', out),
    vars: { result: out.map(label).join('  ') },
    result: out.map((s) => `[${s[0]}, ${s[1]}]`).join('  '),
  }
}

export const intervals: Algorithm = {
  id: 'merge-intervals',
  name: 'Intervals: merge overlapping',
  rank: 12,
  tier: 2,
  blurb: 'Sort by start, then sweep once, comparing only against the last kept interval.',
  realWorld:
    'Calendar apps detect double bookings by merging busy ranges. Meeting room allocation, ad slot scheduling and rolling metrics up into time buckets are the same sweep.',
  idea:
    'Sorting by start time is what turns this from a pairwise problem into a linear one. After sorting, walk left to right holding only the most recently kept interval. The current interval either starts before that one ends, in which case they merge, or it does not, in which case nothing earlier can ever overlap it either. That is the entire argument, and it is worth being able to say out loud.',
  useWhen:
    'Merge intervals, insert interval, meeting rooms, free time, overlapping bookings. Any time the data is ranges and the question is about overlap. Sort by start for merging, by end for "how many can I fit".',
  pitfall:
    'Assigning the new end instead of taking the maximum. If one interval sits entirely inside another, that silently shrinks the merged range. Also decide up front whether touching endpoints count as overlapping, since [1,2] and [2,3] merge under <= and do not under <.',
  complexity: { time: 'O(n log n), dominated by the sort', space: 'O(n) for the output' },
  code,
  inputs: [{ name: 'intervals', label: 'intervals', kind: 'text', value: '1,3  2,6  8,10  9,12  15,18', hint: 'pairs, max 8' }],
  run,
}
