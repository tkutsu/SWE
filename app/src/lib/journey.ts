import { TRACKS, curriculum, type Item, type Topic, type Track } from './curriculum'

/**
 * The curriculum sliced the way the sidebar and the home page want to read it:
 * track, then phase, then topic. Derived rather than declared, so there is
 * still exactly one ordering and nothing can drift out of step with it.
 */
export const keyOf = (item: Pick<Item, 'kind' | 'id'>) => `${item.kind}:${item.id}`

export type Phase = { name: string; track: Track; topics: Topic[]; items: Item[] }

export const phases: Phase[] = (() => {
  const out: Phase[] = []
  for (const topic of curriculum) {
    const last = out[out.length - 1]
    if (last && last.name === topic.phase) {
      last.topics.push(topic)
      last.items.push(...topic.items)
    } else {
      out.push({ name: topic.phase, track: topic.track, topics: [topic], items: [...topic.items] })
    }
  }
  return out
})()

export type TrackArc = { track: Track; phases: Phase[]; items: Item[] }

export const tracks: TrackArc[] = TRACKS.map((track) => {
  const mine = phases.filter((p) => p.track === track)
  return { track, phases: mine, items: mine.flatMap((p) => p.items) }
}).filter((t) => t.items.length > 0)

/** Which topic an item sits in, and where in it. Drives "2 of 3 in Cost". */
export const placeOf = new Map<string, { topic: Topic; phase: Phase; n: number; of: number }>()
for (const phase of phases) {
  for (const topic of phase.topics) {
    topic.items.forEach((item, n) => {
      placeOf.set(keyOf(item), { topic, phase, n: n + 1, of: topic.items.length })
    })
  }
}

export const doneCountIn = (items: Item[], isDone: (key: string) => boolean) =>
  items.reduce((n, i) => n + (isDone(keyOf(i)) ? 1 : 0), 0)

/** The first thing not yet ticked. What "Continue" and "Next up" both point at. */
export const firstUndone = (items: Item[], isDone: (key: string) => boolean) =>
  items.find((i) => !isDone(keyOf(i)))
