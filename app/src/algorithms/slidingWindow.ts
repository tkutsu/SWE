import type { Algorithm, Cell, MapEntry, Role, StepGen } from '../engine/types'

const code = `function longestUnique(s) {
  const lastSeen = new Map()
  let start = 0
  let best = 0
  for (let end = 0; end < s.length; end++) {
    const c = s[end]
    if (lastSeen.has(c) && lastSeen.get(c) >= start) {
      start = lastSeen.get(c) + 1
    }
    lastSeen.set(c, end)
    best = Math.max(best, end - start + 1)
  }
  return best
}`

function* run(input: Record<string, string | number>): StepGen {
  const s = String(input.s).replace(/\s+/g, '')
  if (!s) throw new Error('Give it a string, like abcabcbb.')
  if (s.length > 28) throw new Error(`That string is ${s.length} characters. Keep it under 28 so the steps stay readable.`)

  const lastSeen = new Map<string, number>()
  let start = 0
  let best = 0
  let bestRange: [number, number] = [0, -1]

  const view = (end: number, roles: Record<number, Role> = {}): Cell[] =>
    [...s].map((ch, i) => {
      let role: Role = 'idle'
      if (i < start) role = 'excluded'
      else if (i <= end) role = 'window'
      return { value: ch, role: roles[i] ?? role }
    })

  const entries = (): MapEntry[] => [...lastSeen.entries()].map(([key, value]) => ({ key, value }))

  yield {
    line: [2, 3, 4],
    note:
      'The brute force checks every substring, which is O(n squared) or worse. Instead keep a window that is always valid, and slide its right edge forward one character at a time. The left edge only ever moves right, so both pointers travel the string once between them.',
    views: [
      { kind: 'array', label: 's', cells: [...s].map((ch) => ({ value: ch, role: 'idle' as Role })) },
      { kind: 'map', label: 'lastSeen (char -> index)', entries: [], empty: 'empty' },
    ],
    vars: { start, best },
  }

  for (let end = 0; end < s.length; end++) {
    const c = s[end]

    yield {
      line: [5, 6],
      note: `Extend the window to include "${c}" at index ${end}. Now check whether that breaks the no-repeat rule.`,
      views: [
        { kind: 'array', label: 's', cells: view(end, { [end]: 'active' }) },
        { kind: 'map', label: 'lastSeen (char -> index)', entries: entries(), empty: 'empty' },
      ],
      vars: { start, end, char: c, best },
    }

    const prev = lastSeen.get(c)
    if (prev !== undefined && prev >= start) {
      yield {
        line: [7, 8],
        note: `"${c}" already appears inside the window, at index ${prev}. The window is invalid. Jump start to ${prev + 1} so the old copy falls out. Jumping rather than stepping one at a time is what keeps this linear.`,
        views: [
          { kind: 'array', label: 's', cells: view(end, { [end]: 'active', [prev]: 'compare' }) },
          { kind: 'map', label: 'lastSeen (char -> index)', entries: entries().map((e) => (e.key === c ? { ...e, role: 'compare' as Role } : e)) },
        ],
        vars: { start, end, char: c, 'previous index': prev, best },
      }
      start = prev + 1
    }

    lastSeen.set(c, end)
    const length = end - start + 1
    const improved = length > best
    if (improved) {
      best = length
      bestRange = [start, end]
    }

    yield {
      line: [9, 10, 11],
      note: improved
        ? `The window is now "${s.slice(start, end + 1)}", length ${length}. That beats the previous best, so best becomes ${best}.`
        : `The window is "${s.slice(start, end + 1)}", length ${length}. The best so far is still ${best}.`,
      views: [
        { kind: 'array', label: 's', cells: view(end) },
        { kind: 'map', label: 'lastSeen (char -> index)', entries: entries().map((e) => (e.key === c ? { ...e, role: 'active' as Role } : e)) },
      ],
      vars: { start, end, window: s.slice(start, end + 1), length, best },
    }
  }

  yield {
    line: 13,
    note: `Every character has been the right edge exactly once. The longest window without a repeat was "${s.slice(bestRange[0], bestRange[1] + 1)}".`,
    views: [
      {
        kind: 'array',
        label: 's',
        cells: [...s].map((ch, i) => ({
          value: ch,
          role: i >= bestRange[0] && i <= bestRange[1] ? ('match' as Role) : ('excluded' as Role),
        })),
      },
      { kind: 'map', label: 'lastSeen (char -> index)', entries: entries() },
    ],
    vars: { best },
    result: `${best}  ("${s.slice(bestRange[0], bestRange[1] + 1)}")`,
  }
}

export const slidingWindow: Algorithm = {
  id: 'sliding-window',
  name: 'Sliding Window (longest unique substring)',
  rank: 3,
  tier: 1,
  blurb: 'Grow a window at the right, shrink it at the left, keep it valid at all times.',
  idea:
    'Maintain a window that always satisfies the constraint. Push the right edge forward to consider a new element. If that makes the window invalid, advance the left edge until it is valid again. Because the left edge never moves backwards, each index is added once and removed once, so the whole scan is linear despite the nested-looking structure.',
  useWhen:
    'Longest or shortest contiguous subarray or substring under a constraint. Fixed size windows are the easy case, variable size is the one worth drilling.',
  pitfall:
    'Advancing start one step at a time when you can jump, and forgetting the `lastSeen.get(c) >= start` guard. Without that guard a stale index from outside the window drags start backwards.',
  complexity: { time: 'O(n)', space: 'O(k) for the alphabet' },
  code,
  inputs: [{ name: 's', label: 'string', kind: 'text', value: 'abcabcbb', hint: 'try pwwkew or dvdf' }],
  run,
}
