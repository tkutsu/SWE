import type { Visual } from './visual'

/**
 * The parts of interview prep that are neither an algorithm to step through nor
 * a one-minute definition: system design exercises and behavioural stories.
 */
export type GuideSection = { heading: string; body?: string; items?: string[] }
export type Guide = { id: string; title: string; blurb: string; visual?: Visual | Visual[]; sections: GuideSection[] }
export type GuideGroup = { id: string; name: string; guides: Guide[] }

export const guideGroups: GuideGroup[] = [
  {
    id: 'design-exercises',
    name: 'System design exercises',
    guides: [
      {
        id: 'url-shortener',
        title: 'Design a URL shortener',
        blurb: 'The standard warm-up. Read-heavy, simple data model, and the interesting part is key generation.',
        visual: {
          kind: 'flow',
          nodes: [
            { id: 'c', label: 'client', x: 0, y: 1, tone: 'neutral' },
            { id: 'l', label: 'load balancer', x: 1, y: 1, tone: 'accent' },
            { id: 'a', label: 'app servers', sub: 'stateless', x: 2, y: 1, tone: 'good' },
            { id: 'k', label: 'cache', sub: 'hot short codes', x: 3, y: 0, tone: 'good' },
            { id: 'd', label: 'key-value store', sub: 'code -> long URL', x: 3, y: 1, tone: 'accent' },
            { id: 'i', label: 'ID generator', sub: 'counter, base62', x: 3, y: 2, tone: 'accent' },
          ],
          edges: [
            { from: 'c', to: 'l' },
            { from: 'l', to: 'a' },
            { from: 'a', to: 'k', label: 'read', tone: 'good' },
            { from: 'a', to: 'd', label: 'miss' },
            { from: 'a', to: 'i', label: 'write' },
          ],
          caption: 'Reads outnumber writes by orders of magnitude, so the whole design bends towards making the redirect fast: cache aggressively and return a 301 or 302 with nothing else in the path.',
        },
        sections: [
          {
            heading: 'Pin the requirements first',
            items: [
              'Shorten a long URL, redirect a short code. That is the whole functional scope.',
              'Custom aliases and expiry: ask, do not assume.',
              'Analytics on clicks: ask. It changes the write path completely.',
              'Scale: say a number out loud. 100M new URLs a month, read to write around 100:1.',
            ],
          },
          {
            heading: 'Key generation is the actual question',
            items: [
              'Hash the URL and take the first 7 characters: collisions must be detected and retried.',
              'A global counter encoded in base62: no collisions, but the counter is a bottleneck and codes are guessable.',
              'Pre-generated key pool handed out in blocks: removes the hot counter, adds a service to run.',
              '62^7 is about 3.5 trillion, so 7 characters is plenty. Say that rather than hand-waving.',
            ],
          },
          {
            heading: 'Data model and storage',
            body: 'One table: short code as the primary key, long URL, owner, created at, expires at. There are no joins and no relations, so a key-value store fits and shards trivially on the code.',
          },
          {
            heading: 'Where it gets interesting',
            items: [
              '301 is cached by the browser forever, which kills your analytics. 302 keeps traffic flowing through you.',
              'Cache the hot tail: a small fraction of codes take most of the reads.',
              'Custom aliases need a uniqueness check, which is the one place you need a real conditional write.',
              'Expiry is a background sweep, not a check on every read.',
            ],
          },
        ],
      },
      {
        id: 'design-rate-limiter',
        title: 'Design a rate limiter',
        blurb: 'Where it sits matters more than the algorithm, and distributed counting is the real difficulty.',
        visual: {
          kind: 'flow',
          nodes: [
            { id: 'c', label: 'client', x: 0, y: 0, tone: 'neutral' },
            { id: 'g', label: 'gateway', sub: 'limiter lives here', x: 1, y: 0, tone: 'accent' },
            { id: 'r', label: 'Redis', sub: 'shared counters', x: 1, y: 1, tone: 'accent' },
            { id: 'a', label: 'app', x: 2, y: 0, tone: 'good' },
            { id: 'x', label: '429 + Retry-After', x: 2, y: 1, tone: 'bad' },
          ],
          edges: [
            { from: 'c', to: 'g' },
            { from: 'g', to: 'r', label: 'INCR', dashed: true },
            { from: 'g', to: 'a', label: 'under limit', tone: 'good' },
            { from: 'g', to: 'x', label: 'over', tone: 'bad' },
          ],
          caption: 'At the gateway rather than in the app, so rejected traffic never reaches your business logic. The counters must be shared, or each instance enforces its own separate limit.',
        },
        sections: [
          {
            heading: 'Requirements to nail down',
            items: [
              'Limit per what? User, IP, API key, endpoint. Usually a combination.',
              'Hard limit or a burst allowance?',
              'Reject with 429, or queue and slow down?',
              'Does the client need to know its remaining quota? That means response headers.',
            ],
          },
          {
            heading: 'The algorithms, and what each gives up',
            items: [
              'Fixed window: one counter per minute. Simple, but allows double the limit across a boundary.',
              'Sliding window log: exact, stores a timestamp per request, memory heavy.',
              'Sliding window counter: weighted blend of two windows. The usual compromise.',
              'Token bucket: refills at a steady rate, allows a controlled burst. The most common answer.',
              'Leaky bucket: smooths output to a fixed rate, good for protecting a slow downstream.',
            ],
          },
          {
            heading: 'Distributed is the hard part',
            body: 'Counters in process memory mean ten instances allow ten times the limit. Shared Redis fixes correctness and adds a network hop plus a dependency on the critical path. A read-modify-write race needs a Lua script or an atomic INCR with expiry, not a GET then SET.',
          },
          {
            heading: 'Do not forget',
            items: [
              'Return Retry-After so clients back off instead of hammering.',
              'Decide what happens when Redis is down: fail open and let traffic through, or fail closed and reject. Say which and why.',
              'Rate limiting is not DDoS protection. That happens further out.',
            ],
          },
        ],
      },
      {
        id: 'design-news-feed',
        title: 'Design a news feed',
        blurb: 'The whole exercise is one tradeoff: do the work when someone posts, or when someone reads.',
        visual: {
          kind: 'compare',
          columns: [
            {
              title: 'Fan-out on write',
              sub: 'push',
              tone: 'good',
              rows: [
                'On post, insert into every follower feed',
                'Reads are a single fast lookup',
                'A celebrity post means millions of writes',
                'Wasteful for inactive users',
              ],
            },
            {
              title: 'Fan-out on read',
              sub: 'pull',
              tone: 'accent',
              rows: [
                'On read, gather posts from everyone followed',
                'Writes are cheap',
                'Reads are slow and hit many shards',
                'Always fresh',
              ],
            },
          ],
          caption: 'Real systems do both. Push for ordinary accounts, pull for the handful with enormous follower counts, and merge the two at read time. Saying that hybrid out loud is what the question is testing.',
        },
        sections: [
          {
            heading: 'Requirements',
            items: [
              'Post, follow, view a feed. Ranked or reverse chronological? Ask, it changes everything.',
              'How large is the follower distribution? The tail is what breaks naive designs.',
              'Read to write ratio: heavily read-dominated.',
              'Does the feed need to be real time, or is a minute of lag fine?',
            ],
          },
          {
            heading: 'Core components',
            items: [
              'Post service writes to a post store.',
              'Graph service answers "who follows whom".',
              'Fan-out worker pushes post ids into per-user feed lists, usually in Redis.',
              'Feed service reads the list, hydrates the posts, applies ranking.',
            ],
          },
          {
            heading: 'Things that earn points',
            items: [
              'Store post ids in the feed, not whole posts. Hydrate at read time so edits and deletes work.',
              'Cap each feed list. Nobody scrolls to post 5000.',
              'Async fan-out through a queue, so posting stays fast and a slow fan-out cannot block it.',
              'Ranking turns this into a machine learning problem. Acknowledge it, then scope it out unless asked.',
            ],
          },
        ],
      },
      {
        id: 'design-chat',
        title: 'Design a chat app',
        blurb: 'Connection state is the difficulty. Everything else is a message store with an index.',
        visual: {
          kind: 'flow',
          nodes: [
            { id: 'a', label: 'client A', x: 0, y: 0, tone: 'neutral' },
            { id: 'w', label: 'WebSocket server', sub: 'holds connections', x: 1, y: 0, tone: 'accent' },
            { id: 'r', label: 'presence / routing', sub: 'who is on which server', x: 1, y: 1, tone: 'accent' },
            { id: 'q', label: 'message queue', x: 2, y: 1, tone: 'good' },
            { id: 's', label: 'message store', sub: 'by conversation', x: 3, y: 1, tone: 'good' },
            { id: 'b', label: 'client B', x: 3, y: 0, tone: 'neutral' },
          ],
          edges: [
            { from: 'a', to: 'w', label: 'send' },
            { from: 'w', to: 'r', dashed: true },
            { from: 'w', to: 'q' },
            { from: 'q', to: 's', tone: 'good' },
            { from: 'q', to: 'b', label: 'deliver', tone: 'good' },
          ],
          caption: 'WebSocket servers are stateful, which is the whole problem: the recipient is connected to a different server, so you need a routing layer that knows where everyone is.',
        },
        sections: [
          {
            heading: 'Requirements',
            items: [
              'One to one, groups, or both? Group size caps matter.',
              'Delivery receipts, read receipts, typing indicators, presence.',
              'History: how far back, and searchable?',
              'Offline delivery and push notifications.',
            ],
          },
          {
            heading: 'Transport',
            body: 'WebSockets for the live path, because the server needs to push. Fall back to long polling. HTTP for history, search and anything that is not real time, so the socket carries only what it must.',
          },
          {
            heading: 'Storage',
            items: [
              'Partition by conversation id so a chat history is one contiguous read.',
              'Messages are append only and never updated, which makes a wide-column store a natural fit.',
              'A monotonic message id per conversation gives ordering and lets clients detect gaps.',
            ],
          },
          {
            heading: 'The bits people miss',
            items: [
              'Delivery is at-least-once, so clients must dedupe on message id.',
              'A client id generated before sending lets you match the echo to the optimistic local message.',
              'Presence is expensive at scale and usually approximated with a heartbeat plus a TTL.',
              'Say something about end-to-end encryption, even just where the keys would live.',
            ],
          },
        ],
      },
      {
        id: 'design-autocomplete',
        title: 'Frontend: design an autocomplete widget',
        blurb: 'The frontend design question most likely to come up, and the one where race conditions bite.',
        visual: {
          kind: 'flow',
          nodes: [
            { id: 'k', label: 'keystroke', x: 0, y: 0, tone: 'neutral' },
            { id: 'd', label: 'debounce', sub: '~250ms', x: 1, y: 0, tone: 'accent' },
            { id: 'c', label: 'cache', sub: 'by query prefix', x: 2, y: 0, tone: 'good' },
            { id: 'f', label: 'fetch', sub: 'abort the previous', x: 3, y: 0, tone: 'accent' },
            { id: 'r', label: 'render', sub: 'only if still current', x: 3, y: 1, tone: 'good' },
            { id: 's', label: 'stale response', sub: 'dropped', x: 2, y: 1, tone: 'bad' },
          ],
          edges: [
            { from: 'k', to: 'd' },
            { from: 'd', to: 'c' },
            { from: 'c', to: 'f', label: 'miss' },
            { from: 'c', to: 'r', label: 'hit', tone: 'good' },
            { from: 'f', to: 'r', tone: 'good' },
            { from: 'f', to: 's', label: 'out of order', tone: 'bad', dashed: true },
          ],
          caption: 'The bug interviewers look for: type "ca", then "cat", and the slower "ca" response lands last and overwrites the correct results. AbortController, or comparing the query on arrival, is the fix.',
        },
        sections: [
          {
            heading: 'Structure your answer',
            items: [
              'Requirements: min characters, debounce delay, result count, keyboard support, highlighting.',
              'Component API: value, onChange, onSelect, fetchSuggestions, renderItem, minLength, debounceMs.',
              'State model: query, results, loading, error, highlightedIndex, isOpen.',
              'Network: debounce, abort in flight, cache by query, handle empty and error states.',
            ],
          },
          {
            heading: 'Performance',
            items: [
              'Debounce keystrokes, do not throttle. You want the pause, not a steady rate.',
              'Cache per query string; prefix caching lets you filter locally as they keep typing.',
              'Virtualise only if the list can be long. Usually it is capped at ten.',
            ],
          },
          {
            heading: 'Accessibility, and this is where you stand out',
            items: [
              'role="combobox" on the input, aria-expanded, aria-controls pointing at the listbox.',
              'aria-activedescendant to mark the highlighted option without moving focus.',
              'Arrow keys move the highlight, Enter selects, Escape closes, Tab closes and moves on.',
              'Announce result counts through a polite live region.',
            ],
          },
        ],
      },
      {
        id: 'design-infinite-scroll',
        title: 'Frontend: design an infinite scroll feed',
        blurb: 'Easy to build badly. The interesting parts are memory, scroll anchoring and what happens on back.',
        visual: {
          kind: 'flow',
          nodes: [
            { id: 's', label: 'sentinel', sub: 'near the bottom', x: 0, y: 0, tone: 'accent' },
            { id: 'i', label: 'IntersectionObserver', x: 1, y: 0, tone: 'accent' },
            { id: 'f', label: 'fetch next page', sub: 'cursor, not offset', x: 2, y: 0, tone: 'good' },
            { id: 'a', label: 'append items', x: 3, y: 0, tone: 'good' },
            { id: 'w', label: 'windowing', sub: 'unmount far rows', x: 3, y: 1, tone: 'good' },
          ],
          edges: [
            { from: 's', to: 'i', label: 'visible' },
            { from: 'i', to: 'f' },
            { from: 'f', to: 'a', tone: 'good' },
            { from: 'a', to: 'w', label: 'if long', tone: 'good' },
            { from: 'a', to: 's', label: 'moves down', dashed: true },
          ],
          caption: 'IntersectionObserver rather than a scroll listener: no per-frame work, and the browser does the measuring. Cursor pagination rather than offset, or new items inserted at the top will shift everything and duplicate a row.',
        },
        sections: [
          {
            heading: 'Requirements',
            items: [
              'Page size, and whether new items can arrive at the top while scrolling.',
              'Does the back button need to restore scroll position and loaded pages?',
              'How long can the list get? That decides whether you need windowing.',
              'Is a "load more" button acceptable? It is better for accessibility and often the right answer.',
            ],
          },
          {
            heading: 'The parts that go wrong',
            items: [
              'Offset pagination duplicates or skips items when the underlying list changes. Use a cursor.',
              'Without windowing, ten thousand DOM nodes make scrolling janky and leak memory.',
              'Images without dimensions cause layout shift as they load, which moves content under the reader.',
              'Reserve space with skeletons so the sentinel does not immediately re-trigger.',
            ],
          },
          {
            heading: 'Accessibility',
            body: 'Infinite scroll traps keyboard users away from the footer and hides the total. Provide a real "load more" control, announce new items in a live region, and keep focus stable when items are appended.',
          },
        ],
      },
      {
        id: 'design-carousel',
        title: 'Frontend: design an image carousel',
        blurb: 'Deceptively simple. Preloading, gestures and accessibility are where the substance is.',
        visual: {
          kind: 'stack',
          layers: [
            { label: 'Track', detail: 'one flex row, moved with transform: translateX', tone: 'good' },
            { label: 'Slides', detail: 'current plus one either side kept mounted', tone: 'good' },
            { label: 'Preload', detail: 'fetch neighbours early, lazy-load the rest', tone: 'accent' },
            { label: 'Controls', detail: 'prev, next, dots, all real buttons', tone: 'accent' },
            { label: 'Autoplay', detail: 'pause on hover, focus and reduced motion', tone: 'neutral' },
          ],
          caption: 'Animate with transform, never with left or margin. Transform runs on the compositor and stays smooth; changing left forces layout on every frame.',
        },
        sections: [
          {
            heading: 'Component API',
            items: [
              'items, initialIndex, onChange, loop, autoplayMs, renderItem.',
              'Controlled and uncontrolled index, the same choice as a form input.',
            ],
          },
          {
            heading: 'Behaviour worth raising',
            items: [
              'Looping: duplicate the first and last slide, or reset position without a transition at the seam.',
              'Touch: follow the finger, then decide on release by distance and velocity, not distance alone.',
              'Only mount the neighbours. Mounting fifty slides is what makes these slow.',
              'Resize and orientation change need a re-measure.',
            ],
          },
          {
            heading: 'Accessibility',
            items: [
              'Arrows are buttons with real labels, not divs with click handlers.',
              'Dots are a tablist, or at minimum buttons that say which slide they go to.',
              'Autoplay must pause on hover and on focus, and never start under prefers-reduced-motion.',
              'Announce slide changes politely, and do not trap focus inside the carousel.',
            ],
          },
        ],
      },
      {
        id: 'design-distributed-cache',
        title: 'Design a distributed cache',
        blurb: 'The question behind half the other answers. Everyone says "add a cache"; this is what that sentence costs.',
        visual: [
          {
            kind: 'flow',
            nodes: [
              { id: 'a', label: 'app server', x: 0, y: 1, tone: 'neutral' },
              { id: 'h', label: 'hash the key', sub: 'to a point on the ring', x: 1, y: 1, tone: 'accent' },
              { id: 'n1', label: 'node A', sub: 'keys 0 - 85', x: 2, y: 0, tone: 'good' },
              { id: 'n2', label: 'node B', sub: 'keys 86 - 170', x: 2, y: 1, tone: 'good' },
              { id: 'n3', label: 'node C', sub: 'keys 171 - 255', x: 2, y: 2, tone: 'good' },
              { id: 'd', label: 'database', sub: 'on a miss only', x: 3, y: 1, tone: 'accent' },
            ],
            edges: [
              { from: 'a', to: 'h' },
              { from: 'h', to: 'n1' },
              { from: 'h', to: 'n2' },
              { from: 'h', to: 'n3' },
              { from: 'n2', to: 'd', label: 'miss', dashed: true },
            ],
            caption:
              'The client works out which node holds a key rather than asking anybody, so there is no coordinator to become a bottleneck. Everything interesting is about what happens when the number of nodes changes.',
          },
          {
            kind: 'compare',
            columns: [
              {
                title: 'key % N',
                sub: 'the obvious answer',
                tone: 'bad',
                rows: [
                  'Add one node and N changes',
                  'Almost every key now hashes elsewhere',
                  'The entire cache misses at once',
                  'Every miss goes to the database',
                  'The database falls over',
                ],
              },
              {
                title: 'Consistent hashing',
                sub: 'what gets used',
                tone: 'good',
                rows: [
                  'Nodes and keys sit on one ring',
                  'A key belongs to the next node clockwise',
                  'Adding a node moves only its neighbour arc',
                  'Roughly 1/N of keys move, not all of them',
                  'Virtual nodes even out the arcs',
                ],
              },
            ],
            caption:
              'This is the whole reason consistent hashing exists, and stating the failure before the fix is a better answer than naming the fix on its own.',
          },
        ],
        sections: [
          {
            heading: 'Say what it is for before you design it',
            items: [
              'Read-heavy data that is expensive to compute and tolerable slightly stale.',
              'Give a hit rate target out loud. 90 percent and 99 percent are different systems.',
              'Cache aside, read through or write through: pick one and say why.',
              'Cache aside is the usual answer: the app checks the cache, misses, reads the database, writes it back.',
            ],
          },
          {
            heading: 'Eviction, which is the only interesting policy question',
            items: [
              'LRU is the default and is roughly right for almost everything.',
              'LFU keeps things that are popular over time rather than recently, which suits a long tail.',
              'TTL is not an eviction policy, it is a correctness bound. Set it even when you have LRU.',
              'Memory is finite by design here. A cache that never evicts is a database with worse durability.',
            ],
          },
          {
            heading: 'The three failure modes worth naming',
            items: [
              'Stampede, or thundering herd: a hot key expires and a thousand requests all miss and all hit the database at once. Fix with a lock so one request refills, or by refreshing slightly before expiry.',
              'Penetration: requests for a key that does not exist anywhere, so the cache never helps. Cache the negative result, or put a Bloom filter in front.',
              'Avalanche: a large set of keys given the same TTL all expire together. Add jitter to the TTL.',
            ],
          },
          {
            heading: 'Invalidation, said honestly',
            body: 'There are two real options and both are wrong in different ways. A TTL means serving stale data for up to the TTL, which you accept deliberately. Explicit invalidation on write means being correct until the moment an invalidation is lost or races with a read, at which point the stale value can live forever. Most systems use both: explicit invalidation for correctness, and a TTL as the backstop for when it fails.',
          },
        ],
      },
      {
        id: 'design-scale-database',
        title: 'Scale a database',
        blurb: 'The follow-up to almost every design answer. There is an order to these moves, and jumping to sharding first is the mistake.',
        visual: {
          kind: 'stack',
          shape: 'pyramid',
          layers: [
            { label: 'Index the query', detail: 'Free, reversible, and usually it was this all along', tone: 'good' },
            { label: 'Add cache', detail: 'Removes reads, not writes. Buys an order of magnitude', tone: 'good' },
            { label: 'Read replicas', detail: 'Reads scale out. Now you own replication lag', tone: 'accent' },
            { label: 'Vertical scaling', detail: 'A bigger machine. Simple, finite, and expensive', tone: 'accent' },
            { label: 'Shard', detail: 'Writes finally scale. Cross-shard joins stop existing', tone: 'bad' },
          ],
          caption:
            'Go down this list in order and stop at the first level that works. Each step costs more operational complexity than the one above it, and sharding is a one-way door: you can add a replica on a Tuesday, but unsharding is a migration.',
        },
        sections: [
          {
            heading: 'Work out which resource ran out',
            items: [
              'Reads, writes, storage and connections fail differently and have different fixes.',
              'Too many reads is the easy case: cache, then replicas.',
              'Too many writes is the hard case, and it is the only one that actually forces sharding.',
              'Out of storage on one box also forces sharding, but without the write contention.',
            ],
          },
          {
            heading: 'Replication and the lag you just bought',
            items: [
              'One primary takes writes, replicas take reads and follow asynchronously.',
              'A user writes, then immediately reads from a replica and does not see their own comment. This will be asked.',
              'Fix by reading your own writes from the primary for a short window after a write, or by pinning that session to the primary.',
              'Synchronous replication removes the lag and adds the replica round trip to every write. That is the trade, say it as one.',
            ],
          },
          {
            heading: 'Choosing a shard key, which is the whole question',
            items: [
              'Range: easy range scans, and hot spots when the key is sequential, like a timestamp.',
              'Hash: even distribution, and range queries now hit every shard.',
              'Directory: a lookup service maps key to shard, so you can rebalance freely, and now that service is on the critical path.',
              'The key has to be in almost every query. Pick one that is not and every read becomes a scatter-gather.',
            ],
          },
          {
            heading: 'What you give up',
            body: 'Joins across shards, which means denormalising or doing the join in the application. Transactions across shards, which means either two-phase commit and its latency, or an idempotent saga that compensates on failure. Auto-increment ids, since two shards will both hand out 1000, so you move to UUIDs or a snowflake-style id. None of these are fatal and all of them are work, which is why sharding sits at the bottom of the pyramid.',
          },
        ],
      },
      {
        id: 'design-notifications',
        title: 'Design a notification system',
        blurb: 'Push, SMS and email through one pipe. It looks like plumbing, and the interesting part is what happens when a send fails.',
        visual: {
          kind: 'flow',
          nodes: [
            { id: 's', label: 'services', sub: 'anything that notifies', x: 0, y: 1, tone: 'neutral' },
            { id: 'a', label: 'notification API', sub: 'validates, dedupes', x: 1, y: 1, tone: 'accent' },
            { id: 'q', label: 'queue', sub: 'one per channel', x: 2, y: 1, tone: 'good' },
            { id: 'w', label: 'workers', sub: 'rate limited per provider', x: 3, y: 1, tone: 'good' },
            { id: 'p', label: 'APNs, FCM, SES, Twilio', x: 4, y: 0, tone: 'accent' },
            { id: 'dl', label: 'dead letter queue', sub: 'after n retries', x: 4, y: 2, tone: 'bad' },
          ],
          edges: [
            { from: 's', to: 'a' },
            { from: 'a', to: 'q' },
            { from: 'q', to: 'w' },
            { from: 'w', to: 'p', label: 'send' },
            { from: 'w', to: 'dl', label: 'gave up', tone: 'bad' },
          ],
          caption:
            'The queue is the design. It decouples a service that wants to notify from a third party that is rate limited, occasionally down, and never in your control. Without it, an APNs outage takes down whatever called you.',
        },
        sections: [
          {
            heading: 'Pin the requirements',
            items: [
              'Which channels: push, SMS, email, in-app. They have wildly different latency and cost.',
              'Triggered by a user action, or by a scheduled or batch job. Both, usually.',
              'Opt-out is a functional requirement, not a nicety, and in some jurisdictions it is a legal one.',
              'Give a volume: 10 million notifications a day is roughly 115 a second average, with a peak several times that.',
            ],
          },
          {
            heading: 'At least once, and what that forces on you',
            body: 'A worker sends to APNs, APNs succeeds, the worker dies before recording it. On retry the user gets the notification twice. You cannot get exactly once across a network boundary you do not own, so you get at least once and make the duplicate harmless: attach a notification id, have the consumer or the device drop one it has already seen. Say this out loud, because "exactly once" is the wrong answer and being able to explain why is the right one.',
          },
          {
            heading: 'Retries that do not make the outage worse',
            items: [
              'Exponential backoff with jitter. Without jitter, every worker retries at the same instant and you have rebuilt the outage.',
              'A cap on attempts, then the dead letter queue, which a human looks at.',
              'A circuit breaker per provider: stop calling something that is failing and give it room to recover.',
              'Distinguish retryable from permanent. An invalid device token will never succeed, so retrying it forever is wasted budget.',
            ],
          },
          {
            heading: 'The parts that bite in production',
            items: [
              'Device tokens expire and change. Prune on the provider saying the token is invalid, or you send into the void forever.',
              'Fan-out: one event for a celebrity account can mean millions of notifications. Rate limit per user and batch where the product allows.',
              'Templating and localisation belong in the service, not in every caller.',
              'Track delivered, opened and failed. Without it you cannot tell a working system from a silent one.',
            ],
          },
        ],
      },
      {
        id: 'design-payments',
        title: 'Design a payment system',
        blurb: 'Where correctness stops being a nice property. The whole question is what happens when the network times out at the worst moment.',
        visual: [
          {
            kind: 'timeline',
            span: 12,
            lanes: [
              {
                label: 'client',
                events: [
                  { at: 0, label: 'pay, key abc-123', tone: 'neutral', width: 3.6 },
                  { at: 6, label: 'timeout, retry', tone: 'accent', width: 3.4 },
                ],
              },
              {
                label: 'payment service',
                events: [
                  { at: 3.6, label: 'charge', tone: 'neutral', width: 2.2 },
                  { at: 8.6, label: 'key seen, replay', tone: 'good', width: 3.3 },
                ],
              },
              {
                label: 'bank',
                events: [{ at: 4.3, label: 'money moves', tone: 'bad', width: 2.6 }],
              },
            ],
            caption:
              'The money moved and the client never heard back. Without an idempotency key the retry charges the card a second time. With one, the second request finds the key already recorded and returns the first result rather than doing the work again.',
          },
          {
            kind: 'boxes',
            columns: 2,
            items: [
              { label: 'Idempotency key', detail: 'Client-generated, unique per intent, stored with the result' },
              { label: 'Double-entry ledger', detail: 'Every movement is two rows that sum to zero' },
              { label: 'Reconciliation', detail: 'A nightly job comparing your ledger to the provider' },
              { label: 'Never store card numbers', detail: 'Tokenise through the provider and stay out of PCI scope' },
            ],
            caption: 'Four things that are close to non-negotiable, and naming them unprompted is most of a good answer.',
          },
        ],
        sections: [
          {
            heading: 'Scope it before designing',
            items: [
              'Pay-in only, or payouts too. Payouts bring fraud and holding periods with them.',
              'One currency or many. Many means FX rates, rounding rules, and storing minor units as integers.',
              'You are almost certainly integrating Stripe or Adyen rather than touching card networks. Say so, it is the correct answer.',
              'Money is never a float. Store integer minor units, or a decimal type, and say why when you do.',
            ],
          },
          {
            heading: 'Idempotency, which is the actual question',
            body: 'The client generates a key per payment intent and sends it with every attempt, including retries. The service stores key, request fingerprint and result together, atomically with the charge. A repeat of a known key returns the stored result without re-charging. A repeat with a different body under the same key is a client bug and should be a 409 rather than a silent overwrite. Keys expire after a day or so, which is longer than any retry window.',
          },
          {
            heading: 'The double-entry ledger',
            items: [
              'Never store a single mutable balance. Store the movements and derive the balance.',
              'Every transaction is at least two entries, a debit and a credit, summing to zero.',
              'Entries are append only. A correction is a new reversing entry, never an update.',
              'This gives you an audit trail for free, which is a legal requirement rather than a feature.',
            ],
          },
          {
            heading: 'Talking to something you do not control',
            items: [
              'Webhooks arrive out of order, more than once, and sometimes not at all. Handle all three.',
              'Verify the webhook signature. An unverified webhook endpoint is a way to mint free money.',
              'Never treat your own request as the source of truth. Reconcile against the provider on a schedule and alert on any difference.',
              'A distributed transaction across your database and the bank does not exist. Use an outbox or a saga and accept a window where the two disagree.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'behavioural',
    name: 'Behavioural',
    guides: [
      {
        id: 'star-stories',
        title: 'STAR stories to have ready',
        blurb: 'Every loop has this round. Six prepared stories cover almost any question asked.',
        visual: {
          kind: 'boxes',
          columns: 2,
          items: [
            { label: 'S  Situation', detail: 'One or two sentences of context. Where, when, what was at stake.', tone: 'neutral' },
            { label: 'T  Task', detail: 'What was specifically yours to do. Not the team’s, yours.', tone: 'neutral' },
            { label: 'A  Action', detail: 'The bulk of the answer. What you did and why you chose it.', tone: 'good' },
            { label: 'R  Result', detail: 'What changed. A number if you have one, what you learned if you do not.', tone: 'accent' },
          ],
          caption: 'Most people spend too long on Situation and rush Action, which is the only part being scored. Aim for about 20 percent setup, 60 percent what you did, 20 percent outcome.',
        },
        sections: [
          {
            heading: 'The six to write down',
            items: [
              'A conflict with a colleague, and how it resolved.',
              'A failure that was genuinely yours, and what changed afterwards.',
              'A hard deadline, and what you cut to hit it.',
              'Something you led, even informally.',
              'Something you shipped end to end.',
              'A decision you disagreed with, and how you handled it once it was made.',
            ],
          },
          {
            heading: 'Why six is enough',
            body: 'Most behavioural questions are one of these wearing a different hat. "Tell me about a time you had to influence without authority" is the disagreement story. "How do you handle pressure" is the deadline story. Prepare the six, then re-angle them to fit the question rather than inventing on the spot.',
          },
          {
            heading: 'What makes them land',
            items: [
              'Say "I" not "we" when describing your actions. The panel cannot score what the team did.',
              'Pick real stories with real friction. A story with no tension scores nothing.',
              'For the failure, do not pick a humblebrag. Pick one where you were actually wrong.',
              'Have one number per story if you can, even a rough one.',
              'Write them out once. Do not memorise the wording, memorise the beats.',
            ],
          },
          {
            heading: 'Also prepare',
            items: [
              'Why this company, specifically. Generic answers are obvious.',
              'Why you are leaving, phrased without criticising anyone.',
              'Three questions to ask them that you actually want answered.',
              'Your salary number, and a range you will not go below.',
            ],
          },
        ],
      },
      {
        id: 'when-you-are-stuck',
        title: 'Handling a question you cannot answer',
        blurb: 'Every loop has at least one. How you handle it is part of the score.',
        visual: {
          kind: 'flow',
          nodes: [
            { id: 'q', label: 'stuck', x: 0, y: 0, tone: 'bad' },
            { id: 's', label: 'say what you know', sub: 'out loud', x: 1, y: 0, tone: 'accent' },
            { id: 'r', label: 'reason from it', sub: '"I would expect..."', x: 2, y: 0, tone: 'good' },
            { id: 'a', label: 'ask a question', sub: 'narrow the problem', x: 2, y: 1, tone: 'good' },
            { id: 'b', label: 'bluff', sub: 'falls apart on follow-up', x: 1, y: 1, tone: 'bad' },
          ],
          edges: [
            { from: 'q', to: 's' },
            { from: 's', to: 'r', tone: 'good' },
            { from: 's', to: 'a', tone: 'good' },
            { from: 'q', to: 'b', label: 'never', tone: 'bad', dashed: true },
          ],
          caption: 'Silence and bluffing are the two losing moves. Thinking out loud from what you do know is scored almost as well as knowing, because it is the thing they actually need from you on the job.',
        },
        sections: [
          {
            heading: 'On a coding problem',
            items: [
              'State the brute force first, even if it is embarrassing. It is a working baseline and it buys thinking time.',
              'Say what you notice about the structure: sorted, bounded values, repeated subproblems.',
              'Ask about constraints. The answer usually points at the intended approach.',
              'Work a tiny example by hand on the board. Patterns show up that you cannot see in your head.',
            ],
          },
          {
            heading: 'On a concept question',
            body: 'Say what you do know, mark the boundary clearly, then reason past it. "I have not used X directly, but it sounds like Y, and if so I would expect the tradeoff to be Z" is a good answer. Interviewers score the reasoning, and a bluffed definition falls apart at the first follow-up, after which they are also wondering what else you bluffed.',
          },
        ],
      },
    ],
  },
]
