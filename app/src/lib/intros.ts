/**
 * The way in.
 *
 * A walkthrough answers "what happens on step 6", which is only a useful
 * question once you already care. These open the page before any of that: one
 * physical picture you can hold without knowing any of the words, and the size
 * of the win, in a number wherever a number exists.
 *
 * Keyed by algorithm id so the walkthroughs stay untouched, the same way
 * conceptVisuals is keyed by concept id.
 */
import type { View } from '../engine/types'
import type { Visual } from './visual'

/**
 * The size of the win, as two numbers rather than a sentence. `unit` names
 * what is being counted, e.g. "comparisons on 10,000 items".
 */
export type Cost = { naive: number; smart: number; unit: string }

export type Intro = {
  /** The picture, in words. No jargon, no code, nothing needing a CS degree. */
  scene: string
  /** What it buys you. A number beats an adjective every time. */
  payoff: string
  /** The same win drawn instead of described. Read off the payoff text. */
  cost?: Cost
  /** The picture, actually a picture. Same shapes the concept pages use. */
  visual?: Visual | Visual[]
  /** Or a still of the data structure itself, drawn by the player's own views. */
  views?: View[]
}

export const intros: Record<string, Intro> = {
  'two-sum': {
    scene:
      "A coat check. You hand over a coat and get ticket 47. When you come back nobody searches the rack, they walk straight to hook 47, because the ticket number is the location. A hash map does that to data: the value itself tells you where it lives, so looking something up never involves looking around.",
    payoff:
      "That gap is why almost every 'now make it faster' answer in an interview starts by reaching for a map.",
    cost: { naive: 500000, smart: 1, unit: "lookups to find a match among 1,000,000 names" },
    views: [
      {
        kind: 'array',
        label: 'target 17, standing on the 10',
        cells: [
          { value: 2 },
          { value: 7, role: 'match', sub: 'the 7 it needs' },
          { value: 11 },
          { value: 15 },
          { value: 10, role: 'active', sub: 'needs 7' },
        ],
        markers: [{ name: 'here', index: 4 }],
      },
      {
        kind: 'map',
        label: 'value -> where I saw it',
        entries: [
          { key: 2, value: 'index 0' },
          { key: 7, value: 'index 1', role: 'match' },
          { key: 11, value: 'index 2' },
          { key: 15, value: 'index 3' },
        ],
      },
    ],
  },
  'two-pointers': {
    scene:
      "Two people walk towards each other along a shelf of books numbered in order, one starting at each end. Their two numbers add up to too much, so the one at the high end steps inwards. Too little, and the low end steps in. They meet in the middle having each walked the shelf once.",
    payoff:
      "The shelf being in order is the only reason the walk works, which is why 'the array is sorted' is never a throwaway detail in the question.",
    cost: { naive: 50000000, smart: 10000, unit: "comparisons on a shelf of 10,000 books" },
    views: [
      {
        kind: 'array',
        label: 'target 17, after both ends have walked inwards: everything either one stepped past is gone for good',
        cells: [
          { value: 2, role: 'excluded', sub: 'stepped past' },
          { value: 4, role: 'excluded' },
          { value: 5, role: 'match' },
          { value: 12, role: 'match' },
          { value: 15, role: 'excluded' },
          { value: 18, role: 'excluded', sub: 'stepped past' },
        ],
        markers: [
          { name: 'left', index: 2 },
          { name: 'right', index: 3 },
        ],
      },
    ],
  },
  'sliding-window': {
    scene:
      "You are looking through a cardboard tube at a line of letters, hunting for the longest stretch with no letter repeated. A repeat appears. You do not start over at the beginning: you pull the back of the tube forward past the old copy and carry on from where you were.",
    payoff:
      "Starting over at every repeat re-reads the same letters again and again. Never going backwards is the whole trick, and it holds because both ends of the tube only ever move forwards.",
    cost: { naive: 1000000000000, smart: 1000000, unit: "character reads over 1,000,000 characters" },
    views: [
      {
        kind: 'array',
        label: 'longest stretch with no repeated letter',
        cells: [
          { value: 'a', role: 'excluded' },
          { value: 'b', role: 'excluded' },
          { value: 'c', role: 'window' },
          { value: 'a', role: 'window' },
          { value: 'b', role: 'window' },
          { value: 'c', role: 'active', sub: 'repeat' },
          { value: 'b' },
          { value: 'b' },
        ],
        markers: [
          { name: 'start', index: 2 },
          { name: 'end', index: 5 },
        ],
      },
    ],
  },
  'binary-search': {
    scene:
      "Think of a number between 1 and a million. Guessing 1, then 2, then 3 takes half a million tries on average. Asking 'is it above 500,000?' and halving what is left every time takes twenty. It is twenty questions, played properly.",
    payoff:
      "The thing people miss is that it never needed a sorted array, only a yes/no question whose answer flips exactly once. That is why it also searches answers nobody wrote down, like the slowest speed that still finishes on time.",
    cost: { naive: 500000, smart: 20, unit: "guesses to find one value among 1,000,000" },
    views: [
      {
        kind: 'array',
        label: 'nine books, four guesses, and each one threw away half of what was still left',
        cells: [
          { value: 1, role: 'excluded' },
          { value: 3, role: 'excluded' },
          { value: 5, role: 'excluded' },
          { value: 7, role: 'excluded' },
          { value: 9, role: 'compare', sub: '1st' },
          { value: 11, role: 'excluded' },
          { value: 13, role: 'compare', sub: '2nd' },
          { value: 15, role: 'compare', sub: '3rd' },
          { value: 17, role: 'match', sub: 'found' },
        ],
      },
    ],
  },
  'bfs-grid': {
    scene:
      "Drop a stone in a pond. The ripple touches everything one metre out before it touches anything two metres out. So the moment the ripple reaches you, that is the shortest distance, and nothing ever has to be compared or corrected.",
    payoff:
      "Wandering off depth-first will find you a way out of the maze, just not a short one. BFS finds the short one for the same cost, which is why using DFS on a question that says 'shortest' is a wrong answer that still runs and still returns something.",
    views: [
      {
        kind: 'grid',
        label: 'the ripple: every cell one step out, before any cell two steps out',
        cells: [
          [
            { value: 'S', role: 'match' },
            { value: 1, role: 'visited' },
            { value: 2, role: 'frontier' },
          ],
          [
            { value: 1, role: 'visited' },
            { value: '#', role: 'wall' },
            { value: 3, role: 'frontier' },
          ],
          [
            { value: 2, role: 'frontier' },
            { value: 3, role: 'frontier' },
            { value: 'E' },
          ],
        ],
      },
    ],
  },
  'backtracking-subsets': {
    scene:
      "A maze, and a ball of string. At every fork you go left and unspool. Dead end, so you wind the string back to the fork and take the right instead. The winding back is the whole technique, and it is the step people drop, which is how one branch's leftovers end up in the next branch's answer.",
    payoff:
      "It really is exponential, and that is fine. If the problem says n is at most 20, nobody is hiding a clever polynomial answer from you. They are telling you to enumerate. The constraint is the instruction.",
    views: [
      {
        kind: 'tree',
        label: 'take it or leave it, once per item',
        root: 'r',
        nodes: {
          r: { id: 'r', value: 'start', left: 'a0', right: 'a1' },
          a0: { id: 'a0', value: 'skip 1', left: 'b0', right: 'b1' },
          a1: { id: 'a1', value: 'take 1', left: 'b2', right: 'b3', role: 'active' },
          b0: { id: 'b0', value: '{}' },
          b1: { id: 'b1', value: '{2}' },
          b2: { id: 'b2', value: '{1}' },
          b3: { id: 'b3', value: '{1,2}', role: 'match' },
        },
      },
    ],
  },
  'inorder-traversal': {
    scene:
      "A tree problem looks like it needs a plan for the whole tree. It does not. You decide exactly one thing: what a node hands up to its parent. Depth hands up 'one more than my tallest child'. Sum hands up 'me, plus both sides'. Then the tree assembles the answer without you.",
    payoff:
      "On a binary search tree the payoff is bigger: read left, then the node, then right, and the values come out sorted. For k-th smallest, for validation, for range queries, that is not a step towards the trick. It is the trick.",
    views: [
      {
        kind: 'tree',
        label: 'left, then me, then right, and the values come out sorted',
        root: 'n8',
        nodes: {
          n8: { id: 'n8', value: 8, left: 'n3', right: 'n10' },
          n3: { id: 'n3', value: 3, left: 'n1', right: 'n6', role: 'active' },
          n10: { id: 'n10', value: 10, right: 'n14' },
          n1: { id: 'n1', value: 1, role: 'visited' },
          n6: { id: 'n6', value: 6 },
          n14: { id: 'n14', value: 14 },
        },
      },
    ],
  },
  'min-heap': {
    scene:
      "A hospital waiting room where the sickest patient is always next, no matter who arrived first. Nobody keeps the whole room ranked, which would be wasted effort on people who will not be called for hours. The room guarantees one thing only: whoever is at the front is the worst off.",
    payoff:
      "That single guarantee is where the saving comes from: to find the top ten it never learns the order of anything else, and sorting everything to read the first ten is paying for 999,990 answers nobody asked for.",
    cost: { naive: 20000000, smart: 3000000, unit: "operations to get the top 10 of 1,000,000" },
    views: [
      {
        kind: 'tree',
        label: 'every parent is smaller than both children, and that is the only rule it keeps',
        root: 'h1',
        nodes: {
          h1: { id: 'h1', value: 1, left: 'h3', right: 'h2', role: 'match' },
          h3: { id: 'h3', value: 3, left: 'h7', right: 'h5' },
          h2: { id: 'h2', value: 2, left: 'h9' },
          h7: { id: 'h7', value: 7 },
          h5: { id: 'h5', value: 5 },
          h9: { id: 'h9', value: 9 },
        },
      },
    ],
  },
  'coin-change': {
    scene:
      "Someone asks for the cheapest way to make 87 cents. You cannot know that without knowing the cheapest way to make 86, and 82, and 62. So stop guessing: solve 1 cent, then 2, then 3, writing each answer on a sheet of paper. By the time you reach 87, everything it depends on is already written down.",
    payoff:
      "Plain recursion recomputes the same amounts an absurd number of times. The paper is the entire difference, and it is the same recursion you already wrote. Learn it as recursion, then memo, then table. They are one technique in three outfits, not three techniques.",
    views: [
      {
        kind: 'array',
        label: 'every amount below the one you want, answered once and written down',
        cells: [
          { value: 0, sub: 'amount 0' },
          { value: 1, sub: '1' },
          { value: 2, sub: '2' },
          { value: 1, sub: '3' },
          { value: 1, sub: '4' },
          { value: 2, sub: '5' },
          { value: 2, role: 'match', sub: '6' },
        ],
      },
    ],
  },
  'edit-distance': {
    scene:
      "How many single-letter edits turn 'kitten' into 'sitting'? Lay one word down the side of a grid and the other across the top. Every cell answers a smaller version of the same question, and it only ever looks at three neighbours: above, to the left, and diagonal. Delete, insert, substitute.",
    payoff:
      "This is how spellcheck decides what you meant and how git decides which lines changed. The grid has one cell per pair of prefixes and that is all the answers there are; the number of possible edit sequences is not worth writing down.",
    cost: { naive: 59049, smart: 121, unit: "subproblems for two 10 letter words" },
    views: [
      {
        kind: 'grid',
        label: 'each cell reads its three neighbours, so the whole table fills in one sweep',
        rowLabels: ['', 'h', 'o', 'r'],
        colLabels: ['', 'r', 'o', 's'],
        corner: 'horse to ros',
        cells: [
          [{ value: 0 }, { value: 1 }, { value: 2 }, { value: 3 }],
          [{ value: 1 }, { value: 1 }, { value: 2 }, { value: 3 }],
          [{ value: 2 }, { value: 2, role: 'compare' }, { value: 1, role: 'compare' }, { value: 2 }],
          [{ value: 3 }, { value: 2 }, { value: 2, role: 'compare' }, { value: 2, role: 'match' }],
        ],
      },
    ],
  },
  'merge-sort': {
    scene:
      "Two people each hold a sorted pile of cards and want one sorted pile. Neither of them looks through their own pile. They compare the top card of each and move the smaller one across, over and over. Every single comparison places a card permanently.",
    payoff:
      "The merge is the part worth knowing by heart, not the sorting. And stability comes down to one character: comparing with <= instead of < keeps tied cards in the order they arrived. That is what lets you sort by date, then by name, and have both orderings survive.",
    cost: { naive: 500000000000, smart: 20000000, unit: "comparisons to sort 1,000,000 items" },
    views: [
      {
        kind: 'tree',
        label: 'split until splitting is pointless, then merge back up',
        root: 'm0',
        nodes: {
          m0: { id: 'm0', value: '5 2 8 1', left: 'm1', right: 'm2' },
          m1: { id: 'm1', value: '5 2', left: 'm3', right: 'm4' },
          m2: { id: 'm2', value: '8 1', left: 'm5', right: 'm6' },
          m3: { id: 'm3', value: 5, role: 'match' },
          m4: { id: 'm4', value: 2, role: 'match' },
          m5: { id: 'm5', value: 8, role: 'match' },
          m6: { id: 'm6', value: 1, role: 'match' },
        },
      },
    ],
  },
  'merge-intervals': {
    scene:
      "Fifty meetings in a calendar, and you want to know which ones collide. Jumbled up, every meeting has to be checked against the other forty-nine. Put them in order of start time and you only ever compare against the latest end time you have seen, because nothing that started earlier can reach further forward.",
    payoff:
      "Sorting costs you something up front and hands back a problem whose hard part has evaporated, which is most of what sorting is actually for. Once the starts are in order, an overlap can only be with the interval directly behind you.",
    cost: { naive: 2450, smart: 50, unit: "comparisons on 50 intervals" },
    views: [
      {
        kind: 'array',
        label: 'sorted by start, so an overlap can only ever be with the one directly behind you',
        cells: [
          { value: '1-3', role: 'match' },
          { value: '2-6', role: 'match', sub: 'overlaps' },
          { value: '8-10', role: 'compare' },
          { value: '9-12', role: 'compare', sub: 'overlaps' },
          { value: '15-18' },
        ],
      },
      {
        kind: 'array',
        label: 'after one sweep',
        cells: [{ value: '1-6', role: 'match' }, { value: '8-12', role: 'compare' }, { value: '15-18' }],
      },
    ],
  },
  'monotonic-stack': {
    scene:
      "You are in a queue and want to know, for each person, who is the next taller person ahead of them. Here is the insight: a short person standing in front of a taller one can never be the answer for anybody behind, because the tall one blocks them forever. So you throw them away. The stack only ever holds people still in the running.",
    payoff:
      "Each person goes on the stack once and comes off once. That is why a problem that looks like it demands every pair be compared finishes in a single pass.",
    cost: { naive: 50000000, smart: 20000, unit: "stack operations over 10,000 temperatures" },
    views: [
      {
        kind: 'array',
        label: 'temperatures: how many days until it gets warmer',
        cells: [
          { value: 73, role: 'visited', sub: '1' },
          { value: 74, role: 'visited', sub: '1' },
          { value: 75, role: 'active', sub: '?' },
          { value: 71 },
          { value: 69 },
          { value: 72 },
        ],
        markers: [{ name: 'today', index: 2 }],
      },
      {
        kind: 'stack',
        label: 'still waiting for a warmer day, coldest on top',
        items: [
          { label: 'day 4, 69', role: 'frontier' },
          { label: 'day 3, 71', role: 'frontier' },
        ],
      },
    ],
  },
  'reverse-linked-list': {
    scene:
      "A conga line, and you want everyone facing the other way. Nobody moves anywhere. Each person turns around and takes hold of whoever used to be behind them. You are juggling three hands at once: who is behind, who am I, who is ahead. Let go of 'who is ahead' before you turn and the rest of the line is gone for good.",
    payoff:
      "Linked lists are shallow but they come up constantly, mostly because they show whether you can keep three pointers straight while everything moves. A dummy node at the front deletes every 'what if it is the first one' branch, and that branch is where the bugs live.",
    views: [
      {
        kind: 'linked',
        label: 'two arrows flipped, two to go',
        order: ['n1', 'n2', 'n3', 'n4'],
        nodes: {
          n1: { id: 'n1', label: 1, next: null, role: 'visited' },
          n2: { id: 'n2', label: 2, next: 'n1', role: 'visited' },
          n3: { id: 'n3', label: 3, next: 'n4', role: 'active' },
          n4: { id: 'n4', label: 4, next: null },
        },
        pointers: [
          { name: 'prev', id: 'n2' },
          { name: 'curr', id: 'n3' },
        ],
      },
    ],
  },
  'topological-sort': {
    scene:
      "You cannot put shoes on before socks. Given a pile of rules like that, produce an order for getting dressed. Start with everything nothing else is waiting on, put it on, and see what that frees up. If you run out of available items while things are still left in the pile, the rules contradict each other.",
    payoff:
      "This is what your package manager does, what your build system does, and what a spreadsheet does when you type a formula. The stuck case is the interesting half: leftovers mean a cycle, and a cycle means the request was impossible.",
    views: [
      {
        kind: 'graph',
        label: 'nothing runs until everything pointing at it has, which is what a build system is',
        nodes: [
          { id: 'a', label: 'A', x: 0, y: 1, role: 'match', sub: 'in 0' },
          { id: 'b', label: 'B', x: 1, y: 0, role: 'frontier', sub: 'in 1' },
          { id: 'c', label: 'C', x: 1, y: 2, role: 'frontier', sub: 'in 1' },
          { id: 'd', label: 'D', x: 2, y: 1, sub: 'in 2' },
        ],
        edges: [
          { from: 'a', to: 'b', directed: true },
          { from: 'a', to: 'c', directed: true },
          { from: 'b', to: 'd', directed: true },
          { from: 'c', to: 'd', directed: true },
        ],
      },
    ],
  },
  'union-find': {
    scene:
      "A room full of people and a running list of 'these two are related'. You do not want the family tree drawn, you only want 'same family?' answered instantly. So everyone points at one representative per family, and merging two families is a single person changing who they point at.",
    payoff:
      "Near-constant per question, and it never builds a graph at all. When the connections arrive one at a time, this beats re-running a traversal after every single one, which is why it quietly sits inside Kruskal and inside every 'count the islands as they appear' problem.",
    cost: { naive: 1000000, smart: 1000, unit: "node visits over 1,000 arriving connections" },
  },
  trie: {
    scene:
      "A filing cabinet where a word's letters spell out the path to its drawer. Every word starting with 'car' goes through the same three drawers and then splits. Finding a word costs the length of that word, and it makes no difference whether the cabinet holds a hundred words or ten million.",
    payoff:
      "That independence from dictionary size is the entire point, and it is why autocomplete can answer while you are still typing. The end-of-word flag matters more than it looks: without it you cannot tell a stored word from a prefix of one.",
    cost: { naive: 100000, smart: 10, unit: "comparisons to look up a 10 letter word in a 100,000 word dictionary" },
  },
  dijkstra: {
    scene:
      "BFS quietly assumes every step costs the same, so arriving first means arriving cheapest. Add road tolls and that falls apart, because a long cheap route can beat a short expensive one. The fix is one change: go next to wherever is cheapest so far, instead of wherever was reached first.",
    payoff:
      "This is your satnav. Swap the plain queue for a priority queue and BFS becomes Dijkstra, which is worth saying out loud in an interview because it turns a page of pseudocode into a single idea you already knew.",
    cost: { naive: 100000000, smart: 700000, unit: "operations on 10,000 nodes and 50,000 roads" },
  },
  'bit-manipulation': {
    scene:
      "Everyone in a room pairs up and walks out. One person is left standing. XOR is exactly that: a value XORed with itself is zero, so duplicates annihilate each other, and because the order does not matter you can sweep the list any way you like and whoever survives is the odd one out.",
    payoff:
      "No map, no sorting, one variable, one pass. It feels like a party trick because it is one, but the same cancellation is how parity bits, checksums and toggling a flag all work.",
    cost: { naive: 1000000, smart: 1, unit: "extra values stored to find the loner among 1,000,000" },
  },
  'prefix-sums': {
    scene:
      "A road with mile markers showing the total distance from the start. Asking how long the stretch between marker 12 and marker 30 is does not require driving it. It is 30 minus 12. Write the running total down once, and every range question afterwards is a single subtraction.",
    payoff:
      "One subtraction per question, however wide the range. Bolt a hash map on and the same idea answers 'how many subarrays add up to exactly k', which looks like an unrelated problem until you see it.",
    cost: { naive: 1000000000, smart: 1000, unit: "operations for 1,000 range sums over 1,000,000 elements" },
    views: [
      {
        kind: 'array',
        label: 'the original row',
        cells: [{ value: 3 }, { value: 4 }, { value: 7 }, { value: 2 }, { value: -3 }],
      },
      {
        kind: 'array',
        label: 'running totals: any range is now one subtraction',
        cells: [
          { value: 0 },
          { value: 3 },
          { value: 7, role: 'compare' },
          { value: 14 },
          { value: 16, role: 'compare' },
          { value: 13 },
        ],
        markers: [
          { name: 'from', index: 2 },
          { name: 'to', index: 4 },
        ],
      },
    ],
  },
  quickselect: {
    scene:
      "You want the third tallest person in a crowd. You do not need everybody lined up by height. Pick someone at random, split the crowd into taller and shorter than them, and then notice that one of those two groups cannot possibly contain the answer. Throw it away. Repeat with what is left.",
    payoff:
      "Each round discards roughly half the crowd, so the total work adds up to about n instead of n log n. This is the answer to 'can you do better' after you have already offered a heap, which is exactly when it gets asked.",
    cost: { naive: 20000000, smart: 1000000, unit: "operations to find the k-th smallest of 1,000,000" },
  },
  'matrix-rotate': {
    scene:
      "Turning a photo 90 degrees with no second photo to copy into. Flip it along its diagonal, then mirror each row left to right. Do those two things and the picture has rotated. It is far easier to see than to derive, which is precisely why it gets asked.",
    payoff:
      "The words 'in place' in the question are not flavour text, they are the constraint that forbids the obvious answer. Spotting that the constraint is the problem is most of the problem.",
    cost: { naive: 1000000, smart: 1, unit: "extra cells to rotate a 1,000 by 1,000 matrix" },
  },
  'cyclic-sort': {
    scene:
      "Numbered coat hooks, and every coat is numbered 1 to n. There is no puzzle about where anything goes: coat 7 belongs on hook 7. Keep swapping each coat to its own hook and after one pass everything is home. Whichever hook ends up wrong is telling you what went missing or what got duplicated.",
    payoff:
      "The array becomes its own hash map, so you get O(1) extra space where a map would have cost you O(n). 'The numbers are in the range 1 to n' is the tell, and it is essentially never an accident.",
    cost: { naive: 1000000, smart: 1, unit: "extra slots for 1,000,000 numbers" },
  },
  'bst-delete': {
    scene:
      "Removing a manager from an org chart. Nobody reports to them, so they just go. One report, so that person moves up into the slot. Two reports, and you cannot promote both, so you promote the next person in line instead, which on a search tree is the smallest thing in the right branch.",
    payoff:
      "The two-child case is the whole question and it is the one people wave their hands at. Naming the successor and saying why it is the only valid choice is the answer they are waiting for.",
  },
  'reservoir-sampling': {
    scene:
      "A conveyor belt of unknown length, and you may keep exactly one item, fairly. Keep the first. When item 5 comes past, swap it in with probability one in five. Item 100, one in a hundred. At the end, every item that ever passed had exactly the same chance, and you never learned how many there were.",
    payoff:
      "One pass, one slot of memory, no length required. This is how you sample a log file too big to hold, and the fairness proof is short enough to say out loud, which is the real reason it gets asked.",
    cost: { naive: 1000000, smart: 10, unit: "items held in memory from a 1,000,000 line stream" },
  },
  'lru-cache': {
    scene:
      "A desk. New papers go on top, and a paper you pick up goes back on top when you are done. When the desk is full, the sheet at the bottom is by definition the one you have not touched in the longest time, so that is the one that goes. The catch is that finding a specific paper in a stack means digging through it.",
    payoff:
      "So you keep two things: an index saying where every paper is, and the stack saying what order they are in. No single structure does both jobs, and noticing that is the answer. Every cache you have ever used is some version of this.",
    cost: { naive: 1000, smart: 1, unit: "entries scanned per get in a 1,000 entry cache" },
    views: [
      {
        kind: 'map',
        label: 'where every entry is, so a get never searches',
        entries: [
          { key: 'a', value: 1 },
          { key: 'c', value: 3 },
          { key: 'd', value: 4, role: 'active' },
        ],
      },
      {
        kind: 'linked',
        label: 'what order they were last touched, so eviction never searches either',
        order: ['d', 'a', 'c'],
        nodes: {
          d: { id: 'd', label: 'd', next: 'a', role: 'active', sub: 'newest' },
          a: { id: 'a', label: 'a', next: 'c' },
          c: { id: 'c', label: 'c', next: null, role: 'excluded', sub: 'evicted next' },
        },
      },
    ],
  },
  'count-inversions': {
    scene:
      "How out of order is a list? Count the pairs sitting in the wrong order. The lovely part is that merge sort already knows: the moment you take an element from the right pile, everything still waiting in the left pile is larger than it, and that count falls out for free during a sort you were doing anyway.",
    payoff:
      "Checking every pair is n squared. Counting during the merge is n log n. The lesson is bigger than the problem: you got it by noticing information a sort was throwing away.",
    cost: { naive: 500000000000, smart: 20000000, unit: "comparisons on 1,000,000 items" },
  },
  'jump-game': {
    scene:
      "Stepping stones across a river, and each stone tells you how far you are allowed to jump from it. You do not need to work out a route. Track one number: the furthest stone you could possibly reach so far. If you ever find yourself standing past it, you are stuck.",
    payoff:
      "One variable, one pass, no searching at all. Greedy feels like cheating right up until you can explain why the single number you kept is enough, and that explanation is the thing being tested.",
    cost: { naive: 50000000, smart: 10000, unit: "checks over 10,000 positions" },
  },
  sieve: {
    scene:
      "Find every prime under 100. Write the numbers out. Circle 2, cross out every second number. Circle 3, cross out every third. Whatever survives uncrossed is prime. You never once test a number for divisibility.",
    payoff:
      "Start crossing out at p times p rather than 2p, because everything below that was already crossed out by a smaller prime. That single detail is the difference between understanding the sieve and having memorised it.",
    cost: { naive: 1000000000, smart: 2500000, unit: "operations to list every prime under 1,000,000" },
  },
  'group-anagrams': {
    scene:
      "A pile of Scrabble racks, and you want the ones holding the same letters grouped together. Comparing racks against each other never ends. Instead, sort each rack's letters alphabetically: 'eat', 'tea' and 'ate' all turn into 'aet'. Now it is just sorting mail into pigeonholes.",
    payoff:
      "Pairwise comparison is quadratic. Reducing each item to one key that its whole group shares is a single pass. This 'find the canonical form' move shows up far past anagrams, in deduplication and caching and schema design.",
    cost: { naive: 50000000, smart: 10000, unit: "word comparisons over 10,000 words" },
    views: [
      {
        kind: 'map',
        label: 'sorted letters as the key, so words that belong together arrive at the same bucket',
        entries: [
          { key: 'aet', value: 'eat, tea, ate', role: 'match' },
          { key: 'ant', value: 'tan, nat', role: 'match' },
          { key: 'abt', value: 'bat' },
        ],
      },
    ],
  },
  'quick-sort': {
    scene:
      "Pick a card at random and call it the pivot. Everything smaller goes to its left, everything larger to its right. The pivot is now in its final resting place forever, and you are left with two smaller piles to do exactly the same thing to.",
    payoff:
      "Fastest in practice because it shuffles data around inside the array it was already given, with no second array to allocate. Its worst case is quadratic on already-sorted input, which is why real implementations choose the pivot at random or by median of three.",
    cost: { naive: 1000000, smart: 20, unit: "extra slots to sort 1,000,000 items" },
    views: [
      {
        kind: 'array',
        label: 'one partition: the pivot is home for good, and neither side ever has to look at the other again',
        cells: [
          { value: 2, role: 'window' },
          { value: 1, role: 'window' },
          { value: 3, role: 'window' },
          { value: 5, role: 'match', sub: 'pivot, final home' },
          { value: 9, role: 'compare' },
          { value: 7, role: 'compare' },
          { value: 8, role: 'compare' },
        ],
      },
    ],
  },
  'insertion-sort': {
    scene:
      "Precisely how you sort a hand of playing cards. Pick up the next card, slide it left past everything bigger than it, drop it into the gap. You do it without thinking, which is the point: it is the one sorting algorithm humans invented on their own.",
    payoff:
      "Quadratic in general, but genuinely linear on nearly-sorted data, so serious sort routines fall back to it once the pieces get small. Timsort, which Python and Java both use, is merge sort with insertion sort living inside it.",
    cost: { naive: 200000, smart: 10000, unit: "comparisons on 10,000 nearly sorted items" },
  },
  'selection-sort': {
    scene:
      "Scan the entire hand for the smallest card and put it first. Scan what is left for the next smallest and put it second. Easy to describe, and it does exactly the same amount of scanning whether the data arrived random or already perfect.",
    payoff:
      "Its one real virtue is writes: exactly n swaps, fewer than any other simple sort. That mattered enormously when writing to memory was expensive, and it still matters on flash, where writes wear the hardware out.",
    cost: { naive: 25000000, smart: 10000, unit: "writes to memory to sort 10,000 items" },
  },
  'bubble-sort': {
    scene:
      "Walk down the line comparing each neighbouring pair, swapping them when they are the wrong way round. Large values drift towards the end one position per pass, like bubbles rising. Stop when a whole pass goes by without a single swap.",
    payoff:
      "Nobody ships it. It earns its place because it is the baseline everything else is measured against, and because 'why is this bad' has a real answer: each element moves one position per pass, so a value stranded at the wrong end needs n passes to get home.",
  },
  'heap-sort': {
    scene:
      "Pour everything into the hospital waiting room from the heap page, then call patients one after another. They come out in order. No extra room is needed, because the waiting room can live inside the array you were handed.",
    payoff:
      "n log n guaranteed, worst case included, with O(1) extra space. Quicksort usually still beats it in practice, and the reason is worth knowing: heapsort jumps all over memory and the CPU cache hates that.",
    cost: { naive: 500000000000, smart: 20000000, unit: "comparisons in the worst case on 1,000,000 items" },
  },
  'counting-sort': {
    scene:
      "A thousand exam scores, every one between 0 and 100. Do not compare anything at all. Line up 101 buckets, tally how many of each score you saw, then read the tallies back out in order. The scores sorted themselves simply by existing.",
    payoff:
      "Linear, which sounds impossible until you spot the catch: it only works when the range of possible values is small and known ahead of time. Hand it values up to a billion and you have just asked for a billion buckets.",
    cost: { naive: 20000000, smart: 1001000, unit: "operations to sort 1,000,000 values under 1,000" },
  },
  'radix-sort': {
    scene:
      "Deal a pile of numbers into ten trays by their last digit. Stack the trays back up in order. Deal again by the tens digit, then the hundreds. After the final digit the pile is sorted, and you never compared two numbers to each other.",
    payoff:
      "This is literally how punch card sorting machines worked a century ago. It only holds together because every pass is stable: the ordering from the earlier digits has to survive the later pass, or the whole thing quietly collapses.",
    cost: { naive: 20000000, smart: 6000000, unit: "operations to sort 1,000,000 six digit numbers" },
  },
  'binary-search-answer': {
    scene:
      "A shop will sell you a ship of any size and charges by the metre. You need every parcel delivered in three days. Rather than working out the right size, you guess a size and ask one easy question: does everything fit in three days? Too small, guess bigger. Fine, try smaller. You are playing twenty questions against the price list, not against the parcels.",
    payoff:
      "Checking one candidate is easy and constructing the answer directly is horrible, so you stop trying to construct it. That swap is the whole pattern, and it shows up as minimum speed, minimum capacity, smallest largest sum and least k such that. The thing being halved is a range of answers nobody wrote down.",
    cost: { naive: 1000000, smart: 20, unit: "candidate answers checked out of 1,000,000" },
    views: [
      {
        kind: 'array',
        label: 'the candidate answers nobody wrote down: slowest speed that still finishes in time',
        cells: [
          { value: 1, role: 'excluded', sub: 'too slow' },
          { value: 2, role: 'excluded', sub: 'too slow' },
          { value: 3, role: 'excluded', sub: 'too slow' },
          { value: 4, role: 'match', sub: 'first that fits' },
          { value: 5, role: 'window', sub: 'fits' },
          { value: 6, role: 'window', sub: 'fits' },
          { value: 7, role: 'window', sub: 'fits' },
        ],
      },
    ],
  },
  kruskal: {
    scene:
      "Six towns to connect with cable, and you want the least cable in total. Take the shortest link first, then the next, skipping any link between two towns that are already joined by what you laid earlier. Keep going until everything is on one network.",
    payoff:
      "The skip is the only hard part, because 'already joined' means a path might exist through five other towns. Union-Find answers that in near-constant time without ever walking the path, which is what turns a greedy sweep into a working algorithm.",
  },
  'min-stack': {
    scene:
      "A stack of plates where you also want to know the smallest plate instantly. Keeping one sticky note saying 'smallest so far' works until you remove that exact plate, and then the note is worthless and you have nothing to fall back on. So keep a note per plate instead: each one records the smallest plate at or below it.",
    payoff:
      "Both stacks stay the same height, so a push and a pop touch each of them once and getMin is a single read. It costs O(n) extra memory to make one query O(1) instead of O(n), and being able to state that trade plainly is what the question is checking.",
    cost: { naive: 1000, smart: 1, unit: "reads per getMin on a stack of 1,000" },
  },
  'count-bits': {
    scene:
      "Count the 1s in a binary number. The obvious way checks all twelve columns whether or not they hold anything. There is a trick instead: subtracting 1 always knocks out the lowest 1 and fills everything below it, so ANDing the two together erases exactly one 1 and touches nothing else. Repeat until the number is zero and count the repeats.",
    payoff:
      "The loop runs once per 1, not once per column, so a number with two bits set finishes in two turns however wide the word is. The same family gives you n & -n to isolate the lowest bit and n & (n - 1) === 0 as the fastest power-of-two test there is.",
    cost: { naive: 64, smart: 2, unit: "loop turns for a 64 bit number with two bits set" },
  },
  recursion: {
    scene:
      "Ask a queue of people to pass a question back until someone knows the answer, then pass the answer forward again. Nobody in the middle does anything on the way back; they all wait. The entire trip down produces nothing, and every bit of the arithmetic happens on the way up.",
    payoff:
      "Holding those two phases apart is most of what makes recursion readable, and the waiting is not free: each parked call is a real stack frame. That is why 100,000 linked list nodes overflow and a balanced tree of the same size is fine at depth 17, and it is why a recursive answer is never O(1) space.",
    views: [
      {
        kind: 'stack',
        label: 'four calls open at once, three of them waiting',
        items: [
          { label: 'fact(4) waiting on fact(3)' },
          { label: 'fact(3) waiting on fact(2)' },
          { label: 'fact(2) waiting on fact(1)' },
          { label: 'fact(1) = 1, the base case', role: 'match' },
        ],
      },
    ],
  },
  'knapsack-01': {
    scene:
      "A bag that holds 7 kilos and a table of things with weights and prices. You cannot take half a vase. Greed fails here in a way it does not for a fractional version: the best price per kilo can still be the wrong thing to take, because it leaves an awkward gap nothing else fills. So instead you answer every smaller question first, for every bag size from 0 up.",
    payoff:
      "Each cell is one yes-or-no decision comparing two numbers that are already written down, so the whole table fills in one sweep with no recursion. Cloud schedulers solve this every time they place a workload on a node, and having a two-item counterexample ready for why greed fails is worth more in the room than the algorithm.",
    cost: { naive: 1099511627776, smart: 40000, unit: "combinations considered for 40 items and capacity 1,000" },
    views: [
      {
        kind: 'grid',
        label: 'one yes-or-no per cell, each reading two numbers already written down',
        rowLabels: ['none', '+ 2kg', '+ 3kg'],
        colLabels: [0, 1, 2, 3, 4],
        corner: 'kg left',
        cells: [
          [{ value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }],
          [{ value: 0 }, { value: 0 }, { value: 3, role: 'compare' }, { value: 3 }, { value: 3, role: 'compare' }],
          [{ value: 0 }, { value: 0 }, { value: 3 }, { value: 4 }, { value: 4, role: 'match' }],
        ],
      },
    ],
  },
  kadane: {
    scene:
      "Walk along a row of daily profits and losses, carrying a running total, looking for the best stretch. The only decision you ever make is this: is the total I am carrying helping me, or dragging me down? If it has gone negative, drop it and start fresh from where you stand. That is the whole algorithm.",
    payoff:
      "Checking every stretch is quadratic; this is one pass and two variables. The trap is initialising the best to zero, which on an all-negative row returns zero, a stretch containing nothing. Start both at the first element.",
    cost: { naive: 50000000, smart: 10000, unit: "additions over 10,000 daily figures" },
    views: [
      {
        kind: 'array',
        label: 'the best stretch ends somewhere, and you only ever have to ask where',
        cells: [
          { value: -2, role: 'excluded' },
          { value: 1, role: 'excluded' },
          { value: -3, role: 'excluded' },
          { value: 4, role: 'match' },
          { value: -1, role: 'match' },
          { value: 2, role: 'match' },
          { value: 1, role: 'match', sub: 'best = 6' },
          { value: -5, role: 'excluded' },
        ],
      },
    ],
  },
  'iterative-dfs': {
    scene:
      "Recursion keeps your place on a stack you cannot see or measure. Iterative DFS is the same walk with that stack written down in an array you hold: take the top one, mark it seen, put its unvisited neighbours on. Nothing else changes.",
    payoff:
      "It cannot overflow, which matters the moment a graph is 100,000 nodes deep, and it is what a garbage collector uses to walk an object graph. The subtlety is that a node can be pushed several times before any copy comes off, so the seen check has to happen when you pop, not when you push.",
    views: [
      {
        kind: 'stack',
        label: 'the call stack, written down instead of used, so nothing can overflow',
        items: [
          { label: 'F, pushed by C', role: 'frontier' },
          { label: 'E, pushed by C', role: 'frontier' },
          { label: 'C, popped next', role: 'active' },
        ],
      },
    ],
  },
  kmp: {
    scene:
      "Searching for a word in a page. The naive way, on a mismatch, shifts the word along by one and re-reads text it just read. KMP never goes back. Before searching, it asks the pattern how much of itself repeats, and on a mismatch it slides forward by exactly that much because those characters are already known to match.",
    payoff:
      "The text pointer only ever moves forwards, which is what lets you search a stream you cannot rewind. That is why grep and intrusion detection use this shape. In an interview it is usually a recognition question, so being able to explain the prefix table matters more than writing it.",
    cost: { naive: 1000000000, smart: 1001000, unit: "character comparisons for a 1,000 char pattern in a 1,000,000 char text" },
  },
  prim: {
    scene:
      "Same six towns, same cable, opposite method to Kruskal. Rather than picking the cheapest link anywhere and joining scattered clusters, plant yourself in one town and keep buying the cheapest link that reaches somewhere new. One network, growing outward, never in pieces.",
    payoff:
      "It is Dijkstra with a single line changed: order the queue by the weight of one edge rather than by distance from the source. That one line is the entire difference between a shortest path tree and a minimum spanning tree, and knowing it stops the two blurring together.",
  },
  'segment-tree': {
    scene:
      "Mile markers work beautifully for range questions right up until someone moves a mile. Then every marker after it is wrong. A segment tree stores totals over ranges instead of over prefixes, in a tree: each node covers an interval, its two children split it in half, and the root covers everything.",
    payoff:
      "Changing one value touches one node per level going down and repairs one per level coming back, so an update is log n instead of n, and range queries stay fast. It works for min, max and gcd too, since the only requirement is that combining two children is associative.",
    cost: { naive: 1000000, smart: 20, unit: "cells touched per range query over 1,000,000" },
  },
  heapify: {
    scene:
      "You have all the elements already and want a heap. Pushing them one at a time costs n log n. Build it from the bottom instead: start just above the leaves and sift each value down, so that by the time you reach any node both subtrees below it are already valid.",
    payoff:
      "That inversion makes it O(n), and the reason is a good thing to be able to say. Half the array is leaves that cannot move at all, a quarter can move one level, and only the root can travel the full height. The sum converges to about 2n.",
    cost: { naive: 20000000, smart: 2000000, unit: "swaps to build a heap of 1,000,000" },
    views: [
      {
        kind: 'tree',
        label: 'greyed out: the half that is leaves and cannot move at all. Only the root can travel the full height, which is why building costs n and not n log n',
        root: 'r',
        nodes: {
          r: { id: 'r', value: 1, left: 'b', right: 'c', role: 'active' },
          b: { id: 'b', value: 3, left: 'd', right: 'e', role: 'compare' },
          c: { id: 'c', value: 2, left: 'f', role: 'compare' },
          d: { id: 'd', value: 7, role: 'excluded' },
          e: { id: 'e', value: 5, role: 'excluded' },
          f: { id: 'f', value: 9, role: 'excluded' },
        },
      },
    ],
  },
  'fast-slow-pointers': {
    scene:
      "Two runners on a track, one at twice the speed. If the track is a straight line, the fast one reaches the end. If it is a loop, the fast one must eventually lap the slow one, because it closes the gap by exactly one step at a time and so cannot jump past.",
    payoff:
      "Cycle detection in O(1) space, with no set of visited nodes. The second phase finds where the loop begins: put one runner back at the start and walk both at one step, and they meet at the entrance. People answer the first phase when asked for the second, and the meeting point is not the entrance.",
    cost: { naive: 1000000, smart: 2, unit: "nodes remembered to find a cycle in a 1,000,000 node list" },
    views: [
      {
        kind: 'linked',
        label: 'the tail loops back, so one runner at double speed has to lap the other',
        order: ['a', 'b', 'c', 'd', 'e'],
        nodes: {
          a: { id: 'a', label: 1, next: 'b' },
          b: { id: 'b', label: 2, next: 'c', role: 'match', sub: 'loop starts' },
          c: { id: 'c', label: 3, next: 'd' },
          d: { id: 'd', label: 4, next: 'e', role: 'active', sub: 'they meet' },
          e: { id: 'e', label: 5, next: 'b' },
        },
        pointers: [
          { name: 'slow', id: 'd' },
          { name: 'fast', id: 'd' },
        ],
      },
    ],
  },
  'bucket-sort': {
    scene:
      "Sorting a pile of receipts by amount. Rather than comparing them all against each other, drop each into one of four trays by rough range, sort each small tray, then stack the trays in order. No receipt in tray 0 ever gets compared to one in tray 3.",
    payoff:
      "Linear on average, which beats the n log n floor because it stops comparing across the whole pile. The assumption doing all the work is that the values spread evenly. Skew everything into one tray and you have just run insertion sort on the original array, so say the assumption out loud.",
    cost: { naive: 20000000, smart: 1000000, unit: "operations to sort 1,000,000 evenly spread values" },
  },
}
