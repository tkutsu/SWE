import type { Algorithm, Cell, Role, StepGen } from '../engine/types'

const code = `function editDistance(a, b) {
  const dp = grid(a.length + 1, b.length + 1)
  for (let i = 0; i <= a.length; i++) dp[i][0] = i
  for (let j = 0; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j - 1],
          dp[i - 1][j],
          dp[i][j - 1],
        )
      }
    }
  }
  return dp[a.length][b.length]
}`

function* run(input: Record<string, string | number>): StepGen {
  const a = String(input.a).trim()
  const b = String(input.b).trim()
  if (!a || !b) throw new Error('Both words are needed.')
  if (a.length > 7 || b.length > 7) throw new Error('Keep both words to 7 characters so the table fits.')

  const dp: number[][] = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(-1))

  const rowLabels = ['', ...a]
  const colLabels = ['', ...b]

  const cells = (roles: Record<string, Role> = {}): Cell[][] =>
    dp.map((row, i) =>
      row.map((v, j) => ({
        value: v < 0 ? '' : v,
        role: roles[`${i},${j}`] ?? (v < 0 ? 'idle' : 'window'),
      })),
    )

  const views = (roles: Record<string, Role> = {}) => [
    {
      kind: 'grid' as const,
      label: 'dp[i][j] = edits to turn the first i of A into the first j of B',
      cells: cells(roles),
      rowLabels,
      colLabels,
      corner: 'A\\B',
    },
  ]

  yield {
    line: 2,
    note: `The table is ${a.length + 1} by ${b.length + 1}. Row i means "the first i letters of ${a}", column j means "the first j letters of ${b}". The answer ends up in the bottom right corner, and every cell depends only on the three cells above and to its left.`,
    views: views(),
    vars: { A: a, B: b },
  }

  for (let i = 0; i <= a.length; i++) dp[i][0] = i
  for (let j = 0; j <= b.length; j++) dp[0][j] = j

  yield {
    line: [3, 4],
    note: `Fill the edges first. Turning the first i letters of ${a} into an empty string takes i deletions, and building the first j letters of ${b} from nothing takes j insertions. Those are the base cases, and without them the recurrence has nothing to stand on.`,
    views: views(Object.fromEntries([...Array(a.length + 1).keys()].map((i) => [`${i},0`, 'compare' as Role]).concat([...Array(b.length + 1).keys()].map((j) => [`0,${j}`, 'compare' as Role])))),
    vars: { A: a, B: b },
  }

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const same = a[i - 1] === b[j - 1]
      const diag = dp[i - 1][j - 1]
      const up = dp[i - 1][j]
      const left = dp[i][j - 1]

      const context: Record<string, Role> = {
        [`${i},${j}`]: 'active',
        [`${i - 1},${j - 1}`]: 'compare',
        [`${i - 1},${j}`]: 'compare',
        [`${i},${j - 1}`]: 'compare',
      }

      if (same) {
        dp[i][j] = diag
        yield {
          line: [7, 8],
          note: `"${a[i - 1]}" and "${b[j - 1]}" match, so this letter costs nothing. The answer is whatever it took to align the prefixes before them, which is the diagonal cell: ${diag}.`,
          views: views(context),
          vars: { i, j, 'A[i-1]': a[i - 1], 'B[j-1]': b[j - 1], diagonal: diag, 'dp[i][j]': dp[i][j] },
        }
      } else {
        const best = Math.min(diag, up, left)
        dp[i][j] = 1 + best
        const which = best === diag ? 'replace' : best === up ? 'delete' : 'insert'
        yield {
          line: [9, 10, 11, 12, 13],
          note: `"${a[i - 1]}" and "${b[j - 1]}" differ, so one edit is unavoidable. The three options are replace (diagonal, ${diag}), delete from A (above, ${up}), insert from B (left, ${left}). Cheapest is ${best}, so ${which}, giving ${dp[i][j]}.`,
          views: views(context),
          vars: { i, j, replace: diag, delete: up, insert: left, chose: which, 'dp[i][j]': dp[i][j] },
        }
      }
    }
  }

  yield {
    line: 17,
    note: `The bottom right cell is ${dp[a.length][b.length]}, so "${a}" becomes "${b}" in ${dp[a.length][b.length]} edit${dp[a.length][b.length] === 1 ? '' : 's'}. Every cell was computed once from three neighbours, so the whole thing is the product of the two lengths, not exponential.`,
    views: views({ [`${a.length},${b.length}`]: 'match' }),
    vars: { A: a, B: b, edits: dp[a.length][b.length] },
    result: `${dp[a.length][b.length]} edits`,
  }
}

export const editDistance: Algorithm = {
  id: 'edit-distance',
  name: 'DP 2D: edit distance',
  blurb: 'A table where each cell asks: match for free, or pay one edit and take the best neighbour.',
  realWorld:
    'Spell check ranks its suggestions by edit distance from what you actually typed. git diff, autocorrect and DNA sequence alignment in bioinformatics all fill the same table.',
  idea:
    'Two strings means two indices, which means a two dimensional table. Cell (i, j) answers one question about prefixes: how many edits turn the first i letters of A into the first j letters of B. If the current letters match, the cost is whatever the diagonal already said. If they do not, you pay one edit and pick the cheapest of replace, delete or insert, which are the diagonal, the cell above and the cell to the left. Filling the table in order guarantees those three are ready when you need them.',
  useWhen:
    'Two sequences compared against each other: longest common subsequence, knapsack with items against capacity, unique paths on a grid, regular expression matching. If the state needs two indices, the table is two dimensional.',
  pitfall:
    'Off by one between string index and table index. Row i is about the first i characters, so the character it refers to is A[i-1], not A[i]. Getting that wrong gives a table that looks plausible and is wrong by one everywhere.',
  complexity: { time: 'O(n * m)', space: 'O(n * m), reducible to O(min(n, m))' },
  code,
  inputs: [
    { name: 'a', label: 'from', kind: 'text', value: 'horse', hint: 'max 7 characters' },
    { name: 'b', label: 'to', kind: 'text', value: 'ros' },
  ],
  run,
}
