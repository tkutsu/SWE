export type Selection =
  | { kind: 'algo'; id: string }
  | { kind: 'concept'; id: string }
  | { kind: 'guide'; id: string }

/** Namespaced so two kinds of item can never share a checkbox. */
export const checkKey = (sel: Selection) => `${sel.kind}:${sel.id}`
export const same = (a: Selection, b: Selection) => a.kind === b.kind && a.id === b.id
