import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Algorithm, Frame } from './types'

const MAX_FRAMES = 4000

type PlayerState = {
  frames: Frame[]
  index: number
  playing: boolean
  speed: number
  error: string | null
}

/**
 * Runs the generator to completion up front, then scrubs through the frames.
 * Eager evaluation keeps the scrubber honest: you can seek backwards and the
 * total step count is known, which matters more here than lazy streaming.
 */
export function usePlayer(algo: Algorithm, input: Record<string, string | number>) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)

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

  // Reset to the start whenever the trace itself changes.
  useEffect(() => {
    setIndex(0)
    setPlaying(false)
  }, [frames])

  // The reset effect above lands one render late, so on the render where a new
  // trace first appears `index` can still point past its end. Clamp here, or that
  // render reads an undefined frame and throws.
  const safe = Math.min(index, Math.max(0, frames.length - 1))
  const atEnd = safe >= frames.length - 1

  const next = useCallback(() => setIndex((i) => Math.min(i + 1, frames.length - 1)), [frames.length])
  const prev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), [])
  const reset = useCallback(() => {
    setIndex(0)
    setPlaying(false)
  }, [])
  const toggle = useCallback(() => {
    if (atEnd) {
      setIndex(0)
      setPlaying(true)
    } else {
      setPlaying((p) => !p)
    }
  }, [atEnd])

  const playingRef = useRef(playing)
  playingRef.current = playing

  useEffect(() => {
    if (!playing) return
    if (atEnd) {
      setPlaying(false)
      return
    }
    const id = window.setTimeout(() => setIndex((i) => Math.min(i + 1, frames.length - 1)), 900 / speed)
    return () => window.clearTimeout(id)
  }, [playing, safe, speed, atEnd, frames.length])

  const state: PlayerState = { frames, index: safe, playing, speed, error }
  return {
    ...state,
    current: frames[safe],
    atEnd,
    next,
    prev,
    reset,
    toggle,
    seek: setIndex,
    setSpeed,
  }
}
