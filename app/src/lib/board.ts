import type { Visual } from './visual'

/**
 * The comparison surface. Every algorithm page carries its own two badges, and
 * two badges on two different pages cannot be compared, which is the only
 * reason anyone looks a complexity up. The growth curves and the "what n = a
 * million costs" table already live on the Big O concept page and are not
 * repeated here.
 */

export const structures: Visual = {
  kind: 'table',
  head: ['Structure', 'Read', 'Find', 'Insert', 'Delete', 'What the row leaves out'],
  rows: [
    [
      'Array',
      { text: 'O(1)', tone: 'good' },
      { text: 'O(n)', tone: 'bad' },
      { text: 'O(n)', tone: 'bad' },
      { text: 'O(n)', tone: 'bad' },
      'Inserting means shifting everything after it along by one.',
    ],
    [
      'Dynamic array',
      { text: 'O(1)', tone: 'good' },
      { text: 'O(n)', tone: 'bad' },
      { text: 'O(1) append', tone: 'accent' },
      { text: 'O(n)', tone: 'bad' },
      'That append is amortised. The push that triggers a resize copies everything.',
    ],
    [
      'Linked list',
      { text: 'O(n)', tone: 'bad' },
      { text: 'O(n)', tone: 'bad' },
      { text: 'O(1)', tone: 'good' },
      { text: 'O(1)', tone: 'good' },
      'The O(1) assumes you already hold the node. Getting there is the O(n).',
    ],
    [
      'Hash map',
      { text: 'n/a', tone: 'muted' },
      { text: 'O(1)', tone: 'good' },
      { text: 'O(1)', tone: 'good' },
      { text: 'O(1)', tone: 'good' },
      'Average, not worst. And it has no order at all, so no range queries.',
    ],
    [
      'Balanced BST',
      { text: 'O(log n)', tone: 'accent' },
      { text: 'O(log n)', tone: 'accent' },
      { text: 'O(log n)', tone: 'accent' },
      { text: 'O(log n)', tone: 'accent' },
      'Loses to a hash map on lookup and wins anyway when you need things in order.',
    ],
    [
      'Heap',
      { text: 'O(1) top', tone: 'good' },
      { text: 'O(n)', tone: 'bad' },
      { text: 'O(log n)', tone: 'accent' },
      { text: 'O(log n) top', tone: 'accent' },
      'Only the extreme is cheap. Finding anything else is a linear scan.',
    ],
    [
      'Trie',
      { text: 'O(k)', tone: 'good' },
      { text: 'O(k)', tone: 'good' },
      { text: 'O(k)', tone: 'good' },
      { text: 'O(k)', tone: 'good' },
      'k is the key length, so cost does not grow with the number of keys. Memory does.',
    ],
    [
      'Stack, queue',
      { text: 'O(1) end', tone: 'good' },
      { text: 'O(n)', tone: 'bad' },
      { text: 'O(1)', tone: 'good' },
      { text: 'O(1)', tone: 'good' },
      'Restriction is the feature: you gave up access in exchange for a guarantee about order.',
    ],
  ],
  caption:
    'Read across a row to see what a structure gives you, and down a column to see who wins at one job. Nothing wins every column, which is why "which data structure" is a real question rather than a lookup.',
}

export const sorts: Visual = {
  kind: 'table',
  head: ['Sort', 'Average', 'Worst', 'Extra space', 'Stable', 'Where it actually runs'],
  rows: [
    [
      'Merge sort',
      'O(n log n)',
      { text: 'O(n log n)', tone: 'good' },
      { text: 'O(n)', tone: 'bad' },
      { text: 'yes', tone: 'good' },
      'Stable library sorts, sorting files too big for memory, and half of Timsort.',
    ],
    [
      'Quicksort',
      'O(n log n)',
      { text: 'O(n^2)', tone: 'bad' },
      { text: 'O(log n)', tone: 'good' },
      { text: 'no', tone: 'accent' },
      'The default for primitives in most standard libraries, because it is fastest in practice.',
    ],
    [
      'Heapsort',
      'O(n log n)',
      { text: 'O(n log n)', tone: 'good' },
      { text: 'O(1)', tone: 'good' },
      { text: 'no', tone: 'accent' },
      'When the worst case has to be bounded and memory is tight. Cache-hostile.',
    ],
    [
      'Insertion sort',
      'O(n^2)',
      { text: 'O(n^2)', tone: 'bad' },
      { text: 'O(1)', tone: 'good' },
      { text: 'yes', tone: 'good' },
      'Small or nearly-sorted runs. It is what Timsort falls back to, and it is linear on sorted input.',
    ],
    [
      'Selection sort',
      'O(n^2)',
      { text: 'O(n^2)', tone: 'bad' },
      { text: 'O(1)', tone: 'good' },
      { text: 'no', tone: 'accent' },
      'Almost never. Its one virtue is exactly n swaps, which mattered when writes were expensive.',
    ],
    [
      'Bubble sort',
      'O(n^2)',
      { text: 'O(n^2)', tone: 'bad' },
      { text: 'O(1)', tone: 'good' },
      { text: 'yes', tone: 'good' },
      'Never. It is the baseline the others get measured against.',
    ],
    [
      'Counting sort',
      'O(n + k)',
      { text: 'O(n + k)', tone: 'good' },
      { text: 'O(k)', tone: 'accent' },
      { text: 'yes', tone: 'good' },
      'Small known integer ranges: grades, ages, bytes. k is the size of the range.',
    ],
    [
      'Radix sort',
      'O(d(n + k))',
      { text: 'O(d(n + k))', tone: 'good' },
      { text: 'O(n + k)', tone: 'bad' },
      { text: 'yes', tone: 'good' },
      'Fixed-width keys. d is the number of digits, and each pass has to be stable or it collapses.',
    ],
  ],
  caption:
    'The worst-case column is where the surprise is. Quicksort is the only one here whose average and worst disagree, and it is also the one you use, which is a trade worth being able to defend out loud.',
}

/** Six places where reading the table alone gives you the wrong answer. */
export const caveats: { title: string; body: string }[] = [
  {
    title: 'Amortised is not worst case',
    body: "Appending to a dynamic array is O(1) averaged over many pushes and O(n) on the one push that triggers a resize. That is fine for a web app and not fine for anything with a latency budget on every individual call, which is the distinction an interviewer is listening for.",
  },
  {
    title: 'The hash map row assumes a good hash',
    body: "If every key lands in the same bucket, every operation degrades to O(n). This is not theoretical: it was a real denial-of-service attack, which is why languages now seed their hash functions randomly at startup.",
  },
  {
    title: 'The word doing the work is "balanced"',
    body: "Insert already-sorted data into a plain binary search tree and you have built a linked list with extra steps, so every O(log n) in that row becomes O(n). Red-black and AVL trees exist entirely to prevent that, and naming one is usually enough.",
  },
  {
    title: 'Space complexity includes the call stack',
    body: "A recursion n frames deep costs O(n) space even when it allocates nothing at all. That is the entire difference between the recursive and the iterative answer, and it is the follow-up question after you give the recursive one.",
  },
  {
    title: 'Constants and cache decide real races',
    body: "Quicksort and heapsort are both O(n log n) and quicksort wins nearly every time, because it walks memory in order while heapsort jumps around it. Big O cannot see the cache, so two algorithms in the same class can differ by a factor of several.",
  },
  {
    title: 'O(n log n) is the floor for comparison sorting only',
    body: "Counting sort and radix sort beat it by never comparing two elements. So when someone says you cannot sort faster than n log n, the missing words are \"by comparison\", and supplying them is a good answer.",
  },
]
