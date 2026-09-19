import type { Algorithm } from '../engine/types'
import { twoSum } from './twoSum'
import { twoPointers } from './twoPointers'
import { slidingWindow } from './slidingWindow'
import { binarySearch } from './binarySearch'
import { bfsGrid } from './bfsGrid'
import { backtracking } from './backtracking'
import { treeTraversal } from './treeTraversal'
import { heap } from './heap'
import { coinChange } from './coinChange'
import { editDistance } from './editDistance'
import { mergeSort } from './mergeSort'
import { intervals } from './intervals'
import { monotonicStack } from './monotonicStack'
import { linkedList } from './linkedList'
import { topoSort } from './topoSort'
import { unionFind } from './unionFind'
import { trie } from './trie'
import { dijkstra } from './dijkstra'
import { bitManipulation } from './bits'
import { prefixSums } from './prefixSums'
import { quickselect } from './quickselect'
import { matrixRotate } from './matrixRotate'
import { cyclicSort } from './cyclicSort'
import { bstDelete } from './bstDelete'
import { reservoir } from './reservoir'
import { lruCache } from './lruCache'
import { countInversions } from './countInversions'
import { jumpGame } from './jumpGame'
import { sieve } from './sieve'
import { groupAnagrams } from './groupAnagrams'

export const algorithms: Algorithm[] = [
  twoSum,
  twoPointers,
  slidingWindow,
  binarySearch,
  bfsGrid,
  backtracking,
  treeTraversal,
  heap,
  coinChange,
  editDistance,
  mergeSort,
  intervals,
  monotonicStack,
  linkedList,
  topoSort,
  unionFind,
  trie,
  dijkstra,
  bitManipulation,
  prefixSums,
  quickselect,
  matrixRotate,
  cyclicSort,
  bstDelete,
  reservoir,
  lruCache,
  countInversions,
  jumpGame,
  sieve,
  groupAnagrams,
].sort((a, b) => a.rank - b.rank)

export function byId(id: string): Algorithm | undefined {
  return algorithms.find((a) => a.id === id)
}
