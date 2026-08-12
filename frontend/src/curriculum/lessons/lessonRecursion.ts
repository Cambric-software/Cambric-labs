/**
 * Cambric Labs — Lesson: Recursion
 *
 * Teaches recursion as a function that calls itself on a smaller problem,
 * with a base case that stops the chain. Avoids the shallow "factorial"
 * treatment by surfacing the call stack, the missing-base-case crash, and
 * when recursion is the wrong tool (iteration is clearer for simple loops).
 */
import type { LessonDetail } from '../types'

export const lessonRecursion: LessonDetail = {
  id: 'lesson-recursion',
  title: 'Recursion: Functions That Call Themselves',
  moduleId: 'module-functions',
  languageId: 'python',
  difficulty: 3,
  estimatedMinutes: 13,
  summary:
    'A function that calls itself on a smaller subproblem. Covers the ' +
    'base case, the call stack, and when to prefer a loop.',
  teachesConceptIds: ['recursion', 'base-case', 'function', 'return-value'],
  prerequisiteConceptIds: ['function', 'parameter', 'return-value', 'conditional'],
  objectives: [
    'Define recursion as a function calling itself on a smaller input.',
    'Identify and write the base case that stops recursion.',
    'Trace a recursive call through the call stack.',
    'Choose between recursion and iteration for a given problem.',
  ],
  content: [
    {
      kind: 'paragraph',
      text:
        'A recursive function is one that calls itself. The idea: solve a big ' +
        'problem by reducing it to a smaller version of the same problem, over ' +
        'and over, until the problem is so small the answer is obvious. That ' +
        'obvious answer is the base case.',
    },
    {
      kind: 'heading',
      text: 'Countdown: the simplest recursion',
    },
    {
      kind: 'codeWithOutput',
      languageId: 'python',
      caption: 'countdown calls itself with n-1 until it hits 0.',
      code:
        'def countdown(n):\n    if n <= 0:\n        print("liftoff")\n        return\n    print(n)\n    countdown(n - 1)\n\ncountdown(3)',
      output: '3\n2\n1\nliftoff',
    },
    {
      kind: 'callout',
      variant: 'info',
      title: 'Two parts every recursion needs',
      text:
        '1) A BASE CASE: the condition that stops (here, n <= 0). ' +
        '2) A RECURSIVE CASE: the function calling itself on a SMALLER input ' +
        '(here, countdown(n - 1)). Remove either and the recursion is broken.',
    },
    {
      kind: 'heading',
      text: 'The call stack: how recursion actually runs',
    },
    {
      kind: 'paragraph',
      text:
        'Each call to countdown does NOT immediately finish. Python pauses the ' +
        'current call, runs the new one, and only resumes when that returns. The ' +
        'paused calls pile up in memory — this is the call stack.',
    },
    {
      kind: 'codeWithOutput',
      languageId: 'python',
      caption: 'Watch the order: prints happen on the way DOWN, before the recursive call.',
      code:
        'def countdown(n):\n    print("enter", n)\n    if n <= 0:\n        return\n    countdown(n - 1)\n    print("exit", n)\n\ncountdown(2)',
      output: 'enter 2\nenter 1\nenter 0\nexit 1\nexit 2',
    },
    {
      kind: 'callout',
      variant: 'warning',
      title: 'Work before the call happens on the way down; after, on the way up',
      text:
        'Notice "exit 1" and "exit 2" print AFTER "enter 0". The calls unwind in ' +
        'reverse: the deepest call finishes first, then each paused call resumes. ' +
        'This LIFO (last-in, first-out) order is the defining property of a stack.',
    },
    {
      kind: 'heading',
      text: 'The missing base case: a crash, not an infinite loop',
    },
    {
      kind: 'paragraph',
      text:
        'If you forget the base case, the function calls itself forever — until ' +
        'Python runs out of stack space and crashes with RecursionError. This is ' +
        'different from a while loop, which can spin forever without crashing.',
    },
    {
      kind: 'codeWithOutput',
      languageId: 'python',
      caption: 'No base case: each call adds a frame until the stack overflows.',
      code:
        'def boom(n):\n    # forgot: if n <= 0: return\n    boom(n - 1)\n\n# boom(3)  # RecursionError: maximum recursion depth exceeded',
      output: 'RecursionError: maximum recursion depth exceeded',
    },
    {
      kind: 'callout',
      variant: 'danger',
      title: 'Recursion needs progress, just like loops',
      text:
        'A while loop must move toward its exit condition; a recursion must move ' +
        'toward its base case. If the recursive call does not shrink the problem ' +
        '(e.g. countdown(n) instead of countdown(n - 1)), the base case is never ' +
        'reached and the stack overflows. Always ask: is the input getting smaller?',
    },
    {
      kind: 'heading',
      text: 'A problem recursion fits naturally: tree-shaped data',
    },
    {
      kind: 'paragraph',
      text:
        'Recursion shines when the problem is itself recursive in shape — like a ' +
        'tree or a nested folder structure. Counting files in a folder means ' +
        'counting files in each subfolder, which means counting files in each of ' +
        'THEIR subfolders. The same logic applies at every level.',
    },
    {
      kind: 'codeWithOutput',
      languageId: 'python',
      caption: 'A nested list can contain more nested lists — recursion handles any depth.',
      code:
        'def deep_sum(items):\n    total = 0\n    for item in items:\n        if isinstance(item, list):\n            total += deep_sum(item)   # recurse into sub-list\n        else:\n            total += item             # base case: a number\n    return total\n\nprint(deep_sum([1, [2, 3], [4, [5, 6]]]))',
      output: '21',
    },
    {
      kind: 'paragraph',
      text:
        'Try writing deep_sum with a loop instead: you cannot, because you do not ' +
        'know how deep the nesting goes. Recursion matches the shape of the data, ' +
        'which is why it is the natural tool for trees and nested structures.',
    },
    {
      kind: 'compare',
      languageIds: ['python', 'javascript'],
      caption:
        'Recursion looks near-identical across languages. The base-case and ' +
        'recursive-case structure transfers directly; only the crash error differs ' +
        '(Python: RecursionError; JS: RangeError "Maximum call stack size exceeded").',
      snippets: [
        'def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n\nprint(factorial(5))  # 120',
        'function factorial(n) {\n  if (n <= 1) return 1;\n  return n * factorial(n - 1);\n}\n\nconsole.log(factorial(5)); // 120',
      ],
    },
    {
      kind: 'callout',
      variant: 'info',
      title: 'When to prefer a loop instead',
      text:
        'For simple repetition (sum 1..100, repeat 10 times), a loop is clearer ' +
        'and avoids stack growth. Reach for recursion when the problem branches or ' +
        'nests — when "a smaller version of the same problem" is a natural fit. ' +
        'Every recursion can be rewritten as a loop with an explicit stack, but ' +
        'often the recursive form is far more readable.',
    },
  ],
  animation: {
    type: 'dataFlow',
    title: 'Call stack for countdown(3)',
    steps: [
      { caption: 'call countdown(3). 3 > 0, so print(3), then call countdown(2).', highlightLines: [1, 2, 4, 5] },
      { caption: 'Stack: [3]. Inside countdown(2): print(2), call countdown(1).', highlightLines: [1, 2, 4, 5] },
      { caption: 'Stack: [3, 2]. Inside countdown(1): print(1), call countdown(0).', highlightLines: [1, 2, 4, 5] },
      { caption: 'Stack: [3, 2, 1]. Inside countdown(0): base case! print("liftoff"), return.', highlightLines: [1, 2, 3, 4] },
      { caption: 'Unwind: 1 returns, 2 returns, 3 returns. Stack empties.', highlightLines: [4] },
    ],
  },
  activity: {
    type: 'codeChallenge',
    title: 'Recursive sum 1 to n',
    prompt:
      'Write a recursive function sum_to(n) that returns 1 + 2 + ... + n using ' +
      'recursion (no loops). The base case is n <= 0 returning 0. ' +
      'sum_to(5) must print 15.',
    languageId: 'python',
    starterCode: 'def sum_to(n):\n    # base case\n\n    # recursive case\n\n\nprint(sum_to(5))',
    checks: [
      { description: 'Defines sum_to with a parameter.', assertion: { kind: 'contains', value: 'def sum_to' } },
      { description: 'Calls sum_to recursively.', assertion: { kind: 'contains', value: 'sum_to(' } },
      { description: 'Prints 15.', assertion: { kind: 'outputEquals', value: '15' } },
    ],
  },
  comprehensionChecks: [
    {
      question: 'What two things must every recursion have?',
      options: [
        'A loop and a counter',
        'A base case and a recursive case',
        'A parameter and a return',
        'A print and a return',
      ],
      correctIndex: 1,
      explanation:
        'The base case stops the recursion; the recursive case calls itself on a ' +
        'smaller input. Without the base case it never stops; without the recursive ' +
        'case it is not recursion at all.',
    },
    {
      question: 'What happens if you forget the base case?',
      options: [
        'It loops forever without crashing',
        'It returns 0',
        'It crashes with RecursionError when the stack overflows',
        'It runs once and stops',
      ],
      correctIndex: 2,
      explanation:
        'Each call adds a frame to the call stack. With no base case, frames ' +
        'accumulate until Python hits its recursion limit and raises RecursionError. ' +
        'This is a crash, distinct from an infinite loop.',
    },
    {
      question: 'When is recursion a BETTER choice than a loop?',
      options: [
        'When you need to sum a range of numbers',
        'When counting to 100',
        'When the problem is tree-shaped or nested to unknown depth',
        'Never — loops are always better',
      ],
      correctIndex: 2,
      explanation:
        'Recursion fits problems whose structure is itself recursive (trees, ' +
        'nested folders, nested lists). For flat repetition, a loop is clearer and ' +
        'uses constant stack space.',
    },
  ],
}
