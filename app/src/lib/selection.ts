export type Selection =
  | { kind: 'algo'; id: string }
  | { kind: 'concept'; id: string }
  | { kind: 'guide'; id: string }
  /** Reference pages. One of each, so neither carries an id. */
  | { kind: 'router' }
  | { kind: 'board' }

/** Namespaced so two kinds of item can never share a checkbox. */
export const checkKey = (sel: Selection) => ('id' in sel ? `${sel.kind}:${sel.id}` : sel.kind)
/** The key already identifies a selection uniquely, so equality is key equality. */
export const same = (a: Selection, b: Selection) => checkKey(a) === checkKey(b)
