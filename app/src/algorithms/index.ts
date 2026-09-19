import type { Algorithm } from '../engine/types'
import { twoSum } from './twoSum'
import { twoPointers } from './twoPointers'
import { slidingWindow } from './slidingWindow'
import { binarySearch } from './binarySearch'
import { bfsGrid } from './bfsGrid'
import { backtracking } from './backtracking'
import { treeTraversal } from './treeTraversal'
import { heap } from './heap'

export const algorithms: Algorithm[] = [
  twoSum,
  twoPointers,
  slidingWindow,
  binarySearch,
  bfsGrid,
  backtracking,
  treeTraversal,
  heap,
].sort((a, b) => a.rank - b.rank)

export function byId(id: string): Algorithm | undefined {
  return algorithms.find((a) => a.id === id)
}
