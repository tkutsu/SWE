import type { View } from '../engine/types'
import { ArrayView } from './views/ArrayView'
import { GraphView } from './views/GraphView'
import { GridView } from './views/GridView'
import { LinkedView } from './views/LinkedView'
import { MapView } from './views/MapView'
import { StackView } from './views/StackView'
import { TreeView } from './views/TreeView'
import { LEGEND, ROLE_CLASS } from './views/roles'

function One({ view }: { view: View }) {
  switch (view.kind) {
    case 'array':
      return <ArrayView cells={view.cells} markers={view.markers} label={view.label} />
    case 'grid':
      return (
        <GridView
          cells={view.cells}
          label={view.label}
          rowLabels={view.rowLabels}
          colLabels={view.colLabels}
          corner={view.corner}
          markers={view.markers}
        />
      )
    case 'map':
      return <MapView entries={view.entries} label={view.label} empty={view.empty} />
    case 'stack':
      return <StackView items={view.items} label={view.label} orientation={view.orientation} />
    case 'tree':
      return <TreeView root={view.root} nodes={view.nodes} label={view.label} />
    case 'graph':
      return <GraphView nodes={view.nodes} edges={view.edges} label={view.label} />
    case 'linked':
      return <LinkedView order={view.order} nodes={view.nodes} pointers={view.pointers} label={view.label} />
  }
}

export function Visualizer({ views }: { views: View[] }) {
  return (
    <div className="flex min-w-0 flex-col gap-5 sm:gap-6">
      <div className="flex min-w-0 flex-col gap-5 sm:gap-6">
        {views.map((view, i) => (
          <One key={i} view={view} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 border-t border-slate-800 pt-3">
        {LEGEND.map((l) => (
          <div key={l.role} className="flex items-center gap-1.5">
            <span className={`inline-block h-3 w-3 rounded-sm border ${ROLE_CLASS[l.role]}`} />
            <span className="text-[11px] text-slate-500">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
