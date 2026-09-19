import { parseNumbers } from '../engine/frame'
import type { Algorithm, Role, StackItem, StepGen, TreeNode } from '../engine/types'

const code = `function subsets(nums, i, path, out) {
  if (i === nums.length) {
    out.push([...path])
    return
  }
  subsets(nums, i + 1, path, out)
  path.push(nums[i])
  subsets(nums, i + 1, path, out)
  path.pop()
}`

const show = (path: number[]) => (path.length ? `{${path.join(',')}}` : '{}')

function* run(input: Record<string, string | number>): StepGen {
  const nums = parseNumbers(input.nums, 'nums')
  if (nums.length > 4) {
    throw new Error(`${nums.length} elements means ${2 ** nums.length} subsets and a tree too wide to read. Keep it to 4.`)
  }
  if (nums.length === 0) throw new Error('Give it a few numbers, like 1, 2, 3.')

  // The decision tree is grown as it is explored rather than drawn up front,
  // because watching it grow is the point.
  const nodes: Record<string, TreeNode> = {}
  const roles = new Map<string, Role>()
  const path: number[] = []
  const out: number[][] = []
  const stack: StackItem[] = []
  const ROOT = 'r'

  nodes[ROOT] = { id: ROOT, value: '{}', role: 'active' }

  const snap = (active?: string) => {
    const copy: Record<string, TreeNode> = {}
    for (const [id, n] of Object.entries(nodes)) {
      copy[id] = { ...n, role: id === active ? 'active' : (roles.get(id) ?? 'idle') }
    }
    return copy
  }

  const views = (active?: string) => [
    { kind: 'tree' as const, label: 'decision tree (left = skip, right = take)', root: ROOT, nodes: snap(active) },
    {
      kind: 'array' as const,
      label: 'path (the choices currently made)',
      cells: path.length ? path.map((v) => ({ value: v, role: 'window' as Role })) : [{ value: '{}', role: 'idle' as Role }],
    },
    { kind: 'stack' as const, label: 'call stack', items: [...stack].reverse() },
    {
      kind: 'stack' as const,
      label: `output (${out.length})`,
      items: out.map((s) => ({ label: show(s), role: 'match' as Role })),
      orientation: 'horizontal' as const,
    },
  ]

  yield {
    line: 1,
    note:
      'Every subset is a sequence of yes-or-no choices, one per element. That makes the search space a binary tree of depth n, and backtracking is just a depth-first walk of it. The only state you carry down is the path of choices made so far.',
    views: views(ROOT),
    vars: { nums: nums.join(', '), 'subsets to find': 2 ** nums.length },
  }

  function* explore(id: string, i: number): StepGen {
    stack.push({ label: `subsets(i=${i}, ${show(path)})`, role: 'active' })
    roles.set(id, 'window')

    if (i === nums.length) {
      out.push([...path])
      roles.set(id, 'match')
      yield {
        line: [2, 3, 4],
        note: `Every element has been decided, so this leaf is one complete subset: ${show(path)}. Push a copy, not the array itself. The path keeps mutating after this, and pushing the live reference would leave every entry in the output pointing at the same array.`,
        views: views(id),
        vars: { i, path: show(path), found: out.length },
      }
      stack.pop()
      return
    }

    yield {
      line: [5, 6],
      note: `Deciding element ${nums[i]} at index ${i}. Take the "skip it" branch first. Nothing is added to the path, so the left subtree explores every subset that leaves ${nums[i]} out.`,
      views: views(id),
      vars: { i, deciding: nums[i], path: show(path), choice: 'skip' },
    }

    const leftId = id + '0'
    nodes[leftId] = { id: leftId, value: show(path), role: 'idle' }
    nodes[id] = { ...nodes[id], left: leftId }
    yield* explore(leftId, i + 1)

    path.push(nums[i])
    const rightId = id + '1'
    nodes[rightId] = { id: rightId, value: show(path), role: 'idle' }
    nodes[id] = { ...nodes[id], right: rightId }

    yield {
      line: [7, 8],
      note: `The skip branch is exhausted. Now take ${nums[i]}: push it onto the path and explore again from index ${i + 1}. The path is now ${show(path)}.`,
      views: views(id),
      vars: { i, deciding: nums[i], path: show(path), choice: 'take' },
    }

    yield* explore(rightId, i + 1)

    const removed = nums[i]
    path.pop()
    roles.set(id, 'visited')
    yield {
      line: 9,
      note: `Both branches for ${removed} are done. Pop it off the path before returning. This undo is the backtracking: the same path array is reused by every branch, so leaving ${removed} on it would poison every subset explored after this point.`,
      views: views(id),
      vars: { i, 'popped off path': removed, path: show(path), found: out.length },
    }
    stack.pop()
  }

  yield* explore(ROOT, 0)

  yield {
    line: 10,
    note: `The walk is complete. ${out.length} subsets, which is 2 to the power of ${nums.length}, exactly one per root-to-leaf path in the tree.`,
    views: views(),
    vars: { found: out.length },
    result: out.map(show).join('  '),
  }
}

export const backtracking: Algorithm = {
  id: 'backtracking-subsets',
  name: 'Backtracking (all subsets)',
  rank: 6,
  tier: 1,
  blurb: 'Depth-first walk of a decision tree, undoing each choice on the way back up.',
  realWorld:
    'Regex engines backtrack through alternatives exactly like this when a match fails partway through. Sudoku solvers, SAT solvers and shift rota schedulers all explore and undo the same way.',
  idea:
    'Backtracking is DFS over a tree of partial answers. At each node you make a choice, recurse on the smaller problem, then undo the choice so the next branch starts clean. The undo is the whole technique and it is the line people forget. Because the path array is shared by every branch, anything you add going down has to be removed coming back up.',
  useWhen:
    'Enumerating combinations, permutations, subsets, partitions, or any "find all valid arrangements" problem. Add a validity check before recursing and you have constraint solving: N-queens, sudoku, word search.',
  pitfall:
    'Two of them. Forgetting the undo, which leaks state into sibling branches. And pushing the live path array into the output instead of a copy, which gives you n identical results at the end because every entry aliases the same array.',
  complexity: { time: 'O(n * 2^n) for subsets', space: 'O(n) path plus O(n) stack' },
  code,
  inputs: [{ name: 'nums', label: 'nums', kind: 'numbers', value: '1, 2, 3', hint: 'max 4, the tree doubles per element' }],
  run,
}
