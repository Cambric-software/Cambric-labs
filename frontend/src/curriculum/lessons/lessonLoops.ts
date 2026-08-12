/**
 * Cambric Labs — Lesson: Loops
 *
 * Teaches repetition with for and while loops, and the critical habit of
 * a guaranteed-progress / termination condition. Avoids the shallow
 * "here is a for loop" treatment by surfacing the off-by-one bug.
 */
import type { LessonDetail } from '../types'

export const lessonLoops: LessonDetail = {
  id: 'lesson-loops',
  title: 'Loops: Repeating Without Copy-Paste',
  moduleId: 'module-control-flow',
  languageId: 'python',
  difficulty: 2,
  estimatedMinutes: 11,
  summary:
    'Repeat a block of code with for and while. Covers iteration over ' +
    'ranges, the off-by-one bug, and guaranteed progress.',
  teachesConceptIds: ['loop', 'for-loop', 'while-loop', 'collection'],
  prerequisiteConceptIds: ['conditional', 'variable'],
  objectives: [
    'Use a for loop to iterate a known number of times.',
    'Use a while loop to repeat until a condition fails.',
    'Identify and fix an off-by-one error.',
    'Ensure every loop makes progress toward termination.',
  ],
  content: [
    {
      kind: 'paragraph',
      text:
        'A loop runs a block repeatedly. You use a for loop when you know how ' +
        'many times to repeat (or you are iterating over a collection), and a ' +
        'while loop when you repeat until some condition stops being true.',
    },
    {
      kind: 'heading',
      text: 'for over a range',
    },
    {
      kind: 'codeWithOutput',
      languageId: 'python',
      caption: 'range(3) yields 0, 1, 2 — three values, not four.',
      code: 'for i in range(3):\n    print("iteration", i)',
      output: 'iteration 0\niteration 1\niteration 2',
    },
    {
      kind: 'callout',
      variant: 'warning',
      title: 'range(n) is 0..n-1, not 1..n',
      text:
        'range(3) produces 0, 1, 2. It has 3 elements but stops BEFORE 3. ' +
        'This half-open convention (inclusive start, exclusive end) is the source ' +
        'of countless off-by-one bugs across languages.',
    },
    {
      kind: 'heading',
      text: 'while repeats until a condition is false',
    },
    {
      kind: 'codeWithOutput',
      languageId: 'python',
      caption: 'Counting down with a while loop.',
      code: 'count = 3\nwhile count > 0:\n    print(count)\n    count = count - 1\nprint("liftoff")',
      output: '3\n2\n1\nliftoff',
    },
    {
      kind: 'callout',
      variant: 'danger',
      title: 'Every while loop must make progress',
      text:
        'If the condition never becomes false, the loop runs forever. The line ' +
        '`count = count - 1` is what guarantees termination. Remove it and the ' +
        'program hangs — a bug so common it has its own name: an infinite loop.',
    },
    {
      kind: 'heading',
      text: 'The off-by-one bug',
    },
    {
      kind: 'paragraph',
      text:
        'Suppose you want to print the numbers 1 through 5. A naive loop using ' +
        'range(5) prints 0 through 4 instead. The fix is to start at 1 and end ' +
        'one past the last value you want.',
    },
    {
      kind: 'codeWithOutput',
      languageId: 'python',
      caption: 'Bug vs fix: printing 1..5 correctly.',
      code: '# BUG: prints 0,1,2,3,4\nfor i in range(5):\n    print(i)\n\n# FIX: prints 1,2,3,4,5\nfor i in range(1, 6):\n    print(i)',
      output: '0\n1\n2\n3\n4\n1\n2\n3\n4\n5',
    },
    {
      kind: 'compare',
      languageIds: ['python', 'javascript'],
      caption:
        'Python iterates over ranges/collections directly. JavaScript for-loops ' +
        'spell out init/condition/update. Same off-by-one rules apply to both.',
      snippets: [
        'for i in range(3):\n    print(i)',
        'for (let i = 0; i < 3; i++) {\n    console.log(i);\n}',
      ],
    },
  ],
  animation: {
    type: 'codeWalk',
    title: 'Countdown loop: progress toward termination',
    steps: [
      { caption: 'count = 3. Is 3 > 0? Yes — enter loop body.', highlightLines: [1, 2] },
      { caption: 'print(3). Then count = 3 - 1 = 2.', highlightLines: [3, 4] },
      { caption: 'Is 2 > 0? Yes. print(2). count = 1.', highlightLines: [2, 3, 4] },
      { caption: 'Is 1 > 0? Yes. print(1). count = 0.', highlightLines: [2, 3, 4] },
      { caption: 'Is 0 > 0? No — exit loop. print("liftoff").', highlightLines: [2, 5] },
    ],
  },
  activity: {
    type: 'codeChallenge',
    title: 'Sum the numbers 1 to 10',
    prompt:
      'Using a for loop over range, compute the sum of 1 through 10 and ' +
      'print it. The result should be 55.',
    languageId: 'python',
    starterCode: 'total = 0\n# loop 1..10 and add to total\n\n\nprint(total)',
    checks: [
      { description: 'Uses a for loop.', assertion: { kind: 'contains', value: 'for ' } },
      { description: 'Uses range starting at 1.', assertion: { kind: 'contains', value: 'range(1' } },
      { description: 'Prints 55.', assertion: { kind: 'outputEquals', value: '55' } },
    ],
  },
  comprehensionChecks: [
    {
      question: 'How many values does `for i in range(4)` produce?',
      options: ['3', '4', '5', '1..4'],
      correctIndex: 1,
      explanation: 'range(4) yields 0, 1, 2, 3 — four values, stopping before 4.',
    },
    {
      question: 'What makes a while loop terminate?',
      options: [
        'A break is mandatory.',
        'The condition eventually becomes false because the body changes state.',
        'The loop counter reaches the limit automatically.',
        'Nothing; while loops always run forever.',
      ],
      correctIndex: 1,
      explanation:
        'A while loop stops only when its condition becomes false. The body must ' +
        'change state (like decrementing a counter) so the condition can fail.',
    },
  ],
}
