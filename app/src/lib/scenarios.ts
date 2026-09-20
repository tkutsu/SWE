import type { Frame } from '../engine/types'

/**
 * A concept page has nothing to step through. The algorithm pages hold
 * attention because after the scene there is something that moves under your
 * finger, and a still diagram of an idea whose whole content is *order in
 * time* is the wrong drawing however well it is drawn: the eye has nowhere to
 * start and every box is equally true at once.
 *
 * So: the same player, the same `Frame`s, the same views. The difference is
 * that an algorithm generates its frames from real code on real input, and
 * these are written by hand, because there is no program whose execution is
 * "the browser fetches a page". The trade is that nothing checks them against
 * an implementation, so a scenario must only ever claim things the answer on
 * the same page also claims.
 *
 * `code` is optional. Where the idea *is* a piece of code, the panel earns its
 * place and `line` points into it; where it is not, frames set `line: 0` and
 * no panel is drawn.
 */
export type Scenario = {
  /** Shown above the player, so it is clear this is a worked example. */
  title: string
  code?: string
  frames: Frame[]
}

const EVENT_LOOP_CODE = `console.log('one')

setTimeout(() => console.log('timeout'), 0)

Promise.resolve().then(() => console.log('promise'))

console.log('two')`

/**
 * The order this prints is the question, and every still diagram of it shows
 * all four queues full at once, which is precisely the thing that is never
 * true.
 */
const eventLoop: Scenario = {
  title: 'Four lines, and the order they print in',
  code: EVENT_LOOP_CODE,
  frames: [
    {
      line: 1,
      note: "The call stack runs to completion, and nothing else gets a turn while it has anything on it. Line 1 is ordinary synchronous work, so it prints straight away.",
      views: [
        { kind: 'stack', label: 'call stack', items: [{ label: "log('one')", role: 'active' }], orientation: 'vertical' },
        { kind: 'stack', label: 'microtasks (promises)', items: [], orientation: 'horizontal' },
        { kind: 'stack', label: 'macrotasks (timers)', items: [], orientation: 'horizontal' },
        { kind: 'array', label: 'printed so far', cells: [{ value: 'one', role: 'match' }] },
      ],
      vars: { output: 'one' },
    },
    {
      line: 3,
      note: "setTimeout with a delay of 0 does not mean now. It hands the callback to the browser, which parks it and will queue it as a macrotask once the timer fires. The stack moves straight on.",
      views: [
        { kind: 'stack', label: 'call stack', items: [{ label: 'setTimeout(fn, 0)', role: 'active' }], orientation: 'vertical' },
        { kind: 'stack', label: 'microtasks (promises)', items: [], orientation: 'horizontal' },
        { kind: 'stack', label: 'macrotasks (timers)', items: [{ label: "log('timeout')", role: 'frontier' }], orientation: 'horizontal' },
        { kind: 'array', label: 'printed so far', cells: [{ value: 'one', role: 'match' }] },
      ],
      vars: { output: 'one' },
    },
    {
      line: 5,
      note: "The promise is already resolved, so its callback is ready immediately. It joins the microtask queue, which is not the queue the timer is waiting in.",
      views: [
        { kind: 'stack', label: 'call stack', items: [{ label: '.then(fn)', role: 'active' }], orientation: 'vertical' },
        { kind: 'stack', label: 'microtasks (promises)', items: [{ label: "log('promise')", role: 'frontier' }], orientation: 'horizontal' },
        { kind: 'stack', label: 'macrotasks (timers)', items: [{ label: "log('timeout')", role: 'frontier' }], orientation: 'horizontal' },
        { kind: 'array', label: 'printed so far', cells: [{ value: 'one', role: 'match' }] },
      ],
      vars: { output: 'one' },
    },
    {
      line: 7,
      note: "Line 7 is synchronous, and the stack is still running, so it goes before either queued callback. Both of those were queued before this line and neither of them has run.",
      views: [
        { kind: 'stack', label: 'call stack', items: [{ label: "log('two')", role: 'active' }], orientation: 'vertical' },
        { kind: 'stack', label: 'microtasks (promises)', items: [{ label: "log('promise')", role: 'frontier' }], orientation: 'horizontal' },
        { kind: 'stack', label: 'macrotasks (timers)', items: [{ label: "log('timeout')", role: 'frontier' }], orientation: 'horizontal' },
        { kind: 'array', label: 'printed so far', cells: [{ value: 'one', role: 'match' }, { value: 'two', role: 'match' }] },
      ],
      vars: { output: 'one, two' },
    },
    {
      line: 0,
      note: "The script finishes and the stack empties. Only now does the event loop get to choose, and its first move is always to drain the microtask queue completely.",
      views: [
        { kind: 'stack', label: 'call stack', items: [], orientation: 'vertical' },
        { kind: 'stack', label: 'microtasks (promises)', items: [{ label: "log('promise')", role: 'active' }], orientation: 'horizontal' },
        { kind: 'stack', label: 'macrotasks (timers)', items: [{ label: "log('timeout')", role: 'frontier' }], orientation: 'horizontal' },
        { kind: 'array', label: 'printed so far', cells: [{ value: 'one', role: 'match' }, { value: 'two', role: 'match' }] },
      ],
      vars: { output: 'one, two' },
    },
    {
      line: 5,
      note: "The promise callback runs. If it queued another microtask, that one would run before any timer too: the loop drains microtasks until there are none left, not one per turn.",
      views: [
        { kind: 'stack', label: 'call stack', items: [{ label: "log('promise')", role: 'active' }], orientation: 'vertical' },
        { kind: 'stack', label: 'microtasks (promises)', items: [], orientation: 'horizontal' },
        { kind: 'stack', label: 'macrotasks (timers)', items: [{ label: "log('timeout')", role: 'frontier' }], orientation: 'horizontal' },
        { kind: 'array', label: 'printed so far', cells: [{ value: 'one', role: 'match' }, { value: 'two', role: 'match' }, { value: 'promise', role: 'match' }] },
      ],
      vars: { output: 'one, two, promise' },
    },
    {
      line: 3,
      note: "Only with the microtask queue empty does the loop take one macrotask. The timer was queued before the promise and still comes last, which is the whole answer.",
      views: [
        { kind: 'stack', label: 'call stack', items: [{ label: "log('timeout')", role: 'active' }], orientation: 'vertical' },
        { kind: 'stack', label: 'microtasks (promises)', items: [], orientation: 'horizontal' },
        { kind: 'stack', label: 'macrotasks (timers)', items: [], orientation: 'horizontal' },
        {
          kind: 'array',
          label: 'printed so far',
          cells: [
            { value: 'one', role: 'match' },
            { value: 'two', role: 'match' },
            { value: 'promise', role: 'match' },
            { value: 'timeout', role: 'match' },
          ],
        },
      ],
      vars: { output: 'one, two, promise, timeout' },
      result: 'one, two, promise, timeout',
    },
  ],
}

const CLOSURE_CODE = `for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100)
}
// change var to let and it prints 0 1 2`

/** The hook on this page is a bug. This is that bug, one step at a time. */
const closures: Scenario = {
  title: 'Why the loop prints 3, 3, 3',
  code: CLOSURE_CODE,
  frames: [
    {
      line: 1,
      note: "`var` declares one binding for the whole function, not one per turn of the loop. There is a single box called i, and every callback made in here will point at that same box.",
      views: [
        { kind: 'map', label: 'scope', entries: [{ key: 'i', value: 0, role: 'active' }] },
        { kind: 'stack', label: 'timers waiting', items: [], orientation: 'horizontal' },
      ],
      vars: { i: 0 },
    },
    {
      line: 2,
      note: "The first callback is parked. It did not copy i. It kept a reference to the one box, which is what a closure is: the function keeps the scope it was made in alive.",
      views: [
        { kind: 'map', label: 'scope', entries: [{ key: 'i', value: 0, role: 'active' }] },
        { kind: 'stack', label: 'timers waiting', items: [{ label: 'log(i) -> the box', role: 'frontier' }], orientation: 'horizontal' },
      ],
      vars: { i: 0 },
    },
    {
      line: 1,
      note: "i becomes 1. The callback already parked does not care what i was when it was made; it will read the box when it runs, and the box has changed.",
      views: [
        { kind: 'map', label: 'scope', entries: [{ key: 'i', value: 1, role: 'active' }] },
        { kind: 'stack', label: 'timers waiting', items: [{ label: 'log(i) -> the box', role: 'frontier' }], orientation: 'horizontal' },
      ],
      vars: { i: 1 },
    },
    {
      line: 2,
      note: "Second callback parked, pointing at the same box as the first one. Two functions, one variable between them.",
      views: [
        { kind: 'map', label: 'scope', entries: [{ key: 'i', value: 1, role: 'active' }] },
        {
          kind: 'stack',
          label: 'timers waiting',
          items: [
            { label: 'log(i) -> the box', role: 'frontier' },
            { label: 'log(i) -> the box', role: 'frontier' },
          ],
          orientation: 'horizontal',
        },
      ],
      vars: { i: 1 },
    },
    {
      line: 1,
      note: "Third turn, third callback, still the same box. Then i becomes 3, the condition fails and the loop ends. Nothing has printed yet, because none of the timers have fired.",
      views: [
        { kind: 'map', label: 'scope', entries: [{ key: 'i', value: 3, role: 'compare' }] },
        {
          kind: 'stack',
          label: 'timers waiting',
          items: [
            { label: 'log(i) -> the box', role: 'frontier' },
            { label: 'log(i) -> the box', role: 'frontier' },
            { label: 'log(i) -> the box', role: 'frontier' },
          ],
          orientation: 'horizontal',
        },
      ],
      vars: { i: 3 },
    },
    {
      line: 2,
      note: "100ms later the timers fire. Each one reads the box now, and the box holds 3. Three callbacks, three reads of one variable, and the loop that made them finished long ago.",
      views: [
        { kind: 'map', label: 'scope', entries: [{ key: 'i', value: 3, role: 'active' }] },
        { kind: 'array', label: 'printed', cells: [{ value: 3, role: 'excluded' }, { value: 3, role: 'excluded' }, { value: 3, role: 'excluded' }] },
      ],
      vars: { i: 3 },
    },
    {
      line: 4,
      note: "`let` is block scoped, so the loop makes a fresh binding every turn and each callback closes over a different one. One keyword, three separate boxes, and the answer everybody expected.",
      views: [
        {
          kind: 'map',
          label: 'scope, with let',
          entries: [
            { key: 'i (turn 1)', value: 0, role: 'match' },
            { key: 'i (turn 2)', value: 1, role: 'match' },
            { key: 'i (turn 3)', value: 2, role: 'match' },
          ],
        },
        { kind: 'array', label: 'printed', cells: [{ value: 0, role: 'match' }, { value: 1, role: 'match' }, { value: 2, role: 'match' }] },
      ],
      vars: { i: 'one per turn' },
      result: 'var prints 3 3 3, let prints 0 1 2',
    },
  ],
}

/**
 * The still diagram for this shows eight boxes at once, and the eye has
 * nowhere to start. The point of the question is that it is a sequence, and
 * that most of it gets skipped on the second visit.
 */
const urlBar: Scenario = {
  title: 'Enter, to pixels',
  frames: [
    {
      line: 0,
      note: "You press Enter. Before any network happens at all, the browser works out whether this is even a URL, and whether it already holds a fresh copy of the page.",
      views: [
        {
          kind: 'stack',
          label: 'the trip',
          orientation: 'horizontal',
          items: [
            { label: 'browser', role: 'active' },
            { label: 'DNS' },
            { label: 'TCP' },
            { label: 'TLS' },
            { label: 'server' },
            { label: 'render' },
          ],
        },
      ],
      vars: { elapsed: '0ms', 'round trips': 0 },
    },
    {
      line: 0,
      note: "The name has to become an address. Browser cache, then the OS, then a resolver that walks the hierarchy until something authoritative answers. On a second visit this step costs nothing, because the answer came back with a TTL and was kept.",
      views: [
        {
          kind: 'stack',
          label: 'the trip',
          orientation: 'horizontal',
          items: [
            { label: 'browser', role: 'visited' },
            { label: 'DNS', role: 'active' },
            { label: 'TCP' },
            { label: 'TLS' },
            { label: 'server' },
            { label: 'render' },
          ],
        },
      ],
      vars: { elapsed: '~20ms', 'round trips': 0, 'on a repeat visit': 'cached, skipped' },
    },
    {
      line: 0,
      note: "A TCP connection opens: SYN, SYN-ACK, ACK. That is a full round trip spent before one byte of your actual request has been sent, which is why round trips, not bandwidth, are the currency of page load.",
      views: [
        {
          kind: 'stack',
          label: 'the trip',
          orientation: 'horizontal',
          items: [
            { label: 'browser', role: 'visited' },
            { label: 'DNS', role: 'visited' },
            { label: 'TCP', role: 'active' },
            { label: 'TLS' },
            { label: 'server' },
            { label: 'render' },
          ],
        },
      ],
      vars: { elapsed: '~50ms', 'round trips': 1 },
    },
    {
      line: 0,
      note: "On HTTPS, TLS then agrees a cipher and checks the certificate, which is another round trip or two. A resumed session skips most of that, and is the second reason a repeat visit feels instant.",
      views: [
        {
          kind: 'stack',
          label: 'the trip',
          orientation: 'horizontal',
          items: [
            { label: 'browser', role: 'visited' },
            { label: 'DNS', role: 'visited' },
            { label: 'TCP', role: 'visited' },
            { label: 'TLS', role: 'active' },
            { label: 'server' },
            { label: 'render' },
          ],
        },
      ],
      vars: { elapsed: '~100ms', 'round trips': 2 },
    },
    {
      line: 0,
      note: "Now the GET goes out and HTML comes back, usually from a CDN or a load balancer rather than from the machine that built it. The browser starts parsing before the whole response has arrived.",
      views: [
        {
          kind: 'stack',
          label: 'the trip',
          orientation: 'horizontal',
          items: [
            { label: 'browser', role: 'visited' },
            { label: 'DNS', role: 'visited' },
            { label: 'TCP', role: 'visited' },
            { label: 'TLS', role: 'visited' },
            { label: 'server', role: 'active' },
            { label: 'render' },
          ],
        },
      ],
      vars: { elapsed: '~150ms', 'round trips': 3 },
    },
    {
      line: 0,
      note: "Parse to a DOM, fetch the CSS and JS, build the render tree, lay it out, paint. A synchronous script in the head blocks every one of those steps, which is the one performance answer worth having ready.",
      views: [
        {
          kind: 'stack',
          label: 'the trip',
          orientation: 'horizontal',
          items: [
            { label: 'browser', role: 'visited' },
            { label: 'DNS', role: 'visited' },
            { label: 'TCP', role: 'visited' },
            { label: 'TLS', role: 'visited' },
            { label: 'server', role: 'visited' },
            { label: 'render', role: 'active' },
          ],
        },
        {
          kind: 'stack',
          label: 'inside that last box',
          orientation: 'horizontal',
          items: [
            { label: 'parse HTML', role: 'visited' },
            { label: 'DOM + CSSOM', role: 'visited' },
            { label: 'render tree', role: 'visited' },
            { label: 'layout', role: 'visited' },
            { label: 'paint', role: 'match' },
          ],
        },
      ],
      vars: { elapsed: '~300ms', 'round trips': 3 },
      result: 'DNS, TCP, TLS, HTTP, parse, render. On a repeat visit, the first three are mostly skipped.',
    },
  ],
}

/**
 * Keyed by concept id, the same way conceptVisuals and conceptHooks are. A
 * concept with no scenario keeps its still diagram and loses nothing.
 */
export const scenarios: Record<string, Scenario> = {
  'event-loop': eventLoop,
  closures,
  'what-happens-when-you-type-a-url-and-press-enter': urlBar,
}
