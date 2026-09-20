/**
 * Every algorithm in this app is a generator that yields Frames.
 * A Frame is one teachable moment: which line is running, what changed,
 * why it changed, and what the data looks like right now.
 */

/** Semantic colour roles. Views map these to Tailwind classes, not the algorithms. */
export type Role =
  | 'idle'
  | 'active' // the cell being looked at this instant
  | 'compare' // participating in the current comparison
  | 'match' // part of the answer
  | 'window' // inside the current sliding window / search range
  | 'excluded' // ruled out, will never be looked at again
  | 'visited'
  | 'frontier' // queued, not processed yet
  | 'path'
  | 'wall'

export type Cell = {
  value: string | number
  role?: Role
  /** Small caption under the cell, e.g. a running sum. */
  sub?: string
}

export type Marker = { name: string; index: number }
export type GridMarker = { name: string; row: number; col: number }

export type TreeNode = {
  id: string
  value: string | number
  left?: string
  right?: string
  role?: Role
}

export type MapEntry = { key: string | number; value: string | number; role?: Role }

export type StackItem = { label: string; role?: Role }

/** A node drawn at an explicit position. Layout is the algorithm's job, not the view's. */
export type GraphNode = { id: string; label: string | number; x: number; y: number; role?: Role; sub?: string }
export type GraphEdge = { from: string; to: string; label?: string | number; role?: Role; directed?: boolean }

/**
 * Linked structures keep a stable left-to-right `order` for display and a
 * separate `next` pointer per node. Reversal then shows as arrows flipping
 * rather than boxes jumping around.
 */
export type LinkedNode = { id: string; label: string | number; next: string | null; role?: Role; sub?: string }

/** A view is one panel of the visualisation. A frame can show several at once. */
export type View =
  | { kind: 'array'; label?: string; cells: Cell[]; markers?: Marker[] }
  | {
      kind: 'grid'
      label?: string
      cells: Cell[][]
      markers?: GridMarker[]
      rowLabels?: (string | number)[]
      colLabels?: (string | number)[]
      corner?: string
    }
  | { kind: 'graph'; label?: string; nodes: GraphNode[]; edges: GraphEdge[] }
  | {
      kind: 'linked'
      label?: string
      order: string[]
      nodes: Record<string, LinkedNode>
      pointers?: { name: string; id: string | null }[]
    }
  | { kind: 'tree'; label?: string; root: string | null; nodes: Record<string, TreeNode> }
  | { kind: 'map'; label?: string; entries: MapEntry[]; empty?: string }
  | { kind: 'stack'; label?: string; items: StackItem[]; orientation?: 'vertical' | 'horizontal' }

export type Frame = {
  /** 1-indexed line(s) of the algorithm's `code` string that are executing. */
  line: number | number[]
  /** Plain language, present tense, explains the *why* not just the what. */
  note: string
  views: View[]
  /** Scalars worth watching, rendered in a side panel. */
  vars?: Record<string, string | number | boolean>
  /** Set on the final frame. */
  result?: string
}

export type StepGen = Generator<Frame, void, void>

export type InputField =
  | { name: string; label: string; kind: 'numbers'; value: string; hint?: string }
  | { name: string; label: string; kind: 'text'; value: string; hint?: string }
  | { name: string; label: string; kind: 'number'; value: number; hint?: string }

export type Complexity = { time: string; space: string }

export type Algorithm = {
  id: string
  name: string
  /** One line: what it is. */
  blurb: string
  /** Where this actually runs outside an interview room. Shown above the walkthrough. */
  realWorld: string
  /** The idea in a paragraph. Markdown-free, read as prose. */
  idea: string
  /** When you should reach for it in an interview. */
  useWhen: string
  /** The thing people get wrong. */
  pitfall: string
  complexity: Complexity
  code: string
  inputs: InputField[]
  /** Throws a readable Error on bad input; the UI shows the message. */
  run: (input: Record<string, string | number>) => StepGen
}
