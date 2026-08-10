/**
 * Cambric Labs — Lesson: Functions (Intro)
 *
 * Teaches functions as named, reusable, parameterized blocks. Emphasizes
 * the contract (inputs -> output), parameter vs argument, return, and the
 * call stack model. Cross-references scope implicitly to set up later work.
 */
import type { LessonDetail } from '../types'

export const lessonFunctionsIntro: LessonDetail = {
  id: 'lesson-functions-intro',
  title: 'Functions: Reusable, Named Logic',
  moduleId: 'module-functions',
  languageId: 'python',
  difficulty: 2,
  estimatedMinutes: 11,
  summary:
    'A function packages a block of code under a name so you can reuse it. ' +
    'Covers parameters, arguments, return, and the call stack.',
  teachesConceptIds: ['function', 'parameter', 'return-value', 'scope'],
  prerequisiteConceptIds: ['variable', 'control-flow'],
  objectives: [
    'Define a function with parameters and a return value.',
    'Distinguish a parameter from an argument.',
    'Trace a function call through the call stack.',
    'Explain why a function without return yields None.',
  ],
  content: [
    {
      kind: 'paragraph',
      text:
        'A function is a named block of code you can run by calling it. Functions ' +
        'let you write logic once and reuse it many times, optionally feeding in ' +
        'different inputs each call and getting a result back.',
    },
    {
      kind: 'heading',
      text: 'Defining and calling',
    },
    {
      kind: 'codeWithOutput',
      languageId: 'python',
      caption: 'A function that doubles a number.',
      code: 'def double(x):\n    return x * 2\n\nprint(double(5))\nprint(double(10))',
      output: '10\n20',
    },
    {
      kind: 'callout',
      variant: 'info',
      title: 'Parameter vs argument',
      text:
        '`x` in `def double(x)` is a PARAMETER — a placeholder name declared in ' +
        'the definition. The value 5 you pass in `double(5)` is an ARGUMENT — the ' +
        'actual value supplied when calling. People blur the terms, but the ' +
        'distinction helps when reading errors.',
    },
    {
      kind: 'heading',
      text: 'return sends a value back to the caller',
    },
    {
      kind: 'paragraph',
      text:
        'When execution hits `return`, the function stops and the value is sent ' +
        'back to whoever called it. A function with no return statement (or a ' +
        'bare `return`) returns None — Python\'s name for "no value".',
    },
    {
      kind: 'codeWithOutput',
      languageId: 'python',
      caption: 'Functions without return yield None.',
      code: 'def greet(name):\n    print("hi", name)\n\nresult = greet("ada")\nprint(result)',
      output: 'hi ada\nNone',
    },
    {
      kind: 'heading',
      text: 'The call stack',
    },
    {
      kind: 'paragraph',
      text:
        'Each time you call a function, the interpreter pushes a new "frame" onto ' +
        'the call stack holding that call\'s parameters and local variables. When ' +
        'the function returns, its frame is popped off. This is why local variables ' +
        'inside one call do not collide with another call.',
    },
    {
      kind: 'codeWithOutput',
      languageId: 'python',
      caption: 'Recursive calls each get their own frame.',
      code: 'def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n\nprint(factorial(3))',
      output: '6',
    },
    {
      kind: 'compare',
      languageIds: ['python', 'typescript'],
      caption:
        'Python infers types at runtime; TypeScript lets you declare them for ' +
        'earlier error catching. The function concept is identical.',
      snippets: [
        'def add(a, b):\n    return a + b',
        'function add(a: number, b: number): number {\n    return a + b;\n}',
      ],
    },
  ],
  animation: {
    type: 'callStack',
    title: 'call stack while computing factorial(3)',
    steps: [
      { caption: 'Call factorial(3). Push frame: n=3.', payload: { frame: 'factorial(3) n=3' } },
      {
        caption: '3 > 1, so compute 3 * factorial(2). Push frame: n=2.',
        payload: { frame: 'factorial(2) n=2' },
      },
      {
        caption: '2 > 1, so compute 2 * factorial(1). Push frame: n=1.',
        payload: { frame: 'factorial(1) n=1' },
      },
      { caption: '1 <= 1, so factorial(1) returns 1. Pop frame.', payload: { returns: 1 } },
      { caption: 'factorial(2) = 2 * 1 = 2. Returns 2. Pop frame.', payload: { returns: 2 } },
      { caption: 'factorial(3) = 3 * 2 = 6. Returns 6. Pop frame.', payload: { returns: 6 } },
    ],
  },
  activity: {
    type: 'codeChallenge',
    title: 'Write an add function',
    prompt:
      'Define a function `add(a, b)` that returns the sum of a and b, then ' +
      'call it with 4 and 5 and print the result.',
    languageId: 'python',
    starterCode: '# define add(a, b) returning the sum\n\n\n# call add(4, 5) and print\n',
    checks: [
      { description: 'Defines a function named add.', assertion: { kind: 'contains', value: 'def add(' } },
      { description: 'Uses return.', assertion: { kind: 'contains', value: 'return' } },
      { description: 'Prints 9.', assertion: { kind: 'outputEquals', value: '9' } },
    ],
  },
  comprehensionChecks: [
    {
      question: 'What does a function with no return statement return in Python?',
      options: ['0', 'An empty string', 'None', 'It errors'],
      correctIndex: 2,
      explanation:
        'A function that reaches the end without returning yields None — Python\'s ' +
        'representation of "no value".',
    },
    {
      question: 'In `def f(x): ...` called as `f(5)`, which is the parameter?',
      options: ['5', 'x', 'f', 'def'],
      correctIndex: 1,
      explanation:
        'x is the PARAMETER (declared placeholder in the definition). 5 is the ' +
        'ARGUMENT (the actual value passed at the call site).',
    },
  ],
}
