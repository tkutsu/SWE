import type { Chance } from './curriculum'

/**
 * Likelihood is not quality, so it does not reuse the diagram tone palette.
 * It reads as heat: bright means spend time here, dim means know it exists.
 */
export const CHANCE_DOT: Record<Chance, string> = {
  high: 'bg-emerald-400',
  medium: 'bg-amber-400',
  low: 'bg-slate-500',
  rare: 'bg-slate-700',
}

export const CHANCE_CHIP: Record<Chance, string> = {
  high: 'border-emerald-700/70 bg-emerald-950/40 text-emerald-300',
  medium: 'border-amber-500/40 bg-amber-400/10 text-amber-300',
  low: 'border-slate-700 bg-slate-800/60 text-slate-400',
  rare: 'border-slate-800 bg-slate-900/60 text-slate-500',
}
