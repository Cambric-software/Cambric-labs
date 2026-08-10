/**
 * Cambric Labs — Lesson: Strings
 *
 * Teaches strings as immutable sequences of characters. The genuine insight
 * here is immutability and that "changing" a string always builds a new one.
 * Avoids the shallow "string methods tour" by anchoring on the immutability
 * concept and the slice/chaining pattern.
 */
import type { LessonDetail } from '../types'

export const lessonStrings: LessonDetail = {
  id: 'lesson-strings',
  title: 'Strings: Text as Immutable Sequences',
  moduleId: 'module-collections',
  languageId: 'python',
  difficulty: 2,
  estimatedMinutes: 11,
  summary:
    'Treat text as a sequence of characters, slice it, and understand why ' +
    'strings are immutable — operations return new strings.',
  teachesConceptIds: ['string', 'string-method', 'index', 'immutability'],
  prerequisiteConceptIds: ['variable', 'type', 'collection'],
  objectives: [
    'Slice a string to extract a substring using start:end.',
    'Explain why modifying a string builds a new string rather than mutating.',
    'Chain string methods and reason about the result.',
    'Split and join strings to move between text and lists.',
  ],
  content: [
    {
      kind: 'paragraph',
      text:
        'A string is a sequence of characters representing text. You index and ' +
        'slice it like a list, but with one crucial rule: strings are immutable. ' +
        'No operation changes a string in place — every "change" produces a new ' +
        'string and leaves the original intact.',
    },
    {
      kind: 'heading',
      text: 'Slicing extracts a substring',
    },
    {
      kind: 'codeWithOutput',
      languageId: 'python',
      caption: 'Slicing with start:end (end is exclusive).',
      code: 'name = "Cambric"\nprint(name[0:3])   # Cam\nprint(name[4:])    # ric (to end)\nprint(name[:4])    # Cambr (from start)',
      output: 'Cam\nric\nCambr',
    },
    {
      kind: 'callout',
      variant: 'info',
      title: 'Slice end is exclusive',
      text:
        'name[0:3] gives characters at indices 0, 1, 2 — three characters, not ' +
        'four. The end index is the first position NOT included. This matches ' +
        'range(0,3) and means len(name[0:3]) == 3 - 0.',
    },
    {
      kind: 'heading',
      text: 'Immutability: you cannot edit a string in place',
    },
    {
      kind: 'paragraph',
      text:
        'Unlike a list, you cannot do name[0] = "c". That would mutate the ' +
        'string, but strings are immutable. Instead you build a new string: ' +
        'name.lower() returns a lowercase copy; the original stays unchanged.',
    },
    {
      kind: 'codeWithOutput',
      languageId: 'python',
      caption: 'Methods return new strings; the original is untouched.',
      code: 'greeting = "Hello"\nshout = greeting.upper()\nprint(greeting)  # Hello (unchanged)\nprint(shout)     # HELLO',
      output: 'Hello\nHELLO',
    },
    {
      kind: 'callout',
      variant: 'warning',
      title: 'Forgetting the return value',
      text:
        'greeting.upper() alone does nothing to greeting. The new string is ' +
        'returned and discarded unless you assign it. This is the #1 beginner ' +
        'mistake with immutable strings: calling a method and expecting the ' +
        'original to change.',
    },
    {
      kind: 'heading',
      text: 'Chaining methods',
    },
    {
      kind: 'paragraph',
      text:
        'Because each method returns a new string, you can chain them. Read ' +
        'the chain left to right: the output of one method feeds the next.',
    },
    {
      kind: 'codeWithOutput',
      languageId: 'python',
      caption: 'Chain: strip whitespace, then lowercase, then capitalize.',
      code: 'raw = "  HeLLo  "\nclean = raw.strip().lower().capitalize()\nprint(repr(clean))  # \'Hello\'',
      output: "'Hello'",
    },
    {
      kind: 'heading',
      text: 'Split and join: text <-> list',
    },
    {
      kind: 'codeWithOutput',
      languageId: 'python',
      caption: 'split breaks text into a list; join glues a list into text.',
      code: 'sentence = "a,b,c"\nparts = sentence.split(",")\nprint(parts)          # [\'a\', \'b\', \'c\']\nagain = "-".join(parts)\nprint(again)         # a-b-c',
      output: "['a', 'b', 'c']\na-b-c",
    },
    {
      kind: 'compare',
      languageIds: ['python', 'typescript'],
      caption:
        'Immutability holds across languages: JS strings are also immutable and ' +
        'return new strings from methods. The method names differ (toUpperCase ' +
        'vs upper) but the concept is identical.',
      snippets: [
        's = "hi"\ns2 = s.upper()   # new string\n# s[0] = "H"     # TypeError: strings immutable\nprint(s, s2)      # hi HI',
        'const s = "hi";\nconst s2 = s.toUpperCase(); // new string\n// s[0] = "H";  // silent no-op, strings immutable\nconsole.log(s, s2); // hi HI',
      ],
    },
  ],
  animation: {
    type: 'dataFlow',
    title: 'A method call returns a new string',
    steps: [
      { caption: 'greeting = "Hello" lives in memory.', highlightLines: [] },
      { caption: 'Call greeting.upper(). Python builds a brand-new string "HELLO".', highlightLines: [] },
      { caption: 'upper() returns that new string. greeting itself is never touched.', highlightLines: [] },
      { caption: 'shout = greeting.upper() binds the name shout to the new string.', highlightLines: [] },
      { caption: 'Now two strings exist: greeting="Hello" and shout="HELLO". The original is preserved.', highlightLines: [] },
    ],
  },
  activity: {
    type: 'codeChallenge',
    title: 'Normalize a name',
    prompt:
      'Given `raw = "  aDa  "`, produce the string "Ada" (strip whitespace, ' +
      'then lowercase, then capitalize). Print it. The output must be Ada.',
    languageId: 'python',
    starterCode: 'raw = "  aDa  "\n# strip, lowercase, capitalize\n\nprint(raw)',
    checks: [
      { description: 'Uses .strip()', assertion: { kind: 'contains', value: '.strip()' } },
      { description: 'Uses .lower()', assertion: { kind: 'contains', value: '.lower()' } },
      { description: 'Uses .capitalize()', assertion: { kind: 'contains', value: '.capitalize()' } },
      { description: 'Prints Ada', assertion: { kind: 'outputContains', value: 'Ada' } },
    ],
  },
  comprehensionChecks: [
    {
      question: 'After `s = "hi"; s.upper()`, what is s?',
      options: ['HI', 'hi', 'Error', 'Hi'],
      correctIndex: 1,
      explanation:
        'Strings are immutable. s.upper() returns a new string "HI" but does ' +
        'not change s. You must assign: s = s.upper() to update s.',
    },
    {
      question: 'What does `"abcde"[1:3]` return?',
      options: ['"abc"', '"bc"', '"bcd"', '"ab"'],
      correctIndex: 1,
      explanation:
        'The slice end is exclusive: indices 1 and 2 give "bc" (two characters). ' +
        'len("abcde"[1:3]) == 3 - 1 == 2.',
    },
  ],
}
