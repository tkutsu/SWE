# Algos and Structs

Live at https://tkutsu.github.io/algos_structs/

A step-through visualiser for the priority list in `../list.md` (kept out of the
public repo). Thirty walkthroughs, one per item on the list.

```
pnpm install
pnpm dev
```

Arrow keys step, space plays. On a phone the list is behind the menu button and
the step controls sit at the bottom of the screen.

## How a walkthrough works

Every algorithm is a generator that yields `Frame`s. A frame is one teachable
moment:

```ts
yield {
  line: [5, 6],          // which lines of `code` are executing
  note: 'why this step',  // present tense, explains the reason not the mechanics
  views: [...],           // the data, as array / grid / tree / graph / list / map / stack
  vars: { lo, hi, mid },  // scalars for the watch panel
  result: '...',          // only on the last frame
}
```

The player runs the generator to completion up front and then scrubs through
the frames, so seeking backwards is free and the total step count is known.

## Views

| Kind | Used for |
|---|---|
| `array` | Sequences, pointers, windows, bit patterns |
| `grid` | Matrices, DP tables (with row and column headers), interval timelines |
| `tree` | Binary trees and heaps, laid out by inorder position |
| `graph` | Node-link diagrams at explicit positions: DAGs, weighted graphs, tries |
| `linked` | Linked lists, where `next` moves but boxes hold their slot |
| `map` | Hash maps and counters |
| `stack` | Call stacks, queues, output collections |

A frame can show several at once, which is how the heap shows array and tree
side by side.

## Adding one

1. Write `src/algorithms/<name>.ts` exporting an `Algorithm`. Copy
   `binarySearch.ts`, it is the shortest complete example.
2. Register it in `src/algorithms/index.ts`.
3. Set `algoId` on the matching row in `src/lib/roadmap.ts`.
4. Run the smoke test.

Each module also carries a `realWorld` line, shown in a callout above the
walkthrough. It should name a real system rather than a category: "git bisect"
and "chmod 755" land, "used in databases" does not. The smoke test enforces
this loosely by requiring a proper noun or a number.

Rules that keep the walkthroughs consistent:

- Yield a frame before an action and explain the reason, not after it with a
  description. The note is the teaching, the animation is the illustration.
- Use semantic `Role`s (`active`, `compare`, `excluded`, `match`) rather than
  colours. `components/views/roles.ts` and `views/svgColors.ts` are the only
  places that decide what a role looks like.
- Throw `Error` with a readable message on bad input. The UI shows it verbatim.
- Cap input size in the parser so a walkthrough never runs to thousands of
  unreadable frames.
- Layout is the algorithm's job for graphs. The view draws nodes where it is
  told, so each module picks a layout that suits its structure.

## Smoke test

```
node_modules/.pnpm/@esbuild+linux-x64@0.28.2/node_modules/@esbuild/linux-x64/bin/esbuild \
  scripts/smoke.ts --bundle --platform=node --format=esm --outfile=/tmp/smoke.mjs && node /tmp/smoke.mjs
```

Four sections. Traces: every algorithm terminates, sets a result, writes a real
note on every frame, and points only at lines that exist in its own `code`
string. Structure: no duplicate ranks or ids, every roadmap row resolves, no
orphaned algorithm, no thin prose, and every `realWorld` note names something
concrete. Bad input: 22 malformed inputs, each rejected
with a readable message rather than a crash. Answers: about 40 assertions on
what the algorithms actually compute, which is what catches a walkthrough that
animates smoothly and is wrong.
