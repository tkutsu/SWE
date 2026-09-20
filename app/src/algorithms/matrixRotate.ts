import type { Algorithm, Cell, Role, StepGen } from '../engine/types'

const code = `function rotate(m) {
  const n = m.length
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const t = m[i][j]
      m[i][j] = m[j][i]
      m[j][i] = t
    }
  }
  for (const row of m) {
    row.reverse()
  }
}`

function* run(input: Record<string, string | number>): StepGen {
  const n = Number(input.n)
  if (!Number.isInteger(n) || n < 2 || n > 5) throw new Error('Size must be a whole number between 2 and 5.')

  const m: number[][] = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i * n + j + 1))

  const cells = (roles: Record<string, Role> = {}): Cell[][] =>
    m.map((row, i) => row.map((v, j) => ({ value: v, role: roles[`${i},${j}`] ?? 'idle' })))

  const views = (roles: Record<string, Role> = {}, label = 'matrix') => [
    { kind: 'grid' as const, label, cells: cells(roles), rowLabels: m.map((_, i) => i), colLabels: m[0].map((_, j) => j), corner: '' },
  ]

  yield {
    line: 2,
    note: `Rotating ${n} by ${n} clockwise, in place, with no second matrix. Doing it by directly computing where each element lands means juggling four values at once and is easy to get wrong under pressure. There is a cleaner route: transpose, then reverse each row. Two simple passes that are hard to get wrong.`,
    views: views(),
    vars: { n },
  }

  yield {
    line: [3, 4],
    note: 'First transpose: mirror the matrix across its main diagonal, so rows become columns. Only the upper triangle is visited, because swapping the lower triangle too would undo every swap and leave the matrix unchanged.',
    views: views(Object.fromEntries(Array.from({ length: n }, (_, i) => [`${i},${i}`, 'compare' as Role])), 'matrix (diagonal marked)'),
    vars: { phase: 'transpose' },
  }

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      yield {
        line: [5, 6, 7],
        note: `Swap (${i},${j}) holding ${m[i][j]} with (${j},${i}) holding ${m[j][i]}. Note j starts at i+1, which is what keeps this to the upper triangle.`,
        views: views({ [`${i},${j}`]: 'active', [`${j},${i}`]: 'compare' }),
        vars: { i, j, 'm[i][j]': m[i][j], 'm[j][i]': m[j][i] },
      }
      const t = m[i][j]
      m[i][j] = m[j][i]
      m[j][i] = t
      yield {
        line: 7,
        note: `Swapped. Those two cells are now settled for this phase.`,
        views: views({ [`${i},${j}`]: 'match', [`${j},${i}`]: 'match' }),
        vars: { i, j },
      }
    }
  }

  yield {
    line: 10,
    note: 'Transposed. Rows and columns have traded places, but this is a mirror image, not a rotation. Reversing each row is what turns the mirror into a clockwise turn.',
    views: views(),
    vars: { phase: 'reverse rows' },
  }

  for (let i = 0; i < n; i++) {
    const before = [...m[i]]
    m[i].reverse()
    yield {
      line: 11,
      note: `Reverse row ${i}: ${before.join(', ')} becomes ${m[i].join(', ')}.`,
      views: views(Object.fromEntries(m[i].map((_, j) => [`${i},${j}`, 'active' as Role]))),
      vars: { row: i, before: before.join(', '), after: m[i].join(', ') },
    }
  }

  yield {
    line: 13,
    note: `Rotated 90 degrees clockwise, in place, with O(1) extra memory. For anticlockwise, reverse the rows first and then transpose, or transpose and reverse the columns instead. Working that out from scratch in an interview is a waste of time, so it is worth remembering the pairing.`,
    views: views(Object.fromEntries(m.flatMap((row, i) => row.map((_, j) => [`${i},${j}`, 'match' as Role])))),
    vars: { result: m.map((r) => r.join(' ')).join('  |  ') },
    result: m.map((r) => r.join(' ')).join('  |  '),
  }
}

export const matrixRotate: Algorithm = {
  id: 'matrix-rotate',
  name: 'Matrix: rotate in place',
  blurb: 'Transpose, then reverse each row. Two easy passes instead of one hard one.',
  realWorld:
    'Rotating a photo on your phone. Game board transforms, graphics pipelines and convolution kernels in image processing all come down to disciplined index arithmetic over a grid.',
  idea:
    'Rotating clockwise sends element (i, j) to (j, n-1-i). Doing that directly means moving four elements in a cycle and tracking which cells are already done, which is fiddly. Decomposing it removes all of that: transposing sends (i, j) to (j, i), and then reversing each row sends (j, i) to (j, n-1-i). Same destination, two passes that are individually obvious.',
  useWhen:
    'Rotate image, spiral order, set matrix zeroes, transpose, and any grid question where the difficulty is index bookkeeping rather than algorithmic. The general lesson is to decompose an awkward transformation into simple ones.',
  pitfall:
    'Starting the inner loop at j = 0 instead of j = i + 1. That swaps every pair twice and leaves the matrix exactly as it started, which looks like the code never ran.',
  complexity: { time: 'O(n squared)', space: 'O(1)' },
  code,
  inputs: [{ name: 'n', label: 'matrix size', kind: 'number', value: 4, hint: '2 to 5' }],
  run,
}
