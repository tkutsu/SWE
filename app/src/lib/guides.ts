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
