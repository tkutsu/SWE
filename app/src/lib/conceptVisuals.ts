import type { Visual } from './visual'

/**
 * Diagrams per concept, in whichever shape actually fits the idea. A concept
 * can carry more than one where a single picture cannot say it: ACID needs the
 * four letters and the transfer that motivates them.
 *
 * Keyed by concept id so regenerating concepts.ts never clobbers these.
 */
export const conceptVisuals: Record<string, Visual | Visual[]> = {
  // ---------------------------------------------------------------- OOP
  'what-is-oop': {
    kind: 'compare',
    columns: [
      {
        title: 'Procedural',
        sub: 'data and behaviour apart',
        tone: 'muted',
        rows: ['Loose functions', 'Data passed in and out', 'Anyone can change the data', 'Adding a field means touching every function'],
      },
      {
        title: 'Object oriented',
        sub: 'data and behaviour together',
        tone: 'good',
        rows: ['Objects own their state', 'Methods act on that state', 'Outside code goes through the interface', 'Adding a field is a local change'],
      },
    ],
    caption: 'The whole move is bundling: a ShoppingCart holds its own items and exposes add() and total(), so nobody outside can leave it in a broken state.',
  },
  'the-four-pillars': {
    kind: 'boxes',
    columns: 2,
    items: [
      { label: 'Encapsulation', detail: 'State is private, changed only through methods that keep it valid.', tone: 'neutral' },
      { label: 'Abstraction', detail: 'Expose what it does, hide how. The caller does not need the internals.', tone: 'neutral' },
      { label: 'Inheritance', detail: 'A subclass reuses and extends a parent. Powerful, and the easiest to overuse.', tone: 'accent' },
      { label: 'Polymorphism', detail: 'One call, many implementations. shape.area() works on any shape.', tone: 'neutral' },
    ],
    caption: 'If you can only remember two, remember encapsulation and polymorphism. They are the ones that still matter in codebases that avoid inheritance.',
  },
  'class-vs-object': {
    kind: 'flow',
    nodes: [
      { id: 'c', label: 'class User', sub: 'the blueprint', x: 0, y: 1, tone: 'accent' },
      { id: 'a', label: 'user A', sub: 'name: "Ada"', x: 1, y: 0, tone: 'good' },
      { id: 'b', label: 'user B', sub: 'name: "Linus"', x: 1, y: 1, tone: 'good' },
      { id: 'd', label: 'user C', sub: 'name: "Grace"', x: 1, y: 2, tone: 'good' },
    ],
    edges: [
      { from: 'c', to: 'a', label: 'new' },
      { from: 'c', to: 'b', label: 'new' },
      { from: 'c', to: 'd', label: 'new' },
    ],
    caption: 'One class, many objects. The class is written once and exists at compile time; the objects exist at runtime and each has its own state.',
  },
  'composition-vs-inheritance': {
    kind: 'flow',
    nodes: [
      { id: 'an', label: 'Animal', x: 0, y: 0, tone: 'muted' },
      { id: 'bi', label: 'Bird', x: 1, y: 0, tone: 'muted' },
      { id: 'du', label: 'Duck', x: 2, y: 0, tone: 'bad' },
      { id: 'd2', label: 'Duck', x: 0, y: 1, tone: 'good' },
      { id: 'sw', label: 'Swimmer', x: 1, y: 1, tone: 'good' },
      { id: 'fl', label: 'Flyer', x: 2, y: 1, tone: 'good' },
    ],
    edges: [
      { from: 'an', to: 'bi', label: 'is a', tone: 'muted' },
      { from: 'bi', to: 'du', label: 'is a', tone: 'muted' },
      { from: 'd2', to: 'sw', label: 'has a', tone: 'good' },
      { from: 'd2', to: 'fl', label: 'has a', tone: 'good' },
    ],
    caption: 'Top row is inheritance: Duck inherits everything Bird has, including things it does not want. Bottom is composition: Duck picks the behaviours it needs. Add a penguin that cannot fly and the top row breaks, the bottom row does not.',
  },
  'interface-vs-abstract-class': {
    kind: 'table',
    head: ['', 'Interface', 'Abstract class'],
    rows: [
      ['Holds state', { text: 'no', tone: 'bad' }, { text: 'yes', tone: 'good' }],
      ['Constructor', { text: 'no', tone: 'bad' }, { text: 'yes', tone: 'good' }],
      ['Method bodies', { text: 'usually not', tone: 'muted' }, { text: 'yes, shared code', tone: 'good' }],
      ['How many per class', { text: 'many', tone: 'good' }, { text: 'one', tone: 'bad' }],
      ['Says', 'this can do X', 'this is a kind of X'],
    ],
    caption: 'Interface for a capability several unrelated types share. Abstract class when they are genuinely the same kind of thing and you want to share real code.',
  },
  'overloading-vs-overriding': {
    kind: 'compare',
    columns: [
      {
        title: 'Overloading',
        sub: 'same name, different parameters',
        tone: 'accent',
        rows: ['Resolved at compile time', 'Same class', 'add(int, int) and add(float, float)', 'JavaScript does not have it'],
      },
      {
        title: 'Overriding',
        sub: 'same signature, different class',
        tone: 'good',
        rows: ['Resolved at runtime', 'Subclass replaces the parent version', 'Dog.speak() replaces Animal.speak()', 'This is what powers polymorphism'],
      },
    ],
    caption: 'The word that separates them is when. Overloading is decided while compiling, overriding while running, which is why only overriding can give you polymorphism.',
  },
  'is-javascript-object-oriented': {
    kind: 'flow',
    nodes: [
      { id: 'd', label: 'dog', sub: '{ name: "Rex" }', x: 0, y: 0, tone: 'good' },
      { id: 'p', label: 'Dog.prototype', sub: 'bark()', x: 1, y: 0, tone: 'accent' },
      { id: 'a', label: 'Animal.prototype', sub: 'eat()', x: 2, y: 0, tone: 'accent' },
      { id: 'o', label: 'Object.prototype', sub: 'toString()', x: 3, y: 0, tone: 'muted' },
      { id: 'n', label: 'null', x: 4, y: 0, tone: 'muted' },
    ],
    edges: [
      { from: 'd', to: 'p', label: '__proto__' },
      { from: 'p', to: 'a', label: '__proto__' },
      { from: 'a', to: 'o', label: '__proto__' },
      { from: 'o', to: 'n', tone: 'muted' },
    ],
    caption: 'Yes, but through prototypes rather than classes. dog.eat() is not found on dog, so the engine walks this chain until it finds it or hits null. The class keyword is syntax over exactly this.',
  },
  solid: {
    kind: 'boxes',
    columns: 1,
    items: [
      { label: 'S  Single responsibility', detail: 'One reason to change. A class that formats and saves has two.', tone: 'neutral' },
      { label: 'O  Open/closed', detail: 'Open to extension, closed to modification. Add a case without editing the switch.', tone: 'neutral' },
      { label: 'L  Liskov substitution', detail: 'A subclass must work anywhere the parent does. Square extends Rectangle breaks this.', tone: 'accent' },
      { label: 'I  Interface segregation', detail: 'Many small interfaces beat one fat one nobody fully implements.', tone: 'neutral' },
      { label: 'D  Dependency inversion', detail: 'Depend on an interface, not a concrete class. This is what makes testing possible.', tone: 'neutral' },
    ],
    caption: 'If asked for one with a real example, use D. Injecting a repository interface rather than newing up a database client is the difference between testable and not.',
  },
  'static-members': {
    kind: 'flow',
    nodes: [
      { id: 'c', label: 'class Counter', sub: 'static count = 3', x: 1, y: 0, tone: 'accent' },
      { id: 'a', label: 'instance a', sub: 'id: 1', x: 0, y: 1, tone: 'good' },
      { id: 'b', label: 'instance b', sub: 'id: 2', x: 1, y: 1, tone: 'good' },
      { id: 'd', label: 'instance c', sub: 'id: 3', x: 2, y: 1, tone: 'good' },
    ],
    edges: [
      { from: 'a', to: 'c', label: 'shared', dashed: true },
      { from: 'b', to: 'c', label: 'shared', dashed: true },
      { from: 'd', to: 'c', label: 'shared', dashed: true },
    ],
    caption: 'Static belongs to the class, instance fields belong to each object. There is exactly one count no matter how many instances exist, which is why static mutable state is a common source of bugs in concurrent code.',
  },
  'access-modifiers': {
    kind: 'table',
    head: ['Modifier', 'Same class', 'Subclass', 'Anywhere'],
    rows: [
      ['private', { text: 'yes', tone: 'good' }, { text: 'no', tone: 'bad' }, { text: 'no', tone: 'bad' }],
      ['protected', { text: 'yes', tone: 'good' }, { text: 'yes', tone: 'good' }, { text: 'no', tone: 'bad' }],
      ['public', { text: 'yes', tone: 'good' }, { text: 'yes', tone: 'good' }, { text: 'yes', tone: 'good' }],
    ],
    caption: 'Default to private and widen only when something outside genuinely needs it. Every public member is a promise you have to keep.',
  },

  // ------------------------------------------------ Functional programming
  'what-is-functional-programming': {
    kind: 'compare',
    columns: [
      {
        title: 'Imperative',
        sub: 'how to do it',
        tone: 'muted',
        rows: ['Loop with an index', 'Mutate an accumulator', 'Order of statements matters', 'total += items[i].price'],
      },
      {
        title: 'Functional',
        sub: 'what you want',
        tone: 'good',
        rows: ['map, filter, reduce', 'Build new values', 'Expressions compose', 'items.reduce((t, i) => t + i.price, 0)'],
      },
    ],
    caption: 'Functions are values, data is not mutated, and the same inputs always give the same output. Easier to test and to reason about concurrently, because there is no shared state to race over.',
  },
  'pure-function': {
    kind: 'flow',
    nodes: [
      { id: 'i', label: 'input', sub: '(2, 3)', x: 0, y: 0, tone: 'neutral' },
      { id: 'f', label: 'add(a, b)', sub: 'pure', x: 1, y: 0, tone: 'good' },
      { id: 'o', label: 'output', sub: '5, always', x: 2, y: 0, tone: 'good' },
      { id: 'w', label: 'outside world', sub: 'db, clock, random', x: 1, y: 1, tone: 'bad' },
    ],
    edges: [
      { from: 'i', to: 'f' },
      { from: 'f', to: 'o', tone: 'good' },
      { from: 'f', to: 'w', label: 'never', tone: 'bad', dashed: true },
    ],
    caption: 'Two rules: same input gives the same output, and nothing outside changes. Date.now(), Math.random(), a database read and a console.log all break purity, which is why pure functions are the easy ones to test.',
  },
  immutability: {
    kind: 'flow',
    nodes: [
      { id: 'a', label: 'original', sub: '[1, 2, 3]', x: 0, y: 0, tone: 'accent' },
      { id: 'm', label: '.map(x => x * 2)', x: 1, y: 0, tone: 'neutral' },
      { id: 'b', label: 'new array', sub: '[2, 4, 6]', x: 2, y: 0, tone: 'good' },
      { id: 'u', label: 'original', sub: 'still [1, 2, 3]', x: 0, y: 1, tone: 'accent' },
    ],
    edges: [
      { from: 'a', to: 'm' },
      { from: 'm', to: 'b', tone: 'good' },
      { from: 'a', to: 'u', label: 'unchanged', dashed: true, tone: 'accent' },
    ],
    caption: 'Never change data in place, produce a new value instead. This is what lets React compare by reference to decide whether to re-render, and what makes undo and time travel debugging possible.',
  },
  'higher-order-functions-and-currying': {
    kind: 'flow',
    nodes: [
      { id: 'a', label: 'add(2)', x: 0, y: 0, tone: 'accent' },
      { id: 'b', label: 'returns', sub: 'b => 2 + b', x: 1, y: 0, tone: 'good' },
      { id: 'c', label: 'call it (3)', x: 2, y: 0, tone: 'neutral' },
      { id: 'd', label: '5', x: 3, y: 0, tone: 'good' },
    ],
    edges: [
      { from: 'a', to: 'b' },
      { from: 'b', to: 'c' },
      { from: 'c', to: 'd', tone: 'good' },
    ],
    caption: 'A higher-order function takes or returns a function: map, filter and every React hook that takes a callback. Currying is the specific case of taking arguments one at a time, so add(2) becomes a reusable "add two to things" function.',
  },
  'oop-vs-fp': {
    kind: 'compare',
    columns: [
      {
        title: 'OOP',
        sub: 'organise around things',
        tone: 'neutral',
        rows: ['State lives inside objects', 'Behaviour attached to data', 'Easy to add new types', 'Harder to add new operations'],
      },
      {
        title: 'FP',
        sub: 'organise around transformations',
        tone: 'neutral',
        rows: ['State passed through', 'Data and behaviour separate', 'Easy to add new operations', 'Harder to add new types'],
      },
    ],
    caption: 'Not a war, and most real code is both. React is the clearest example: components are functions, state is immutable, but the app is still modelled as a tree of things.',
  },

  // --------------------------------------------- JavaScript and TypeScript
  'var-vs-let-vs-const': {
    kind: 'table',
    head: ['', 'var', 'let', 'const'],
    rows: [
      ['Scope', { text: 'function', tone: 'bad' }, { text: 'block', tone: 'good' }, { text: 'block', tone: 'good' }],
      ['Reassign', { text: 'yes', tone: 'neutral' }, { text: 'yes', tone: 'neutral' }, { text: 'no', tone: 'good' }],
      ['Redeclare', { text: 'yes', tone: 'bad' }, { text: 'no', tone: 'good' }, { text: 'no', tone: 'good' }],
      ['Before declaration', { text: 'undefined', tone: 'bad' }, { text: 'throws', tone: 'good' }, { text: 'throws', tone: 'good' }],
    ],
    caption: 'const by default, let when it genuinely changes, var never. Note const freezes the binding, not the value: a const object can still have its fields changed.',
  },
  hoisting: {
    kind: 'compare',
    columns: [
      {
        title: 'What you wrote',
        tone: 'neutral',
        rows: ['console.log(a)', 'var a = 1', 'greet()', 'function greet() {}'],
      },
      {
        title: 'What the engine sees',
        tone: 'accent',
        rows: ['var a = undefined', 'function greet() {}', 'console.log(a)   // undefined', 'a = 1', 'greet()   // works'],
      },
    ],
    caption: 'Declarations are registered before any code runs. var is initialised to undefined; function declarations are fully available. let and const are registered too but stay in the temporal dead zone, so touching them early throws rather than silently giving undefined.',
  },
  closures: {
    kind: 'flow',
    nodes: [
      { id: 'o', label: 'makeCounter()', sub: 'let count = 0', x: 0, y: 0, tone: 'accent' },
      { id: 'i', label: 'inner fn', sub: 'count++', x: 1, y: 0, tone: 'good' },
      { id: 'r', label: 'returned', sub: 'outlives the call', x: 2, y: 0, tone: 'good' },
      { id: 'c', label: 'count lives on', sub: 'not garbage collected', x: 1, y: 1, tone: 'accent' },
    ],
    edges: [
      { from: 'o', to: 'i', label: 'defines' },
      { from: 'i', to: 'r' },
      { from: 'i', to: 'c', label: 'still references', tone: 'accent', dashed: true },
    ],
    caption: 'A function remembers the scope it was created in, even after that scope has returned. The variable cannot be collected because the inner function still points at it. This is how private state, once-only initialisers and every React hook work.',
  },
  'how-does-this-work': {
    kind: 'table',
    head: ['How it is called', 'What this is'],
    rows: [
      ['obj.method()', { text: 'obj', tone: 'good' }],
      ['plainFn()', { text: 'undefined in strict mode, globalThis otherwise', tone: 'bad' }],
      ['new Thing()', { text: 'the new object', tone: 'good' }],
      ['fn.call(x) / apply / bind', { text: 'x, explicitly', tone: 'good' }],
      ['arrow function', { text: 'whatever this was where it was written', tone: 'accent' }],
    ],
    caption: 'In normal functions this is set by the call, not by where the function was defined, which is why a method passed as a callback loses it. Arrow functions have no this of their own, so they inherit it, which is the usual fix.',
  },
  'event-loop': {
    kind: 'flow',
    nodes: [
      { id: 's', label: 'call stack', sub: 'runs to completion', x: 0, y: 0, tone: 'accent' },
      { id: 'w', label: 'Web APIs', sub: 'timers, fetch', x: 1, y: 0, tone: 'neutral' },
      { id: 'mi', label: 'microtasks', sub: 'promises', x: 1, y: 1, tone: 'good' },
      { id: 'ma', label: 'macrotasks', sub: 'setTimeout', x: 2, y: 1, tone: 'muted' },
      { id: 'l', label: 'event loop', sub: 'stack empty?', x: 0, y: 1, tone: 'accent' },
    ],
    edges: [
      { from: 's', to: 'w', label: 'hand off' },
      { from: 'w', to: 'ma', label: 'when done' },
      { from: 'w', to: 'mi', label: 'resolved' },
      { from: 'mi', to: 'l', label: 'drained first', tone: 'good' },
      { from: 'ma', to: 'l', label: 'then one', tone: 'muted' },
      { from: 'l', to: 's', label: 'push', tone: 'accent' },
    ],
    caption: 'JavaScript runs one thing at a time. When the stack empties, the loop drains every microtask before taking a single macrotask, which is why a promise callback always beats a setTimeout(0) queued at the same moment.',
  },
  'promises-vs-async-await': [
    {
      kind: 'compare',
      columns: [
        {
          title: '.then chains',
          tone: 'neutral',
          rows: ['Explicit callbacks', 'Errors via .catch', 'Nesting gets deep fast', 'Parallel work reads naturally'],
        },
        {
          title: 'async / await',
          tone: 'good',
          rows: ['Reads top to bottom', 'Errors via try/catch', 'Flat and easy to follow', 'Easy to serialise by accident'],
        },
      ],
      caption: 'Same machinery, different syntax. Nothing about await makes code slower, but it makes one specific mistake very easy to write.',
    },
    {
      kind: 'timeline',
      span: 100,
      lanes: [
        {
          label: 'await in a loop',
          events: [
            { at: 0, label: 'A', tone: 'bad', width: 28 },
            { at: 30, label: 'B', tone: 'bad', width: 28 },
            { at: 60, label: 'C', tone: 'bad', width: 28 },
          ],
        },
        { label: 'Promise.all  A', events: [{ at: 0, label: 'A', tone: 'good', width: 28 }] },
        { label: 'B', events: [{ at: 0, label: 'B', tone: 'good', width: 28 }] },
        { label: 'C', events: [{ at: 0, label: 'C', tone: 'good', width: 28 }] },
      ],
      caption:
        'Three independent requests. Awaiting each one inside a loop makes them queue, so three 300ms calls take 900ms. Promise.all starts all three and waits once, so it takes 300ms. This is the single most common performance bug written with await.',
    },
  ],
  'equality-vs-strict-equality': {
    kind: 'table',
    head: ['Comparison', '==', '==='],
    rows: [
      ["0 == '0'", { text: 'true', tone: 'bad' }, { text: 'false', tone: 'good' }],
      ['null == undefined', { text: 'true', tone: 'accent' }, { text: 'false', tone: 'good' }],
      ["'' == 0", { text: 'true', tone: 'bad' }, { text: 'false', tone: 'good' }],
      ['NaN === NaN', { text: 'false', tone: 'bad' }, { text: 'false', tone: 'bad' }],
      ['[] == false', { text: 'true', tone: 'bad' }, { text: 'false', tone: 'good' }],
    ],
    caption: 'Always ===. The one accepted use of == is x == null, which catches both null and undefined in a single check. NaN is equal to nothing including itself, so use Number.isNaN.',
  },
  'null-vs-undefined': {
    kind: 'compare',
    columns: [
      {
        title: 'undefined',
        sub: 'the language did it',
        tone: 'muted',
        rows: ['Declared but never assigned', 'A missing function argument', 'A property that does not exist', 'A function with no return'],
      },
      {
        title: 'null',
        sub: 'you did it',
        tone: 'accent',
        rows: ['Deliberately empty', 'Cleared on purpose', 'Most JSON APIs send null, never undefined', 'typeof null is "object", a famous bug'],
      },
    ],
    caption: 'Pick one for absence in your own code and be consistent. The useful distinction is intent: undefined usually means nobody set it, null means someone set it to nothing.',
  },
  'prototypal-inheritance': {
    kind: 'flow',
    nodes: [
      { id: 'o', label: 'obj.toString()', sub: 'not here', x: 0, y: 0, tone: 'bad' },
      { id: 'p', label: 'its prototype', sub: 'not here either', x: 1, y: 0, tone: 'bad' },
      { id: 'op', label: 'Object.prototype', sub: 'found it', x: 2, y: 0, tone: 'good' },
      { id: 'n', label: 'null', sub: 'would be undefined', x: 3, y: 0, tone: 'muted' },
    ],
    edges: [
      { from: 'o', to: 'p', label: 'miss', tone: 'bad' },
      { from: 'p', to: 'op', label: 'miss', tone: 'bad' },
      { from: 'op', to: 'n', label: 'stops here', tone: 'muted', dashed: true },
    ],
    caption: 'Property lookup walks the chain until it finds the name or reaches null. Classical inheritance copies from a blueprint; this delegates at lookup time, which is why changing a prototype affects every object already linked to it.',
  },
  'shallow-vs-deep-copy': {
    kind: 'flow',
    nodes: [
      { id: 'a', label: 'original', sub: '{ user: {...} }', x: 0, y: 0, tone: 'accent' },
      { id: 's', label: 'shallow copy', sub: '{ ...original }', x: 1, y: 0, tone: 'bad' },
      { id: 'n', label: 'same nested object', sub: 'shared, mutating it hits both', x: 2, y: 0, tone: 'bad' },
      { id: 'd', label: 'deep copy', sub: 'structuredClone()', x: 1, y: 1, tone: 'good' },
      { id: 'n2', label: 'its own nested copy', sub: 'fully independent', x: 2, y: 1, tone: 'good' },
    ],
    edges: [
      { from: 'a', to: 's' },
      { from: 's', to: 'n', label: 'points to', tone: 'bad' },
      { from: 'a', to: 'n', label: 'points to', tone: 'bad', dashed: true },
      { from: 'a', to: 'd' },
      { from: 'd', to: 'n2', tone: 'good' },
    ],
    caption: 'Spread and Object.assign copy one level. Nested objects are still shared, which is the bug where editing a copy silently changes the original. structuredClone does a real deep copy without the JSON round trip, which loses dates, functions and undefined.',
  },
  'debounce-vs-throttle': {
    kind: 'timeline',
    span: 100,
    lanes: [
      {
        label: 'keystrokes',
        events: [
          { at: 2, label: '', tone: 'neutral' },
          { at: 10, label: '', tone: 'neutral' },
          { at: 18, label: '', tone: 'neutral' },
          { at: 26, label: '', tone: 'neutral' },
          { at: 60, label: '', tone: 'neutral' },
          { at: 68, label: '', tone: 'neutral' },
        ],
      },
      {
        label: 'debounced',
        events: [
          { at: 44, label: 'fire', tone: 'good' },
          { at: 86, label: 'fire', tone: 'good' },
        ],
      },
      {
        label: 'throttled',
        events: [
          { at: 2, label: 'fire', tone: 'accent' },
          { at: 32, label: 'fire', tone: 'accent' },
          { at: 62, label: 'fire', tone: 'accent' },
          { at: 92, label: 'fire', tone: 'accent' },
        ],
      },
    ],
    caption: 'Debounce waits for the noise to stop, then fires once. Throttle fires at a steady maximum rate while the noise continues. Search-as-you-type wants debounce; scroll and resize handlers want throttle.',
  },
  'bubbling-capturing-delegation': {
    kind: 'flow',
    nodes: [
      { id: 'd', label: 'document', x: 0, y: 0, tone: 'accent' },
      { id: 'u', label: 'ul', sub: 'one listener here', x: 0, y: 1, tone: 'good' },
      { id: 'l', label: 'li', x: 0, y: 2, tone: 'neutral' },
      { id: 'b', label: 'button', sub: 'clicked', x: 0, y: 3, tone: 'accent' },
    ],
    edges: [
      { from: 'd', to: 'u', label: 'capture', tone: 'muted', dashed: true },
      { from: 'u', to: 'l', label: 'capture', tone: 'muted', dashed: true },
      { from: 'b', to: 'l', label: 'bubble', tone: 'good' },
      { from: 'l', to: 'u', label: 'bubble', tone: 'good' },
    ],
    caption: 'An event travels down from the document to the target, then back up. Handlers run on the way up by default. Delegation puts one listener on the ul instead of one per li, which keeps working when rows are added later.',
  },
  'typescript-interface-vs-type': {
    kind: 'table',
    head: ['', 'interface', 'type'],
    rows: [
      ['Object shapes', { text: 'yes', tone: 'good' }, { text: 'yes', tone: 'good' }],
      ['Unions', { text: 'no', tone: 'bad' }, { text: 'yes', tone: 'good' }],
      ['Primitives, tuples', { text: 'no', tone: 'bad' }, { text: 'yes', tone: 'good' }],
      ['Declaration merging', { text: 'yes', tone: 'accent' }, { text: 'no', tone: 'muted' }],
      ['Extends', 'extends', '& intersection'],
    ],
    caption: 'Mostly interchangeable for plain object shapes. type is strictly more capable because of unions; interface can be reopened and added to, which is what makes it the right choice for augmenting third-party library types.',
  },
  'any-vs-unknown-vs-never': {
    kind: 'table',
    head: ['', 'Assign anything to it', 'Use it without checking', 'Means'],
    rows: [
      ['any', { text: 'yes', tone: 'bad' }, { text: 'yes', tone: 'bad' }, 'type checking off'],
      ['unknown', { text: 'yes', tone: 'good' }, { text: 'no', tone: 'good' }, 'narrow it first'],
      ['never', { text: 'no', tone: 'accent' }, { text: 'n/a', tone: 'muted' }, 'cannot happen'],
    ],
    caption: 'unknown is the safe any: it accepts anything but forces you to narrow before use. never is what a function that always throws returns, and it is how you get the compiler to prove a switch is exhaustive.',
  },
  generics: {
    kind: 'flow',
    nodes: [
      { id: 'g', label: 'Box<T>', sub: 'written once', x: 0, y: 1, tone: 'accent' },
      { id: 's', label: 'Box<string>', x: 1, y: 0, tone: 'good' },
      { id: 'n', label: 'Box<number>', x: 1, y: 1, tone: 'good' },
      { id: 'u', label: 'Box<User>', x: 1, y: 2, tone: 'good' },
    ],
    edges: [
      { from: 'g', to: 's' },
      { from: 'g', to: 'n' },
      { from: 'g', to: 'u' },
    ],
    caption: 'One implementation, many concrete types, with the relationship between input and output preserved. identity<T>(x: T): T says the return type matches the argument, which any would throw away.',
  },

  // -------------------------------------------------------------- React
  'virtual-dom-and-reconciliation': {
    kind: 'flow',
    nodes: [
      { id: 's', label: 'state changes', x: 0, y: 0, tone: 'accent' },
      { id: 'n', label: 'new tree', sub: 'plain objects', x: 1, y: 0, tone: 'neutral' },
      { id: 'd', label: 'diff', sub: 'against previous', x: 2, y: 0, tone: 'neutral' },
      { id: 'p', label: 'patch the DOM', sub: 'only what changed', x: 3, y: 0, tone: 'good' },
    ],
    edges: [
      { from: 's', to: 'n', label: 'render' },
      { from: 'n', to: 'd' },
      { from: 'd', to: 'p', label: 'commit', tone: 'good' },
    ],
    caption: 'Rendering builds a cheap object tree, not real DOM. Comparing two trees is fast; touching the real DOM is slow, so React does as little of it as possible. The virtual DOM is not fast in itself, it is a way of doing less.',
  },
  'why-do-keys-matter': [
    {
      kind: 'table',
      head: ['Row', 'index key before', 'index key after inserting Z at the front', 'id key'],
      rows: [
        ['Z (new)', { text: '-', tone: 'muted' }, { text: '0', tone: 'neutral' }, { text: 'z1', tone: 'neutral' }],
        ['A', '0', { text: '1  changed', tone: 'bad' }, { text: 'a1  same', tone: 'good' }],
        ['B', '1', { text: '2  changed', tone: 'bad' }, { text: 'b1  same', tone: 'good' }],
        ['C', '2', { text: '3  changed', tone: 'bad' }, { text: 'c1  same', tone: 'good' }],
      ],
      caption:
        'Insert one row at the front. With index keys every existing row gets a new key, so React believes all four rows changed and rebuilds them. With stable ids only Z is new, and A, B and C are left alone.',
    },
    {
      kind: 'compare',
      columns: [
        {
          title: 'What breaks',
          tone: 'bad',
          rows: ['State attaches to the wrong row', 'Text typed into an input jumps', 'Animations restart', 'Four DOM rebuilds instead of one insertion'],
        },
        {
          title: 'When index keys are fine',
          tone: 'neutral',
          rows: ['The list never reorders', 'Nothing is ever inserted or removed', 'Items have no state of their own', 'Rarer than people assume'],
        },
      ],
      caption: 'Keys tell React which element is which between renders. They are identity, not position, which is exactly what an index is not.',
    },
  ],
  'state-vs-props': {
    kind: 'flow',
    nodes: [
      { id: 'p', label: 'Parent', sub: 'owns the state', x: 0, y: 0, tone: 'accent' },
      { id: 'c', label: 'Child', sub: 'receives props', x: 1, y: 0, tone: 'good' },
      { id: 'g', label: 'Grandchild', sub: 'receives props', x: 2, y: 0, tone: 'good' },
    ],
    edges: [
      { from: 'p', to: 'c', label: 'props down' },
      { from: 'c', to: 'g', label: 'props down' },
      { from: 'g', to: 'p', label: 'events up', tone: 'accent', dashed: true },
    ],
    caption: 'Props come in from above and are read only. State is owned and changed by the component itself. Data flows down, events flow up, and when two siblings need the same value you lift it to their nearest common parent.',
  },
  'when-does-a-component-re-render': {
    kind: 'boxes',
    columns: 2,
    items: [
      { label: 'Its state changed', detail: 'A setState call with a different value.', tone: 'good' },
      { label: 'Its parent re-rendered', detail: 'By default children re-render too, props changed or not.', tone: 'accent' },
      { label: 'A context it reads changed', detail: 'Every consumer of that context re-renders.', tone: 'accent' },
      { label: 'Not because a prop mutated', detail: 'Mutating an object in place changes nothing React can see.', tone: 'bad' },
    ],
    caption: 'Re-rendering is not the same as touching the DOM. A re-render produces a new tree; if the diff is empty the DOM is untouched, which is why most re-renders are cheap and premature memoisation is usually wasted.',
  },
  useeffect: {
    kind: 'timeline',
    span: 100,
    lanes: [
      { label: 'render', events: [{ at: 2, label: 'build tree', tone: 'neutral', width: 18 }] },
      { label: 'commit', events: [{ at: 24, label: 'DOM updated', tone: 'accent', width: 16 }] },
      { label: 'paint', events: [{ at: 44, label: 'user sees it', tone: 'good', width: 14 }] },
      { label: 'effect', events: [{ at: 62, label: 'runs after paint', tone: 'good', width: 22 }] },
      { label: 'cleanup', events: [{ at: 86, label: 'before next', tone: 'bad', width: 13 }] },
    ],
    caption: 'Effects run after the browser paints, so they never block what the user sees. Cleanup runs before the next effect and on unmount, which is how you cancel a request or remove a listener. Effects are for synchronising with something outside React, not for deriving values.',
  },
  'usememo-usecallback-react-memo': {
    kind: 'table',
    head: ['', 'Caches', 'Use when'],
    rows: [
      ['useMemo', 'a computed value', 'the computation is genuinely expensive, or the identity feeds a dependency array'],
      ['useCallback', 'a function identity', 'passing a callback to a memoised child or a dependency array'],
      ['React.memo', 'a whole component render', 'the component is expensive and its props rarely change'],
    ],
    caption: 'All three cost memory and add a comparison. Applied everywhere they make code harder to read and often slower. Measure with the profiler first; the usual real problem is a parent re-rendering too often, not a child rendering too slowly.',
  },
  'controlled-vs-uncontrolled-inputs': {
    kind: 'compare',
    columns: [
      {
        title: 'Controlled',
        sub: 'React owns the value',
        tone: 'good',
        rows: ['value={state} plus onChange', 'Validate and format as they type', 'Re-renders on every keystroke', 'The default choice'],
      },
      {
        title: 'Uncontrolled',
        sub: 'the DOM owns the value',
        tone: 'accent',
        rows: ['defaultValue plus a ref', 'Read it when you submit', 'No re-render per keystroke', 'File inputs must be this'],
      },
    ],
    caption: 'Controlled unless you have a reason. The reason is usually a very large form where per-keystroke re-renders measurably hurt, or a file input, which the browser will not let you set.',
  },
  'context-vs-a-state-library': {
    kind: 'compare',
    columns: [
      {
        title: 'Context',
        sub: 'built in',
        tone: 'good',
        rows: ['Solves prop drilling', 'Best for rarely changing values', 'Theme, locale, current user', 'Every consumer re-renders on change'],
      },
      {
        title: 'State library',
        sub: 'Zustand, Redux, Jotai',
        tone: 'accent',
        rows: ['Selective subscriptions', 'Built for frequent updates', 'Devtools and middleware', 'Another dependency to justify'],
      },
    ],
    caption: 'Context is a dependency injection mechanism, not a state manager. It has no way to let a component subscribe to part of a value, so a fast-changing context re-renders every consumer. And for server data, a fetching library like React Query is usually the real answer.',
  },
  'are-state-updates-synchronous': {
    kind: 'timeline',
    span: 100,
    lanes: [
      {
        label: 'handler',
        events: [
          { at: 2, label: 'setCount(1)', tone: 'neutral' },
          { at: 20, label: 'setCount(2)', tone: 'neutral' },
          { at: 38, label: 'read count', tone: 'bad' },
        ],
      },
      { label: 'batched', events: [{ at: 2, label: 'queued together', tone: 'accent', width: 52 }] },
      { label: 're-render', events: [{ at: 62, label: 'one render with the new value', tone: 'good', width: 34 }] },
    ],
    caption: 'No. Updates are queued and batched, then applied once. Reading the state variable straight after setting it gives the old value, because that variable is a const captured by this render. Use the updater form when the next value depends on the previous one.',
  },
  'custom-hooks-and-rules-of-hooks': {
    kind: 'boxes',
    columns: 1,
    items: [
      { label: 'Call hooks at the top level', detail: 'Never inside conditions, loops or nested functions.', tone: 'neutral' },
      { label: 'Only from components or other hooks', detail: 'Not from plain functions or class components.', tone: 'neutral' },
      { label: 'Why: React tracks them by call order', detail: 'Hook state is stored in a list per component. A conditional call shifts every hook after it onto the wrong slot.', tone: 'accent' },
      { label: 'A custom hook is just a function calling hooks', detail: 'Name it useSomething. It shares logic, never state, so two components calling it get separate state.', tone: 'neutral' },
    ],
    caption: 'The order rule is not arbitrary. There is no name attached to a useState call, only its position, so the order has to be identical on every render.',
  },
  'csr-vs-ssr-vs-ssg-and-hydration': {
    kind: 'compare',
    columns: [
      {
        title: 'CSR',
        sub: 'rendered in the browser',
        tone: 'muted',
        rows: ['Empty HTML then JS', 'Slowest first paint', 'Weakest for SEO', 'Simplest to deploy'],
      },
      {
        title: 'SSR',
        sub: 'rendered per request',
        tone: 'neutral',
        rows: ['HTML arrives filled in', 'Good for personalised pages', 'Needs a running server', 'Then hydrates'],
      },
      {
        title: 'SSG',
        sub: 'rendered at build time',
        tone: 'neutral',
        rows: ['Fastest, served from a CDN', 'Best for content that rarely changes', 'Rebuild to update', 'Then hydrates'],
      },
    ],
    caption: 'Hydration is the step after SSR and SSG: React walks the server HTML and attaches event handlers so it becomes interactive. A hydration mismatch means the server and client rendered different markup, which is why Date.now() or random values in render cause warnings.',
  },
  'server-components': {
    kind: 'compare',
    columns: [
      {
        title: 'Server component',
        tone: 'good',
        rows: ['Runs only on the server', 'Can query the database directly', 'Ships zero JS to the browser', 'No state, no effects, no event handlers'],
      },
      {
        title: 'Client component',
        sub: "'use client'",
        tone: 'accent',
        rows: ['Runs in the browser', 'State, effects, handlers', 'Ships its JS to the client', 'Can be imported by a server component'],
      },
    ],
    caption: 'The point is bundle size and data access. A server component can await a query inline with no API route and no loading state, and its own code never reaches the browser. The boundary is one way: client components cannot import server ones.',
  },
  'error-boundaries': {
    kind: 'flow',
    nodes: [
      { id: 'b', label: 'ErrorBoundary', x: 0, y: 0, tone: 'good' },
      { id: 'c', label: 'Child', sub: 'throws while rendering', x: 1, y: 0, tone: 'bad' },
      { id: 'f', label: 'fallback UI', sub: 'rest of the app survives', x: 0, y: 1, tone: 'good' },
    ],
    edges: [
      { from: 'b', to: 'c', label: 'renders' },
      { from: 'c', to: 'b', label: 'throws', tone: 'bad' },
      { from: 'b', to: 'f', label: 'renders instead', tone: 'good' },
    ],
    caption: 'Without one, an error during render unmounts the entire tree and the user gets a blank page. Boundaries only catch errors in rendering, lifecycle and constructors below them. They do not catch event handlers, async code or errors in the boundary itself.',
  },

  // ----------------------------------------------------- Web and browser
  'what-happens-when-you-type-a-url-and-press-enter': {
    kind: 'flow',
    nodes: [
      { id: 'u', label: 'URL parsed', x: 0, y: 0, tone: 'neutral' },
      { id: 'd', label: 'DNS', sub: 'name to IP', x: 1, y: 0, tone: 'accent' },
      { id: 't', label: 'TCP', sub: '3-way handshake', x: 2, y: 0, tone: 'accent' },
      { id: 's', label: 'TLS', sub: 'certificate, keys', x: 3, y: 0, tone: 'accent' },
      { id: 'r', label: 'HTTP request', x: 0, y: 1, tone: 'good' },
      { id: 'h', label: 'HTML arrives', x: 1, y: 1, tone: 'good' },
      { id: 'p', label: 'parse, fetch CSS/JS', x: 2, y: 1, tone: 'good' },
      { id: 'v', label: 'render', sub: 'layout, paint', x: 3, y: 1, tone: 'good' },
    ],
    edges: [
      { from: 'u', to: 'd' },
      { from: 'd', to: 't' },
      { from: 't', to: 's' },
      { from: 's', to: 'r', dashed: true },
      { from: 'r', to: 'h' },
      { from: 'h', to: 'p' },
      { from: 'p', to: 'v', tone: 'good' },
    ],
    caption: 'The classic breadth question. Nobody expects every detail, they want to see how far your mental model goes and whether you can go deep on any one box when asked. Caches short-circuit several of these steps.',
  },
  'http-methods-and-idempotency': {
    kind: 'table',
    head: ['Method', 'Safe', 'Idempotent', 'Meaning'],
    rows: [
      ['GET', { text: 'yes', tone: 'good' }, { text: 'yes', tone: 'good' }, 'read, changes nothing'],
      ['PUT', { text: 'no', tone: 'bad' }, { text: 'yes', tone: 'good' }, 'replace with this exact state'],
      ['DELETE', { text: 'no', tone: 'bad' }, { text: 'yes', tone: 'good' }, 'gone after one or ten calls'],
      ['POST', { text: 'no', tone: 'bad' }, { text: 'no', tone: 'bad' }, 'create, twice makes two'],
      ['PATCH', { text: 'no', tone: 'bad' }, { text: 'usually not', tone: 'bad' }, 'partial update'],
    ],
    caption: 'Idempotent means calling it repeatedly leaves the same state, which is what makes a retry safe. That is exactly why a flaky network can double-charge a POST, and why payment APIs ask for an idempotency key.',
  },
  'status-codes': {
    kind: 'table',
    head: ['Class', 'Means', 'Ones to know'],
    rows: [
      ['2xx', { text: 'worked', tone: 'good' }, '200 OK, 201 Created, 204 No Content'],
      ['3xx', { text: 'go elsewhere', tone: 'accent' }, '301 permanent, 302 temporary, 304 Not Modified'],
      ['4xx', { text: 'your fault', tone: 'bad' }, '400, 401 unauthenticated, 403 forbidden, 404, 409 conflict, 429 rate limited'],
      ['5xx', { text: 'my fault', tone: 'bad' }, '500, 502 bad gateway, 503 unavailable, 504 timeout'],
    ],
    caption: 'The pair that catches people out is 401 and 403. 401 means we do not know who you are, so log in. 403 means we know exactly who you are and you still cannot have it.',
  },
  'rest-vs-graphql': {
    kind: 'compare',
    columns: [
      {
        title: 'REST',
        tone: 'good',
        rows: ['Many endpoints, one shape each', 'Over- and under-fetching', 'HTTP caching works out of the box', 'Trivial to debug in a browser'],
      },
      {
        title: 'GraphQL',
        tone: 'accent',
        rows: ['One endpoint, client picks fields', 'Exactly the data asked for', 'Caching is your problem', 'Needs care against expensive queries'],
      },
    ],
    caption: 'GraphQL earns its keep with many different clients needing different slices of the same graph. For one web app and one team, REST is usually less machinery for the same result.',
  },
  'cookies-vs-localstorage-vs-sessionstorage': {
    kind: 'table',
    head: ['', 'Sent to server', 'Survives close', 'Size', 'JS can read'],
    rows: [
      ['Cookie', { text: 'yes, every request', tone: 'accent' }, 'until expiry', '~4 KB', { text: 'not if HttpOnly', tone: 'good' }],
      ['localStorage', { text: 'no', tone: 'good' }, { text: 'yes', tone: 'good' }, '~5 MB', { text: 'yes', tone: 'bad' }],
      ['sessionStorage', { text: 'no', tone: 'good' }, { text: 'no, per tab', tone: 'accent' }, '~5 MB', { text: 'yes', tone: 'bad' }],
    ],
    caption: 'Tokens belong in an HttpOnly, Secure, SameSite cookie. Putting one in localStorage means any XSS on the page can read it and walk away with the session.',
  },
  cors: {
    kind: 'flow',
    nodes: [
      { id: 'b', label: 'browser', sub: 'app.com', x: 0, y: 0, tone: 'neutral' },
      { id: 'p', label: 'OPTIONS', sub: 'preflight', x: 1, y: 0, tone: 'accent' },
      { id: 's', label: 'api.com', x: 2, y: 0, tone: 'neutral' },
      { id: 'h', label: 'Allow-Origin header', x: 2, y: 1, tone: 'good' },
      { id: 'r', label: 'real request', x: 1, y: 1, tone: 'good' },
    ],
    edges: [
      { from: 'b', to: 'p' },
      { from: 'p', to: 's', label: 'may I?' },
      { from: 's', to: 'h', tone: 'good' },
      { from: 'h', to: 'r', label: 'yes', tone: 'good' },
      { from: 'r', to: 'b', tone: 'good' },
    ],
    caption: 'CORS is the browser relaxing the same-origin policy, not a server security feature. The server was reached either way; the browser simply refuses to hand the response to your JavaScript without permission headers. A CORS error is fixed on the server, never in the client.',
  },
  'xss-and-csrf': {
    kind: 'compare',
    columns: [
      {
        title: 'XSS',
        sub: 'attacker runs JS on your page',
        tone: 'bad',
        rows: ['Injected script executes as your site', 'Reads tokens, rewrites the DOM', 'Fix: escape output, never innerHTML with user data', 'Fix: Content-Security-Policy'],
      },
      {
        title: 'CSRF',
        sub: 'attacker makes your browser act',
        tone: 'bad',
        rows: ['Another site triggers a request', 'Your cookie rides along automatically', 'Fix: SameSite cookies', 'Fix: anti-CSRF token'],
      },
    ],
    caption: 'The clean one-liner: XSS abuses the trust a user has in your site, CSRF abuses the trust your site has in the user. XSS is the more dangerous of the two, because it defeats most CSRF defences as well.',
  },
  'authentication-vs-authorization-sessions-vs-jwt': {
    kind: 'compare',
    columns: [
      {
        title: 'Session',
        sub: 'server remembers',
        tone: 'good',
        rows: ['ID in a cookie, state in the store', 'Revoke instantly', 'Needs a shared store to scale', 'Boring and safe'],
      },
      {
        title: 'JWT',
        sub: 'token carries the claims',
        tone: 'accent',
        rows: ['Signed, verified without a lookup', 'Stateless, easy across services', 'Cannot be revoked before expiry', 'Keep it short lived plus a refresh token'],
      },
    ],
    caption: 'Authentication is who you are, authorisation is what you may do. The JWT trap is treating it as a session: it stays valid until it expires, so logout and ban need either short lifetimes or a denylist, which quietly reintroduces the state you removed.',
  },
  'reflow-vs-repaint': {
    kind: 'stack',
    layers: [
      { label: 'JavaScript', detail: 'changes styles or the DOM', tone: 'neutral' },
      { label: 'Style', detail: 'work out which rules apply', tone: 'neutral' },
      { label: 'Layout (reflow)', detail: 'geometry: width, height, position. Expensive.', tone: 'bad' },
      { label: 'Paint (repaint)', detail: 'pixels: colour, shadow, visibility. Cheaper.', tone: 'accent' },
      { label: 'Composite', detail: 'transform and opacity only. GPU, cheapest.', tone: 'good' },
    ],
    caption: 'Changing geometry restarts the pipeline from layout. Changing colour restarts from paint. Animating transform and opacity skips both and runs on the compositor, which is why those two are the ones that stay at 60fps.',
  },
  'core-web-vitals': {
    kind: 'table',
    head: ['Metric', 'Measures', 'Good'],
    rows: [
      ['LCP', 'largest element painted', { text: 'under 2.5s', tone: 'good' }],
      ['INP', 'responsiveness to interaction', { text: 'under 200ms', tone: 'good' }],
      ['CLS', 'unexpected layout shift', { text: 'under 0.1', tone: 'good' }],
    ],
    caption: 'Loading, interactivity, visual stability. CLS is the one with the obvious fix: set width and height on images and reserve space for anything that loads late, so content stops jumping under the reader.',
  },
  'http-caching': {
    kind: 'flow',
    nodes: [
      { id: 'b', label: 'browser', x: 0, y: 0, tone: 'neutral' },
      { id: 'c', label: 'cache', sub: 'still fresh?', x: 1, y: 0, tone: 'accent' },
      { id: 'u', label: 'use it', sub: 'no request at all', x: 2, y: 0, tone: 'good' },
      { id: 's', label: 'ask server', sub: 'If-None-Match', x: 1, y: 1, tone: 'neutral' },
      { id: 'n', label: '304 Not Modified', sub: 'no body sent', x: 2, y: 1, tone: 'good' },
    ],
    edges: [
      { from: 'b', to: 'c' },
      { from: 'c', to: 'u', label: 'within max-age', tone: 'good' },
      { from: 'c', to: 's', label: 'stale' },
      { from: 's', to: 'n', label: 'ETag matches', tone: 'good' },
    ],
    caption: 'Cache-Control max-age avoids the request entirely. ETag and Last-Modified still cost a round trip but avoid re-sending the body. The standard pattern is immutable long-lived caching on hashed asset filenames and no-cache on the HTML that references them.',
  },
  'polling-vs-sse-vs-websockets': {
    kind: 'timeline',
    span: 100,
    lanes: [
      {
        label: 'polling',
        events: [
          { at: 2, label: 'req', tone: 'muted' },
          { at: 22, label: 'req', tone: 'muted' },
          { at: 42, label: 'req', tone: 'bad' },
          { at: 62, label: 'req', tone: 'muted' },
          { at: 82, label: 'req', tone: 'muted' },
        ],
      },
      { label: 'SSE', events: [{ at: 2, label: 'one long connection, server pushes', tone: 'good', width: 92 }] },
      { label: 'WebSocket', events: [{ at: 2, label: 'one connection, both directions', tone: 'accent', width: 92 }] },
    ],
    caption: 'Polling asks repeatedly and mostly gets nothing back, which is simple and wasteful. SSE is one-way server push over plain HTTP with automatic reconnect. WebSockets are full duplex, and the right answer only when the client also needs to send constantly, as in chat or multiplayer.',
  },
  'http-2-and-http-3': {
    kind: 'compare',
    columns: [
      {
        title: 'HTTP/1.1',
        tone: 'muted',
        rows: ['One request at a time per connection', 'Browsers opened six connections', 'Sprites and concatenation were the workaround'],
      },
      {
        title: 'HTTP/2',
        tone: 'neutral',
        rows: ['Multiplexed over one connection', 'Header compression', 'Still TCP, so one lost packet stalls every stream'],
      },
      {
        title: 'HTTP/3',
        tone: 'good',
        rows: ['QUIC over UDP', 'Head-of-line blocking gone', 'Faster handshake, survives network switches'],
      },
    ],
    caption: 'The practical consequence: bundling everything into one file was a workaround for HTTP/1.1 and can now hurt, because many small cacheable files parallelise fine and invalidate independently.',
  },
  'accessibility-basics': {
    kind: 'boxes',
    columns: 2,
    items: [
      { label: 'Semantic HTML first', detail: 'A real button is focusable, clickable by keyboard and announced correctly. A div with onClick is none of those.', tone: 'good' },
      { label: 'Keyboard reachable', detail: 'Everything interactive works with tab and enter, with a visible focus ring.', tone: 'neutral' },
      { label: 'Labels and alt text', detail: 'Every input needs a label, every meaningful image needs alt.', tone: 'neutral' },
      { label: 'Contrast and motion', detail: '4.5:1 for body text, and respect prefers-reduced-motion.', tone: 'neutral' },
      { label: 'ARIA last', detail: 'Only when no native element does the job. Wrong ARIA is worse than none.', tone: 'accent' },
      { label: 'Test it', detail: 'Tab through the page, run axe, try a screen reader once.', tone: 'neutral' },
    ],
    caption: 'Most of accessibility is using the right element. The frameworks make it easy to reach for a div, and that single habit causes the majority of real failures.',
  },

  // -------------------------------------------------------- CS fundamentals
  'big-o': [
    {
      kind: 'chart',
      xLabel: 'input size',
      yLabel: 'work',
      // One shared vertical scale, clipped at the top of the chart. Each curve
      // used to be normalised to its own maximum, which drew O(n squared)
      // below O(n log n) for nine tenths of the x axis: exactly backwards, and
      // worse than no chart for anyone who learns from the picture. Here the
      // steep ones run off the top early, which is the thing being taught.
      series: [
        { label: 'O(1)', tone: 'good', points: [[0, 0.042], [1, 0.042]] },
        { label: 'O(log n)', tone: 'good', points: [[0, 0], [0.083, 0.042], [0.167, 0.083], [0.333, 0.125], [0.667, 0.167], [1, 0.191]] },
        { label: 'O(n)', tone: 'neutral', points: [[0, 0], [1, 1]] },
        { label: 'O(n log n)', tone: 'accent', points: [[0, 0], [0.083, 0.083], [0.167, 0.333], [0.25, 0.646], [0.333, 1]] },
        { label: 'O(n\u00b2)', tone: 'bad', points: [[0, 0], [0.083, 0.167], [0.125, 0.375], [0.167, 0.667], [0.204, 1]] },
      ],
      caption:
        'All five are drawn against the same vertical scale, so a curve that stops has run off the top of the chart rather than levelled off. O(n squared) leaves first, then O(n log n); O(n) only reaches the top at the far right, and the two flat ones never get near it. Below a certain input size all of them are fine and the constants decide, which is why an O(n squared) algorithm can be the right answer on twenty elements.',
    },
    {
      kind: 'table',
      head: ['Growth', 'n = 1,000,000', 'Typical of'],
      rows: [
        ['O(1)', { text: '1 step', tone: 'good' }, 'hash lookup, array index'],
        ['O(log n)', { text: '~20 steps', tone: 'good' }, 'binary search, balanced tree'],
        ['O(n)', { text: '1 million', tone: 'neutral' }, 'one scan'],
        ['O(n log n)', { text: '~20 million', tone: 'accent' }, 'good sorting'],
        ['O(n squared)', { text: '1 trillion', tone: 'bad' }, 'nested loops over the same data'],
        ['O(2^n)', { text: 'hopeless', tone: 'bad' }, 'unmemoised recursion over subsets'],
      ],
      caption:
        'It describes how runtime grows, not how fast it is. Constants are dropped, so an O(n) with a big constant can lose to an O(n log n) on small inputs. Always say the space complexity too, unprompted.',
    },
  ],
  'array-vs-linked-list': [
    {
      kind: 'flow',
      nodes: [
        { id: 'a0', label: '10', sub: '0x100', x: 0, y: 0, tone: 'good' },
        { id: 'a1', label: '20', sub: '0x104', x: 1, y: 0, tone: 'good' },
        { id: 'a2', label: '30', sub: '0x108', x: 2, y: 0, tone: 'good' },
        { id: 'a3', label: '40', sub: '0x10c', x: 3, y: 0, tone: 'good' },
        { id: 'l0', label: '10', sub: '0x8f2', x: 0, y: 1, tone: 'accent' },
        { id: 'l1', label: '20', sub: '0x41a', x: 1, y: 1, tone: 'accent' },
        { id: 'l2', label: '30', sub: '0xbc7', x: 2, y: 1, tone: 'accent' },
        { id: 'l3', label: '40', sub: '0x203', x: 3, y: 1, tone: 'accent' },
      ],
      edges: [
        { from: 'l0', to: 'l1', label: 'next' },
        { from: 'l1', to: 'l2', label: 'next' },
        { from: 'l2', to: 'l3', label: 'next' },
      ],
      caption:
        'Top row is an array: addresses run consecutively, so index 3 is one multiplication away and the CPU prefetches the neighbours for free. Bottom row is a linked list: the same values scattered across memory, reachable only by following pointers, and every hop is a possible cache miss.',
    },
    {
      kind: 'table',
      head: ['', 'Array', 'Linked list'],
      rows: [
        ['Index access', { text: 'O(1)', tone: 'good' }, { text: 'O(n)', tone: 'bad' }],
        ['Insert at front', { text: 'O(n)', tone: 'bad' }, { text: 'O(1)', tone: 'good' }],
        ['Insert given the node', { text: 'O(n)', tone: 'bad' }, { text: 'O(1)', tone: 'good' }],
        ['Memory', { text: 'contiguous', tone: 'good' }, { text: 'scattered, plus pointers', tone: 'bad' }],
        ['Cache behaviour', { text: 'excellent', tone: 'good' }, { text: 'poor', tone: 'bad' }],
      ],
      caption:
        'The table says linked lists win at insertion, and in practice arrays usually win anyway because of the picture above. Linked lists earn their place when you already hold the node, as in an LRU cache.',
    },
  ],
  'how-does-a-hash-map-work': [
    {
      kind: 'flow',
      nodes: [
        { id: 'k', label: '"name"', sub: 'key', x: 0, y: 0, tone: 'neutral' },
        { id: 'h', label: 'hash()', sub: 'to an integer', x: 1, y: 0, tone: 'accent' },
        { id: 'm', label: '% 4 buckets', sub: 'index 3', x: 2, y: 0, tone: 'accent' },
        { id: 'b', label: 'bucket 3', x: 3, y: 0, tone: 'good' },
      ],
      edges: [
        { from: 'k', to: 'h' },
        { from: 'h', to: 'm' },
        { from: 'm', to: 'b', tone: 'good' },
      ],
      caption: 'Hash the key to an integer, reduce it to a bucket index, store it there. Lookup repeats the same arithmetic, which is why it costs the same whether there are ten keys or ten million.',
    },
    {
      kind: 'table',
      head: ['Bucket', 'Contents'],
      rows: [
        ['0', { text: 'empty', tone: 'muted' }],
        ['1', '"age" -> 30'],
        ['2', { text: 'empty', tone: 'muted' }],
        ['3', { text: '"name" -> Ada  ->  "city" -> Athens', tone: 'bad' }],
      ],
      caption:
        'Two keys hashing to the same bucket is a collision, and bucket 3 has one. The entries are chained, so a lookup there walks a short list and compares keys. O(1) average, O(n) if every key collides. When the table gets too full it resizes and rehashes everything, which is why one unlucky insert is occasionally slow.',
    },
  ],
  'stack-vs-queue': [
    {
      kind: 'flow',
      nodes: [
        { id: 'sop', label: 'push / pop', sub: 'same end', x: 1, y: 0, tone: 'accent' },
        { id: 's3', label: '3', sub: 'top', x: 0, y: 0, tone: 'good' },
        { id: 's2', label: '2', x: 0, y: 1, tone: 'neutral' },
        { id: 's1', label: '1', sub: 'bottom', x: 0, y: 2, tone: 'neutral' },
        { id: 'qout', label: 'dequeue', x: 2, y: 3, tone: 'accent' },
        { id: 'q1', label: '1', sub: 'front', x: 3, y: 3, tone: 'good' },
        { id: 'q2', label: '2', x: 4, y: 3, tone: 'neutral' },
        { id: 'q3', label: '3', sub: 'back', x: 5, y: 3, tone: 'neutral' },
        { id: 'qin', label: 'enqueue', x: 6, y: 3, tone: 'accent' },
      ],
      edges: [
        { from: 'sop', to: 's3', tone: 'accent' },
        { from: 's3', to: 's2', tone: 'muted', dashed: true },
        { from: 's2', to: 's1', tone: 'muted', dashed: true },
        { from: 'q1', to: 'qout', tone: 'accent' },
        { from: 'qin', to: 'q3', tone: 'accent' },
      ],
      caption:
        'A stack is touched at one end only, so the last thing in is the first out. A queue is touched at both, so the first in is the first out. That single difference is the whole distinction, and it is what decides whether a graph traversal goes deep or wide.',
    },
    {
      kind: 'compare',
      columns: [
        {
          title: 'Stack',
          sub: 'LIFO',
          tone: 'neutral',
          rows: ['Call stack, undo, back button', 'DFS uses one', 'Matching brackets', 'Recursion is a stack you did not write'],
        },
        {
          title: 'Queue',
          sub: 'FIFO',
          tone: 'neutral',
          rows: ['Job queues, print spooling', 'BFS uses one', 'Rate limiting buffers', 'Anything that must stay fair'],
        },
      ],
      caption: 'Neither is better. They answer different questions: most recent, or longest waiting.',
    },
  ],
  'trees-graphs-bfs-vs-dfs': {
    kind: 'compare',
    columns: [
      {
        title: 'BFS',
        sub: 'queue',
        tone: 'neutral',
        rows: ['Explores level by level', 'Finds the shortest unweighted path', 'Memory grows with the width', 'Level order, flood fill'],
      },
      {
        title: 'DFS',
        sub: 'stack or recursion',
        tone: 'neutral',
        rows: ['Goes deep before wide', 'Does not give shortest paths', 'Memory grows with the depth', 'Cycle detection, topological sort, backtracking'],
      },
    ],
    caption: 'A tree is a graph with no cycles and one path between any two nodes. On a general graph both need a visited set, and forgetting it is how you get an infinite loop.',
  },
  recursion: {
    kind: 'flow',
    nodes: [
      { id: 'a', label: 'fact(3)', sub: '3 * fact(2)', x: 0, y: 0, tone: 'accent' },
      { id: 'b', label: 'fact(2)', sub: '2 * fact(1)', x: 1, y: 0, tone: 'accent' },
      { id: 'c', label: 'fact(1)', sub: 'base case, 1', x: 2, y: 0, tone: 'good' },
      { id: 'd', label: 'returns 2', x: 1, y: 1, tone: 'good' },
      { id: 'e', label: 'returns 6', x: 0, y: 1, tone: 'good' },
    ],
    edges: [
      { from: 'a', to: 'b', label: 'calls' },
      { from: 'b', to: 'c', label: 'calls' },
      { from: 'c', to: 'd', label: 'unwinds', tone: 'good' },
      { from: 'd', to: 'e', tone: 'good' },
    ],
    caption: 'A function calling itself on a smaller input, with a base case that stops it. Every pending call sits on the stack, so depth costs memory and too much of it overflows. Any recursion can be rewritten with an explicit stack, which is what you do when the depth could be large.',
  },
  'process-vs-thread': {
    kind: 'compare',
    columns: [
      {
        title: 'Process',
        tone: 'neutral',
        rows: ['Own memory space', 'Isolated, a crash stays local', 'Expensive to create', 'Talks via IPC, sockets, pipes'],
      },
      {
        title: 'Thread',
        tone: 'accent',
        rows: ['Shares memory with its siblings', 'A crash can take the process down', 'Cheap to create and switch', 'Talks via shared variables, needs locks'],
      },
    ],
    caption: 'Shared memory is exactly why threads are fast and why they are dangerous. Browser tabs are separate processes so one bad page cannot take the browser with it.',
  },
  'concurrency-vs-parallelism': {
    kind: 'timeline',
    span: 100,
    lanes: [
      {
        label: 'concurrent',
        events: [
          { at: 0, label: 'A', tone: 'accent', width: 16 },
          { at: 18, label: 'B', tone: 'good', width: 16 },
          { at: 36, label: 'A', tone: 'accent', width: 16 },
          { at: 54, label: 'B', tone: 'good', width: 16 },
          { at: 72, label: 'A', tone: 'accent', width: 24 },
        ],
      },
      { label: 'parallel, core 1', events: [{ at: 0, label: 'A', tone: 'accent', width: 48 }] },
      { label: 'parallel, core 2', events: [{ at: 0, label: 'B', tone: 'good', width: 48 }] },
    ],
    caption: 'Concurrency is dealing with many things at once by interleaving; parallelism is doing many things at once on separate cores. Single threaded JavaScript is concurrent and not parallel, which is why async helps with waiting on IO and does nothing for heavy computation.',
  },
  'race-conditions-and-deadlocks': [
    {
      kind: 'timeline',
      span: 100,
      lanes: [
        {
          label: 'thread A',
          events: [
            { at: 2, label: 'read 10', tone: 'neutral' },
            { at: 46, label: 'write 11', tone: 'bad' },
          ],
        },
        {
          label: 'thread B',
          events: [
            { at: 20, label: 'read 10', tone: 'neutral' },
            { at: 66, label: 'write 11', tone: 'bad' },
          ],
        },
        { label: 'expected', events: [{ at: 66, label: 'should be 12', tone: 'good' }] },
      ],
      caption: 'A race: two increments, one lost, because both read before either wrote. A lock around read-modify-write fixes it.',
    },
    {
      kind: 'flow',
      nodes: [
        { id: 'a', label: 'thread A', sub: 'holds X', x: 0, y: 0, tone: 'accent' },
        { id: 'y', label: 'lock Y', x: 1, y: 0, tone: 'bad' },
        { id: 'b', label: 'thread B', sub: 'holds Y', x: 1, y: 1, tone: 'accent' },
        { id: 'x', label: 'lock X', x: 0, y: 1, tone: 'bad' },
      ],
      edges: [
        { from: 'a', to: 'y', label: 'waits for', tone: 'bad' },
        { from: 'b', to: 'x', label: 'waits for', tone: 'bad' },
      ],
      caption:
        'A deadlock is the opposite failure, and it is a cycle: each thread holds what the other needs and neither will let go. Break the cycle by always acquiring locks in the same global order, so no two threads can ever hold them in opposite orders.',
    },
  ],
  'sql-vs-nosql': {
    kind: 'compare',
    columns: [
      {
        title: 'SQL',
        sub: 'Postgres, MySQL',
        tone: 'good',
        rows: ['Fixed schema, related tables', 'Joins and strong transactions', 'Scales up, and out with effort', 'Default unless you have a reason'],
      },
      {
        title: 'NoSQL',
        sub: 'Mongo, Redis, Cassandra',
        tone: 'accent',
        rows: ['Flexible or no schema', 'Weak joins, often weaker consistency', 'Designed to scale out', 'Document, key-value, wide-column, graph'],
      },
    ],
    caption: 'For a typical app the answer is Postgres. It does JSON columns when you want flexibility and it gives you real transactions, so the usual reasons for reaching past it have mostly evaporated.',
  },
  indexes: {
    kind: 'flow',
    nodes: [
      { id: 'q', label: 'WHERE email = ?', x: 0, y: 0, tone: 'neutral' },
      { id: 'r', label: 'B-tree root', x: 1, y: 0, tone: 'accent' },
      { id: 'b', label: 'branch', x: 2, y: 0, tone: 'accent' },
      { id: 'l', label: 'leaf', sub: 'row pointer', x: 3, y: 0, tone: 'accent' },
      { id: 'w', label: 'the row', x: 4, y: 0, tone: 'good' },
      { id: 's', label: 'no index', sub: 'scan every row', x: 1, y: 1, tone: 'bad' },
    ],
    edges: [
      { from: 'q', to: 'r' },
      { from: 'r', to: 'b' },
      { from: 'b', to: 'l' },
      { from: 'l', to: 'w', tone: 'good' },
      { from: 'q', to: 's', label: 'otherwise', tone: 'bad', dashed: true },
    ],
    caption: 'Like the index at the back of a book. A handful of hops instead of reading every page. The cost is that every write must update the index too, and the index takes storage, so index the columns you filter, join and sort on, and no more.',
  },
  acid: [
    {
      kind: 'flow',
      nodes: [
        { id: 'b', label: 'BEGIN', x: 0, y: 0, tone: 'neutral' },
        { id: 'd', label: 'debit A', sub: '-100', x: 1, y: 0, tone: 'accent' },
        { id: 'c', label: 'crash', sub: 'power cut', x: 2, y: 0, tone: 'bad' },
        { id: 'r', label: 'ROLLBACK', sub: 'as if nothing happened', x: 3, y: 0, tone: 'good' },
        { id: 'c2', label: 'credit B', sub: '+100', x: 2, y: 1, tone: 'accent' },
        { id: 'k', label: 'COMMIT', sub: 'survives a crash', x: 3, y: 1, tone: 'good' },
      ],
      edges: [
        { from: 'b', to: 'd' },
        { from: 'd', to: 'c', label: 'if it fails', tone: 'bad' },
        { from: 'c', to: 'r', tone: 'good' },
        { from: 'd', to: 'c2', label: 'if it works' },
        { from: 'c2', to: 'k', tone: 'good' },
      ],
      caption:
        'The bank transfer is the example to reach for. The money must never sit in neither account, so a failure halfway has to undo the debit entirely. And while this is running, nobody else may read a balance that reflects only half of it.',
    },
    {
      kind: 'boxes',
      columns: 2,
      items: [
        { label: 'A  Atomicity', detail: 'All of it happens, or none. The rollback above.', tone: 'neutral' },
        { label: 'C  Consistency', detail: 'Constraints hold before and after. No negative balance.', tone: 'neutral' },
        { label: 'I  Isolation', detail: 'Nobody else sees the half-finished state.', tone: 'neutral' },
        { label: 'D  Durability', detail: 'Once committed it is on disk and survives the crash.', tone: 'neutral' },
      ],
      caption:
        'Isolation is the one with levels, and read committed is the common default. If asked to go deeper, that is where to go: dirty reads, non-repeatable reads, phantoms.',
    },
  ],
  'normalization-vs-denormalization': [
    {
      kind: 'table',
      head: ['order_id', 'customer_id', 'customer_name', 'customer_city'],
      rows: [
        ['1', '7', { text: 'Ada', tone: 'bad' }, { text: 'Athens', tone: 'bad' }],
        ['2', '7', { text: 'Ada', tone: 'bad' }, { text: 'Athens', tone: 'bad' }],
        ['3', '7', { text: 'Ada', tone: 'bad' }, { text: 'Athens', tone: 'bad' }],
      ],
      caption:
        'Denormalised: the customer name is copied into every order, so reading an order needs no join. Now Ada moves city. You must find and update every row, and if you miss one the database disagrees with itself. Normalised, the city lives once in a customers table and the orders point at it.',
    },
    {
      kind: 'compare',
      columns: [
        { title: 'Normalised', sub: 'each fact once', tone: 'good', rows: ['No update anomalies', 'Smaller storage', 'Reads need joins', 'The correct default'] },
        { title: 'Denormalised', sub: 'deliberate duplication', tone: 'accent', rows: ['Reads skip the joins', 'Faster read-heavy paths', 'Updates must touch every copy', 'Only after measuring'] },
      ],
      caption: 'Normalise by default, denormalise where you have measured a read problem you cannot fix another way.',
    },
  ],
  joins: {
    kind: 'venn',
    left: 'A',
    right: 'B',
    variants: [
      { label: 'INNER', both: true },
      { label: 'LEFT', leftOnly: true, both: true },
      { label: 'RIGHT', rightOnly: true, both: true },
      { label: 'FULL', leftOnly: true, both: true, rightOnly: true },
    ],
    caption: 'INNER keeps only rows that matched in both. LEFT keeps every row of A, filling nulls where B had no match, which is what you want for "all users and their orders, including users with none". Those nulls are why a WHERE on a LEFT joined column quietly turns it back into an INNER join.',
  },
  'the-n-1-query-problem': {
    kind: 'flow',
    nodes: [
      { id: 'q', label: '1 query', sub: 'get 100 posts', x: 0, y: 0, tone: 'neutral' },
      { id: 'n', label: '100 more', sub: 'author for each', x: 1, y: 0, tone: 'bad' },
      { id: 't', label: '101 round trips', x: 2, y: 0, tone: 'bad' },
      { id: 'f', label: '1 query with a join', sub: 'or one IN (...)', x: 1, y: 1, tone: 'good' },
      { id: 'g', label: '1 round trip', x: 2, y: 1, tone: 'good' },
    ],
    edges: [
      { from: 'q', to: 'n', label: 'loop', tone: 'bad' },
      { from: 'n', to: 't', tone: 'bad' },
      { from: 'q', to: 'f', label: 'instead', tone: 'good' },
      { from: 'f', to: 'g', tone: 'good' },
    ],
    caption: 'It hides well because each query is fast on its own; it is the round trips that kill you. Fix with a join, a single batched IN query, or eager loading in the ORM. In GraphQL the standard answer is DataLoader, which batches within a tick.',
  },

  // -------------------------------------------------- System design concepts
  'vertical-vs-horizontal-scaling': {
    kind: 'compare',
    columns: [
      {
        title: 'Vertical',
        sub: 'a bigger machine',
        tone: 'good',
        rows: ['No code changes', 'Simple, works surprisingly far', 'Hard ceiling', 'Still a single point of failure'],
      },
      {
        title: 'Horizontal',
        sub: 'more machines',
        tone: 'accent',
        rows: ['Effectively no ceiling', 'Redundancy comes free', 'Needs stateless servers', 'Now you have a distributed system'],
      },
    ],
    caption: 'Scale up first, it is cheaper than people admit. Scaling out means your app must hold no local state, which is why sessions move to Redis and uploads move to object storage before anything else.',
  },
  'load-balancer': {
    kind: 'flow',
    nodes: [
      { id: 'c', label: 'clients', x: 0, y: 1, tone: 'neutral' },
      { id: 'l', label: 'load balancer', sub: 'health checks', x: 1, y: 1, tone: 'accent' },
      { id: 'a', label: 'server 1', x: 2, y: 0, tone: 'good' },
      { id: 'b', label: 'server 2', x: 2, y: 1, tone: 'good' },
      { id: 'd', label: 'server 3', sub: 'unhealthy', x: 2, y: 2, tone: 'bad' },
    ],
    edges: [
      { from: 'c', to: 'l' },
      { from: 'l', to: 'a', tone: 'good' },
      { from: 'l', to: 'b', tone: 'good' },
      { from: 'l', to: 'd', label: 'skipped', tone: 'bad', dashed: true },
    ],
    caption: 'Spreads traffic and removes failed instances from rotation. Round robin, least connections, or hashing on a key when you need the same client to land on the same server. It also terminates TLS, which is why certificates usually live here and not on the app.',
  },
  'caching-and-invalidation': {
    kind: 'stack',
    layers: [
      { label: 'Browser cache', detail: 'nearest, you control it with headers', tone: 'neutral' },
      { label: 'CDN edge', detail: 'close to the user, shared across users', tone: 'neutral' },
      { label: 'Application cache', detail: 'Redis or in-process, shared across servers', tone: 'neutral' },
      { label: 'Database', detail: 'the source of truth, and its own buffer cache', tone: 'neutral' },
    ],
    caption: 'Each layer is faster and more stale than the one below. Invalidation is the hard part: TTLs are simple and let you serve stale data, explicit invalidation is precise and easy to forget. Watch for the stampede, where an expiry sends every request to the database at once.',
  },
  cdn: {
    kind: 'flow',
    nodes: [
      { id: 'u', label: 'user in Athens', x: 0, y: 0, tone: 'neutral' },
      { id: 'e', label: 'edge, Athens', sub: 'cache hit', x: 1, y: 0, tone: 'good' },
      { id: 'o', label: 'origin, Virginia', x: 2, y: 0, tone: 'accent' },
    ],
    edges: [
      { from: 'u', to: 'e', label: '10ms', tone: 'good' },
      { from: 'e', to: 'o', label: 'only on a miss', tone: 'accent', dashed: true },
    ],
    caption: 'Copies of static assets held at edge locations near users, so the bytes travel a short distance instead of crossing an ocean. It also absorbs traffic spikes and shields the origin. Cache-bust with a hash in the filename rather than by purging.',
  },
  'cap-theorem': {
    kind: 'triangle',
    vertices: ['Consistency', 'Availability', 'Partition tolerance'],
    subs: ['everyone sees the same data', 'every request gets an answer', 'survives a network split'],
    pick: [1, 2],
    caption: 'During a network partition you must choose: refuse requests to stay consistent, or answer and risk serving stale data. Partition tolerance is not optional on real networks, so the real choice is only ever the first two. Most systems pick per operation, not once globally.',
  },
  'monolith-vs-microservices': {
    kind: 'compare',
    columns: [
      {
        title: 'Monolith',
        tone: 'good',
        rows: ['One deploy, one codebase', 'Transactions and refactors are easy', 'Local calls, no network in between', 'Scales as one lump'],
      },
      {
        title: 'Microservices',
        tone: 'accent',
        rows: ['Independent deploys and scaling', 'Teams own their service', 'Every call can now fail or time out', 'Distributed debugging, eventual consistency'],
      },
    ],
    caption: 'Start with a well-structured monolith. Microservices solve an organisational problem, letting teams ship without coordinating, and they buy that with a large operational cost. Splitting too early gives you a distributed monolith, the worst of both.',
  },
  'message-queues': {
    kind: 'flow',
    nodes: [
      { id: 'p', label: 'producer', sub: 'returns immediately', x: 0, y: 1, tone: 'good' },
      { id: 'q', label: 'queue', sub: 'buffers the spike', x: 1, y: 1, tone: 'accent' },
      { id: 'a', label: 'worker 1', x: 2, y: 0, tone: 'good' },
      { id: 'b', label: 'worker 2', x: 2, y: 1, tone: 'good' },
      { id: 'd', label: 'dead letter', sub: 'after N failures', x: 2, y: 2, tone: 'bad' },
    ],
    edges: [
      { from: 'p', to: 'q' },
      { from: 'q', to: 'a', tone: 'good' },
      { from: 'q', to: 'b', tone: 'good' },
      { from: 'q', to: 'd', label: 'poison', tone: 'bad', dashed: true },
    ],
    caption: 'Decouples slow work from the request. The user gets a response while the email, thumbnail or report happens later. Delivery is usually at-least-once, so consumers must be idempotent: the same message will eventually arrive twice.',
  },
  'rate-limiting': {
    kind: 'timeline',
    span: 100,
    lanes: [
      {
        label: 'requests',
        events: [
          { at: 2, label: '', tone: 'neutral' },
          { at: 10, label: '', tone: 'neutral' },
          { at: 18, label: '', tone: 'neutral' },
          { at: 26, label: '', tone: 'neutral' },
          { at: 34, label: '', tone: 'neutral' },
          { at: 42, label: '', tone: 'neutral' },
        ],
      },
      {
        label: 'allowed',
        events: [
          { at: 2, label: 'ok', tone: 'good' },
          { at: 10, label: 'ok', tone: 'good' },
          { at: 18, label: 'ok', tone: 'good' },
        ],
      },
      {
        label: 'rejected',
        events: [
          { at: 26, label: '429', tone: 'bad' },
          { at: 34, label: '429', tone: 'bad' },
          { at: 42, label: '429', tone: 'bad' },
        ],
      },
      { label: 'bucket refills', events: [{ at: 60, label: 'tokens back', tone: 'accent', width: 34 }] },
    ],
    caption: 'Token bucket is the usual implementation: tokens refill at a steady rate, each request spends one, and an empty bucket means 429. It allows a short burst while capping the sustained rate. Return Retry-After so clients back off rather than hammering.',
  },

  // ------------------------------------------------- Engineering practice
  'types-of-tests': {
    kind: 'stack',
    shape: 'pyramid',
    layers: [
      { label: 'End to end', detail: 'few. Real browser, real stack. Slow and flaky.', tone: 'bad' },
      { label: 'Integration', detail: 'some. Several units together, real database.', tone: 'accent' },
      { label: 'Unit', detail: 'many. One piece in isolation, milliseconds.', tone: 'good' },
    ],
    caption: 'Read it bottom up. Many fast unit tests, fewer integration tests, a handful of end-to-end tests covering the critical paths only. Invert the pyramid and your suite takes an hour and fails randomly, so nobody trusts it.',
  },
  tdd: {
    kind: 'flow',
    nodes: [
      { id: 'r', label: 'Red', sub: 'write a failing test', x: 0, y: 0, tone: 'bad' },
      { id: 'g', label: 'Green', sub: 'simplest code that passes', x: 1, y: 0, tone: 'good' },
      { id: 'f', label: 'Refactor', sub: 'clean up, tests still pass', x: 2, y: 0, tone: 'accent' },
    ],
    edges: [
      { from: 'r', to: 'g' },
      { from: 'g', to: 'f' },
      { from: 'f', to: 'r', label: 'repeat', dashed: true },
    ],
    caption: "Writing the test first forces you to design the interface from the caller's side, and it proves the test can actually fail. Most valuable where the rules are clear and fiddly, like pricing or parsing. Least valuable while you are still exploring what to build.",
  },
  'git-merge-vs-rebase': {
    kind: 'compare',
    columns: [
      {
        title: 'Merge',
        tone: 'good',
        rows: ['Keeps the real history', 'Adds a merge commit', 'Non-destructive, safe on shared branches', 'Graph can get noisy'],
      },
      {
        title: 'Rebase',
        tone: 'accent',
        rows: ['Replays your commits on top', 'Linear, readable history', 'Rewrites commit hashes', 'Never on a branch others have pulled'],
      },
    ],
    caption: 'The rule that keeps you safe: rebase your own local branch to tidy it before opening a pull request, merge when bringing work into a shared branch. Rebasing something already pushed forces everyone else to recover from it.',
  },
  'ci-cd': {
    kind: 'flow',
    nodes: [
      { id: 'p', label: 'push', x: 0, y: 0, tone: 'neutral' },
      { id: 'b', label: 'build', x: 1, y: 0, tone: 'neutral' },
      { id: 't', label: 'test + lint', x: 2, y: 0, tone: 'accent' },
      { id: 's', label: 'staging', x: 3, y: 0, tone: 'good' },
      { id: 'd', label: 'production', x: 4, y: 0, tone: 'good' },
    ],
    edges: [
      { from: 'p', to: 'b' },
      { from: 'b', to: 't' },
      { from: 't', to: 's', label: 'auto' },
      { from: 's', to: 'd', label: 'gate', tone: 'good' },
    ],
    caption: 'Continuous integration is merging to main often with an automated check on every push. Continuous delivery means main is always releasable; continuous deployment means it ships itself. The value is the shrinking gap between writing a bug and finding it.',
  },
  'design-patterns-to-be-able-to-name': {
    kind: 'boxes',
    columns: 3,
    items: [
      { label: 'Singleton', detail: 'One instance. A database pool. Often a global in disguise.', tone: 'accent' },
      { label: 'Factory', detail: 'Creates objects without the caller naming the concrete class.', tone: 'neutral' },
      { label: 'Strategy', detail: 'Swap an algorithm at runtime. Different pricing rules.', tone: 'neutral' },
      { label: 'Observer', detail: 'Subscribers react to events. Every event emitter.', tone: 'neutral' },
      { label: 'Adapter', detail: 'Wrap an incompatible interface into the one you expect.', tone: 'neutral' },
      { label: 'Decorator', detail: 'Add behaviour without subclassing. Express middleware.', tone: 'neutral' },
    ],
    caption: "Know the names so you can read other people's code and design docs. Do not go hunting for places to apply them. Naming the pattern you already used by accident is the realistic use.",
  },
  'dry-kiss-yagni': {
    kind: 'boxes',
    columns: 3,
    items: [
      { label: 'DRY', detail: 'One source of truth for each piece of knowledge. Not "never type the same characters twice".', tone: 'accent' },
      { label: 'KISS', detail: 'The simplest thing that works. Clever code is a cost the next reader pays.', tone: 'neutral' },
      { label: 'YAGNI', detail: 'Build what is needed now. Speculative generality is the most common waste.', tone: 'neutral' },
    ],
    caption: 'DRY is the most misapplied of the three. Two pieces of code that look identical but change for different reasons should stay separate, and merging them creates a coupling you will have to unpick later.',
  },
  'technical-debt': {
    kind: 'compare',
    columns: [
      {
        title: 'Deliberate',
        sub: 'a decision',
        tone: 'good',
        rows: ['We shipped the simple version to hit a date', 'Written down, with a plan', 'Interest is understood', 'Legitimate engineering'],
      },
      {
        title: 'Accidental',
        sub: 'a surprise',
        tone: 'bad',
        rows: ['We did not know better at the time', 'Nobody tracked it', 'Found when something breaks', 'The expensive kind'],
      },
    ],
    caption: 'The metaphor is about interest: you borrow speed now and pay it back on every future change. Taking some on purpose is fine. What is not fine is taking it without saying so, because then nobody can decide when to pay it down.',
  },

  // ------------------------------------------------------ When you don't know
  'when-you-don-t-know': {
    kind: 'boxes',
    columns: 1,
    items: [
      { label: 'Say what you do know', detail: '"I have not used X directly, but I would expect it to work like Y."', tone: 'good' },
      { label: 'Reason out loud', detail: 'Explain why you expect that. Interviewers score the reasoning, not the recall.', tone: 'good' },
      { label: 'Ask a question', detail: 'Narrowing the problem is itself a signal you know how to work.', tone: 'good' },
      { label: 'Never bluff', detail: 'A bluffed definition falls apart at the first follow-up, and now they are also wondering what else you bluffed.', tone: 'bad' },
    ],
    caption: 'This is worth rehearsing as much as any technical answer. Every loop contains at least one question you cannot answer, and how you handle that is part of what is being measured.',
  },

  // -------------------------------------------------- Ways of working
  'what-is-scrum': {
    kind: 'flow',
    nodes: [
      { id: 'b', label: 'backlog', sub: 'owned, prioritised', x: 0, y: 0, tone: 'neutral' },
      { id: 'p', label: 'sprint planning', x: 1, y: 0, tone: 'neutral' },
      { id: 'w', label: 'the sprint', sub: 'usually 2 weeks', x: 2, y: 0, tone: 'good' },
      { id: 'r', label: 'review / demo', x: 3, y: 0, tone: 'neutral' },
      { id: 't', label: 'retrospective', sub: 'change one thing', x: 3, y: 1, tone: 'accent' },
    ],
    edges: [
      { from: 'b', to: 'p' },
      { from: 'p', to: 'w' },
      { from: 'w', to: 'r' },
      { from: 'r', to: 't' },
      { from: 't', to: 'b', label: 'next sprint', dashed: true },
    ],
    caption: 'The loop is the point. Two weeks means you discover you built the wrong thing in two weeks rather than six months. Everything else, the roles and the ceremonies, exists to keep that loop turning.',
  },
  'scrum-vs-kanban': {
    kind: 'compare',
    columns: [
      {
        title: 'Scrum',
        sub: 'timeboxed',
        tone: 'neutral',
        rows: ['Fixed length sprints', 'Commitment made per sprint', 'Velocity forecasts the next one', 'Suits work you can plan a sprint ahead'],
      },
      {
        title: 'Kanban',
        sub: 'continuous flow',
        tone: 'neutral',
        rows: ['No sprints, work flows', 'Work in progress is capped', 'Cycle time is the metric', 'Suits interrupt-driven work'],
      },
    ],
    caption: 'Neither is better. Committing two weeks ahead is a fiction on a support or platform team, which is where Kanban wins. Plenty of teams run a hybrid and call it Scrum.',
  },
  'the-scrum-ceremonies': {
    kind: 'boxes',
    columns: 2,
    items: [
      { label: 'Sprint planning', detail: 'Pick what the team commits to this sprint.', tone: 'neutral' },
      { label: 'Daily standup', detail: 'Fifteen minutes to surface blockers. Not a status report upward.', tone: 'accent' },
      { label: 'Review / demo', detail: 'Show working software to the people who asked for it.', tone: 'neutral' },
      { label: 'Retrospective', detail: 'How the team worked. Pick one or two things to change.', tone: 'neutral' },
      { label: 'Backlog refinement', detail: 'Keep the next sprint of work ready to pick up.', tone: 'neutral' },
      { label: 'The smell', detail: 'Standup running long, or feeling like reporting to a manager.', tone: 'bad' },
    ],
    caption: 'The retrospective is the one teams skip when busy, and it is the only ceremony that improves the others. If you drop one, drop refinement and protect the retro.',
  },
  'story-points-and-estimation': [
    {
      kind: 'boxes',
      columns: 3,
      items: [
        { label: '1', detail: 'Trivial. Copy change, config flip.', tone: 'neutral' },
        { label: '2', detail: 'Small and fully understood.', tone: 'neutral' },
        { label: '3', detail: 'A day or so, no unknowns.', tone: 'neutral' },
        { label: '5', detail: 'Real work, one or two unknowns.', tone: 'neutral' },
        { label: '8', detail: 'Big. Consider splitting it.', tone: 'accent' },
        { label: '13+', detail: 'Not an estimate. You do not understand it yet.', tone: 'bad' },
      ],
      caption:
        'The scale is deliberately gappy, roughly Fibonacci, because precision you do not have is a lie. You can tell a 3 from a 5. Nobody can tell a 21 from a 24, which is why anything that large means break it down rather than estimate it.',
    },
    {
      kind: 'compare',
      columns: [
        { title: 'What points are', tone: 'good', rows: ['Relative size and uncertainty', 'Calibrated against past work', 'Velocity forecasts the next sprint', 'Deliberately not hours'] },
        { title: 'What goes wrong', tone: 'bad', rows: ['Treated as hours', 'Compared between teams', 'Velocity used as a productivity target', 'Numbers inflate and stop meaning anything'] },
      ],
      caption:
        'Points are not hours precisely so that an estimate cannot be read as a commitment. The moment velocity becomes a target it stops being a measurement, which is Goodhart\u2019s law arriving on schedule.',
    },
  ],
  'definition-of-done': {
    kind: 'stack',
    layers: [
      { label: 'Code written', detail: 'the part everyone counts', tone: 'neutral' },
      { label: 'Reviewed', detail: 'someone else has read it', tone: 'neutral' },
      { label: 'Tested', detail: 'at whatever level the team agreed', tone: 'neutral' },
      { label: 'Documented', detail: 'if anyone outside needs to know', tone: 'neutral' },
      { label: 'Deployed', detail: 'in production, possibly behind a flag', tone: 'good' },
    ],
    caption: 'One shared checklist so that "done" means the same thing to everyone. Without it, work comes back a sprint later and the board quietly lies about how much is finished.',
  },
  'agile-vs-waterfall': {
    kind: 'compare',
    columns: [
      {
        title: 'Waterfall',
        sub: 'plan, then build',
        tone: 'muted',
        rows: ['Requirements fixed up front', 'Phases run in sequence', 'Feedback arrives at the end', 'Fits regulated or hardware work'],
      },
      {
        title: 'Agile',
        sub: 'build, then learn',
        tone: 'neutral',
        rows: ['Requirements expected to change', 'Short cycles', 'Feedback every iteration', 'Fits software where the target moves'],
      },
    ],
    caption: 'Waterfall is not stupid, it is a bet that requirements will not change, and sometimes that bet is right. Be careful with the claim that a team "is agile", since it often just means they do standups.',
  },
  'code-review': {
    kind: 'compare',
    columns: [
      {
        title: 'What it is for',
        tone: 'good',
        rows: ['Catching design problems early', 'Spreading knowledge of the codebase', 'A second pair of eyes on risk', 'Small pull requests, reviewed properly'],
      },
      {
        title: 'What it is not for',
        tone: 'bad',
        rows: ['Formatting, a linter does that', 'Gatekeeping or scoring people', 'Nine hundred line diffs nobody reads', 'Blocking on personal preference'],
      },
    ],
    caption: 'Review quality falls off a cliff past a few hundred lines, so the single biggest improvement is smaller pull requests. As reviewer, mark clearly what blocks the merge and what is only a suggestion.',
  },
  'trunk-based-development-vs-git-flow': {
    kind: 'flow',
    nodes: [
      { id: 'm', label: 'main', sub: 'always releasable', x: 0, y: 0, tone: 'good' },
      { id: 's1', label: 'small change', sub: 'merged daily', x: 1, y: 0, tone: 'good' },
      { id: 's2', label: 'behind a flag', x: 2, y: 0, tone: 'good' },
      { id: 'd', label: 'develop', x: 0, y: 1, tone: 'neutral' },
      { id: 'f', label: 'long feature branch', sub: 'weeks', x: 1, y: 1, tone: 'bad' },
      { id: 'c', label: 'painful merge', x: 2, y: 1, tone: 'bad' },
    ],
    edges: [
      { from: 'm', to: 's1', tone: 'good' },
      { from: 's1', to: 's2', tone: 'good' },
      { from: 's2', to: 'm', label: 'same day', tone: 'good', dashed: true },
      { from: 'd', to: 'f' },
      { from: 'f', to: 'c', label: 'diverges', tone: 'bad' },
    ],
    caption: 'Long branches delay integration, which is the exact thing continuous integration exists to prevent. Trunk based is the modern default. Git Flow still fits software with real versioned releases you have to maintain in parallel.',
  },
  'feature-flags': {
    kind: 'flow',
    nodes: [
      { id: 'd', label: 'deploy', sub: 'code is in production', x: 0, y: 0, tone: 'neutral' },
      { id: 'f', label: 'flag off', sub: 'nobody sees it', x: 1, y: 0, tone: 'neutral' },
      { id: 'p', label: '1% of users', x: 2, y: 0, tone: 'accent' },
      { id: 'a', label: 'everyone', x: 3, y: 0, tone: 'good' },
      { id: 'k', label: 'kill switch', sub: 'no rollback needed', x: 2, y: 1, tone: 'good' },
      { id: 'r', label: 'remove the flag', sub: 'or it is dead weight', x: 3, y: 1, tone: 'bad' },
    ],
    edges: [
      { from: 'd', to: 'f' },
      { from: 'f', to: 'p' },
      { from: 'p', to: 'a', tone: 'good' },
      { from: 'p', to: 'k', label: 'if it breaks', tone: 'good' },
      { from: 'a', to: 'r', label: 'then', tone: 'bad', dashed: true },
    ],
    caption: 'Separates deploying from releasing, which is what makes shipping unfinished work safe. The cost is that every flag is a branch in the code, so give each one an owner and a removal date or they become permanent.',
  },
  'semantic-versioning': {
    kind: 'table',
    head: ['Bump', 'When', 'Safe to auto-upgrade'],
    rows: [
      ['PATCH  1.2.x', 'backwards compatible bug fix', { text: 'yes', tone: 'good' }],
      ['MINOR  1.x.0', 'backwards compatible new feature', { text: 'yes', tone: 'good' }],
      ['MAJOR  x.0.0', 'breaking change', { text: 'no, read the notes', tone: 'bad' }],
    ],
    caption: 'It tells consumers what an upgrade costs them, which is what a caret range in package.json is betting on. The discipline that makes it work is being honest about what counts as breaking, and almost everyone is occasionally not.',
  },
  'on-call-and-incident-response': {
    kind: 'flow',
    nodes: [
      { id: 'a', label: 'acknowledge', x: 0, y: 0, tone: 'neutral' },
      { id: 'm', label: 'mitigate', sub: 'roll back first', x: 1, y: 0, tone: 'good' },
      { id: 'c', label: 'communicate', sub: 'while you work', x: 1, y: 1, tone: 'accent' },
      { id: 'd', label: 'diagnose', sub: 'after it stops burning', x: 2, y: 0, tone: 'neutral' },
      { id: 'p', label: 'postmortem', sub: 'blameless', x: 3, y: 0, tone: 'good' },
    ],
    edges: [
      { from: 'a', to: 'm' },
      { from: 'm', to: 'd' },
      { from: 'd', to: 'p' },
      { from: 'a', to: 'c', dashed: true },
    ],
    caption: 'Mitigate before you diagnose. Understanding the bug is not worth an extra twenty minutes of outage. A postmortem asks what about the system let this happen, not who did it, because blame makes people hide problems.',
  },
  'observability-logs-metrics-traces': [
    {
      kind: 'flow',
      nodes: [
        { id: 'r', label: 'one request', x: 0, y: 1, tone: 'neutral' },
        { id: 'l', label: 'log line', sub: 'what happened', x: 1, y: 0, tone: 'neutral' },
        { id: 'm', label: 'metric + 1', sub: 'how often', x: 1, y: 1, tone: 'neutral' },
        { id: 't', label: 'trace span', sub: 'where the time went', x: 1, y: 2, tone: 'neutral' },
        { id: 'a', label: 'alert', sub: 'fires on metrics', x: 2, y: 1, tone: 'accent' },
      ],
      edges: [
        { from: 'r', to: 'l' },
        { from: 'r', to: 'm' },
        { from: 'r', to: 't' },
        { from: 'm', to: 'a', tone: 'accent' },
      ],
      caption: 'One request emits all three. They are not alternatives, they answer different questions about the same event.',
    },
    {
      kind: 'compare',
      columns: [
        { title: 'Logs', sub: 'events', tone: 'neutral', rows: ['Discrete, with detail', 'What exactly happened to this request', 'Expensive at volume'] },
        { title: 'Metrics', sub: 'numbers over time', tone: 'neutral', rows: ['Aggregated and cheap', 'Is anything wrong right now', 'What alerts fire on'] },
        { title: 'Traces', sub: 'one request, many hops', tone: 'neutral', rows: ['Follows a call across services', 'Which hop is slow', 'The one people skip'] },
      ],
      caption:
        'Monitoring tells you a thing you already predicted has broken. Observability is being able to ask a question you did not plan for, which is why all three matter rather than just the dashboard.',
    },
  ],
  'sla-slo-and-sli': {
    kind: 'stack',
    layers: [
      { label: 'SLI  the measurement', detail: 'fraction of requests served under 300ms', tone: 'neutral' },
      { label: 'SLO  the internal target', detail: '99.9 percent. Tighter than the SLA.', tone: 'good' },
      { label: 'SLA  the contract', detail: 'with a customer, with money attached if you miss', tone: 'accent' },
      { label: 'Error budget', detail: 'the gap to 100 percent. Spend it, and features stop.', tone: 'bad' },
    ],
    caption: 'The error budget is the useful idea: 99.9 percent means you are allowed about 43 minutes of failure a month, and that is a budget to spend on shipping risk, not a number to feel bad about.',
  },
  'technical-documentation-and-adrs': {
    kind: 'compare',
    columns: [
      {
        title: 'README',
        sub: 'how',
        tone: 'neutral',
        rows: ['How to run it', 'How to test it', 'Kept current, edited freely'],
      },
      {
        title: 'ADR',
        sub: 'why',
        tone: 'neutral',
        rows: ['Context, options, decision, consequences', 'One decision per record', 'Never edited, only superseded'],
      },
    ],
    caption: 'The payoff is six months later when someone asks why the system works this way. Without it the answer left with whoever wrote it. An ADR is short, often under a page, and the immutability is the point.',
  },
  'estimation-and-why-it-goes-wrong': {
    kind: 'flow',
    nodes: [
      { id: 'b', label: 'big vague task', x: 0, y: 0, tone: 'bad' },
      { id: 's', label: 'break it down', sub: 'until each piece is clear', x: 1, y: 0, tone: 'good' },
      { id: 'r', label: 'estimate a range', sub: 'not a single number', x: 2, y: 0, tone: 'good' },
      { id: 'l', label: 'learn something', x: 2, y: 1, tone: 'accent' },
      { id: 'f', label: 're-forecast', sub: 'and say so early', x: 3, y: 1, tone: 'good' },
    ],
    edges: [
      { from: 'b', to: 's' },
      { from: 's', to: 'r', tone: 'good' },
      { from: 'r', to: 'l', label: 'while building' },
      { from: 'l', to: 'f', tone: 'good' },
    ],
    caption: 'Estimates are wrong because the unknown work is the part you have not thought of yet. The question worth answering in an interview is not how you estimate, but what you do when the estimate turns out wrong, and the answer is tell someone immediately rather than absorbing it quietly.',
  },
  'floating-point-and-number-precision': {
    kind: 'table',
    head: ['You write', 'You expect', 'You get', 'Because'],
    rows: [
      ['0.1 + 0.2', '0.3', { text: '0.30000000000000004', tone: 'bad' }, '0.1 has no exact form in base 2'],
      ['0.1 + 0.2 === 0.3', 'true', { text: 'false', tone: 'bad' }, 'never compare floats with ==='],
      ['19.99 * 100', '1999', { text: '1998.9999999999998', tone: 'bad' }, 'why money is stored in integer cents'],
      ['2**53 === 2**53 + 1', 'false', { text: 'true', tone: 'bad' }, 'past MAX_SAFE_INTEGER, use BigInt'],
    ],
    caption:
      'None of these are JavaScript being strange. They are IEEE 754 doubles behaving exactly as specified, and every other language using doubles gives the same answers.',
  },
  'tcp-vs-udp': {
    kind: 'compare',
    columns: [
      {
        title: 'TCP',
        sub: 'connection, guarantees',
        rows: [
          'Three-way handshake to start',
          'Every byte numbered and acknowledged',
          'Lost packets retransmitted',
          'Delivered in order',
          'One loss stalls everything behind it',
          'Web, email, file transfer, databases',
        ],
      },
      {
        title: 'UDP',
        sub: 'just send',
        rows: [
          'No handshake, no connection',
          'No acknowledgement',
          'Losses stay lost',
          'Arrives in any order, or not at all',
          'Nothing stalls',
          'Voice, video, games, DNS',
        ],
      },
    ],
    caption:
      'Neither is better, so neither is coloured. UDP looks strictly worse until you notice that a video frame from 200 milliseconds ago is not worth waiting for. HTTP/3 runs on UDP and rebuilds reliability per stream, so one lost packet stalls one stream rather than the whole connection.',
  },
  dns: {
    kind: 'flow',
    nodes: [
      { id: 'b', label: 'browser cache', x: 0, y: 0, tone: 'good' },
      { id: 'o', label: 'OS cache', x: 1, y: 0, tone: 'good' },
      { id: 'r', label: 'resolver', sub: 'your ISP or 1.1.1.1', x: 2, y: 0, tone: 'good' },
      { id: 'root', label: 'root servers', sub: 'who handles .com?', x: 3, y: 0, tone: 'accent' },
      { id: 'tld', label: '.com servers', sub: "who handles example.com?", x: 3, y: 1, tone: 'accent' },
      { id: 'auth', label: 'authoritative NS', sub: 'the actual record', x: 2, y: 1, tone: 'accent' },
      { id: 'ip', label: 'IP address', sub: 'cached for the TTL', x: 1, y: 1, tone: 'good' },
    ],
    edges: [
      { from: 'b', to: 'o', label: 'miss' },
      { from: 'o', to: 'r', label: 'miss' },
      { from: 'r', to: 'root', label: 'miss', tone: 'accent' },
      { from: 'root', to: 'tld' },
      { from: 'tld', to: 'auth' },
      { from: 'auth', to: 'ip' },
    ],
    caption:
      'Green is the fast path and amber is the walk you only take on a cache miss, which is rare. The TTL on the answer is why DNS turns up in system design: it is how long a change takes to propagate, so you lower it before a migration and raise it after.',
  },
  'tls-and-the-https-handshake': {
    kind: 'timeline',
    span: 12,
    lanes: [
      {
        label: 'client',
        events: [
          { at: 0, label: 'client hello', width: 3.5 },
          { at: 7, label: 'key agreed', width: 2.5, tone: 'good' },
        ],
      },
      {
        label: 'server',
        events: [
          { at: 3.5, label: 'certificate', width: 3.5, tone: 'accent' },
          { at: 9.5, label: 'encrypted', width: 2.5, tone: 'good' },
        ],
      },
    ],
    caption:
      'Asymmetric cryptography is used once, to agree a shared key without ever sending it, and symmetric cryptography does everything after, because it is far faster. The certificate in amber is the part that proves identity: it is signed by an authority your machine already trusts. TLS 1.3 does all of this in one round trip.',
  },
  'storing-passwords': [
    {
      kind: 'flow',
      nodes: [
        { id: 'pw', label: 'password', x: 0, y: 0 },
        { id: 's', label: 'random salt', sub: 'unique per user', x: 0, y: 1, tone: 'good' },
        { id: 'h', label: 'bcrypt, scrypt, argon2', sub: 'deliberately slow', x: 1, y: 0, tone: 'good' },
        { id: 'db', label: 'store salt + hash', sub: 'never the password', x: 2, y: 0, tone: 'good' },
        { id: 'x', label: 'encrypt it', sub: 'reversible, so no', x: 1, y: 1, tone: 'bad' },
      ],
      edges: [
        { from: 'pw', to: 'h' },
        { from: 's', to: 'h' },
        { from: 'h', to: 'db' },
        { from: 'pw', to: 'x', tone: 'bad', dashed: true },
      ],
      caption:
        'Encryption is the trap, because it is reversible and reversibility is the whole problem. Hashing is one way by design. The salt is what stops one rainbow table cracking every account at once.',
    },
    {
      kind: 'table',
      head: ['Function', 'Speed', 'Use it for'],
      rows: [
        [{ text: 'MD5, SHA-1', tone: 'bad' }, 'very fast, broken', 'nothing'],
        [{ text: 'SHA-256', tone: 'bad' }, 'very fast', 'checksums and signatures, never passwords'],
        [{ text: 'bcrypt, scrypt', tone: 'good' }, 'slow, tunable', 'passwords'],
        [{ text: 'argon2', tone: 'good' }, 'slow and memory-hard', 'passwords, and the current recommendation'],
      ],
      caption:
        'Fast is a virtue everywhere else and a defect here. A fast hash is a gift to anyone brute forcing a stolen database, which is why the password functions are slow on purpose and have a work factor you raise as hardware improves.',
    },
  ],
  'oauth-2-0-and-sso': {
    kind: 'flow',
    nodes: [
      { id: 'u', label: 'user', x: 0, y: 0 },
      { id: 'a', label: 'your app', x: 1, y: 0 },
      { id: 'p', label: 'provider', sub: 'user logs in here', x: 2, y: 0, tone: 'good' },
      { id: 'c', label: 'authorization code', sub: 'short lived, one use', x: 2, y: 1, tone: 'accent' },
      { id: 't', label: 'access token', sub: 'exchanged server side', x: 1, y: 1, tone: 'good' },
      { id: 'api', label: 'their API', sub: 'called on the user behalf', x: 0, y: 1, tone: 'good' },
    ],
    edges: [
      { from: 'u', to: 'a', label: 'sign in with' },
      { from: 'a', to: 'p', label: 'redirect + scope' },
      { from: 'p', to: 'c', label: 'user approves' },
      { from: 'c', to: 't', label: '+ client secret' },
      { from: 't', to: 'api', label: 'bearer' },
    ],
    caption:
      'Your application never sees the password, which is the entire point. The code in amber is deliberately useless on its own: it is exchanged for a token from your server, using a secret the browser never holds. OpenID Connect adds an id token on top, which is what turns this from authorization into sign-in, and SSO is that trusted by several applications at once.',
  },
  'transaction-isolation-levels': {
    kind: 'table',
    head: ['Level', 'Dirty read', 'Non-repeatable read', 'Phantom read', 'Where you meet it'],
    rows: [
      ['Read uncommitted', { text: 'possible', tone: 'bad' }, { text: 'possible', tone: 'bad' }, { text: 'possible', tone: 'bad' }, 'almost nobody'],
      ['Read committed', { text: 'prevented', tone: 'good' }, { text: 'possible', tone: 'bad' }, { text: 'possible', tone: 'bad' }, 'PostgreSQL and Oracle default'],
      ['Repeatable read', { text: 'prevented', tone: 'good' }, { text: 'prevented', tone: 'good' }, { text: 'possible', tone: 'bad' }, 'MySQL default'],
      ['Serializable', { text: 'prevented', tone: 'good' }, { text: 'prevented', tone: 'good' }, { text: 'prevented', tone: 'good' }, 'correct, and slowest'],
    ],
    caption:
      'Each level down prevents one more anomaly and costs more concurrency. The phantom is the one worth naming: repeatable read protects the rows you already read, and only serializable stops new matching rows appearing underneath you.',
  },
  'reverse-proxy-api-gateway-and-load-balancer': {
    kind: 'compare',
    columns: [
      {
        title: 'Load balancer',
        sub: 'spreads traffic',
        rows: ['Picks a healthy backend', 'Knows nothing about the request', 'Health checks and draining', 'Layer 4 or layer 7'],
      },
      {
        title: 'Reverse proxy',
        sub: 'fronts the servers',
        rows: ['Terminates TLS', 'Caches and compresses', 'Hides the topology', 'Nginx, Caddy'],
      },
      {
        title: 'API gateway',
        sub: 'understands your API',
        rows: ['Auth and rate limiting', 'Routes by path and version', 'Shapes and aggregates responses', 'Per-route metrics'],
      },
    ],
    caption:
      'None of the three is better than the others, so none is coloured; they are different jobs. One product usually does all three, which is exactly why the words get used interchangeably. A forward proxy is the mirror image of the middle column: it sits in front of clients rather than servers.',
  },
  'load-balancing-algorithms': {
    kind: 'table',
    head: ['Algorithm', 'Picks by', 'Reach for it when', 'The catch'],
    rows: [
      ['Round robin', 'next in the rota', 'Requests cost about the same', { text: 'A slow request does not slow the rota', tone: 'bad' }],
      ['Least connections', 'fewest in flight', 'Request cost varies, or connections are long-lived', 'Needs live state per backend'],
      ['Weighted', 'capacity you declare', 'Mixed instance sizes, or a gradual rollout', 'The weights are a guess until measured'],
      ['IP or session hash', 'a key on the request', 'Sticky sessions without shared state', { text: 'Adding a backend reshuffles everyone', tone: 'bad' }],
      ['Least response time', 'measured latency', 'You want it to adapt on its own', { text: 'Oscillates if the window is short', tone: 'bad' }],
    ],
    caption:
      'Round robin is the default and least connections is the better default for anything long-lived. The hash row is where consistent hashing earns its place, for the reason in its catch column.',
  },
  'garbage-collection': {
    kind: 'flow',
    nodes: [
      { id: 'r', label: 'roots', sub: 'stack, globals', x: 0, y: 1, tone: 'good' },
      { id: 'a', label: 'reachable', x: 1, y: 0, tone: 'good' },
      { id: 'b', label: 'reachable', x: 2, y: 0, tone: 'good' },
      { id: 'c', label: 'unreachable', sub: 'collected', x: 1, y: 2, tone: 'muted' },
      { id: 'd', label: 'unreachable', sub: 'points at c, still dead', x: 2, y: 2, tone: 'muted' },
    ],
    edges: [
      { from: 'r', to: 'a' },
      { from: 'a', to: 'b' },
      { from: 'c', to: 'd' },
      { from: 'd', to: 'c', dashed: true },
    ],
    caption:
      'Reachability from the roots is the only thing that counts. The bottom pair reference each other, so their reference counts never fall to zero, and a counting collector leaks them forever. A tracing collector never reaches them and frees both, which is the argument for tracing in one picture.',
  },
  'memory-and-storage-by-speed': {
    kind: 'stack',
    shape: 'pyramid',
    layers: [
      { label: 'CPU registers', detail: 'under a nanosecond, bytes', tone: 'good' },
      { label: 'L1 to L3 cache', detail: '1 to 10 ns, megabytes', tone: 'good' },
      { label: 'Main memory', detail: '100 ns, gigabytes', tone: 'accent' },
      { label: 'SSD', detail: 'tens of microseconds, terabytes', tone: 'accent' },
      { label: 'Spinning disk', detail: '10 ms per seek', tone: 'bad' },
      { label: 'Network storage', detail: 'milliseconds, and someone else can lose it', tone: 'bad' },
    ],
    caption:
      'Ten million to one from top to bottom, and every step down is also a step up in size and in cost per operation. Everything above SSD is lost on power failure, which is why a database writes an append-only log before touching anything in place.',
  },
  'event-sourcing-and-cqrs': {
    kind: 'compare',
    columns: [
      {
        title: 'Store the state',
        sub: 'the usual way',
        rows: ['balance = 90', 'One row, updated in place', 'Fast to read', 'No history of how it got there', 'A bug overwrites the evidence'],
      },
      {
        title: 'Store the events',
        sub: 'event sourcing',
        rows: ['deposited 100, withdrew 10', 'Append only, never edited', 'Reads replay or use a snapshot', 'Full audit trail, free', 'Rebuild state after fixing the bug'],
      },
    ],
    caption:
      'Neither is coloured, because neither is the default answer. Events earn their complexity where the audit trail is a requirement, as in finance, and are over-engineering almost everywhere else. CQRS is the separate idea of reading from views built out of those writes.',
  },
  mapreduce: {
    kind: 'flow',
    nodes: [
      { id: 'in', label: 'input split', sub: 'across many machines', x: 0, y: 1 },
      { id: 'm', label: 'map', sub: 'record to key-value pairs', x: 1, y: 1, tone: 'good' },
      { id: 'sh', label: 'shuffle', sub: 'group by key, over the network', x: 2, y: 1, tone: 'bad' },
      { id: 'r', label: 'reduce', sub: 'combine values per key', x: 3, y: 1, tone: 'good' },
      { id: 'c', label: 'combiner', sub: 'pre-aggregate before the shuffle', x: 2, y: 0, tone: 'good' },
      { id: 'out', label: 'output', x: 4, y: 1 },
    ],
    edges: [
      { from: 'in', to: 'm' },
      { from: 'm', to: 'sh' },
      { from: 'sh', to: 'r' },
      { from: 'r', to: 'out' },
      { from: 'c', to: 'sh', label: 'shrinks it', dashed: true },
    ],
    caption:
      'Map and reduce parallelise perfectly and are not where the time goes. The shuffle is red because it moves data across the network, which is why a combiner that aggregates on the map side is where the real wins are, and why one skewed key can become the entire runtime.',
  },
  'docker-and-containers': {
    kind: 'compare',
    columns: [
      {
        title: 'Virtual machine',
        sub: 'its own kernel',
        tone: 'accent',
        rows: ['Full guest operating system', 'Boots in seconds', 'Gigabytes per instance', 'Strong isolation', 'Run a different OS entirely'],
      },
      {
        title: 'Container',
        sub: 'shares the host kernel',
        tone: 'good',
        rows: ['Just the application and its deps', 'Starts in milliseconds', 'Megabytes per instance', 'Weaker: a kernel exploit crosses it', 'Same kernel, same OS family'],
      },
    ],
    caption:
      'Containers win on density and speed and lose on isolation strength, which is the actual trade rather than one being newer. Layer caching is the other thing to know: copy the lock file and install before copying source, or every code change reinstalls everything.',
  },
  'kubernetes-in-one-answer': {
    kind: 'flow',
    nodes: [
      { id: 'y', label: 'you declare', sub: '5 replicas of this image', x: 0, y: 1, tone: 'good' },
      { id: 'd', label: 'Deployment', sub: 'manages a replica set', x: 1, y: 1 },
      { id: 'p', label: 'Pods', sub: 'the unit of scheduling', x: 2, y: 1 },
      { id: 's', label: 'Service', sub: 'stable address, load balances', x: 3, y: 1 },
      { id: 'i', label: 'Ingress', sub: 'outside traffic in', x: 4, y: 1 },
      { id: 'k', label: 'control loop', sub: 'reality keeps drifting, it keeps fixing', x: 1, y: 0, tone: 'good' },
    ],
    edges: [
      { from: 'y', to: 'd' },
      { from: 'd', to: 'p' },
      { from: 'p', to: 's' },
      { from: 's', to: 'i' },
      { from: 'k', to: 'd', label: 'reconciles', dashed: true },
    ],
    caption:
      'The reconciliation loop is the idea and the object types are detail. You declare a desired state and something continuously works to make reality match it, which is why a dead node repairs itself without anyone being paged. The honest caveat is that it is a lot to operate for a small team.',
  },
  'mvc-mvp-and-mvvm': {
    kind: 'table',
    head: ['Pattern', 'Who handles input', 'How the view updates', 'The view is'],
    rows: [
      ['MVC', 'Controller', 'Often observes the model directly', 'Semi-active, and everyone defines it differently'],
      ['MVP', 'Presenter', 'Presenter tells it what to show', { text: 'Passive, so trivially mockable', tone: 'good' }],
      ['MVVM', 'View model, via commands', 'Declarative binding, automatic', { text: 'Reactive, and needs a binding framework', tone: 'accent' }],
      ['React', 'The component', 'Re-render on state change', 'Both view and view model at once'],
    ],
    caption:
      'All three exist to keep logic out of the view so it can be tested, and they differ mainly in how far they go. The last row is the useful one in a frontend interview: React is none of them, and the real question becomes where state lives rather than which acronym applies.',
  },
}
