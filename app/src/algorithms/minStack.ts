import type { Algorithm, Role, StackItem, StepGen } from '../engine/types'

const code = `class MinStack {
  constructor() {
    this.main = []
    this.mins = []
  }
  push(x) {
    this.main.push(x)
    const m = this.mins.length ? this.mins[this.mins.length - 1] : Infinity
    this.mins.push(Math.min(x, m))
  }
  pop() {
    this.mins.pop()
    return this.main.pop()
  }
  top() {
    return this.main[this.main.length - 1]
  }
  getMin() {
    return this.mins[this.mins.length - 1]
  }
}`

type Op = { kind: 'push'; value: number } | { kind: 'pop' } | { kind: 'min' } | { kind: 'top' }

function parseOps(raw: string): Op[] {
  const out: Op[] = []
  for (const part of raw.split(/[,\n]+/).map((s) => s.trim()).filter(Boolean)) {
    const push = part.match(/^push\s+(-?\d+)$/i)
    if (push) {
      out.push({ kind: 'push', value: Number(push[1]) })
      continue
    }
    const word = part.toLowerCase()
    if (word === 'pop') out.push({ kind: 'pop' })
    else if (word === 'min' || word === 'getmin') out.push({ kind: 'min' })
    else if (word === 'top') out.push({ kind: 'top' })
    else throw new Error(`Cannot read "${part}". Use push 5, pop, min or top, separated by commas.`)
  }
  if (out.length === 0) throw new Error('Give it some operations, like push 5, push 2, min.')
  if (out.length > 20) throw new Error('Keep it to 20 operations so the steps stay readable.')
  return out
}

function* run(input: Record<string, string | number>): StepGen {
  const ops = parseOps(String(input.ops))

  const main: number[] = []
  const mins: number[] = []

  const view = (label: string, data: number[], role: Role = 'idle', topRole?: Role) => ({
    kind: 'stack' as const,
    label,
    items: data.map<StackItem>((v, i) => ({ label: String(v), role: i === data.length - 1 ? (topRole ?? role) : role })),
  })

  const views = (topMain?: Role, topMins?: Role) => [
    view('main stack', main, 'idle', topMain),
    view('mins, one per main entry', mins, 'idle', topMins),
  ]

  yield {
    line: [2, 5],
    note: `The hard part is getMin in O(1). Scanning the stack for its smallest value is O(n), and keeping one "current minimum" variable breaks the moment you pop it, because there is nothing left to fall back to. The fix is a second stack that remembers the minimum as of every depth.`,
    views: views(),
    vars: { size: 0 },
  }

  for (const op of ops) {
    if (op.kind === 'push') {
      const prev = mins.length ? mins[mins.length - 1] : Infinity
      const next = Math.min(op.value, prev)
      main.push(op.value)
      mins.push(next)
      yield {
        line: [7, 9],
        note:
          prev === Infinity
            ? `push ${op.value} onto an empty stack, so it is also the minimum so far.`
            : op.value < prev
              ? `push ${op.value}. It is smaller than the previous minimum ${prev}, so the mins stack records the new minimum ${next}.`
              : `push ${op.value}. The minimum is still ${prev}, so that value is repeated onto the mins stack. Repeating looks wasteful and is what makes pop O(1): the two stacks stay the same height, so they move together.`,
        views: views('active', op.value < prev ? 'match' : 'active'),
        vars: { pushed: op.value, min: next, size: main.length },
      }
    } else if (op.kind === 'pop') {
      if (!main.length) throw new Error('pop on an empty stack. Push something first.')
      const goneMain = main.pop() as number
      const goneMin = mins.pop() as number
      yield {
        line: [12, 13],
        note: `pop removes ${goneMain} and discards the matching mins entry ${goneMin} in the same breath. Whatever minimum was true before that push is still sitting underneath, untouched, so the answer to getMin is restored without any recomputation.`,
        views: views('excluded', 'excluded'),
        vars: { popped: goneMain, min: mins.length ? mins[mins.length - 1] : 'stack is empty', size: main.length },
      }
    } else if (op.kind === 'min') {
      if (!mins.length) throw new Error('min on an empty stack. Push something first.')
      yield {
        line: 19,
        note: `getMin reads the top of the mins stack: ${mins[mins.length - 1]}. No scan, no comparison, one array read. That is the whole point of carrying the second stack.`,
        views: views(undefined, 'match'),
        vars: { min: mins[mins.length - 1], size: main.length },
      }
    } else {
      if (!main.length) throw new Error('top on an empty stack. Push something first.')
      yield {
        line: 16,
        note: `top reads the top of the main stack: ${main[main.length - 1]}. The mins stack is not involved.`,
        views: views('match'),
        vars: { top: main[main.length - 1], min: mins[mins.length - 1], size: main.length },
      }
    }
  }

  yield {
    line: 19,
    note: `Every operation was a push or a pop on two arrays. Nothing scanned, nothing sorted, and getMin was a single read throughout. The cost is O(n) extra space, which is the trade being tested.`,
    views: views(),
    vars: { size: main.length, min: mins.length ? mins[mins.length - 1] : 'empty' },
    result: mins.length ? `min ${mins[mins.length - 1]}, ${main.length} item${main.length === 1 ? '' : 's'} on the stack` : 'stack empty',
  }
}

export const minStack: Algorithm = {
  id: 'min-stack',
  name: 'Min Stack',
  rank: 203,
  tier: 4,
  blurb: 'push, pop, top and getMin, all O(1).',
  realWorld:
    'Undo histories that show the cheapest state so far, and the sliding minimum inside streaming aggregations. The same trick of carrying a second stack in lockstep is how a queue gets an O(1) minimum too.',
  idea:
    'One variable holding the current minimum works until you pop that minimum, at which point the previous one is gone and there is nothing to restore it from. So keep the history instead: a second stack where entry i is the minimum of the first i items. It stays exactly as tall as the main stack, which means push and pop touch both together and neither ever has to look down.',
  useWhen:
    'Any "design a structure with an extra O(1) query" problem. The general move is the lesson: when one structure cannot answer everything, carry a second one whose entries line up with the first.',
  pitfall:
    'Pushing onto the mins stack only when the new value is smaller. It saves space and breaks pop, because now the two stacks have different heights and you need a count or a comparison to know whether to pop both. Repeating the old minimum is the version that survives the follow-up questions.',
  complexity: { time: 'O(1) per operation', space: 'O(n)' },
  code,
  inputs: [
    { name: 'ops', label: 'operations', kind: 'text', value: 'push 5, push 2, push 7, min, pop, pop, min, push 1, min', hint: 'push n, pop, min, top' },
  ],
  run,
}
