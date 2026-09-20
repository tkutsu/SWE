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
export type Intro = {
  /** The picture. No jargon, no code, nothing you need a CS degree to hold. */
  scene: string
  /** What it buys you. A number beats an adjective every time. */
  payoff: string
}

export const intros: Record<string, Intro> = {
  'two-sum': {
    scene:
      "A coat check. You hand over a coat and get ticket 47. When you come back nobody searches the rack, they walk straight to hook 47, because the ticket number is the location. A hash map does that to data: the value itself tells you where it lives, so looking something up never involves looking around.",
    payoff:
      "Searching a list of a million names one at a time averages 500,000 comparisons. A hash map takes about one. That gap is why almost every 'now make it faster' answer in an interview starts by reaching for a map.",
  },
  'two-pointers': {
    scene:
      "Two people walk towards each other along a shelf of books numbered in order, one starting at each end. Their two numbers add up to too much, so the one at the high end steps inwards. Too little, and the low end steps in. They meet in the middle having each walked the shelf once.",
    payoff:
      "Checking every pair on a 10,000 book shelf is 50 million comparisons. Walking towards each other is 10,000. The shelf being in order is what buys you that, which is why 'the array is sorted' is never a throwaway detail in the question.",
  },
  'sliding-window': {
    scene:
      "You are looking through a cardboard tube at a line of letters, hunting for the longest stretch with no letter repeated. A repeat appears. You do not start over at the beginning: you pull the back of the tube forward past the old copy and carry on from where you were.",
    payoff:
      "Starting over each time re-reads the same letters again and again, so a million characters turns into something near a trillion reads. Never going backwards keeps it at a million. Both ends of the tube only ever move forwards.",
  },
  'binary-search': {
    scene:
      "Think of a number between 1 and a million. Guessing 1, then 2, then 3 takes half a million tries on average. Asking 'is it above 500,000?' and halving what is left every time takes twenty. It is twenty questions, played properly.",
    payoff:
      "Twenty against half a million. And the thing people miss is that it never needed a sorted array, only a yes/no question whose answer flips exactly once. That is why it also searches answers nobody wrote down, like the slowest speed that still finishes on time.",
  },
  'bfs-grid': {
    scene:
      "Drop a stone in a pond. The ripple touches everything one metre out before it touches anything two metres out. So the moment the ripple reaches you, that is the shortest distance, and nothing ever has to be compared or corrected.",
    payoff:
      "Wandering off depth-first will find you a way out of the maze, just not a short one. BFS finds the short one for the same cost, which is why using DFS on a question that says 'shortest' is a wrong answer that still runs and still returns something.",
  },
  'backtracking-subsets': {
    scene:
      "A maze, and a ball of string. At every fork you go left and unspool. Dead end, so you wind the string back to the fork and take the right instead. The winding back is the whole technique, and it is the step people drop, which is how one branch's leftovers end up in the next branch's answer.",
    payoff:
      "It really is exponential, and that is fine. If the problem says n is at most 20, nobody is hiding a clever polynomial answer from you. They are telling you to enumerate. The constraint is the instruction.",
  },
  'inorder-traversal': {
    scene:
      "A tree problem looks like it needs a plan for the whole tree. It does not. You decide exactly one thing: what a node hands up to its parent. Depth hands up 'one more than my tallest child'. Sum hands up 'me, plus both sides'. Then the tree assembles the answer without you.",
    payoff:
      "On a binary search tree the payoff is bigger: read left, then the node, then right, and the values come out sorted. For k-th smallest, for validation, for range queries, that is not a step towards the trick. It is the trick.",
  },
  'min-heap': {
    scene:
      "A hospital waiting room where the sickest patient is always next, no matter who arrived first. Nobody keeps the whole room ranked, which would be wasted effort on people who will not be called for hours. The room guarantees one thing only: whoever is at the front is the worst off.",
    payoff:
      "That single guarantee is where the saving comes from. Fully ordering a million items to look at the top ten is a million times twenty operations. A heap holding only ten is a million times about three, and it never learns the order of the rest.",
  },
  'coin-change': {
    scene:
      "Someone asks for the cheapest way to make 87 cents. You cannot know that without knowing the cheapest way to make 86, and 82, and 62. So stop guessing: solve 1 cent, then 2, then 3, writing each answer on a sheet of paper. By the time you reach 87, everything it depends on is already written down.",
    payoff:
      "Plain recursion recomputes the same amounts an absurd number of times. The paper is the entire difference, and it is the same recursion you already wrote. Learn it as recursion, then memo, then table. They are one technique in three outfits, not three techniques.",
  },
  'edit-distance': {
    scene:
      "How many single-letter edits turn 'kitten' into 'sitting'? Lay one word down the side of a grid and the other across the top. Every cell answers a smaller version of the same question, and it only ever looks at three neighbours: above, to the left, and diagonal. Delete, insert, substitute.",
    payoff:
      "This is how spellcheck decides what you meant and how git decides which lines changed. For these two words the grid is 7 by 8, which is 56 answers. The number of possible edit sequences is not worth writing down.",
  },
  'merge-sort': {
    scene:
      "Two people each hold a sorted pile of cards and want one sorted pile. Neither of them looks through their own pile. They compare the top card of each and move the smaller one across, over and over. Every single comparison places a card permanently.",
    payoff:
      "The merge is the part worth knowing by heart, not the sorting. And stability comes down to one character: comparing with <= instead of < keeps tied cards in the order they arrived. That is what lets you sort by date, then by name, and have both orderings survive.",
  },
  'merge-intervals': {
    scene:
      "Fifty meetings in a calendar, and you want to know which ones collide. Jumbled up, every meeting has to be checked against the other forty-nine. Put them in order of start time and you only ever compare against the latest end time you have seen, because nothing that started earlier can reach further forward.",
    payoff:
      "2,450 comparisons become 50. Sorting costs you something up front and hands back a problem whose hard part has evaporated, which is most of what sorting is actually for.",
  },
  'monotonic-stack': {
    scene:
      "You are in a queue and want to know, for each person, who is the next taller person ahead of them. Here is the insight: a short person standing in front of a taller one can never be the answer for anybody behind, because the tall one blocks them forever. So you throw them away. The stack only ever holds people still in the running.",
    payoff:
      "Each person goes on the stack once and comes off once. That is why a problem that looks like it demands every pair be compared finishes in a single pass.",
  },
  'reverse-linked-list': {
    scene:
      "A conga line, and you want everyone facing the other way. Nobody moves anywhere. Each person turns around and takes hold of whoever used to be behind them. You are juggling three hands at once: who is behind, who am I, who is ahead. Let go of 'who is ahead' before you turn and the rest of the line is gone for good.",
    payoff:
      "Linked lists are shallow but they come up constantly, mostly because they show whether you can keep three pointers straight while everything moves. A dummy node at the front deletes every 'what if it is the first one' branch, and that branch is where the bugs live.",
  },
  'topological-sort': {
    scene:
      "You cannot put shoes on before socks. Given a pile of rules like that, produce an order for getting dressed. Start with everything nothing else is waiting on, put it on, and see what that frees up. If you run out of available items while things are still left in the pile, the rules contradict each other.",
    payoff:
      "This is what your package manager does, what your build system does, and what a spreadsheet does when you type a formula. The stuck case is the interesting half: leftovers mean a cycle, and a cycle means the request was impossible.",
  },
  'union-find': {
    scene:
      "A room full of people and a running list of 'these two are related'. You do not want the family tree drawn, you only want 'same family?' answered instantly. So everyone points at one representative per family, and merging two families is a single person changing who they point at.",
    payoff:
      "Near-constant per question, and it never builds a graph at all. When the connections arrive one at a time, this beats re-running a traversal after every single one, which is why it quietly sits inside Kruskal and inside every 'count the islands as they appear' problem.",
  },
  trie: {
    scene:
      "A filing cabinet where a word's letters spell out the path to its drawer. Every word starting with 'car' goes through the same three drawers and then splits. Finding a word costs the length of that word, and it makes no difference whether the cabinet holds a hundred words or ten million.",
    payoff:
      "That independence from dictionary size is the entire point, and it is why autocomplete can answer while you are still typing. The end-of-word flag matters more than it looks: without it you cannot tell a stored word from a prefix of one.",
  },
  dijkstra: {
    scene:
      "BFS quietly assumes every step costs the same, so arriving first means arriving cheapest. Add road tolls and that falls apart, because a long cheap route can beat a short expensive one. The fix is one change: go next to wherever is cheapest so far, instead of wherever was reached first.",
    payoff:
      "This is your satnav. Swap the plain queue for a priority queue and BFS becomes Dijkstra, which is worth saying out loud in an interview because it turns a page of pseudocode into a single idea you already knew.",
  },
  'bit-manipulation': {
    scene:
      "Everyone in a room pairs up and walks out. One person is left standing. XOR is exactly that: a value XORed with itself is zero, so duplicates annihilate each other, and because the order does not matter you can sweep the list any way you like and whoever survives is the odd one out.",
    payoff:
      "No map, no sorting, one variable, one pass. It feels like a party trick because it is one, but the same cancellation is how parity bits, checksums and toggling a flag all work.",
  },
  'prefix-sums': {
    scene:
      "A road with mile markers showing the total distance from the start. Asking how long the stretch between marker 12 and marker 30 is does not require driving it. It is 30 minus 12. Write the running total down once, and every range question afterwards is a single subtraction.",
    payoff:
      "A thousand range questions over a million elements drops from a billion operations to a thousand. Bolt a hash map on and the same idea answers 'how many subarrays add up to exactly k', which looks like an unrelated problem until you see it.",
  },
  quickselect: {
    scene:
      "You want the third tallest person in a crowd. You do not need everybody lined up by height. Pick someone at random, split the crowd into taller and shorter than them, and then notice that one of those two groups cannot possibly contain the answer. Throw it away. Repeat with what is left.",
    payoff:
      "Each round discards roughly half the crowd, so the total work adds up to about n instead of n log n. This is the answer to 'can you do better' after you have already offered a heap, which is exactly when it gets asked.",
  },
  'matrix-rotate': {
    scene:
      "Turning a photo 90 degrees with no second photo to copy into. Flip it along its diagonal, then mirror each row left to right. Do those two things and the picture has rotated. It is far easier to see than to derive, which is precisely why it gets asked.",
    payoff:
      "The words 'in place' in the question are not flavour text, they are the constraint that forbids the obvious answer. Spotting that the constraint is the problem is most of the problem.",
  },
  'cyclic-sort': {
    scene:
      "Numbered coat hooks, and every coat is numbered 1 to n. There is no puzzle about where anything goes: coat 7 belongs on hook 7. Keep swapping each coat to its own hook and after one pass everything is home. Whichever hook ends up wrong is telling you what went missing or what got duplicated.",
    payoff:
      "The array becomes its own hash map, so you get O(1) extra space where a map would have cost you O(n). 'The numbers are in the range 1 to n' is the tell, and it is essentially never an accident.",
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
  },
  'lru-cache': {
    scene:
      "A desk. New papers go on top, and a paper you pick up goes back on top when you are done. When the desk is full, the sheet at the bottom is by definition the one you have not touched in the longest time, so that is the one that goes. The catch is that finding a specific paper in a stack means digging through it.",
    payoff:
      "So you keep two things: an index saying where every paper is, and the stack saying what order they are in. No single structure does both jobs, and noticing that is the answer. Every cache you have ever used is some version of this.",
  },
  'count-inversions': {
    scene:
      "How out of order is a list? Count the pairs sitting in the wrong order. The lovely part is that merge sort already knows: the moment you take an element from the right pile, everything still waiting in the left pile is larger than it, and that count falls out for free during a sort you were doing anyway.",
    payoff:
      "Checking every pair is n squared. Counting during the merge is n log n. The lesson is bigger than the problem: you got it by noticing information a sort was throwing away.",
  },
  'jump-game': {
    scene:
      "Stepping stones across a river, and each stone tells you how far you are allowed to jump from it. You do not need to work out a route. Track one number: the furthest stone you could possibly reach so far. If you ever find yourself standing past it, you are stuck.",
    payoff:
      "One variable, one pass, no searching at all. Greedy feels like cheating right up until you can explain why the single number you kept is enough, and that explanation is the thing being tested.",
  },
  sieve: {
    scene:
      "Find every prime under 100. Write the numbers out. Circle 2, cross out every second number. Circle 3, cross out every third. Whatever survives uncrossed is prime. You never once test a number for divisibility.",
    payoff:
      "Start crossing out at p times p rather than 2p, because everything below that was already crossed out by a smaller prime. That single detail is the difference between understanding the sieve and having memorised it.",
  },
  'group-anagrams': {
    scene:
      "A pile of Scrabble racks, and you want the ones holding the same letters grouped together. Comparing racks against each other never ends. Instead, sort each rack's letters alphabetically: 'eat', 'tea' and 'ate' all turn into 'aet'. Now it is just sorting mail into pigeonholes.",
    payoff:
      "Pairwise comparison is quadratic. Reducing each item to one key that its whole group shares is a single pass. This 'find the canonical form' move shows up far past anagrams, in deduplication and caching and schema design.",
  },
  'quick-sort': {
    scene:
      "Pick a card at random and call it the pivot. Everything smaller goes to its left, everything larger to its right. The pivot is now in its final resting place forever, and you are left with two smaller piles to do exactly the same thing to.",
    payoff:
      "Fastest in practice because it shuffles data around inside the array it was already given, with no second array to allocate. Its worst case is quadratic on already-sorted input, which is why real implementations choose the pivot at random or by median of three.",
  },
  'insertion-sort': {
    scene:
      "Precisely how you sort a hand of playing cards. Pick up the next card, slide it left past everything bigger than it, drop it into the gap. You do it without thinking, which is the point: it is the one sorting algorithm humans invented on their own.",
    payoff:
      "Quadratic in general, but genuinely linear on nearly-sorted data, so serious sort routines fall back to it once the pieces get small. Timsort, which Python and Java both use, is merge sort with insertion sort living inside it.",
  },
  'selection-sort': {
    scene:
      "Scan the entire hand for the smallest card and put it first. Scan what is left for the next smallest and put it second. Easy to describe, and it does exactly the same amount of scanning whether the data arrived random or already perfect.",
    payoff:
      "Its one real virtue is writes: exactly n swaps, fewer than any other simple sort. That mattered enormously when writing to memory was expensive, and it still matters on flash, where writes wear the hardware out.",
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
  },
  'counting-sort': {
    scene:
      "A thousand exam scores, every one between 0 and 100. Do not compare anything at all. Line up 101 buckets, tally how many of each score you saw, then read the tallies back out in order. The scores sorted themselves simply by existing.",
    payoff:
      "Linear, which sounds impossible until you spot the catch: it only works when the range of possible values is small and known ahead of time. Hand it values up to a billion and you have just asked for a billion buckets.",
  },
  'radix-sort': {
    scene:
      "Deal a pile of numbers into ten trays by their last digit. Stack the trays back up in order. Deal again by the tens digit, then the hundreds. After the final digit the pile is sorted, and you never compared two numbers to each other.",
    payoff:
      "This is literally how punch card sorting machines worked a century ago. It only holds together because every pass is stable: the ordering from the earlier digits has to survive the later pass, or the whole thing quietly collapses.",
  },
  'binary-search-answer': {
    scene:
      "A shop will sell you a ship of any size and charges by the metre. You need every parcel delivered in three days. Rather than working out the right size, you guess a size and ask one easy question: does everything fit in three days? Too small, guess bigger. Fine, try smaller. You are playing twenty questions against the price list, not against the parcels.",
    payoff:
      "Checking one candidate is easy and constructing the answer directly is horrible, so you stop trying to construct it. That swap is the whole pattern, and it shows up as minimum speed, minimum capacity, smallest largest sum and least k such that. The thing being halved is a range of answers nobody wrote down.",
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
  },
  'count-bits': {
    scene:
      "Count the 1s in a binary number. The obvious way checks all twelve columns whether or not they hold anything. There is a trick instead: subtracting 1 always knocks out the lowest 1 and fills everything below it, so ANDing the two together erases exactly one 1 and touches nothing else. Repeat until the number is zero and count the repeats.",
    payoff:
      "The loop runs once per 1, not once per column, so a number with two bits set finishes in two turns however wide the word is. The same family gives you n & -n to isolate the lowest bit and n & (n - 1) === 0 as the fastest power-of-two test there is.",
  },
  recursion: {
    scene:
      "Ask a queue of people to pass a question back until someone knows the answer, then pass the answer forward again. Nobody in the middle does anything on the way back; they all wait. The entire trip down produces nothing, and every bit of the arithmetic happens on the way up.",
    payoff:
      "Holding those two phases apart is most of what makes recursion readable, and the waiting is not free: each parked call is a real stack frame. That is why 100,000 linked list nodes overflow and a balanced tree of the same size is fine at depth 17, and it is why a recursive answer is never O(1) space.",
  },
  'knapsack-01': {
    scene:
      "A bag that holds 7 kilos and a table of things with weights and prices. You cannot take half a vase. Greed fails here in a way it does not for a fractional version: the best price per kilo can still be the wrong thing to take, because it leaves an awkward gap nothing else fills. So instead you answer every smaller question first, for every bag size from 0 up.",
    payoff:
      "Each cell is one yes-or-no decision comparing two numbers that are already written down, so the whole table fills in one sweep with no recursion. Cloud schedulers solve this every time they place a workload on a node, and having a two-item counterexample ready for why greed fails is worth more in the room than the algorithm.",
  },
  kadane: {
    scene:
      "Walk along a row of daily profits and losses, carrying a running total, looking for the best stretch. The only decision you ever make is this: is the total I am carrying helping me, or dragging me down? If it has gone negative, drop it and start fresh from where you stand. That is the whole algorithm.",
    payoff:
      "Checking every stretch is quadratic; this is one pass and two variables. The trap is initialising the best to zero, which on an all-negative row returns zero, a stretch containing nothing. Start both at the first element.",
  },
  'iterative-dfs': {
    scene:
      "Recursion keeps your place on a stack you cannot see or measure. Iterative DFS is the same walk with that stack written down in an array you hold: take the top one, mark it seen, put its unvisited neighbours on. Nothing else changes.",
    payoff:
      "It cannot overflow, which matters the moment a graph is 100,000 nodes deep, and it is what a garbage collector uses to walk an object graph. The subtlety is that a node can be pushed several times before any copy comes off, so the seen check has to happen when you pop, not when you push.",
  },
  kmp: {
    scene:
      "Searching for a word in a page. The naive way, on a mismatch, shifts the word along by one and re-reads text it just read. KMP never goes back. Before searching, it asks the pattern how much of itself repeats, and on a mismatch it slides forward by exactly that much because those characters are already known to match.",
    payoff:
      "The text pointer only ever moves forwards, which is what lets you search a stream you cannot rewind. That is why grep and intrusion detection use this shape. In an interview it is usually a recognition question, so being able to explain the prefix table matters more than writing it.",
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
  },
  heapify: {
    scene:
      "You have all the elements already and want a heap. Pushing them one at a time costs n log n. Build it from the bottom instead: start just above the leaves and sift each value down, so that by the time you reach any node both subtrees below it are already valid.",
    payoff:
      "That inversion makes it O(n), and the reason is a good thing to be able to say. Half the array is leaves that cannot move at all, a quarter can move one level, and only the root can travel the full height. The sum converges to about 2n.",
  },
  'fast-slow-pointers': {
    scene:
      "Two runners on a track, one at twice the speed. If the track is a straight line, the fast one reaches the end. If it is a loop, the fast one must eventually lap the slow one, because it closes the gap by exactly one step at a time and so cannot jump past.",
    payoff:
      "Cycle detection in O(1) space, with no set of visited nodes. The second phase finds where the loop begins: put one runner back at the start and walk both at one step, and they meet at the entrance. People answer the first phase when asked for the second, and the meeting point is not the entrance.",
  },
  'bucket-sort': {
    scene:
      "Sorting a pile of receipts by amount. Rather than comparing them all against each other, drop each into one of four trays by rough range, sort each small tray, then stack the trays in order. No receipt in tray 0 ever gets compared to one in tray 3.",
    payoff:
      "Linear on average, which beats the n log n floor because it stops comparing across the whole pile. The assumption doing all the work is that the values spread evenly. Skew everything into one tray and you have just run insertion sort on the original array, so say the assumption out loud.",
  },
}
