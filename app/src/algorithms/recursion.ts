import { parseInt10 } from '../engine/frame'
import type { Algorithm, Role, StackItem, StepGen } from '../engine/types'

const code = `function factorial(n) {
  if (n <= 1) return 1
  return n * factorial(n - 1)
}`

function* run(input: Record<string, string | number>): StepGen {
  const start = parseInt10(input.n, 'n')
  if (!Number.isInteger(start) || start < 1 || start > 8) throw new Error('n must be a whole number between 1 and 8.')

  /** Frames that have been entered and are waiting on the call below them. */
  const open: number[] = []

  const stackView = (topRole: Role = 'active') => ({
    kind: 'stack' as const,
    label: 'call stack',
    items: open.map<StackItem>((k, i) => ({
      label: `factorial(${k})`,
      role: i === open.length - 1 ? topRole : 'frontier',
    })),
  })

  const pendingView = (resolvedFrom?: number) => ({
    kind: 'stack' as const,
    label: 'waiting to be multiplied',
    orientation: 'horizontal' as const,
    items: open.map<StackItem>((k) => ({
      label: String(k),
      role: (resolvedFrom !== undefined && k <= resolvedFrom ? 'match' : 'frontier') as Role,
    })),
  })

  yield {
    line: 1,
    note: `A recursive function is an ordinary function that happens to call itself, and nothing about that is special. What is worth watching is the shape: it goes all the way down first, and only then does any arithmetic happen, on the way back up.`,
    views: [stackView()],
    vars: { n: start, depth: 0 },
  }

  let n = start
  while (n > 1) {
    open.push(n)
    yield {
      line: 3,
      note: `factorial(${n}) cannot return yet. It needs the value of factorial(${n - 1}) before it can multiply, so it parks with its ${n} held aside and calls down. That parked frame is real memory, and it is why deep recursion runs out of stack.`,
      views: [stackView(), pendingView()],
      vars: { n, depth: open.length, waiting: open.join(' x ') },
    }
    n -= 1
  }

  open.push(1)
  yield {
    line: 2,
    note: `factorial(1) hits the base case and returns 1 without calling anything. Every recursion needs one of these and needs to be guaranteed to reach it, or it descends until the stack runs out. This is the first answer the whole chain has produced.`,
    views: [stackView('match'), pendingView(1)],
    vars: { n: 1, depth: open.length, returns: 1 },
  }

  let acc = 1
  open.pop()

  while (open.length) {
    const k = open[open.length - 1]
    const before = acc
    acc *= k
    yield {
      line: 3,
      note: `factorial(${k}) wakes up where it left off, with ${before} handed back from below. Now it can finish: ${k} times ${before} is ${acc}. It returns that and its frame disappears.`,
      views: [stackView('match'), pendingView(k)],
      vars: { n: k, 'received from below': before, returns: acc, depth: open.length },
    }
    open.pop()
  }

  yield {
    line: 3,
    note: `The stack is empty and the outermost call has its answer. Note that nothing was multiplied on the way down and everything was multiplied on the way up. Holding those two phases apart is most of what makes recursion readable.`,
    views: [stackView()],
    vars: { answer: acc, 'frames used at the deepest point': start },
    result: `${start}! = ${acc}`,
  }
}

export const recursion: Algorithm = {
  id: 'recursion',
  name: 'Recursion and the Call Stack',
  rank: 205,
  tier: 1,
  blurb: 'Down to the base case, then all the work on the way back up.',
  realWorld:
    'Every directory walk, every JSON parser and every tree traversal you have written is this. It is also why a stack trace is called a stack: the frames you see printed are exactly the parked calls in the picture here.',
  idea:
    'Two rules and nothing else. A base case that returns without calling, and a recursive case that calls itself on something strictly closer to the base case. Then trust it. The hard part is psychological: you want to trace all the way down and back up in your head, and you cannot, so instead assume the inner call already works and write the one line that uses its answer.',
  useWhen:
    'The problem is defined in terms of a smaller version of itself. Trees and graphs, divide and conquer, backtracking, and any grammar or nested structure. If you find yourself managing an explicit stack by hand, recursion is usually the same code with the bookkeeping removed.',
  pitfall:
    'Forgetting that the parked frames cost real memory. A recursion 100,000 deep overflows the stack even though it allocates nothing, which is why a linked list of that length has to be done iteratively while a balanced tree of the same size is fine at depth 17. That is the follow-up, and the space complexity of a recursive answer is never O(1).',
  complexity: { time: 'O(n)', space: 'O(n) stack' },
  code,
  inputs: [{ name: 'n', label: 'n', kind: 'number', value: 5, hint: '1 to 8' }],
  run,
}
