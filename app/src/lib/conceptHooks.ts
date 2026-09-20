/**
 * The way in, one per concept, keyed by id.
 *
 * Hooks belong in the markdown source as a `>` blockquote under the heading,
 * and scripts/build-concepts.py reads them from there. The main source lives
 * outside this repo, so these sit alongside it in the same shape as
 * conceptVisuals.ts. A hook in the source wins over one here.
 *
 * A hook is the situation, never the answer. It should be readable by someone
 * who does not yet know the term in the title, and it should describe
 * something that has actually happened to a working developer. If it could
 * open any page in the app, it is not a hook.
 */
export const conceptHooks: Record<string, string> = {
  // Foundations
  'big-o':
    "Your sort runs on the 50 rows in dev and nobody notices. It runs on the 50,000 rows in production and takes four minutes. Nothing about the code changed.",
  'array-vs-linked-list':
    "Inserting at the front of a million items costs a million shuffles in one of these and a single pointer write in the other. Reading the 500,000th item flips which one you want.",
  'how-does-a-hash-map-work':
    "Add the millionth name to a phone book and lookups get no slower. That is not obvious, and the reason it is true is the whole answer.",
  'stack-vs-queue':
    "The browser back button and a print queue both hold things you have not dealt with yet. Which one you want comes down to whether the newest or the oldest should come out first.",
  recursion:
    "A function that calls itself reads like a bug the first few times you see it. It is what you write when the problem contains a smaller copy of itself, and almost every tree question is that.",
  'trees-graphs-bfs-vs-dfs':
    "Both of them visit every node. Only one of them tells you the shortest way there, so picking the wrong one gives you an answer that runs, returns, and is wrong.",
  'memory-and-storage-by-speed':
    "Two functions do the same number of operations and one is thirty times slower. The difference is not the algorithm, it is how far the data had to travel.",

  // Objects and functions
  'what-is-oop':
    "Every design round opens here, and the usual answer is four words somebody memorised and cannot use on the problem in front of them.",
  'the-four-pillars':
    "Four words that are easy to recite and easy to fail on, because the follow-up is always \"give me an example from something you built\".",
  'composition-vs-inheritance':
    "Three levels into a class hierarchy you need one method that lives on a fourth class, and it is not a parent of yours. There is no way to reach it.",
  solid:
    "Five letters most people can list and two they can explain. The interviewer knows which two, because everybody picks the same two.",
  'class-vs-object':
    "The blueprint question sounds too easy to be worth asking, which is why it is usually the warm-up before something that is not.",
  'interface-vs-abstract-class':
    "You want to share some working code between two classes and also let a third class opt in to the same contract. Only one of these does both.",
  'what-is-functional-programming':
    "A function that reads the clock returns something different every time you call it with the same arguments. That one property is what the whole paradigm is organised around avoiding.",
  'pure-function':
    "The test passes on your machine and fails in CI, and the function takes no arguments that could explain the difference.",
  immutability:
    "You passed the array to a helper, the helper sorted it, and now the caller's copy is sorted too. Nobody wrote that down anywhere.",
  'higher-order-functions-and-currying':
    "You have written the same request wrapper four times with one line different. The fifth time you pass the line in instead.",
  'oop-vs-fp':
    "The honest answer is that you already write both, in the same file, most days.",
  'is-javascript-object-oriented':
    "JavaScript has the `class` keyword and no classes underneath it, which is a fine thing to be asked about when you have used both for years.",
  'static-members':
    "A counter that belongs to the class rather than to any one instance, and the bug where two instances were supposed to share it and did not.",
  'access-modifiers':
    "The field is public because it was quicker, and now six files depend on it and you cannot change how it is stored.",
  'overloading-vs-overriding':
    "Two words one letter apart, and only one of them exists in JavaScript at all.",

  // JavaScript and TypeScript
  'var-vs-let-vs-const':
    "A loop with `var` and a setTimeout inside prints the last index five times. Change one word to `let` and it prints 0, 1, 2, 3, 4.",
  'equality-vs-strict-equality':
    "`0 == \"\"` is true. `null == undefined` is true. `null == 0` is false. Nobody remembers the table, which is why the rule is to never need it.",
  closures:
    "Your setInterval keeps logging 0 while the counter on screen says 5.",
  'how-does-this-work':
    "You pass a method as a callback and it throws, because `this` is suddenly undefined. The method did not change. Who called it did.",
  hoisting:
    "A `const` declared on line 40 throws on line 3, and the error says it cannot access it before initialisation rather than that it does not exist.",
  'null-vs-undefined':
    "Two ways to say nothing is here, and the API you are calling uses both, for different reasons, in the same response.",
  'prototypal-inheritance':
    "Every object you have ever made has a `toString` you never wrote. Following where it came from is the answer.",
  'shallow-vs-deep-copy':
    "You spread the object to avoid mutating it, changed one nested field, and mutated it anyway.",
  'floating-point-and-number-precision':
    "`0.1 + 0.2` is not `0.3`, and the invoice total is out by a cent for one customer in ten thousand.",
  'event-loop':
    "A `setTimeout(fn, 0)` runs after a promise that resolved later than it. Both of them are async, and they are not waiting in the same queue.",
  'promises-vs-async-await':
    "Three awaits in a row on three requests that do not depend on each other turn 300ms into 900ms.",
  'debounce-vs-throttle':
    "The search box fires a request per keystroke, so typing \"lasagne\" costs seven round trips and shows the results for \"lasagn\".",
  'bubbling-capturing-delegation':
    "A table with 900 rows and 900 click handlers, or a table with 900 rows and one.",
  'typescript-interface-vs-type':
    "Two ways to name a shape, mostly interchangeable, and the interviewer wants the case where they are not.",
  'any-vs-unknown-vs-never':
    "Someone reached for `any` to get the build green, and six months later the field it was hiding changed name and nothing complained.",
  generics:
    "You wrote the same array helper for users and for orders, and the only difference between them is a word.",

  // React
  'state-vs-props':
    "The child edits the value, the input updates, and the parent never finds out.",
  'virtual-dom-and-reconciliation':
    "You told React to render the whole component on every keystroke, and the browser is not repainting the whole component. Something in between is deciding what actually touches the DOM.",
  'why-do-keys-matter':
    "You delete the second row and the text you typed into row three shows up in row two.",
  'when-does-a-component-re-render':
    "You wrapped the child in React.memo and it still re-renders every time the parent does.",
  'are-state-updates-synchronous':
    "You call setCount twice in one handler and it goes up by one.",
  useeffect:
    "The effect runs twice on mount in development and your counter counts two.",
  'custom-hooks-and-rules-of-hooks':
    "You moved a useState inside an `if` to skip it when the prop was missing, and every other piece of state in the component started returning the wrong thing.",
  'usememo-usecallback-react-memo':
    "Someone wrapped every function in the file in useCallback, and the render got slower.",
  'controlled-vs-uncontrolled-inputs':
    "The input will not let you type. The value is pinned to state and nothing is updating the state.",
  'context-vs-a-state-library':
    "You put the user object in context, and now every component under the provider re-renders when the theme changes.",
  'error-boundaries':
    "One card in a dashboard throws while rendering, and the whole page goes white.",
  'csr-vs-ssr-vs-ssg-and-hydration':
    "The page is on screen and nothing responds to clicks for another second and a half.",
  'server-components':
    "Half the bundle is a markdown renderer that only ever runs once, on content that never changes per user.",

  // The web platform
  'what-happens-when-you-type-a-url-and-press-enter':
    "One question that can fill forty minutes on its own, because every layer you name is a door the interviewer is allowed to open.",
  dns:
    "The deploy went out, the site is up for you and down for half the office, and nobody has touched the servers.",
  'tcp-vs-udp':
    "A dropped packet in a video call is a frame you never see. A dropped packet in a file download is a corrupt file. Only one of those is worth waiting for.",
  'tls-and-the-https-handshake':
    "The padlock means a stranger on the same cafe wifi cannot read the request. Being asked how it got there is being asked what the padlock is actually promising.",
  'http-methods-and-idempotency':
    "The payment page times out, the user hits refresh, and the card gets charged twice.",
  'status-codes':
    "The API returns 200 with `{\"error\": \"not found\"}` in the body, and every client has to parse the body to find out it failed.",
  'http-caching':
    "You shipped a fix, the CDN is serving it, and a chunk of users will keep seeing the old bundle for a week.",
  'http-2-and-http-3':
    "Somebody is still inlining sprites and concatenating scripts to save round trips that stopped costing anything three protocol versions ago.",
  'rest-vs-graphql':
    "The mobile screen needs four fields and the endpoint returns ninety, so somebody adds `/users/:id/summary`. Then six more like it.",
  'polling-vs-sse-vs-websockets':
    "Every open tab asks \"anything new?\" twice a second, and the answer is no about 7,000 times an hour, per user.",
  'cookies-vs-localstorage-vs-sessionstorage':
    "The token is in localStorage, and any script on the page can read it. That includes the analytics tag somebody added last week.",
  cors:
    "It works in Postman and fails in the browser, and the fix is a header the frontend is not allowed to set.",
  'xss-and-csrf':
    "One of them lets a stranger run code as your user. The other lets a stranger act as your user without ever running any.",
  'authentication-vs-authorization-sessions-vs-jwt':
    "You issue tokens that last an hour, somebody resigns at 10am, and you need them out now.",
  'storing-passwords':
    "The database leaked. Whether that is an incident or a catastrophe was decided years earlier, by one line in the signup handler.",
  'oauth-2-0-and-sso':
    "\"Sign in with Google\" never sends Google your password, and it never sends you Google's. Something else is being passed around instead.",
  'reflow-vs-repaint':
    "A loop that reads `offsetHeight` and sets `style.height` on 200 elements locks the tab for a second. Reordering the same two lines fixes it.",
  'core-web-vitals':
    "The page loads fast and feels awful, because the button you were about to press moved after an ad finished loading.",
  'accessibility-basics':
    "The div has an onClick and no keyboard user can reach it, which is also why the automated audit failed the build.",

  // Processes, threads and memory
  'process-vs-thread':
    "One browser tab crashing takes down that tab. It used to take down the browser, and the fix was architectural.",
  'concurrency-vs-parallelism':
    "Node does thousands of requests at once on one core. Nothing runs at the same instant, and it is still not lying.",
  'race-conditions-and-deadlocks':
    "Two requests read the balance, both see 100, both subtract 80, and the account ends on 20.",
  'garbage-collection':
    "The tab sits at 4GB after an hour of use, and every leak traces back to something still holding a reference nobody remembered.",

  // Databases
  'sql-vs-nosql':
    "\"We picked Mongo because it scales\" is the answer that ends this topic badly, usually in the next question.",
  indexes:
    "The query took 12 seconds. You add one line and it takes 8 milliseconds. Two weeks later the writes are slower and nobody connects the two.",
  joins:
    "The report is missing every customer who has not ordered yet, and the only difference between right and wrong is one word in the query.",
  'normalization-vs-denormalization':
    "Storing the customer name on the order is wrong until the day the orders page needs six joins to render a list.",
  acid:
    "The transfer debited one account and the process died before it credited the other.",
  'transaction-isolation-levels':
    "You run the same SELECT twice inside one transaction and get different rows back. That is a setting, not a bug.",
  'the-n-1-query-problem':
    "The page renders 50 orders and the database log has 51 queries in it.",

  // System design concepts
  'vertical-vs-horizontal-scaling':
    "The box is already the largest one the provider sells.",
  'load-balancer':
    "You add a second server, and users start getting logged out on every other request.",
  'load-balancing-algorithms':
    "Round robin sends the next request to the next box, which is fine until one box is halfway through a 30 second export.",
  'reverse-proxy-api-gateway-and-load-balancer':
    "Three boxes that all sit in front of your servers and all get drawn as the same rectangle on the whiteboard.",
  'caching-and-invalidation':
    "The price changed an hour ago and one user in ten is still being shown the old one.",
  cdn:
    "The image is 40ms away in Frankfurt and 300ms away in Sydney, and the file is identical.",
  'message-queues':
    "Signup takes four seconds because it sends the welcome email before it returns, and the email provider is having a bad morning.",
  'rate-limiting':
    "One customer's broken retry loop is using 90 percent of your API capacity.",
  'monolith-vs-microservices':
    "Eight services, and adding one field to a user means a coordinated deploy across four of them.",
  'cap-theorem':
    "The network between two data centres drops. You either stop accepting writes or you accept two versions of the truth. There is no third option.",
  'event-sourcing-and-cqrs':
    "Somebody asks what the balance was last Tuesday, and the only thing you stored was what it is now.",
  mapreduce:
    "A log file too big for any one machine, and a question about it that any one machine could answer if it only saw a slice.",

  // Engineering practice
  'types-of-tests':
    "The suite is green, the deploy is broken, and every test mocked the thing that failed.",
  tdd:
    "Writing the test first feels backwards until the first time it stops you building the wrong function.",
  'git-merge-vs-rebase':
    "Somebody rebased a shared branch and force-pushed it, and four people lost an afternoon.",
  'ci-cd':
    "The build is green on main and nobody can say whether that means it is safe to deploy.",
  'docker-and-containers':
    "It works on your machine, and your machine has a Python 3.11 and a Postgres that production does not.",
  'kubernetes-in-one-answer':
    "You have containers. Something has to decide which machine each one runs on, and restart it at 3am when it dies.",
  'dry-kiss-yagni':
    "Two functions look similar so somebody merged them, and now there is one function with a boolean flag and four branches.",
  'design-patterns-to-be-able-to-name':
    "You have written most of them already. The question is whether you can put the name to the thing when someone asks.",
  'mvc-mvp-and-mvvm':
    "Three acronyms, one idea, and thirty years of frameworks disagreeing about where the arrows point.",
  'technical-debt':
    "The estimate for the feature is three days, and two of them are for the thing somebody shipped in a hurry last year.",

  // Ways of working
  'agile-vs-waterfall':
    "The spec was signed off in March and the thing everyone actually wanted became obvious in July.",
  'what-is-scrum':
    "Most teams say they do it. The interviewer is asking whether you know what the parts are for, or only what they are called.",
  'the-scrum-ceremonies':
    "Four meetings that each have a point, and a team that has quietly turned all four into status updates.",
  'scrum-vs-kanban':
    "A support team committing to two weeks of work is committing to a fiction, and everybody in the room knows it by Wednesday.",
  'story-points-and-estimation':
    "Two developers say 5 and mean different weeks.",
  'estimation-and-why-it-goes-wrong':
    "The work took three times the estimate, and every single part of it was estimated correctly.",
  'definition-of-done':
    "It is done. It is not tested, documented, or deployed, but it is done.",
  'code-review':
    "\"Why not use a map here\" is the fourth comment of its kind on a PR that has been open for three days.",
  'trunk-based-development-vs-git-flow':
    "The feature branch is three weeks old and merging it is now its own project.",
  'feature-flags':
    "You want the code on main and off for users, and you do not want a branch to carry that difference for a month.",
  'semantic-versioning':
    "A patch release broke the build, because the thing that changed was not the thing the number said changed.",
  'observability-logs-metrics-traces':
    "The dashboard says the API is healthy and a customer is on the phone saying it is not.",
  'sla-slo-and-sli':
    "\"The site should be fast\" cannot be paged on. Something in the room has to become a number.",
  'on-call-and-incident-response':
    "It is 3am, the pager went off, and the useful first move is not to start reading code.",
  'technical-documentation-and-adrs':
    "Somebody asks why the queue is there. The person who knows left in 2023.",

  // The interview itself
  'when-you-don-t-know':
    "They ask about something you have genuinely never touched, and there are thirty-five minutes left.",
}
