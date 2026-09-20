import { useCallback, useEffect, useState } from 'react'

const KEY = 'swe.done.v1'
/** The key used before the project was renamed. Read once, then forgotten. */
const LEGACY_KEY = 'algos-structs.done.v1'

function load(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY_KEY)
    if (!raw) return new Set()
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? new Set(parsed.filter((x): x is string => typeof x === 'string')) : new Set()
  } catch {
    // Private browsing, a corrupt value, or no localStorage at all. Start clean
    // rather than taking the whole app down over a checkbox.
    return new Set()
  }
}

/** Ticked items, kept in localStorage so progress survives a reload. */
export function useProgress() {
  const [done, setDone] = useState<Set<string>>(() => (typeof window === 'undefined' ? new Set() : load()))

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify([...done]))
    } catch {
      // Nothing useful to do if storage is unavailable; the session still works.
    }
  }, [done])

  const toggle = useCallback((id: string) => {
    setDone((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const clear = useCallback(() => setDone(new Set()), [])

  return { done, toggle, clear, isDone: useCallback((id: string) => done.has(id), [done]) }
}
