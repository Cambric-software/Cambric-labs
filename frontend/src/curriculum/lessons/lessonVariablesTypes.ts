/**
 * Cambric Labs — Lesson: Variables & Types
 *
 * Builds on the previous lesson by introducing the idea of a type: what
 * category of data a value is, and why that constrains what operations
 * make sense. Contrasts Python's dynamic typing with static typing.
 */
import type { LessonDetail } from '../types'

export const lessonVariablesTypes: LessonDetail = {
  id: 'lesson-variables-types',
  title: 'Types: What Kind of Value Is This?',
  moduleId: 'module-variables',
  languageId: 'python',
  difficulty: 2,
  estimatedMinutes: 9,
  summary:
    'Every value has a type that determines what operations are valid. ' +
    'This lesson covers common types and why mixing them matters.',
  teachesConceptIds: ['type', 'literal', 'expression'],
  prerequisiteConceptIds: ['variable', 'assignment'],
  objectives: [
    'Identify the common primitive types (int, float, str, bool).',
    'Predict which operations are valid for a given type.',
    'Explain the difference between dynamic and static typing.',
    'Convert between types with explicit casts.',
  ],
  content: [
    {
      kind: 'paragraph',
      text:
        'A value is not just "some data" — it is a specific kind of data. That ' +
        'kind is its type, and the type decides which operations make sense. ' +
        'You can add two integers, but you cannot add an integer to a boolean.',
    },
    {
      kind: 'heading',
      text: 'The core primitive types',
    },
    {
      kind: 'codeWithOutput',
      languageId: 'python',
      caption: 'Four primitive types you will use constantly.',
      code:
        'age = 30            # int  (whole number)\nprice = 9.99        # float (decimal)\nname = "Cam"        # str  (text)\nactive = True       # bool (True/False)\nprint(type(age), type(price), type(name), type(active))',
      output: "<class 'int'> <class 'float'> <class 'str'> <class 'bool'>",
    },
    {
      kind: 'callout',
      variant: 'info',
      title: 'True and False are capitalized in Python',
      text:
        'Python spells booleans `True` and `False` (capitalized). Many languages ' +
        'use lowercase `true`/`false`. It is a syntax detail, not a concept.',
    },
    {
      kind: 'heading',
      text: 'The type decides what is valid',
    },
    {
      kind: 'paragraph',
      text:
        'Adding an int to an int is fine. Concatenating a string to a string is ' +
        'fine. But mixing an int and a string with + is an error: Python cannot ' +
        'decide whether you meant arithmetic or text concatenation.',
    },
    {
      kind: 'code',
      languageId: 'python',
      caption: 'Valid operations depend on type.',
      code:
        'print(1 + 2)          # 3 — int + int\nprint("a" + "b")      # ab — str + str\nprint("count: " + 5)   # TypeError: can only concatenate str (not "int") to str',
    },
    {
      kind: 'heading',
      text: 'Explicit conversion (casting)',
    },
    {
      kind: 'paragraph',
      text:
        'When you need to combine types, convert explicitly so the intent is ' +
        'unambiguous. Convert a number to text with str(), text to a number ' +
        'with int() or float().',
    },
    {
      kind: 'codeWithOutput',
      languageId: 'python',
      caption: 'Casting to make a mixed expression valid.',
      code: 'count = 5\nmessage = "count: " + str(count)\nprint(message)\n\nvalue = int("42")\nprint(value + 1)',
      output: 'count: 5\n43',
    },
    {
      kind: 'callout',
      variant: 'warning',
      title: 'int() truncates toward zero',
      text:
        'int("3.9") raises an error, and int(3.9) becomes 3 (the decimal is ' +
        'dropped, not rounded). Use round() if you want nearest-integer rounding.',
    },
    {
      kind: 'compare',
      languageIds: ['python', 'typescript'],
      caption:
        'Python checks types while the program runs (dynamic). TypeScript checks ' +
        'them before it runs (static). Both prevent the same bug; static catches ' +
        'it earlier, dynamic requires a test to reach the line.',
      snippets: [
        'def add(a, b):\n    return a + b   # works for ints, fails for int+str at runtime\n\nadd(1, 2)        # 3\nadd(1, "x")      # TypeError when the line runs',
        'function add(a: number, b: number): number {\n    return a + b;\n}\n\nadd(1, 2);     // ok\nadd(1, "x");   // ERROR before it runs: "x" is not a number',
      ],
    },
  ],
  animation: {
    type: 'dataFlow',
    title: 'Tracing a type conversion',
    steps: [
      {
        caption: 'Start with count = 7 (an int) and a string "items: ".',
        highlightLines: [],
      },
      {
        caption: 'Naive concat fails: "items: " + count mixes str and int. Python has no implicit conversion here, so this raises TypeError at runtime.',
        highlightLines: [],
      },
      {
        caption: 'Wrap count in str(): str(7) produces the string "7". Now both sides are strings.',
        highlightLines: [],
      },
      {
        caption: 'Concatenate: "items: " + "7" yields "items: 7".',
        highlightLines: [],
      },
      {
        caption: 'print("items: 7") outputs: items: 7. The conversion made the types agree before the operation.',
        highlightLines: [],
      },
    ],
  },
  activity: {
    type: 'codeChallenge',
    title: 'Fix the type mismatch',
    prompt:
      'Combine the variable `count` (an int) with the string "items: " to ' +
      'print `items: 7`. You must use an explicit conversion so it runs.',
    languageId: 'python',
    starterCode: 'count = 7\n# Fix the next line so it prints: items: 7\nprint("items: " + count)',
    checks: [
      { description: 'Uses str() to convert count.', assertion: { kind: 'contains', value: 'str(' } },
      { description: 'Prints items: 7', assertion: { kind: 'outputContains', value: 'items: 7' } },
    ],
  },
  comprehensionChecks: [
    {
      question: 'What does `print("v: " + 3)` do in Python?',
      options: ['Prints v: 3', 'Raises TypeError at runtime', 'Prints v: +3', 'Rounds 3'],
      correctIndex: 1,
      explanation:
        'You cannot concatenate str and int. Python raises TypeError when the line runs. ' +
        'Use str(3) to convert first.',
    },
    {
      question: 'Why does TypeScript reject `add(1, "x")` before running?',
      options: [
        'It cannot parse the string.',
        'Static types catch the mismatch at compile time.',
        'It is a runtime error Python would also catch early.',
        'Numbers cannot be added.',
      ],
      correctIndex: 1,
      explanation:
        'TypeScript checks declared types before execution (static typing), so the ' +
        'mismatch is caught before the line ever runs.',
    },
  ],
}
