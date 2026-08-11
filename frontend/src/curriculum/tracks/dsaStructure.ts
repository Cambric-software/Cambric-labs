/**
 * Cambric Labs — Curriculum Structure: Data Structures & Algorithms
 *
 * After fundamentals: how to ORGANIZE data and how to SOLVE problems
 * efficiently. Covers arrays, linked lists, stacks, queues, trees, graphs,
 * hashing, searching, sorting, and algorithm design paradigms.
 */
import { registerCourseStructure, registerModuleStructure, registerTrackStructure } from '../loader'
import type { Course, CurriculumModule, Track } from '../types'

export const DSA_TRACK_ID = 'track-data-structures-algorithms'

const dsaTrack: Track = {
  id: DSA_TRACK_ID,
  title: 'Data Structures & Algorithms',
  summary:
    'How to organize data and solve problems efficiently — from arrays and ' +
    'lists to trees, graphs, sorting, searching, and algorithm design.',
  courseIds: ['course-linear-structures', 'course-hierarchical-structures', 'course-algorithm-design'],
  accent: 'purple',
}

const linearStructures: Course = {
  id: 'course-linear-structures',
  trackId: DSA_TRACK_ID,
  title: 'Linear Data Structures',
  summary: 'Arrays, linked lists, stacks, and queues — data in a line.',
  moduleIds: ['module-linked-lists', 'module-stacks-queues'],
}

const hierarchicalStructures: Course = {
  id: 'course-hierarchical-structures',
  trackId: DSA_TRACK_ID,
  title: 'Trees, Hashing & Graphs',
  summary: 'Hierarchical and networked data: trees, heaps, hash tables, and graphs.',
  moduleIds: ['module-trees', 'module-hashing', 'module-graphs'],
}

const algorithmDesign: Course = {
  id: 'course-algorithm-design',
  trackId: DSA_TRACK_ID,
  title: 'Algorithm Design',
  summary: 'Searching, sorting, complexity, and design paradigms.',
  moduleIds: ['module-searching-sorting', 'module-complexity', 'module-paradigms'],
}

const moduleLinkedLists: CurriculumModule = {
  id: 'module-linked-lists',
  courseId: 'course-linear-structures',
  title: 'Linked Lists',
  summary: 'Nodes linked by pointers; insertion and traversal.',
  lessonIds: ['lesson-linked-lists'],
}

const moduleStacksQueues: CurriculumModule = {
  id: 'module-stacks-queues',
  courseId: 'course-linear-structures',
  title: 'Stacks & Queues',
  summary: 'LIFO and FIFO structures and when to use each.',
  lessonIds: ['lesson-stacks-intro', 'lesson-queues-intro', 'lesson-deque', 'lesson-priority-queues'],
}

const moduleTrees: CurriculumModule = {
  id: 'module-trees',
  courseId: 'course-hierarchical-structures',
  title: 'Trees',
  summary: 'Binary trees, BSTs, and heaps.',
  lessonIds: ['lesson-binary-trees', 'lesson-bst', 'lesson-heaps', 'lesson-tries'],
}

const moduleHashing: CurriculumModule = {
  id: 'module-hashing',
  courseId: 'course-hierarchical-structures',
  title: 'Hashing',
  summary: 'Hash functions, hash tables, and collisions.',
  lessonIds: ['lesson-hash-functions', 'lesson-hash-tables', 'lesson-bloom-filters'],
}

const moduleGraphs: CurriculumModule = {
  id: 'module-graphs',
  courseId: 'course-hierarchical-structures',
  title: 'Graphs',
  summary: 'Nodes, edges, BFS, and DFS.',
  lessonIds: ['lesson-graphs-intro', 'lesson-bfs', 'lesson-dfs'],
}

const moduleSearchingSorting: CurriculumModule = {
  id: 'module-searching-sorting',
  courseId: 'course-algorithm-design',
  title: 'Searching & Sorting',
  summary: 'Linear search, binary search, and sorting algorithms.',
  lessonIds: [],
}

const moduleComplexity: CurriculumModule = {
  id: 'module-complexity',
  courseId: 'course-algorithm-design',
  title: 'Computational Complexity',
  summary: 'Big-O notation and how to reason about growth.',
  lessonIds: [],
}

const moduleParadigms: CurriculumModule = {
  id: 'module-paradigms',
  courseId: 'course-algorithm-design',
  title: 'Design Paradigms',
  summary: 'Divide and conquer, greedy, dynamic programming, and backtracking.',
  lessonIds: [],
}

export function registerDsaStructure(): void {
  registerTrackStructure(dsaTrack)
  registerCourseStructure(linearStructures)
  registerCourseStructure(hierarchicalStructures)
  registerCourseStructure(algorithmDesign)
  registerModuleStructure(moduleLinkedLists)
  registerModuleStructure(moduleStacksQueues)
  registerModuleStructure(moduleTrees)
  registerModuleStructure(moduleHashing)
  registerModuleStructure(moduleGraphs)
  registerModuleStructure(moduleSearchingSorting)
  registerModuleStructure(moduleComplexity)
  registerModuleStructure(moduleParadigms)
}
