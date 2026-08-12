/**
 * Cambric Labs — Lesson: Variables (Intro)
 *
 * A genuinely educational first lesson. It establishes what a variable is,
 * why assignment works the way it does, and contrasts Python with a
 * statically-typed language so the concept — not the syntax — sticks.
 */
import type { LessonDetail } from '../types'

export const lessonVariablesIntro: LessonDetail = {
  id: 'lesson-variables-intro',
  title: 'Variables: Naming Values',
  moduleId: 'module-variables',
  languageId: 'python',
  difficulty: 1,
  estimatedMinutes: 8,
  summary:
    'A variable is a name you bind to a value so you can refer to it later. ' +
    'This lesson covers assignment, naming rules, and reassignment.',
  teachesConceptIds: ['variable', 'assignment', 'literal'],
  prerequisiteConceptIds: ['statement'],
  objectives: [
    'Bind a value to a name using assignment.',
    'Choose valid, readable variable names.',
    'Explain why reassignment changes which value a name refers to.',
    'Reassign a variable and trace what the name refers to afterward.',
  ],
  content: [
    {
      kind: 'paragraph',
      text:
        'A variable is a name you attach to a value. Instead of repeating the ' +
        'same number or text everywhere, you give it a name once and reuse that ' +
        'name. When the value changes, you change it in one place.',
    },
    {
      kind: 'heading',
      text: 'Assignment binds a name to a value',
    },
    {
      kind: 'paragraph',
      text:
        'In Python, the equals sign does not mean "these two things are equal". ' +
        'It means "take the value on the right and bind the name on the left to it". ' +
        'The right side is evaluated first, then assigned to the name on the left.',
    },
    {
      kind: 'codeWithOutput',
      languageId: 'python',
      caption: 'Binding names to values and reading them back.',
      code: 'age = 30\nname = "Cam"\nprint(name, "is", age)',
      output: 'Cam is 30',
    },
    {
      kind: 'callout',
      variant: 'tip',
      title: 'Read it right-to-left',
      text:
        'Think of `age = 30` as "age gets 30", not "age equals 30". That reading ' +
        'reminds you the right side is computed first, then stored under the name.',
    },
    {
      kind: 'heading',
      text: 'Names have rules',
    },
    {
      kind: 'paragraph',
      text:
        'A variable name must start with a letter or underscore, contain letters, ' +
        'digits, or underscores, and must not be a reserved word. Names are ' +
        'case-sensitive: `Age` and `age` are different variables.',
    },
    {
      kind: 'code',
      languageId: 'python',
      caption: 'Valid and invalid names.',
      code:
        '# valid\nuser_name = "ada"\n_private = 1\ntotal2 = 2\n\n# invalid (would error)\n# 2nd_place = 5   # starts with a digit\n# my-name = "x"   # hyphen not allowed\n# class = "x"     # reserved word',
    },
    {
      kind: 'heading',
      text: 'Reassignment changes what a name refers to',
    },
    {
      kind: 'paragraph',
      text:
        'You can point an existing name at a new value. The old value is not ' +
        'magically merged — the name simply refers to the new value now. The ' +
        'order of statements matters: later assignments overwrite earlier ones.',
    },
    {
      kind: 'codeWithOutput',
      languageId: 'python',
      caption: 'Tracing a name through several reassignments.',
      code: 'count = 1\nprint(count)  # 1\ncount = 2\nprint(count)  # 2\ncount = count + 3\nprint(count)  # 5',
      output: '1\n2\n5',
    },
    {
      kind: 'callout',
      variant: 'warning',
      title: 'count = count + 3 is not algebra',
      text:
        'In math, `count = count + 3` is false. In programming it reads as ' +
        '"evaluate the right side (the current count plus 3), then store the ' +
        'result under count". This compound-assignment pattern is everywhere.',
    },
    {
      kind: 'compare',
      languageIds: ['python', 'typescript'],
      caption:
        'Python binds names dynamically; TypeScript also requires a type. ' +
        'The concept (name -> value) is the same; only the ceremony differs.',
      snippets: [
        'age = 30        # type inferred\nage = "thirty"   # allowed: name rebinds',
        'let age = 30;   // type inferred as number\n// age = "thirty"; // ERROR: string not assignable to number',
      ],
    },
  ],
  animation: {
    type: 'codeWalk',
    title: 'Tracing reassignment step by step',
    steps: [
      { caption: 'count = 1 — the name count now refers to 1.', highlightLines: [1] },
      { caption: 'print(count) reads the value count refers to: 1.', highlightLines: [2] },
      { caption: 'count = 2 — count now refers to 2; the old 1 is gone.', highlightLines: [3] },
      {
        caption: 'count = count + 3 — right side evaluated first (2 + 3 = 5), then stored.',
        highlightLines: [5],
      },
      { caption: 'print(count) reads 5.', highlightLines: [6] },
    ],
  },
  activity: {
    type: 'codeChallenge',
    title: 'Bind and reassign',
    prompt:
      'Create a variable named `score` with value 10, then increase it by 5 ' +
      'using `score = score + 5`. The final printed value must be 15.',
    languageId: 'python',
    starterCode: '# Create score = 10\n\n# Increase it by 5\n\n\nprint(score)',
    checks: [
      { description: 'A variable named score is created.', assertion: { kind: 'contains', value: 'score' } },
      { description: 'The code reassigns score using its current value.', assertion: { kind: 'contains', value: 'score = score' } },
      { description: 'The program prints 15.', assertion: { kind: 'outputEquals', value: '15' } },
    ],
  },
  comprehensionChecks: [
    {
      question: 'In `x = 5`, what does the = do?',
      options: [
        'Tests whether x is equal to 5.',
        'Binds the name x to the value 5.',
        'Creates a mathematical equation.',
        'Prints x and 5.',
      ],
      correctIndex: 1,
      explanation:
        'In Python, = is assignment: it binds the name on the left to the value ' +
        'on the right. Equality testing uses ==.',
    },
    {
      question: 'After `n = 1` then `n = 2`, what does n refer to?',
      options: ['1', '2', '3', 'Both 1 and 2'],
      correctIndex: 1,
      explanation: 'Reassignment points the name at the new value. The name now refers to 2.',
    },
  ],
}
