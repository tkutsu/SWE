import { useCallback, useEffect, useState } from 'react'
import type { Item } from './curriculum'
import { firstUndone, keyOf, tracks } from './journey'
import { minutes } from './minutes'

const KEY = 'swe.session.v1'

/**
 * A sitting, which is three items rather than 205.
 *
 * One from each of the first three tracks with anything left in it, so a
 * sitting is an algorithm and two concepts instead of 53 algorithms. The list
 * is derived from progress rather than stored, so ticking something off moves
 * it along on its own.
 */
export function suggestSession(isDone: (key: string) => boolean): Item[] {
  const out: Item[] = []
  for (const arc of tracks) {
    const next = firstUndone(arc.items, isDone)
    if (next) out.push(next)
    if (out.length === 3) break
  }
  return out
}

export const sessionMinutes = (items: Item[]) => items.reduce((n, i) => n + (minutes[keyOf(i)] ?? 0), 0)

function read(): string[] {
  try {
    const raw = localStorage.getItem(KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : null
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

/**
 * Once started, Next follows the sitting rather than the reading order, so the
 * three items behave as one thing. Kept in localStorage so a reload mid-sitting
 * does not lose it.
 */
export function useSession() {
  const [session, setSession] = useState<string[]>(() => (typeof window === 'undefined' ? [] : read()))

  useEffect(() => {
    try {
      if (session.length) localStorage.setItem(KEY, JSON.stringify(session))
      else localStorage.removeItem(KEY)
    } catch {
      // Private browsing. The sitting just does not survive a reload.
    }
  }, [session])

  const start = useCallback((keys: string[]) => setSession(keys), [])
  const clear = useCallback(() => setSession([]), [])

  /** The next item in the sitting, or undefined if this is not part of one. */
  const nextIn = useCallback(
    (key: string) => {
      const at = session.indexOf(key)
      return at >= 0 && at < session.length - 1 ? session[at + 1] : undefined
    },
    [session],
  )

  return { session, start, clear, nextIn }
}
