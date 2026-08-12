/**
 * Cambric Labs — Module: Testing (SE)
 *
 * Two lessons: unit testing with the test-arrange-act-assert pattern, and
 * TDD (write the test first).
 */
import type { LessonDetail } from '../types'

export const testingLessons: LessonDetail[] = [
  {
    id: 'lesson-unit-testing',
    title: 'Unit Tests: Arrange, Act, Assert',
    moduleId: 'module-testing',
    languageId: 'python',
    difficulty: 3,
    estimatedMinutes: 12,
    summary:
      'A unit test checks one behaviour of one function in isolation. The ' +
      'arrange-act-assert pattern keeps tests readable and intent clear.',
    teachesConceptIds: ['unit-testing', 'testing', 'mocking', 'test-coverage'],
    prerequisiteConceptIds: ['testing', 'function', 'assertion'],
    objectives: [
      'Write a unit test in the arrange-act-assert shape.',
      'Choose edge cases that reveal boundary bugs.',
      'Use mocks to isolate the unit from its dependencies.',
      'Measure coverage and explain its limits.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'A unit test is a small, fast, isolated test that checks one ' +
          'behaviour of one unit (usually a function). It sets up inputs, ' +
          'calls the function, and checks the output. The arrange-act-assert ' +
          'pattern makes these three phases visually obvious, so a reader ' +
          'can see at a glance what is being tested and what is expected.',
      },
      {
        kind: 'heading',
        text: 'The three phases',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'A pytest unit test for a fibonacci function.',
        code: 'def fib(n):\n    if n < 2: return n\n    return fib(n-1) + fib(n-2)\n\ndef test_fib_base_cases():\n    # Arrange\n    expected = [0, 1, 1]\n    # Act + Assert\n    assert fib(0) == expected[0]\n    assert fib(1) == expected[1]\n    assert fib(2) == expected[2]\n\ndef test_fib_larger():\n    assert fib(7) == 13\n\n# run: pytest test_fib.py -v',
        output: '# 2 tests, both pass. Each test checks one behavior; failure points at one function.',
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'Why "arrange, act, assert" matters',
        text:
          'Separating the phases makes the test scannable: a reader sees the ' +
          'setup, the action, and the expectation in distinct blocks. If ' +
          'setup and action are tangled, a failure forces the reader to ' +
          'reverse-engineer what the test even does. Clarity beats brevity.',
      },
      {
        kind: 'heading',
        text: 'Edge cases reveal boundary bugs',
      },
      {
        kind: 'paragraph',
        text:
          'Bugs live at boundaries: empty input, the first and last element, ' +
          'off-by-one indices, negative numbers, huge numbers, null. A test ' +
          'for the happy path is necessary but not sufficient — edge cases ' +
          'are where the function actually breaks.',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'Tests for the boundaries of a max-subarray function.',
        code: 'def test_empty():\n    assert max_subarray([]) == 0      # empty list\n\ndef test_single_positive():\n    assert max_subarray([5]) == 5     # one element\n\ndef test_single_negative():\n    assert max_subarray([-3]) == 0   # one negative; empty subarray better\n\ndef test_all_negative():\n    assert max_subarray([-2, -1, -3]) == 0  # best is empty (sum 0)\n\ndef test_mixed():\n    assert max_subarray([-2, 1, -3, 4, -1, 2, 1]) == 6',
        output: '# each boundary tests a distinct scenario; together they pin down behavior',
      },
      {
        kind: 'heading',
        text: 'Mocks isolate the unit from its dependencies',
      },
      {
        kind: 'paragraph',
        text:
          'If your function calls a database or an API, a unit test should ' +
          'not hit the real thing — that makes it slow, flaky, and not ' +
          'isolated. A mock replaces the dependency with a fake that ' +
          'returns canned answers and records what was called, so the test ' +
          'checks only YOUR logic, not the dependency.',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'Mock the database so the test does not need one running.',
        code: 'from unittest.mock import MagicMock\n\ndef get_user_name(db, user_id):\n    user = db.fetch(user_id)\n    return user["name"] if user else "unknown"\n\ndef test_get_user_name():\n    db = MagicMock()\n    db.fetch.return_value = {"name": "Cam"}  # the mock returns canned data\n    assert get_user_name(db, 1) == "Cam"\n    db.fetch.assert_called_once_with(1)       # verify the call happened',
        output: '# no real database; the test is fast and deterministic',
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'Do not mock what you are testing',
        text:
          'Mocks isolate the unit FROM its dependencies. If you mock the ' +
          'unit itself, you are testing the mock, not the code. Mock the ' +
          'database, the API client, the clock — never the function under ' +
          'test. Over-mocking gives passing tests that prove nothing.',
      },
      {
        kind: 'heading',
        text: 'Coverage: a floor, not a ceiling',
      },
      {
        kind: 'paragraph',
        text:
          'Coverage measures which lines ran during tests. 100% coverage ' +
          'means every line ran, NOT that every behaviour is correct. A ' +
          'function can be 100% covered and still wrong, because the tests ' +
          'asserted the wrong expectation. Coverage is a floor (did you run ' +
          'this line at all?) not a guarantee of correctness.',
      },
      {
        kind: 'compare',
        languageIds: ['python', 'javascript'],
        caption:
          'pytest (Python) and vitest/jest (JS) both express the same ' +
          'arrange-act-assert shape with different assertion syntax.',
        snippets: [
          'def test_add():\n    assert add(2, 3) == 5',
          'test("add", () => {\n  expect(add(2, 3)).toBe(5);\n});',
        ],
      },
    ],
    animation: {
      type: 'timeline',
      title: 'A unit test runs the three phases',
      steps: [
        { caption: 'Arrange: build inputs and a mock that returns canned data.' },
        { caption: 'Act: call the function under test with those inputs.' },
        { caption: 'Assert: check the output matches the expectation (and the mock was called).' },
        { caption: 'Pass: the assertion held. Fail: the assertion broke — the test names the behaviour that regressed.' },
      ],
    },
    activity: {
      type: 'codeChallenge',
      title: 'Write a unit test',
      prompt:
        'Write a pytest test for a function clamp(x, lo, hi) that clamps x ' +
        'to the range [lo, hi]. Test the case where x is above hi. The ' +
        'function is: def clamp(x, lo, hi): return max(lo, min(x, hi)).',
      languageId: 'python',
      starterCode: 'def clamp(x, lo, hi):\n    return max(lo, min(x, hi))\n\ndef test_clamp_above():\n    # Arrange: inputs where x > hi\n\n    # Act + Assert: clamp returns hi\n\n',
      checks: [
        { description: 'Uses assert', assertion: { kind: 'contains', value: 'assert' } },
        { description: 'Calls clamp', assertion: { kind: 'contains', value: 'clamp(' } },
      ],
    },
    comprehensionChecks: [
      {
        question: 'Why is 100% code coverage not a guarantee of correctness?',
        options: [
          'Coverage is inaccurate.',
          'Coverage only measures which lines ran, not whether the assertions were correct. A test can run a line and assert the wrong expectation.',
          '100% coverage is impossible.',
          'Coverage slows tests down.',
        ],
        correctIndex: 1,
        explanation:
          'Coverage says a line executed, not that it behaved correctly. A ' +
          'test can cover a line and still assert a wrong value, giving a ' +
          'passing test that proves nothing. Coverage is a floor (did the ' +
          'line run at all?), not a correctness proof.',
      },
      {
        question: 'When should you mock a dependency in a unit test?',
        options: [
          'Never.',
          'When the dependency is slow, flaky, or external (database, API, clock) — to keep the test fast, deterministic, and isolated to your logic.',
          'When you are testing the dependency itself.',
          'Always, for every dependency.',
        ],
        correctIndex: 1,
        explanation:
          'Mock slow/external/flaky dependencies so the unit test stays fast ' +
          'and deterministic and tests only your logic. Do not mock the unit ' +
          'under test itself — that tests the mock, not the code.',
      },
    ],
  },

  {
    id: 'lesson-tdd',
    title: 'TDD: Write the Test First',
    moduleId: 'module-testing',
    languageId: 'python',
    difficulty: 3,
    estimatedMinutes: 11,
    summary:
      'Test-driven development writes a failing test, makes it pass with ' +
      'minimal code, then refactors. The test pins the behaviour before ' +
      'the implementation exists.',
    teachesConceptIds: ['tdd', 'unit-testing', 'testing', 'refactoring'],
    prerequisiteConceptIds: ['unit-testing', 'testing', 'refactoring'],
    objectives: [
      'Perform the red-green-refactor cycle.',
      'Write the smallest code that passes the failing test.',
      'Explain why the test-first order shapes the design.',
      'Recognise when TDD is overkill.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'Test-driven development reverses the usual order: write a test, ' +
          'watch it fail, write the smallest code that makes it pass, then ' +
          'refactor. The cycle is red (failing test), green (passing test), ' +
          'refactor (clean up without changing behaviour). Each cycle adds ' +
          'one behaviour pin.',
      },
      {
        kind: 'heading',
        text: 'Red: write a failing test',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'Describe the behaviour BEFORE writing the function.',
        code: '# the function does not exist yet\ndef test_add_empty_returns_zero():\n    assert add([]) == 0   # NameError: add is not defined → RED\n\n# the test fails because add does not exist. That is the point:\n# the test names the behaviour we are about to add.',
        output: '# RED — the test fails for the right reason (no implementation)',
      },
      {
        kind: 'heading',
        text: 'Green: make it pass, minimally',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'Write the simplest code that passes the test.',
        code: 'def add(numbers):\n    return 0   # passes test_add_empty_returns_zero\n\ntest_add_empty_returns_zero()  # now GREEN',
        output: '# GREEN — the test passes. The implementation is trivially correct for this case.',
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'Resist writing the full implementation',
        text:
          'The temptation is to write the whole function now. Do not. Write ' +
          'the minimum to pass the current test. Then write the NEXT test ' +
          '(red again), then make it pass. Small steps keep each change ' +
          'obviously correct and force the tests to drive the design.',
      },
      {
        kind: 'heading',
        text: 'Red again: add the next behaviour',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'A new test drives a more general implementation.',
        code: 'def test_add_single():\n    assert add([5]) == 5   # RED: add returns 0, not 5\n\n# now make it pass:\ndef add(numbers):\n    return sum(numbers) if numbers else 0\n\n# both tests now GREEN',
        output: '# the new test forced the implementation to generalise',
      },
      {
        kind: 'heading',
        text: 'Refactor: clean up without changing behaviour',
      },
      {
        kind: 'paragraph',
        text:
          'Once green, improve the code (extract a helper, rename, simplify) ' +
          'without changing behaviour. The tests are the safety net: if the ' +
          'refactor breaks something, a test goes red immediately. Without ' +
          'tests, refactoring is a guess; with them, it is a verified move.',
      },
      {
        kind: 'code',
        languageId: 'python',
        caption: 'Simplify; tests stay green.',
        code: '# before refactor\ndef add(numbers):\n    return sum(numbers) if numbers else 0\n\n# after refactor — sum([]) is already 0, the guard was redundant\ndef add(numbers):\n    return sum(numbers)\n\n# tests still GREEN: the behaviour is unchanged',
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'Why test-first shapes the design',
        text:
          'Writing the test first forces you to use the API before it exists. ' +
          'If the function is awkward to call, you feel it immediately in ' +
          'the test. TDD tends to produce more testable, decoupled designs ' +
          'because "hard to test" surfaces before "hard to maintain."',
      },
      {
        kind: 'heading',
        text: 'When TDD is overkill',
      },
      {
        kind: 'paragraph',
        text:
          'TDD shines for logic-heavy code with clear behaviour (parsers, ' +
          'algorithms, domain rules). It is less useful for exploratory code ' +
          'where you do not yet know the shape of the solution, or for ' +
          'trivial glue code. Use it where behaviour is specifiable; skip it ' +
          'where you are still discovering what the code should do.',
      },
      {
        kind: 'compare',
        languageIds: ['python', 'javascript'],
        caption:
          'The red-green-refactor cycle is language-agnostic; only the ' +
          'assertion syntax differs.',
        snippets: [
          'def test_add():\n    assert add([1,2]) == 3  # RED then GREEN',
          'test("add", () => {\n  expect(add([1, 2])).toBe(3); // RED then GREEN\n});',
        ],
      },
    ],
    animation: {
      type: 'timeline',
      title: 'Red → Green → Refactor cycle',
      steps: [
        { caption: 'RED: write a test for behaviour not yet implemented. It fails.' },
        { caption: 'GREEN: write the smallest code to pass the test.' },
        { caption: 'REFACTOR: clean up; tests stay green as a safety net.' },
        { caption: 'RED again: a new test for the next behaviour. Repeat.' },
        { caption: 'Each cycle pins one behaviour; the design emerges from test-first usage.' },
      ],
    },
    activity: {
      type: 'ordering',
      title: 'Order the TDD cycle',
      prompt: 'Put the TDD steps in the correct order.',
      languageId: 'pseudo',
      data: {
        items: ['Refactor: clean up the code, tests stay green', 'Green: write minimal code to pass the test', 'Red: write a failing test for the next behaviour'],
        correctOrder: [2, 1, 0],
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'Why write the MINIMUM code to pass the test (not the full implementation)?',
        options: [
          'It is faster.',
          'Small steps keep each change obviously correct, and force the next test to drive generalisation rather than assumptions.',
          'It uses less memory.',
          'The compiler requires it.',
        ],
        correctIndex: 1,
        explanation:
          'Minimal passes keep each change small and obviously correct. The ' +
          'next test forces generalisation. If you write the full ' +
          'implementation up front, you are guessing at behaviour the tests ' +
          'have not specified — defeating the point of test-first.',
      },
      {
        question: 'What is the safety net during the refactor step?',
        options: [
          'The compiler.',
          'The tests — if a refactor breaks behaviour, a test goes red immediately.',
          'Code review.',
          'A linter.',
        ],
        correctIndex: 1,
        explanation:
          'Tests verify behaviour is unchanged during a refactor. If you ' +
          'extract a helper or simplify and a test goes red, the refactor ' +
          'changed behaviour — revert or fix. Without tests, refactoring is ' +
          'a guess.',
      },
    ],
  },
]
