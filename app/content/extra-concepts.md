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
