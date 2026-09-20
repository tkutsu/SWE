import { findConcept } from '../lib/concepts'
import { conceptHooks } from '../lib/conceptHooks'
import { conceptVisuals } from '../lib/conceptVisuals'
import type { Selection } from '../lib/selection'
import { ConceptPage } from './ConceptPage'

/** Owns the concept data and its diagrams, so the shell does not. */
export function ConceptLoader(props: {
  id: string
  done: boolean
  onToggle: () => void
  onPrev?: () => void
  onNext?: () => void
  position: string
  nextTitle?: string
  onOpen: (sel: Selection) => void
}) {
  const found = findConcept(props.id)
  if (!found) return <p className="text-sm text-slate-400">That concept no longer exists.</p>
  // A hook written into the source wins; the overlay covers the rest.
  const concept = found.concept.hook ? found.concept : { ...found.concept, hook: conceptHooks[found.concept.id] }
  return (
    <ConceptPage
      group={found.group}
      concept={concept}
      visual={conceptVisuals[found.concept.id]}
      done={props.done}
      onToggle={props.onToggle}
      position={props.position}
      onPrev={props.onPrev}
      onNext={props.onNext}
      nextTitle={props.nextTitle}
      onOpen={props.onOpen}
    />
  )
}
