# SWE

Live at https://tkutsu.github.io/swe/

A step-through visualiser for a ranked list of interview algorithms, plus a bank
of concept questions and system design exercises.

- 30 ranked walkthroughs, one per item on the priority list
- 7 more sorts, since they get asked and compared against each other
- 103 concept questions, each with a diagram and an answer sized for a minute
- 13 guides: system design exercises and behavioural prep, grouped under Interview
- 2 reference pages: the pattern router and the complexity board
- 105 LeetCode problems, grouped by the pattern each one drills

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

## The pattern router

`src/lib/patterns.ts` holds the routing data and `PatternRouter.tsx` draws it:
three bands of cue to pattern, then the escalation ladders. It is the one page
with no checkbox, because a map is not something you finish.

Colour follows the same rule as everywhere else, which is why the two mapping
bands are grey. A cue either points at a pattern or it does not, so there is no
judgement to render, and colouring all 28 rows green would have said nothing.
The traps band is red. The ladders run red to amber to green, since there the
judgement is real: a brute force, a move with a catch, a move to land on.

Adding a cue is one entry in `bands`. Set `algoId` and the chip becomes a link
into the walkthrough; leave it off and it stays plain text, which is what you
want for a pattern with no page of its own, like Bellman-Ford or bitmask DP.

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
| `chart` | growth curves, where the shape is the argument |

A concept can carry several diagrams. ACID needs the transfer that motivates it
and the four letters; Big O needs the curve and the concrete numbers. Pass an
array and they stack with a rule between them.

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

## The way into a walkthrough

`src/lib/intros.ts` is keyed by algorithm id, the same way `conceptVisuals.ts`
is keyed by concept id, so the 37 algorithm files were not touched to add it.
Each entry is two fields. `scene` is the picture: physical, no jargon, nothing
you need to already know. `payoff` is what it buys, with a real number wherever
one exists, because "much faster" persuades nobody and "twenty guesses instead
of half a million" does.

It renders above the player. A step-by-step trace is only interesting once you
already want the answer, so the order on the page is picture, then cost, then
code.

## Practice problems

`src/lib/practice.ts` maps algorithm ids to LeetCode problems. Every slug is
copied verbatim from the `.txt` problem lists that ship with the NeetCode
courses in `_interview/_md/neetcode/`, which are files rather than transcribed
video, so the URLs are exact. Nothing was added from memory: a plausible slug
that 404s is worse than a short list, and 15 of the 37 algorithms have no
problems in the source and render no panel rather than a padded one.

The grouping is not NeetCode's. Theirs follows course sections, which put tries,
graphs and calendar bookings in one bucket. These are regrouped by the pattern
the problem actually drills, so the list sits under the walkthrough that taught
it.

## The complexity board

`src/lib/board.ts`, rendered by `BoardPage.tsx`, using the same table visual as
everywhere else. It deliberately does not repeat the growth curves or the "what
a million items costs" table, both of which already live on the Big O concept
page.
