import { useCallback, useEffect, useState } from 'react'

/**
 * Small settings that should survive a reload but are not worth a store.
 * Same shape and same failure handling as useProgress.
 */
function read(key: string, fallback: boolean): boolean {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : raw === 'true'
  } catch {
    return fallback
  }
}

export function useFlag(key: string, fallback = false) {
  const [on, setOn] = useState(() => (typeof window === 'undefined' ? fallback : read(key, fallback)))
  useEffect(() => {
    try {
      localStorage.setItem(key, String(on))
    } catch {
      // Private browsing. The setting just does not persist.
    }
  }, [key, on])
  return [on, useCallback(() => setOn((v) => !v), [])] as const
}

/** Reveal every answer straight away instead of asking you to recall it first. */
export const ALWAYS_SHOW = 'swe.alwaysShowAnswer.v1'
