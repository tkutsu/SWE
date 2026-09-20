import { cells, parseNumbers } from '../engine/frame'
import type { Algorithm, Role, StepGen, TreeNode } from '../engine/types'

const code = `function buildHeap(a) {
  for (let i = (a.length >> 1) - 1; i >= 0; i--) {
    siftDown(a, i)
  }
}

function siftDown(a, i) {
  const n = a.length
  while (true) {
    let small = i
    const l = 2 * i + 1
    const r = 2 * i + 2
    if (l < n && a[l] < a[small]) small = l
    if (r < n && a[r] < a[small]) small = r
    if (small === i) return
    swap(a, i, small)
    i = small
  }
}`

function* run(input: Record<string, string | number>): StepGen {
  const a = parseNumbers(input.nums, 'nums')
  if (a.length < 4 || a.length > 15) throw new Error('Give between 4 and 15 numbers so the tree fits.')
  const n = a.length

  const treeView = (marks: Record<number, Role> = {}) => {
    const nodes: Record<string, TreeNode> = {}
    a.forEach((v, i) => {
      nodes[String(i)] = {
        id: String(i),
        value: v,
        left: 2 * i + 1 < n ? String(2 * i + 1) : undefined,
        right: 2 * i + 2 < n ? String(2 * i + 2) : undefined,
        role: marks[i] ?? 'idle',
      }
    })
    return { kind: 'tree' as const, label: 'the same array, drawn as the tree it already is', root: '0', nodes }
  }

  const arrayView = (marks: Record<number, Role> = {}) => ({
    kind: 'array' as const,
    label: 'the array',
    cells: cells(a, marks),
  })

  const last = (n >> 1) - 1
  const leaves = n - (last + 1)

  yield {
    line: 2,
    note: `An array is already a tree if you agree that the children of index i live at 2i+1 and 2i+2. No pointers, no allocation. Turning it into a heap is the question, and the obvious answer, inserting all n elements one at a time, costs O(n log n). This costs O(n).`,
    views: [arrayView(), treeView()],
    vars: { n, 'first non-leaf': last, leaves },
  }

  yield {
    line: 2,
    note: `Start at the last non-leaf, index ${last}, and walk backwards to the root. The ${leaves} node${leaves === 1 ? '' : 's'} after it are leaves, and a leaf is already a valid heap of one, so they need no work at all. Roughly half the array is skipped before anything happens.`,
    views: [
      arrayView(Object.fromEntries(a.map((_, i) => [i, (i > last ? 'excluded' : 'window') as Role]))),
      treeView(Object.fromEntries(a.map((_, i) => [i, (i > last ? 'excluded' : 'window') as Role]))),
    ],
    vars: { 'start at': last, 'skipped as leaves': leaves },
  }

  let swaps = 0
  for (let start = last; start >= 0; start--) {
    yield {
      line: 3,
      note: `Sift down from index ${start}, which holds ${a[start]}. Everything below it is already a valid heap, because we are working upwards, so this one value is the only thing out of place.`,
      views: [arrayView({ [start]: 'active' }), treeView({ [start]: 'active' })],
      vars: { i: start, value: a[start], swaps },
    }

    let i = start
    for (;;) {
      let small = i
      const l = 2 * i + 1
      const r = 2 * i + 2
      if (l < n && a[l] < a[small]) small = l
      if (r < n && a[r] < a[small]) small = r

      if (small === i) {
        yield {
          line: 16,
          note: `${a[i]} is smaller than both children, so it is where it belongs and this sift is finished.`,
          views: [arrayView({ [i]: 'match' }), treeView({ [i]: 'match' })],
          vars: { i, value: a[i], swaps },
        }
        break
      }

      const marks: Record<number, Role> = { [i]: 'active', [small]: 'compare' }
      yield {
        line: [14, 15],
        note: `${a[i]} is larger than its child ${a[small]}, which breaks the rule that a parent is never larger. Swap them and carry on down, because the value may still be too big for where it has landed.`,
        views: [arrayView(marks), treeView(marks)],
        vars: { parent: a[i], child: a[small], swaps: swaps + 1 },
      }
      ;[a[i], a[small]] = [a[small], a[i]]
      swaps++
      i = small
    }
  }

  yield {
    line: 4,
    note: `Every parent is now smaller than its children, so index 0 holds the minimum. It took ${swaps} swap${swaps === 1 ? '' : 's'}. The reason this is O(n) and not O(n log n) is that most nodes are near the bottom and can barely move: half the array is leaves that move zero levels, a quarter can move one, and only the root can move all log n. That sum converges to about 2n.`,
    views: [arrayView({ 0: 'match' }), treeView({ 0: 'match' })],
    vars: { min: a[0], swaps, n },
    result: `heap built in ${swaps} swaps, minimum ${a[0]}`,
  }
}

export const heapify: Algorithm = {
  id: 'heapify',
  name: 'Build a Heap in O(n)',
  blurb: 'Bottom up, because the nodes that can move furthest are the rarest.',
  realWorld:
    'Heapsort starts with this, and any batch priority queue loaded from a file rather than filled one item at a time uses it. It is the reason a library heap constructed from an existing array is noticeably faster than pushing every element.',
  idea:
    'Inserting n elements one at a time costs O(n log n), because each insert can travel the full height. Building bottom up inverts the cost: start at the last non-leaf and sift down towards the leaves, so by the time you reach any node both of its subtrees are already valid heaps. Half the array is leaves and needs no work, a quarter can move at most one level, and only the root can move all log n.',
  useWhen:
    'You already hold all the elements. If they arrive one at a time there is nothing to build bottom up from, and repeated insertion is the only option. In an interview this is usually the follow-up after you describe a heap: "how would you build one from an array".',
  pitfall:
    'Sifting up instead of down, which produces a correct heap by the expensive route and loses the entire point. Starting at the root rather than the last non-leaf does the same. And the proof matters here: saying it is O(n) without being able to say why, that most nodes are near the bottom and cannot travel, is the part that gets pushed on.',
  complexity: { time: 'O(n)', space: 'O(1)' },
  code,
  inputs: [{ name: 'nums', label: 'nums', kind: 'numbers', value: '9, 4, 7, 1, 8, 2, 6, 3' }],
  run,
}
