import type { Concept, ConceptGroup } from './concepts'
import type { Guide, GuideGroup } from './guides'
import type { Visual } from './visual'

/**
 * Concept answers, guide bodies and every diagram sit in two chunks that load
 * only when one of those pages is opened. The sidebar reads the light indexes
 * instead, so the first paint carries none of this.
 */

type ConceptsModule = {
  conceptGroups: ConceptGroup[]
  findConcept: (id: string) => { group: ConceptGroup; concept: Concept } | undefined
  conceptVisuals: Record<string, Visual>
}

let conceptsPromise: Promise<ConceptsModule> | null = null

export function loadConcepts(): Promise<ConceptsModule> {
  conceptsPromise ??= Promise.all([import('./concepts'), import('./conceptVisuals')]).then(
    ([concepts, visuals]) => ({
      conceptGroups: concepts.conceptGroups,
      findConcept: concepts.findConcept,
      conceptVisuals: visuals.conceptVisuals,
    }),
  )
  return conceptsPromise
}

type GuidesModule = { guideGroups: GuideGroup[]; findGuide: (id: string) => { group: GuideGroup; guide: Guide } | undefined }

let guidesPromise: Promise<GuidesModule> | null = null

export function loadGuides(): Promise<GuidesModule> {
  guidesPromise ??= import('./guides').then((m) => ({
    guideGroups: m.guideGroups,
    findGuide: (id: string) => {
      for (const group of m.guideGroups) {
        const guide = group.guides.find((g) => g.id === id)
        if (guide) return { group, guide }
      }
      return undefined
    },
  }))
  return guidesPromise
}
