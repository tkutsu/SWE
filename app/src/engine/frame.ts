import type { Cell, Frame, Role, View } from './types'

/** Build array cells from raw values, applying roles by index. */
export function cells(
  values: readonly (string | number)[],
  roles: Record<number, Role> = {},
  subs: Record<number, string> = {},
): Cell[] {
  return values.map((value, i) => ({ value, role: roles[i] ?? 'idle', sub: subs[i] }))
}

/** Apply a role to every index in [from, to] inclusive, without clobbering stronger roles. */
export function paint(target: Cell[], from: number, to: number, role: Role): Cell[] {
  const next = target.map((c) => ({ ...c }))
  for (let i = Math.max(0, from); i <= Math.min(next.length - 1, to); i++) {
    if (next[i].role === 'idle' || next[i].role === undefined) next[i].role = role
  }
  return next
}

export function frame(f: Frame): Frame {
  return f
}

export function arrayView(label: string, c: Cell[], markers?: { name: string; index: number }[]): View {
  return { kind: 'array', label, cells: c, markers }
}

/** Parse "1, 2, 3" or "1 2 3" into numbers. Throws with a readable message. */
export function parseNumbers(raw: string | number, field: string): number[] {
  const text = String(raw).trim()
  if (!text) throw new Error(`${field} is empty. Give it a few numbers, like 2, 7, 11, 15.`)
  const parts = text.split(/[\s,]+/).filter(Boolean)
  const nums = parts.map((p) => {
    const n = Number(p)
    if (!Number.isFinite(n)) throw new Error(`"${p}" in ${field} is not a number.`)
    return n
  })
  if (nums.length > 24) throw new Error(`${field} has ${nums.length} values. Keep it under 24 so the steps stay readable.`)
  return nums
}

export function parseInt10(raw: string | number, field: string): number {
  const n = Number(String(raw).trim())
  if (!Number.isFinite(n)) throw new Error(`${field} must be a number.`)
  return n
}
