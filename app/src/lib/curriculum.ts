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
 * clever. Grokking puts recursion third, before quicksort needs it;
 * Common-Sense puts it at ten, before dynamic programming at twelve and trees
 * at fourteen. Every one of them does linear structures before trees, trees
 * before graphs, and graphs before dynamic programming. Skiena and EPI both
 * leave design, concurrency and domain problems until after the algorithms.
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

export type ItemKind = 'algo' | 'concept' | 'guide' | 'page'
export type Item = { kind: ItemKind; id: string; chance: Chance }
export type Topic = { id: string; name: string; phase: string; items: Item[] }

const a = (id: string, chance: Chance): Item => ({ kind: 'algo', id, chance })
const c = (id: string, chance: Chance): Item => ({ kind: 'concept', id, chance })
const g = (id: string, chance: Chance): Item => ({ kind: 'guide', id, chance })
const p = (id: string, chance: Chance): Item => ({ kind: 'page', id, chance })

export const curriculum: Topic[] = [
  {
    id: 'start',
    name: 'Start here',
    phase: 'Before anything else',
    items: [p('router', 'high'), g('attacking-a-new-problem', 'high'), p('board', 'high'), g('when-you-are-stuck', 'medium')],
  },

  {
    id: 'complexity',
    name: 'Cost, and where things live',
    phase: 'Foundations',
    items: [c('big-o', 'high'), c('array-vs-linked-list', 'high'), c('memory-and-storage-by-speed', 'low')],
  },
  {
    id: 'arrays',
    name: 'Arrays and strings',
    phase: 'Foundations',
    items: [
      a('two-pointers', 'high'),
      a('sliding-window', 'high'),
      a('prefix-sums', 'medium'),
      a('kadane', 'medium'),
      a('group-anagrams', 'medium'),
      a('matrix-rotate', 'low'),
      a('cyclic-sort', 'low'),
    ],
  },
  {
    id: 'hash-maps',
    name: 'Hash maps',
    phase: 'Foundations',
    items: [c('how-does-a-hash-map-work', 'high'), a('two-sum', 'high')],
  },
  {
    id: 'stacks-queues',
    name: 'Stacks and queues',
    phase: 'Foundations',
    items: [c('stack-vs-queue', 'high'), a('min-stack', 'low'), a('monotonic-stack', 'medium')],
  },
  {
    id: 'linked-lists',
    name: 'Linked lists',
    phase: 'Foundations',
    items: [a('reverse-linked-list', 'high'), a('fast-slow-pointers', 'medium'), a('lru-cache', 'medium')],
  },

  {
    id: 'searching',
    name: 'Searching',
    phase: 'Core algorithms',
    items: [a('binary-search', 'high'), a('binary-search-answer', 'medium'), a('quickselect', 'low')],
  },
  {
    id: 'sorting',
    name: 'Sorting',
    phase: 'Core algorithms',
    items: [
      a('bubble-sort', 'rare'),
      a('selection-sort', 'rare'),
      a('insertion-sort', 'low'),
      a('merge-sort', 'medium'),
      a('quick-sort', 'medium'),
      a('heap-sort', 'low'),
      a('counting-sort', 'low'),
      a('bucket-sort', 'rare'),
      a('radix-sort', 'rare'),
      a('count-inversions', 'rare'),
    ],
  },
  {
    id: 'intervals',
    name: 'Intervals',
    phase: 'Core algorithms',
    items: [a('merge-intervals', 'medium')],
  },
  {
    id: 'recursion',
    name: 'Recursion',
    phase: 'Core algorithms',
    items: [c('recursion', 'high'), a('recursion', 'high'), a('iterative-dfs', 'medium'), a('backtracking-subsets', 'high')],
  },

  {
    id: 'trees',
    name: 'Trees, heaps and tries',
    phase: 'Structures built on recursion',
    items: [
      c('trees-graphs-bfs-vs-dfs', 'high'),
      a('inorder-traversal', 'high'),
      a('bst-delete', 'low'),
      a('min-heap', 'high'),
      a('heapify', 'medium'),
      a('trie', 'low'),
    ],
  },
  {
    id: 'graphs',
    name: 'Graphs',
    phase: 'Structures built on recursion',
    items: [
      a('bfs-grid', 'high'),
      a('topological-sort', 'medium'),
      a('union-find', 'low'),
      a('dijkstra', 'low'),
      a('kruskal', 'rare'),
      a('prim', 'rare'),
    ],
  },

  {
    id: 'dp',
    name: 'Dynamic programming',
    phase: 'Optimisation',
    items: [a('coin-change', 'medium'), a('knapsack-01', 'medium'), a('edit-distance', 'medium')],
  },
  {
    id: 'greedy',
    name: 'Greedy',
    phase: 'Optimisation',
    items: [a('jump-game', 'low')],
  },
  {
    id: 'bits-math',
    name: 'Bits and maths',
    phase: 'Optimisation',
    items: [a('bit-manipulation', 'low'), a('count-bits', 'low'), a('sieve', 'rare')],
  },
  {
    id: 'advanced',
    name: 'Further afield',
    phase: 'Optimisation',
    items: [a('segment-tree', 'rare'), a('kmp', 'rare'), a('reservoir-sampling', 'rare')],
  },

  {
    id: 'oop',
    name: 'Objects and functions',
    phase: 'The language',
    items: [
      c('what-is-oop', 'high'),
      c('class-vs-object', 'medium'),
      c('the-four-pillars', 'high'),
      c('composition-vs-inheritance', 'high'),
      c('interface-vs-abstract-class', 'medium'),
      c('overloading-vs-overriding', 'low'),
      c('static-members', 'low'),
      c('access-modifiers', 'low'),
      c('is-javascript-object-oriented', 'medium'),
      c('solid', 'high'),
      c('what-is-functional-programming', 'medium'),
      c('pure-function', 'medium'),
      c('immutability', 'medium'),
      c('higher-order-functions-and-currying', 'medium'),
      c('oop-vs-fp', 'medium'),
    ],
  },
  {
    id: 'js',
    name: 'JavaScript and TypeScript',
    phase: 'The language',
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
    id: 'react',
    name: 'React',
    phase: 'The language',
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
    phase: 'The language',
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
    phase: 'The language',
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
    phase: 'Systems',
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
    phase: 'Systems',
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
    phase: 'Systems',
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
    phase: 'Systems',
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
    items: [
      g('system-design-method', 'high'),
      g('url-shortener', 'high'),
      g('design-rate-limiter', 'high'),
      g('design-scale-database', 'high'),
      g('design-distributed-cache', 'medium'),
      g('design-news-feed', 'high'),
      g('design-chat', 'medium'),
      g('design-notifications', 'medium'),
      g('design-message-queue', 'medium'),
      g('design-key-value-store', 'medium'),
      g('design-video-streaming', 'medium'),
      g('design-file-sync', 'low'),
      g('design-geo-search', 'low'),
      g('design-payments', 'medium'),
      g('design-autocomplete', 'medium'),
      g('design-infinite-scroll', 'medium'),
      g('design-carousel', 'low'),
    ],
  },
  {
    id: 'ood',
    name: 'Object-oriented design',
    phase: 'Design rounds',
    items: [
      g('ood-round', 'high'),
      g('design-parking-lot', 'high'),
      g('design-deck-of-cards', 'medium'),
      g('design-blackjack', 'low'),
      g('design-connect-four', 'low'),
      g('design-elevator', 'medium'),
      g('design-bank', 'medium'),
      g('design-recommender', 'low'),
    ],
  },

  {
    id: 'rounds',
    name: 'The other rounds',
    phase: 'The interview itself',
    items: [
      g('the-testing-round', 'medium'),
      g('design-patterns-round', 'medium'),
      g('concurrency-round', 'low'),
      g('puzzle-questions', 'low'),
      g('intractable-problems', 'rare'),
    ],
  },
  {
    id: 'process',
    name: 'Process, behaviour and the offer',
    phase: 'The interview itself',
    items: [g('the-loop', 'high'), g('star-stories', 'high'), c('when-you-don-t-know', 'high'), g('the-offer', 'high')],
  },
]

/** Flat, in reading order. */
export const curriculumItems: Item[] = curriculum.flatMap((t) => t.items)

export const chanceOf = (kind: ItemKind, id: string): Chance | undefined =>
  curriculumItems.find((i) => i.kind === kind && i.id === id)?.chance
