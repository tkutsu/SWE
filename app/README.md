# Algos and Structs

A step-through visualiser for the priority list in `../list.md`. Pick an item,
watch the algorithm run one frame at a time, with the active line of code, the
data, the live variables and a sentence explaining why this step happens.

```
pnpm install
pnpm dev
```

Arrow keys step, space plays.

## How a walkthrough works

Every algorithm is a generator that yields `Frame`s. A frame is one teachable
moment:

```ts
yield {
  line: [5, 6],          // which lines of `code` are executing
  note: 'why this step',  // present tense, explains the reason not the mechanics
  views: [...],           // the data, as array / grid / tree / map / stack panels
  vars: { lo, hi, mid },  // scalars for the watch panel
  result: '...',          // only on the last frame
}
```

The player runs the generator to completion up front and then scrubs through
the frames, so seeking backwards is free and the total step count is known.

## Adding one

1. Write `src/algorithms/<name>.ts` exporting an `Algorithm`. Copy
   `binarySearch.ts`, it is the shortest complete example.
2. Register it in `src/algorithms/index.ts`.
3. Set `algoId` on the matching row in `src/lib/roadmap.ts` so the sidebar
   unlocks it.
4. Run the smoke test.

Rules that keep the walkthroughs consistent:

- Yield a frame before an action and explain the reason, not after it with a
  description. The note is the teaching, the animation is the illustration.
- Use semantic `Role`s (`active`, `compare`, `excluded`, `match`) rather than
  colours. `components/views/roles.ts` is the single place that decides what
  each role looks like.
- Throw `Error` with a readable message on bad input. The UI shows it verbatim.
- Cap input size in the parser so a walkthrough never runs to thousands of
  unreadable frames.

## Smoke test

Checks every algorithm terminates, sets a result, writes a real note on every
frame, points only at lines that exist in its own `code` string, and rejects
malformed input with a readable error. Then it checks the answers are actually
right: the heap extracts in sorted order, subsets of n elements gives 2^n
distinct results, inorder on a BST comes out sorted, binary search hits what is
present and misses what is not.

```
node_modules/.pnpm/@esbuild+linux-x64@0.28.2/node_modules/@esbuild/linux-x64/bin/esbuild \
  scripts/smoke.ts --bundle --platform=node --format=esm --outfile=/tmp/smoke.mjs && node /tmp/smoke.mjs
```

## Built so far

Tier 1 complete, ranks 1 through 8. The remaining 22 rows of the list are in the
sidebar marked "soon" so the roadmap stays visible.
