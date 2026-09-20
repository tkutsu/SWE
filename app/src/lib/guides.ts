import type { Visual } from './visual'

/**
 * The parts of interview prep that are neither an algorithm to step through nor
 * a one-minute definition: system design exercises and behavioural stories.
 */
export type GuideSection = { heading: string; body?: string; items?: string[] }
export type Guide = {
  id: string
  title: string
  blurb: string
  /** The way in: one concrete situation, before any method. */
  hook?: string
  visual?: Visual | Visual[]
  sections: GuideSection[]
}
export type GuideGroup = { id: string; name: string; guides: Guide[] }

export const guideGroups: GuideGroup[] = [
  {
    id: 'in-the-room',
    name: 'In the room',
    guides: [
      {
        id: 'attacking-a-new-problem',
        title: 'Attacking a problem you have never seen',
        blurb: 'Three books give this a whole chapter and it is the most reused skill in the loop. The order matters more than the cleverness.',
        hook: "The screen share starts, they paste a problem you have never seen, and there are forty minutes. What you do in the first four decides most of the rest.",
        visual: {
          kind: 'timeline',
          span: 45,
          lanes: [
            {
              label: 'what you do',
              events: [
                { at: 0, label: 'clarify', width: 6 },
                { at: 6, label: 'examples', width: 6 },
                { at: 12, label: 'brute force', width: 8, tone: 'accent' },
                { at: 20, label: 'optimise', width: 6, tone: 'good' },
                { at: 26, label: 'code', width: 10, tone: 'good' },
                { at: 36, label: 'test', width: 9, tone: 'good' },
              ],
            },
            {
              label: 'what is scored',
              events: [
                { at: 0, label: 'do you ask', width: 12 },
                { at: 12, label: 'do you say the cost', width: 14 },
                { at: 26, label: 'does it run', width: 19 },
              ],
            },
          ],
          caption:
            'Two thirds of the time is gone before a line of real code gets written, and that is correct. Candidates who start coding at minute three are the ones who rewrite at minute thirty. The brute force is amber because it is a stepping stone you must say out loud and must not stop at.',
        },
        sections: [
          {
            heading: 'Clarify, for about five minutes',
            items: [
              'Repeat the problem back in your own words. Half the misunderstandings die here.',
              'Ask the size of the input. It tells you the intended complexity before you have thought about the problem.',
              'Ask about the edge of the domain: empty input, one element, duplicates, negatives, overflow.',
              'Ask what to do on invalid input. Return a sentinel, throw, or assume it cannot happen. Any answer is fine, silence is not.',
            ],
          },
          {
            heading: 'Work an example by hand',
            body: 'Write a small input on the board and produce the answer manually, without code. This is where patterns become visible, because you notice what you did as a human: you sorted first, or you kept a running total, or you looked something up. That instinct is usually the algorithm. It also gives you a test case for later, and it catches the case where you misunderstood the question entirely, which is much cheaper to find now than at minute thirty.',
          },
          {
            heading: 'Say the brute force out loud, then leave it',
            items: [
              'Name it and give its cost: "I could check every pair, that is O(n squared)".',
              'It takes twenty seconds and buys you a correctness baseline, a thing to improve, and something to fall back on.',
              'Then say what is wasteful about it. The waste is the door to the better answer: recomputing the same thing points at memoisation, rescanning points at a hash map or a window.',
              'Do not implement it unless you are running out of time. A working brute force beats an unfinished optimal one, so keep it in your pocket.',
            ],
          },
          {
            heading: 'Optimise before you type',
            items: [
              'State the target complexity first, then find the algorithm that hits it. Working backwards from O(n log n) often names the technique on its own, because sorting and heaps are most of what lives there.',
              'Check the input for the giveaways: sorted, bounded range, contiguous, already a tree.',
              'Get agreement before coding. "I am going to use a sliding window with a last-seen map, does that sound right?" costs one sentence and saves ten minutes.',
            ],
          },
          {
            heading: 'Code, out loud, and leave the mess for later',
            items: [
              'Narrate as you go. Silence reads as being stuck, and thinking out loud is most of what the interviewer can actually grade.',
              'Write the interesting part first and stub the rest. A helper called isValid that you fill in after is fine, and often you are told not to bother.',
              'Use real names. i and j in a nested loop over a grid will confuse you before they confuse anyone else.',
              'If you spot a bug mid-line, say so and fix it. Noticing is a positive signal, quietly hoping is not.',
            ],
          },
          {
            heading: 'Test, and do not wait to be asked',
            items: [
              'Walk your example from step two through the actual code, line by line, not from memory of what you intended.',
              'Then the edges you asked about at the start: empty, one element, all duplicates, the largest case.',
              'Say the complexity of what you wrote, both time and space, including the call stack if it recurses.',
              'If it is wrong, say what is wrong before you change anything. Silently editing looks like guessing.',
            ],
          },
          {
            heading: 'If you are stuck for more than a minute',
            body: 'Say so, and say what you have tried. Then go back to the example and make it bigger or smaller, since most stuck-ness is a missing concrete case. Ask yourself which piece of the input you have not used: unused information is nearly always the hint. And take the hint when it is offered rather than defending your approach, because the round is not graded on independence.',
          },
        ],
      },
      {
        id: 'when-you-are-stuck',
        title: 'Handling a question you cannot answer',
        blurb: 'Every loop has at least one. How you handle it is part of the score.',
        hook: "Eight minutes gone, nothing on the screen, and the silence is now its own problem.",
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
  {
    id: 'design-exercises',
    name: 'System design exercises',
    guides: [
      {
        id: 'system-design-method',
        title: 'How to run a system design round',
        blurb: 'Eleven exercises here and, until now, no method for running one. The order is most of the score.',
        hook: "\"Design Twitter.\" Forty-five minutes. No further instructions, and the first thing being scored is whether you ask for any.",
        visual: {
          kind: 'timeline',
          span: 45,
          lanes: [
            {
              label: 'what you do',
              events: [
                { at: 0, label: 'scope', width: 7 },
                { at: 7, label: 'estimate', width: 6 },
                { at: 13, label: 'API + data', width: 8 },
                { at: 21, label: 'draw it', width: 9, tone: 'good' },
                { at: 30, label: 'find the bottleneck', width: 15, tone: 'good' },
              ],
            },
            {
              label: 'what is scored',
              events: [
                { at: 0, label: 'do you narrow it', width: 13 },
                { at: 13, label: 'is it concrete', width: 17 },
                { at: 30, label: 'do you find your own weak point', width: 15 },
              ],
            },
          ],
          caption:
            'The last third is the round. Everything before it is setup, and a candidate who spends forty minutes drawing boxes and never stress-tests them has not answered the question. Green marks where the actual signal is.',
        },
        sections: [
          {
            heading: 'Scope it down, out loud',
            items: [
              'Nobody can design Twitter in 45 minutes and the interviewer knows it. Pick three features and say you are picking them.',
              'Separate functional from non-functional. "Post a tweet" is functional; "the timeline loads in under 200ms" is what shapes the design.',
              'Ask read to write ratio. It is the single most design-shaping number and it is almost never volunteered.',
              'Ask what can be stale. If the answer is "a few seconds is fine", caching and async both become available and the design gets much easier.',
            ],
          },
          {
            heading: 'Put numbers on it',
            body: 'Pick a user count, say 100 million daily actives, and work out requests per second, storage per year and bandwidth. Keep the arithmetic round: 100 million times ten actions a day is a billion a day, which is roughly 12,000 a second average and call it 40,000 at peak. The numbers do not need to be right, they need to exist, because every later decision refers back to them. This is also where the latency table on the complexity board earns its keep: a number is only useful if you know whether it is big.',
          },
          {
            heading: 'API and data model before boxes',
            items: [
              'Three or four endpoints with their parameters. It forces the scope to become concrete and it is quick.',
              'Then the entities and their fields, and crucially the access patterns: which queries have to be fast.',
              'Pick the store after the access patterns, never before. "We need range queries by time and no joins" chooses the database for you.',
              'Say how it shards while you are here, since the shard key has to be in almost every query and finding that out later is painful.',
            ],
          },
          {
            heading: 'Now draw it',
            items: [
              'Start with the simplest thing that works: client, load balancer, stateless app servers, one database. Say out loud that this is the starting point, not the answer.',
              'Then add only what a number you already stated forces you to add.',
              'Trace one write and one read through the whole diagram, end to end. Most holes surface here rather than in the drawing.',
              'Keep the app servers stateless and say why, because it is what makes horizontal scaling possible at all.',
            ],
          },
          {
            heading: 'Break your own design',
            items: [
              'Name the bottleneck before they do. It is usually the database, then the fan-out, then the cache.',
              'Kill a component and say what happens. A single point of failure you spotted yourself scores much better than one they spotted.',
              'Talk about the hot key: the celebrity account, the viral video, the one shard taking all the writes.',
              'Say what you would monitor and what would page you. Almost nobody does this and it lands every time.',
            ],
          },
          {
            heading: 'Trade-offs, which is the thing being graded',
            body: 'There is no right architecture, only a defended one. Every time you choose, say what you gave up: caching buys speed and costs freshness, sharding buys write throughput and costs joins, queues buy resilience and cost end-to-end latency and exactly-once delivery. A candidate who says "I would use Kafka" scores far below one who says "I would put a queue here, which means the caller stops waiting on the slow path and means I now have to handle duplicates downstream".',
          },
          {
            heading: 'What sinks rounds',
            items: [
              'Designing for a billion users when nobody asked. Over-engineering reads as inexperience, not ambition.',
              'Naming products instead of properties. Say "a key-value store with single-digit millisecond reads", then name one.',
              'Silence while drawing. The diagram is not the answer, the narration is.',
              'Never mentioning failure, cost or operations. Those three are what separates a senior answer from a diagram.',
            ],
          },
        ],
      },
      {
        id: 'url-shortener',
        title: 'Design a URL shortener',
        blurb: 'The standard warm-up. Read-heavy, simple data model, and the interesting part is key generation.',
        hook: "The link went out in a newsletter at 9am and the redirect service fell over by 9:04.",
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
        hook: "One customer's retry loop is eating 90 percent of your API capacity, and it is not malicious, just broken.",
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
        hook: "A celebrity with 40 million followers posts once. Somebody has to decide whether that is one write or 40 million.",
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
        hook: "The message says delivered on one phone and has not arrived on the other, and both devices swear they are online.",
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
        hook: "Ten characters typed, ten round trips, and the suggestions on screen are for what the user had typed two keystrokes ago.",
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
        hook: "Somebody posts while the user is on page three, every row shifts down by one, and page four repeats what they already read.",
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
        hook: "Four hero images, and the one the user actually came for is the fourth. Three of them were downloaded before the page could paint.",
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
        hook: "Every app server keeps its own cache, so the same value is stored forty times and forty copies go stale at different moments.",
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
        hook: "Writes have been climbing for a year. The box is already the biggest one on offer, and the next step changes the shape of everything above it.",
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
        hook: "A deploy at 2am sends the same push to four million phones twice.",
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
        hook: "The charge succeeded at the provider and the response never came back. The user is looking at a spinner and about to press the button again.",
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
      {
        id: 'design-video-streaming',
        title: 'Design YouTube',
        blurb: 'Two systems bolted together: a slow write path that transcodes, and a read path that is mostly CDN.',
        hook: "The same film has to play on a train with two bars of signal and on a TV on fibre, from one upload.",
        visual: {
          kind: 'flow',
          nodes: [
            { id: 'up', label: 'upload', sub: 'resumable, chunked', x: 0, y: 0 },
            { id: 'raw', label: 'raw object store', x: 1, y: 0 },
            { id: 'q', label: 'transcode queue', x: 2, y: 0, tone: 'accent' },
            { id: 'w', label: 'transcode workers', sub: 'one job per resolution', x: 3, y: 0, tone: 'accent' },
            { id: 'seg', label: 'segments + manifest', sub: 'HLS or DASH', x: 3, y: 1, tone: 'good' },
            { id: 'cdn', label: 'CDN', sub: 'where the bytes actually come from', x: 2, y: 1, tone: 'good' },
            { id: 'v', label: 'viewer', x: 1, y: 1, tone: 'good' },
          ],
          edges: [
            { from: 'up', to: 'raw' },
            { from: 'raw', to: 'q' },
            { from: 'q', to: 'w' },
            { from: 'w', to: 'seg' },
            { from: 'seg', to: 'cdn' },
            { from: 'cdn', to: 'v' },
          ],
          caption:
            'Amber is the expensive asynchronous half: transcoding one video into six resolutions is minutes of CPU, and nobody waits on it. Green is the path that carries essentially all the traffic and never touches your servers.',
        },
        sections: [
          {
            heading: 'Scope and numbers',
            items: [
              'Upload, transcode, watch. Say you are skipping comments, recommendations and monetisation.',
              'Reads dominate writes by something like a thousand to one, which is even more lopsided than a normal social product.',
              'One hour of 1080p is roughly 3 GB raw, and you store several renditions, so storage is the dominant cost and worth saying.',
              'Bandwidth, not requests per second, is the constraint. That single observation shapes the whole design.',
            ],
          },
          {
            heading: 'The write path is a pipeline, not a request',
            items: [
              'Resumable chunked upload straight to object storage, ideally via a pre-signed URL so the bytes never pass through your servers.',
              'Uploading only enqueues a job. The response is "processing", and the user gets on with their life.',
              'Workers transcode into a ladder of resolutions and split each into a few seconds of segments, producing a manifest listing them.',
              'Fan out one job per rendition so they run in parallel, and make them idempotent, because workers die and jobs get retried.',
            ],
          },
          {
            heading: 'The read path is adaptive bitrate',
            body: 'The player fetches a manifest, then pulls segments a few seconds at a time, measuring throughput as it goes and switching rendition between segments. That is why a video drops to 480p on a train and recovers without stopping: the switch happens at a segment boundary and needs no new connection. Because segments are small, immutable files, they cache perfectly, so the CDN serves nearly everything and your origin sees very little.',
          },
          {
            heading: 'What to raise unprompted',
            items: [
              'The thundering herd on a premiere: millions want the first segment simultaneously, which the CDN absorbs only if it was warmed.',
              'The long tail: most videos are watched almost never, so keeping every rendition hot is waste. Tier storage to cold after a while.',
              'Live streaming is a different problem, with a latency budget instead of a transcode budget. Say so rather than pretending it is the same system.',
              'Takedowns and copyright matching mean you need content fingerprinting, which is a real subsystem and often the thing they want to hear named.',
            ],
          },
        ],
      },
      {
        id: 'design-file-sync',
        title: 'Design Google Drive',
        blurb: 'The interesting part is not storage. It is two devices editing offline and then both coming back.',
        hook: "The same document was edited on a laptop that was offline and on a phone that was not.",
        visual: {
          kind: 'flow',
          nodes: [
            { id: 'a', label: 'client A', sub: 'watches the filesystem', x: 0, y: 0 },
            { id: 'ch', label: 'chunker', sub: 'split, hash each chunk', x: 1, y: 0, tone: 'accent' },
            { id: 'meta', label: 'metadata service', sub: 'the file tree, versions', x: 2, y: 1, tone: 'good' },
            { id: 'blob', label: 'chunk store', sub: 'keyed by content hash', x: 2, y: 0, tone: 'good' },
            { id: 'nt', label: 'notification service', sub: 'long poll or websocket', x: 3, y: 1 },
            { id: 'b', label: 'client B', x: 3, y: 0 },
          ],
          edges: [
            { from: 'a', to: 'ch' },
            { from: 'ch', to: 'blob', label: 'only new chunks' },
            { from: 'ch', to: 'meta', label: 'chunk list' },
            { from: 'meta', to: 'nt' },
            { from: 'nt', to: 'b', label: 'something changed' },
            { from: 'blob', to: 'b', label: 'fetch missing' },
          ],
          caption:
            'Green marks the split that makes the whole design work: metadata is small, transactional and queried constantly, while chunks are large, immutable and write-once. They have nothing in common, so they get different stores.',
        },
        sections: [
          {
            heading: 'Chunking is the core decision',
            items: [
              'Split each file into fixed-size chunks, say 4 MB, and key each by the hash of its contents.',
              'Editing one byte in a 1 GB file then re-uploads one chunk, not a gigabyte. This is the single biggest win in the design.',
              'Identical chunks across all users are stored once, so deduplication comes free from content addressing.',
              'Immutable, content-keyed chunks also cache forever and need no invalidation, because a changed chunk is a different key.',
            ],
          },
          {
            heading: 'Metadata is the part that needs a transaction',
            body: 'The file tree, versions, sharing and permissions are small, highly relational and read constantly, so this is a relational database, sharded by user or workspace. Every change is a new version row pointing at a list of chunk hashes, which makes version history nearly free and makes a revert a metadata write rather than a data copy. Keep this separate from the chunk store, because they scale along completely different axes.',
          },
          {
            heading: 'Conflicts, which is the real question',
            items: [
              'Two devices edit offline and both come back. You cannot merge arbitrary binary files, so do not pretend to.',
              'The honest answer is to keep both: last write wins for the canonical name and preserve the loser as a conflicted copy. That is what real products do.',
              'For text or structured documents, operational transforms or CRDTs let you merge properly, and they are a much bigger commitment. Name them and say when they are worth it.',
              'Vector clocks or version vectors are how you detect a conflict at all, as opposed to a normal sequential update.',
            ],
          },
          {
            heading: 'The rest',
            items: [
              'Notification needs to be push, not poll, or a million idle clients hammer you for nothing.',
              'A client must reconcile after being offline for a week, so the API is "what changed since this cursor", not "send me everything".',
              'Sharing turns a personal tree into a graph, and permission checks are then on the read path of every request.',
              'Deletes are soft, because the trash is a product feature, and real deletion is a background job that must also drop unreferenced chunks.',
            ],
          },
        ],
      },
      {
        id: 'design-geo-search',
        title: 'Design Google Maps nearby search',
        blurb: 'Find everything within 5 km, fast. A normal index cannot do it, and why is the question.',
        hook: "\"Restaurants near me\" against ten million rows, where near means within two kilometres and me moved since the last query.",
        visual: {
          kind: 'compare',
          columns: [
            {
              title: 'Index lat and lng',
              sub: 'the obvious answer',
              tone: 'bad',
              rows: [
                'Two separate B-tree indexes',
                'Query becomes a bounding box',
                'The database uses one index, then filters',
                'Millions of rows scanned in dense cities',
                'Gets worse exactly where it is used most',
              ],
            },
            {
              title: 'Geohash or quadtree',
              sub: 'one dimension, not two',
              tone: 'good',
              rows: [
                'Interleave the bits of lat and lng',
                'Nearby points share a string prefix',
                'Query becomes a prefix match',
                'Ordinary index, ordinary range scan',
                'Splits deeper where density is higher',
              ],
            },
          ],
          caption:
            'The trick is collapsing two dimensions into one ordered key so that closeness on the map becomes closeness in a sorted index. Everything else follows from that.',
        },
        sections: [
          {
            heading: 'Why two indexes fail',
            body: 'A query for everything within 5 km becomes a bounding box: latitude between two values and longitude between two values. A B-tree can serve one of those ranges efficiently and then has to filter the rest by hand. In central London that is millions of rows discarded per query, and the failure scales with density, so the system is slowest precisely where the users are.',
          },
          {
            heading: 'Geohash, in one paragraph',
            items: [
              'Repeatedly halve the world, taking a bit for east or west and a bit for north or south, and interleave those bits.',
              'Encode the result in base32 and you get a short string where a longer prefix means a smaller box.',
              'Two points close together usually share a long prefix, so "nearby" becomes "LIKE prefix%" on an ordinary index.',
              'Usually: points either side of a boundary can be metres apart with different prefixes, so you must also query the eight neighbouring cells. This is the detail interviewers wait for.',
            ],
          },
          {
            heading: 'Quadtrees and S2, and when each wins',
            body: 'A geohash uses fixed grid sizes, which wastes resolution over an ocean and runs out of it in Manhattan. A quadtree subdivides only where there is data, so cells hold roughly the same number of points and query cost is more uniform. Google S2 projects onto a cube and uses a Hilbert curve, which preserves locality better than geohash bit-interleaving does. In practice: geohash if you want something you can put in any database today, quadtree or S2 if density varies wildly.',
          },
          {
            heading: 'Around the core',
            items: [
              'Businesses barely move, so this index is read-heavy and rebuildable offline, which makes it easy to cache and replicate.',
              'Live vehicle positions are the opposite: enormous write rate, short-lived, and usually kept in memory rather than in the same store.',
              'Return candidates from the index, then compute true distance and sort in the application. The index narrows, it does not rank.',
              'Shard by geography and you get natural locality and a natural hot spot, since a shard containing a major city carries far more traffic.',
            ],
          },
        ],
      },
      {
        id: 'design-key-value-store',
        title: 'Design a distributed key-value store',
        blurb: 'The one where they actually want to hear you talk about consistency, not about boxes.',
        hook: "One machine is full. Adding a second one means deciding which keys live where, and what happens to that decision when you add a third.",
        visual: {
          kind: 'triangle',
          vertices: ['Consistency', 'Availability', 'Partition tolerance'],
          subs: ['every read sees the last write', 'every request gets an answer', 'the network will split'],
          pick: [1, 2],
          caption:
            'Partitions are not optional in a distributed system, so P is not a choice and the real decision is the other two. Dynamo-style stores pick availability and reconcile later; a store built on consensus picks consistency and refuses writes on the minority side of a split.',
        },
        sections: [
          {
            heading: 'Pin the requirements, because they change everything',
            items: [
              'Single key operations only, or ranges and transactions? Ranges rule out plain hashing for placement.',
              'What size are values? Kilobytes and megabytes produce different designs.',
              'Durability: is acknowledging a write before it is on disk acceptable? For a cache yes, for a database no.',
              'Consistency is the real question. Ask whether a read must see the last write, and expect them to make it hard.',
            ],
          },
          {
            heading: 'Placement and replication',
            items: [
              'Consistent hashing on a ring with virtual nodes, so adding a machine moves roughly 1/N of keys instead of all of them.',
              'Each key lives on the next N nodes clockwise, which is replication with no separate placement service.',
              'Quorums: with N replicas, require W to acknowledge a write and R to answer a read. If R plus W exceeds N, a read always overlaps a written replica and you get strong consistency.',
              'That single inequality is the dial. W equals N gives fast reads and slow writes, W equals 1 the opposite.',
            ],
          },
          {
            heading: 'What happens when a node dies',
            body: 'Hinted handoff lets a healthy node accept a write destined for a dead one and forward it later, so availability survives a short outage. Merkle trees let two replicas compare their contents by exchanging a handful of hashes rather than the whole dataset, so repair after a longer outage is cheap. Detection itself is gossip: nodes exchange heartbeats with a few random peers, and the knowledge that a node is down spreads without any coordinator to become a single point of failure.',
          },
          {
            heading: 'Conflicts and storage',
            items: [
              'Concurrent writes to one key on either side of a partition produce two versions. Vector clocks tell you they are genuinely concurrent rather than sequential.',
              'Then you either pick last-write-wins, which is simple and silently loses data, or return both and make the client resolve, which is what a shopping cart does.',
              'On disk, an LSM tree suits this far better than a B-tree: writes go to a memtable and an append-only log, then flush and compact in the background.',
              'That is why write-heavy stores are built this way, and the cost is read amplification, which bloom filters per file are there to reduce.',
            ],
          },
        ],
      },
      {
        id: 'design-message-queue',
        title: 'Design a distributed message queue',
        blurb: 'Half the other answers in this section say "put a queue here". This is what that costs.',
        hook: "The email provider is down for twenty minutes. Either signups fail for twenty minutes, or something holds the work until it comes back.",
        visual: {
          kind: 'flow',
          nodes: [
            { id: 'p', label: 'producers', x: 0, y: 1 },
            { id: 't', label: 'topic', sub: 'split into partitions', x: 1, y: 1, tone: 'accent' },
            { id: 'p0', label: 'partition 0', sub: 'append-only log', x: 2, y: 0, tone: 'good' },
            { id: 'p1', label: 'partition 1', sub: 'append-only log', x: 2, y: 2, tone: 'good' },
            { id: 'c1', label: 'consumer A', sub: 'offset 402', x: 3, y: 0 },
            { id: 'c2', label: 'consumer B', sub: 'offset 117', x: 3, y: 2 },
          ],
          edges: [
            { from: 'p', to: 't' },
            { from: 't', to: 'p0', label: 'hash(key)' },
            { from: 't', to: 'p1' },
            { from: 'p0', to: 'c1' },
            { from: 'p1', to: 'c2' },
          ],
          caption:
            'The log is the design. Messages are appended and never removed on read, and a consumer is just an integer saying how far it has got. Replay, multiple independent consumers and recovery after a crash all fall out of that one decision.',
        },
        sections: [
          {
            heading: 'A log, not a queue',
            items: [
              'Messages are appended to a file and kept for a retention period, whether or not anyone has read them.',
              'A consumer stores an offset. Reading does not remove anything, so two teams can consume the same topic independently.',
              'Reprocessing after a bug is rewinding an integer, which is the feature people actually buy this for.',
              'Sequential disk writes are surprisingly fast, and the whole design leans on that rather than fighting it.',
            ],
          },
          {
            heading: 'Partitions buy throughput and cost ordering',
            body: 'One log means one machine and a ceiling. Split the topic into partitions and throughput scales with them, but ordering now only holds within a partition, not across the topic. So you choose a partition key: all events for one user or one order go to the same partition and stay ordered relative to each other, while unrelated keys proceed in parallel. Global ordering across a topic is available only with a single partition, and saying that trade out loud is most of the answer.',
          },
          {
            heading: 'Delivery guarantees, stated honestly',
            items: [
              'At most once: commit the offset before processing. Fast, and you lose messages on a crash.',
              'At least once: process, then commit. The default, and it produces duplicates when a crash lands between the two.',
              'Exactly once does not exist across a network boundary you do not control. What exists is at-least-once delivery plus idempotent processing, which produces the same observable result.',
              'So the real design work is making the consumer idempotent: a dedupe key, or a write that is naturally idempotent.',
            ],
          },
          {
            heading: 'The operational realities',
            items: [
              'Replicate each partition to a few brokers with one leader. Acknowledge after the replicas have it, or a leader failure loses acknowledged writes.',
              'Consumer groups assign partitions to members, and rebalancing when one joins or dies pauses consumption briefly.',
              'Consumer lag is the metric that matters. It is the number that tells you the system is falling behind before users do.',
              'A poison message that always fails will block its partition forever. Cap retries and move it to a dead letter topic.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'object-oriented-design',
    name: 'Object-oriented design',
    guides: [
      {
        id: 'ood-round',
        title: 'How an OOD round differs',
        blurb: 'A separate round at many companies, and the mistake is answering it like a system design question.',
        hook: "\"Model a parking lot.\" No algorithm, no complexity to state, forty minutes, and the thing being scored is whether your classes survive the follow-up question.",
        visual: {
          kind: 'compare',
          columns: [
            {
              title: 'System design',
              sub: 'boxes on a network',
              rows: [
                'Services, queues, databases',
                'Scale is the constraint',
                'Latency, throughput, availability',
                'Answer is an architecture diagram',
                'Trade-offs are about machines',
              ],
            },
            {
              title: 'Object-oriented design',
              sub: 'classes in one process',
              rows: [
                'Classes, interfaces, relationships',
                'Change is the constraint',
                'Cohesion, coupling, extensibility',
                'Answer is a class diagram',
                'Trade-offs are about the next feature',
              ],
            },
          ],
          caption:
            'Neither column is better, so neither is coloured. The failure is reaching for the wrong one: answering "design a parking lot" with load balancers, or answering "design Twitter" with an abstract base class.',
        },
        sections: [
          {
            heading: 'The procedure',
            items: [
              'Clarify the scope out loud, exactly as you would for an algorithm. A parking lot for one site or a chain? Payment in scope?',
              'List the nouns in the problem. They are your candidate classes, and this is a genuinely reliable first pass.',
              'List the verbs. They are the methods, and they tell you which class each noun really belongs to.',
              'Draw the relationships: has-a, is-a, and how many of each. Multiplicity is where the interesting questions hide.',
              'Only then talk about patterns, and only if one actually fits.',
            ],
          },
          {
            heading: 'What is actually being graded',
            items: [
              'Encapsulation: does state live behind behaviour, or are you exposing public fields and letting callers maintain invariants.',
              'Cohesion: does each class have one job you can name in a sentence without using "and".',
              'Coupling: if one requirement changes, how many classes have to change with it.',
              'Extensibility: you will be asked to add a feature halfway through. That follow-up is the real question, and the first design is just the setup.',
            ],
          },
          {
            heading: 'The mistakes that cost the most',
            items: [
              'Inheritance where composition belongs. A Car is not a kind of ParkingSpot and a Manager is often not a kind of Employee. If the answer is "has a" then do not extend.',
              'A god class. One Manager or System class that holds everything is the single most common failure here.',
              'Enums for everything, including things that will need their own behaviour later. If each case has different logic, they are classes.',
              'Naming a pattern you cannot justify. Saying Factory when you mean "a function that makes one" is worse than saying nothing.',
            ],
          },
          {
            heading: 'Say these things unprompted',
            body: 'Where you put the money, if there is money, and why. What happens under concurrent access, since almost every OOD prompt has two users doing the same thing at once. Which class you would change first if the requirement changed, and why that is cheap. Those three cover most of the follow-ups before they are asked.',
          },
        ],
      },
      {
        id: 'design-parking-lot',
        title: 'Design a parking lot',
        blurb: 'The canonical OOD question. Small enough to finish, deep enough to separate people.',
        hook: "It works for cars. Then they ask about motorbikes, then about vans that need two spaces, and the design either bends or breaks in front of you.",
        visual: {
          kind: 'flow',
          nodes: [
            { id: 'lot', label: 'ParkingLot', sub: 'has many levels', x: 0, y: 1 },
            { id: 'lev', label: 'Level', sub: 'has many spots', x: 1, y: 1 },
            { id: 'spot', label: 'Spot', sub: 'size, occupant', x: 2, y: 1 },
            { id: 'veh', label: 'Vehicle', sub: 'abstract', x: 3, y: 0, tone: 'accent' },
            { id: 'car', label: 'Car, Motorbike, Bus', sub: 'differ by size only', x: 4, y: 0, tone: 'accent' },
            { id: 'tick', label: 'Ticket', sub: 'spot, entry time', x: 2, y: 2, tone: 'good' },
            { id: 'rate', label: 'RateStrategy', sub: 'hourly, flat, daily', x: 3, y: 2, tone: 'good' },
          ],
          edges: [
            { from: 'lot', to: 'lev', label: '1 to many' },
            { from: 'lev', to: 'spot', label: '1 to many' },
            { from: 'spot', to: 'veh', label: 'holds', dashed: true },
            { from: 'veh', to: 'car', label: 'is a' },
            { from: 'spot', to: 'tick', label: 'issues' },
            { from: 'tick', to: 'rate', label: 'priced by' },
          ],
          caption:
            'Amber is the part people over-engineer: three vehicle types that differ only by a size value rarely need three classes. Green is the part people forget entirely, which is that the money has to live somewhere and the pricing rule is the thing most likely to change.',
        },
        sections: [
          {
            heading: 'Clarify first',
            items: [
              'Multiple levels, or one flat lot? Multiple is the usual answer and it costs one class.',
              'Vehicle types, and do bigger vehicles take several spots or one bigger spot? This is the most interesting modelling decision in the problem.',
              'Is payment in scope? If yes, is it on entry or exit?',
              'One entrance or several? Several means concurrent assignment, which is the follow-up.',
            ],
          },
          {
            heading: 'The classes',
            items: [
              'ParkingLot holds levels and is the only thing the outside world talks to. Keep its surface small: park(vehicle) and leave(ticket).',
              'Level holds spots and knows its own free count, so finding space does not mean scanning every spot every time.',
              'Spot has a size and an optional occupant. Whether it is free is derived from the occupant, not a separate boolean that can disagree with it.',
              'Vehicle carries a size. Car, Motorbike and Bus as subclasses are fine if they gain behaviour later, and are over-engineering if size is the only difference. Say that trade-off rather than picking silently.',
              'Ticket records the spot and the entry time. It is the receipt, and it is what makes the exit path cheap.',
            ],
          },
          {
            heading: 'Pricing is where the design earns its keep',
            body: 'Put the rate behind an interface with one method, price(ticket, exitTime), and hand the lot an implementation. Now hourly, flat-rate, first-hour-free and weekend rates are new classes rather than new branches in an if-statement inside ParkingLot. This is the Strategy pattern, and it is one of the few places in this problem where naming a pattern is justified rather than decorative.',
          },
          {
            heading: 'The follow-ups, which are the actual test',
            items: [
              'Two cars arrive at the last spot at once. You need the search and the claim to be one atomic operation, not a find followed by a separate assign.',
              'Add a reservation system. If Spot has a free boolean you are now in trouble; if it has an occupant and a reservation you are not.',
              'Add electric charging spots. If vehicle type and spot type are the same enum, this hurts. If they are separate concepts related by a rule, it does not.',
              'Find the nearest free spot to the entrance. This is why Level should own the lookup rather than the caller scanning.',
            ],
          },
        ],
      },
      {
        id: 'design-deck-of-cards',
        title: 'Design a deck of cards',
        blurb: 'Deceptively small. It is really a question about generics and about where randomness lives.',
        hook: "Deal, shuffle, and a deck that never returns the same card twice. Then they ask you to support blackjack and poker with the same deck.",
        visual: {
          kind: 'flow',
          nodes: [
            { id: 'card', label: 'Card', sub: 'suit, rank, immutable', x: 0, y: 0, tone: 'good' },
            { id: 'deck', label: 'Deck<T>', sub: 'shuffle, deal', x: 1, y: 0 },
            { id: 'hand', label: 'Hand<T>', sub: 'cards, score', x: 2, y: 0 },
            { id: 'bj', label: 'BlackjackHand', sub: 'ace is 1 or 11', x: 3, y: 0, tone: 'accent' },
            { id: 'rng', label: 'Random', sub: 'injected, not created', x: 1, y: 1, tone: 'good' },
          ],
          edges: [
            { from: 'card', to: 'deck', label: 'held by' },
            { from: 'deck', to: 'hand', label: 'deals to' },
            { from: 'hand', to: 'bj', label: 'is a' },
            { from: 'rng', to: 'deck', label: 'shuffles with' },
          ],
          caption:
            'Green marks the two decisions that make this testable: an immutable Card, and a random source passed in rather than constructed inside shuffle. Amber marks the game-specific piece, which is the only place the rules of any particular game are allowed to live.',
        },
        sections: [
          {
            heading: 'Clarify first',
            items: [
              'A generic deck, or a deck for one specific game? The question is usually generic deck, then blackjack as the follow-up.',
              'Jokers? Multiple decks shuffled together, as a casino shoe would be?',
              'Does dealing remove cards, or just mark them dealt? Removing is simpler and usually right.',
            ],
          },
          {
            heading: 'Card should be immutable',
            body: 'A card is a suit and a rank and it never changes into a different card. Making it immutable means it can be shared, compared by value, used as a map key and passed around without defensive copies. It also means the four-of-hearts in a hand and the four-of-hearts in the discard pile are the same object, which is only a problem if you were planning to mutate one of them, and you were not.',
          },
          {
            heading: 'Where the game rules go',
            items: [
              'Card does not know its value. A king is worth 10 in blackjack, 13 in some games and nothing in others, so a value on Card bakes one game into the shared class.',
              'The hand for a specific game owns the scoring. BlackjackHand knows an ace is 1 or 11 and picks whichever does not bust.',
              'Deck stays generic over what it holds, so the same deck deals to a poker game or a blackjack game unchanged.',
            ],
          },
          {
            heading: 'Shuffling, which is the trick question',
            items: [
              'Fisher-Yates, walking from the end and swapping each position with a random earlier one. Say the name.',
              'The naive version that picks any index rather than an earlier one is biased and is a classic interview trap.',
              'Take the random source as a constructor argument. Seeded, the shuffle is reproducible, which is the difference between a testable deck and one you can only test by running it a thousand times.',
              'Sorting by a random key also works and is O(n log n) rather than O(n), which is worth naming as the inferior option you considered.',
            ],
          },
        ],
      },
      {
        id: 'design-elevator',
        title: 'Design an elevator system',
        blurb: 'The one OOD question with a real algorithm hiding in it, which is why it separates people.',
        hook: "Four lifts, somebody presses up on floor 6, and something has to decide which one goes.",
        visual: {
          kind: 'flow',
          nodes: [
            { id: 'btn', label: 'Request', sub: 'floor, direction', x: 0, y: 1 },
            { id: 'ctl', label: 'Controller', sub: 'picks a car', x: 1, y: 1, tone: 'accent' },
            { id: 'sch', label: 'Scheduler', sub: 'strategy, swappable', x: 1, y: 0, tone: 'good' },
            { id: 'car', label: 'Elevator', sub: 'floor, direction, stops', x: 2, y: 1 },
            { id: 'door', label: 'Door', sub: 'open, closed, blocked', x: 3, y: 1 },
            { id: 'st', label: 'State', sub: 'idle, moving, doors open', x: 2, y: 0, tone: 'good' },
          ],
          edges: [
            { from: 'btn', to: 'ctl' },
            { from: 'sch', to: 'ctl', label: 'used by' },
            { from: 'ctl', to: 'car', label: 'assigns' },
            { from: 'car', to: 'st', label: 'is in one' },
            { from: 'car', to: 'door', label: 'controls' },
          ],
          caption:
            'Green marks the two pieces that make the rest tractable: an explicit state machine per car, and the scheduling rule behind an interface so it can be swapped. Amber is the Controller, which is where a god class grows if you let it.',
        },
        sections: [
          {
            heading: 'Clarify first',
            items: [
              'How many cars and how many floors? One car is a different problem and a much shorter answer.',
              'Are there separate up and down buttons on each floor? Almost always yes, and it matters: a request has a direction.',
              'Express floors, service mode, weight limits, fire override? Ask, then usually defer them.',
              'Optimising for average wait, or for worst-case wait? These give different schedulers and it is a good question to ask.',
            ],
          },
          {
            heading: 'Two kinds of request, which people conflate',
            body: 'A hall call comes from a floor and carries a direction: someone at floor 7 wants to go down. A car call comes from inside and carries only a destination. They are handled differently, because a hall call can be served by any car and a car call belongs to one. Modelling them as one class with a nullable direction field is the first sign a design is going to get muddy.',
          },
          {
            heading: 'The state machine is the design',
            items: [
              'Each car is in exactly one state: idle, moving up, moving down, doors opening, doors open, doors closing.',
              'Transitions are explicit and the illegal ones are impossible to express. A car cannot move with its doors open, and that should be a property of the model rather than a rule someone remembers.',
              'Doors blocked is a real state, not an error. Something has to happen after a timeout.',
              'Holding this as a diagram rather than a pile of booleans is most of what separates a good answer here.',
            ],
          },
          {
            heading: 'Scheduling, behind an interface',
            items: [
              'Nearest car first is the obvious rule and it starves the top floors, which is worth saying.',
              'The lift algorithm, also called SCAN: keep going in the current direction serving everything on the way, then reverse. This is the same shape as a disk head scheduler, and it is the answer they are usually fishing for.',
              'Never assign a car that is moving away from the request, unless nothing else is free.',
              'Put the rule behind a Scheduler interface. Then nearest-car, SCAN and a rush-hour variant are implementations rather than a growing if-statement, and you can say you would measure which is better rather than asserting it.',
            ],
          },
        ],
      },
          {
        id: 'design-connect-four',
        title: 'Design Connect Four',
        blurb: 'The smallest board game worth asking about, and the win check is where it gets interesting.',
        hook: "Dropping a piece is easy. Knowing somebody just won, without rescanning the whole board, is the part worth designing.",
        visual: {
          kind: 'flow',
          nodes: [
            { id: 'g', label: 'Game', sub: 'turn, status, players', x: 0, y: 0 },
            { id: 'b', label: 'Board', sub: 'grid, drop, isWin', x: 1, y: 0, tone: 'good' },
            { id: 'p', label: 'Player', sub: 'name, piece', x: 0, y: 1 },
            { id: 'm', label: 'Move', sub: 'column only', x: 1, y: 1, tone: 'accent' },
            { id: 'r', label: 'WinRule', sub: 'four in a line', x: 2, y: 0 },
          ],
          edges: [
            { from: 'g', to: 'b', label: 'owns one' },
            { from: 'g', to: 'p', label: 'has two' },
            { from: 'p', to: 'm', label: 'makes' },
            { from: 'm', to: 'b', label: 'applied to' },
            { from: 'b', to: 'r', label: 'checked by' },
          ],
          caption:
            'Amber is the modelling decision worth defending: a move is a column, not a coordinate, because gravity chooses the row. Getting that wrong lets a caller place a piece in mid-air, and a model that cannot express an illegal state is better than one that validates against it.',
        },
        sections: [
          {
            heading: 'Clarify first',
            items: [
              'Standard 7 by 6, or configurable? Configurable costs nothing and reads better.',
              'Two players always, or is an AI opponent in scope? Say you are leaving the AI behind an interface.',
              'Is undo required? It changes whether moves are kept as history or only applied.',
              'Win condition is four in a row in any direction. Confirm diagonals count, because it changes the check.',
            ],
          },
          {
            heading: 'The classes',
            items: [
              'Board owns the grid and is the only thing that mutates it. Its API is drop(column, piece) returning the row it landed on, or rejecting a full column.',
              'Game owns whose turn it is and whether the game is over. It is the state machine: in progress, won, drawn.',
              'Player is thin: a name and a piece. Resist giving it behaviour it does not have.',
              'Move holds a column and a player. As a value object it also gives you undo and a replayable history for free.',
            ],
          },
          {
            heading: 'The win check, which is the actual question',
            body: 'Scanning the whole board after every move is 42 cells times four directions, which is fine here and wrong as an answer, because it shows you did not notice the constraint. A win must involve the piece just placed, so check only the four lines through that one cell: horizontal, vertical and both diagonals. Walk outward in both directions from the new piece counting matching pieces, and if any direction pair totals four, that is a win. Constant work per move rather than a full scan.',
          },
          {
            heading: 'The follow-ups',
            items: [
              'Make the board size configurable and the win length configurable. If either is hardcoded in the win check, this hurts.',
              'Add an AI player. If Player is an interface with chooseMove(board), this is a new class; if Game asks for human input directly, it is a rewrite.',
              'Support undo. Trivial if moves are a stack of value objects, painful if only the grid was kept.',
              'Detect a draw. Easy to forget and it is not "the board is full", it is "no column has room".',
            ],
          },
        ],
      },
      {
        id: 'design-blackjack',
        title: 'Design Blackjack',
        blurb: 'Builds straight on the deck of cards question. The ace is the part they are really asking about.',
        hook: "An ace is 1 or 11, and which one depends on the rest of the hand. That single rule is where most designs get untidy.",
        visual: {
          kind: 'flow',
          nodes: [
            { id: 'game', label: 'Game', sub: 'round loop, settles bets', x: 0, y: 0 },
            { id: 'shoe', label: 'Shoe', sub: 'several decks, reshuffles', x: 1, y: 1, tone: 'good' },
            { id: 'hand', label: 'Hand', sub: 'cards, bestValue()', x: 1, y: 0, tone: 'accent' },
            { id: 'pl', label: 'Player', sub: 'chips, hands, bet', x: 2, y: 0 },
            { id: 'dl', label: 'Dealer', sub: 'fixed strategy', x: 2, y: 1, tone: 'good' },
            { id: 'st', label: 'Strategy', sub: 'hit, stand, double, split', x: 3, y: 0 },
          ],
          edges: [
            { from: 'game', to: 'shoe', label: 'deals from' },
            { from: 'game', to: 'pl' },
            { from: 'game', to: 'dl' },
            { from: 'pl', to: 'hand', label: 'has one or more' },
            { from: 'dl', to: 'hand' },
            { from: 'pl', to: 'st', label: 'decides via' },
          ],
          caption:
            'Amber is where the rules of this specific game live, and nowhere else: a Card does not know it is worth 10, because it is worth 13 in another game. Green marks the dealer, who is a player with no choices, which is a nice use of a subclass that genuinely only differs in behaviour.',
        },
        sections: [
          {
            heading: 'Clarify first',
            items: [
              'One player against the dealer, or a table? A table mainly adds iteration, not design.',
              'Which options are in scope: hit and stand always, then double down, split and insurance in order of how much they complicate the model.',
              'Splitting is the big one, because a player then has several hands and everything that assumed one breaks.',
              'One deck or a shoe of six? A shoe is more realistic and makes the reshuffle point a real decision.',
            ],
          },
          {
            heading: 'The ace, which is the whole question',
            body: 'An ace is 1 or 11 and there can be several in a hand, but at most one can ever be 11, because two elevens already bust. So the clean implementation is to count all aces as 1, then add 10 once if doing so keeps the total at or under 21. That is two lines and no branching over combinations. A hand holding an ace counted as 11 is called soft, which matters because the dealer rule is usually "hit on soft 17", and the word soft only exists because of this.',
          },
          {
            heading: 'Where each piece of behaviour belongs',
            items: [
              'Hand owns bestValue(), isBust() and isBlackjack(). This is the class that knows blackjack rules.',
              'Dealer is a Player whose decisions are fixed by the house rules, so it overrides the strategy rather than the state.',
              'Player owns chips and bets. Money being separate from cards keeps splitting and doubling from tangling with hand evaluation.',
              'Game runs the round: deal, player turns, dealer turn, settle. Keep it thin, because it is the class most likely to grow into a god object.',
            ],
          },
          {
            heading: 'The follow-ups',
            items: [
              'Support splitting. If Player has a list of hands from the start rather than one hand, this costs almost nothing.',
              'Add card counting or a different dealer rule. Both are strategy swaps if the decisions sit behind an interface.',
              'Make the shoe reshuffle at a cut card rather than when empty, which is how real casinos defeat counting.',
              'Make it testable: pass the random source into the shuffle, so a test can deal a known sequence. This is the same point as the deck of cards question.',
            ],
          },
        ],
      },
      {
        id: 'design-bank',
        title: 'Design a banking system',
        blurb: 'The OOD question where money makes correctness non-negotiable, and every trap is about state.',
        hook: "Two transfers out of the same account arrive at the same instant, and the balance only covers one of them.",
        visual: {
          kind: 'flow',
          nodes: [
            { id: 'c', label: 'Customer', sub: 'holds accounts', x: 0, y: 0 },
            { id: 'a', label: 'Account', sub: 'abstract: balance from entries', x: 1, y: 0, tone: 'good' },
            { id: 'sub', label: 'Current, Savings', sub: 'differ in rules, not data', x: 2, y: 0 },
            { id: 'tx', label: 'Transaction', sub: 'immutable, append only', x: 1, y: 1, tone: 'good' },
            { id: 'tr', label: 'Transfer', sub: 'two entries, one unit', x: 2, y: 1, tone: 'accent' },
            { id: 'f', label: 'InterestRule, FeeRule', sub: 'strategy per product', x: 3, y: 0 },
          ],
          edges: [
            { from: 'c', to: 'a', label: 'has many' },
            { from: 'a', to: 'sub', label: 'is a' },
            { from: 'a', to: 'tx', label: 'derives balance from' },
            { from: 'tr', to: 'tx', label: 'creates two' },
            { from: 'sub', to: 'f', label: 'configured with' },
          ],
          caption:
            'Green marks the decision the whole design rests on: balance is derived from an append-only list of transactions, never stored as a mutable number. Amber is the transfer, which is two entries that must both exist or neither, and is where the concurrency question lands.',
        },
        sections: [
          {
            heading: 'Clarify first',
            items: [
              'Retail accounts, or ATM and teller operations too? The ATM version adds hardware states and is a different question.',
              'Account types in scope, and do they differ in data or only in rules? Almost always only in rules.',
              'Are transfers between customers in scope? If yes, concurrency is the main event.',
              'Multi-currency? If yes, money is a value object with an amount and a currency and you cannot add two of different kinds.',
            ],
          },
          {
            heading: 'Never store a balance',
            body: 'A mutable balance field is the single most common failure in this question. Two concurrent withdrawals read it, both see enough funds, both write, and the account is overdrawn with no record of how. Store transactions instead, append only, and derive the balance. Now history is free, an audit trail is free, and a correction is a new reversing entry rather than an edit that destroys evidence. If reading every transaction is too slow, cache a running balance as an optimisation that can always be rebuilt from the entries, and say it that way round.',
          },
          {
            heading: 'Money and concurrency',
            items: [
              'Money is never a float and never a bare number. A Money value object with integer minor units and a currency prevents a whole class of bugs at compile time.',
              'A transfer is two entries that must both apply or neither. In one process that is a lock or a transaction; across services it is a saga with a compensating entry.',
              'Take locks in a consistent order, by account id, or two simultaneous transfers between the same pair deadlock. This is the lock ordering point from the concurrency guide, in the wild.',
              'Overdraft rules belong to the account type, not to the withdraw method, so a new product does not mean editing shared code.',
            ],
          },
          {
            heading: 'The follow-ups',
            items: [
              'Add interest. If it is a rule object per product this is a new class; if it is a switch on account type it is an edit in three places.',
              'Add a statement for a date range. Free if transactions are the source of truth, and awkward if they are a side log.',
              'Add a joint account. This is really "an account has many owners", and it breaks any model where an account has one customer field.',
              'Reverse a transaction. Say new compensating entry, never delete, and you have answered the question they were building towards.',
            ],
          },
        ],
      },
      {
        id: 'design-recommender',
        title: 'Design a movie recommendation system',
        blurb: 'Half OOD and half system design, and the interesting half is what you do with no data.',
        hook: "A new user has clicked on nothing. The system still has to fill the page.",
        visual: {
          kind: 'compare',
          columns: [
            {
              title: 'Content based',
              sub: 'items you liked look like this',
              rows: [
                'Uses item attributes: genre, cast, year',
                'Works from the first rating',
                'Explainable: because you liked X',
                'Stays in a rut, never surprises',
              ],
            },
            {
              title: 'Collaborative',
              sub: 'people like you liked this',
              rows: [
                'Uses the rating matrix only',
                'Needs history before it works',
                'Finds things content has no way to link',
                'Cold start for new users and new items',
              ],
            },
          ],
          caption:
            'Neither wins, so neither is coloured; real systems run both and blend. The reason to know both is the cold start question, which is the one that gets asked: content based is what you fall back on when collaborative has nothing to work with.',
        },
        sections: [
          {
            heading: 'Clarify first',
            items: [
              'Are you designing the classes or the pipeline? Ask, because this question is asked in both rounds and the answers differ completely.',
              'Explicit ratings, or implicit signals like watch time and abandonment? Implicit is far more plentiful and far noisier.',
              'Is it a home page of rows, or one "more like this" list? The first is many recommenders, not one.',
              'How fresh must it be? Nightly batch and live personalisation are different systems.',
            ],
          },
          {
            heading: 'The object model',
            items: [
              'A Recommender interface with recommend(user, n). Content based, collaborative and popularity fallback are implementations.',
              'A blender that takes several recommenders with weights and merges their output. New strategies then arrive without touching anything else.',
              'A Scorer separate from a Filter: scoring ranks candidates, filtering removes what the user has seen, cannot stream, or should not be shown.',
              'Keep the fallback explicit as its own strategy. Popular-this-week is what a brand new user gets, and pretending otherwise is how cold start bugs hide.',
            ],
          },
          {
            heading: 'Two stages, because ranking everything is impossible',
            body: 'You cannot score a catalogue of a million titles per request. So generate candidates cheaply, a few hundred from several sources: similar to recently watched, popular in your region, from a genre you return to. Then rank that small set with the expensive model. This candidate generation and ranking split is how every production recommender is built, and naming it is worth more than any particular algorithm.',
          },
          {
            heading: 'Cold start and the honest problems',
            items: [
              'A new user has no history, so fall back to popularity, then to whatever the signup flow asked, then blend in collaborative as signals arrive.',
              'A new film has no ratings, so content based is what surfaces it at all. This is the main argument for keeping both.',
              'Popularity bias feeds itself: recommending popular things makes them more popular. Say it, and say you would hold back a slice of traffic for exploration.',
              'Offline metrics like precision at k do not predict what people actually watch. The real evaluation is an A/B test, and saying so is the senior answer.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'other-rounds',
    name: 'The other rounds',
    guides: [
      {
        id: 'the-testing-round',
        title: 'The testing round',
        blurb: 'Four different questions wear the same clothes, and answering the wrong one is the usual failure.',
        hook: "They hand you a function and ask what you would test. The answer that scores is not a list of inputs, it is how you chose them.",
        visual: {
          kind: 'table',
          head: ['What they ask', 'What they actually want', 'Where people fail'],
          rows: [
            ['"Test this pen"', 'Can you enumerate dimensions nobody listed', { text: 'Listing only the happy path', tone: 'bad' }],
            ['"Test this function"', 'Edge cases and a sense of coverage', { text: 'Testing three valid inputs', tone: 'bad' }],
            ['"Test this feature"', 'Levels: unit, integration, end to end', { text: 'One giant end-to-end test', tone: 'bad' }],
            ['"It is slow for one user"', 'A debugging method, not a guess', { text: 'Guessing a cause immediately', tone: 'bad' }],
          ],
          caption:
            'The first two are creativity tests, the third is a design test and the fourth is a troubleshooting test. Work out which one you were asked before answering, because the four have almost nothing in common beyond the word test.',
        },
        sections: [
          {
            heading: 'Testing a physical object',
            items: [
              'Ask who uses it and what for. A pen for an astronaut and a pen for a toddler have different tests, and asking is the first point scored.',
              'Then sweep dimensions: intended use, unintended use, durability, materials, environment, lifetime, safety, packaging.',
              'Give a few specific tests per dimension rather than many vague ones. "Write 5,000 words and measure line consistency" beats "test that it writes well".',
              'The failure is listing twenty happy-path checks. They want the dimensions you invented, not the volume.',
            ],
          },
          {
            heading: 'Testing a function',
            items: [
              'Normal cases first, briefly, then spend your time on the boundaries: empty, one element, maximum size, duplicates, already sorted, all identical.',
              'Invalid input, and what the contract says should happen. Throw, return a sentinel, or "cannot happen because the caller guarantees it". Pick one and say it.',
              'For anything numeric: zero, negatives, overflow, and floating point equality.',
              'Say what coverage you think you have and what you are deliberately not testing. Knowing the gap is worth more than pretending there is not one.',
            ],
          },
          {
            heading: 'Testing a feature',
            body: 'Answer in levels, because that is the structure being looked for. Unit tests for the logic, fast and numerous. Integration tests for the seams, where the real bugs live, and there should be many fewer. End to end for the two or three journeys that must never break, because they are slow and flaky and you pay for every one. Then the non-functional axes people forget: performance under load, accessibility, what happens offline, and what happens on rollback. Manual and exploratory testing has a place too, and saying so is not a weakness.',
          },
          {
            heading: 'Troubleshooting: slow for one user',
            items: [
              'Do not guess. Ask questions that halve the space: one user or many, always or sometimes, started when, one page or all of them.',
              'Reproduce it, or say honestly that you cannot and what you would instrument to catch it next time.',
              'Then bisect the stack: client, network, application, database. Each answer removes a layer.',
              'Say how you would confirm the fix and how you would know if it came back. A fix with no alert is a fix you will apply twice.',
            ],
          },
        ],
      },
      {
        id: 'concurrency-round',
        title: 'Concurrency, locks and deadlock',
        blurb: 'Two books give this a chapter. Even on a single-threaded runtime the vocabulary gets asked.',
        hook: "Two threads, one counter, and a number that is wrong about once in every ten thousand runs.",
        visual: [
          {
            kind: 'timeline',
            span: 10,
            lanes: [
              {
                label: 'thread A',
                events: [
                  { at: 0, label: 'read 0', width: 2 },
                  { at: 4, label: 'write 1', width: 2, tone: 'bad' },
                ],
              },
              {
                label: 'thread B',
                events: [
                  { at: 1, label: 'read 0', width: 2 },
                  { at: 5.5, label: 'write 1', width: 2, tone: 'bad' },
                ],
              },
              {
                label: 'counter',
                events: [{ at: 7.6, label: 'ends at 1, not 2', width: 2.4, tone: 'bad' }],
              },
            ],
            caption:
              'counter++ looks like one thing and is three: read, add, write. Both threads read 0 before either writes, so one increment is silently lost. This is the whole of what a race condition is, and drawing it beats defining it.',
          },
          {
            kind: 'boxes',
            columns: 2,
            items: [
              { label: 'Mutual exclusion', detail: 'A resource cannot be shared' },
              { label: 'Hold and wait', detail: 'You keep what you hold while waiting for more' },
              { label: 'No preemption', detail: 'Nothing can be taken away by force' },
              { label: 'Circular wait', detail: 'A waits on B waits on A' },
            ],
            caption:
              'Deadlock needs all four at once, which is the useful part: break any single one and it cannot happen. The practical break is circular wait, by making every thread acquire locks in the same global order.',
          },
        ],
        sections: [
          {
            heading: 'The vocabulary, stated precisely',
            items: [
              'Process: its own memory. Thread: shares memory with its siblings, which is exactly why threads are both cheap and dangerous.',
              'Concurrency is dealing with several things at once; parallelism is doing several things at once. One core can be concurrent and cannot be parallel.',
              'A mutex allows one holder. A semaphore allows n, and a mutex is the case where n is one.',
              'A monitor is a lock plus a condition to wait on, which is what synchronized and lock statements give you in most languages.',
            ],
          },
          {
            heading: 'The classic problems, and what each teaches',
            items: [
              'Producer and consumer: a bounded queue, a signal when it is not empty and a signal when it is not full. The lesson is to wait on a condition rather than spin.',
              'Dining philosophers: five forks, five diners, everyone grabs left then right and nobody eats. The lesson is lock ordering.',
              'Readers and writers: many readers or one writer. The lesson is that fairness is a design choice, because naive versions starve the writer forever.',
              'Busy waiting: a loop that burns a core checking a flag. The lesson is to block and be woken instead.',
            ],
          },
          {
            heading: 'The JavaScript answer, when it is a JavaScript interview',
            body: 'One thread and an event loop, so there are no data races on ordinary variables and no locks to take. That does not make it concurrent-free: await yields control, so state you read before an await can be different after it, and two overlapping async functions will happily interleave in a way that corrupts a shared counter or fires a request twice. Workers do have real parallelism and communicate by message passing rather than shared memory, apart from SharedArrayBuffer and Atomics, which is where actual races become possible again. Saying all of that is a better answer than "JavaScript is single-threaded".',
          },
          {
            heading: 'What to say about avoiding it',
            items: [
              'Do not share mutable state. Immutability and message passing remove the problem rather than managing it.',
              'If you must lock, acquire in a fixed global order and hold locks for as short a time as possible.',
              'Prefer the concurrency primitives your platform gives you over hand-rolled ones. Hand-rolled locks are almost always subtly wrong.',
              'Deadlock is the easy failure because it stops. Livelock and starvation keep running while making no progress, and they are much harder to notice.',
            ],
          },
        ],
      },
      {
        id: 'design-patterns-round',
        title: 'Design patterns worth knowing',
        blurb: 'Eleven patterns cover nearly every time the word comes up, and most of them you have already used without the name.',
        hook: "You have written most of these already. The round is whether you can name the one you just wrote, and say what it cost.",
        visual: {
          kind: 'table',
          head: ['Pattern', 'What it actually solves', 'Where you have already met it'],
          rows: [
            [{ text: 'Singleton', tone: 'bad' }, 'Exactly one instance, globally reachable', 'Often an anti-pattern: global state, hard to test'],
            ['Factory', 'Caller wants a thing, not a constructor', 'createRoot, document.createElement'],
            ['Builder', 'Too many constructor arguments', 'Query builders, fetch request builders'],
            ['Strategy', 'Swap one algorithm for another', 'Array.sort comparators, pricing rules'],
            ['Observer', 'Many listeners react to one change', 'addEventListener, any state store'],
            ['Iterator', 'Walk a collection without exposing it', 'for...of, Symbol.iterator, generators'],
            ['Decorator', 'Add behaviour without subclassing', 'Express middleware, React HOCs'],
            ['Adapter', 'Two interfaces that should fit and do not', 'Any SDK wrapper you have written'],
            ['Facade', 'One simple door onto a messy subsystem', 'Most internal API clients'],
            ['Command', 'An action as an object, so it can be undone', 'Undo stacks, job queues'],
            ['Proxy', 'Stand in front of the real thing', 'JavaScript Proxy, lazy loading, caching layers'],
          ],
          caption:
            'Only Singleton is marked, because it is the only one on this list that is more often the wrong answer than the right one. The rest are neutral: each solves a specific problem and none is a default.',
        },
        sections: [
          {
            heading: 'How the question gets asked',
            items: [
              'Directly: "name some design patterns you have used". Name three, and for each say the problem it solved rather than reciting the definition.',
              'Indirectly, which is more common: a design question where a pattern is the natural answer, and the interviewer waits to see whether you reach for it.',
              'As a trap: "would you use a Singleton here". Usually the answer is no, and saying why is the point.',
            ],
          },
          {
            heading: 'The three families, and why the grouping helps',
            body: 'Creational patterns are about how objects get made, which matters when construction is complicated or should be hidden. Structural patterns are about how objects are put together, which matters when two things need to fit and do not. Behavioural patterns are about how objects talk, which matters when you want to change who responds without changing who calls. If you can place a pattern in its family you can usually reconstruct what it does, which is more useful than memorising eleven definitions.',
          },
          {
            heading: 'Why Singleton keeps being the wrong answer',
            items: [
              'It is global mutable state with a respectable name, so everything that touches it is coupled to it.',
              'It makes tests order-dependent, because state survives between them and there is no seam to substitute a fake.',
              'It is usually solving "I do not want to pass this around", and dependency injection solves that without the global.',
              'There are real uses: a connection pool, a logger, a cache. Name one of those and you have shown you know the difference.',
            ],
          },
          {
            heading: 'What not to do',
            items: [
              'Do not apply a pattern to show you know it. Unnecessary indirection is a cost, and interviewers read it as inexperience rather than sophistication.',
              'Do not name a pattern you cannot draw. Saying Factory when you mean a function that returns an object is worse than saying nothing.',
              'Do say when a pattern is already built into the language. In JavaScript, iterators and observers are language features rather than things you hand-roll.',
            ],
          },
        ],
      },
      {
        id: 'puzzle-questions',
        title: 'Puzzle and estimation questions',
        blurb: 'Out of fashion at big companies and still asked. Every family has one move that cracks it.',
        hook: "They are mostly gone, and mostly gone is not gone. If one lands, the process of getting there is what is being watched.",
        visual: {
          kind: 'boxes',
          columns: 2,
          items: [
            { label: 'Counting', detail: 'Count the same thing two ways, or find the invariant that never changes' },
            { label: 'Measuring', detail: 'Jugs and weights: think in what differences you can make, not what you can fill' },
            { label: 'Ordering', detail: 'Sorting or tournament logic. Second best is found in the losers to the winner' },
            { label: 'Estimation', detail: 'Decompose into factors you can each guess within 10x, then multiply' },
            { label: 'Probability', detail: 'Enumerate the sample space. Conditional probability is nearly always the trick' },
            { label: 'Adversarial', detail: 'Work backwards from the losing position. Game theory problems collapse from the end' },
          ],
          caption:
            'No box is better than another, so none is coloured. The point of the grouping is that recognising the family gives you the opening move, which is most of what these questions test.',
        },
        sections: [
          {
            heading: 'What is actually being graded',
            body: 'Not whether you have heard the puzzle. The interviewer mostly wants to watch you not panic: state assumptions, break the problem into pieces, try a smaller version, and say your reasoning out loud the whole time. A candidate who reasons clearly to a wrong answer usually scores better than one who recalls the right answer instantly, because the second tells them nothing.',
          },
          {
            heading: 'The moves that work across families',
            items: [
              'Solve a smaller version. Two jugs instead of three, four people instead of a hundred. The pattern is almost always visible at n equals 3.',
              'Look for an invariant: something that does not change no matter what move is made. Most counting puzzles are one invariant wearing a disguise.',
              'Work backwards from the end state, which is the whole technique for adversarial and ordering puzzles.',
              'Count the same set in two different ways and set them equal. That is the entire method behind a surprising number of them.',
            ],
          },
          {
            heading: 'Estimation, worked',
            body: 'The classic is piano tuners in a city, and the method transfers to any capacity question you will get in a system design round. Pick a population, divide into households, guess the fraction with a piano, guess how often a piano is tuned, guess how many a tuner does a day and how many days they work. Multiply through. State every number as you assume it and keep them round, because the arithmetic is not the test. Being within an order of magnitude is a pass; being unable to start is not.',
          },
          {
            heading: 'If you have heard it before',
            body: 'Say so. Pretending to derive a memorised answer is obvious and it costs more than the question was worth. Then offer to solve it anyway while explaining the reasoning, or to take a different question. Interviewers respect this and it takes ten seconds.',
          },
        ],
      },
      {
        id: 'intractable-problems',
        title: 'When the problem is NP-hard',
        blurb: 'Rare, and a strong senior signal when it lands. Recognising it beats failing to find an algorithm that does not exist.',
        hook: "Sometimes the right answer is that no fast exact answer exists, and saying so confidently is the skill being tested.",
        visual: [
          {
            kind: 'boxes',
            columns: 2,
            items: [
              { label: 'Travelling salesman', detail: 'Visit every city once, minimum total' },
              { label: 'Knapsack', detail: 'Maximum value under a weight limit' },
              { label: 'Graph colouring', detail: 'Colour so no two neighbours match' },
              { label: 'Set cover', detail: 'Fewest sets that between them cover everything' },
              { label: 'Subset sum', detail: 'Any subset adding to exactly k' },
              { label: 'Bin packing', detail: 'Fewest containers that fit everything' },
            ],
            caption:
              'Six to recognise on sight. A question that reduces to one of these is asking whether you notice, not whether you can beat it. Scheduling, timetabling and register allocation are colouring; shift rostering is usually set cover.',
          },
          {
            kind: 'stack',
            layers: [
              { label: 'Check n first', detail: 'If n is 20, exponential is the intended answer', tone: 'good' },
              { label: 'Exact but exponential', detail: 'Bitmask DP, branch and bound, memoised search', tone: 'good' },
              { label: 'Approximation with a bound', detail: 'Greedy set cover is within a log factor, provably', tone: 'accent' },
              { label: 'Heuristic with no bound', detail: 'Usually fine, occasionally terrible, and you cannot tell which', tone: 'accent' },
              { label: 'Change the problem', detail: 'Restrict the input until it becomes tractable', tone: 'good' },
            ],
            caption:
              'In order of what to reach for. The bottom option is the one people forget and it is often the best: many NP-hard problems are easy on trees, on planar graphs, or when a parameter is small.',
          },
        ],
        sections: [
          {
            heading: 'The terms, used correctly',
            items: [
              'P: solvable in polynomial time. NP: a proposed answer can be checked in polynomial time.',
              'NP-complete: in NP, and everything in NP reduces to it. The hardest problems that are still checkable quickly.',
              'NP-hard: at least as hard as those, and not necessarily in NP itself. The optimisation version of travelling salesman is NP-hard, the yes-or-no version is NP-complete.',
              'Nobody has proved P is not NP. Say "no known polynomial algorithm", not "impossible", because the second is a claim nobody can make.',
            ],
          },
          {
            heading: 'How to show it in an interview',
            body: 'You are not expected to produce a formal reduction. You are expected to say "this looks like set cover, which is NP-hard, so I do not think there is an efficient exact algorithm and I would like to talk about what we do instead". Then gesture at the reduction in one sentence: each user is an element, each role is a set, and finding the fewest roles covering every permission is exactly set cover. That sentence is the whole signal.',
          },
          {
            heading: 'What to do about it',
            items: [
              'Look at n before anything else. Exponential on 20 items is instant, and the constraint is usually telling you that.',
              'Say what you would measure. "Greedy is within a log factor of optimal here, and I would check on real data whether that matters" is a senior answer.',
              'Special cases are genuinely easier. Knapsack has a pseudo-polynomial DP when the weights are small integers, which is why it appears in DP chapters despite being NP-hard.',
              'Timeboxing is legitimate engineering. Run the exact search for 200 milliseconds and fall back to greedy, and say so.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'process-and-offer',
    name: 'Process and offer',
    guides: [
      {
        id: 'the-loop',
        title: 'What the loop actually is',
        blurb: 'Five stages, each screening for something different. Preparing for the wrong one is a common way to fail.',
        hook: "Five conversations with five different people, scored on five different things, and most candidates prepare for one of them.",
        visual: {
          kind: 'timeline',
          span: 12,
          lanes: [
            {
              label: 'stage',
              events: [
                { at: 0, label: 'CV screen', width: 2 },
                { at: 2, label: 'recruiter', width: 2 },
                { at: 4, label: 'tech screen', width: 2.5, tone: 'accent' },
                { at: 6.5, label: 'onsite', width: 3.5, tone: 'accent' },
                { at: 10, label: 'committee', width: 2 },
              ],
            },
            {
              label: 'screening for',
              events: [
                { at: 0, label: 'keywords, mostly', width: 4 },
                { at: 4, label: 'can you code at all', width: 2.5 },
                { at: 6.5, label: 'depth and level', width: 5.5 },
              ],
            },
          ],
          caption:
            'The two amber stages are the ones that reject most people, and they test different things. A screen asks whether you can write working code under mild pressure. An onsite asks what level you are, which is why the same problem can be a pass at one level and a fail at another.',
        },
        sections: [
          {
            heading: 'What each stage is really doing',
            items: [
              'CV screen: often automated, matching keywords. Mirror the words in the job posting, because a human may never see it otherwise.',
              'Recruiter call: confirming you are real, available, roughly the right level, and in the salary range. Not technical, and it is where the range question first appears.',
              'Technical screen: one hour, usually one or two medium problems, remote and shared-editor. The bar is working code and clear communication rather than optimality.',
              'Onsite: typically four or five rounds. Two coding, one system or object-oriented design, one behavioural, sometimes one on your own past work.',
              'Debrief or committee: interviewers write feedback independently, then decide. This is why one bad round is survivable and one flat, unenthusiastic round often is not.',
            ],
          },
          {
            heading: 'How level is decided, which surprises people',
            body: 'You are usually not interviewed for a specific title. The loop decides what level you are, and the offer follows. That means depth beats breadth: one system you can describe to the bottom, including what you got wrong and what you would change, signals seniority far more than a broad tour of everything you have touched. It also means "I do not know, here is how I would find out" is a senior answer rather than a gap, and that scope and impact questions in the behavioural round are level questions in disguise.',
          },
          {
            heading: 'Preparing, in the order that pays',
            items: [
              'Depth on the first eight items of the priority list beats surface coverage of all thirty. If time is short, stop at eight and go deeper.',
              'Practice out loud, against a timer, writing on something that is not your editor. The gap between solving a problem and performing solving a problem is larger than people expect.',
              'Have six stories ready before the week of the interview, not during it.',
              'Do a mock with someone who will actually interrupt you. Almost all the value is in the interruption.',
              'Research the company enough to ask two real questions. Having none reads as indifference and costs more than a wrong answer.',
            ],
          },
          {
            heading: 'Special situations, said plainly',
            items: [
              'Career changer: lead with what you built, not with the apology. The projects are the evidence and the previous career is usually an asset worth one sentence.',
              'Laid off: it is a business decision and everyone knows that. State it in one line without editorialising and move on.',
              'A gap in the CV: name it, say what you did, do not over-explain. Over-explaining is what makes it look like a problem.',
              'Not enough experience for the posting: apply anyway. Postings are wish lists, and the loop decides the level regardless of the title on the advert.',
            ],
          },
          {
            heading: 'After it ends',
            items: [
              'Write down every question you were asked the same day, while you still remember the wording.',
              'A rejection usually has a cooling-off period, commonly six to twelve months, and reapplying after it is normal rather than awkward.',
              'Ask for feedback. You will often get nothing, occasionally something specific, and it costs one email.',
              'Interviewing is noisy. A rejection is one sample of a process with a lot of variance in it, not a measurement of you.',
            ],
          },
        ],
      },
      {
        id: 'the-offer',
        title: 'The offer, and negotiating it',
        blurb: 'The highest hourly rate of the entire process, and the part people prepare for least.',
        hook: "The number arrives by phone, they ask what you think, and whatever you say next is worth more per minute than anything else in the process.",
        visual: {
          kind: 'boxes',
          columns: 2,
          items: [
            { label: 'Base salary', detail: 'The part that compounds and that sets future raises' },
            { label: 'Equity', detail: 'Options or RSUs, vesting over years, usually with a cliff' },
            { label: 'Bonus', detail: 'Signing is one-off; annual is usually a target, not a promise' },
            { label: 'Everything else', detail: 'Pension, leave, remote policy, learning budget, notice period' },
          ],
          caption:
            'Four levers, not one, and they have different flexibility. Base is often constrained by a band and equity frequently is not, so a recruiter who cannot move base can sometimes move the other three. None is coloured because which one matters most depends entirely on your situation.',
        },
        sections: [
          {
            heading: 'Before any number is said',
            items: [
              'Find the range. Levels.fyi, Glassdoor, and asking people in the same market. Negotiating without data is guessing.',
              'Deflect the first "what are you looking for" politely. "I would rather understand the role and the level first, what range is budgeted for this?" works and is not rude.',
              'If you must give a number, give a researched range with the bottom at what you would genuinely accept.',
              'In several jurisdictions asking for salary history is illegal, and everywhere it is a question you may decline.',
            ],
          },
          {
            heading: 'Negotiating, without theatrics',
            body: 'Almost every offer has room, and asking politely once is expected rather than risky. The move is simple: thank them, say you are excited, name a specific number with a reason, and stop talking. "I am really keen to join. Based on what I have seen for this level in this market, I was hoping for X. Is there flexibility?" A competing offer is the strongest lever there is and you should never invent one, because it gets checked and it ends the process. If there is no flexibility on base, ask about signing bonus, equity, start date or the title, which is exactly why knowing the four levers matters.',
          },
          {
            heading: 'Reading equity honestly',
            items: [
              'A percentage means nothing without a valuation and a share count. Ask for both.',
              'Four years with a one-year cliff is standard. Leaving at month eleven means you get nothing.',
              'Options have a strike price and a tax event, and can expire shortly after you leave. RSUs are simpler and are taxed as income when they vest.',
              'For a private company, value it at something between zero and the paper number and be honest with yourself about which end. Most startups do not produce a liquidity event.',
            ],
          },
          {
            heading: 'Deciding, and the parts that are not money',
            items: [
              'Ask what the first six months look like, who you would work with, and what happened to the last person in the role.',
              'On-call expectations, deployment frequency and how much of the work is maintenance. These determine your daily life more than the salary does.',
              'Get it in writing before resigning anything. A verbal offer is not an offer.',
              'It is fine to ask for time. A week is normal, and an offer that comes with pressure to decide today is telling you something about the company.',
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
        hook: "\"Tell me about a conflict with a colleague.\" You have thirty seconds to pick which of the last five years to talk about.",
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
    ],
  },
]
