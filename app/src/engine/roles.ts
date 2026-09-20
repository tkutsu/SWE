import type { Role, View } from './types'

/**
 * Which roles a set of views actually uses.
 *
 * The legend used to print all seven every time, so two-pointers advertised
 * "queued" and "visited", which it never produces. Colour that names something
 * absent is worse than no legend: it sends you looking for it.
 */
export function rolesUsed(views: View[]): Set<Role> {
  const out = new Set<Role>()
  const add = (r?: Role) => {
    if (r) out.add(r)
  }
  for (const view of views) {
    switch (view.kind) {
      case 'array':
        for (const c of view.cells) add(c.role)
        break
      case 'grid':
        for (const row of view.cells) for (const c of row) add(c.role)
        break
      case 'graph':
        for (const n of view.nodes) add(n.role)
        for (const e of view.edges) add(e.role)
        break
      case 'linked':
        for (const n of Object.values(view.nodes)) add(n.role)
        break
      case 'tree':
        for (const n of Object.values(view.nodes)) add(n.role)
        break
      case 'map':
        for (const e of view.entries) add(e.role)
        break
      case 'stack':
        for (const i of view.items) add(i.role)
        break
    }
  }
  return out
}
