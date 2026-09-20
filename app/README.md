# SWE

Live at https://tkutsu.github.io/swe/

A step-through visualiser for a ranked list of interview algorithms, plus a bank
of concept questions and system design exercises.

- 30 ranked walkthroughs, one per item on the priority list
- 7 more sorts, since they get asked and compared against each other
- 103 concept questions, each with a diagram and an answer sized for a minute
- 9 guides: system design exercises and behavioural prep, grouped under Interview

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

## Concepts

`src/lib/concepts.ts` is generated, not written:

```
python3 scripts/build-concepts.py notes.md content/extra-concepts.md \
  --skip "Section Name"
```

Several sources merge in order, and groups with the same name combine. Concepts
written for this repo live in `content/extra-concepts.md`, so regenerating from
an external source never drops them.

## One bundle

Everything ships in a single chunk, about 190 kB gzipped. It was split at one
point, which halved the first load, but it cost a lazy registry, two index files
that could drift from the data they mirrored, loading states and a prefetcher.
On an app you open repeatedly from the same device the bundle is cached after
the first visit, so that machinery was buying very little. `vite.config.ts`
raises the chunk size warning rather than leaving it to fire on every build.

Point it at a markdown file using `##` for groups and `###` for questions. It
emits `src/lib/concepts.ts`. Edit the source, then regenerate.

Diagrams live in `src/lib/conceptVisuals.ts`, keyed by concept id so
regenerating never clobbers them. Eight shapes, each picked because it fits a
family of concepts rather than as a generic fallback:

| Shape | For |
|---|---|
| `compare` | every "X vs Y" question, which is a third of them |
| `flow` | boxes and arrows: prototype chains, request paths, N+1 |
| `table` | matrices: status codes, access modifiers, Big O growth |
| `timeline` | where ordering is the point: debounce, event loop, races |
| `boxes` | acronyms whose members are the content: SOLID, ACID |
| `stack` | layers: the render pipeline, cache tiers, the test pyramid |
| `venn` | SQL joins, rendered as four small diagrams |
| `triangle` | CAP, pick two of three |

Colour carries judgement, never decoration. `good` is the recommended default,
`accent` is situational or has a catch, `bad` is the trap, `neutral` is plain
information or two options with no winner, `muted` is superseded. A list where
every item shares one non-neutral tone is colour saying nothing, and the smoke
test fails on it. Each diagram renders a key for the tones it actually uses.

## Guides

`src/lib/guides.ts` is hand written, not generated. Design exercises,
System design exercises and behavioural prep. Each has a diagram using the same
`Visual` shapes as the concepts, and sections of either prose or bullets.

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
orphaned algorithm, no thin prose, every `realWorld` note names something
concrete, and no diagram uses colour as decoration. Bad input: 22 malformed inputs, each rejected
with a readable message rather than a crash. Answers: about 40 assertions on
what the algorithms actually compute, which is what catches a walkthrough that
animates smoothly and is wrong.
