import { parseNumbers } from '../engine/frame'
import type { Algorithm, Role, StackItem, StepGen, TreeNode } from '../engine/types'

const code = `function inorder(node, out) {
  if (node === null) return
  inorder(node.left, out)
  out.push(node.value)
  inorder(node.right, out)
}`

function* run(input: Record<string, string | number>): StepGen {
  const values = parseNumbers(input.values, 'values')
  if (values.length > 15) throw new Error(`${values.length} values is too wide to draw. Keep it to 15.`)

  // Build a BST by inserting in the given order. Inorder on a BST comes out sorted,
  // which makes the payoff of the traversal visible rather than asserted.
  const nodes: Record<string, TreeNode> = {}
  const valOf: Record<string, number> = {}
  let root: string | null = null
  for (const v of values) {
    const id = `n${v}`
    if (nodes[id]) continue
    nodes[id] = { id, value: v, role: 'idle' }
    valOf[id] = v
    if (root === null) {
      root = id
      continue
    }
    let cur = root
    for (;;) {
      if (v < valOf[cur]) {
        if (nodes[cur].left === undefined) {
          nodes[cur].left = id
          break
        }
        cur = nodes[cur].left!
      } else {
        if (nodes[cur].right === undefined) {
          nodes[cur].right = id
          break
        }
        cur = nodes[cur].right!
      }
    }
  }

  const roles = new Map<string, Role>()
  const out: (string | number)[] = []
  const stack: StackItem[] = []

  const snap = (active?: string) => {
    const copy: Record<string, TreeNode> = {}
    for (const [id, n] of Object.entries(nodes)) {
      copy[id] = { ...n, role: id === active ? 'active' : (roles.get(id) ?? 'idle') }
    }
    return copy
  }

  const views = (active?: string) => [
    { kind: 'tree' as const, label: 'binary search tree', root, nodes: snap(active) },
    { kind: 'stack' as const, label: 'call stack', items: [...stack].reverse() },
    {
      kind: 'array' as const,
      label: 'output',
      cells: out.length ? out.map((v) => ({ value: v, role: 'match' as Role })) : [{ value: '-', role: 'idle' as Role }],
    },
  ]

  yield {
    line: 1,
    note:
      'Inorder means: everything in my left subtree, then me, then everything in my right subtree. The recursion is three lines, and the entire difficulty is trusting that the recursive call handles a whole subtree correctly so you never have to trace it in your head.',
    views: views(),
    vars: { root: root ? nodes[root].value : 'empty' },
  }

  function* visit(id: string | undefined, depth: number, side: string): StepGen {
    if (id === undefined) {
      yield {
        line: 2,
        note: `The ${side} is empty. An empty subtree has nothing to output, so return immediately. This base case is what stops the recursion.`,
        views: views(),
        vars: { depth, at: 'null' },
      }
      return
    }

    const node = nodes[id]
    stack.push({ label: `inorder(${node.value})`, role: 'active' })
    roles.set(id, 'window')

    yield {
      line: 1,
      note: `Enter node ${node.value}. Nothing gets printed yet. Inorder demands the whole left subtree comes first, so the call goes deeper before it does any work.`,
      views: views(id),
      vars: { depth, at: node.value, 'stack depth': stack.length },
    }

    yield {
      line: 3,
      note: `Recurse left from ${node.value}${node.left !== undefined ? `, into ${nodes[node.left].value}` : ', which is empty'}.`,
      views: views(id),
      vars: { depth, at: node.value, going: 'left' },
    }
    yield* visit(node.left, depth + 1, `left child of ${node.value}`)

    out.push(node.value)
    roles.set(id, 'visited')
    yield {
      line: 4,
      note: `The left subtree of ${node.value} is fully output, so now ${node.value} itself is printed. Output so far: ${out.join(', ')}.`,
      views: views(id),
      vars: { depth, at: node.value, output: out.join(', ') },
    }

    yield {
      line: 5,
      note: `Recurse right from ${node.value}${node.right !== undefined ? `, into ${nodes[node.right].value}` : ', which is empty'}.`,
      views: views(id),
      vars: { depth, at: node.value, going: 'right' },
    }
    yield* visit(node.right, depth + 1, `right child of ${node.value}`)

    stack.pop()
    yield {
      line: 6,
      note: `Node ${node.value} is done, both subtrees handled. Return to the caller and pop the frame off the stack.`,
      views: views(),
      vars: { depth, finished: node.value, 'stack depth': stack.length },
    }
  }

  if (root) yield* visit(root, 0, 'tree')

  const sorted = [...values].sort((a, b) => a - b)
  yield {
    line: 6,
    note: `Traversal complete. The output is ${out.join(', ')}, which is sorted${JSON.stringify(out) === JSON.stringify(sorted) ? '' : ''}. That is not a coincidence: a BST puts smaller values left and larger values right, and inorder reads left, self, right. Inorder on a BST is a sort.`,
    views: views(),
    vars: { output: out.join(', ') },
    result: out.join(', '),
  }
}

export const treeTraversal: Algorithm = {
  id: 'inorder-traversal',
  name: 'Binary Tree: inorder traversal',
  blurb: 'Left subtree, then self, then right subtree. On a BST this comes out sorted.',
  realWorld:
    'The DOM is a tree and rendering a page means walking one. Compilers parse source into expression trees and evaluate them by traversal, and git stores every commit as a tree of directories.',
  idea:
    'Tree recursion works because each call handles one node and delegates two whole subtrees to calls it does not have to think about. Inorder places the visit between the two recursive calls. Move that visit line above both calls and you have preorder, below both and you have postorder. The call stack shown here is the same stack you would push and pop by hand in the iterative version.',
  useWhen:
    'Any per-node work on a tree. Inorder specifically for anything that depends on sorted order in a BST: kth smallest, validate BST, range queries.',
  pitfall:
    'Forgetting the null check, or putting the visit in the wrong position and calling it inorder. Also: validating a BST by only comparing each node to its two children, which passes trees that are not BSTs. Inorder plus a running previous value is the fix.',
  complexity: { time: 'O(n)', space: 'O(h) for the call stack, h = height' },
  code,
  inputs: [{ name: 'values', label: 'insert order', kind: 'numbers', value: '8, 3, 10, 1, 6, 14, 4, 7, 13', hint: 'built into a BST in this order' }],
  run,
}
