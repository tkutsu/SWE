/** The priority list from list.md. `algoId` is set once a walkthrough exists. */
export type RoadmapItem = { rank: number; name: string; tier: 1 | 2 | 3 | 4; algoId?: string }

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
  { rank: 9, name: 'DP 1D', tier: 2 },
  { rank: 10, name: 'DP 2D, grid and string', tier: 2 },
  { rank: 11, name: 'Sorting', tier: 2 },
  { rank: 12, name: 'Intervals', tier: 2 },
  { rank: 13, name: 'Stacks and monotonic stack', tier: 2 },
  { rank: 14, name: 'Linked lists', tier: 2 },
  { rank: 15, name: 'Graphs and topological sort', tier: 2 },
  { rank: 16, name: 'Union-Find', tier: 3 },
  { rank: 17, name: 'Tries', tier: 3 },
  { rank: 18, name: 'Dijkstra', tier: 3 },
  { rank: 19, name: 'Bit manipulation', tier: 3 },
  { rank: 20, name: 'Prefix sums', tier: 3 },
  { rank: 21, name: 'Quickselect', tier: 4 },
  { rank: 22, name: 'Matrix manipulation', tier: 4 },
  { rank: 23, name: 'Cyclic sort', tier: 4 },
  { rank: 24, name: 'BST operations', tier: 4 },
  { rank: 25, name: 'Reservoir sampling', tier: 4 },
  { rank: 26, name: 'Design problems (LRU, min stack)', tier: 4 },
  { rank: 27, name: 'Divide and conquer', tier: 4 },
  { rank: 28, name: 'Greedy with exchange argument', tier: 4 },
  { rank: 29, name: 'Math basics', tier: 4 },
  { rank: 30, name: 'String problems', tier: 4 },
]
