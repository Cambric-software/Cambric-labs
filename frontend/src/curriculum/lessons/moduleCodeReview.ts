/**
 * Cambric Labs — Module: Code Review (Software Engineering)
 *
 * Two lessons: what good review looks for (correctness, readability,
 * maintainability), and the review workflow (small PRs, specific
 * comments, leading with questions, assuming good faith).
 */
import type { LessonDetail } from '../types'

export const codeReviewLessons: LessonDetail[] = [
  {
    id: 'lesson-what-to-review-for',
    title: 'What to Review For: Correctness, Readability, Maintainability',
    moduleId: 'module-code-review',
    languageId: 'typescript',
    difficulty: 3,
    estimatedMinutes: 11,
    summary:
      'A code review is not a style check. It asks: is this correct, will ' +
      'the next reader understand it, and will it survive contact with ' +
      'future change? Style and nits matter least; bugs and unclear ' +
      'intent matter most.',
    teachesConceptIds: ['code-review', 'static-analysis', 'readability', 'maintainability', 'code-smell'],
    prerequisiteConceptIds: ['function', 'variable', 'testing', 'version-control'],
    objectives: [
      'Prioritize bug-hunting over style in review.',
      'Spot hidden coupling, magic numbers, and unclear names.',
      'Distinguish a true issue from a preference.',
      'Leave comments that explain the why, not just the what.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'A code review is a second pair of eyes on a change before it ' +
          'merges. The point is not to enforce a house style — a linter ' +
          'does that — but to catch things machines cannot: a subtle bug, ' +
          'an unclear intent, a design that will hurt the next person. ' +
          'Good review is rare and valuable because it asks the questions ' +
          'the author was too close to ask.',
      },
      {
        kind: 'heading',
        text: 'Review in priority order',
      },
      {
        kind: 'steps',
        caption: 'Most to least important — fix bugs before nits',
        steps: [
          'Correctness: does it actually do what it claims? Edge cases, null handling, off-by-one.',
          'Design: is the abstraction right, or does it leak internals? Is the change in the right place?',
          'Readability: will a new reader understand it in 6 months? Are names honest?',
          'Tests: do the tests actually exercise the new behavior, or do they look right but prove nothing?',
          'Style/nits: formatting, micro-optimizations. Handled by the linter; mention only if it really matters.',
        ],
      },
      {
        kind: 'heading',
        text: 'Spot the real issues',
      },
      {
        kind: 'code',
        languageId: 'typescript',
        caption: 'Each line has a review smell. Can you spot them?',
        code: "function process(items: any[]) {\n  let result = 0\n  for (let i = 0; i <= items.length; i++) {        // off-by-one: <=\n    if (items[i].active == true) {                 // == not ===; .active may be undefined\n      result += items[i].value * 1.1               // magic number 1.1; what is it?\n    }\n  }\n  return result\n}\n// smells: any[] (no type), off-by-one (IndexOutOfRange), == true (loose),\n//         undefined .active/.value (no guard), magic 1.1, no tests",
      },
      {
        kind: 'callout',
        variant: 'danger',
        title: 'The off-by-one is the bug; the style is the nit',
        text:
          'A reviewer who comments on `==` vs `===` but misses `i <= length` ' +
          'has failed the review. The loop reads one past the array, ' +
          'returning NaN and silently corrupting the total. Style is ' +
          'visible; bugs hide. Hunt bugs first, then readability, then style.',
      },
      {
        kind: 'heading',
        text: 'Readability: will the next reader get it?',
      },
      {
        kind: 'compare',
        languageIds: ['typescript', 'typescript'],
        caption:
          'Magic number (opaque) vs named constant (self-documenting).',
        snippets: [
          "if (user.role === 2) { /* admin? super? what is 2? */ }",
          "const ADMIN_ROLE = 2\nif (user.role === ADMIN_ROLE) { /* now obvious */ }",
        ],
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'Names are the API you leave behind',
        text:
          'A function named `processData` tells the reader nothing. ' +
          '`normalizeUserDates` tells them exactly what it does and what ' +
          'it touches. In review, push back on vague names — they are a ' +
          'tax every future reader pays, every time.',
      },
      {
        kind: 'heading',
        text: 'Tests: do they prove the behavior?',
      },
      {
        kind: 'code',
        languageId: 'typescript',
        caption: 'A test that looks right but proves nothing.',
        code: "test('process', () => {\n  const got = process([1, 2, 3])\n  expect(got).toBeDefined()   // proves it returned, NOT that it is correct\n})\n// a real test pins the actual behavior:\ntest('sums active values with tax', () => {\n  expect(process([{active:true, value:10}])).toBe(11)\n  expect(process([{active:false, value:10}])).toBe(0)\n})",
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'Ask: would this test fail if the code were wrong?',
        text:
          'If you delete the body of the function and the test still ' +
          'passes, the test proves nothing. A good test is one that ' +
          'would fail if the behavior changed. In review, mentally ' +
          'break the code and check whether the tests catch it.',
      },
      {
        kind: 'compare',
        languageIds: ['typescript', 'typescript'],
        caption:
          'Vague (proves nothing) vs precise (pins behavior) test.',
        snippets: [
          "expect(result).toBeDefined()   // passes for almost any bug",
          "expect(result).toBe(11)        // fails if the math is wrong",
        ],
      },
    ],
    animation: {
      type: 'codeWalk',
      title: 'Reviewing a buggy function, in priority order',
      steps: [
        { caption: 'Read process(items): for i <= length. Smell 1 (correctness): off-by-one, reads past the array.' },
        { caption: 'items[i].active == true. Smell 2 (correctness): loose ==; .active may be undefined; no null guard.' },
        { caption: 'value * 1.1. Smell 3 (readability): magic number. What is 1.1? A tax rate? Ask the author to name it.' },
        { caption: 'items: any[]. Smell 4 (design): no types; the shape of an item is unknown. Push for a typed interface.' },
        { caption: 'No tests attached. Smell 5 (tests): ask for a test that would fail if the loop were wrong. Then style last.' },
      ],
    },
    activity: {
      type: 'findBug',
      title: 'Find the review-worthy bug',
      prompt:
        'Review this for correctness first. What is the real bug, not the style nit?',
      languageId: 'typescript',
      starterCode: "function firstActive(items: Item[]) {\n  for (let i = 0; i <= items.length; i++) {\n    if (items[i].active) return items[i]\n  }\n}\n// style: could use .find(). correctness: ???",
      data: {
        bug: 'Off-by-one: i <= items.length reads items[items.length], which is undefined; accessing .active on undefined throws at the end of a loop with no active item.',
        fix: 'Change i <= items.length to i < items.length, or use items.find(i => i.active).',
        explanation:
          'The style suggestion (.find) is a nit; the off-by-one is a bug. ' +
          'On an array with no active item, the loop reaches i === ' +
          'length, reads undefined, and throws on .active. Review catches ' +
          'this; a linter will not.',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'Why should correctness come before style in review?',
        options: [
          'Style does not matter.',
          'A linter can enforce style automatically, but it cannot catch subtle logic bugs like off-by-one or missing null guards; those need a human, so spend review time where machines cannot help.',
          'Style is subjective.',
          'Correctness is easier to check.',
        ],
        correctIndex: 1,
        explanation:
          'Review time is scarce. Spend it on what only humans do well: ' +
          'reasoning about edge cases, intent, and design. Let the linter ' +
          'and formatter own style. A review full of style comments that ' +
          'misses a bug has failed at its one job.',
      },
      {
        question: 'How can you tell if a test actually proves the behavior?',
        options: [
          'It has many assertions.',
          'Mentally break the code (delete or invert the logic); if the test still passes, it proves nothing. A real test fails when the behavior changes.',
          'It runs fast.',
          'It uses mocks.',
        ],
        correctIndex: 1,
        explanation:
          'expect(x).toBeDefined() passes for almost any implementation, ' +
          'including a wrong one. A test that pins behavior (expect(x).toBe(11)) ' +
          'fails the moment the math changes. In review, ask: "if I broke ' +
          'the code, would this catch me?" If not, the test is theatre.',
      },
    ],
  },
  {
    id: 'lesson-review-workflow',
    title: 'The Review Workflow: Small PRs, Questions, Good Faith',
    moduleId: 'module-code-review',
    languageId: 'typescript',
    difficulty: 3,
    estimatedMinutes: 11,
    summary:
      'How you review matters as much as what you find. Small PRs, ' +
      'specific comments, leading with questions, and assuming good ' +
      'faith turn review from an adversarial gate into the highest-' +
      'bandwidth knowledge transfer on a team.',
    teachesConceptIds: ['code-review', 'pull-request', 'pair-programming', 'communication', 'version-control'],
    prerequisiteConceptIds: ['version-control', 'testing', 'function'],
    objectives: [
      'Explain why small PRs get better reviews than large ones.',
      'Write review comments that are specific and actionable.',
      'Lead with questions before asserting the author is wrong.',
      'Separate blocking issues from suggestions.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'A 1000-line PR gets a rubber-stamp; a 50-line PR gets a real ' +
          'review. How you structure the change and frame the comments ' +
          'determines whether review catches bugs or just burns time. The ' +
          'goal is a review that is thorough without being hostile, and ' +
          'specific enough that the author can act on every comment.',
      },
      {
        kind: 'heading',
        text: 'Small PRs review better',
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'A reviewer has finite attention',
        text:
          'Studies of review find defect density drops sharply above ' +
          '~200-400 lines of diff. Past that, the reviewer skims; bugs ' +
          'hide in the skimmed parts. If a change is large, split it into ' +
          'a stack of small PRs (refactor first, then the feature), each ' +
          'reviewable in isolation.',
      },
      {
        kind: 'heading',
        text: 'Comment specifically, not generally',
      },
      {
        kind: 'compare',
        languageIds: ['typescript', 'typescript'],
        caption:
          'Vague (unactionable) vs specific (the author knows what to do).',
        snippets: [
          "// this is bad\n// \"this code is messy, clean it up\"\n// -> author does not know what you mean; defensiveness",
          "// this helps\n// \"extractUser dates is doing two things (parse + validate).\n//  Could split into parseDates + validateDates? Easier to test.\"\n// -> concrete, suggests a fix, explains why",
        ],
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'Explain the why, not just the what',
        text:
          '"Use a Set here" is an order. "Use a Set here — the array ' +
          'includes() is O(n) and this loop runs per keystroke" is a ' +
          'lesson. The author learns, the comment justifies itself, and ' +
          'next time they will reach for the Set unprompted.',
      },
      {
        kind: 'heading',
        text: 'Lead with questions',
      },
      {
        kind: 'compare',
        languageIds: ['typescript', 'typescript'],
        caption:
          'Assertion (provokes defense) vs question (invites explanation).',
        snippets: [
          "// \"this is wrong, you forgot null\"\n// -> author defends; maybe they had a reason",
          "// \"what happens here if user is null?\"\n// -> author either says 'oh, good catch' or explains a guard you missed\n// either way, no ego",
        ],
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'Assume good faith, and say so',
        text:
          'The author is not shipping a bug to annoy you. They had a ' +
          'reason, context you lack, or a deadline. "Did you intend X ' +
          'here?" gives them the benefit of the doubt and surfaces context. ' +
          'A review framed as inquiry gets better answers — and more ' +
          'learning — than one framed as indictment.',
      },
      {
        kind: 'heading',
        text: 'Blocking issues vs suggestions',
      },
      {
        kind: 'paragraph',
        text:
          'Not every comment must be addressed before merge. Distinguish ' +
          'blocking issues (bugs, security, design flaws that will hurt ' +
          'later) from suggestions (nicer naming, a cleaner abstraction). ' +
          'Block on the first; file the second as a follow-up issue. ' +
          'Blocking on everything slows the team and trains authors to ' +
          'argue rather than fix.',
      },
      {
        kind: 'compare',
        languageIds: ['typescript', 'typescript'],
        caption:
          'Blocking (must fix) vs suggestion (file as follow-up).',
        snippets: [
          "// blocking: this SQL concatenates user input -> SQL injection.\n//           do not merge until parameterized.",
          "// suggestion: consider extracting validateUserDates to its own\n//             module. Filed #482 as a follow-up; not blocking.",
        ],
      },
    ],
    animation: {
      type: 'timeline',
      title: 'A small PR vs a large PR through review',
      steps: [
        { caption: 'Small PR (50 lines): reviewer reads every line carefully, finds 2 bugs, leaves 3 specific comments with fixes.' },
        { caption: 'Large PR (1000 lines): reviewer skims after line 200, rubber-stamps, misses a null deref buried at line 700.' },
        { caption: 'Split the large change into a stack: refactor (50 lines), then feature (80 lines). Each reviewed thoroughly.' },
        { caption: 'On the feature PR, reviewer asks "what if user is null?" — a question, not an accusation. Author explains the guard at the top of the function.' },
        { caption: 'Reviewer marks the SQL-injection comment blocking; files the naming nit as a follow-up. PR merges with the bug fixed and the nit tracked.' },
      ],
    },
    activity: {
      type: 'multipleChoice',
      title: 'Blocking or suggestion?',
      prompt:
        'The PR concatenates user input into a SQL string. Is this ' +
        'blocking or a suggestion?',
      languageId: 'typescript',
      data: {
        question: 'SQL string concat: block or suggest?',
        options: [
          'Suggestion — file a follow-up.',
          'Blocking — string-concatenated SQL is an injection vector; it must be parameterized before merge, not filed for later.',
          'Neither; it is fine.',
          'Blocking only if there is no test.',
        ],
        correctIndex: 1,
        explanation:
          'Security issues are blocking: a shipped injection can be ' +
          'exploited before a follow-up is triaged. Block, explain the ' +
          'why (parameterized queries eliminate injection by separating ' +
          'code from data), and merge only after the fix. Suggestions ' +
          'are for non-critical improvements, not vulnerabilities.',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'Why do small PRs get better reviews than large ones?',
        options: [
          'Large PRs cannot be merged.',
          'Reviewer attention is finite; defect density drops above a few hundred lines because the reviewer starts skimming, letting bugs hide in the skimmed parts.',
          'Small PRs use less memory.',
          'Large PRs are always wrong.',
        ],
        correctIndex: 1,
        explanation:
          'Review is a concentration task with a sharp attention ceiling. ' +
          'Past ~200-400 lines, reviewers skim to finish, and skimmed ' +
          'code is unreviewed code. Splitting large changes into a stack ' +
          'of small, independently-reviewable PRs keeps every line in the ' +
          'high-attention zone.',
      },
      {
        question: 'What makes a review comment actionable rather than vague?',
        options: [
          'It uses strong language.',
          'It points to a specific location, describes the concrete problem, suggests a fix, and explains the why so the author can decide and learn.',
          'It is short.',
          'It has no punctuation.',
        ],
        correctIndex: 1,
        explanation:
          '"This is messy" is unactionable — the author does not know ' +
          'what to change. "This does two things; splitting into parse + ' +
          'validate would make it testable" is actionable: specific ' +
          'location, concrete problem, suggested fix, and the reason. The ' +
          'author can act and learns the principle for next time.',
      },
    ],
  },
]
