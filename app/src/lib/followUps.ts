/**
 * What they ask after the answer lands, keyed by concept id.
 *
 * The page used to pull these out of the answer body, on the assumption that
 * most answers already ended with an "Expect the follow-up ..." line. One of
 * 119 did. These are written rather than extracted, and the extraction still
 * runs for any answer that carries one, so a line in the source wins.
 *
 * A follow-up is the question, not the answer to it. Seeing the question is
 * what tells you whether you could handle it; being handed both is reading.
 */
export const followUps: Record<string, string[]> = {
  'big-o': [
    'What is the space complexity of what you just wrote?',
    'When would you take the O(n squared) one on purpose?',
    'Your solution is O(n log n). Can you do better, and how do you know you cannot?',
  ],
  'array-vs-linked-list': [
    'Which one backs a JavaScript array, and what happens when it grows past its capacity?',
    'Why is a linked list slower to walk than an array with the same number of elements?',
  ],
  'how-does-a-hash-map-work': [
    'What happens on a collision, and what does that do to the worst case?',
    'What makes a good hash function, and what breaks if it is bad?',
    'Why can you not use a mutable object as a key without care?',
  ],
  'stack-vs-queue': [
    'Implement a queue using two stacks. What is the amortised cost of a dequeue?',
    'Which one does BFS use, and what happens to the answer if you swap it for the other?',
  ],
  recursion: [
    'Rewrite that iteratively.',
    'What is the space complexity, counting the call stack?',
    'What is tail recursion, and does JavaScript optimise it?',
  ],
  'trees-graphs-bfs-vs-dfs': [
    'The graph is weighted now. Does BFS still give you the shortest path?',
    'The graph has 100,000 nodes in a line. Which one breaks, and why?',
    'How do you detect a cycle with each of them?',
  ],
  'what-is-oop': ['Explain the four pillars.', 'Is JavaScript object-oriented?', 'When would you not use OOP?'],
  'the-four-pillars': [
    'Give me an example of each from something you have actually built.',
    'Which of the four does JavaScript do differently from Java?',
  ],
  'composition-vs-inheritance': [
    'When is inheritance the right call?',
    'How does React share behaviour without component inheritance?',
    'What is the diamond problem?',
  ],
  solid: [
    'Give an example of a violation you have seen, and what it cost.',
    'Which of the five do you think is most often misapplied?',
    'Does the single responsibility principle apply to a React component?',
  ],
  'var-vs-let-vs-const': [
    'Does const make the value immutable?',
    'What is the temporal dead zone?',
    'Why does the loop with var print the last index?',
  ],
  'equality-vs-strict-equality': [
    'What does == do with null and undefined, and why is that a special case?',
    'How would you compare two objects for equality?',
    'What is Object.is for?',
  ],
  closures: [
    'What is the memory cost, and how does a closure cause a leak?',
    'Write a function that can only be called once.',
    'How do closures relate to the stale value inside a useEffect?',
  ],
  'how-does-this-work': [
    'What does an arrow function do differently?',
    'What is the difference between call, apply and bind?',
    'Why does passing a method as a callback break it, and what are the two fixes?',
  ],
  'event-loop': [
    'Which runs first, a promise callback or a setTimeout with zero delay?',
    'What is the difference between the microtask and macrotask queues?',
    'What happens to the event loop during a long synchronous loop?',
  ],
  'promises-vs-async-await': [
    'How would you run three independent requests concurrently?',
    'What is the difference between Promise.all and Promise.allSettled?',
    'How do you handle an error in an async function without try/catch everywhere?',
  ],
  'state-vs-props': [
    'How does a child tell a parent that something changed?',
    'When should state be lifted, and when does that become a problem?',
    'Is derived state ever worth storing?',
  ],
  'virtual-dom-and-reconciliation': [
    'Is the virtual DOM faster than direct DOM manipulation?',
    'What does React do when the element type changes between renders?',
    'Where do keys fit into reconciliation?',
  ],
  'why-do-keys-matter': [
    'Why is the array index a bad key, and when is it fine?',
    'What actually goes wrong on screen if you get the key wrong?',
  ],
  'when-does-a-component-re-render': [
    'Why did React.memo not stop that re-render?',
    'Is a re-render the same as a DOM update?',
    'How would you find out what caused one?',
  ],
  useeffect: [
    'Why does it run twice in development, and should you fix that?',
    'What goes in the dependency array, and what happens if you lie to it?',
    'How do you cancel a request when the component unmounts mid-flight?',
  ],
  'what-happens-when-you-type-a-url-and-press-enter': [
    'Where exactly does DNS look first?',
    'What is in the TLS handshake?',
    'The page is on screen but nothing responds to clicks. What is happening?',
  ],
  'http-methods-and-idempotency': [
    'Is POST ever idempotent, and how would you make it so?',
    'What is the difference between safe and idempotent?',
    'Which status code would you return for each of these?',
  ],
  'rest-vs-graphql': [
    'How do you cache GraphQL, given every query is a POST to one endpoint?',
    'What is the N+1 problem in a resolver, and how does a dataloader fix it?',
    'When would you pick REST for a new service?',
  ],
  cors: [
    'What makes a request preflighted?',
    'Does CORS protect the server?',
    'Why does credentials: include fail with a wildcard origin?',
  ],
  'xss-and-csrf': [
    'How does SameSite help, and what does it not cover?',
    'Why is a Content-Security-Policy worth having if you already escape output?',
    'Does storing a token in localStorage change your XSS exposure?',
  ],
  'authentication-vs-authorization-sessions-vs-jwt': [
    'How do you revoke a JWT before it expires?',
    'Where do you store the token, and what does each option expose you to?',
    'What is a refresh token for, and what happens if one is stolen?',
  ],
  'sql-vs-nosql': [
    'What would make you move off Postgres?',
    'How do you do a join in a document store?',
    'Do NoSQL databases have transactions?',
  ],
  indexes: [
    'What does an index cost you?',
    'Why is an index on a low-cardinality column often useless?',
    'What is a composite index, and does column order matter?',
  ],
  'vertical-vs-horizontal-scaling': [
    'What breaks first when you add a second server?',
    'How do you make an app stateless enough to scale out?',
  ],
  'load-balancer': [
    'What is sticky session, and why is it usually the wrong fix?',
    'How does the load balancer know a server is unhealthy?',
    'Layer 4 or layer 7, and what does each buy you?',
  ],
  'caching-and-invalidation': [
    'What is your invalidation strategy?',
    'What is a cache stampede, and how do you stop one?',
    'Write-through or write-behind, and what do you lose with each?',
  ],
  'types-of-tests': [
    'Your suite is green and production is broken. What kind of test was missing?',
    'What do you mock, and what do you refuse to mock?',
    'How do you decide a test is not worth writing?',
  ],
  'git-merge-vs-rebase': [
    'When is rebasing dangerous?',
    'What does a squash merge lose?',
    'How would you undo a rebase you have already pushed?',
  ],
  'code-review': [
    'What do you do when you disagree with a reviewer and neither of you moves?',
    'How big should a pull request be, and what do you do when it is not?',
    'What belongs in a review comment and what belongs in a conversation?',
  ],
  'when-you-don-t-know': [
    'So how would you find out?',
    'What would you try first, given what you do know?',
  ],
}
