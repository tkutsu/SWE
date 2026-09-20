import { parseInt10, parseNumbers } from '../engine/frame'
import type { Algorithm, LinkedNode, Role, StepGen } from '../engine/types'

const code = `function detectCycle(head) {
  let slow = head
  let fast = head
  while (fast && fast.next) {
    slow = slow.next
    fast = fast.next.next
    if (slow === fast) break
  }
  if (!fast || !fast.next) return null

  slow = head
  while (slow !== fast) {
    slow = slow.next
    fast = fast.next
  }
  return slow
}`

function* run(input: Record<string, string | number>): StepGen {
  const values = parseNumbers(input.values, 'values')
  if (values.length < 3 || values.length > 12) throw new Error('Give between 3 and 12 values.')
  const entry = parseInt10(input.cycleAt, 'cycle at')
  if (!Number.isInteger(entry) || entry < -1 || entry >= values.length) {
    throw new Error(`cycle at must be -1 for no cycle, or an index from 0 to ${values.length - 1}.`)
  }

  const n = values.length
  const nextOf = (i: number): number | null => (i === n - 1 ? (entry >= 0 ? entry : null) : i + 1)

  const view = (slow: number | null, fast: number | null, extra: Record<number, Role> = {}) => {
    const nodes: Record<string, LinkedNode> = {}
    values.forEach((v, i) => {
      const nx = nextOf(i)
      nodes[String(i)] = {
        id: String(i),
        label: v,
        next: nx === null ? null : String(nx),
        role: extra[i] ?? (slow === i && fast === i ? 'match' : slow === i ? 'active' : fast === i ? 'compare' : 'idle'),
        sub: slow === i && fast === i ? 'both' : slow === i ? 'slow' : fast === i ? 'fast' : undefined,
      }
    })
    return {
      kind: 'linked' as const,
      label: entry >= 0 ? `the list, with the tail pointing back at index ${entry}` : 'the list',
      order: values.map((_, i) => String(i)),
      nodes,
      pointers: [
        { name: 'slow', id: slow === null ? null : String(slow) },
        { name: 'fast', id: fast === null ? null : String(fast) },
      ],
    }
  }

  let slow = 0
  let fast = 0
  let steps = 0

  yield {
    line: [2, 3],
    note: `Two pointers start together and move at different speeds: slow takes one step, fast takes two. If the list ends, fast falls off first. If it loops, fast is going round the circle faster than slow and must eventually lap it, which is the entire idea.`,
    views: [view(slow, fast)],
    vars: { slow: values[0], fast: values[0], steps },
  }

  for (;;) {
    const f1: number | null = nextOf(fast)
    const f2: number | null = f1 === null ? null : nextOf(f1)
    if (f1 === null || f2 === null) {
      yield {
        line: 9,
        note: `fast has run off the end of the list, so there is no cycle. This is why the loop condition checks both fast and fast.next: fast moves two at a time, so either one can be the thing that runs out.`,
        views: [view(slow, null, f1 === null ? {} : { [f1]: 'excluded' })],
        vars: { steps, result: 'no cycle' },
        result: 'no cycle',
      }
      return
    }

    const s1 = nextOf(slow)
    // fast is strictly ahead of slow and still on the list, so slow has a next.
    if (s1 === null) break
    slow = s1
    fast = f2
    steps++

    if (slow === fast) {
      yield {
        line: 7,
        note: `They have met at ${values[slow]}, after ${steps} step${steps === 1 ? '' : 's'}. A meeting can only happen inside a loop, so a cycle exists. Where they met is not the start of the loop, though, and people often stop here and answer the wrong question.`,
        views: [view(slow, fast)],
        vars: { 'met at value': values[slow], steps },
      }
      break
    }

    yield {
      line: [5, 6],
      note: `slow is on ${values[slow]}, fast is on ${values[fast]}. The gap between them changes by one every step, so if they are both in the loop, fast closes on slow one node at a time and cannot jump over it.`,
      views: [view(slow, fast)],
      vars: { slow: values[slow], fast: values[fast], steps },
    }
  }

  yield {
    line: [11, 12],
    note: `Now the second phase, which looks like magic and is not. Put slow back at the head and move both one step at a time. The distance from the head to the loop entry turns out to equal the distance from the meeting point to the loop entry, so they arrive together.`,
    views: [view(0, fast)],
    vars: { slow: values[0], fast: values[fast] },
  }

  slow = 0
  let walk = 0
  while (slow !== fast) {
    const ns = nextOf(slow)
    const nf = nextOf(fast)
    if (ns === null || nf === null) break
    slow = ns
    fast = nf
    walk++
    yield {
      line: [13, 14],
      note: `Both move one. slow is on ${values[slow]}, fast is on ${values[fast]}.`,
      views: [view(slow, fast)],
      vars: { slow: values[slow], fast: values[fast], steps: walk },
    }
  }

  yield {
    line: 16,
    note: `They meet at index ${slow}, holding ${values[slow]}, which is where the loop begins. Two pointers, no extra memory, and no set of visited nodes, which is the O(n) space answer this beats.`,
    views: [view(slow, fast, { [slow]: 'match' })],
    vars: { 'cycle starts at index': slow, value: values[slow] },
    result: `cycle starts at index ${slow} (value ${values[slow]})`,
  }
}

export const fastSlow: Algorithm = {
  id: 'fast-slow-pointers',
  name: 'Fast and Slow Pointers',
  blurb: "Two speeds on one list. Floyd's cycle detection, and where the loop starts.",
  realWorld:
    'Garbage collectors and serialisers use cycle detection to avoid walking forever through a self-referencing object graph, and JSON.stringify throws on a circular structure because it found one. Random number generators are tested for their period the same way.',
  idea:
    'Send one pointer at one step and another at two. On a list that ends, the fast one falls off. On a list that loops, the fast one is going round faster and closes the gap by exactly one node per step, so it cannot jump past the slow one and they must meet. Then, because the head-to-entry distance equals the meeting-point-to-entry distance, restarting one pointer at the head and walking both at one step lands them both on the loop entry.',
  useWhen:
    'Cycle detection, finding the middle of a list in one pass, the k-th node from the end, and checking whether a list is a palindrome. Find the Duplicate Number is this in disguise, with the array values treated as next pointers, which is the version that gets asked.',
  pitfall:
    'Answering the first phase when the question asked for the loop entry. The meeting point is not the start of the cycle. Also the loop condition: fast moves two at a time, so both fast and fast.next have to be checked or it dereferences null on an even-length list.',
  complexity: { time: 'O(n)', space: 'O(1)' },
  code,
  inputs: [
    { name: 'values', label: 'values', kind: 'numbers', value: '3, 2, 0, -4, 7, 9' },
    { name: 'cycleAt', label: 'tail points back to index', kind: 'number', value: 2, hint: '-1 for no cycle' },
  ],
  run,
}
