import { parseInt10, parseNumbers } from '../engine/frame'
import type { Algorithm, Cell, Role, StepGen, TreeNode } from '../engine/types'

const code = `function push(heap, v) {
  heap.push(v)
  let i = heap.length - 1
  while (i > 0) {
    const p = (i - 1) >> 1
    if (heap[p] <= heap[i]) break
    swap(heap, p, i)
    i = p
  }
}

function pop(heap) {
  const min = heap[0]
  heap[0] = heap[heap.length - 1]
  heap.pop()
  let i = 0
  for (;;) {
    const l = 2 * i + 1
    const r = 2 * i + 2
    let small = i
    if (l < heap.length && heap[l] < heap[small]) small = l
    if (r < heap.length && heap[r] < heap[small]) small = r
    if (small === i) break
    swap(heap, i, small)
    i = small
  }
  return min
}`

function* run(input: Record<string, string | number>): StepGen {
  const values = parseNumbers(input.values, 'values')
  if (values.length > 12) throw new Error(`${values.length} values makes the tree too wide. Keep it to 12.`)
  if (values.length === 0) throw new Error('Give it a few numbers, like 5, 3, 8, 1.')
  const extract = parseInt10(input.extract, 'extract')
  if (extract < 0 || extract > values.length) {
    throw new Error(`Cannot extract ${extract} values from a heap of ${values.length}.`)
  }

  const heap: number[] = []
  const popped: number[] = []

  const treeNodes = (roles: Record<number, Role>): Record<string, TreeNode> => {
    const nodes: Record<string, TreeNode> = {}
    heap.forEach((v, i) => {
      const left = 2 * i + 1
      const right = 2 * i + 2
      nodes[`h${i}`] = {
        id: `h${i}`,
        value: v,
        role: roles[i] ?? 'idle',
        left: left < heap.length ? `h${left}` : undefined,
        right: right < heap.length ? `h${right}` : undefined,
      }
    })
    return nodes
  }

  const arrayCells = (roles: Record<number, Role>): Cell[] =>
    heap.map((v, i) => ({ value: v, role: roles[i] ?? 'idle', sub: String(i) }))

  const views = (roles: Record<number, Role> = {}) => [
    { kind: 'tree' as const, label: 'the same heap, drawn as a tree', root: heap.length ? 'h0' : null, nodes: treeNodes(roles) },
    { kind: 'array' as const, label: 'the heap, as it is actually stored', cells: arrayCells(roles) },
    {
      kind: 'stack' as const,
      label: `extracted (${popped.length})`,
      items: popped.map((v) => ({ label: String(v), role: 'match' as Role })),
      orientation: 'horizontal' as const,
    },
  ]

  const swap = (a: number, b: number) => {
    const t = heap[a]
    heap[a] = heap[b]
    heap[b] = t
  }

  yield {
    line: 1,
    note:
      'A heap is an array. The tree is a way of reading it: the children of index i live at 2i+1 and 2i+2. There are no pointers and no allocation. The only rule is that every parent is smaller than both its children, which makes the minimum sit at index 0 where you can read it in O(1).',
    views: views(),
    vars: { size: 0, 'to insert': values.join(', ') },
  }

  for (const v of values) {
    heap.push(v)
    let i = heap.length - 1

    yield {
      line: [2, 3],
      note: `Insert ${v} at the end of the array, index ${i}. That keeps the tree shape correct, but ${v} is almost certainly in the wrong place, so it now has to climb.`,
      views: views({ [i]: 'active' }),
      vars: { inserted: v, at: i, size: heap.length },
    }

    while (i > 0) {
      const p = (i - 1) >> 1
      if (heap[p] <= heap[i]) {
        yield {
          line: [4, 5, 6],
          note: `Parent of index ${i} is index ${p}, holding ${heap[p]}. ${heap[p]} is not greater than ${heap[i]}, so the rule already holds here. Everything above is already ordered, so stop climbing.`,
          views: views({ [i]: 'active', [p]: 'compare' }),
          vars: { i, parent: p, 'heap[p]': heap[p], 'heap[i]': heap[i] },
        }
        break
      }
      yield {
        line: [5, 6, 7],
        note: `Parent index ${p} holds ${heap[p]}, which is bigger than ${heap[i]}. That breaks the heap rule, so swap them. ${heap[i]} moves up one level.`,
        views: views({ [i]: 'active', [p]: 'compare' }),
        vars: { i, parent: p, 'heap[p]': heap[p], 'heap[i]': heap[i] },
      }
      swap(p, i)
      i = p
      yield {
        line: 8,
        note: `Now at index ${i}. Keep climbing until the parent is smaller or the root is reached. A value can climb at most log n levels, which is why insert is O(log n) and not O(n).`,
        views: views({ [i]: 'active' }),
        vars: { i, size: heap.length, root: heap[0] },
      }
    }

    yield {
      line: 10,
      note: `${v} is settled. The array is now ${heap.join(', ')}, and the smallest value ${heap[0]} sits at index 0. Note the array is not sorted, and it does not need to be. A heap is a much weaker ordering than a sort, which is exactly why it is cheaper.`,
      views: views({ 0: 'match' }),
      vars: { size: heap.length, min: heap[0], array: heap.join(', ') },
    }
  }

  for (let k = 0; k < extract; k++) {
    const min = heap[0]

    yield {
      line: [13, 14],
      note: `Extract the minimum, ${min}, from index 0. The hole at the root cannot just be left there, so the last element, ${heap[heap.length - 1]}, is moved into it. That keeps the array contiguous.`,
      views: views({ 0: 'match', [heap.length - 1]: 'active' }),
      vars: { min, 'moving up': heap[heap.length - 1], size: heap.length },
    }

    heap[0] = heap[heap.length - 1]
    heap.pop()
    popped.push(min)

    if (heap.length === 0) {
      yield {
        line: 26,
        note: `${min} extracted and the heap is now empty.`,
        views: views(),
        vars: { extracted: min, size: 0 },
      }
      continue
    }

    let i = 0
    yield {
      line: [15, 16],
      note: `${heap[0]} is at the root now and is probably too big for it. It has to sink until both its children are larger than it.`,
      views: views({ 0: 'active' }),
      vars: { extracted: min, 'now at root': heap[0], size: heap.length },
    }

    for (;;) {
      const l = 2 * i + 1
      const r = 2 * i + 2
      let small = i
      if (l < heap.length && heap[l] < heap[small]) small = l
      if (r < heap.length && heap[r] < heap[small]) small = r

      const roles: Record<number, Role> = { [i]: 'active' }
      if (l < heap.length) roles[l] = 'compare'
      if (r < heap.length) roles[r] = 'compare'

      if (small === i) {
        yield {
          line: [20, 21, 22],
          note:
            l >= heap.length
              ? `Index ${i} has no children, so it is a leaf. Sinking is done.`
              : `${heap[i]} is already smaller than its children, so the rule holds and sinking stops here.`,
          views: views(roles),
          vars: { i, 'heap[i]': heap[i], children: l < heap.length ? heap.slice(l, r + 1).join(', ') : 'none' },
        }
        break
      }

      yield {
        line: [18, 19, 20, 21],
        note: `Children of index ${i} are at ${l}${r < heap.length ? ` and ${r}` : ''}, holding ${heap.slice(l, Math.min(r + 1, heap.length)).join(' and ')}. The smaller one is ${heap[small]} at index ${small}, and it is below ${heap[i]}, so they swap. Swapping with the smaller child, not just any child, is what keeps the rule true for the other one too.`,
        views: views(roles),
        vars: { i, 'heap[i]': heap[i], 'smallest child': heap[small], 'at index': small },
      }
      swap(i, small)
      i = small
      yield {
        line: [23, 24],
        note: `Sunk to index ${i}. Carry on down. Like the climb, this is bounded by the height of the tree, so extract is O(log n).`,
        views: views({ [i]: 'active' }),
        vars: { i, array: heap.join(', ') },
      }
    }

    yield {
      line: 26,
      note: `${min} is out and the heap is valid again, with ${heap[0]} now the smallest. Extracted so far: ${popped.join(', ')}, in increasing order, because each extraction takes the minimum of what is left.`,
      views: views({ 0: 'match' }),
      vars: { extracted: popped.join(', '), 'new min': heap[0], size: heap.length },
    }
  }

  yield {
    line: 26,
    note:
      popped.length > 0
        ? `Done. The extracted values came out sorted: ${popped.join(', ')}. Extract every element and you have heapsort, in O(n log n) with no extra array.`
        : `Heap built. ${heap[0]} is the minimum, readable in O(1) at index 0.`,
    views: views({ 0: 'match' }),
    vars: { heap: heap.join(', '), extracted: popped.join(', ') || 'none' },
    result: popped.length > 0 ? `extracted ${popped.join(', ')}, heap now [${heap.join(', ')}]` : `heap [${heap.join(', ')}], min = ${heap[0]}`,
  }
}

export const heap: Algorithm = {
  id: 'min-heap',
  name: 'Heap / priority queue',
  blurb: 'An array that pretends to be a tree, so the minimum is always at index 0.',
  realWorld:
    'setTimeout is backed by a heap, so the runtime finds the next timer to fire without scanning all of them. Operating system schedulers pick the next process the same way, and so does every trending list.',
  idea:
    'A binary heap keeps one weak invariant: every parent is smaller than its children. That is far less order than a sorted array, so it is much cheaper to maintain, but it is enough to keep the minimum at the root. Insert puts the value at the end and lets it climb. Extract takes the root, moves the last element into the hole, and lets it sink. Both touch at most one node per level, so both are O(log n). The tree is never built: index i has children 2i+1 and 2i+2, and that arithmetic is the entire data structure.',
  useWhen:
    'Top-k, merge k sorted lists, running median with two heaps, scheduling by priority, and Dijkstra. Any time you repeatedly need the smallest or largest of a changing set and a full sort would be wasted work.',
  pitfall:
    'Sinking by swapping with the wrong child. You must swap with the smaller child, otherwise the one you skipped ends up under a larger parent and the invariant quietly breaks. Also assuming the array is sorted, it is not, and reading it in order will mislead you.',
  complexity: { time: 'O(log n) push and pop, O(1) peek', space: 'O(n)' },
  code,
  inputs: [
    { name: 'values', label: 'insert these', kind: 'numbers', value: '5, 3, 8, 1, 9, 2', hint: 'max 12' },
    { name: 'extract', label: 'then extract', kind: 'number', value: 2, hint: 'how many minimums to pull out' },
  ],
  run,
}
