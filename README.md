# SWE

A step-through visualiser for the algorithms and data structures worth knowing
for a software engineering interview, ranked by how often they actually come up.

**[Open it](https://tkutsu.github.io/swe/)**

Pick an item from the list, then walk the algorithm one step at a time. Each step
highlights the line of code that is running, draws the data, shows the live
variables, and says why this step happens rather than just what it does. All the
inputs are editable, so you can feed it the case you got wrong and watch it.

Each one opens with a picture rather than a definition, because "binary search
halves the range" means nothing until someone says: think of a number between 1
and a million, guessing 1, 2, 3 takes half a million tries and halving takes
twenty. Then the cost of not having it, in a number. Then the code. Every page
also says where the thing actually runs in production, because binary search is
easier to hold on to once you know git bisect is binary search over commits.

Every walkthrough ends with the LeetCode problems that drill it, 253 of them,
grouped by the pattern rather than by chapter, with difficulty shown and
premium ones marked. Which problem teaches which pattern is a judgement call
and is written by hand; the titles and difficulty are facts and are fetched
from leetcode, so they cannot go stale and a slug that does not exist fails the
build rather than shipping as a dead link.

Everything for a software engineering interview loop in one place: the thirty
ranked algorithms, the other sorts, the concept questions, the system design
exercises and the behavioural prep. Tick boxes track what you have covered.

Two pages are maps rather than lessons and carry no tick box, because you do not
finish a map. A third thing sits up there with them: how to attack a problem you
have never seen. Three of the nine books give that a whole chapter, and it is
the most reused skill in a loop, so it does not belong buried at the end.

**Which pattern is this?**

The page it opens on, and the only one that points outward rather than inward.
Every walkthrough answers how an algorithm works. None of them answer which one
you are looking at, which is the question a problem statement actually asks. So
this reads the problem backwards: the cue you hear, the pattern it points at,
and why the implication holds. "Sorted array, find a pair" is two pointers
because moving either end rules out a whole row of the pair matrix. Click a
pattern and its walkthrough opens.

It carries the constraint table too, because n is a hint rather than decoration.
n = 18 is an instruction to enumerate; n = 10^9 means the input is never
materialised and the answer is a formula. And it has the follow-up ladders: the
brute force, then what the interviewer says to push you off it, then the move
that answers them. Pair sum runs nested loops, "can you do better", hash map,
"what if it is sorted and you cannot use extra space", two pointers. The prompts
between the rungs are the part worth learning.

**The complexity board**

Every walkthrough shows its own two badges, and two badges on two separate pages
cannot be compared, which is the only reason anyone looks a complexity up. So
the board puts them side by side: eight data structures by read, find, insert
and delete, and eight sorts by average, worst, space and stability, each with a
column for what the row leaves out. Then six places the table lies to you, which
is the part worth reading. Amortised is not worst case. The word doing the work
in "balanced BST" is balanced. O(n log n) is the floor for comparison sorting,
not for sorting.

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

**Going deeper**

Fourteen second walkthroughs, each taking an item already on the ranked list and
showing the variant the first pass could only describe in prose, which is
usually the variant that gets failed. Binary search on the answer space, where
the thing being halved is a range of answers nobody wrote down. Recursion and
the call stack, watched as two phases: nothing happens on the way down and
everything happens on the way up. Kruskal, which is the minimum spanning tree
that union-find was quietly built for. Counting set bits with n & (n - 1). And
the min stack, which is item 26 on the list finally having both halves.

**Concepts**

119 "explain X" questions across OOP, functional programming, JavaScript and
TypeScript, React, the web platform, CS fundamentals, databases, system design,
engineering practice and ways of working (Scrum, code review, feature flags,
on-call, SLOs). Each has a diagram and an answer sized for about a minute.

**Object-oriented design**

A separate round at a lot of companies, and the trainer used to pretend system
design was the only kind. How an OOD round differs from a system design one,
then a parking lot, a deck of cards, an elevator, Connect Four, blackjack, a
bank and a movie recommender. Each one is really
a question about where behaviour lives and what happens when the requirement
changes halfway through, which is the follow-up you are actually being set up
for.

**The other rounds**

The testing round, where four quite different questions wear the same clothes.
Concurrency, locks and deadlock, including what the honest answer is when the
job is JavaScript. Eleven design patterns with what each actually solves and
where you have already used it without the name. Puzzle and estimation
questions, grouped by family, because recognising the family gives you the
opening move. And what to do when the problem turns out to be NP-hard, which is
rare and a strong signal when it lands.

**Interview**

Kept at the end, separate from the subject matter: how to run a system design
round, then sixteen worked exercises (URL shortener, rate limiter, news feed,
chat, distributed cache, scaling a database, notifications, payments, YouTube,
Google Drive, Maps nearby search, a key-value store, a message queue, plus the
frontend ones, an autocomplete widget, an infinite scroll feed and an image
carousel), what the loop actually is and how to negotiate an offer,
the six STAR stories that cover almost any behavioural question, and how to
handle a question you cannot answer. Each has a diagram.

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
