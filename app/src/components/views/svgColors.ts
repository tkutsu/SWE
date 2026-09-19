import type { Role } from '../../engine/types'

/** SVG needs real colour values, so the role palette is mirrored here once. */
export const FILL: Record<Role, string> = {
  idle: '#1e293b',
  active: '#fbbf24',
  compare: '#0ea5e9',
  match: '#10b981',
  window: '#4338ca',
  excluded: '#0f172a',
  visited: '#10b981',
  frontier: '#0284c7',
  path: '#10b981',
  wall: '#020617',
}

export const TEXT: Record<Role, string> = {
  idle: '#e2e8f0',
  active: '#0f172a',
  compare: '#ffffff',
  match: '#ffffff',
  window: '#e0e7ff',
  excluded: '#475569',
  visited: '#ffffff',
  frontier: '#ffffff',
  path: '#ffffff',
  wall: '#334155',
}

export const STROKE: Record<Role, string> = {
  idle: '#475569',
  active: '#fbbf24',
  compare: '#0ea5e9',
  match: '#10b981',
  window: '#6366f1',
  excluded: '#1e293b',
  visited: '#10b981',
  frontier: '#0284c7',
  path: '#10b981',
  wall: '#1e293b',
}
