import { cells, parseNumbers } from '../engine/frame'
import type { Algorithm, Role, StackItem, StepGen } from '../engine/types'

const code = `function dailyTemperatures(t) {
  const out = new Array(t.length).fill(0)
  const stack = []
  for (let i = 0; i < t.length; i++) {
    while (stack.length && t[i] > t[stack[stack.length - 1]]) {
      const j = stack.pop()
      out[j] = i - j
    }
    stack.push(i)
  }
  return out
}`

function* run(input: Record<string, string | number>): StepGen {
  const t = parseNumbers(input.temps, 'temps')
  if (t.length < 2) throw new Error('Give it at least two values.')

  const out = new Array<number>(t.length).fill(0)
  const stack: number[] = []

  const stackView = (): StackItem[] =>
    [...stack].reverse().map((i) => ({ label: `i=${i} (${t[i]})`, role: 'window' as Role }))

  const views = (roles: Record<number, Role> = {}) => [
    { kind: 'array' as const, label: 'temperatures', cells: cells(t, roles) },
    {
      kind: 'array' as const,
      label: 'answer: days until a warmer one',
      cells: out.map((v, i) => ({ value: v === 0 ? '-' : v, role: (v === 0 ? 'idle' : 'match') as Role, sub: String(i) })),
    },
    { kind: 'stack' as const, label: 'stack of indices still waiting (top first)', items: stackView() },
  ]

  yield {
    line: [2, 3],
    note:
      'For each day, how long until it gets warmer? The brute force scans forward from every day, which is O(n squared). The insight is that a day only ever waits for the first warmer day, so days waiting form a decreasing run. Keep those on a stack and every day is pushed once and popped once.',
    views: views(),
    vars: { days: t.length },
  }

  for (let i = 0; i < t.length; i++) {
    yield {
      line: 4,
      note: `Day ${i} is ${t[i]} degrees. Anything on the stack colder than this has been waiting for exactly this day.`,
      views: views({ [i]: 'active' }),
      vars: { i, 'today': t[i], waiting: stack.length },
    }

    while (stack.length && t[i] > t[stack[stack.length - 1]]) {
      const j = stack[stack.length - 1]
      yield {
        line: [5, 6, 7],
        note: `Day ${j} was ${t[j]} degrees and is still on the stack. ${t[i]} is warmer, so day ${j} has its answer: ${i - j} day${i - j === 1 ? '' : 's'}. Pop it, because it can never be the answer for anything later.`,
        views: views({ [i]: 'active', [j]: 'compare' }),
        vars: { i, j, 'today': t[i], 'waiting since': t[j], answer: i - j },
      }
      stack.pop()
      out[j] = i - j
    }

    stack.push(i)
    yield {
      line: 9,
      note: `Nothing left on the stack is colder than ${t[i]}, so push day ${i} to wait its turn. The stack now holds indices whose temperatures decrease from bottom to top, and keeping that shape is the whole trick.`,
      views: views({ [i]: 'window' }),
      vars: { i, 'stack size': stack.length, 'stack temps': stack.map((k) => t[k]).join(' > ') },
    }
  }

  yield {
    line: 11,
    note: `Anything still on the stack never found a warmer day, so those stay at 0. Every index was pushed once and popped at most once, which makes this linear despite the inner while loop.`,
    views: views(Object.fromEntries(stack.map((i) => [i, 'excluded' as Role]))),
    vars: { answer: out.join(', ') },
    result: out.join(', '),
  }
}

export const monotonicStack: Algorithm = {
  id: 'monotonic-stack',
  name: 'Monotonic stack (daily temperatures)',
  rank: 13,
  tier: 2,
  blurb: 'A stack kept in sorted order, so each element is resolved exactly once.',
  idea:
    'The stack holds things still waiting for an answer, and it is kept decreasing. When a new element arrives that is bigger than the top, the top has found what it was waiting for, so pop it and record the answer. Everything below is even bigger and keeps waiting. The inner while loop looks like it makes this quadratic, but each index is pushed once and popped once, so the total work is linear.',
  useWhen:
    'Next greater or smaller element in any direction, largest rectangle in a histogram, trapping rain water, stock span, and removing digits to make the smallest number. If the question is about the nearest element that beats the current one, this is the pattern.',
  pitfall:
    'Storing values instead of indices. The answer here is a distance, and you cannot recover it from the value alone. Push indices and read the value through them.',
  complexity: { time: 'O(n), each index pushed and popped once', space: 'O(n)' },
  code,
  inputs: [{ name: 'temps', label: 'temperatures', kind: 'numbers', value: '73, 74, 75, 71, 69, 72, 76, 73' }],
  run,
}
