import type { Algorithm } from '../engine/types'

/**
 * Each algorithm is its own chunk. The sidebar never needs them, it reads
 * names and ranks from lib/roadmap, so nothing here loads until a walkthrough
 * is actually opened.
 */
const loaders: Record<string, () => Promise<Algorithm>> = {
  'two-sum': () => import('./twoSum').then((m) => m.twoSum),
  'two-pointers': () => import('./twoPointers').then((m) => m.twoPointers),
  'sliding-window': () => import('./slidingWindow').then((m) => m.slidingWindow),
  'binary-search': () => import('./binarySearch').then((m) => m.binarySearch),
  'bfs-grid': () => import('./bfsGrid').then((m) => m.bfsGrid),
  'backtracking-subsets': () => import('./backtracking').then((m) => m.backtracking),
  'inorder-traversal': () => import('./treeTraversal').then((m) => m.treeTraversal),
  'min-heap': () => import('./heap').then((m) => m.heap),
  'coin-change': () => import('./coinChange').then((m) => m.coinChange),
  'edit-distance': () => import('./editDistance').then((m) => m.editDistance),
  'merge-sort': () => import('./mergeSort').then((m) => m.mergeSort),
  'merge-intervals': () => import('./intervals').then((m) => m.intervals),
  'monotonic-stack': () => import('./monotonicStack').then((m) => m.monotonicStack),
  'reverse-linked-list': () => import('./linkedList').then((m) => m.linkedList),
  'topological-sort': () => import('./topoSort').then((m) => m.topoSort),
  'union-find': () => import('./unionFind').then((m) => m.unionFind),
  'trie': () => import('./trie').then((m) => m.trie),
  'dijkstra': () => import('./dijkstra').then((m) => m.dijkstra),
  'bit-manipulation': () => import('./bits').then((m) => m.bitManipulation),
  'prefix-sums': () => import('./prefixSums').then((m) => m.prefixSums),
  'quickselect': () => import('./quickselect').then((m) => m.quickselect),
  'matrix-rotate': () => import('./matrixRotate').then((m) => m.matrixRotate),
  'cyclic-sort': () => import('./cyclicSort').then((m) => m.cyclicSort),
  'bst-delete': () => import('./bstDelete').then((m) => m.bstDelete),
  'reservoir-sampling': () => import('./reservoir').then((m) => m.reservoir),
  'lru-cache': () => import('./lruCache').then((m) => m.lruCache),
  'count-inversions': () => import('./countInversions').then((m) => m.countInversions),
  'jump-game': () => import('./jumpGame').then((m) => m.jumpGame),
  'sieve': () => import('./sieve').then((m) => m.sieve),
  'group-anagrams': () => import('./groupAnagrams').then((m) => m.groupAnagrams),
  'quick-sort': () => import('./quickSort').then((m) => m.quickSort),
  'insertion-sort': () => import('./insertionSort').then((m) => m.insertionSort),
  'selection-sort': () => import('./selectionSort').then((m) => m.selectionSort),
  'bubble-sort': () => import('./bubbleSort').then((m) => m.bubbleSort),
  'heap-sort': () => import('./heapSort').then((m) => m.heapSort),
  'counting-sort': () => import('./countingSort').then((m) => m.countingSort),
  'radix-sort': () => import('./radixSort').then((m) => m.radixSort),
}

/** Ids in priority order, which is the order the sidebar shows them in. */
export const algorithmIds: string[] = [
  'two-sum',
  'two-pointers',
  'sliding-window',
  'binary-search',
  'bfs-grid',
  'backtracking-subsets',
  'inorder-traversal',
  'min-heap',
  'coin-change',
  'edit-distance',
  'merge-sort',
  'merge-intervals',
  'monotonic-stack',
  'reverse-linked-list',
  'topological-sort',
  'union-find',
  'trie',
  'dijkstra',
  'bit-manipulation',
  'prefix-sums',
  'quickselect',
  'matrix-rotate',
  'cyclic-sort',
  'bst-delete',
  'reservoir-sampling',
  'lru-cache',
  'count-inversions',
  'jump-game',
  'sieve',
  'group-anagrams',
  'quick-sort',
  'insertion-sort',
  'selection-sort',
  'bubble-sort',
  'heap-sort',
  'counting-sort',
  'radix-sort',
]

export const hasAlgorithm = (id: string): boolean => id in loaders

const cache = new Map<string, Algorithm>()

/** Resolves once, then serves from memory so stepping back to a page is instant. */
export async function loadAlgorithm(id: string): Promise<Algorithm | undefined> {
  const cached = cache.get(id)
  if (cached) return cached
  const loader = loaders[id]
  if (!loader) return undefined
  const algo = await loader()
  cache.set(id, algo)
  return algo
}

/** Every algorithm at once. Only the smoke test wants this. */
export async function loadAllAlgorithms(): Promise<Algorithm[]> {
  return Promise.all(algorithmIds.map((id) => loadAlgorithm(id) as Promise<Algorithm>))
}
