/**
 * Reading order, and how likely each item is to come up.
 *
 * The sidebar used to be ordered by how often something gets asked, which is
 * useful for triage and wrong for learning: it opens on hash maps and puts
 * recursion at number six, after four things that assume it. This orders the
 * whole app the way the books do instead, and keeps the frequency information
 * as a separate signal you can sort by when you want to triage.
 *
 * The sequence is the one all four primary sources agree on. Common-Sense and
 * Grokking both open on complexity, then reach hash tables before anything
 * clever. Grokking opens chapter one on binary search, which is why it is the
 * first algorithm here rather than the sixteenth. Every source does linear
 * structures before trees, trees before graphs, and graphs before dynamic
 * programming. Skiena and EPI both leave design, concurrency and domain
 * problems until after the algorithms.
 *
 * Two rules hold the order together, and smoke.ts enforces both:
 *
 *  - Nothing appears before something it needs. That is what `needs` is for.
 *    The order used to claim recursion came before quicksort and then listed
 *    quicksort eighty rows earlier, because nothing checked.
 *  - Within a topic, easiest first. Chance is a second signal, not the order;
 *    it has its own view in the sidebar.
 */

/** How likely this is to come up in a software engineering loop. */
export type Chance = 'high' | 'medium' | 'low' | 'rare'

export const CHANCE_LABEL: Record<Chance, string> = {
  high: 'expect it',
  medium: 'often',
  low: 'sometimes',
  rare: 'background',
}

/** Ordered strongest first, which is also the order the filter buttons take. */
export const CHANCES: Chance[] = ['high', 'medium', 'low', 'rare']

/**
 * The four long arcs. One 205-item line asks you to finish 53 algorithms
 * before the first concept page; tracks let a sitting be one algorithm and two
 * concepts, which is how attention actually works.
 */
export type Track = 'Algorithms' | 'Language and web' | 'Systems and design' | 'The interview'
export const TRACKS: Track[] = ['Algorithms', 'Language and web', 'Systems and design', 'The interview']

export type ItemKind = 'algo' | 'concept' | 'guide'

/** `needs` holds `kind:id` keys of things that have to come first. */
export type Item = { kind: ItemKind; id: string; chance: Chance; needs?: string[] }
export type Topic = { id: string; name: string; phase: string; track: Track; items: Item[] }

/**
 * Reference pages, pinned above the reading order in the sidebar. They are
 * maps of the territory rather than stops on the route, so they sit outside
 * Prev/Next and outside the done count.
 */
export const MAPS = ['router', 'board'] as const

const a = (id: string, chance: Chance, needs?: string[]): Item => ({ kind: 'algo', id, chance, needs })
const c = (id: string, chance: Chance, needs?: string[]): Item => ({ kind: 'concept', id, chance, needs })
const g = (id: string, chance: Chance, needs?: string[]): Item => ({ kind: 'guide', id, chance, needs })

// Shorthands for the four things half the list depends on.
const HASH = 'concept:how-does-a-hash-map-work'
const LIST = 'concept:array-vs-linked-list'
const STACK = 'concept:stack-vs-queue'
const REC = 'concept:recursion'
const TREE = 'concept:trees-graphs-bfs-vs-dfs'

export const curriculum: Topic[] = [
  {
    id: 'orientation',
    name: 'What this is',
    phase: 'Orientation',
    track: 'Algorithms',
    // One light opener rather than four meta pages, three of which are
    // reference. It is the bird's view of everything the rest of the app is for.
    items: [g('the-loop', 'high')],
  },

  {
    id: 'complexity',
    name: 'Cost, and the first algorithm',
    phase: 'Foundations',
    track: 'Algorithms',
    items: [c('big-o', 'high'), a('binary-search', 'high'), c('array-vs-linked-list', 'high')],
  },
  {
    id: 'hash-maps',
    name: 'Hash maps',
    phase: 'Foundations',
    track: 'Algorithms',
    // Ahead of arrays, because sliding windows, prefix sums and anagram
    // grouping all reach for a Map or a Set on their first line.
    items: [c('how-does-a-hash-map-work', 'high'), a('two-sum', 'high', [HASH]), a('group-anagrams', 'medium', [HASH])],
  },
  {
    id: 'arrays',
    name: 'Arrays and strings',
    phase: 'Foundations',
    track: 'Algorithms',
    items: [
      a('two-pointers', 'high'),
      a('sliding-window', 'high', [HASH]),
      a('kadane', 'medium'),
      a('prefix-sums', 'medium', [HASH]),
      a('matrix-rotate', 'low'),
      a('cyclic-sort', 'low'),
    ],
  },
  {
    id: 'first-problem',
    name: 'Solving one cold',
    phase: 'Foundations',
    track: 'Algorithms',
    // Lands once you have solved two or three things, not before. Method is
    // unreadable until you have something to apply it to.
    items: [g('attacking-a-new-problem', 'high')],
  },
  {
    id: 'stacks-queues',
    name: 'Stacks and queues',
    phase: 'Foundations',
    track: 'Algorithms',
    items: [c('stack-vs-queue', 'high'), a('min-stack', 'low', [STACK]), a('monotonic-stack', 'medium', [STACK])],
  },
  {
    id: 'linked-lists',
    name: 'Linked lists',
    phase: 'Foundations',
    track: 'Algorithms',
    // lru-cache closes the phase: it is a design problem that composes the
    // hash map with the list, so it needs both topics behind it.
    items: [
      a('reverse-linked-list', 'high', [LIST]),
      a('fast-slow-pointers', 'medium', [LIST]),
      a('lru-cache', 'medium', [HASH, 'algo:reverse-linked-list']),
    ],
  },

  {
    id: 'simple-sorts',
    name: 'Simple sorts',
    phase: 'Core algorithms',
    track: 'Algorithms',
    // The non-recursive ones only. Merge and quick wait for recursion.
    items: [
      a('bubble-sort', 'rare'),
      a('selection-sort', 'rare'),
      a('insertion-sort', 'low'),
      a('counting-sort', 'low'),
      a('bucket-sort', 'rare', ['algo:insertion-sort']),
      a('radix-sort', 'rare', ['algo:counting-sort']),
    ],
  },
  {
    id: 'recursion',
    name: 'Recursion',
    phase: 'Core algorithms',
    track: 'Algorithms',
    items: [c('recursion', 'high'), a('recursion', 'high', [REC]), a('iterative-dfs', 'medium', [REC, STACK]), a('backtracking-subsets', 'high', [REC])],
  },
  {
    id: 'divide',
    name: 'Divide and conquer',
    phase: 'Core algorithms',
    track: 'Algorithms',
    items: [
      a('merge-sort', 'medium', [REC]),
      a('quick-sort', 'medium', [REC]),
      a('quickselect', 'low', ['algo:quick-sort']),
      a('count-inversions', 'rare', ['algo:merge-sort']),
      a('binary-search-answer', 'medium', ['algo:binary-search', REC]),
    ],
  },
  {
    id: 'intervals',
    name: 'Intervals',
    phase: 'Core algorithms',
    track: 'Algorithms',
    items: [a('merge-intervals', 'medium')],
  },

  {
    id: 'trees',
    name: 'Trees, heaps and tries',
    phase: 'Structures built on recursion',
    track: 'Algorithms',
    // bst-delete last: three cases and a successor hunt make it the hardest
    // thing in the topic, not the second easiest.
    items: [
      c('trees-graphs-bfs-vs-dfs', 'high', [REC, STACK]),
      a('inorder-traversal', 'high', [TREE]),
      a('min-heap', 'high', [TREE]),
      a('heapify', 'medium', ['algo:min-heap']),
      a('heap-sort', 'low', ['algo:heapify']),
      a('trie', 'low', [TREE]),
      a('bst-delete', 'low', ['algo:inorder-traversal']),
    ],
  },
  {
    id: 'graphs',
    name: 'Graphs',
    phase: 'Structures built on recursion',
    track: 'Algorithms',
    items: [
      a('bfs-grid', 'high', [TREE]),
      a('topological-sort', 'medium', ['algo:bfs-grid']),
      a('union-find', 'low'),
      a('dijkstra', 'low', ['algo:bfs-grid', 'algo:min-heap']),
      a('kruskal', 'rare', ['algo:union-find']),
      a('prim', 'rare', ['algo:min-heap', 'algo:kruskal']),
    ],
  },

  {
    id: 'dp',
    name: 'Dynamic programming',
    phase: 'Optimisation',
    track: 'Algorithms',
    items: [a('coin-change', 'medium', [REC]), a('knapsack-01', 'medium', ['algo:coin-change']), a('edit-distance', 'medium', ['algo:coin-change'])],
  },
  {
    id: 'greedy',
    name: 'Greedy',
    phase: 'Optimisation',
    track: 'Algorithms',
    items: [a('jump-game', 'low')],
  },
  {
    id: 'bits-math',
    name: 'Bits and maths',
    phase: 'Optimisation',
    track: 'Algorithms',
    items: [a('bit-manipulation', 'low'), a('count-bits', 'low', ['algo:bit-manipulation']), a('sieve', 'rare')],
  },
  {
    id: 'advanced',
    name: 'Further afield',
    phase: 'Optimisation',
    track: 'Algorithms',
    items: [
      c('memory-and-storage-by-speed', 'low', ['concept:big-o']),
      a('segment-tree', 'rare', [TREE]),
      a('kmp', 'rare'),
      a('reservoir-sampling', 'rare'),
    ],
  },
  {
    id: 'stuck',
    name: 'When it will not come',
    phase: 'Optimisation',
    track: 'Algorithms',
    items: [g('when-you-are-stuck', 'medium', ['guide:attacking-a-new-problem'])],
  },

  {
    id: 'js',
    name: 'JavaScript and TypeScript',
    phase: 'JavaScript and TypeScript',
    track: 'Language and web',
    items: [
      c('var-vs-let-vs-const', 'high'),
      c('equality-vs-strict-equality', 'high'),
      c('null-vs-undefined', 'medium'),
      c('hoisting', 'medium'),
      c('closures', 'high'),
      c('how-does-this-work', 'high'),
      c('prototypal-inheritance', 'medium'),
      c('shallow-vs-deep-copy', 'medium'),
      c('floating-point-and-number-precision', 'medium'),
      c('event-loop', 'high'),
      c('promises-vs-async-await', 'high'),
      c('debounce-vs-throttle', 'medium'),
      c('bubbling-capturing-delegation', 'medium'),
      c('typescript-interface-vs-type', 'medium'),
      c('any-vs-unknown-vs-never', 'medium'),
      c('generics', 'medium'),
    ],
  },
  {
    id: 'oop',
    name: 'Objects and functions',
    phase: 'Objects and functions',
    track: 'Language and web',
    items: [
      c('what-is-oop', 'high'),
      c('class-vs-object', 'medium'),
      c('the-four-pillars', 'high'),
      c('composition-vs-inheritance', 'high'),
      c('interface-vs-abstract-class', 'medium'),
      c('overloading-vs-overriding', 'low'),
      c('static-members', 'low'),
      c('access-modifiers', 'low'),
      // The answer is "yes, but through prototypes", which is not an answer
      // until the prototype chain has been drawn. Recorded so the ordering
      // that put JavaScript ahead of this topic cannot quietly go back.
      c('is-javascript-object-oriented', 'medium', ['concept:prototypal-inheritance']),
      c('solid', 'high'),
      c('what-is-functional-programming', 'medium'),
      c('pure-function', 'medium'),
      c('immutability', 'medium'),
      c('higher-order-functions-and-currying', 'medium'),
      c('oop-vs-fp', 'medium'),
    ],
  },
  {
    id: 'react',
    name: 'React',
    phase: 'React',
    track: 'Language and web',
    items: [
      c('state-vs-props', 'high'),
      c('virtual-dom-and-reconciliation', 'high'),
      c('why-do-keys-matter', 'high'),
      c('when-does-a-component-re-render', 'high'),
      c('are-state-updates-synchronous', 'medium'),
      c('useeffect', 'high'),
      c('custom-hooks-and-rules-of-hooks', 'medium'),
      c('usememo-usecallback-react-memo', 'medium'),
      c('controlled-vs-uncontrolled-inputs', 'medium'),
      c('context-vs-a-state-library', 'medium'),
      c('error-boundaries', 'low'),
      c('csr-vs-ssr-vs-ssg-and-hydration', 'medium'),
      c('server-components', 'low'),
    ],
  },
  {
    id: 'web',
    name: 'The web platform',
    phase: 'The web platform',
    track: 'Language and web',
    items: [
      c('what-happens-when-you-type-a-url-and-press-enter', 'high'),
      c('dns', 'medium'),
      c('tcp-vs-udp', 'low'),
      c('tls-and-the-https-handshake', 'low'),
      c('http-methods-and-idempotency', 'high'),
      c('status-codes', 'medium'),
      c('http-caching', 'medium'),
      c('http-2-and-http-3', 'medium'),
      c('rest-vs-graphql', 'high'),
      c('polling-vs-sse-vs-websockets', 'medium'),
      c('cookies-vs-localstorage-vs-sessionstorage', 'medium'),
      c('cors', 'high'),
      c('xss-and-csrf', 'high'),
      c('authentication-vs-authorization-sessions-vs-jwt', 'high'),
      c('storing-passwords', 'medium'),
      c('oauth-2-0-and-sso', 'low'),
      c('reflow-vs-repaint', 'medium'),
      c('core-web-vitals', 'medium'),
      c('accessibility-basics', 'medium'),
    ],
  },
  {
    id: 'runtime',
    name: 'Processes, threads and memory',
    phase: 'Processes and memory',
    track: 'Language and web',
    items: [
      c('process-vs-thread', 'medium'),
      c('concurrency-vs-parallelism', 'medium'),
      c('race-conditions-and-deadlocks', 'medium'),
      c('garbage-collection', 'low'),
    ],
  },

  {
    id: 'databases',
    name: 'Databases',
    phase: 'Databases',
    track: 'Systems and design',
    items: [
      c('sql-vs-nosql', 'high'),
      c('indexes', 'high'),
      c('joins', 'medium'),
      c('normalization-vs-denormalization', 'medium'),
      c('acid', 'medium'),
      c('transaction-isolation-levels', 'low'),
      c('the-n-1-query-problem', 'medium'),
    ],
  },
  {
    id: 'sd-concepts',
    name: 'System design concepts',
    phase: 'System design concepts',
    track: 'Systems and design',
    items: [
      c('vertical-vs-horizontal-scaling', 'high'),
      c('load-balancer', 'high'),
      c('load-balancing-algorithms', 'low'),
      c('reverse-proxy-api-gateway-and-load-balancer', 'low'),
      c('caching-and-invalidation', 'high'),
      c('cdn', 'medium'),
      c('message-queues', 'medium'),
      c('rate-limiting', 'medium'),
      c('monolith-vs-microservices', 'medium'),
      c('cap-theorem', 'medium'),
      c('event-sourcing-and-cqrs', 'low'),
      c('mapreduce', 'low'),
    ],
  },
  {
    id: 'practice',
    name: 'Engineering practice',
    phase: 'Engineering practice',
    track: 'Systems and design',
    items: [
      c('types-of-tests', 'high'),
      c('tdd', 'medium'),
      c('git-merge-vs-rebase', 'high'),
      c('ci-cd', 'medium'),
      c('docker-and-containers', 'medium'),
      c('kubernetes-in-one-answer', 'low'),
      c('dry-kiss-yagni', 'medium'),
      c('design-patterns-to-be-able-to-name', 'medium'),
      c('mvc-mvp-and-mvvm', 'low'),
      c('technical-debt', 'medium'),
    ],
  },
  {
    id: 'ways',
    name: 'Ways of working',
    phase: 'Ways of working',
    track: 'Systems and design',
    items: [
      c('agile-vs-waterfall', 'low'),
      c('what-is-scrum', 'medium'),
      c('the-scrum-ceremonies', 'low'),
      c('scrum-vs-kanban', 'medium'),
      c('story-points-and-estimation', 'medium'),
      c('estimation-and-why-it-goes-wrong', 'medium'),
      c('definition-of-done', 'low'),
      c('code-review', 'high'),
      c('trunk-based-development-vs-git-flow', 'medium'),
      c('feature-flags', 'medium'),
      c('semantic-versioning', 'low'),
      c('observability-logs-metrics-traces', 'medium'),
      c('sla-slo-and-sli', 'medium'),
      c('on-call-and-incident-response', 'medium'),
      c('technical-documentation-and-adrs', 'low'),
    ],
  },

  {
    id: 'sd-exercises',
    name: 'System design exercises',
    phase: 'Design rounds',
    track: 'Systems and design',
    items: [
      g('system-design-method', 'high'),
      g('url-shortener', 'high', ['guide:system-design-method']),
      g('design-rate-limiter', 'high', ['guide:system-design-method']),
      g('design-scale-database', 'high', ['guide:system-design-method']),
      g('design-distributed-cache', 'medium', ['guide:system-design-method']),
      g('design-news-feed', 'high', ['guide:system-design-method']),
      g('design-chat', 'medium', ['guide:system-design-method']),
      g('design-notifications', 'medium', ['guide:system-design-method']),
      g('design-message-queue', 'medium', ['guide:system-design-method']),
      g('design-key-value-store', 'medium', ['guide:system-design-method']),
      g('design-video-streaming', 'medium', ['guide:system-design-method']),
      g('design-file-sync', 'low', ['guide:system-design-method']),
      g('design-geo-search', 'low', ['guide:system-design-method']),
      g('design-payments', 'medium', ['guide:system-design-method']),
      g('design-autocomplete', 'medium', ['guide:system-design-method', 'algo:trie']),
      g('design-infinite-scroll', 'medium', ['guide:system-design-method']),
      g('design-carousel', 'low', ['guide:system-design-method']),
    ],
  },
  {
    id: 'ood',
    name: 'Object-oriented design',
    phase: 'Design rounds',
    track: 'Systems and design',
    items: [
      g('ood-round', 'high', ['concept:what-is-oop', 'concept:solid']),
      g('design-parking-lot', 'high', ['guide:ood-round']),
      g('design-deck-of-cards', 'medium', ['guide:ood-round']),
      g('design-blackjack', 'low', ['guide:design-deck-of-cards']),
      g('design-connect-four', 'low', ['guide:ood-round']),
      g('design-elevator', 'medium', ['guide:ood-round']),
      g('design-bank', 'medium', ['guide:ood-round']),
      g('design-recommender', 'low', ['guide:ood-round']),
    ],
  },

  {
    id: 'rounds',
    name: 'The other rounds',
    phase: 'The interview itself',
    track: 'The interview',
    items: [
      g('the-testing-round', 'medium', ['concept:types-of-tests']),
      g('design-patterns-round', 'medium', ['concept:design-patterns-to-be-able-to-name']),
      g('concurrency-round', 'low', ['concept:race-conditions-and-deadlocks']),
      g('puzzle-questions', 'low'),
      g('intractable-problems', 'rare'),
    ],
  },
  {
    id: 'process',
    name: 'Behaviour and the offer',
    phase: 'The interview itself',
    track: 'The interview',
    items: [g('star-stories', 'high'), c('when-you-don-t-know', 'high'), g('the-offer', 'high')],
  },
]

/** Flat, in reading order. */
export const curriculumItems: Item[] = curriculum.flatMap((t) => t.items)

const byKey = new Map(curriculumItems.map((i) => [`${i.kind}:${i.id}`, i]))

export const chanceOf = (kind: ItemKind, id: string): Chance | undefined => byKey.get(`${kind}:${id}`)?.chance
