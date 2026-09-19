import { parseInt10, parseNumbers } from '../engine/frame'
import type { Algorithm, Role, StepGen, TreeNode } from '../engine/types'

const code = `function remove(node, value) {
  if (node === null) return null
  if (value < node.value) {
    node.left = remove(node.left, value)
  } else if (value > node.value) {
    node.right = remove(node.right, value)
  } else {
    if (node.left === null) return node.right
    if (node.right === null) return node.left
    const succ = min(node.right)
    node.value = succ.value
    node.right = remove(node.right, succ.value)
  }
  return node
}`

function* run(input: Record<string, string | number>): StepGen {
  const values = parseNumbers(input.values, 'values')
  if (values.length > 12) throw new Error('Keep it to 12 nodes so the tree fits.')
  if (values.length === 0) throw new Error('Give it some values to build a tree from.')
  const target = parseInt10(input.remove, 'remove')

  const nodes: Record<string, TreeNode> = {}
  const valOf: Record<string, number> = {}
  let root: string | null = null
  let counter = 0

  for (const v of values) {
    const id = `n${counter++}`
    if (root !== null) {
      let cur = root
      let placed = false
      for (;;) {
        if (v === valOf[cur]) { placed = true; break }
        if (v < valOf[cur]) {
          if (nodes[cur].left === undefined) break
          cur = nodes[cur].left!
        } else {
          if (nodes[cur].right === undefined) break
          cur = nodes[cur].right!
        }
      }
      if (placed) continue
      nodes[id] = { id, value: v, role: 'idle' }
      valOf[id] = v
      if (v < valOf[cur]) nodes[cur].left = id
      else nodes[cur].right = id
    } else {
      nodes[id] = { id, value: v, role: 'idle' }
      valOf[id] = v
      root = id
    }
  }

  const snap = (roles: Record<string, Role> = {}) => {
    const copy: Record<string, TreeNode> = {}
    const reachable = new Set<string>()
    const walk = (id?: string) => {
      if (!id || !nodes[id]) return
      reachable.add(id)
      walk(nodes[id].left)
      walk(nodes[id].right)
    }
    walk(root ?? undefined)
    for (const id of reachable) copy[id] = { ...nodes[id], value: valOf[id], role: roles[id] ?? 'idle' }
    return copy
  }

  const views = (roles: Record<string, Role> = {}) => [
    { kind: 'tree' as const, label: 'binary search tree', root, nodes: snap(roles) },
  ]

  yield {
    line: 1,
    note: `Removing ${target}. Finding it is easy, the BST property points the way at every step. What makes delete the hard one is what to do with the hole afterwards, and that depends entirely on how many children the node has.`,
    views: views(),
    vars: { removing: target, root: root ? valOf[root] : 'empty' },
  }

  function* remove(id: string | undefined, value: number, depth: number): Generator<import('../engine/types').Frame, string | undefined, void> {
    if (!id) {
      yield {
        line: 2,
        note: `Walked off the bottom of the tree without finding ${value}, so there is nothing to remove.`,
        views: views(),
        vars: { depth, found: false },
      }
      return undefined
    }

    if (value < valOf[id]) {
      yield {
        line: [3, 4],
        note: `${value} is below ${valOf[id]}, so it can only be in the left subtree. Recurse left and reattach whatever comes back.`,
        views: views({ [id]: 'active' }),
        vars: { depth, at: valOf[id], going: 'left' },
      }
      nodes[id] = { ...nodes[id], left: yield* remove(nodes[id].left, value, depth + 1) }
      return id
    }

    if (value > valOf[id]) {
      yield {
        line: [5, 6],
        note: `${value} is above ${valOf[id]}, so look right.`,
        views: views({ [id]: 'active' }),
        vars: { depth, at: valOf[id], going: 'right' },
      }
      nodes[id] = { ...nodes[id], right: yield* remove(nodes[id].right, value, depth + 1) }
      return id
    }

    const hasLeft = nodes[id].left !== undefined
    const hasRight = nodes[id].right !== undefined

    yield {
      line: 8,
      note: `Found ${value}. It has ${!hasLeft && !hasRight ? 'no children' : hasLeft && hasRight ? 'two children, which is the awkward case' : 'one child'}.`,
      views: views({ [id]: 'active' }),
      vars: { depth, found: value, 'left child': hasLeft ? valOf[nodes[id].left!] : 'none', 'right child': hasRight ? valOf[nodes[id].right!] : 'none' },
    }

    if (!hasLeft) {
      yield {
        line: 9,
        note: hasRight
          ? `No left child, so the right subtree simply moves up to take this node's place. Everything in it is already larger than this node's parent expects, so the ordering still holds.`
          : `A leaf. Just detach it, nothing needs to move up.`,
        views: views({ [id]: 'excluded', ...(hasRight ? { [nodes[id].right!]: 'match' } : {}) }),
        vars: { depth, removed: value, 'replaced by': hasRight ? valOf[nodes[id].right!] : 'nothing' },
      }
      return nodes[id].right
    }

    if (!hasRight) {
      yield {
        line: 10,
        note: `No right child, so the left subtree moves up in its place.`,
        views: views({ [id]: 'excluded', [nodes[id].left!]: 'match' }),
        vars: { depth, removed: value, 'replaced by': valOf[nodes[id].left!] },
      }
      return nodes[id].left
    }

    let succ = nodes[id].right!
    const path: string[] = [succ]
    while (nodes[succ].left !== undefined) {
      succ = nodes[succ].left!
      path.push(succ)
    }

    yield {
      line: 11,
      note: `Two children, so the node cannot just be removed without leaving two orphaned subtrees. The replacement has to be a value that is larger than everything on the left and smaller than everything on the right, and exactly one value fits: the smallest in the right subtree, ${valOf[succ]}. Reach it by going right once, then left as far as possible.`,
      views: views({ [id]: 'active', ...Object.fromEntries(path.map((p) => [p, 'compare' as Role])), [succ]: 'match' }),
      vars: { depth, removing: value, successor: valOf[succ] },
    }

    valOf[id] = valOf[succ]
    nodes[id] = { ...nodes[id], value: valOf[succ] }

    yield {
      line: 12,
      note: `Copy ${valOf[succ]} into this node. The tree is temporarily wrong, because ${valOf[succ]} now appears twice, but the BST ordering already holds everywhere.`,
      views: views({ [id]: 'match', [succ]: 'excluded' }),
      vars: { depth, 'node now holds': valOf[succ] },
    }

    yield {
      line: 13,
      note: `Now delete the duplicate ${valOf[succ]} from the right subtree. That call is guaranteed to hit an easy case, because the smallest node in a subtree has no left child by definition. So the hard case reduces to an easy one and cannot recurse into another hard case.`,
      views: views({ [id]: 'match', [succ]: 'active' }),
      vars: { depth, 'now removing': valOf[succ], from: 'right subtree' },
    }
    nodes[id] = { ...nodes[id], right: yield* remove(nodes[id].right, valOf[succ], depth + 1) }
    return id
  }

  root = (yield* remove(root ?? undefined, target, 0)) ?? null

  const inorder: number[] = []
  const walk = (id?: string) => {
    if (!id || !nodes[id]) return
    walk(nodes[id].left)
    inorder.push(valOf[id])
    walk(nodes[id].right)
  }
  walk(root ?? undefined)

  yield {
    line: 14,
    note: `Done. Reading the tree inorder gives ${inorder.join(', ')}, still sorted, which is the check that the BST property survived the surgery.`,
    views: views(),
    vars: { inorder: inorder.join(', ') },
    result: inorder.length ? inorder.join(', ') : 'tree is now empty',
  }
}

export const bstDelete: Algorithm = {
  id: 'bst-delete',
  name: 'BST: delete a node',
  rank: 24,
  tier: 4,
  blurb: 'Three cases, and only the two-children one is interesting.',
  realWorld:
    'Database indexes are balanced search trees, so every DELETE statement runs some version of this. TreeMap, std::map and any scheduler ordered by deadline handle the same three cases.',
  idea:
    'Finding the node is the easy half. Removing it splits into three cases. A leaf just goes. A node with one child is replaced by that child. A node with two children cannot go anywhere without orphaning a subtree, so instead of moving the node you overwrite its value with its inorder successor, the smallest value in the right subtree, and then delete that successor. The successor has no left child by definition, so the second deletion always lands in an easy case and the recursion cannot cascade.',
  useWhen:
    'Any ordered-set API: TreeMap, std::map, SortedList. In interviews delete comes up as the follow-up after insert and search, precisely because the two-children case separates people who memorised the structure from people who understand the invariant.',
  pitfall:
    'Freezing on the two-children case, which is what the question is testing. The other trap is forgetting to reassign the result of the recursive call. `remove(node.left, v)` on its own does nothing; it has to be `node.left = remove(node.left, v)`, because the function returns the new subtree root.',
  complexity: { time: 'O(h), h = height', space: 'O(h) recursion' },
  code,
  inputs: [
    { name: 'values', label: 'build a BST from', kind: 'numbers', value: '8, 3, 10, 1, 6, 14, 4, 7, 13' },
    { name: 'remove', label: 'then remove', kind: 'number', value: 3, hint: 'try 3 (two children), 14 (one), 7 (leaf)' },
  ],
  run,
}
