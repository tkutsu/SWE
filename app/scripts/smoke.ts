/** Runs every algorithm on its default input and checks the frames are sane. */
import { algorithms } from '../src/algorithms'

let failures = 0
const fail = (msg: string) => {
  console.error(`  FAIL ${msg}`)
  failures++
}

for (const algo of algorithms) {
  const lineCount = algo.code.split('\n').length
  const input = Object.fromEntries(algo.inputs.map((f) => [f.name, f.value]))
  let frames = 0
  let sawResult = false

  try {
    for (const f of algo.run(input)) {
      frames++
      const lines = Array.isArray(f.line) ? f.line : [f.line]
      for (const l of lines) {
        if (l < 1 || l > lineCount) fail(`${algo.id} frame ${frames} points at line ${l}, code has ${lineCount}`)
      }
      if (!f.note || f.note.length < 10) fail(`${algo.id} frame ${frames} has no useful note`)
      if (!f.views || f.views.length === 0) fail(`${algo.id} frame ${frames} has no views`)
      if (f.result) sawResult = true
      if (frames > 5000) {
        fail(`${algo.id} did not terminate within 5000 frames`)
        break
      }
    }
  } catch (e) {
    fail(`${algo.id} threw: ${e instanceof Error ? e.message : String(e)}`)
  }

  if (frames === 0) fail(`${algo.id} produced no frames`)
  if (!sawResult) fail(`${algo.id} never set a result`)
  console.log(`  ${algo.id.padEnd(20)} ${String(frames).padStart(4)} frames, ${lineCount} code lines`)
}

// A few inputs that should be rejected with a readable message rather than crash.
const bad: [string, Record<string, string | number>][] = [
  ['two-sum', { nums: '', target: 9 }],
  ['two-sum', { nums: '1, abc', target: 9 }],
  ['sliding-window', { s: '' }],
  ['bfs-grid', { grid: '....\n....' }],
  ['bfs-grid', { grid: 'S..\n..E.' }],
  ['backtracking-subsets', { nums: '1, 2, 3, 4, 5' }],
  ['backtracking-subsets', { nums: '' }],
  ['min-heap', { values: '1, 2, 3', extract: 9 }],
]
for (const [id, input] of bad) {
  const algo = algorithms.find((a) => a.id === id)!
  try {
    for (const _ of algo.run(input)) break
    fail(`${id} accepted bad input ${JSON.stringify(input)}`)
  } catch (e) {
    if (!(e instanceof Error) || !e.message) fail(`${id} threw a non-Error for ${JSON.stringify(input)}`)
    else console.log(`  rejects ${id}: "${e.message.slice(0, 60)}"`)
  }
}

// Correctness, not just liveness: the last frame's result has to be right.
const lastResult = (id: string, input: Record<string, string | number>) => {
  const algo = algorithms.find((a) => a.id === id)!
  let out = ''
  for (const f of algo.run(input)) if (f.result) out = f.result
  return out
}

{
  // A heap must yield its minimums in increasing order, whatever the insert order.
  const r = lastResult('min-heap', { values: '5, 3, 8, 1, 9, 2, 7', extract: 7 })
  const got = (r.match(/extracted ([^,\]]*(?:, [^,\]]*)*), heap/)?.[1] ?? '').split(', ').map(Number)
  const want = [1, 2, 3, 5, 7, 8, 9]
  if (JSON.stringify(got) !== JSON.stringify(want)) fail(`min-heap extracted ${got}, expected ${want}`)
  else console.log(`  min-heap extracts in sorted order: ${got.join(', ')}`)
}

{
  // n elements must give exactly 2^n distinct subsets.
  const r = lastResult('backtracking-subsets', { nums: '1, 2, 3, 4' })
  const subsets = r.split('  ').filter(Boolean)
  if (subsets.length !== 16) fail(`subsets of 4 elements gave ${subsets.length}, expected 16`)
  else if (new Set(subsets).size !== 16) fail('subsets contains duplicates, the path copy is probably aliased')
  else console.log(`  backtracking gives 16 distinct subsets of 4 elements`)
}

{
  // Inorder on a BST is a sort.
  const r = lastResult('inorder-traversal', { values: '8, 3, 10, 1, 6, 14, 4, 7, 13' })
  const got = r.split(', ').map(Number)
  const want = [...got].sort((a, b) => a - b)
  if (JSON.stringify(got) !== JSON.stringify(want)) fail(`inorder gave ${got}, not sorted`)
  else console.log(`  inorder on a BST comes out sorted: ${got.join(', ')}`)
}

{
  // Binary search must find a value that is present and miss one that is not.
  const hit = lastResult('binary-search', { nums: '1, 3, 5, 7, 9, 11', target: 7 })
  if (!hit.startsWith('index 3')) fail(`binary-search found ${hit}, expected index 3`)
  const miss = lastResult('binary-search', { nums: '1, 3, 5, 7, 9, 11', target: 8 })
  if (!miss.startsWith('-1')) fail(`binary-search returned ${miss} for an absent value`)
  console.log('  binary-search hits a present value and misses an absent one')
}

console.log(failures === 0 ? '\nall good' : `\n${failures} failure(s)`)
process.exit(failures === 0 ? 0 : 1)
