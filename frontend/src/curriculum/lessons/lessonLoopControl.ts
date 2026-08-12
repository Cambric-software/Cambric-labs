/**
 * Cambric Labs — Lesson: Loop Control (break & continue)
 *
 * Teaches the two control-flow statements that alter loop execution mid-body:
 * break (exit immediately) and continue (skip to the next iteration). Fills a
 * genuine gap in the fundamentals path — the loops lesson teaches for/while
 * but never covers how to exit early or skip iterations, which is the natural
 * next question a beginner has after writing their first loop.
 */
import type { LessonDetail } from '../types'

export const lessonLoopControl: LessonDetail = {
  id: 'lesson-loop-control',
  title: 'Loop Control: Breaking Out and Skipping Ahead',
  moduleId: 'module-control-flow',
  languageId: 'python',
  difficulty: 2,
  estimatedMinutes: 9,
  summary:
    'Use break to exit a loop early and continue to skip an iteration. ' +
    'Covers when each is clearer than a flag variable and the readability cost of overusing them.',
  teachesConceptIds: ['break-continue', 'loop', 'for-loop', 'while-loop'],
  prerequisiteConceptIds: ['loop', 'for-loop', 'conditional'],
  objectives: [
    'Use break to exit a loop before its natural end.',
    'Use continue to skip the rest of the current iteration.',
    'Recognize when break/continue is clearer than a flag variable.',
    'Avoid the readability trap of overusing break/continue.',
  ],
  content: [
    {
      kind: 'paragraph',
      text:
        'Sometimes a loop should not run to completion. You might be searching ' +
        'a list for one item and want to stop the moment you find it. Or you ' +
        'might want to skip entries that do not meet a condition. The two ' +
        'control-flow statements break and continue exist for exactly these ' +
        'cases — they let you alter the loop\'s flow without restructuring it.',
    },
    {
      kind: 'heading',
      text: 'break: exit the loop now',
    },
    {
      kind: 'paragraph',
      text:
        'When execution hits a break statement, the loop ends immediately. ' +
        'Control jumps to the line after the loop. No more iterations run, ' +
        'even if the loop condition is still true or the for-range has not ' +
        'finished.',
    },
    {
      kind: 'codeWithOutput',
      languageId: 'python',
      code: 'numbers = [3, 7, 2, 8, 1, 9, 4]\ntarget = 8\nfor n in numbers:\n    print("checking", n)\n    if n == target:\n        print("found", target)\n        break\nprint("done")',
      output: 'checking 3\nchecking 7\nchecking 2\nchecking 8\nfound 8\ndone',
    },
    {
      kind: 'callout',
      variant: 'info',
      text:
        'Without break, the loop would keep checking 1, 9, and 4 after finding ' +
        'the 8 — wasted work. break makes the intent explicit: "stop searching ' +
        'once you find it." This is the search pattern: iterate, test, break.',
    },
    {
      kind: 'heading',
      text: 'continue: skip to the next iteration',
    },
    {
      kind: 'paragraph',
      text:
        'When execution hits continue, the rest of the current iteration is ' +
        'skipped. The loop immediately moves to the next iteration (re-checking ' +
        'the while condition, or advancing to the next value in the for-range). ' +
        'Use it to skip entries you do not want to process.',
    },
    {
      kind: 'codeWithOutput',
      languageId: 'python',
      code: 'values = [10, -5, 20, -3, 15]\nfor v in values:\n    if v < 0:\n        continue\n    print("positive:", v)',
      output: 'positive: 10\npositive: 20\npositive: 15',
    },
    {
      kind: 'paragraph',
      text:
        'When v is negative, continue skips the print and moves to the next ' +
        'value. The negative entries are never printed. You could achieve the ' +
        'same by putting the print inside an if — but when the "skip" condition ' +
        'is simple and the "process" body is long, continue at the top reads ' +
        'more clearly because it flattens the indentation.',
    },
    {
      kind: 'heading',
      text: 'When is break/continue clearer than a flag?',
    },
    {
      kind: 'paragraph',
      text:
        'A common beginner pattern is to use a boolean flag to control the loop ' +
        'instead of break. Both work, but the flag version adds a variable you ' +
        'must keep in sync with the loop logic. break expresses the intent ' +
        'locally and immediately.',
    },
    {
      kind: 'compare',
      languageIds: ['python', 'python'],
      caption: 'Flag variable vs break — same intent, different clarity',
      snippets: [
        'found = False\nfor n in nums:\n    if n == target:\n        found = True\n    else:\n        print(n)\n# found is True but the loop ran to the end',
        'for n in nums:\n    if n == target:\n        break\n    print(n)\n# loop stopped early; no flag to track',
      ],
    },
    {
      kind: 'callout',
      variant: 'warning',
      text:
        'The flag version keeps iterating after finding the target (wasted work) ' +
        'and forces every iteration through the else branch. The break version ' +
        'stops immediately and keeps the loop body flat. Prefer break for ' +
        '"stop searching" intent.',
    },
    {
      kind: 'heading',
      text: 'The readability trap',
    },
    {
      kind: 'paragraph',
      text:
        'break and continue are jumps — they move control to a non-adjacent line. ' +
        'A loop with five break statements at different nesting depths is hard to ' +
        'follow because the reader must scan every line to know when the loop can ' +
        'exit. The rule of thumb: use break/continue when they make the single ' +
        'exit point obvious (one break at the top level, or a continue guard at ' +
        'the start of the body). If you need complex multi-condition exits, a ' +
        'while loop with an explicit condition is often clearer than buried breaks.',
    },
    {
      kind: 'callout',
      variant: 'info',
      text:
        'In nested loops, break only exits the innermost loop. To exit all ' +
        'levels, restructure with a function + return, or use a flag checked ' +
        'by each loop level. Python has no labeled break (unlike Java).',
    },
  ],
  animation: {
    type: 'codeWalk',
    title: 'break vs continue: where does control go?',
    steps: [
      { caption: 'Loop: for v in [10, -5, 20]. Iteration 1: v = 10.', highlightLines: [1] },
      { caption: '10 < 0? No. Skip the continue. Print "positive: 10".', highlightLines: [2, 5] },
      { caption: 'Iteration 2: v = -5. -5 < 0? Yes — hit continue. Skip the print. Jump to next iteration.', highlightLines: [2, 3, 4] },
      { caption: 'Iteration 3: v = 20. 20 < 0? No. Print "positive: 20". Loop ends naturally.', highlightLines: [2, 5] },
      { caption: 'Output: only 10 and 20 were printed. The continue skipped -5 entirely — the print line never ran for it.', highlightLines: [5] },
    ],
  },
  activity: {
    type: 'codeChallenge',
    title: 'Sum only the positive numbers',
    prompt:
      'Given a list of numbers, use a for loop with continue to skip negatives ' +
      'and sum only the positive values. The list is [5, -2, 8, -1, 3]. ' +
      'Print the sum (should be 16).',
    languageId: 'python',
    starterCode: 'nums = [5, -2, 8, -1, 3]\ntotal = 0\nfor n in nums:\n    # skip negatives with continue\n\n\nprint(total)',
    checks: [
      { description: 'Uses continue.', assertion: { kind: 'contains', value: 'continue' } },
      { description: 'Prints 16.', assertion: { kind: 'outputEquals', value: '16' } },
    ],
  },
  comprehensionChecks: [
    {
      question: 'What does `break` do inside a for loop?',
      options: [
        'Skips the current iteration and moves to the next one.',
        'Exits the loop entirely; no more iterations run.',
        'Restarts the loop from the first iteration.',
        'Pauses the loop for one second.',
      ],
      correctIndex: 1,
      explanation:
        'break exits the loop immediately. Control jumps to the line after the ' +
        'loop. Even if the for-range has values left, they are never visited.',
    },
    {
      question: 'What does `continue` do inside a for loop?',
      options: [
        'Exits the loop entirely.',
        'Skips the rest of the current iteration and moves to the next value.',
        'Breaks out of all nested loops.',
        'Repeats the current iteration from the top.',
      ],
      correctIndex: 1,
      explanation:
        'continue skips the remaining statements in the current iteration and ' +
        'advances to the next value in the for-range. The loop itself continues.',
    },
    {
      question:
        'You are searching a sorted list for the first value > 100. After finding it, ' +
        'what should you do to avoid checking the remaining elements?',
      options: [
        'Use continue to skip the rest.',
        'Use break to stop the loop.',
        'Nothing — let the loop finish; it is the same cost.',
        'Use a flag variable instead of either.',
      ],
      correctIndex: 1,
      explanation:
        'Once you find the first value > 100, there is no reason to keep scanning. ' +
        'break exits the loop immediately, saving the work of checking every ' +
        'remaining element. continue would skip just the current iteration and ' +
        'keep going, which is the opposite of what you want.',
    },
  ],
}
