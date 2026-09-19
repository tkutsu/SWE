import type { Algorithm, LinkedNode, MapEntry, Role, StepGen } from '../engine/types'

const code = `class LRUCache {
  constructor(capacity) {
    this.cap = capacity
    this.map = new Map()
    this.list = new DoublyLinkedList()
  }
  get(key) {
    if (!this.map.has(key)) return -1
    const node = this.map.get(key)
    this.list.moveToFront(node)
    return node.value
  }
  put(key, value) {
    if (this.map.has(key)) {
      const node = this.map.get(key)
      node.value = value
      this.list.moveToFront(node)
      return
    }
    if (this.map.size === this.cap) {
      const last = this.list.removeLast()
      this.map.delete(last.key)
    }
    const node = this.list.addFront(key, value)
    this.map.set(key, node)
  }
}`

type Op = { kind: 'get' | 'put'; key: string; value?: number }

function parseOps(raw: string): Op[] {
  const ops: Op[] = []
  for (const part of raw.split(/[,\n]+/).map((s) => s.trim()).filter(Boolean)) {
    const put = part.match(/^put\s+(\w+)\s*[= ]\s*(-?\d+)$/i)
    const get = part.match(/^get\s+(\w+)$/i)
    if (put) ops.push({ kind: 'put', key: put[1], value: Number(put[2]) })
    else if (get) ops.push({ kind: 'get', key: get[1] })
    else throw new Error(`Cannot read "${part}". Use "put a=1" or "get a".`)
  }
  if (ops.length === 0) throw new Error('Give it some operations, like put a=1, put b=2, get a.')
  if (ops.length > 12) throw new Error('Keep it to 12 operations.')
  return ops
}

function* run(input: Record<string, string | number>): StepGen {
  const cap = Number(input.capacity)
  if (!Number.isInteger(cap) || cap < 1 || cap > 5) throw new Error('Capacity must be a whole number between 1 and 5.')
  const ops = parseOps(String(input.ops))

  // Front of `order` is most recently used.
  let order: string[] = []
  const values = new Map<string, number>()

  const linkedNodes = (roles: Record<string, Role> = {}) => {
    const nodes: Record<string, LinkedNode> = {}
    order.forEach((key, i) => {
      nodes[key] = {
        id: key,
        label: `${key}=${values.get(key)}`,
        next: i + 1 < order.length ? order[i + 1] : null,
        role: roles[key] ?? 'idle',
      }
    })
    return nodes
  }

  const mapEntries = (roles: Record<string, Role> = {}): MapEntry[] =>
    order.map((key) => ({ key, value: 'node', role: roles[key] }))

  const views = (roles: Record<string, Role> = {}) => [
    {
      kind: 'linked' as const,
      label: 'usage order, most recent first',
      order,
      nodes: linkedNodes(roles),
      pointers: order.length
        ? [
            { name: 'newest', id: order[0] },
            { name: 'oldest', id: order[order.length - 1] },
          ]
        : [],
    },
    { kind: 'map' as const, label: 'hash map: key to node', entries: mapEntries(roles), empty: 'empty' },
  ]

  yield {
    line: 2,
    note: `Capacity ${cap}. Both operations have to be O(1), and neither structure can do it alone. A hash map finds a key instantly but has no notion of order. A list keeps order but searching it is linear. Used together, the map finds the node and the list reorders it, each in constant time.`,
    views: views(),
    vars: { capacity: cap },
  }

  for (const op of ops) {
    if (op.kind === 'get') {
      const hit = values.has(op.key)
      if (!hit) {
        yield {
          line: [7, 8],
          note: `get ${op.key}: not in the map, so it is a miss. Return -1 and change nothing.`,
          views: views(),
          vars: { op: `get ${op.key}`, result: -1 },
        }
        continue
      }

      yield {
        line: [9, 10],
        note: `get ${op.key}: the map points straight at the node, no scanning. Value is ${values.get(op.key)}. Reading counts as using it, so it now has to become the most recent.`,
        views: views({ [op.key]: 'active' }),
        vars: { op: `get ${op.key}`, result: values.get(op.key)! },
      }

      order = [op.key, ...order.filter((k) => k !== op.key)]

      yield {
        line: 10,
        note: `Move ${op.key} to the front. In a doubly linked list this is a constant number of pointer writes, because the node knows both its neighbours. With a singly linked list you would have to find the predecessor first, which is linear, and that is exactly why the doubly linked version is the one that gets asked for.`,
        views: views({ [op.key]: 'match' }),
        vars: { op: `get ${op.key}`, order: order.join(' > ') },
      }
      continue
    }

    if (values.has(op.key)) {
      values.set(op.key, op.value!)
      order = [op.key, ...order.filter((k) => k !== op.key)]
      yield {
        line: [14, 15, 16, 17],
        note: `put ${op.key}=${op.value}: the key already exists, so update its value and move it to the front. No eviction, because the size did not change.`,
        views: views({ [op.key]: 'match' }),
        vars: { op: `put ${op.key}=${op.value}`, order: order.join(' > ') },
      }
      continue
    }

    if (values.size === cap) {
      const victim = order[order.length - 1]
      yield {
        line: [20, 21, 22],
        note: `put ${op.key}=${op.value}: the cache is full at ${cap}. The least recently used key is ${victim}, sitting at the tail, and evicting it is O(1) because the tail is directly reachable. Note it must be removed from the map as well, not just the list.`,
        views: views({ [victim]: 'excluded' }),
        vars: { op: `put ${op.key}=${op.value}`, evicting: victim },
      }
      order = order.slice(0, -1)
      values.delete(victim)
    }

    values.set(op.key, op.value!)
    order = [op.key, ...order]

    yield {
      line: [24, 25],
      note: `Insert ${op.key}=${op.value} at the front and record it in the map. Both structures now agree, and keeping them in step is the part that is easy to get wrong.`,
      views: views({ [op.key]: 'match' }),
      vars: { op: `put ${op.key}=${op.value}`, size: values.size, order: order.join(' > ') },
    }
  }

  yield {
    line: 27,
    note: `Every operation touched a constant number of pointers and one map entry, so all of them are O(1). The cache now holds ${order.map((k) => `${k}=${values.get(k)}`).join(', ') || 'nothing'}, newest first.`,
    views: views(Object.fromEntries(order.map((k) => [k, 'match' as Role]))),
    vars: { contents: order.map((k) => `${k}=${values.get(k)}`).join(', ') || 'empty' },
    result: order.length ? order.map((k) => `${k}=${values.get(k)}`).join(', ') : 'empty',
  }
}

export const lruCache: Algorithm = {
  id: 'lru-cache',
  name: 'Design: LRU cache',
  rank: 26,
  tier: 4,
  blurb: 'A hash map for lookup plus a doubly linked list for order. Neither works alone.',
  idea:
    'Every operation has to be O(1), including finding the least recently used entry. A hash map gives instant lookup but no ordering. A doubly linked list gives instant reordering and instant access to both ends but no way to find a key. Store the list node as the map value and you get both: the map finds the node, and because the node knows its own neighbours it can be unlinked and moved to the front without traversing anything.',
  useWhen:
    'This is the archetype of the design question, and the composition it teaches generalises: min stack pairs a stack with a running minimum stack, insert-delete-getRandom pairs an array with an index map, and an LFU cache pairs a map with buckets of lists.',
  pitfall:
    'Using a singly linked list, which makes removal linear because you need the predecessor. And forgetting to delete the evicted key from the map, which leaks entries and eventually returns nodes that are no longer in the list at all.',
  complexity: { time: 'O(1) for get and put', space: 'O(capacity)' },
  code,
  inputs: [
    { name: 'capacity', label: 'capacity', kind: 'number', value: 3, hint: '1 to 5' },
    { name: 'ops', label: 'operations', kind: 'text', value: 'put a=1, put b=2, put c=3, get a, put d=4, get b', hint: 'put k=v or get k' },
  ],
  run,
}
