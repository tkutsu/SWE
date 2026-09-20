import { parseNumbers } from '../engine/frame'
import type { Algorithm, LinkedNode, Role, StepGen } from '../engine/types'

const code = `function reverse(head) {
  let prev = null
  let cur = head
  while (cur !== null) {
    const next = cur.next
    cur.next = prev
    prev = cur
    cur = next
  }
  return prev
}`

function* run(input: Record<string, string | number>): StepGen {
  const values = parseNumbers(input.values, 'values')
  if (values.length < 2) throw new Error('Give it at least two values.')
  if (values.length > 7) throw new Error('Keep it to 7 nodes so the arrows stay readable.')

  const order = values.map((_, i) => `n${i}`)
  const nodes: Record<string, LinkedNode> = {}
  values.forEach((v, i) => {
    nodes[`n${i}`] = { id: `n${i}`, label: v, next: i + 1 < values.length ? `n${i + 1}` : null }
  })

  let prev: string | null = null
  let cur: string | null = order[0]

  const snap = (roles: Record<string, Role> = {}) => {
    const copy: Record<string, LinkedNode> = {}
    for (const [id, n] of Object.entries(nodes)) copy[id] = { ...n, role: roles[id] ?? 'idle' }
    return copy
  }

  const views = (roles: Record<string, Role> = {}, next?: string | null) => [
    {
      kind: 'linked' as const,
      label: 'list',
      order,
      nodes: snap(roles),
      pointers: [
        { name: 'prev', id: prev },
        { name: 'cur', id: cur },
        ...(next !== undefined ? [{ name: 'next', id: next }] : []),
      ],
    },
  ]

  yield {
    line: [2, 3],
    note:
      'Reversing means every arrow flips. The danger is that flipping cur.next destroys the only reference to the rest of the list, so you have to save it first. Three pointers are enough: what came before, where you are, and what comes next.',
    views: views({ [order[0]]: 'active' }),
    vars: { prev: 'null', cur: values[0] },
  }

  let step = 0
  while (cur !== null) {
    const next: string | null = nodes[cur].next
    step++

    yield {
      line: 5,
      note: `Save cur.next${next ? ` (${nodes[next].label})` : ' (null, this is the last node)'} before touching anything. Skip this line and the next assignment orphans everything after ${nodes[cur].label}.`,
      views: views({ [cur]: 'active', ...(next ? { [next]: 'compare' } : {}) }, next),
      vars: { step, prev: prev ? nodes[prev].label : 'null', cur: nodes[cur].label, next: next ? nodes[next].label : 'null' },
    }

    nodes[cur] = { ...nodes[cur], next: prev }

    yield {
      line: 6,
      note: `Point ${nodes[cur].label} backwards at ${prev ? nodes[prev].label : 'null'}. That arrow is now reversed. ${
        prev === null ? 'The old head becomes the new tail, which is why it points at null.' : ''
      }`,
      views: views({ [cur]: 'match', ...(prev ? { [prev]: 'visited' } : {}) }, next),
      vars: { step, reversed: `${nodes[cur].label} -> ${prev ? nodes[prev].label : 'null'}` },
    }

    prev = cur
    cur = next

    yield {
      line: [7, 8],
      note: `Shuffle both pointers one step along. prev is now ${nodes[prev].label}, cur is ${cur ? nodes[cur].label : 'null'}.${
        cur === null ? ' cur is null, so the loop is about to end.' : ''
      }`,
      views: views({ [prev]: 'visited', ...(cur ? { [cur]: 'active' } : {}) }),
      vars: { step, prev: nodes[prev].label, cur: cur ? nodes[cur].label : 'null' },
    }
  }

  yield {
    line: 10,
    note: `cur is null, so every node has been visited. Return prev, not cur: cur ran off the end, and prev is sitting on the last node processed, which is the new head. Getting this wrong and returning cur gives you null every time.`,
    views: views(Object.fromEntries(order.map((id) => [id, 'match' as Role]))),
    vars: { 'new head': prev ? nodes[prev].label : 'null' },
    result: [...values].reverse().join(' -> ') + ' -> null',
  }
}

export const linkedList: Algorithm = {
  id: 'reverse-linked-list',
  name: 'Linked list: reverse in place',
  blurb: 'Three pointers, flipping one arrow per step, no extra memory.',
  realWorld:
    'Kernel task lists, Redis lists and memory allocator free lists are all linked lists, chosen because splicing an element out costs nothing. The LRU cache further down this list is a linked list married to a hash map.',
  idea:
    'Walk the list holding three references: the node before, the node you are on, and the node after. Save the next pointer, flip the current one to face backwards, then slide all three along. The boxes never move. Only the arrows change, and when the walk ends the pointer that trails behind is sitting on the new head.',
  useWhen:
    'Reversal on its own, and as a step inside bigger problems: palindrome check on a list, reorder list, reverse in k-groups, and merging. Fast and slow pointers pair with it for anything involving the middle or a cycle.',
  pitfall:
    'Overwriting cur.next before saving it, which orphans the rest of the list instantly. And returning cur at the end instead of prev. cur is null by then, so the function returns an empty list and the bug looks like the reversal never ran.',
  complexity: { time: 'O(n)', space: 'O(1)' },
  code,
  inputs: [{ name: 'values', label: 'values', kind: 'numbers', value: '1, 2, 3, 4, 5', hint: 'max 7' }],
  run,
}
