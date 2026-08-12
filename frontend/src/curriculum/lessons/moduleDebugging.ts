/**
 * Cambric Labs — Module: Debugging (Software Engineering)
 *
 * Two lessons: the systematic method (reproduce, isolate, hypothesize,
 * test), and the toolbox (print, debugger, binary search, rubber duck).
 */
import type { LessonDetail } from '../types'

export const debuggingLessons: LessonDetail[] = [
  {
    id: 'lesson-debugging-method',
    title: 'The Debugging Method: Reproduce, Isolate, Hypothesize',
    moduleId: 'module-debugging',
    languageId: 'python',
    difficulty: 3,
    estimatedMinutes: 12,
    summary:
      'Debugging is not guessing. It is a loop: reproduce reliably, ' +
      'isolate the smallest input that fails, form a falsifiable ' +
      'hypothesis, and run an experiment that could prove you wrong. ' +
      'Each step shrinks where the bug can hide.',
    teachesConceptIds: ['debugging', 'debugging-strategy', 'reproducibility', 'hypothesis-testing', 'root-cause'],
    prerequisiteConceptIds: ['function', 'variable', 'testing', 'console-io'],
    objectives: [
      'Build a minimal reproducible case before changing code.',
      'Bisect input and history to isolate the trigger.',
      'Form a falsifiable hypothesis and run a discriminating experiment.',
      'Avoid the "change things until it works" anti-pattern.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'The worst debugging strategy is also the most common: stare at ' +
          'the code, change something, run it, repeat. This is random ' +
          'mutation testing with a human as the mutator. Systematic ' +
          'debugging replaces guesswork with a shrinking loop: make the bug ' +
          'reproducible, then narrow where it can be, one experiment at a ' +
          'time, until only the cause remains.',
      },
      {
        kind: 'heading',
        text: 'Step 1: reproduce reliably',
      },
      {
        kind: 'callout',
        variant: 'danger',
        title: 'No repro, no fix',
        text:
          'If you cannot make the bug happen on demand, you cannot tell ' +
          'whether your fix worked. The first job is always to find a ' +
          'sequence — inputs, state, timing — that triggers it every time. ' +
          'A flaky bug you "fixed" by accident will come back. Build the ' +
          'repro first; everything depends on it.',
      },
      {
        kind: 'code',
        languageId: 'python',
        caption: 'Distill the failing case to the smallest input that still triggers.',
        code: "# bug: 'sometimes totals are wrong'\n# BAD: change the sum loop, hope, ship\n# GOOD: find ONE input that fails, every time\n\nassert process([{'active': True, 'value': 10}]) == 11, 'got wrong total'\n# now you have a repro: a test that fails NOW and passes when fixed\n# this test is the only proof a fix is real",
      },
      {
        kind: 'heading',
        text: 'Step 2: isolate — bisect the trigger',
      },
      {
        kind: 'paragraph',
        text:
          'Once you have a repro, shrink it. Does it fail with 3 items or ' +
          'just 100? With active=True or any value? With value=10 or only ' +
          'odd numbers? Each "does it still fail if I cut X?" halves where ' +
          'the bug can be. The smallest failing input points straight at ' +
          'the code path.',
      },
      {
        kind: 'code',
        languageId: 'python',
        caption: 'Bisect the input until the minimal failing case emerges.',
        code: "# failing input: 100 items, mixed active, mixed values\n# cut items in half -> still fails with 50? keep cutting\n# -> fails with 3? with 1? here is the minimal case:\nassert process([{'active': True, 'value': 1}]) == 1.1\n# now: the bug only needs ONE active item with value 1 to go wrong\n# the search space collapsed from '100 items, anything' to 'one item'",
      },
      {
        kind: 'heading',
        text: 'Step 3: hypothesize — and make it falsifiable',
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'A hypothesis is a prediction',
        text:
          '"I think the loop reads one past the array" is a hypothesis. ' +
          'It predicts something observable: at i === length, items[i] is ' +
          'undefined, and .active throws. Run the experiment — print i at ' +
          'the crash, or set a breakpoint — and check. If the prediction is ' +
          'wrong, you learned something; update the hypothesis. If right, ' +
          'you found the cause.',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'Run the discriminating experiment: does i reach len(items)?',
        code: "def process(items):\n    total = 0\n    for i in range(len(items) + 1):    # hypothesis: <= not <\n        print(i, len(items))           # EXPERIMENT: log the indices\n        if items[i].active:\n            total += items[i].value * 1.1\n    return total\n\nprocess([{'active': True, 'value': 1}])\n# output ends with: 1 1   then IndexError",
        output: "0 1\n1 1\nIndexError: list index out of range",
      },
      {
        kind: 'callout',
        variant: 'success',
        title: 'The prediction matched — the hypothesis is the cause',
        text:
          'i reached len(items), items[1] on a length-1 list is undefined, ' +
          '.active threw. The bug is `range(len(items) + 1)` (should be ' +
          'range(len(items))). You did not guess; you predicted an ' +
          'observable, observed it, and the cause was proven.',
      },
      {
        kind: 'heading',
        text: 'Step 4: fix and pin with a test',
      },
      {
        kind: 'code',
        languageId: 'python',
        caption: 'The repro test now guards against regression forever.',
        code: "# the fix\nfor i in range(len(items)):   # +1 removed\n# the proof: the minimal repro from step 1 now passes\nassert process([{'active': True, 'value': 1}]) == 1.1\n# and the edge that triggered it (empty list) is covered:\nassert process([]) == 0\n# future code that reintroduces the +1 will FAIL this test",
      },
      {
        kind: 'compare',
        languageIds: ['python', 'python'],
        caption:
          'Random mutation (change and hope) vs hypothesis-driven debugging.',
        snippets: [
          "# GUESS: 'maybe it is the loop' -> change -> run -> still wrong -> guess again\n# slow, no learning, often introduces new bugs",
          "# METHOD: repro -> bisect -> hypothesize -> experiment -> fix -> pin\n# each step narrows the space; the fix is proven by a test",
        ],
      },
    ],
    animation: {
      type: 'timeline',
      title: 'Systematic debugging: shrinking where the bug hides',
      steps: [
        { caption: 'Report: "totals are sometimes wrong." Cannot fix yet — it is flaky.' },
        { caption: 'Reproduce: find ONE input that fails every time: [{active:True, value:1}] -> 1.1 instead of 1.1... wait, it returns IndexError. Repro locked in.' },
        { caption: 'Isolate: cut 100 items to 1. Still fails with one active item. Minimal case found.' },
        { caption: 'Hypothesize: "the loop reads past the array." Predict: i reaches len(items).' },
        { caption: 'Experiment: log i. Output: 0,1 then IndexError at i=1 on a length-1 list. Prediction matched — cause proven. Fix range(len+1) -> range(len). Pin with the repro test.' },
      ],
    },
    activity: {
      type: 'ordering',
      title: 'Order the debugging steps',
      prompt:
        'Put the debugging method in the right order.',
      languageId: 'python',
      data: {
        items: [
          'Hypothesize and run a discriminating experiment',
          'Fix and pin with a regression test',
          'Reproduce reliably',
          'Isolate the minimal failing input',
        ],
        correctOrder: [
          'Reproduce reliably',
          'Isolate the minimal failing input',
          'Hypothesize and run a discriminating experiment',
          'Fix and pin with a regression test',
        ],
        explanation:
          'Repro first (no repro, no proof of fix). Then isolate to ' +
          'shrink where the bug can be. Then hypothesize an observable ' +
          'cause and run an experiment that could prove you wrong. Finally ' +
          'fix and pin the fix with the repro test, so the bug cannot ' +
          'regress.',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'Why is "no repro, no fix" a rule, not a guideline?',
        options: [
          'You cannot fix a flaky bug.',
          'Without a reliable reproduction you cannot tell whether your change actually fixed the bug or whether the bug just happened not to trigger that run; the "fix" is unverified and the bug will return.',
          'Repros are slow.',
          'Fixes require a repro to compile.',
        ],
        correctIndex: 1,
        explanation:
          'A fix you cannot verify is a guess. If the bug is intermittent, ' +
          'it might simply not trigger on the run after your change, ' +
          'looking "fixed" while the root cause persists. A reliable repro ' +
          '— an input that fails every time — is the only proof that your ' +
          'fix addresses the cause. Build it before changing code.',
      },
      {
        question: 'What makes a debugging hypothesis useful?',
        options: [
          'It sounds plausible.',
          'It is falsifiable: it predicts an observable outcome, so an experiment can prove it wrong and rule it out, shrinking the search space.',
          'It is short.',
          'It agrees with the author.',
        ],
        correctIndex: 1,
        explanation:
          'A hypothesis that cannot be disproven ("maybe it is a memory ' +
          'gremlin") is useless because no experiment can rule it out. A ' +
          'useful hypothesis predicts something observable (at i === ' +
          'length, items[i] is undefined) that an experiment can confirm ' +
          'or refute. Each refutation eliminates one cause and narrows the ' +
          'search until only the truth remains.',
      },
    ],
  },
  {
    id: 'lesson-debugging-toolbox',
    title: 'The Debugging Toolbox: Prints, Breakpoints, Bisect, Rubber Duck',
    moduleId: 'module-debugging',
    languageId: 'python',
    difficulty: 3,
    estimatedMinutes: 11,
    summary:
      'Tools accelerate the method but do not replace it. Print ' +
      'statements reveal values at a point; a debugger lets you pause and ' +
      'inspect live; git bisect finds the exact commit that introduced the ' +
      'bug; rubber-ducking forces you to state your assumptions out loud, ' +
      'exposing the wrong one.',
    teachesConceptIds: ['debugging', 'breakpoint', 'stack-trace', 'logging', 'binary-search'],
    prerequisiteConceptIds: ['debugging', 'debugging-strategy', 'function', 'version-control'],
    objectives: [
      'Use print/logging to observe values at a point in execution.',
      'Set a breakpoint and inspect live state in a debugger.',
      'Use git bisect to find the commit that introduced a bug.',
      'Use rubber-duck debugging to expose faulty assumptions.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'The systematic method tells you what to do (repro, isolate, ' +
          'hypothesize). The toolbox tells you how to observe what you need. ' +
          'Each tool answers a different question; matching the tool to the ' +
          'question is the skill. The wrong tool wastes time — print in a ' +
          'loop of a million iterations, or a debugger on a timing bug — so ' +
          'learn which tool fits which question.',
      },
      {
        kind: 'heading',
        text: 'Print / log: what is the value here, now?',
      },
      {
        kind: 'code',
        languageId: 'python',
        caption: 'The fastest way to see a value at a point; no setup, just read it.',
        code: "def total(items):\n    s = 0\n    for i, it in enumerate(items):\n        print(f'i={i} active={it.active} value={it.value} s={s}')  # observe\n        if it.active:\n            s += it.value * 1.1\n    return s\n# print answers 'what is the state at this line?' cheaply\n# use logging (not print) for anything you might want in production:",
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'Logging is print that survives',
        text:
          'print() disappears when you ship; logging stays, with levels ' +
          '(DEBUG/INFO/WARN/ERROR) so you can dial verbosity up or down in ' +
          'production. Use print for a quick local probe; reach for logging ' +
          'the moment the probe might outlive the bug — because the next bug ' +
          'will be easier if the logs are already there.',
      },
      {
        kind: 'heading',
        text: 'The debugger: pause and walk',
      },
      {
        kind: 'code',
        languageId: 'python',
        caption: 'A breakpoint freezes execution so you can inspect live state and step.',
        code: "import pdb\n\ndef total(items):\n    s = 0\n    for i, it in enumerate(items):\n        pdb.set_trace()      # PAUSE here; inspect i, it, s live\n        if it.active:\n            s += it.value * 1.1\n    return s\n# at the prompt: p i, p it.active, n (next line), s (step in), c (continue)\n# a debugger lets you go FORWARD slowly and inspect anything, vs print which\n# shows only what you thought to log in advance",
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'Debugger vs print',
        text:
          'Print is great when you know the line and just want a value. A ' +
          'debugger shines when you do NOT know where to look: set a ' +
          'breakpoint at the entry and step until the state goes wrong, ' +
          'inspecting anything along the way. The debugger is interactive ' +
          'exploration; print is a fixed snapshot.',
      },
      {
        kind: 'heading',
        text: 'git bisect: which commit broke it?',
      },
      {
        kind: 'code',
        languageId: 'bash',
        caption: 'Binary-search the commit history to find the exact change that introduced the bug.',
        code: "$ git bisect start\n$ git bisect bad HEAD            # current is broken\n$ git bisect good v2.0           # v2.0 was fine\n# git checks out the midpoint; you test and say good/bad\n# each round halves the range; O(log n) commits tested\n$ git bisect good                # or bad\n# ...after a few rounds:\n# abc1234 is the first bad commit\n$ git bisect reset\n# now you know EXACTLY which change introduced the bug — read its diff",
      },
      {
        kind: 'callout',
        variant: 'success',
        title: 'The diff is the culprit list',
        text:
          'Once bisect identifies the commit, the bug is almost certainly ' +
          'in that diff — a few lines you can read. This collapses a search ' +
          'across the entire codebase into a search across one change. ' +
          'Bisect is the highest-leverage tool when a bug used to not exist.',
      },
      {
        kind: 'heading',
        text: 'The stack trace: where did it die?',
      },
      {
        kind: 'code',
        languageId: 'python',
        caption: 'Read the traceback bottom-up to find the failing line, top-down for the call chain.',
        code: "Traceback (most recent call last):\n  File \"app.py\", line 40, in handle\n    return total(req.items)        # called total here\n  File \"stats.py\", line 8, in total\n    if it.active:                  # <-- the actual crash line\nAttributeError: 'NoneType' object has no attribute 'active'\n# bottom: the crash is at stats.py:8, on it.active where it is None\n# above: total was called from app.py:40 with req.items\n# so req.items contained a None — the real cause is upstream",
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'The crash site is often the symptom, not the cause',
        text:
          'it.active crashed because it is None — but why is it None? The ' +
          'stack trace tells you WHERE it died; the cause is usually where ' +
          'the None came from, which is upstream. Read the trace to find ' +
          'the crash, then trace the bad value back to its origin.',
      },
      {
        kind: 'heading',
        text: 'Rubber-duck debugging: say it out loud',
      },
      {
        kind: 'paragraph',
        text:
          'Explain the code, line by line, to a rubber duck (or a colleague, ' +
          'or an empty chair). To explain it you must state your assumptions ' +
          'out loud — "this list always has at least one item" — and the ' +
          'moment you say a wrong assumption, you hear it. Half of bugs are ' +
          'found not by the duck but by the act of articulating what you ' +
          'thought was true.',
      },
      {
        kind: 'compare',
        languageIds: ['python', 'bash'],
        caption:
          'Print (observe a value) vs git bisect (find the commit).',
        snippets: [
          "print(i, it.active)   # what is the state HERE?",
          "git bisect good/bad   # WHICH CHANGE introduced this?",
        ],
      },
    ],
    animation: {
      type: 'timeline',
      title: 'Choosing the right tool for the question',
      steps: [
        { caption: 'Question: "what is the value at this line?" -> print/logging. Fast, fixed snapshot.' },
        { caption: 'Question: "where does the state go wrong, I do not know where to look?" -> debugger breakpoint + step. Interactive exploration.' },
        { caption: 'Question: "this used to work, which commit broke it?" -> git bisect. Halves the history; the culprit commit is the diff to read.' },
        { caption: 'Question: "why did it die?" -> read the stack trace bottom-up for the crash line, then trace the bad value upstream to its origin.' },
        { caption: 'Question: "I am stuck, my assumptions feel true" -> rubber duck. Explain line by line; the wrong assumption surfaces the moment you say it aloud.' },
      ],
    },
    activity: {
      type: 'multipleChoice',
      title: 'Pick the right tool',
      prompt:
        'The bug used to not exist; it appeared sometime in the last 200 ' +
        'commits. Which tool finds the cause fastest?',
      languageId: 'bash',
      data: {
        question: 'Which tool for "a regression across 200 commits"?',
        options: [
          'Add more print statements.',
          'git bisect: mark a known-good and known-bad commit, let git binary-search the history; each round halves the range, finding the introducing commit in ~8 steps.',
          'Read every commit by hand.',
          'Restart the debugger.',
        ],
        correctIndex: 1,
        explanation:
          'Bisect is built for this: it turns "search 200 commits" into ' +
          '"search log2(200) ≈ 8 commits" by halving the range each round. ' +
          'Once it identifies the first bad commit, you read that one diff ' +
          '— a few lines — instead of the whole codebase. Bisect is the ' +
          'highest-leverage tool for regressions.',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'Why does rubber-duck debugging work, even though the duck cannot answer?',
        options: [
          'It is a superstition.',
          'Explaining the code forces you to state your assumptions out loud; the faulty assumption often becomes obvious the moment you articulate it, because you must make it explicit to explain the flow.',
          'The duck absorbs the bug.',
          'It satisfies a process requirement.',
        ],
        correctIndex: 1,
        explanation:
          'You hold implicit assumptions ("the list is non-empty", "the ' +
          'config is loaded") that you never check because they feel true. ' +
          'To explain the code to the duck you must say them aloud, which ' +
          'makes them explicit and testable. The duck is a prop; the ' +
          'mechanism is forcing implicit assumptions into words where you ' +
          'can hear the wrong one.',
      },
      {
        question: 'The stack trace shows the crash at `it.active`. Why is the cause often NOT at that line?',
        options: [
          'Stack traces are unreliable.',
          'The crash is the symptom (it is None here); the cause is upstream — wherever it became None. The trace tells you WHERE it died; you trace the bad value back to where it was produced.',
          'it.active is always the cause.',
          'The trace is in reverse order.',
        ],
        correctIndex: 1,
        explanation:
          'The line that throws is where the bad state was used, not where ' +
          'it was created. it.active crashes because it is None, but None ' +
          'came from somewhere upstream — a function that returned None, a ' +
          'missing list entry. Read the trace for the crash site, then ' +
          'walk back to the origin of the bad value; that origin is the ' +
          'fixable cause.',
      },
    ],
  },
]
