# Algos and Structs

A step-through visualiser for the algorithms and data structures worth knowing
for a software engineering interview, ranked by how often they actually come up.

**[Open it](https://tkutsu.github.io/algos_structs/)**

Pick an item from the list, then walk the algorithm one step at a time. Each step
highlights the line of code that is running, draws the data, shows the live
variables, and says why this step happens rather than just what it does. All the
inputs are editable, so you can feed it the case you got wrong and watch it.

Eight walkthroughs so far, covering ranks 1 to 8:

| # | Topic | What it shows |
|---|---|---|
| 1 | Hash maps | Two Sum in one pass, with the map filling as it goes |
| 2 | Two pointers | Pair sum on sorted data, one element eliminated per step |
| 3 | Sliding window | Longest substring with no repeat, window jumping rather than stepping |
| 4 | Binary search | The live range halving, and where the insertion point ends up on a miss |
| 5 | BFS | Shortest path on a grid, with the queue and the distance field |
| 6 | Backtracking | All subsets, on a decision tree that grows as it is explored |
| 7 | Binary trees | Inorder traversal with the call stack, and why it comes out sorted |
| 8 | Heaps | Sift up and sift down, array and tree side by side |

The remaining 22 items are listed in the sidebar so the roadmap stays visible.

## Running it

```
cd app
pnpm install
pnpm dev
```

Arrow keys step, space plays. On a phone the list is behind the menu button and
the step controls sit at the bottom of the screen.

`app/README.md` covers how a walkthrough is built and how to add one.
