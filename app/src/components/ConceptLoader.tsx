import { findConcept } from '../lib/concepts'
import { conceptVisuals } from '../lib/conceptVisuals'
import { ConceptPage } from './ConceptPage'

/** Owns the concept data and its diagrams, so the shell does not. */
export function ConceptLoader(props: {
  id: string
  done: boolean
  onToggle: () => void
  onPrev?: () => void
  onNext?: () => void
  position: string
}) {
  const found = findConcept(props.id)
  if (!found) return <p className="text-sm text-slate-400">That concept no longer exists.</p>
  return (
    <ConceptPage
      group={found.group}
      concept={found.concept}
      visual={conceptVisuals[found.concept.id]}
      done={props.done}
      onToggle={props.onToggle}
      position={props.position}
      onPrev={props.onPrev}
      onNext={props.onNext}
    />
  )
}
