/** The ranked priority list. `algoId` is set once a walkthrough exists. */
export type RoadmapItem = {
  rank: number
  name: string
  tier: 1 | 2 | 3 | 4
  algoId?: string
  /** For a second walkthrough of an item already on the list: the rank it deepens. */
  deepens?: number
}

export const TIER_LABEL: Record<1 | 2 | 3 | 4, string> = {
  1: 'Tier 1 - these will show up',
  2: 'Tier 2 - common, where levels separate',
  3: 'Tier 3 - know them, expect them less',
  4: 'Tier 4',
}

export const roadmap: RoadmapItem[] = [
  { rank: 1, name: 'Hash maps and sets', tier: 1, algoId: 'two-sum' },
  { rank: 2, name: 'Two pointers', tier: 1, algoId: 'two-pointers' },
  { rank: 3, name: 'Sliding window', tier: 1, algoId: 'sliding-window' },
  { rank: 4, name: 'Binary search', tier: 1, algoId: 'binary-search' },
  { rank: 5, name: 'BFS on graphs and grids', tier: 1, algoId: 'bfs-grid' },
  { rank: 6, name: 'DFS, recursion, backtracking', tier: 1, algoId: 'backtracking-subsets' },
  { rank: 7, name: 'Binary trees', tier: 1, algoId: 'inorder-traversal' },
  { rank: 8, name: 'Heaps and priority queues', tier: 1, algoId: 'min-heap' },
  { rank: 9, name: 'DP 1D', tier: 2 , algoId: 'coin-change' },
  { rank: 10, name: 'DP 2D, grid and string', tier: 2 , algoId: 'edit-distance' },
  { rank: 11, name: 'Merge sort', tier: 2 , algoId: 'merge-sort' },
  { rank: 12, name: 'Intervals', tier: 2 , algoId: 'merge-intervals' },
  { rank: 13, name: 'Stacks and monotonic stack', tier: 2 , algoId: 'monotonic-stack' },
  { rank: 14, name: 'Linked lists', tier: 2 , algoId: 'reverse-linked-list' },
  { rank: 15, name: 'Graphs and topological sort', tier: 2 , algoId: 'topological-sort' },
  { rank: 16, name: 'Union-Find', tier: 3 , algoId: 'union-find' },
  { rank: 17, name: 'Tries', tier: 3 , algoId: 'trie' },
  { rank: 18, name: 'Dijkstra', tier: 3 , algoId: 'dijkstra' },
  { rank: 19, name: 'Bit manipulation', tier: 3 , algoId: 'bit-manipulation' },
  { rank: 20, name: 'Prefix sums', tier: 3 , algoId: 'prefix-sums' },
  { rank: 21, name: 'Quickselect', tier: 4 , algoId: 'quickselect' },
  { rank: 22, name: 'Matrix manipulation', tier: 4 , algoId: 'matrix-rotate' },
  { rank: 23, name: 'Cyclic sort', tier: 4 , algoId: 'cyclic-sort' },
  { rank: 24, name: 'BST operations', tier: 4 , algoId: 'bst-delete' },
  { rank: 25, name: 'Reservoir sampling', tier: 4 , algoId: 'reservoir-sampling' },
  { rank: 26, name: 'Design problems (LRU, min stack)', tier: 4 , algoId: 'lru-cache' },
  { rank: 27, name: 'Divide and conquer', tier: 4 , algoId: 'count-inversions' },
  { rank: 28, name: 'Greedy with exchange argument', tier: 4 , algoId: 'jump-game' },
  { rank: 29, name: 'Math basics', tier: 4 , algoId: 'sieve' },
  { rank: 30, name: 'String problems', tier: 4 , algoId: 'group-anagrams' },
]

/** The other sorts. Not on the priority list, but they get asked and compared. */
export const sortingExtras: RoadmapItem[] = [
  { rank: 101, name: 'Quicksort', tier: 2, algoId: 'quick-sort' },
  { rank: 102, name: 'Insertion sort', tier: 2, algoId: 'insertion-sort' },
  { rank: 103, name: 'Selection sort', tier: 2, algoId: 'selection-sort' },
  { rank: 104, name: 'Bubble sort', tier: 2, algoId: 'bubble-sort' },
  { rank: 105, name: 'Heapsort', tier: 2, algoId: 'heap-sort' },
  { rank: 106, name: 'Counting sort', tier: 2, algoId: 'counting-sort' },
  { rank: 107, name: 'Radix sort', tier: 2, algoId: 'radix-sort' },
  { rank: 108, name: 'Bucket sort', tier: 2, algoId: 'bucket-sort' },
]

/**
 * Second walkthroughs. Each one takes an item already on the ranked list and
 * shows the variant that the first pass could only describe in prose, which is
 * usually the variant people actually get wrong.
 */
export const deeperCuts: RoadmapItem[] = [
  { rank: 201, name: 'Binary search on the answer', tier: 2, algoId: 'binary-search-answer', deepens: 4 },
  { rank: 205, name: 'Recursion and the call stack', tier: 1, algoId: 'recursion', deepens: 6 },
  { rank: 202, name: "Kruskal's MST", tier: 3, algoId: 'kruskal', deepens: 16 },
  { rank: 204, name: 'Counting set bits', tier: 3, algoId: 'count-bits', deepens: 19 },
  { rank: 203, name: 'Min stack', tier: 4, algoId: 'min-stack', deepens: 26 },
  { rank: 208, name: 'Iterative DFS', tier: 1, algoId: 'iterative-dfs', deepens: 6 },
  { rank: 207, name: "Kadane's algorithm", tier: 2, algoId: 'kadane', deepens: 9 },
  { rank: 206, name: '0-1 knapsack', tier: 2, algoId: 'knapsack-01', deepens: 10 },
  { rank: 210, name: "Prim's MST", tier: 3, algoId: 'prim', deepens: 18 },
  { rank: 211, name: 'Segment tree', tier: 4, algoId: 'segment-tree', deepens: 20 },
  { rank: 209, name: 'KMP string matching', tier: 4, algoId: 'kmp', deepens: 30 },
  { rank: 212, name: 'Build a heap in O(n)', tier: 1, algoId: 'heapify', deepens: 8 },
  { rank: 213, name: 'Fast and slow pointers', tier: 2, algoId: 'fast-slow-pointers', deepens: 14 },
]

/** Everything with a checkbox, in sidebar order. Drives the progress counter. */
export const allRoadmapItems: RoadmapItem[] = [...roadmap, ...sortingExtras, ...deeperCuts]
