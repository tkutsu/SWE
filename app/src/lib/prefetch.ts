import { loadConcepts, loadGuides } from './content'

type Conn = { saveData?: boolean; effectiveType?: string }

/**
 * Warm the two big content chunks once the page is idle, so the first concept
 * or guide click is instant. Skipped on Save-Data or a slow connection, where
 * spending someone's data on something they may never open is the wrong call.
 */
export function prefetchContent(): void {
  const conn = (navigator as Navigator & { connection?: Conn }).connection
  if (conn?.saveData) return
  if (conn?.effectiveType && /(^|-)2g$/.test(conn.effectiveType)) return

  const run = () => {
    void loadConcepts().catch(() => {})
    void loadGuides().catch(() => {})
  }

  const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number })
    .requestIdleCallback
  if (idle) idle(run, { timeout: 4000 })
  else window.setTimeout(run, 2000)
}
