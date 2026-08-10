/**
 * Cambric Labs — Lesson: Lists (Arrays)
 *
 * Teaches ordered, indexable collections. Surfaces the genuine cross-language
 * distinction (Python lists grow dynamically; fixed-size arrays in C; dynamic
 * arrays in JS) and the off-by-one indexing pitfall. Not a shallow "here is a
 * list" tour — it builds the mental model that an index is an offset.
 */
import type { LessonDetail } from '../types'

export const lessonLists: LessonDetail = {
  id: 'lesson-lists',
  title: 'Lists: Many Values in Order',
  moduleId: 'module-collections',
  languageId: 'python',
  difficulty: 2,
  estimatedMinutes: 12,
  summary:
    'Store an ordered sequence of values, access them by index, and modify ' +
    'them. Understand indexing as an offset and the off-by-one trap.',
  teachesConceptIds: ['collection', 'array', 'index', 'iteration', 'mutation'],
  prerequisiteConceptIds: ['variable', 'type', 'loop'],
  objectives: [
    'Create a list and access elements by index.',
    'Explain why the first index is 0, not 1.',
    'Modify a list in place and append new values.',
    'Iterate over a list with a for loop and read each element.',
  ],
  content: [
    {
      kind: 'paragraph',
      text:
        'A list holds many values in a fixed order, and you reach each value by ' +
        'its position. When you have a dozen temperatures, a list lets you name ' +
        'the whole group once instead of declaring twelve variables.',
    },
    {
      kind: 'heading',
      text: 'Creating and reading a list',
    },
    {
      kind: 'codeWithOutput',
      languageId: 'python',
      caption: 'A list of temperatures, read by index.',
      code: 'temps = [36.5, 37.0, 38.2, 36.8]\nprint(temps[0])   # 36.5\nprint(temps[3])   # 36.8\nprint(len(temps)) # 4',
      output: '36.5\n36.8\n4',
    },
    {
      kind: 'callout',
      variant: 'warning',
      title: 'Indexing starts at 0',
      text:
        'The first element is at index 0, not 1. Think of the index as an ' +
        'offset: how many steps from the start. The first item is zero steps ' +
        'from the start. The last valid index is len(list) - 1 — going one past ' +
        'raises IndexError.',
    },
    {
      kind: 'heading',
      text: 'Why zero-based indexing',
    },
    {
      kind: 'paragraph',
      text:
        'Index 0 means "no offset from the start". Index 3 means "three steps ' +
        'in". This is not arbitrary tradition — it makes pointer arithmetic and ' +
        'slice math come out clean: a slice [0:3] covers exactly 3 elements, ' +
        'and the start index equals the count of elements before it.',
    },
    {
      kind: 'codeWithOutput',
      languageId: 'python',
      caption: 'Negative indices count from the end.',
      code: 'temps = [36.5, 37.0, 38.2, 36.8]\nprint(temps[-1])  # 36.8  (last)\nprint(temps[-2])  # 38.2  (second-to-last)',
      output: '36.8\n38.2',
    },
    {
      kind: 'heading',
      text: 'Lists are mutable: you change them in place',
    },
    {
      kind: 'paragraph',
      text:
        'A list is a mutable collection: you can replace an element, add to the ' +
        'end, or remove an element, and the same list object reflects the change. ' +
        'This is powerful but means two variables can share one list and see ' +
        'each other\'s edits — a common source of bugs.',
    },
    {
      kind: 'codeWithOutput',
      languageId: 'python',
      caption: 'Mutating a list in place.',
      code: 'nums = [1, 2, 3]\nnums[0] = 10        # replace\nnums.append(4)     # add to end\nnums.remove(2)     # remove first 2\nprint(nums)        # [10, 3, 4]',
      output: '[10, 3, 4]',
    },
    {
      kind: 'callout',
      variant: 'warning',
      title: 'Alias hazard',
      text:
        'a = b = [1,2,3]; a.append(4) — now b is also [1,2,3,4]. They point to ' +
        'the same list. When you need an independent copy, use list(b) or b[:].',
    },
    {
      kind: 'heading',
      text: 'Iterating over a list',
    },
    {
      kind: 'paragraph',
      text:
        'The cleanest loop reads "for each element in the list" — you rarely need ' +
        'the index. Reaching for the index when you only need the values is a ' +
        'common beginner habit that adds off-by-one risk for no benefit.',
    },
    {
      kind: 'codeWithOutput',
      languageId: 'python',
      caption: 'Iterate values directly vs. by index.',
      code: 'temps = [36.5, 37.0, 38.2]\n\n# preferred: read each value\nfor t in temps:\n    print(t)\n\n# only when you need the position\nfor i in range(len(temps)):\n    print(i, temps[i])',
      output: '36.5\n37.0\n38.2\n0 36.5\n1 37.0\n2 38.2',
    },
    {
      kind: 'compare',
      languageIds: ['python', 'typescript'],
      caption:
        'Python lists grow dynamically. JavaScript arrays also grow, but C arrays ' +
        'are fixed-size — you must allocate a new, larger array to grow. The index ' +
        'concept is identical across all three.',
      snippets: [
        'temps = [36.5, 37.0]\ntemps.append(38.2)   # grows in place\nprint(temps[0])     # 36.5',
        'const temps = [36.5, 37.0];\ntemps.push(38.2);   // grows in place\nconsole.log(temps[0]); // 36.5',
      ],
    },
  ],
  animation: {
    type: 'memoryDiagram',
    title: 'Indexing as offset',
    steps: [
      { caption: 'A list temps = [36.5, 37.0, 38.2, 36.8] sits in memory as four slots in a row.', highlightLines: [] },
      { caption: 'temps[0] reads the slot that is 0 steps from the start: 36.5.', highlightLines: [] },
      { caption: 'temps[1] is one step in: 37.0.', highlightLines: [] },
      { caption: 'temps[3] is three steps in: 36.8 — the last valid slot.', highlightLines: [] },
      { caption: 'temps[4] would be four steps in, but there is no fourth slot — IndexError. Valid indices are 0..len-1.', highlightLines: [] },
    ],
  },
  activity: {
    type: 'codeChallenge',
    title: 'Sum the temperatures',
    prompt:
      'Given `temps = [36.5, 37.0, 38.2, 36.8]`, compute the sum of all values ' +
      'using a for loop and print it. The result must be 148.5.',
    languageId: 'python',
    starterCode: 'temps = [36.5, 37.0, 38.2, 36.8]\ntotal = 0\n# loop and add each value to total\n\nprint(total)',
    checks: [
      { description: 'Uses a for loop over temps.', assertion: { kind: 'contains', value: 'for ' } },
      { description: 'Starts total at 0.', assertion: { kind: 'contains', value: 'total = 0' } },
      { description: 'Prints 148.5', assertion: { kind: 'outputContains', value: '148.5' } },
    ],
  },
  comprehensionChecks: [
    {
      question: 'In a list of 4 elements, what is the index of the last element?',
      options: ['4', '3', '1', '0'],
      correctIndex: 1,
      explanation:
        'Indexing starts at 0, so the last of 4 elements is at index 3 ' +
        '(len(list) - 1). Index 4 would be out of range.',
    },
    {
      question: 'After `a = [1,2,3]; b = a; b.append(4)`, what is a?',
      options: ['[1, 2, 3]', '[1, 2, 3, 4]', 'Error', '[4]'],
      correctIndex: 1,
      explanation:
        'b = a does not copy the list — both names point to the same list. ' +
        'Appending through b is visible through a. Use list(a) for a copy.',
    },
  ],
}
