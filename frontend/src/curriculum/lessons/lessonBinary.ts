/**
 * Cambric Labs — Lesson: Binary
 *
 * Teaches binary as the representation underneath all computing. Avoids the
 * "memorize place values" treatment by connecting binary to the physical
 * reality (switches), showing why computers use it, and having the learner
 * convert between binary and decimal by REASONING, not memorizing.
 */
import type { LessonDetail } from '../types'

export const lessonBinary: LessonDetail = {
  id: 'lesson-binary',
  title: 'Binary: How Computers Count Without Digits',
  moduleId: 'module-binary-and-data',
  languageId: 'pseudo',
  difficulty: 2,
  estimatedMinutes: 12,
  summary:
    'Why computers use only 0 and 1, how binary place values work, and how ' +
    'to convert between binary and decimal by reasoning.',
  teachesConceptIds: ['binary', 'type'],
  prerequisiteConceptIds: [],
  objectives: [
    'Explain why computers represent data with only two symbols.',
    'Read a binary number using place values (1, 2, 4, 8, ...).',
    'Convert a small binary number to decimal by hand.',
    'Convert a small decimal number to binary by repeated subtraction.',
  ],
  content: [
    {
      kind: 'paragraph',
      text:
        'A computer has no fingers. It cannot count to ten. What it DOES have ' +
        'are billions of tiny switches called transistors, and each switch is ' +
        'either ON or OFF. Two states. That is why every piece of data inside ' +
        'a computer — text, images, numbers, your code — is ultimately stored ' +
        'as patterns of ON and OFF.',
    },
    {
      kind: 'callout',
      variant: 'info',
      title: 'Two states is not a limitation — it is the foundation',
      text:
        'We name the two states 0 (OFF) and 1 (ON). A single 0-or-1 value is ' +
        'called a BIT. Everything else is built by combining bits: 8 bits make ' +
        'a byte, and bytes make up every file on your computer. The choice of ' +
        'two symbols is not arbitrary — it is the only reliable way to store ' +
        'information in physical hardware.',
    },
    {
      kind: 'heading',
      text: 'Binary place values: exactly like decimal, but with 2 instead of 10',
    },
    {
      kind: 'paragraph',
      text:
        'In decimal, the rightmost digit is the 1s place, then 10s, then 100s. ' +
        'Each place is 10× the one before it because there are 10 digits (0-9). ' +
        'In binary, the rightmost bit is the 1s place, then 2s, then 4s, then ' +
        '8s. Each place is 2× the one before it because there are only 2 digits ' +
        '(0 and 1). That is the ONLY difference.',
    },
    {
      kind: 'codeWithOutput',
      languageId: 'pseudo',
      caption: 'Place values for a 4-bit binary number. Read right to left: 1, 2, 4, 8.',
      code:
        'Place:    8   4   2   1\nBit:      1   0   1   1\n\nValue = 8(1) + 4(0) + 2(1) + 1(1)\n      = 8 + 0 + 2 + 1\n      = 11 in decimal',
      output: '1011 in binary = 11 in decimal',
    },
    {
      kind: 'callout',
      variant: 'tip',
      title: 'The method: multiply each bit by its place value, then add',
      text:
        'A 1 in a place means "count this place." A 0 means "skip it." So 1011 ' +
        'means: count the 8s place, skip the 4s, count the 2s, count the 1s. ' +
        'Add up what you counted: 8 + 2 + 1 = 11. That is the entire conversion.',
    },
    {
      kind: 'heading',
      text: 'Converting decimal to binary: subtract the largest power of 2',
    },
    {
      kind: 'paragraph',
      text:
        'To go the other way, repeatedly subtract the LARGEST power of 2 that ' +
        'fits. Each time you can subtract, write a 1 in that place. Each time ' +
        'you cannot, write a 0. This is the same idea as making change with ' +
        'the fewest coins.',
    },
    {
      kind: 'codeWithOutput',
      languageId: 'pseudo',
      caption: 'Convert 13 to binary. Powers of 2 available: 8, 4, 2, 1.',
      code:
        '13 - 8 = 5   →  bit for 8 = 1\n 5 - 4 = 1   →  bit for 4 = 1\n 1 - 2  (no, 2 > 1) →  bit for 2 = 0\n 1 - 1 = 0   →  bit for 1 = 1\n\nReading 8,4,2,1 places: 1 1 0 1',
      output: '13 in decimal = 1101 in binary',
    },
    {
      kind: 'paragraph',
      text:
        'Check: 8 + 4 + 0 + 1 = 13. Correct. The key insight: binary is not a ' +
        'separate number system that requires memorization — it is the same ' +
        'place-value system you already know, just with a base of 2 instead of 10.',
    },
    {
      kind: 'heading',
      text: 'Why this matters for programming',
    },
    {
      kind: 'paragraph',
      text:
        'Understanding binary explains several things you will meet as a ' +
        'programmer: why numbers have SIZE LIMITS (a 32-bit integer can only ' +
        'represent 2^32 distinct values), why bitwise operators work the way ' +
        'they do, and why some decimal fractions like 0.1 are not exactly ' +
        'representable (their binary expansion repeats forever, just as 1/3 ' +
        'repeats in decimal).',
    },
    {
      kind: 'callout',
      variant: 'warning',
      title: '0.1 + 0.2 is not 0.3 — and binary is why',
      text:
        'In Python, 0.1 + 0.2 prints 0.30000000000000004. This is not a bug. ' +
        'The decimal 0.1 has no exact finite binary representation (it is ' +
        '0.0001100110011... in binary), so the computer stores the closest ' +
        'approximation. When you add two approximations, the tiny error shows. ' +
        'Every language using binary floating point has this, not just Python.',
    },
    {
      kind: 'compare',
      languageIds: ['python', 'javascript'],
      caption:
        'Binary representation is universal — every language exposes the same ' +
        'underlying binary reality. Here both show the floating-point artifact.',
      snippets: [
        'print(0.1 + 0.2)        # 0.30000000000000004\nprint(bin(13))          # 0b1101\nprint(13 == 0b1101)     # True',
        'console.log(0.1 + 0.2);  // 0.30000000000000004\nconsole.log(13 .toString(2)); // "1101"\nconsole.log(0b1101 === 13);    // true',
      ],
    },
  ],
  animation: {
    type: 'dataFlow',
    title: 'Converting 1011 to decimal',
    steps: [
      { caption: 'Start with 1011. Place values (right to left): 1, 2, 4, 8.', highlightLines: [1] },
      { caption: 'Rightmost bit is 1 → count 1 × 1 = 1. Running total: 1.', highlightLines: [2] },
      { caption: 'Next bit is 1 → count 1 × 2 = 2. Running total: 3.', highlightLines: [3] },
      { caption: 'Next bit is 0 → skip the 4s place. Running total: 3.', highlightLines: [4] },
      { caption: 'Leftmost bit is 1 → count 1 × 8 = 8. Running total: 11.', highlightLines: [5] },
      { caption: '1011 binary = 11 decimal. Done.', highlightLines: [6] },
    ],
  },
  activity: {
    type: 'predictOutput',
    title: 'What is 11010 in decimal?',
    prompt: 'Convert the binary number 11010 to decimal. Use the place values 16, 8, 4, 2, 1.',
    languageId: 'pseudo',
    data: {
      options: ['25', '26', '22', '52'],
      correctIndex: 1,
      explanation: '16(1) + 8(1) + 4(0) + 2(1) + 1(0) = 16 + 8 + 0 + 2 + 0 = 26.',
    },
  },
  comprehensionChecks: [
    {
      question: 'Why do computers use binary instead of decimal?',
      options: [
        'Binary numbers are faster to calculate',
        'Hardware can reliably store only two states (on/off)',
        'Decimal requires too much memory',
        'It is a historical accident that was never fixed',
      ],
      correctIndex: 1,
      explanation:
        'Physical switches are either on or off. Two states is the most reliable ' +
        'representation in hardware. More states would be harder to distinguish ' +
        'reliably, leading to errors.',
    },
    {
      question: 'What is the place value of the 4th bit from the right in a binary number?',
      options: ['4', '8', '10', '16'],
      correctIndex: 1,
      explanation:
        'Places go 1, 2, 4, 8, 16, ... right to left. The 4th position from the ' +
        'right is the 8s place (2^3 = 8).',
    },
    {
      question: 'In Python, why does 0.1 + 0.2 not equal exactly 0.3?',
      options: [
        'Python has a bug in its math library',
        '0.1 has no exact finite binary representation',
        'Floating point only works for integers',
        'The + operator loses precision by design',
      ],
      correctIndex: 1,
      explanation:
        '0.1 in binary is 0.000110011... (repeating). It cannot be stored ' +
        'exactly, so the computer uses the nearest approximation. Adding two ' +
        'approximations exposes the tiny error.',
    },
  ],
}
