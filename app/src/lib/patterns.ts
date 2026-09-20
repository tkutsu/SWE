import type { Tone, Visual } from './visual'

/**
 * The routing layer. Every walkthrough answers "how does this work"; none of
 * them answer "which one is this", which is the question you actually face
 * when a problem is read out to you. The thirty pages each carry a "reach for
 * it when", but you can only read it once you have already picked the page,
 * which is backwards. This collects the triggers in one place, pointed the way
 * an interview points: from the words in the problem to the pattern.
 */

/** One trigger: what you hear, what it means, and why the implication holds. */
export type Signal = {
  /** The phrase or shape as it appears in the problem statement. */
  cue: string
  /** What to reach for. */
  pattern: string
  /** Jumps to the walkthrough, when one exists. */
  algoId?: string
  /** The reason the cue implies the pattern. The reason, not the rule. */
  why: string
  tone?: Tone
}

export type SignalBand = { id: string; name: string; blurb: string; signals: Signal[] }

/**
 * The follow-up chain. Loops are decided at the moment they say "can you do
 * better", so a rung carries both the move and the prompt that triggers it:
 * recognising the prompt is most of the skill.
 */
export type Ladder = {
  id: string
  opening: string
  rungs: {
    /** The approach at this rung. */
    move: string
    /** Its cost, as you would say it out loud. */
    cost: string
    algoId?: string
    /** What the interviewer says to push you off this rung. Absent on the first. */
    prompt?: string
    tone?: Tone
  }[]
}

/**
 * Bounds are a hint, not decoration. The interviewer picked n so that exactly
 * one complexity class fits, which means reading it backwards tells you the
 * intended solution before you have thought about the problem at all.
 */
export const budget: Visual = {
  kind: 'table',
  head: ['n up to', 'Budget', 'What the bound is telling you', 'Usually'],
  rows: [
    ['10 - 20', 'O(2^n), O(n!)', 'Exponential is intended. Enumerate.', 'Backtracking, bitmask DP'],
    ['100 - 500', 'O(n^3)', 'A triple loop is affordable.', 'Floyd-Warshall, interval DP'],
    ['~2,000', 'O(n^2)', 'A nested loop is affordable.', '2D DP, all pairs'],
    ['~100,000', 'O(n log n)', 'One sort or one heap. No nested loop.', 'Sort, heap, binary search'],
    ['~1,000,000', 'O(n)', 'A single pass, and not much else.', 'Hash map, two pointers, window'],
    ['10^9 and up', 'O(log n), O(1)', 'You cannot even read the input.', 'Binary search the answer, math'],
  ],
  caption:
    'Read the constraint before you read the problem. n = 18 is not a small case, it is an instruction to enumerate; n = 10^9 means the input is never materialised and the answer is a formula or a search over the answer space. No row here is better than another, so nothing is coloured: each is simply correct for its own n.',
}

/**
 * The two mapping bands are deliberately uncoloured: a cue either points at a
 * pattern or it does not, and there is no judgement to render. Colour appears
 * only where something is genuinely wrong, which is the traps band.
 */
export const bands: SignalBand[] = [
  {
    id: 'input',
    name: 'The shape of the input',
    blurb: 'Most problems are given away by what you are handed, before anyone says what to do with it.',
    signals: [
      {
        cue: 'Sorted array, find a pair or a triple',
        pattern: 'Two pointers',
        algoId: 'two-pointers',
        why: 'From the two ends, moving left up can only raise the sum and moving right down can only lower it. Each step therefore rules out a whole row of the pair matrix, not one cell.',
      },
      {
        cue: 'Sorted, or any condition that flips exactly once',
        pattern: 'Binary search',
        algoId: 'binary-search',
        why: 'Sortedness is not required, monotonicity is. That is why it also works on the answer space: minimum capacity, minimum speed, k-th smallest. Search the answer, test with a predicate.',
      },
      {
        cue: 'Unsorted, and you need lookup, counting or dedup',
        pattern: 'Hash map',
        algoId: 'two-sum',
        why: 'The inner loop is asking "have I seen this before". A map answers that in O(1), so you spend O(n) space to delete an O(n) loop.',
      },
      {
        cue: 'Contiguous subarray or substring under a constraint',
        pattern: 'Sliding window',
        algoId: 'sliding-window',
        why: 'Contiguity is the gift: neither end ever has to move backwards, so both indices travel the array once between them.',
      },
      {
        cue: 'Range sums asked repeatedly over a fixed array',
        pattern: 'Prefix sums',
        algoId: 'prefix-sums',
        why: 'Pay O(n) once, then every range is a single subtraction. Paired with a hash map it also answers "how many subarrays sum to k".',
      },
      {
        cue: 'Intervals: meetings, bookings, ranges',
        pattern: 'Sort by start, then sweep',
        algoId: 'merge-intervals',
        why: 'Unsorted, overlap is a question about every other interval. Sorted by start, it is one comparison against the furthest end so far.',
      },
      {
        cue: 'A grid',
        pattern: 'BFS or DFS',
        algoId: 'bfs-grid',
        why: 'Same traversal, different container: a queue gives you distance order, a stack gives you depth. Pick by what is being asked, not by preference.',
      },
      {
        cue: 'Prerequisites, dependencies, build order',
        pattern: 'Topological sort',
        algoId: 'topological-sort',
        why: '"A before B" is a directed edge, and the interesting half is the cycle: an impossible ordering is the case they are testing.',
      },
      {
        cue: 'Edges carry weights',
        pattern: 'Dijkstra',
        algoId: 'dijkstra',
        why: 'With weights, arrival order stops matching distance order, so BFS breaks. Swap the queue for a priority queue and it works again.',
      },
      {
        cue: '"Are these two connected", and groups keep merging',
        pattern: 'Union-Find',
        algoId: 'union-find',
        why: 'Near-constant per query, and it never builds a graph. If the merges arrive one at a time, this beats re-running a traversal.',
      },
      {
        cue: 'Prefixes, autocomplete, a dictionary of words',
        pattern: 'Trie',
        algoId: 'trie',
        why: 'Words sharing a prefix share a path, so a lookup costs the length of the word rather than the size of the dictionary.',
      },
      {
        cue: 'A tree',
        pattern: 'Recursion',
        algoId: 'inorder-traversal',
        why: 'Decide exactly one thing: what a node returns to its parent. Depth, sum, validity and LCA are all that same question with a different return value.',
      },
      {
        cue: 'A binary search tree specifically',
        pattern: 'Inorder traversal',
        algoId: 'inorder-traversal',
        why: 'Inorder on a BST comes out sorted. For k-th smallest, validation and range queries that is not a step towards the trick, it is the trick.',
      },
      {
        cue: 'A linked list',
        pattern: 'Fast and slow pointers, and a dummy head',
        algoId: 'reverse-linked-list',
        why: 'Two speeds find the middle and any cycle in one pass. The dummy head deletes every "what if it is the first node" branch, which is where the bugs live.',
      },
      {
        cue: 'A stream you cannot re-read or store',
        pattern: 'Reservoir sampling, or a bounded heap',
        algoId: 'reservoir-sampling',
        why: 'One pass and O(k) memory is the whole constraint. Any answer that needs the length up front is disqualified.',
      },
      {
        cue: 'n numbers, every one in the range 1 to n',
        pattern: 'Cyclic sort',
        algoId: 'cyclic-sort',
        why: 'The value tells you which index it belongs at, so the array is already its own hash table. That is how you find the duplicate or the missing one at O(1) space.',
      },
      {
        cue: 'Strings that are rearrangements of each other',
        pattern: 'Canonical signature',
        algoId: 'group-anagrams',
        why: 'Comparing strings pairwise is quadratic. Reduce each to one key that all its anagrams share, and grouping is a single pass.',
      },
      {
        cue: 'Everything appears twice except one',
        pattern: 'XOR',
        algoId: 'bit-manipulation',
        why: 'a ^ a is 0 and order does not matter, so the pairs annihilate and the loner is what is left. O(1) space, no map.',
      },
    ],
  },
  {
    id: 'ask',
    name: 'The shape of the ask',
    blurb: 'When the input does not give it away, the verb does.',
    signals: [
      {
        cue: '"The k-th largest", "the top k"',
        pattern: 'Heap of size k',
        algoId: 'min-heap',
        why: 'Sorting orders all n elements when you were asked about k of them. A bounded heap does the minimum amount of ordering the question requires.',
      },
      {
        cue: '"Shortest", on an unweighted graph or grid',
        pattern: 'BFS',
        algoId: 'bfs-grid',
        why: 'BFS reaches nodes in distance order, so the first time you arrive is already the shortest way. Nothing needs to be compared or updated.',
      },
      {
        cue: '"All of them": subsets, permutations, combinations',
        pattern: 'Backtracking',
        algoId: 'backtracking-subsets',
        why: 'Choose, recurse, undo. The undo is the part people drop, and dropping it leaks state into the sibling branch.',
      },
      {
        cue: '"How many ways", "minimum cost", "longest"',
        pattern: 'Dynamic programming',
        algoId: 'coin-change',
        why: 'A choice at each step plus subproblems that recur. Write the recursion first and memoise it second, rather than reaching for a table you cannot justify.',
      },
      {
        cue: 'Two sequences, aligned or transformed into each other',
        pattern: '2D DP',
        algoId: 'edit-distance',
        why: 'One axis per string. Every cell is a prefix-against-prefix answer built from the three neighbours above and to the left of it.',
      },
      {
        cue: '"For each element, the next larger one"',
        pattern: 'Monotonic stack',
        algoId: 'monotonic-stack',
        why: 'Each index is pushed once and popped once, so the whole thing is O(n) despite looking like it should be quadratic.',
      },
      {
        cue: '"Design a structure where every operation is O(1)"',
        pattern: 'Hash map plus a second structure',
        algoId: 'lru-cache',
        why: 'One structure never gives you both. The map gives O(1) lookup, and a list or heap beside it carries the ordering the map cannot.',
      },
      {
        cue: '"In place", "O(1) extra space"',
        pattern: 'Index arithmetic or reversal',
        algoId: 'matrix-rotate',
        why: 'The constraint rules out the copy, which means the answer is a sequence of swaps. Rotating a matrix is transpose, then reverse each row.',
      },
      {
        cue: '"Count the pairs" across a whole array',
        pattern: 'Divide and conquer',
        algoId: 'count-inversions',
        why: 'Counting during a merge is free: the merge already knows which half each element came from, which is exactly what the pair condition asks.',
      },
      {
        cue: '"Is it possible", "can you reach"',
        pattern: 'Greedy, with one invariant',
        algoId: 'jump-game',
        why: 'Reachability rarely needs the path. Track the single quantity that decides it, here the furthest index reachable so far, and discard everything else.',
      },
    ],
  },
  {
    id: 'traps',
    name: 'Where the routing goes wrong',
    blurb: 'Five misroutes that are common enough to be worth naming before you make them.',
    signals: [
      {
        cue: 'DFS because the graph is a graph',
        pattern: 'Not for "shortest"',
        tone: 'bad',
        why: 'DFS finds a path and will happily report a long one. If the word "shortest" appears and the edges are unweighted, it has to be BFS.',
      },
      {
        cue: 'Sorting when the answer is an index',
        pattern: 'Sort pairs, or use a map',
        tone: 'bad',
        why: 'Sorting destroys the original positions, and Two Sum wants positions. Either sort (value, index) together or never sort at all.',
      },
      {
        cue: 'A heap when k is close to n',
        pattern: 'Just sort',
        tone: 'bad',
        why: 'O(n log k) only beats O(n log n) while k is small. At k = n/2 you have written a harder solution for the same cost.',
      },
      {
        cue: 'Recursion on a list of 100,000 nodes',
        pattern: 'Iterate',
        tone: 'bad',
        why: 'Linked list and array recursion goes one frame deep per element and overflows the stack. Trees are fine because depth is log n when balanced, which is worth saying out loud.',
      },
      {
        cue: 'Reaching for the pattern before restating the problem',
        pattern: 'Say the brute force first',
        tone: 'bad',
        why: 'Naming the O(n^2) and its cost costs thirty seconds and gives you a baseline to improve, a correctness check, and something to talk about if the optimal does not arrive.',
      },
    ],
  },
]

export const ladders: Ladder[] = [
  {
    id: 'pair-sum',
    opening: '"Find two numbers that add up to a target"',
    rungs: [
      { move: 'Every pair, nested loops', cost: 'O(n^2) time, O(1) space', tone: 'bad' },
      {
        prompt: 'Can you do better?',
        move: 'Hash map, one pass',
        cost: 'O(n) time, O(n) space',
        algoId: 'two-sum',
        tone: 'good',
      },
      {
        prompt: 'What if it is sorted and you cannot use extra space?',
        move: 'Two pointers from the ends',
        cost: 'O(n) time, O(1) space',
        algoId: 'two-pointers',
        tone: 'good',
      },
    ],
  },
  {
    id: 'kth-largest',
    opening: '"Return the k-th largest element"',
    rungs: [
      { move: 'Sort, then index', cost: 'O(n log n)', tone: 'neutral' },
      {
        prompt: 'You are ordering n elements to use k of them.',
        move: 'Min-heap of size k',
        cost: 'O(n log k)',
        algoId: 'min-heap',
        tone: 'good',
      },
      {
        prompt: 'Better than n log k?',
        move: 'Quickselect: partition, discard a side',
        cost: 'O(n) average, O(n^2) worst',
        algoId: 'quickselect',
        tone: 'accent',
      },
    ],
  },
  {
    id: 'climb',
    opening: '"How many ways to climb n stairs, one or two at a time"',
    rungs: [
      { move: 'Plain recursion', cost: 'O(2^n)', tone: 'bad' },
      {
        prompt: 'How many times are you computing f(3)?',
        move: 'Memoise the recursion',
        cost: 'O(n) time, O(n) space and stack',
        tone: 'accent',
      },
      {
        prompt: 'Now remove the recursion.',
        move: 'Tabulate bottom up',
        cost: 'O(n) time, O(n) space',
        algoId: 'coin-change',
        tone: 'good',
      },
      {
        prompt: 'And the space?',
        move: 'Two rolling variables',
        cost: 'O(n) time, O(1) space',
        tone: 'good',
      },
    ],
  },
  {
    id: 'shortest-path',
    opening: '"Shortest path from A to B"',
    rungs: [
      { move: 'BFS, unweighted', cost: 'O(V + E)', algoId: 'bfs-grid', tone: 'good' },
      {
        prompt: 'Now the edges have weights.',
        move: 'Dijkstra: BFS with a priority queue',
        cost: 'O(E log V)',
        algoId: 'dijkstra',
        tone: 'good',
      },
      {
        prompt: 'Some weights are negative.',
        move: 'Bellman-Ford',
        cost: 'O(V * E)',
        tone: 'neutral',
      },
    ],
  },
  {
    id: 'longest-substring',
    opening: '"Longest substring with no repeated character"',
    rungs: [
      { move: 'Check every substring', cost: 'O(n^2) at best', tone: 'bad' },
      {
        prompt: 'Does the window have to restart from scratch?',
        move: 'Sliding window with a last-seen map',
        cost: 'O(n) time, O(alphabet) space',
        algoId: 'sliding-window',
        tone: 'good',
      },
    ],
  },
]
