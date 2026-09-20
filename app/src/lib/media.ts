import { useEffect, useState } from 'react'

/**
 * Drawings that read fine in four columns on a laptop come out at about 6px on
 * a phone. Scaling the whole thing down was the previous fix and it is what
 * made the text unreadable, so the layout has to know how much room it has and
 * choose a different arrangement rather than a smaller version of the same one.
 */
export function useNarrow(query = '(max-width: 640px)') {
  const [narrow, setNarrow] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  )

  useEffect(() => {
    const mq = window.matchMedia(query)
    const sync = () => setNarrow(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [query])

  return narrow
}
