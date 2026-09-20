export type Selection =
  | { kind: 'algo'; id: string }
  | { kind: 'concept'; id: string }
  | { kind: 'guide'; id: string }
  /** Single pages. One of each, so none of them carries an id. */
  | { kind: 'home' }
  | { kind: 'router' }
  | { kind: 'board' }

/** Namespaced so two kinds of item can never share a checkbox. */
export const checkKey = (sel: Selection) => ('id' in sel ? `${sel.kind}:${sel.id}` : sel.kind)
/** The key already identifies a selection uniquely, so equality is key equality. */
export const same = (a: Selection, b: Selection) => checkKey(a) === checkKey(b)

const SINGLE = ['home', 'router', 'board'] as const
const WITH_ID = ['algo', 'concept', 'guide'] as const

/**
 * The URL is the selection.
 *
 * A hash rather than a path, because the app is served from a gh-pages
 * subdirectory with no server to rewrite 404s, and because `hashchange` gives
 * back and forward for nothing. Thirty lines, so no router library.
 */
export const toHash = (sel: Selection) => ('id' in sel ? `#/${sel.kind}/${sel.id}` : `#/${sel.kind}`)

export function fromHash(hash: string): Selection | undefined {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  if (parts.length === 1) {
    const one = SINGLE.find((k) => k === parts[0])
    return one ? ({ kind: one } as Selection) : undefined
  }
  if (parts.length === 2) {
    const kind = WITH_ID.find((k) => k === parts[0])
    return kind ? { kind, id: decodeURIComponent(parts[1]) } : undefined
  }
  return undefined
}

const LAST = 'swe.last.v1'

/** Where you were, so a reload resumes instead of starting over. */
export function rememberLast(sel: Selection) {
  try {
    localStorage.setItem(LAST, toHash(sel))
  } catch {
    // Private browsing. Losing the resume point is not worth an error boundary.
  }
}

export function recallLast(): Selection | undefined {
  try {
    const raw = localStorage.getItem(LAST)
    return raw ? fromHash(raw) : undefined
  } catch {
    return undefined
  }
}
