import type { Role } from '../../engine/types'

/** One place decides what every semantic role looks like. */
export const ROLE_CLASS: Record<Role, string> = {
  idle: 'bg-slate-800 border-slate-700 text-slate-200',
  active: 'bg-amber-400 border-amber-300 text-slate-900 font-semibold',
  compare: 'bg-sky-500/80 border-sky-400 text-white',
  match: 'bg-emerald-500 border-emerald-400 text-white font-semibold',
  window: 'bg-slate-700 border-indigo-500/60 text-slate-100',
  excluded: 'bg-slate-900 border-slate-800 text-slate-600 line-through',
  visited: 'bg-indigo-900/70 border-indigo-700 text-indigo-200',
  frontier: 'bg-sky-600/60 border-sky-400 text-white',
  path: 'bg-emerald-500 border-emerald-300 text-white font-semibold',
  wall: 'bg-slate-950 border-slate-800 text-slate-700',
}

export const LEGEND: { role: Role; label: string }[] = [
  { role: 'active', label: 'looking at now' },
  { role: 'compare', label: 'being compared' },
  { role: 'window', label: 'in range / window' },
  { role: 'frontier', label: 'queued' },
  { role: 'visited', label: 'visited' },
  { role: 'excluded', label: 'ruled out' },
  { role: 'match', label: 'answer' },
]
