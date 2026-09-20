import { guideGroups } from '../lib/guides'
import { GuidePage } from './GuidePage'

/** Owns the guide data, so the shell does not. */
export function GuideLoader(props: {
  id: string
  done: boolean
  onToggle: () => void
  onPrev?: () => void
  onNext?: () => void
  position: string
  nextTitle?: string
}) {
  for (const group of guideGroups) {
    const guide = group.guides.find((g) => g.id === props.id)
    if (guide) {
      return (
        <GuidePage
          // Same reason as ConceptLoader: otherwise the set of open sections
          // carries from one guide to the next.
          key={guide.id}
          group={group}
          guide={guide}
          done={props.done}
          onToggle={props.onToggle}
          onPrev={props.onPrev}
          onNext={props.onNext}
          position={props.position}
          nextTitle={props.nextTitle}
        />
      )
    }
  }
  return <p className="text-sm text-slate-400">That guide no longer exists.</p>
}
