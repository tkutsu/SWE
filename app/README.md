# SWE

Live at https://tkutsu.github.io/swe/

A step-through visualiser for interview algorithms, plus a bank of concept
questions, system design exercises and the rest of a loop.

- 51 algorithm walkthroughs, each a generator you scrub through a frame at a time
- 119 concept questions, each with a diagram and an answer sized for a minute
- 35 guides: system design, object-oriented design, the other rounds, behavioural
- 2 reference pages: the pattern router and the complexity board
- 253 LeetCode problems, grouped by the pattern each one drills

```
pnpm install
pnpm dev
```

Arrow keys step through a walkthrough, `j` and `k` move between pages, or use
the Back and Next buttons. On a phone the list is behind the menu button, the
step controls sit at the bottom of the screen, and the code panel starts closed.

## Checks

```
pnpm smoke      # everything below
pnpm typecheck
pnpm labels     # regenerate labels.ts, lazy.ts and minutes.ts
```

`scripts/smoke.ts` is the only test and it runs in four sections.

Traces: every algorithm terminates, sets a result, writes a real note on every
frame, and points only at lines that exist in its own `code` string. It catches
a frame reference thrown off by the blank line between two functions, which is
not something you spot by reading.

Structure: no duplicate ids, no thin prose, every `realWorld` note names
something concrete, every concept has a diagram, no diagram uses colour as
decoration, every curriculum prerequisite is satisfied before it is used, every
high chance item has a hook, and the generated indexes agree with the data.

Bad input: 22 malformed inputs, each rejected with a readable message rather
than a crash.

Answers: about 40 assertions on what the algorithms actually compute, which is
what catches a walkthrough that animates smoothly and is wrong.

`scripts/deploy.sh` runs `pnpm smoke` before it builds, so a failing check stops
a deploy rather than shipping with it.

## How a walkthrough works

Every algorithm is a generator that yields `Frame`s. A frame is one teachable
moment:

```ts
yield {
  line: [5, 6],           // which lines of `code` are executing
  note: 'why this step',  // present tense, explains the reason not the mechanics
  views: [...],           // the data, as array / grid / tree / graph / list / map / stack
  vars: { lo, hi, mid },  // scalars for the watch panel
  result: '...',          // only on the last frame
}
```

The player runs the generator to completion up front and then scrubs through
the frames, so seeking backwards is free and the total step count is known.

| View kind | Used for |
|---|---|
| `array` | Sequences, pointers, windows, bit patterns |
| `grid` | Matrices, DP tables (with row and column headers), interval timelines |
| `tree` | Binary trees and heaps, laid out by inorder position |
| `graph` | Node-link diagrams at explicit positions: DAGs, weighted graphs, tries |
| `linked` | Linked lists, where `next` moves but boxes hold their slot |
| `map` | Hash maps and counters |
| `stack` | Call stacks, queues, output collections |

A frame can show several at once, which is how the heap shows array and tree
side by side. The legend under a visualisation lists only the roles that trace
actually produces, collected across all of its frames so it does not grow a new
key under you as you step.

### Adding one

1. Write `src/algorithms/<name>.ts` exporting an `Algorithm`. Copy
   `binarySearch.ts`, it is the shortest complete example.
2. Register it in `src/algorithms/index.ts`.
3. Place it in `src/lib/curriculum.ts`, with `needs` if it builds on something.
4. Add an entry to `src/lib/intros.ts`.
5. Run `pnpm labels`, then `pnpm smoke`.

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

## The way into a walkthrough

`src/lib/intros.ts` is keyed by algorithm id, the same way `conceptVisuals.ts`
is keyed by concept id, so the 51 algorithm modules were not touched to add it.
An entry has up to five fields:

- `scene`, the picture in words: physical, no jargon, nothing you need to
  already know.
- `payoff`, what it buys, with a real number wherever one exists, because "much
  faster" persuades nobody and "twenty guesses instead of half a million" does.
- `cost`, the same win as two numbers and a unit, drawn as two bars on a log
  scale. 39 of the 51 carry one. The other 12 are omitted on purpose: their win
  is correctness or memory shape rather than a count, and inventing a number to
  fill the panel would argue for something the page is not claiming.
- `visual` or `views`, an actual picture, using either the concept diagram
  shapes or the player's own view shapes. 14 carry one.

It renders above the player, and `realWorld` renders inside it under the scene,
because "git bisect is this" is a hook rather than a footnote. The order on the
page is hook, picture, then the walkthrough, then the cards, then practice. Time
and space complexity sit with "The idea" rather than under the title, since
complexity answers a question you have not asked yet on arrival.

## Reading order, and chance

`src/lib/curriculum.ts` is the single ordering for everything: 205 items in 31
topics, 9 phases and 4 tracks, every algorithm, concept and guide placed in
exactly one of them, each with a `chance` saying how likely it is to come up.

The order is the one the four primary books agree on rather than sorted by
frequency. Sorting by frequency is right for triage and wrong for learning: it
opened on hash maps and put recursion sixth, after four things that assume it.

Nothing may appear before something it needs. `needs` on an `Item` holds the
`kind:id` keys that have to come first, and `smoke.ts` fails when the list
contradicts one. That check exists because the order used to claim recursion
came before quicksort while listing quicksort eighty rows earlier, and nothing
was looking.

Frequency did not go away, it became a separate axis. Every row carries a
coloured dot, and the sidebar toggles between reading order and grouping by
chance. The dot palette is deliberately not the diagram tone palette, because
likelihood is not quality: it reads as heat, bright meaning spend time here.

The two reference pages are `MAPS`, outside the curriculum: pinned above the
list, no tick box, and skipped by Previous and Next. You do not finish a map.

## Navigation

The selection lives in the URL hash (`#/algo/two-pointers`), read on load and
written by `pick`, with a `hashchange` listener as the single path in. That
gives deep links, browser back and refresh for nothing, and needs no router
library on a gh-pages subdirectory with no server to rewrite 404s. The last page
is kept in `localStorage`, so a fresh tab resumes rather than starting over.

`src/lib/journey.ts` derives the track, phase and topic slices that the home
page and the sidebar read, rather than declaring them a second time.

## Concepts

`src/lib/concepts.ts` is generated and must not be edited directly:

```
python3 scripts/build-concepts.py ../../interview/concepts.md content/extra-concepts.md \
  --skip "Questions from my real interviews"
```

The first source lives outside this repo. The skip matters: that section holds
real questions with dates and companies, and `smoke.ts` fails the build if
anything specific to one person reaches the app. Concepts written for this repo
go in `content/extra-concepts.md`, and a `## Group` heading matching an existing
group merges into it rather than creating a second one.

A `>` blockquote directly under a `###` heading becomes that concept's hook, the
one concrete situation the page opens on. Hooks for concepts whose source does
not carry one yet live in `src/lib/conceptHooks.ts`, keyed by id, in the same
shape as `conceptVisuals.ts`. A hook in the source wins.

The answer is hidden behind a reveal, because an answer already on screen reads
as one you knew. There is a setting to always show it.

Diagrams live in `src/lib/conceptVisuals.ts`, keyed by concept id so
regenerating never clobbers them. Every concept needs one or the smoke test
fails: a concept without a diagram is a wall of text on a page whose whole point
is the picture.

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
array and they stack with a rule between them, under one tone key rather than
one each.

Colour carries judgement, never decoration. `good` is the recommended default,
`accent` is situational or has a catch, `bad` is the trap, `neutral` is plain
information or two options with no winner, `muted` is superseded. A list where
every item shares one non-neutral tone is colour saying nothing, and the smoke
test fails on it.

`src/lib/related.ts` says which pages read well next to each other, keyed by
concept id. Hand-written for the same reason the diagrams are, and checked:
every target has to resolve to something that exists.

## Guides

`src/lib/guides.ts` is hand written. System design exercises, object-oriented
design, the other rounds and behavioural prep. Each has a `hook`, a diagram
using the same `Visual` shapes as the concepts, and sections of prose or
bullets.

Sections collapse, with the first open, and the headings are hoisted into a
numbered strip above them. For the design exercises that strip is the method
itself, so it doubles as the thing worth memorising.

## The pattern router

`src/lib/patterns.ts` holds the routing data and `PatternRouter.tsx` draws it:
three bands of cue to pattern, then the escalation ladders. Bands collapse with
the first open, because it is a reference rather than a read.

Colour follows the same rule as everywhere else, which is why the two mapping
bands are grey. A cue either points at a pattern or it does not, so there is no
judgement to render, and colouring all 28 rows green would have said nothing.
The traps band is red. The ladders run red to amber to green, since there the
judgement is real: a brute force, a move with a catch, a move to land on.

Adding a cue is one entry in `bands`. Set `algoId` and the chip becomes a link
into the walkthrough; leave it off and it stays plain text, which is what you
want for a pattern with no page of its own, like Bellman-Ford or bitmask DP.

## The complexity board

`src/lib/board.ts`, rendered by `BoardPage.tsx`, using the same table visual as
everywhere else. It deliberately does not repeat the growth curves or the "what
a million items costs" table, both of which already live on the Big O concept
page.

## Practice problems

Two files, split by what kind of thing they hold.

`src/lib/practice.ts` is hand-written and holds the judgement: which problems
drill which pattern, in roughly increasing difficulty, and a note wherever the
pairing needs justifying. The grouping is by pattern rather than by the chapter
any course files it under, so Word Search II sits under tries rather than
backtracking, and the MST problems sit under Kruskal rather than union-find.

`src/lib/practiceMeta.ts` is generated and holds the facts: title, difficulty
and whether a problem is premium. Those are fetched rather than remembered,
because a remembered title goes stale and a remembered slug is occasionally just
wrong:

    python3 scripts/check-practice.py --write

It exits non-zero if a slug is not a real problem, and `smoke.ts` fails if a
slug has no metadata, so a dead link cannot ship. It also reports premium
problems, which are kept and marked rather than dropped, since several of them
are the canonical version of their pattern.

Both checks earn their place. The first run caught a slug written from memory as
`pow-x-n`, which is really `powx-n`, and four problems that have gone behind a
subscription since the course lists referencing them were written.

## Code splitting

Split per page with `React.lazy`, plus one chunk per algorithm. First load is
about 82 kB gzipped instead of 282, and opening a walkthrough costs about 3 kB
rather than all 51.

This was tried once and reverted, and the objections then were real: a
hand-maintained lazy registry, and index files that could drift from the data
they mirrored. Both are generated now, by `pnpm labels`:

- `src/lib/labels.ts`, the id-to-title map the sidebar needs so that naming 207
  things does not drag in every module that defines them.
- `src/algorithms/lazy.ts`, one dynamic import per algorithm, derived from the
  files themselves.
- `src/lib/minutes.ts`, a rough time per item: 8 seconds a frame for a
  walkthrough, 130 words a minute for everything else.

`smoke.ts` fails if any of the three disagrees with the data. The drift that
killed the first attempt is a failing check now rather than a risk.

`src/algorithms/index.ts` still exists and is still eager, because the scripts
want all 51 at once. Nothing in `src/` imports it.
