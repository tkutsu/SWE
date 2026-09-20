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

Everything for a software engineering interview loop in one place, in the order
the books teach it, and in an order where nothing arrives before the thing it
needs. Sliding windows come after hash maps because they open by reaching for a
Set. Quicksort comes after recursion. Heapsort comes after heaps. Those are not
opinions, they are recorded as prerequisites in the data, and the smoke test
fails the build if the list ever contradicts one.

The 205 items sit in four tracks, so a sitting can be one algorithm and two
concepts rather than 53 algorithms before the first concept page:

| Track | Phases |
|---|---|
| Algorithms | Orientation, Foundations, Core algorithms, Structures built on recursion, Optimisation |
| Language and web | The language: OOP and FP, JavaScript and TypeScript, React, the web platform, processes and memory |
| Systems and design | Databases, system design concepts, engineering practice, ways of working, then the design rounds |
| The interview | The testing, patterns and concurrency rounds, STAR stories, the offer |

Every row carries a coloured dot for how likely it is to come up and a rough
time in minutes, and the list regroups by likelihood when you want to triage
rather than learn. Phases collapse, each one showing how many of its items are
ticked. The two reference pages are maps rather than lessons: they are pinned
above the list, carry no tick box and sit outside Previous and Next, because you
do not finish a map.

The URL is the page (`#/algo/two-pointers`), so links, refresh and the browser
back button all work, and closing the tab and coming back resumes where you
were. `j` and `k` move between pages; the arrow keys belong to the player.

**Home**

What it opens on: how far through each track you are, one ring per phase, a
Continue button pointing at the first thing you have not ticked, and the next
item in each of the other three tracks.

**Which pattern is this?**

The only page that points outward rather than inward, and the bands collapse
because it is a reference rather than a read. Every walkthrough answers how an
algorithm works. None of them answer which one
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

**Foundations**

| Topic | What it shows |
|---|---|
| Binary search | The live range halving, and where the insertion point lands on a miss |
| Hash maps | Two Sum in one pass, with the map filling as it goes |
| Group anagrams | Reducing each word to the one key its whole group shares |
| Two pointers | Pair sum on sorted data, one element eliminated per step |
| Sliding window | Longest substring with no repeat, window jumping rather than stepping |
| Kadane | The running best, and why starting it at zero breaks an all-negative row |
| Prefix sums | Subarray sum equals k, with the running total and its counts |
| Matrix | Rotate in place as transpose then reverse |
| Cyclic sort | The array as its own hash table |
| Monotonic stack | Daily temperatures, each index pushed once and popped once |
| Min stack | Two stacks the same height, so getMin is a single read |
| Linked lists | Reversal, with arrows flipping while the boxes stay put |
| LRU cache | Hash map and doubly linked list working together |

**Core algorithms**

| Topic | What it shows |
|---|---|
| The simple sorts | Bubble, selection, insertion, counting, bucket, radix, each with what it is actually for |
| Recursion | The call stack as two phases: nothing on the way down, everything on the way up |
| Backtracking | All subsets, on a decision tree that grows as it is explored |
| Iterative DFS | The same traversal with an explicit stack, and why the seen check moves to the pop |
| Merge sort | The merge buffer, and why `<=` keeps it stable |
| Quicksort | Partitioning in place, and the pivot choice that avoids the quadratic case |
| Quickselect | Partition, then discard a whole side |
| Counting inversions | The count falling out of a merge that was happening anyway |
| Binary search on the answer | The thing being halved is a range of answers nobody wrote down |
| Intervals | Merge overlapping, on a timeline, after sorting by start |

**Structures built on recursion**

| Topic | What it shows |
|---|---|
| Binary trees | Inorder traversal with the call stack, and why it comes out sorted |
| Heaps | Sift up and sift down, array and tree side by side |
| Heapify | Why building bottom-up is O(n) and inserting one at a time is not |
| Heapsort | n log n guaranteed, and the cache behaviour that still loses to quicksort |
| Tries | Words sharing prefixes, and why the end-of-word flag matters |
| BST delete | All three cases, including the two-children one |
| BFS | Shortest path on a grid, with the queue and the distance field |
| Topological sort | Kahn's algorithm, in-degrees draining, and cycle detection |
| Union-Find | Components merging, union by size, cycles rejected |
| Dijkstra | BFS with a priority queue, relaxation, and stale heap entries |
| Kruskal and Prim | The two minimum spanning trees, and the one line that separates them |

**Optimisation**

| Topic | What it shows |
|---|---|
| DP 1D | Coin change, each amount built from smaller ones |
| DP 2D | Edit distance, each cell reading its three neighbours |
| Knapsack | One yes-or-no per cell, and the two-item counterexample for why greed fails |
| Greedy | Jump game, tracking only the furthest reach |
| Bit manipulation | XOR cancelling pairs, shown bit by bit |
| Counting set bits | `n & (n - 1)`, one turn per set bit rather than per column |
| Sieve | Eratosthenes, and why it starts at p squared |
| Segment tree | One node per level on the way down, one repaired on the way back |
| KMP | The prefix table, and why the text pointer never moves backwards |
| Reservoir sampling | Uniform pick from a stream, seeded so runs repeat |

**The other sorts**

Quicksort, insertion, selection, bubble, heapsort, counting and radix. Each one
says where it is actually used and what it loses to.

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

## Running it

```
cd app
pnpm install
pnpm dev
```

Arrow keys step through a walkthrough, `j` and `k` move between pages, or use
the Back and Next buttons. On a phone the list is behind the menu button, the
step controls sit at the bottom of the screen, and the code panel starts closed.

`pnpm smoke` runs the checks: every trace, every curriculum prerequisite, every
label, every practice slug, every diagram. `deploy.sh` runs it before it
builds.

`app/README.md` covers how a walkthrough is built and how to add one.

## Deploying

```
./scripts/deploy.sh
```

Builds the app and force pushes `app/dist` to the `gh-pages` branch, which Pages
serves. The branch is build output only, so it carries no history. There is no CI
workflow because the local `gh` token has no `workflow` scope; if you add one with
`gh auth refresh -s workflow`, this becomes a GitHub Action instead.

### Moving to a custom domain

Two things have to change together, and `app/public/CNAME` is the single switch
for both. Create it holding the bare hostname, for example `swe.themos.dev`:

- Vite drops `base` from `/swe/` to `/`, because a custom domain serves the
  repo's Pages content from its root rather than from a subdirectory. Leaving
  the base alone would 404 every asset on the new hostname.
- The file is copied into `dist`, so it survives `deploy.sh` force pushing
  `gh-pages`. Pages writes its own `CNAME` when you set a custom domain in the
  repo settings, and the next deploy would delete it, dropping the domain.

The order that avoids a broken window:

1. Add the DNS record: `CNAME swe -> tkutsu.github.io`, proxy off, so GitHub can
   reach the origin to issue the certificate.
2. `gh api -X PUT repos/tkutsu/swe/pages -f cname=swe.themos.dev`
3. Create `app/public/CNAME`, then `./scripts/deploy.sh`.

The proxy can go back on once GitHub reports the certificate as issued.
