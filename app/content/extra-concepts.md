# Extra concepts

Kept in the repo, merged with the main source at build time.

## Ways of working

### What is Scrum?
An agile framework that delivers work in fixed-length sprints, usually two
weeks. Three roles: the product owner owns the backlog and its priority, the
scrum master removes blockers and protects the process, the developers build
it. The backlog is refined, a sprint is planned, work is done, then it is
demoed and reviewed in a retrospective. The point is a short feedback loop, so
you find out you built the wrong thing in two weeks rather than six months.

### Scrum vs Kanban
Scrum works in timeboxed sprints with a fixed commitment and ceremonies around
it. Kanban has no sprints: work flows continuously, you cap how many items can
be in progress at once, and you optimise for cycle time. Scrum suits work that
can be planned a sprint ahead. Kanban suits interrupt-driven work like support
or platform teams, where committing two weeks out is a fiction. Plenty of teams
run a hybrid and call it Scrum.

### The Scrum ceremonies
Sprint planning picks what the team commits to. The daily standup is fifteen
minutes to surface blockers, not a status report to a manager. The review or
demo shows working software to stakeholders. The retrospective looks at how the
team worked and picks one or two things to change. Backlog refinement keeps the
next sprint's work ready. If standup regularly runs long or feels like
reporting upward, that is the usual smell.

### Story points and estimation
Points measure relative size and uncertainty, not hours. A team estimates
against past work, and velocity, the points completed per sprint, is used to
forecast. They are deliberately not hours so that estimates are not treated as
commitments and do not get compared between teams. The common failure is
management treating velocity as a productivity target, at which point the
numbers inflate and stop meaning anything.

### Definition of done
The checklist a piece of work must meet before anyone calls it finished:
reviewed, tested, documented, deployed behind a flag, whatever the team agreed.
It exists so "done" means the same thing to everyone and work does not come
back a sprint later. Without one, half-finished work accumulates and the sprint
board lies.

### Agile vs waterfall
Waterfall plans everything up front and moves through requirements, design,
build and test in sequence. It works when requirements genuinely cannot change,
as with regulated hardware. Agile accepts that you learn what to build by
building it, so it works in short cycles with feedback at the end of each. Most
real teams are somewhere in between, and "we are agile" often just means "we do
standups".

### Code review
Another engineer reads your change before it merges. The value is catching
design problems and spreading knowledge, not typos, which a linter should be
doing. Keep pull requests small, because review quality falls off a cliff past
a few hundred lines. As the reviewer, separate what blocks the merge from what
is a suggestion. As the author, do not take it personally.

### Trunk based development vs Git Flow
Trunk based means everyone merges small changes to main frequently, often daily,
behind feature flags, and main is always releasable. Git Flow keeps long-lived
develop and release branches. Long branches mean painful merges and delayed
integration, which is exactly what continuous integration is supposed to
prevent. Trunk based is the modern default; Git Flow still fits software with
real versioned releases.

### Feature flags
A switch that turns code paths on and off without deploying. It separates
deploying from releasing, so you can ship unfinished work to production safely,
roll out to one percent of users, and turn something off without a rollback.
The cost is complexity: every flag is a branch in the code, and flags nobody
removes become permanent dead weight. Give each one an owner and a removal
date.

### Semantic versioning
MAJOR.MINOR.PATCH. Patch for a backwards compatible bug fix, minor for
backwards compatible new features, major for a breaking change. It lets
consumers know what upgrading costs them, which is what a caret range in
package.json relies on. The discipline that makes it work is being honest about
what counts as breaking.

### On-call and incident response
Someone is responsible for production out of hours. When something breaks:
acknowledge, mitigate first and diagnose second, communicate while you work,
then write it up. Mitigation beats root causing during an incident, so roll
back before you investigate. A blameless postmortem asks what about the system
let this happen, not who did it, because the alternative is people hiding
problems.

### Observability: logs, metrics, traces
Three complementary signals. Logs are discrete events with detail, good for
"what exactly happened to this request". Metrics are aggregated numbers over
time, good for "is anything wrong right now" and for alerts. Traces follow one
request across services, good for "which hop is slow". Monitoring tells you a
known thing broke; observability is being able to ask a question you did not
plan for.

### SLA, SLO and SLI
An SLI is the measurement, such as the fraction of requests served under 300ms.
An SLO is the internal target for that measurement, say 99.9 percent. An SLA is
the contract with a customer and has financial consequences if you miss it, so
it is always looser than the SLO. The gap between the SLO and 100 percent is
the error budget, and when it is spent you stop shipping features and fix
reliability instead.

### Technical documentation and ADRs
An architecture decision record captures one decision: the context, the options
considered, what was chosen and the consequences. It is short and it is never
edited, only superseded by a later one. The value is six months on when someone
asks why the system works this way, and the answer is written down rather than
lost with whoever left. README for how to run it, ADRs for why it is like this.

### Estimation and why it goes wrong
Estimates are forecasts, not promises, and they are wrong because the unknown
work is the part you have not thought of yet. Break work down until each piece
is small enough to reason about, estimate ranges rather than single numbers,
and re-forecast as you learn. The useful question in an interview is not how
you estimate but what you do when you realise the estimate was wrong, and the
answer is tell someone immediately rather than absorbing it quietly.

## JavaScript and TypeScript

### Floating point and number precision
`0.1 + 0.2` is `0.30000000000000004`, and it is not a JavaScript bug. Numbers
are IEEE 754 doubles, base 2, and 0.1 has no exact binary representation for the
same reason 1/3 has no exact decimal one. The error is tiny and it compounds, so
never compare floats with `===`: compare the absolute difference against a small
epsilon.

Integers are exact only up to `Number.MAX_SAFE_INTEGER`, which is 2^53 - 1, about
9 quadrillion. Past that, `n` and `n + 1` can be the same value. Use `BigInt` for
anything that must stay exact, like database ids or a Twitter snowflake.

For money, store integer minor units, cents rather than pounds, or a decimal
type. Every currency bug you have ever seen starts with someone using a float.

## Web and browser

### TCP vs UDP
TCP sets up a connection with a three-way handshake, numbers every byte, retries
what is lost and delivers in order. You get reliability and you pay for it in
round trips and in head-of-line blocking, where one lost packet stalls
everything behind it.

UDP just sends. No handshake, no retries, no ordering, no guarantee it arrives.
That sounds strictly worse and is exactly right when late data is useless: live
video, voice calls, games. A dropped frame from 200ms ago is not worth waiting
for.

The interesting modern case is HTTP/3, which runs on QUIC over UDP and rebuilds
reliability per stream in user space, so one lost packet stalls one stream
instead of the whole connection.

### DNS
The lookup that turns a hostname into an IP address, and it is a cache hierarchy
before it is anything else. The browser checks its own cache, then the OS, then
your configured resolver. On a miss the resolver walks down from the root
servers to the top-level domain servers to the domain's authoritative
nameserver, and caches the answer for as long as the record's TTL allows.

That TTL is why DNS shows up in system design answers. It is how long a change
takes to propagate, so lowering it before a migration and raising it after is a
standard move. DNS is also a crude load balancer: return several A records, or
different ones by region, and you have geographic routing before any traffic
reaches you.

### TLS and the HTTPS handshake
TLS gives you three things: encryption so nobody can read the traffic, integrity
so nobody can change it undetected, and authentication so you know you reached
the right server.

The handshake uses asymmetric cryptography once and symmetric cryptography
thereafter, because asymmetric is far slower. The client says hello with the
versions and ciphers it supports, the server returns its certificate, they agree
a shared session key without ever sending it, and everything after that is
encrypted with that symmetric key. The certificate is what proves identity: it
is signed by a certificate authority your machine already trusts.

TLS 1.3 does this in one round trip rather than two, and can resume a previous
session in zero, which is a real chunk of page load time.

### Storing passwords
Never store the password. Never encrypt it either, because encryption is
reversible and that is the whole problem. Hash it with a function designed to be
slow: bcrypt, scrypt or argon2, not SHA-256, which is fast and therefore a gift
to anyone brute forcing.

Salt every password with a unique random value stored alongside the hash. That
is what stops one rainbow table cracking every account at once, and it means two
users with the same password get different hashes. A pepper is a second secret
kept outside the database, so a database dump alone is not enough.

Tune the work factor so a single hash takes a noticeable fraction of a second,
and raise it as hardware gets faster. On login you hash the attempt and compare,
and the comparison should be constant time.

### OAuth 2.0 and SSO
OAuth 2.0 is authorization, not authentication: it lets an application act on a
user's behalf without ever seeing their password. The user is sent to the
provider, logs in there, approves a scope, and the application receives a code
it exchanges for an access token. The token is what gets sent with API calls,
and it is short-lived, with a refresh token to get another.

The authorization code flow is the one to describe. The implicit flow, which
returned the token straight to the browser, is deprecated because the token
ended up in URLs and history. Public clients add PKCE, which proves the same
client that started the flow is finishing it.

OpenID Connect is a thin layer on top that adds authentication: an id token, a
signed JWT saying who the user is. SSO is this applied across several
applications that trust one identity provider, so one login covers all of them.

## Databases

### Transaction isolation levels
ACID's I, and the one that actually has a dial. Four levels, each preventing one
more anomaly and costing more concurrency.

Read uncommitted allows dirty reads: you see another transaction's uncommitted
changes, which may then roll back. Almost nobody uses it. Read committed fixes
that and is the default in PostgreSQL and Oracle. Repeatable read also stops
non-repeatable reads, where the same query returns different rows mid
transaction, and it is MySQL's default. Serializable behaves as though
transactions ran one at a time, which is correct and slowest.

The anomaly worth naming is the phantom read: your query's result set grows
because another transaction inserted a matching row. Repeatable read protects
rows you already read; only serializable protects against new ones appearing.

## System design concepts

### Reverse proxy, API gateway and load balancer
Three things that all sit in front of your servers and get conflated constantly.

A load balancer spreads traffic across identical backends. It cares about health
and distribution and nothing about what the request means.

A reverse proxy sits in front of servers on their behalf, terminating TLS,
caching, compressing and hiding the topology. Nginx is the usual example. A
forward proxy is the mirror image: it sits in front of clients, on their behalf,
which is what a corporate web filter or a VPN egress is.

An API gateway is a reverse proxy that understands your API. It does
authentication, rate limiting, request routing by path, response shaping and
per-route metrics. In practice one product often does all three jobs, so the
right answer is to say which job you mean.

### Load balancing algorithms
Round robin sends each request to the next backend. Simple, and wrong whenever
requests cost different amounts, because a slow request does not slow the rota.

Least connections sends to whichever backend has the fewest in flight, which
adapts to uneven request cost and is a better default for anything long-lived.

Weighted versions of both let you send more traffic to bigger machines, which is
what you want during a gradual rollout or with mixed instance sizes.

Hashing on a key, usually the client IP or a session id, sends the same client
to the same backend every time. That is how you get sticky sessions without
shared state, and it is also why adding a backend reshuffles everyone unless the
hash is consistent.

Least response time picks by measured latency. It is the most adaptive and the
most likely to oscillate if the measurement window is short.

## CS fundamentals

### Garbage collection
Automatic memory management: the runtime works out which objects are still
reachable from your roots, the stack and globals, and frees the rest. Reference
counting is the simple version and it leaks cycles, where two dead objects point
at each other and neither count reaches zero.

Tracing collectors solve that by walking from the roots and freeing whatever the
walk never reached. Almost all of them are generational, because of one
observation: most objects die young. So allocate into a small young generation,
collect it often and cheaply, and promote the survivors to an old generation
collected rarely.

The cost is the pause. A stop-the-world collection freezes your program, which
is why low-latency runtimes use concurrent and incremental collectors that do
most of the work alongside your code. In JavaScript the practical consequence is
that a leak is almost always an unintended reference you are still holding: a
listener never removed, a closure over a large object, a growing cache.

### Memory and storage, by speed
A hierarchy, and every level is roughly an order of magnitude slower and larger
than the one above. CPU registers, then L1, L2 and L3 cache, then main memory,
then SSD, then spinning disk, then network storage.

The gaps are the point. Cache is nanoseconds, memory is about a hundred
nanoseconds, SSD is tens of microseconds, and a disk seek is ten milliseconds.
That is a factor of ten million from top to bottom, which is why an algorithm
that touches memory in order can beat one that jumps around despite doing more
work.

Volatility matters too: everything above SSD is lost on power failure, which is
the whole reason a database writes an append-only log before it updates anything
in place.

## System design concepts

### Event sourcing and CQRS
Event sourcing stores the sequence of things that happened rather than the
current state. Instead of a row saying the balance is 90, you keep deposited
100 and withdrew 10, and derive the balance. You get a full audit trail, the
ability to rebuild state after a bug, and the ability to ask what the state was
at any past moment. The cost is that every read has to replay or use a snapshot,
and that events are immutable, so a mistake is corrected by appending a
compensating event rather than editing.

CQRS separates the write model from the read model. Writes go through one path
optimised for validation and consistency, reads come from separate denormalised
views built from those writes. The two scale independently and the read views
can be shaped per screen.

They are often used together and neither requires the other. Both add real
complexity, so the honest answer is that they earn their place in domains where
the audit trail is a requirement, like finance, and are over-engineering
elsewhere.

### MapReduce
A pattern for processing data too large for one machine. Map turns each input
record into key-value pairs independently, so it parallelises across as many
machines as you have. The framework then shuffles, grouping every pair with the
same key onto one machine. Reduce combines the values for each key.

Word count is the canonical example: map emits each word with a count of one,
the shuffle groups identical words together, reduce sums them.

The shuffle is the expensive part, because it moves data across the network, so
a combiner that pre-aggregates on the map side is where the real wins are. The
classic failure is a skewed key, where one key has far more values than any
other and its reducer becomes the whole job's runtime.

Spark and similar engines largely replaced the original framework by keeping
intermediate results in memory rather than writing them to disk between stages,
but the map, shuffle, reduce shape is unchanged and is what gets asked about.

## Engineering practice

### Docker and containers
A container packages an application with its dependencies and runs it as an
isolated process on the host kernel. That is the difference from a virtual
machine, which brings an entire guest operating system: containers start in
milliseconds and cost megabytes, VMs start in seconds and cost gigabytes. The
isolation is weaker in exchange, since a kernel exploit crosses the boundary.

An image is built in layers from a Dockerfile, each instruction adding one, and
layers are cached and shared. That is why ordering matters: copy your lock file
and install dependencies before copying your source, or every code change
invalidates the dependency layer and reinstalls everything.

Containers are meant to be disposable and stateless, so anything that must
survive goes in a volume or an external service. The value in an interview is
the sentence "it works on my machine" becoming irrelevant, because the image is
the same artefact in development, CI and production.

### Kubernetes, in one answer
An orchestrator: you declare the state you want and it continuously works to
make reality match. You say five replicas of this image, and if a node dies it
schedules replacements somewhere else without being asked.

The pieces worth naming. A pod is one or more containers sharing a network
namespace, and it is the unit of scheduling. A deployment manages a set of
identical pods and handles rolling updates. A service gives them a stable
address and load balances across them, since pods come and go. An ingress routes
outside traffic to services.

The honest caveat is that it is a large amount of operational complexity, and
for a small team a managed platform usually delivers more with far less to run.
Saying that is a better answer than reciting the object types.

### MVC, MVP and MVVM
Three ways of splitting a user interface, all aimed at keeping logic out of the
view so it can be tested.

MVC: the model holds data, the view renders it, the controller handles input and
updates the model. The view often observes the model directly, and in practice
every framework means something slightly different by the letters.

MVP: the presenter sits between, and the view is passive, doing nothing but what
the presenter tells it. That makes the view trivially mockable, at the cost of a
lot of forwarding code.

MVVM: the view binds declaratively to a view model, which exposes state and
commands. Changes propagate automatically, which is why it fits frameworks with
reactive data binding.

For React the useful answer is that it is none of them exactly: components are
views and view models at once, and the pattern discussion is largely replaced by
where you put state, which is local, lifted, context or a store.
