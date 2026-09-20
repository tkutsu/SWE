# SWE

A step-through visualiser for the algorithms and data structures worth knowing
for a software engineering interview, ranked by how often they actually come up.

**[Open it](https://tkutsu.github.io/swe/)**

Pick an item from the list, then walk the algorithm one step at a time. Each step
highlights the line of code that is running, draws the data, shows the live
variables, and says why this step happens rather than just what it does. All the
inputs are editable, so you can feed it the case you got wrong and watch it.

Each one opens with where it actually runs in production, because "binary search
halves the range" is easier to hold on to once you know git bisect is binary
search over commits.

Everything for a software engineering interview loop in one place: the thirty
ranked algorithms, the other sorts, the concept questions, the system design
exercises and the behavioural prep. Tick boxes track what you have covered.

**Tier 1, these will show up**

| # | Topic | What it shows |
|---|---|---|
| 1 | Hash maps | Two Sum in one pass, with the map filling as it goes |
| 2 | Two pointers | Pair sum on sorted data, one element eliminated per step |
| 3 | Sliding window | Longest substring with no repeat, window jumping rather than stepping |
| 4 | Binary search | The live range halving, and where the insertion point lands on a miss |
| 5 | BFS | Shortest path on a grid, with the queue and the distance field |
| 6 | Backtracking | All subsets, on a decision tree that grows as it is explored |
| 7 | Binary trees | Inorder traversal with the call stack, and why it comes out sorted |
| 8 | Heaps | Sift up and sift down, array and tree side by side |

**Tier 2, common, and where levels separate**

| # | Topic | What it shows |
|---|---|---|
| 9 | DP 1D | Coin change, each amount built from smaller ones |
| 10 | DP 2D | Edit distance, each cell reading its three neighbours |
| 11 | Sorting | Merge sort, with the merge buffer and why `<=` keeps it stable |
| 12 | Intervals | Merge overlapping, on a timeline, after sorting by start |
| 13 | Monotonic stack | Daily temperatures, each index pushed once and popped once |
| 14 | Linked lists | Reversal, with arrows flipping while the boxes stay put |
| 15 | Topological sort | Kahn's algorithm, in-degrees draining, and cycle detection |

**Tier 3, know them, expect them less**

| # | Topic | What it shows |
|---|---|---|
| 16 | Union-Find | Components merging, union by size, cycles rejected |
| 17 | Tries | Words sharing prefixes, and why the end-of-word flag matters |
| 18 | Dijkstra | BFS with a priority queue, relaxation, and stale heap entries |
| 19 | Bit manipulation | XOR cancelling pairs, shown bit by bit |
| 20 | Prefix sums | Subarray sum equals k, with the running total and its counts |

**The other sorts**

Quicksort, insertion, selection, bubble, heapsort, counting and radix. Each one
says where it is actually used and what it loses to.

**System design exercises**

Seven worked exercises: URL shortener, rate limiter, news feed, chat app, and
the frontend ones, an autocomplete widget, an infinite scroll feed and an image
carousel. Each has an architecture diagram and the structure to answer in.

**Behavioural**

The six STAR stories that cover almost any question asked, and how to handle a
question you cannot answer.

**Concepts**

88 "explain X" questions across OOP, functional programming, JavaScript and
TypeScript, React, the web platform, CS fundamentals, databases, system design
and engineering practice. Each has a diagram and an answer sized for about a
minute of talking. Tick boxes track what you have covered.

**Tier 4**

| # | Topic | What it shows |
|---|---|---|
| 21 | Quickselect | Partition, then discard a whole side |
| 22 | Matrix | Rotate in place as transpose then reverse |
| 23 | Cyclic sort | The array as its own hash table |
| 24 | BST delete | All three cases, including the two-children one |
| 25 | Reservoir sampling | Uniform pick from a stream, seeded so runs repeat |
| 26 | LRU cache | Hash map and doubly linked list working together |
| 27 | Divide and conquer | Counting inversions during a merge sort |
| 28 | Greedy | Jump game, tracking only the furthest reach |
| 29 | Math | Sieve of Eratosthenes, and why it starts at p squared |
| 30 | Strings | Group anagrams by canonical signature |

## Running it

```
cd app
pnpm install
pnpm dev
```

Arrow keys step, space plays. On a phone the list is behind the menu button and
the step controls sit at the bottom of the screen.

`app/README.md` covers how a walkthrough is built and how to add one.

## Deploying

```
./scripts/deploy.sh
```

Builds the app and force pushes `app/dist` to the `gh-pages` branch, which Pages
serves. The branch is build output only, so it carries no history. There is no CI
workflow because the local `gh` token has no `workflow` scope; if you add one with
`gh auth refresh -s workflow`, this becomes a GitHub Action instead.
