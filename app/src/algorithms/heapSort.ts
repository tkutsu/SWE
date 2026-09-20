import { cells, parseNumbers } from '../engine/frame'
import type { Algorithm, Role, StepGen, TreeNode } from '../engine/types'

const code = `function heapsort(a) {
  for (let i = (a.length >> 1) - 1; i >= 0; i--) {
    sink(a, i, a.length)
  }
  for (let end = a.length - 1; end > 0; end--) {
    swap(a, 0, end)
    sink(a, 0, end)
  }
}

function sink(a, i, size) {
  for (;;) {
    const l = 2 * i + 1
    const r = 2 * i + 2
    let big = i
    if (l < size && a[l] > a[big]) big = l
    if (r < size && a[r] > a[big]) big = r
    if (big === i) return
    swap(a, i, big)
    i = big
  }
}`

function* run(input: Record<string, string | number>): StepGen {
  const a = parseNumbers(input.nums, 'nums')
  if (a.length < 2) throw new Error('Give it at least two numbers.')
  if (a.length > 9) throw new Error('Keep it to 9 values so the tree stays readable.')

  const treeNodes = (size: number, roles: Record<number, Role>): Record<string, TreeNode> => {
    const nodes: Record<string, TreeNode> = {}
    for (let i = 0; i < size; i++) {
      nodes[`h${i}`] = {
        id: `h${i}`,
        value: a[i],
        role: roles[i] ?? 'idle',
        left: 2 * i + 1 < size ? `h${2 * i + 1}` : undefined,
        right: 2 * i + 2 < size ? `h${2 * i + 2}` : undefined,
      }
    }
    return nodes
  }

  const views = (size: number, roles: Record<number, Role> = {}) => {
    const full: Record<number, Role> = { ...roles }
    for (let k = size; k < a.length; k++) full[k] ??= 'match'
    return [
      { kind: 'tree' as const, label: `heap region, first ${size} element${size === 1 ? '' : 's'}`, root: size > 0 ? 'h0' : null, nodes: treeNodes(size, roles) },
      { kind: 'array' as const, label: 'array (green tail is sorted and final)', cells: cells(a, full) },
    ]
  }

  yield {
    line: 2,
    note:
      'Heapsort is selection sort with a better way of finding the maximum. Selection sort scans for it in linear time; a heap hands it over in constant time and repairs itself in log time. The heap lives inside the same array, so this sorts in place with no extra memory at all.',
    views: views(a.length),
    vars: { input: a.join(', ') },
  }

  function* sink(i: number, size: number): StepGen {
    for (;;) {
      const l = 2 * i + 1
      const r = 2 * i + 2
      let big = i
      if (l < size && a[l] > a[big]) big = l
      if (r < size && a[r] > a[big]) big = r

      const roles: Record<number, Role> = { [i]: 'active' }
      if (l < size) roles[l] = 'compare'
      if (r < size) roles[r] = 'compare'

      if (big === i) {
        yield {
          line: [16, 17, 18],
          note:
            l >= size
              ? `Index ${i} has no children inside the heap region, so it is a leaf and sinking stops.`
              : `${a[i]} is already at least as large as its children, so the heap rule holds here and sinking stops.`,
          views: views(size, roles),
          vars: { i, 'a[i]': a[i] },
        }
        return
      }

      yield {
        line: [14, 15, 16, 17],
        note: `${a[i]} at index ${i} is smaller than its larger child ${a[big]} at index ${big}, which breaks the max-heap rule. Swap with the larger child, not just any child, or the other one ends up under a smaller parent.`,
        views: views(size, roles),
        vars: { i, 'a[i]': a[i], 'larger child': a[big], 'at index': big },
      }

      const t = a[i]
      a[i] = a[big]
      a[big] = t
      i = big
    }
  }

  const start = (a.length >> 1) - 1
  yield {
    line: [2, 3],
    note: `First turn the array into a max-heap. Start at index ${start}, the last node that has any children, and sink each node walking backwards to the root. Everything past index ${start} is a leaf and already a valid heap of one. Doing it bottom up like this costs O(n), not O(n log n).`,
    views: views(a.length, { [start]: 'active' }),
    vars: { 'start from index': start, phase: 'build heap' },
  }

  for (let i = start; i >= 0; i--) {
    yield {
      line: 3,
      note: `Sink index ${i}, holding ${a[i]}. Both subtrees below it are already valid heaps, so one sink is enough to fix this whole subtree.`,
      views: views(a.length, { [i]: 'active' }),
      vars: { i, value: a[i], phase: 'build heap' },
    }
    yield* sink(i, a.length)
  }

  yield {
    line: 5,
    note: `The array is now a max-heap: ${a.join(', ')}. It is not sorted, and does not need to be. All that matters is that the largest value sits at index 0.`,
    views: views(a.length, { 0: 'match' }),
    vars: { heap: a.join(', '), max: a[0] },
  }

  for (let end = a.length - 1; end > 0; end--) {
    yield {
      line: 6,
      note: `${a[0]} is the largest value still in the heap, and index ${end} is the last slot of the heap region. Swap them, and ${a[0]} is now in its final sorted position. The heap region shrinks by one.`,
      views: views(end + 1, { 0: 'active', [end]: 'compare' }),
      vars: { 'moving to the end': a[0], 'slot': end },
    }

    const t = a[0]
    a[0] = a[end]
    a[end] = t

    yield {
      line: 7,
      note: `${a[end]} is settled. The value now at the root came from the end of the heap and is almost certainly too small for the root, so sink it back into place across the remaining ${end} element${end === 1 ? '' : 's'}.`,
      views: views(end, { 0: 'active' }),
      vars: { settled: a[end], 'heap size now': end },
    }

    yield* sink(0, end)
  }

  yield {
    line: 9,
    note: `Sorted: ${a.join(', ')}. O(n log n) in the worst case like merge sort, but in place like quicksort, and with no bad-pivot case at all. The reason it is not the default everywhere is cache behaviour: jumping between index i and 2i+1 misses the cache far more than merge sort's linear scans.`,
    views: views(0),
    vars: { sorted: a.join(', ') },
    result: a.join(', '),
  }
}

export const heapSort: Algorithm = {
  id: 'heap-sort',
  name: 'Heapsort',
  blurb: 'Build a max-heap in the array, then repeatedly move the root to the end.',
  realWorld:
    'The Linux kernel sort() is heapsort, chosen because it has no worst case to trip over and needs no extra memory, which matters in kernel space. Introsort in the C++ standard library starts with quicksort and switches to heapsort if the recursion gets too deep, using it as the guaranteed fallback.',
  idea:
    'Selection sort spends linear time finding the maximum on every pass. A heap finds it in constant time and repairs itself in log time, which turns the quadratic algorithm into an n log n one. The heap is built inside the input array itself, so nothing is allocated. Building it bottom up costs only O(n), because most nodes are near the leaves and barely sink at all.',
  useWhen:
    'When you need a worst case guarantee and cannot afford extra memory. Also the natural follow-up when you have already explained heaps: sorting is what falls out of repeatedly extracting the maximum.',
  pitfall:
    'Sinking with the wrong child, which silently breaks the heap invariant. And forgetting that heapsort is not stable, so it is the wrong tool for sorting records by a secondary key.',
  complexity: { time: 'O(n log n) worst case', space: 'O(1)' },
  code,
  inputs: [{ name: 'nums', label: 'nums', kind: 'numbers', value: '5, 2, 8, 1, 9, 3', hint: 'max 9' }],
  run,
}
