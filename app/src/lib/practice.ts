/**
 * Where to go once the walkthrough has landed.
 *
 * Every slug here is copied verbatim from the problem lists shipped with the
 * NeetCode courses (`_interview/_md/neetcode/`), which are `.txt` files rather
 * than transcribed video, so the URLs are exact. Nothing has been added from
 * memory: a plausible-looking slug that 404s is worse than a short list.
 *
 * The grouping is not NeetCode's. Theirs is by course section, which puts
 * tries, graphs and calendars in one bucket; these are regrouped by the pattern
 * the problem actually drills, so a list sits under the walkthrough that
 * teaches it.
 *
 * Not every algorithm has problems. Seventeen of them have none in the source,
 * and they render no panel rather than a padded one.
 */
export type Problem = {
  /** The leetcode.com/problems/ slug, verbatim. */
  slug: string
  title: string
  /** Only when the pairing needs justifying, or the problem goes past the walkthrough. */
  note?: string
}

export const problemUrl = (slug: string) => `https://leetcode.com/problems/${slug}/`

export const practice: Record<string, Problem[]> = {
  'two-sum': [
    { slug: 'two-sum', title: 'Two Sum' },
    { slug: 'contains-duplicate', title: 'Contains Duplicate' },
    { slug: 'contains-duplicate-ii', title: 'Contains Duplicate II', note: 'The map stores the index, not just the fact.' },
    { slug: 'longest-consecutive-sequence', title: 'Longest Consecutive Sequence', note: 'Looks like sorting. It is a set and one check.' },
  ],
  'two-pointers': [
    { slug: 'valid-palindrome', title: 'Valid Palindrome' },
    { slug: 'two-sum-ii-input-array-is-sorted', title: 'Two Sum II, Input Array Is Sorted' },
    { slug: 'remove-duplicates-from-sorted-array', title: 'Remove Duplicates from Sorted Array' },
    { slug: 'remove-duplicates-from-sorted-array-ii', title: 'Remove Duplicates from Sorted Array II' },
    { slug: '3sum', title: '3Sum', note: 'Fix one element, then it is the pair problem again.' },
    { slug: 'container-with-most-water', title: 'Container With Most Water' },
    { slug: 'trapping-rain-water', title: 'Trapping Rain Water', note: 'Hard. Also solvable with a monotonic stack.' },
  ],
  'sliding-window': [
    { slug: 'longest-substring-without-repeating-characters', title: 'Longest Substring Without Repeating Characters' },
    { slug: 'minimum-size-subarray-sum', title: 'Minimum Size Subarray Sum' },
    { slug: 'longest-repeating-character-replacement', title: 'Longest Repeating Character Replacement' },
    {
      slug: 'number-of-sub-arrays-of-size-k-and-average-greater-than-or-equal-to-threshold',
      title: 'Subarrays of Size K With Average At Least Threshold',
      note: 'The fixed-size window, which is the easier of the two shapes.',
    },
    { slug: 'longest-turbulent-subarray', title: 'Longest Turbulent Subarray' },
    { slug: 'sliding-window-median', title: 'Sliding Window Median', note: 'Hard. Window plus two heaps.' },
  ],
  'binary-search': [
    { slug: 'search-in-rotated-sorted-array', title: 'Search in Rotated Sorted Array' },
    { slug: 'find-minimum-in-rotated-sorted-array', title: 'Find Minimum in Rotated Sorted Array' },
  ],
  'bfs-grid': [
    { slug: 'number-of-islands', title: 'Number of Islands' },
    { slug: 'binary-tree-level-order-traversal', title: 'Binary Tree Level Order Traversal', note: 'The same queue, on a tree.' },
    { slug: 'word-search', title: 'Word Search', note: 'DFS rather than BFS: this one wants a path, not a distance.' },
  ],
  'backtracking-subsets': [
    { slug: 'subsets', title: 'Subsets' },
    { slug: 'subsets-ii', title: 'Subsets II', note: 'Duplicates, so the skip condition is the whole problem.' },
    { slug: 'permutations', title: 'Permutations' },
    { slug: 'permutations-ii', title: 'Permutations II' },
    { slug: 'combinations', title: 'Combinations' },
    { slug: 'combination-sum', title: 'Combination Sum' },
    { slug: 'letter-combinations-of-a-phone-number', title: 'Letter Combinations of a Phone Number' },
  ],
  'inorder-traversal': [
    { slug: 'maximum-depth-of-binary-tree', title: 'Maximum Depth of Binary Tree' },
    { slug: 'same-tree', title: 'Same Tree' },
    { slug: 'invert-binary-tree', title: 'Invert Binary Tree' },
    { slug: 'binary-tree-preorder-traversal', title: 'Binary Tree Preorder Traversal' },
    { slug: 'binary-tree-postorder-traversal', title: 'Binary Tree Postorder Traversal' },
    { slug: 'validate-binary-search-tree', title: 'Validate Binary Search Tree', note: 'Inorder must come out strictly increasing.' },
    { slug: 'lowest-common-ancestor-of-a-binary-search-tree', title: 'Lowest Common Ancestor of a BST' },
    { slug: 'binary-search-tree-iterator', title: 'Binary Search Tree Iterator', note: 'Inorder, paused halfway, held on an explicit stack.' },
  ],
  'min-heap': [
    { slug: 'find-median-from-data-stream', title: 'Find Median from Data Stream', note: 'Hard. Two heaps facing each other.' },
    { slug: 'ipo', title: 'IPO', note: 'Hard. A heap fed by a sorted scan.' },
  ],
  'coin-change': [
    { slug: 'climbing-stairs', title: 'Climbing Stairs', note: 'Start here. It is Fibonacci wearing a hat.' },
    { slug: 'house-robber', title: 'House Robber' },
    { slug: 'coin-change', title: 'Coin Change' },
    { slug: 'coin-change-ii', title: 'Coin Change II', note: 'Counting ways, not minimising. The loop order flips.' },
    { slug: 'maximum-subarray', title: 'Maximum Subarray', note: "Kadane's: one running total, one best." },
    { slug: 'maximum-sum-circular-subarray', title: 'Maximum Sum Circular Subarray' },
    { slug: 'maximum-product-subarray', title: 'Maximum Product Subarray', note: 'Track the minimum too, because a negative can flip it.' },
    { slug: 'longest-increasing-subsequence', title: 'Longest Increasing Subsequence' },
    { slug: 'longest-increasing-subsequence-ii', title: 'Longest Increasing Subsequence II', note: 'Hard. The same recurrence, made fast with a segment tree.' },
    { slug: 'partition-equal-subset-sum', title: 'Partition Equal Subset Sum', note: 'Subset sum in disguise.' },
    { slug: 'target-sum', title: 'Target Sum' },
    { slug: 'last-stone-weight-ii', title: 'Last Stone Weight II', note: 'Also a partition problem, despite the name.' },
    { slug: 'ones-and-zeroes', title: 'Ones and Zeroes', note: 'Knapsack with two capacities.' },
    { slug: 'minimum-cost-for-tickets', title: 'Minimum Cost For Tickets' },
    { slug: 'palindromic-substrings', title: 'Palindromic Substrings' },
    { slug: 'longest-palindromic-substring', title: 'Longest Palindromic Substring' },
  ],
  'edit-distance': [
    { slug: 'unique-paths', title: 'Unique Paths', note: 'The gentlest grid DP there is.' },
    { slug: 'longest-common-subsequence', title: 'Longest Common Subsequence' },
    { slug: 'edit-distance', title: 'Edit Distance' },
    { slug: 'longest-palindromic-subsequence', title: 'Longest Palindromic Subsequence', note: 'LCS of the string and its reverse.' },
    { slug: 'interleaving-string', title: 'Interleaving String' },
    { slug: 'distinct-subsequences', title: 'Distinct Subsequences', note: 'Hard.' },
    { slug: 'shortest-common-supersequence', title: 'Shortest Common Supersequence', note: 'Hard. LCS, then walk the table back.' },
  ],
  'merge-intervals': [
    { slug: 'merge-intervals', title: 'Merge Intervals' },
    { slug: 'meeting-rooms', title: 'Meeting Rooms' },
    { slug: 'non-overlapping-intervals', title: 'Non-overlapping Intervals', note: 'Sort by end, not by start. Worth understanding why.' },
    { slug: 'my-calendar-i', title: 'My Calendar I', note: 'The same question asked one booking at a time.' },
  ],
  'monotonic-stack': [
    { slug: 'valid-parentheses', title: 'Valid Parentheses', note: 'A plain stack, and the right warm-up for one.' },
    { slug: 'queue-reconstruction-by-height', title: 'Queue Reconstruction by Height', note: 'Sort, then insert. Height reasoning, not a stack.' },
  ],
  'reverse-linked-list': [
    { slug: 'reverse-linked-list', title: 'Reverse Linked List' },
    { slug: 'middle-of-the-linked-list', title: 'Middle of the Linked List', note: 'Fast and slow, at its simplest.' },
    { slug: 'merge-two-sorted-lists', title: 'Merge Two Sorted Lists', note: 'The merge step of merge sort, with pointers.' },
    { slug: 'linked-list-cycle', title: 'Linked List Cycle' },
    { slug: 'linked-list-cycle-ii', title: 'Linked List Cycle II', note: 'Finding where the cycle starts. The proof is the interesting part.' },
    { slug: 'remove-nth-node-from-end-of-list', title: 'Remove Nth Node From End of List', note: 'A gap between two pointers, and a dummy head.' },
    { slug: 'maximum-twin-sum-of-a-linked-list', title: 'Maximum Twin Sum of a Linked List' },
  ],
  'topological-sort': [
    { slug: 'course-schedule', title: 'Course Schedule', note: 'Cycle detection, phrased as a yes or no.' },
    { slug: 'course-schedule-ii', title: 'Course Schedule II', note: 'The same thing, now return the order.' },
    { slug: 'course-schedule-iv', title: 'Course Schedule IV' },
    { slug: 'alien-dictionary', title: 'Alien Dictionary', note: 'Hard. Building the edge list is the whole problem.' },
    { slug: 'sort-items-by-groups-respecting-dependencies', title: 'Sort Items by Groups Respecting Dependencies', note: 'Hard. A topological sort inside another one.' },
  ],
  'union-find': [
    { slug: 'number-of-connected-components-in-an-undirected-graph', title: 'Number of Connected Components' },
    { slug: 'redundant-connection', title: 'Redundant Connection', note: 'The edge that fails to union is the cycle.' },
    { slug: 'accounts-merge', title: 'Accounts Merge' },
    { slug: 'min-cost-to-connect-all-points', title: 'Min Cost to Connect All Points', note: "Kruskal's, which is sorting plus union-find." },
    { slug: 'find-critical-and-pseudo-critical-edges-in-minimum-spanning-tree', title: 'Critical and Pseudo-Critical Edges in an MST', note: 'Hard.' },
  ],
  trie: [
    { slug: 'implement-trie-prefix-tree', title: 'Implement Trie (Prefix Tree)' },
    { slug: 'design-add-and-search-words-data-structure', title: 'Design Add and Search Words Data Structure', note: 'Wildcards, so the search branches.' },
    { slug: 'word-search-ii', title: 'Word Search II', note: 'Hard. A trie walked by a backtracking search, which is why it is here and not under backtracking.' },
    { slug: 'prefix-and-suffix-search', title: 'Prefix and Suffix Search', note: 'Hard.' },
  ],
  dijkstra: [
    { slug: 'network-delay-time', title: 'Network Delay Time' },
    { slug: 'path-with-maximum-probability', title: 'Path with Maximum Probability', note: 'Maximise a product instead of minimising a sum. Same algorithm.' },
    { slug: 'swim-in-rising-water', title: 'Swim in Rising Water', note: 'Hard. Minimise the largest edge rather than the total.' },
  ],
  'prefix-sums': [
    { slug: 'range-sum-query-immutable', title: 'Range Sum Query, Immutable' },
    { slug: 'find-pivot-index', title: 'Find Pivot Index' },
    { slug: 'product-of-array-except-self', title: 'Product of Array Except Self', note: 'Prefix and suffix, multiplied instead of added.' },
    { slug: 'subarray-sum-equals-k', title: 'Subarray Sum Equals K', note: 'Prefix sums plus a hash map. The combination is the point.' },
    { slug: 'range-sum-query-2d-immutable', title: 'Range Sum Query 2D, Immutable' },
    { slug: 'range-sum-query-mutable', title: 'Range Sum Query, Mutable', note: 'Updates break prefix sums. This needs a segment tree or a BIT.' },
  ],
  'jump-game': [
    { slug: 'jump-game', title: 'Jump Game' },
    { slug: 'best-time-to-buy-and-sell-stock', title: 'Best Time to Buy and Sell Stock', note: 'One pass, tracking the minimum seen so far.' },
  ],
  'cyclic-sort': [
    { slug: 'find-the-duplicate-number', title: 'Find the Duplicate Number', note: 'Also solvable as cycle detection on a linked list, which is the famous answer.' },
  ],
  'matrix-rotate': [
    { slug: 'spiral-matrix', title: 'Spiral Matrix', note: 'Four boundaries, shrinking.' },
    { slug: 'set-matrix-zeroes', title: 'Set Matrix Zeroes', note: 'The O(1) space version uses the first row and column as its own notes.' },
  ],
  'group-anagrams': [
    { slug: 'valid-anagram', title: 'Valid Anagram' },
    { slug: 'group-anagrams', title: 'Group Anagrams' },
  ],
}
