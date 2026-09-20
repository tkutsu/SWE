import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Algorithm, Frame } from './types'

const MAX_FRAMES = 4000

/**
 * Runs the generator to completion up front, then steps through the frames.
 * Eager evaluation is what makes stepping backwards free and the total step
 * count known, which matters more here than streaming lazily would.
 */
export function usePlayer(algo: Algorithm, input: Record<string, string | number>) {
  const [index, setIndex] = useState(0)

  const { frames, error } = useMemo(() => {
    try {
      const out: Frame[] = []
      for (const f of algo.run(input)) {
        out.push(f)
        if (out.length >= MAX_FRAMES) break
      }
      if (out.length === 0) {
        return { frames: [] as Frame[], error: 'That input produced no steps.' }
      }
      return { frames: out, error: null as string | null }
    } catch (e) {
      return { frames: [] as Frame[], error: e instanceof Error ? e.message : String(e) }
    }
  }, [algo, input])

  // Back to the start whenever the trace itself changes.
  useEffect(() => {
    setIndex(0)
  }, [frames])

  // The effect above lands one render late, so on the render where a new trace
  // first appears `index` can still point past its end. Clamp here, or that
  // render reads an undefined frame and throws.
  const safe = Math.min(index, Math.max(0, frames.length - 1))
  const atEnd = safe >= frames.length - 1

  const next = useCallback(() => setIndex((i) => Math.min(i + 1, frames.length - 1)), [frames.length])
  const prev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), [])

  return { frames, index: safe, error, current: frames[safe], atEnd, next, prev }
}
