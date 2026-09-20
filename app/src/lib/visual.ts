/**
 * Static diagrams for concept pages. Concepts have no algorithm to step
 * through, so instead of frames they get one diagram in whichever shape
 * actually fits the idea: a comparison, a timeline, a layering, a flow.
 */

/**
 * Colour carries judgement, never decoration. If a list is purely definitional,
 * every item is `neutral` and the colour says nothing, which is correct.
 *
 *   good     the recommended default, what to reach for
 *   accent   correct but situational, or the one with the catch
 *   bad      the trap, the failure mode, what not to do
 *   neutral  plain information, or two options with no winner
 *   muted    superseded, legacy, deliberately de-emphasised
 *
 * A list where every item shares one non-neutral tone means the colour is
 * carrying no information. The smoke test fails on that.
 */
export type Tone = 'neutral' | 'good' | 'bad' | 'accent' | 'muted'

export type Visual =
  /** Side by side. The right shape for every "X vs Y" question, and there are many. */
  | { kind: 'compare'; columns: { title: string; sub?: string; tone?: Tone; rows: string[] }[]; caption?: string }
  /** Events along time, in lanes. For anything where ordering is the point. */
  | {
      kind: 'timeline'
      span: number
      lanes: { label: string; events: { at: number; label: string; tone?: Tone; width?: number }[] }[]
      caption?: string
    }
  /** Layers, top to bottom. `pyramid` narrows each layer for proportion. */
  | { kind: 'stack'; shape?: 'stack' | 'pyramid'; layers: { label: string; detail?: string; tone?: Tone }[]; caption?: string }
  /** Boxes and arrows on a small grid. Positions are given, never guessed. */
  | {
      kind: 'flow'
      nodes: { id: string; label: string; sub?: string; x: number; y: number; tone?: Tone }[]
      edges: { from: string; to: string; label?: string; tone?: Tone; dashed?: boolean }[]
      caption?: string
    }
  /** Two overlapping sets, one small diagram per variant. Exactly what a SQL join is. */
  | {
      kind: 'venn'
      left: string
      right: string
      variants: { label: string; leftOnly?: boolean; both?: boolean; rightOnly?: boolean }[]
      caption?: string
    }
  /** Three corners, pick two. CAP, and the project management joke. */
  | { kind: 'triangle'; vertices: [string, string, string]; subs?: [string, string, string]; pick?: [number, number]; caption?: string }
  /** A small matrix. Status code classes, access modifiers, type widening. */
  | { kind: 'table'; head: string[]; rows: (string | { text: string; tone?: Tone })[][]; caption?: string }
  /** A set of labelled chips. Acronyms whose members are the content. */
  | { kind: 'boxes'; items: { label: string; detail?: string; tone?: Tone }[]; columns?: 1 | 2 | 3 | 4; caption?: string }

export const TONE_BOX: Record<Tone, string> = {
  neutral: 'border-slate-700 bg-slate-800/70 text-slate-200',
  good: 'border-emerald-700/70 bg-emerald-950/40 text-emerald-100',
  bad: 'border-rose-800/70 bg-rose-950/30 text-rose-100',
  accent: 'border-amber-500/40 bg-amber-400/10 text-amber-100',
  muted: 'border-slate-800 bg-slate-900/60 text-slate-500',
}

export const TONE_HEAD: Record<Tone, string> = {
  neutral: 'text-slate-400',
  good: 'text-emerald-400',
  bad: 'text-rose-400',
  accent: 'text-amber-400',
  muted: 'text-slate-600',
}

export const TONE_SVG: Record<Tone, { fill: string; stroke: string; text: string }> = {
  neutral: { fill: '#1e293b', stroke: '#475569', text: '#e2e8f0' },
  good: { fill: '#064e3b', stroke: '#10b981', text: '#d1fae5' },
  bad: { fill: '#4c0519', stroke: '#f43f5e', text: '#ffe4e6' },
  accent: { fill: '#451a03', stroke: '#f59e0b', text: '#fef3c7' },
  muted: { fill: '#0f172a', stroke: '#1e293b', text: '#64748b' },
}

/** Every tone a diagram actually uses. Drives the key, and the smoke check. */
export function tonesUsed(v: Visual): Set<Tone> {
  const out = new Set<Tone>()
  const add = (t?: Tone) => out.add(t ?? 'neutral')
  switch (v.kind) {
    case 'compare':
      v.columns.forEach((c) => add(c.tone))
      break
    case 'timeline':
      v.lanes.forEach((l) => l.events.forEach((e) => add(e.tone)))
      break
    case 'stack':
      v.layers.forEach((l) => add(l.tone))
      break
    case 'flow':
      v.nodes.forEach((n) => add(n.tone))
      v.edges.forEach((e) => add(e.tone))
      break
    case 'table':
      v.rows.forEach((r) => r.forEach((c) => add(typeof c === 'string' ? 'neutral' : c.tone)))
      break
    case 'boxes':
      v.items.forEach((i) => add(i.tone))
      break
    case 'venn':
    case 'triangle':
      break
  }
  return out
}
