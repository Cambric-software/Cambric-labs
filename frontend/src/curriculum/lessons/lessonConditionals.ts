/**
 * Cambric Labs — Lesson: Conditionals
 *
 * Teaches conditional branching and the boolean logic that drives it.
 * Emphasizes evaluation of the condition expression first, then branch
 * selection — a model that transfers to every language.
 */
import type { LessonDetail } from '../types'

export const lessonConditionals: LessonDetail = {
  id: 'lesson-conditionals',
  title: 'Conditionals: Choosing What Runs',
  moduleId: 'module-control-flow',
  languageId: 'python',
  difficulty: 2,
  estimatedMinutes: 10,
  summary:
    'Run different code depending on whether a condition is true. Covers ' +
    'if/elif/else, boolean logic, and the importance of order.',
  teachesConceptIds: ['conditional', 'boolean-logic', 'control-flow'],
  prerequisiteConceptIds: ['variable', 'expression'],
  objectives: [
    'Write an if/elif/else chain that selects exactly one branch.',
    'Combine conditions with and, or, not.',
    'Explain why branch order changes behavior.',
    'Avoid the common bug of overlapping conditions.',
  ],
  content: [
    {
      kind: 'paragraph',
      text:
        'A conditional lets your program decide. It evaluates a condition — an ' +
        'expression that is either True or False — and runs one block of code ' +
        'based on the result.',
    },
    {
      kind: 'heading',
      text: 'if / elif / else',
    },
    {
      kind: 'codeWithOutput',
      languageId: 'python',
      caption: 'A grading function picks exactly one branch.',
      code:
        'def grade(score):\n    if score >= 90:\n        return "A"\n    elif score >= 80:\n        return "B"\n    elif score >= 70:\n        return "C"\n    else:\n        return "F"\n\nprint(grade(85))',
      output: 'B',
    },
    {
      kind: 'callout',
      variant: 'warning',
      title: 'Branches are checked in order, top to bottom',
      text:
        'Python tests each condition in order and runs the FIRST one that is ' +
        'True, then skips the rest. Reordering the branches changes the result.',
    },
    {
      kind: 'heading',
      text: 'Boolean logic combines conditions',
    },
    {
      kind: 'paragraph',
      text:
        'Use `and` (both must be true), `or` (at least one true), and `not` ' +
        '(inverts). These let one condition express several checks at once.',
    },
    {
      kind: 'codeWithOutput',
      languageId: 'python',
      caption: 'and/or combine simple conditions into one.',
      code:
        'age = 25\nhas_license = True\n\nif age >= 18 and has_license:\n    print("may drive")\nelse:\n    print("may not drive")',
      output: 'may drive',
    },
    {
      kind: 'callout',
      variant: 'danger',
      title: 'A common overlap bug',
      text:
        'If you write `if score >= 80: return "B"` before ' +
        '`if score >= 90: return "A"`, a score of 95 returns "B" because the ' +
        'first matching branch wins. Order most-specific first.',
    },
    {
      kind: 'compare',
      languageIds: ['python', 'javascript'],
      caption:
        'Python spells boolean operators as words; JavaScript uses symbols. ' +
        'The truth model is identical.',
      snippets: [
        'if age >= 18 and has_license:\n    print("ok")',
        'if (age >= 18 && hasLicense) {\n    console.log("ok");\n}',
      ],
    },
  ],
  animation: {
    type: 'codeWalk',
    title: 'Walking the grade() branches for score=85',
    steps: [
      { caption: 'score = 85. Check first branch: 85 >= 90? False.', highlightLines: [2] },
      { caption: 'Move to elif: 85 >= 80? True — this branch runs.', highlightLines: [4] },
      { caption: 'return "B". No later branches are checked.', highlightLines: [5] },
    ],
  },
  activity: {
    type: 'predictOutput',
    title: 'Predict the output',
    prompt:
      'What does this print?\n\nx = 10\nif x > 5 and x < 20:\n    print("in range")\nelse:\n    print("out")',
    languageId: 'python',
    data: {
      options: ['in range', 'out', 'nothing', 'error'],
      correctIndex: 0,
      explanation: '10 > 5 is True and 10 < 20 is True, so the if branch runs.',
    },
  },
  comprehensionChecks: [
    {
      question: 'For score=95, which branch runs in the grade() function?',
      options: ['return "A"', 'return "B"', 'return "C"', 'return "F"'],
      correctIndex: 0,
      explanation: '95 >= 90 is True, so the first branch runs and later ones are skipped.',
    },
    {
      question: 'When does `a and b` evaluate to True?',
      options: [
        'Always',
        'When both a and b are True',
        'When either a or b is True',
        'When neither is True',
      ],
      correctIndex: 1,
      explanation: '`and` requires both operands to be True for the result to be True.',
    },
  ],
}
