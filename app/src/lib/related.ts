/**
 * Pages worth reading next to this one, keyed by concept id.
 *
 * Hand-written for the same reason conceptVisuals is: which two pages explain
 * each other is judgement, and nothing in the data knows it. Values are the
 * `kind:id` keys the sidebar and labels already use, so smoke.ts can check
 * every one of them points at something real.
 */
export const related: Record<string, string[]> = {
  'big-o': ['algo:binary-search', 'concept:array-vs-linked-list', 'concept:memory-and-storage-by-speed'],
  'array-vs-linked-list': ['concept:how-does-a-hash-map-work', 'algo:reverse-linked-list', 'concept:big-o'],
  'how-does-a-hash-map-work': ['algo:two-sum', 'algo:group-anagrams', 'concept:array-vs-linked-list'],
  'stack-vs-queue': ['algo:min-stack', 'algo:monotonic-stack', 'algo:iterative-dfs'],
  recursion: ['algo:recursion', 'algo:backtracking-subsets', 'algo:merge-sort'],
  'trees-graphs-bfs-vs-dfs': ['algo:bfs-grid', 'algo:inorder-traversal', 'algo:topological-sort'],
  'memory-and-storage-by-speed': ['concept:big-o', 'concept:caching-and-invalidation'],

  closures: ['concept:useeffect', 'concept:hoisting', 'concept:var-vs-let-vs-const'],
  hoisting: ['concept:var-vs-let-vs-const', 'concept:closures'],
  'var-vs-let-vs-const': ['concept:hoisting', 'concept:closures'],
  'event-loop': ['concept:promises-vs-async-await', 'concept:debounce-vs-throttle', 'concept:concurrency-vs-parallelism'],
  'promises-vs-async-await': ['concept:event-loop', 'concept:race-conditions-and-deadlocks'],
  'how-does-this-work': ['concept:closures', 'concept:prototypal-inheritance'],
  'prototypal-inheritance': ['concept:is-javascript-object-oriented', 'concept:how-does-this-work'],
  'shallow-vs-deep-copy': ['concept:immutability', 'concept:why-do-keys-matter'],
  'debounce-vs-throttle': ['concept:event-loop', 'concept:rate-limiting'],

  useeffect: ['concept:closures', 'concept:when-does-a-component-re-render', 'concept:custom-hooks-and-rules-of-hooks'],
  'when-does-a-component-re-render': ['concept:usememo-usecallback-react-memo', 'concept:state-vs-props', 'concept:virtual-dom-and-reconciliation'],
  'why-do-keys-matter': ['concept:virtual-dom-and-reconciliation', 'concept:shallow-vs-deep-copy'],
  'virtual-dom-and-reconciliation': ['concept:why-do-keys-matter', 'concept:when-does-a-component-re-render'],
  'state-vs-props': ['concept:when-does-a-component-re-render', 'concept:controlled-vs-uncontrolled-inputs'],
  'usememo-usecallback-react-memo': ['concept:when-does-a-component-re-render', 'concept:pure-function'],
  'csr-vs-ssr-vs-ssg-and-hydration': ['concept:core-web-vitals', 'concept:server-components', 'concept:cdn'],

  'what-happens-when-you-type-a-url-and-press-enter': ['concept:dns', 'concept:tls-and-the-https-handshake', 'concept:http-caching'],
  dns: ['concept:what-happens-when-you-type-a-url-and-press-enter', 'concept:cdn'],
  cors: ['concept:xss-and-csrf', 'concept:http-methods-and-idempotency'],
  'xss-and-csrf': ['concept:cors', 'concept:authentication-vs-authorization-sessions-vs-jwt', 'concept:cookies-vs-localstorage-vs-sessionstorage'],
  'authentication-vs-authorization-sessions-vs-jwt': ['concept:cookies-vs-localstorage-vs-sessionstorage', 'concept:storing-passwords', 'concept:oauth-2-0-and-sso'],
  'http-caching': ['concept:cdn', 'concept:caching-and-invalidation'],
  'rest-vs-graphql': ['concept:the-n-1-query-problem', 'concept:http-methods-and-idempotency'],
  'polling-vs-sse-vs-websockets': ['guide:design-chat', 'guide:design-notifications'],

  'process-vs-thread': ['concept:concurrency-vs-parallelism', 'concept:race-conditions-and-deadlocks'],
  'concurrency-vs-parallelism': ['concept:process-vs-thread', 'concept:event-loop'],
  'race-conditions-and-deadlocks': ['guide:concurrency-round', 'concept:transaction-isolation-levels'],
  'garbage-collection': ['concept:closures', 'concept:memory-and-storage-by-speed'],

  indexes: ['concept:sql-vs-nosql', 'algo:binary-search', 'concept:the-n-1-query-problem'],
  'sql-vs-nosql': ['concept:indexes', 'concept:normalization-vs-denormalization', 'concept:cap-theorem'],
  acid: ['concept:transaction-isolation-levels', 'concept:cap-theorem'],
  'the-n-1-query-problem': ['concept:joins', 'concept:rest-vs-graphql'],
  'cap-theorem': ['concept:sql-vs-nosql', 'guide:design-key-value-store'],
  'caching-and-invalidation': ['concept:cdn', 'concept:http-caching', 'guide:design-distributed-cache'],
  'load-balancer': ['concept:load-balancing-algorithms', 'concept:vertical-vs-horizontal-scaling', 'concept:reverse-proxy-api-gateway-and-load-balancer'],
  'vertical-vs-horizontal-scaling': ['concept:load-balancer', 'guide:design-scale-database'],
  'message-queues': ['guide:design-message-queue', 'concept:monolith-vs-microservices'],
  'rate-limiting': ['guide:design-rate-limiter', 'concept:debounce-vs-throttle'],
  'monolith-vs-microservices': ['concept:message-queues', 'concept:observability-logs-metrics-traces'],

  'types-of-tests': ['guide:the-testing-round', 'concept:tdd'],
  tdd: ['concept:types-of-tests', 'guide:the-testing-round'],
  'git-merge-vs-rebase': ['concept:trunk-based-development-vs-git-flow', 'concept:ci-cd'],
  'ci-cd': ['concept:feature-flags', 'concept:trunk-based-development-vs-git-flow', 'concept:docker-and-containers'],
  'design-patterns-to-be-able-to-name': ['guide:design-patterns-round', 'concept:solid'],
  solid: ['concept:composition-vs-inheritance', 'guide:ood-round', 'concept:design-patterns-to-be-able-to-name'],
  'composition-vs-inheritance': ['concept:solid', 'concept:the-four-pillars'],
  'what-is-oop': ['concept:the-four-pillars', 'concept:is-javascript-object-oriented', 'guide:ood-round'],
  'code-review': ['concept:trunk-based-development-vs-git-flow', 'concept:technical-debt'],
  'when-you-don-t-know': ['guide:when-you-are-stuck', 'guide:star-stories'],
}
