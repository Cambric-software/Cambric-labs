/**
 * Cambric Labs — Lesson: Boolean Operators & Truthiness
 *
 * Teaches logical operators (and, or, not), short-circuit evaluation, and
 * truthiness. These are the connective tissue of every condition the
 * learner will ever write. Avoids the shallow "here are the operators"
 * treatment by surfacing short-circuiting as a *behavior* (not just a
 * rule) and truthiness as a real source of bugs.
 */
import type { LessonDetail } from '../types'

export const lessonBooleanOperators: LessonDetail = {
  id: 'lesson-boolean-operators',
  title: 'Boolean Operators & Truthiness',
  moduleId: 'module-control-flow',
  languageId: 'python',
  difficulty: 2,
  estimatedMinutes: 12,
  summary:
    'Combine conditions with and, or, not. Understand short-circuit ' +
    'evaluation and truthiness — and the bugs they cause.',
  teachesConceptIds: ['operator', 'boolean-logic', 'short-circuit', 'truthiness'],
  prerequisiteConceptIds: ['conditional', 'boolean-logic'],
  objectives: [
    'Combine conditions with and, or, and not.',
    'Predict when and/or short-circuit (skip the right side).',
    'Explain truthiness and list the falsy values in Python.',
    'Use short-circuit evaluation to guard against errors.',
  ],
  content: [
    {
      kind: 'paragraph',
      text:
        'A single comparison is rarely enough. Real conditions combine several ' +
        'checks: "is the user logged in AND is the user an admin?" Boolean ' +
        'operators join true/false values into one result.',
    },
    {
      kind: 'heading',
      text: 'and, or, not',
    },
    {
      kind: 'codeWithOutput',
      languageId: 'python',
      caption: 'and is true only when both sides are true; or is true when either is.',
      code:
        'age = 20\nhas_ticket = True\n\nprint(age >= 18 and has_ticket)  # both true\nprint(age < 18 or has_ticket)   # one true\nprint(not has_ticket)           # flips the value',
      output: 'True\nTrue\nFalse',
    },
    {
      kind: 'callout',
      variant: 'info',
      title: 'and vs or: which side must be true?',
      text:
        'Read "and" as "all of these must hold" and "or" as "at least one must ' +
        'hold". This maps to everyday language: "raining and cold" means both; ' +
        '"raining or snowing" means either is enough.',
    },
    {
      kind: 'heading',
      text: 'Short-circuit evaluation',
    },
    {
      kind: 'paragraph',
      text:
        'Here is the part most introductions skip: and and or do NOT always ' +
        'evaluate both sides. As soon as the answer is decided, they stop.',
    },
    {
      kind: 'codeWithOutput',
      languageId: 'python',
      caption: 'or stops at the first true value; and stops at the first false value.',
      code:
        'def expensive():\n    print("computed!")\n    return True\n\n# or: left is True, so right is NEVER called\nprint(True or expensive())\n\n# and: left is False, so right is NEVER called\nprint(False and expensive())',
      output: 'True\nFalse',
    },
    {
      kind: 'callout',
      variant: 'warning',
      title: '"computed!" never printed',
      text:
        'expensive() was never called in either case. or already knew the ' +
        'answer once it saw True; and already knew the answer once it saw False. ' +
        'This is short-circuit evaluation, and it is guaranteed by the language ' +
        '— not an optimization the compiler may skip.',
    },
    {
      kind: 'heading',
      text: 'Using short-circuit as a guard',
    },
    {
      kind: 'paragraph',
      text:
        'Short-circuiting is not a curiosity — it is a tool. You can use it to ' +
        'avoid an error: check the precondition first, and only do the risky ' +
        'thing if the precondition holds.',
    },
    {
      kind: 'codeWithOutput',
      languageId: 'python',
      caption: 'Check for None before calling .upper() — or crash.',
      code:
        'name = None\n\n# BAD: crashes — None has no .upper()\n# print(name.upper())\n\n# GOOD: the "is not None" guard short-circuits\nprint(name is not None and name.upper())',
      output: 'False',
    },
    {
      kind: 'callout',
      variant: 'danger',
      title: 'Order matters in a guard',
      text:
        'Put the safe check on the LEFT and the risky operation on the RIGHT. ' +
        'If you swap them, the risky operation runs first and crashes before the ' +
        'guard can protect it. This pattern — "check, then act" — appears in ' +
        'every language.',
    },
    {
      kind: 'heading',
      text: 'Truthiness: not everything is True or False',
    },
    {
      kind: 'paragraph',
      text:
        'Python lets you write `if items:` instead of `if len(items) > 0:`. ' +
        'It works because every value is either "truthy" or "falsy" when used ' +
        'in a boolean context. Most values are truthy; a small, fixed set is falsy.',
    },
    {
      kind: 'codeWithOutput',
      languageId: 'python',
      caption: 'The five falsy values; everything else is truthy.',
      code:
        'for value in [0, 0.0, "", [], {}, None, False]:\n    print(bool(value), repr(value))\nprint("---")\nprint(bool("0"))   # the string "0" is truthy!\nprint(bool([0]))   # a non-empty list is truthy',
      output: 'False 0\nFalse 0.0\nFalse \'\'\nFalse []\nFalse {}\nFalse None\nFalse False\n---\nTrue\nTrue',
    },
    {
      kind: 'callout',
      variant: 'warning',
      title: '0 the number is falsy, "0" the string is truthy',
      text:
        'This is a classic bug source when reading input. A user types "0" into ' +
        'a form; you receive the string "0", not the number 0. `if user_input:` ' +
        'is truthy and runs the branch, even though the user meant "zero / no". ' +
        'Always be explicit about whether you mean emptiness or the value zero.',
    },
    {
      kind: 'compare',
      languageIds: ['python', 'javascript'],
      caption:
        'Both languages short-circuit and have truthiness, but the falsy sets ' +
        'differ. Python falsies: 0, 0.0, "", [], {}, None, False. JS falsies also ' +
        'include NaN and document.all. The concepts transfer; the lists do not.',
      snippets: [
        '# Python: and/or return the operand, not just True/False\nname = "" or "guest"\nprint(name)  # "guest"\n\n# guard with truthiness\nitems = []\nif items:\n    print("has items")',
        '// JS: || and && short-circuit the same way\nconst name = "" || "guest";\nconsole.log(name); // "guest"\n\n// guard with truthiness\nconst items = [];\nif (items) {\n  console.log("has items"); // runs! JS [] is truthy\n}',
      ],
    },
    {
      kind: 'paragraph',
      text:
        'Notice the subtle but important cross-language difference in the compare ' +
        'block: an empty list `[]` is falsy in Python but truthy in JavaScript. ' +
        'If you port code between languages, do not assume the same value behaves ' +
        'the same way in a condition. When in doubt, be explicit: write ' +
        '`len(items) > 0` or `items.length > 0`.',
    },
  ],
  animation: {
    type: 'dataFlow',
    title: 'Tracing a short-circuit guard',
    steps: [
      { caption: 'name = None. Evaluate: name is not None and name.upper()', highlightLines: [1, 4] },
      { caption: 'Left side: name is not None → None is not None → False.', highlightLines: [4] },
      { caption: 'and sees False on the left. The result is already decided.', highlightLines: [4] },
      { caption: 'Short-circuit: name.upper() is NEVER evaluated. No crash.', highlightLines: [4] },
      { caption: 'Whole expression is False. print(False).', highlightLines: [4] },
    ],
  },
  activity: {
    type: 'codeChallenge',
    title: 'Safe divide',
    prompt:
      'Given `denominator = 0` and `numerator = 10`, use a short-circuit guard ' +
      'to print the result of numerator / denominator ONLY when denominator is ' +
      'not zero. Otherwise print "skip" (do not crash). The output must be: skip',
    languageId: 'python',
    starterCode:
      'numerator = 10\ndenominator = 0\n\n# guard: only divide if denominator is not 0\n\n\n',
    checks: [
      { description: 'Uses a short-circuit and/or guard.', assertion: { kind: 'contains', value: ' and ' } },
      { description: 'Checks denominator is not zero.', assertion: { kind: 'contains', value: 'denominator' } },
      { description: 'Prints skip without crashing.', assertion: { kind: 'outputEquals', value: 'skip' } },
    ],
  },
  comprehensionChecks: [
    {
      question: 'In `False and expensive()`, is expensive() called?',
      options: ['Yes', 'No — and short-circuits on False', 'Only sometimes', 'It crashes'],
      correctIndex: 1,
      explanation:
        'and requires both sides true. The left is already False, so the result ' +
        'is decided and the right side is never evaluated.',
    },
    {
      question: 'Which value is truthy in Python?',
      options: ['0', '""', '[0]', 'None'],
      correctIndex: 2,
      explanation:
        'A non-empty list is truthy. 0, the empty string, and None are all falsy. ' +
        'Note [0] contains a falsy element but the list itself is non-empty.',
    },
    {
      question: 'Why is "0" (string) truthy while 0 (number) is falsy?',
      options: [
        'It is a bug in Python.',
        'Only the empty string is falsy; "0" is a non-empty string.',
        'Strings are always truthy.',
        'Numbers are always falsy.',
      ],
      correctIndex: 1,
      explanation:
        'The falsy rule for strings is "the empty string". "0" has length 1, so it ' +
        'is truthy. This trips up code that reads user input as strings.',
    },
  ],
}
