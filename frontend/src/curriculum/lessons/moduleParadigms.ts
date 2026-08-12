/**
 * Cambric Labs — Module: Design Paradigms
 *
 * Four genuine lessons on algorithm design: divide and conquer, greedy,
 * dynamic programming, and backtracking. Each teaches a distinct strategy.
 */
import type { LessonDetail } from '../types'

export const paradigmsLessons: LessonDetail[] = [
  // ── 1. Divide and conquer ────────────────────────────────────────
  {
    id: 'lesson-divide-and-conquer',
    title: 'Divide and Conquer: Split, Solve, Combine',
    moduleId: 'module-paradigms',
    languageId: 'python',
    difficulty: 4,
    estimatedMinutes: 12,
    summary:
      'Divide and conquer breaks a problem into independent subproblems, ' +
      'solves each recursively, and combines results — powering merge sort, ' +
      'quick sort, and binary search.',
    teachesConceptIds: ['divide-and-conquer', 'recursion', 'merge-sort', 'binary-search'],
    prerequisiteConceptIds: ['recursion', 'complexity', 'merge-sort'],
    objectives: [
      'State the three steps of divide and conquer.',
      'Identify when subproblems are independent (D&C) vs overlapping (DP).',
      'Derive the recurrence for a divide-and-conquer algorithm.',
      'Apply D&C to the maximum-subarray problem.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'Divide and conquer solves a hard problem by splitting it into ' +
          'smaller copies of itself. Solve each copy recursively, combine the ' +
          'answers, and the original is solved. The pattern shows up in merge ' +
          'sort, quick sort, binary search, and the Fast Fourier Transform.',
      },
      {
        kind: 'heading',
        text: 'The three steps',
      },
      {
        kind: 'steps',
        caption: 'Every divide-and-conquer algorithm follows this shape.',
        steps: [
          'Divide: split the input into smaller subproblems (often in half).',
          'Conquer: solve each subproblem recursively.',
          'Combine: merge the subproblem answers into the final answer.',
        ],
      },
      {
        kind: 'code',
        languageId: 'python',
        caption: 'Merge sort is the canonical D&C example.',
        code: 'def merge_sort(a):\n    if len(a) <= 1:           # base case\n        return a\n    mid = len(a) // 2          # divide\n    left = merge_sort(a[:mid])\n    right = merge_sort(a[mid:])\n    return merge(left, right)  # combine',
      },
      {
        kind: 'heading',
        text: 'The recurrence captures the cost',
      },
      {
        kind: 'paragraph',
        text:
          'A D&C algorithm that splits into b subproblems of size n/b and ' +
          'does O(n^d) combine work follows T(n) = a·T(n/b) + O(n^d). The ' +
          'Master Theorem resolves most such recurrences. Merge sort: a=2, ' +
          'b=2, d=1 → O(n log n). Binary search: a=1, b=2, d=0 → O(log n).',
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'When does D&C NOT apply?',
        text:
          'When subproblems overlap, naive D&C recomputes them exponentially. ' +
          'Naive Fibonacci is D&C shaped but the two subproblems (n-1 and n-2) ' +
          'overlap massively — that is when you switch to dynamic programming ' +
          '(memoize the shared subproblems).',
      },
      {
        kind: 'heading',
        text: 'Worked example: maximum subarray',
      },
      {
        kind: 'paragraph',
        text:
          'Given an array of numbers (some negative), find the contiguous ' +
          'subarray with the largest sum. A D&C approach splits at the middle: ' +
          'the answer is either entirely in the left half, entirely in the ' +
          'right half, or crosses the middle. Recurse on left and right, then ' +
          'compute the best crossing sum in O(n).',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'D&C maximum subarray (Kadane algorithm is simpler; this shows the pattern).',
        code: 'def max_crossing(a, lo, mid, hi):\n    left_sum = best = 0\n    for i in range(mid, lo - 1, -1):\n        best += a[i]\n        left_sum = max(left_sum, best)\n    right_sum = best = 0\n    for i in range(mid + 1, hi + 1):\n        best += a[i]\n        right_sum = max(right_sum, best)\n    return left_sum + right_sum\n\ndef max_subarray(a, lo, hi):\n    if lo == hi: return max(0, a[lo])\n    mid = (lo + hi) // 2\n    return max(max_subarray(a, lo, mid),\n               max_subarray(a, mid + 1, hi),\n               max_crossing(a, lo, mid, hi))\n\nprint(max_subarray([-2, 1, -3, 4, -1, 2, 1, -5, 4], 0, 8))',
        output: '6',
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'Combine step is the hard part',
        text:
          'Dividing and recursing are usually easy. The combine step — ' +
          'merging two sorted halves, computing the crossing subarray — is ' +
          'where the real work and the cleverness live. Design the combine ' +
          'first; the recursion falls out.',
      },
      {
        kind: 'compare',
        languageIds: ['python', 'javascript'],
        caption:
          'The three-step shape is identical across languages; only array ' +
          'slicing syntax differs.',
        snippets: [
          'mid = len(a) // 2\nleft = solve(a[:mid])\nright = solve(a[mid:])',
          'const mid = a.length >> 1;\nconst left = solve(a.slice(0, mid));\nconst right = solve(a.slice(mid));',
        ],
      },
    ],
    animation: {
      type: 'treeTraversal',
      title: 'Merge sort recursion tree: split then combine',
      steps: [
        { caption: '[5,2,4,1,3] → split into [5,2] and [4,1,3].' },
        { caption: '[5,2] → [2,5]. [4,1,3] → [1,3,4] (each leaf solved).' },
        { caption: 'Combine: merge [2,5] with [1,3,4] → [1,2,3,4,5].' },
        { caption: 'log2(5)≈3 levels of recursion; each level does O(n) merge work.' },
      ],
    },
    activity: {
      type: 'multipleChoice',
      title: 'D&C vs DP',
      prompt:
        'You solve Fibonacci with fib(n) = fib(n-1) + fib(n-2). It is ' +
        'exponentially slow. What is the structural reason?',
      languageId: 'pseudo',
      data: {
        question: 'Why is naive Fibonacci slow despite looking like divide and conquer?',
        options: [
          'The recursion is too deep.',
          'The two subproblems (n-1 and n-2) overlap massively, so the same values recompute exponentially — this calls for memoization (DP), not raw D&C.',
          'Python is slow.',
          'Fibonacci is not solvable.',
        ],
        correctIndex: 1,
        explanation:
          'D&C assumes subproblems are independent. Fibonacci subproblems ' +
          'overlap heavily (fib(n-1) computes fib(n-2) too), so plain D&C ' +
          'recomputes the shared work. Memoizing makes it O(n) — that is DP.',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'Which is the hardest part of a divide-and-conquer algorithm?',
        options: [
          'Writing the base case.',
          'Designing the combine step that merges subproblem answers.',
          'Splitting the input.',
          'Picking the language.',
        ],
        correctIndex: 1,
        explanation:
          'Splitting and recursing are usually mechanical. The combine step ' +
          '(merging sorted halves, computing the crossing subarray) is where ' +
          'the algorithm-specific cleverness and the cost live.',
      },
      {
        question: 'A D&C algorithm splits into 2 halves and does O(n) combine. Its complexity is?',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(2^n)'],
        correctIndex: 1,
        explanation:
          'T(n) = 2·T(n/2) + O(n). The recursion tree has log n levels, each ' +
          'doing O(n) combine work, giving O(n log n) — the merge sort bound.',
      },
    ],
  },

  // ── 2. Greedy ─────────────────────────────────────────────────────
  {
    id: 'lesson-greedy',
    title: 'Greedy: Take the Best Local Step',
    moduleId: 'module-paradigms',
    languageId: 'python',
    difficulty: 4,
    estimatedMinutes: 11,
    summary:
      'A greedy algorithm makes the locally optimal choice at each step. ' +
      'It is fast and simple, but correct only when local optimality implies ' +
      'global optimality.',
    teachesConceptIds: ['greedy', 'algorithm', 'optimal-substructure'],
    prerequisiteConceptIds: ['algorithm', 'complexity', 'sorting'],
    objectives: [
      'Describe the greedy choice property and when it holds.',
      'Solve the activity-selection problem greedily.',
      'Explain why greedy fails on some problems (e.g. coin change).',
      'Prove greedy correctness via a greedy stays ahead or exchange argument.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'A greedy algorithm never reconsiders a choice. At each step it ' +
          'takes the option that looks best right now and moves on. When the ' +
          'problem has the right structure — local optimality implies global ' +
          'optimality — greedy is fast, simple, and optimal. When it does ' +
          'not, greedy produces a plausible but wrong answer.',
      },
      {
        kind: 'heading',
        text: 'Activity selection: pick the earliest-ending first',
      },
      {
        kind: 'paragraph',
        text:
          'Given activities with start and end times, pick the most ' +
          'non-overlapping ones. The greedy choice is to always pick the ' +
          'activity that ends earliest, because ending early leaves the ' +
          'most room for the rest.',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'Sort by end time, take any that starts after the last end.',
        code: 'def max_activities(acts):\n    acts.sort(key=lambda x: x[1])   # by end time\n    chosen = []\n    last_end = -1\n    for start, end in acts:\n        if start >= last_end:\n            chosen.append((start, end))\n            last_end = end\n    return chosen\n\nprint(max_activities([(1, 3), (2, 5), (4, 6), (6, 7), (5, 8)]))',
        output: '[(1, 3), (4, 6), (6, 7)]',
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'Why earliest-ending works',
        text:
          'Choosing the earliest-ending activity never hurts: any solution ' +
          'that used a later-ending activity instead could swap it for the ' +
          'earliest one and still be valid (the earliest end frees up more ' +
          'room). This exchange argument is the standard greedy proof.',
      },
      {
        kind: 'heading',
        text: 'When greedy fails: coin change',
      },
      {
        kind: 'paragraph',
        text:
          'With coins {1, 5, 10, 25} and target 30, greedy takes 25 then 5 → ' +
          'two coins, optimal. But with coins {1, 3, 4} and target 6, greedy ' +
          'takes 4 then 1 then 1 → three coins, while the optimal is 3 + 3 → ' +
          'two coins. Greedy "take the largest coin" is not always optimal ' +
          'because a large coin now can block two smaller coins that sum better.',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'Greedy coin change fails on some coin systems.',
        code: 'def greedy_coin(coins, amount):\n    coins.sort(reverse=True)\n    count = 0\n    for c in coins:\n        while amount >= c:\n            amount -= c\n            count += 1\n    return count\n\nprint(greedy_coin([1, 5, 10, 25], 30))  # 2 (optimal)\nprint(greedy_coin([1, 3, 4], 6))       # 3 (NOT optimal; 3+3=2 coins)',
        output: '2\n3',
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'Greedy needs a proof, not a hunch',
        text:
          'A greedy strategy that "looks right" can still be wrong. Always ' +
          'prove it (exchange argument or greedy-stays-ahead) or test it ' +
          'against the known optimal (dynamic programming) before trusting it.',
      },
      {
        kind: 'heading',
        text: 'Greedy vs dynamic programming',
      },
      {
        kind: 'paragraph',
        text:
          'Both exploit optimal substructure. Greedy commits to one choice ' +
          'and never revisits; DP explores all choices and reuses shared ' +
          'subresults. Greedy is O(n log n) when it works; DP is often O(n²) ' +
          'or O(n·W) but always correct. Use greedy when proven, DP when in ' +
          'doubt.',
      },
      {
        kind: 'compare',
        languageIds: ['python', 'javascript'],
        caption:
          'The sort-then-scan pattern is identical. Python sorts with a ' +
          'key; JS uses a comparator.',
        snippets: [
          'acts.sort(key=lambda x: x[1])  # by end time',
          'acts.sort((a, b) => a[1] - b[1]); // by end time',
        ],
      },
    ],
    animation: {
      type: 'timeline',
      title: 'Activity selection: take the earliest-ending',
      steps: [
        { caption: 'Activities: (1,3),(2,5),(4,6),(6,7),(5,8). Sort by end time.' },
        { caption: 'Take (1,3) — ends earliest. last_end = 3.' },
        { caption: '(2,5) starts before 3 — skip. (4,6) starts after 3 — take. last_end = 6.' },
        { caption: '(5,8) starts before 6 — skip. (6,7) starts at 6 — take. last_end = 7.' },
        { caption: 'Chosen: (1,3),(4,6),(6,7) — three activities, the maximum.' },
      ],
    },
    activity: {
      type: 'multipleChoice',
      title: 'Greedy correctness',
      prompt:
        'Why does the earliest-ending greedy choice work for activity selection?',
      languageId: 'pseudo',
      data: {
        question: 'Why is "always pick the earliest-ending activity" optimal?',
        options: [
          'It picks the shortest activity.',
          'Ending earliest leaves the maximum possible room for remaining activities — an exchange argument shows any other choice is no better.',
          'It is the only choice.',
          'It sorts by start time.',
        ],
        correctIndex: 1,
        explanation:
          'Any solution using a later-ending activity could swap in the ' +
          'earliest-ending one without conflict, so the greedy choice is ' +
          'never worse than any other. That exchange argument is the proof.',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'When does a greedy algorithm produce an optimal solution?',
        options: [
          'Always.',
          'When the problem has the greedy-choice property: a locally optimal choice leads to a globally optimal solution.',
          'Never — greedy is always wrong.',
          'Only on sorted input.',
        ],
        correctIndex: 1,
        explanation:
          'Greedy is optimal only when local optimality implies global ' +
          'optimality — provable via an exchange or greedy-stays-ahead ' +
          'argument. Otherwise it produces a plausible but suboptimal answer.',
      },
      {
        question: 'Greedy coin change with coins {1,3,4} and target 6 returns 3 coins. What is the optimal?',
        options: ['2 coins (3+3)', '3 coins (greedy answer)', '4 coins', '6 coins'],
        correctIndex: 0,
        explanation:
          '3 + 3 = 6 in two coins beats the greedy 4 + 1 + 1 in three. This ' +
          'shows greedy "largest first" is not optimal for all coin systems, ' +
          'unlike the US coin system where it happens to be optimal.',
      },
    ],
  },

  // ── 3. Dynamic programming ────────────────────────────────────────
  {
    id: 'lesson-dynamic-programming',
    title: 'Dynamic Programming: Overlapping Subproblems, Reused',
    moduleId: 'module-paradigms',
    languageId: 'python',
    difficulty: 4,
    estimatedMinutes: 14,
    summary:
      'Dynamic programming solves problems with overlapping subproblems ' +
      'and optimal substructure by solving each subproblem once and reusing ' +
      'the answer — top-down with memoization or bottom-up with a table.',
    teachesConceptIds: ['dynamic-programming', 'memoization', 'dp-table', 'overlapping-subproblems', 'optimal-substructure'],
    prerequisiteConceptIds: ['recursion', 'greedy', 'complexity', 'array'],
    objectives: [
      'Identify overlapping subproblems and optimal substructure.',
      'Implement the top-down memoized Fibonacci and a bottom-up table.',
      'Solve the knapsack problem with a DP table.',
      'Choose between memoization and tabulation.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'Dynamic programming is the answer to "the recursion recomputes the ' +
          'same thing twice." When subproblems overlap and the problem has ' +
          'optimal substructure (an optimal solution contains optimal ' +
          'solutions to subproblems), you solve each subproblem ONCE and ' +
          'reuse it — cutting exponential recursion to polynomial time.',
      },
      {
        kind: 'heading',
        text: 'Fibonacci: the overlap is obvious',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'Naive O(2^n) vs memoized O(n).',
        code: 'def fib_naive(n):\n    if n < 2: return n\n    return fib_naive(n-1) + fib_naive(n-2)  # 2^n calls\n\ndef fib_memo(n, m={}):\n    if n < 2: return n\n    if n not in m:\n        m[n] = fib_memo(n-1, m) + fib_memo(n-2, m)  # each n computed once\n    return m[n]\n\nprint(fib_memo(50))  # instant; naive would never finish',
        output: '12586269025',
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'fib_memo(50) is instant because each value is computed once',
        text:
          'There are only n+1 distinct subproblems (fib(0) through fib(n)). ' +
          'Memoizing makes each O(1) after the first computation, so total ' +
          'work is O(n) instead of O(2^n). The recursion tree collapses to a ' +
          'linear chain.',
      },
      {
        kind: 'heading',
        text: 'Bottom-up: a table instead of recursion',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'Fill a table from smallest to largest; no recursion at all.',
        code: 'def fib_table(n):\n    if n < 2: return n\n    dp = [0] * (n + 1)\n    dp[1] = 1\n    for i in range(2, n + 1):\n        dp[i] = dp[i-1] + dp[i-2]\n    return dp[n]\n\nprint(fib_table(50))',
        output: '12586269025',
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'Memoization vs tabulation',
        text:
          'Memoization (top-down) is recursive and computes only the ' +
          'subproblems actually needed. Tabulation (bottom-up) is iterative ' +
          'and computes all subproblems up to n. Top-down is easier to write ' +
          'from a recurrence; bottom-up avoids recursion overhead and stack ' +
          'limits. Often you can reduce space too: fib only needs the last ' +
          'two values, so O(1) space instead of O(n).',
      },
      {
        kind: 'heading',
        text: '0/1 Knapsack: the DP showcase',
      },
      {
        kind: 'paragraph',
        text:
          'You have items each with weight and value, and a capacity W. Pick ' +
          'a subset (each item 0 or 1 times) maximizing value without ' +
          'exceeding W. Greedy (highest value/weight) fails; the optimal ' +
          'substructure is: for each item, either take it (value + best of ' +
          'remaining capacity) or skip it (best of full capacity). The ' +
          'subproblems overlap because the same capacity recurs for many ' +
          'item subsets.',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: '2D DP table: dp[i][w] = best value using first i items with capacity w.',
        code: 'def knapsack(weights, values, W):\n    n = len(weights)\n    dp = [[0] * (W + 1) for _ in range(n + 1)]\n    for i in range(1, n + 1):\n        for w in range(W + 1):\n            dp[i][w] = dp[i-1][w]  # skip item i\n            if weights[i-1] <= w:\n                dp[i][w] = max(dp[i][w],\n                               dp[i-1][w - weights[i-1]] + values[i-1])\n    return dp[n][W]\n\nprint(knapsack([2, 3, 4], [3, 4, 5], 5))  # take items 0 and 1: 3+4=7',
        output: '7',
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'Why greedy fails on knapsack',
        text:
          'Taking the highest value-to-weight ratio first can fill the bag ' +
          'with a light high-ratio item, leaving room that nothing fits — ' +
          'while two lower-ratio items would have packed better. DP explores ' +
          'every take/skip combination via the table, guaranteeing the optimum.',
      },
      {
        kind: 'compare',
        languageIds: ['python', 'javascript'],
        caption:
          'Both use a 2D array; the recurrence is identical. JS nested ' +
          'arrays need explicit filling.',
        snippets: [
          'dp = [[0] * (W + 1) for _ in range(n + 1)]\ndp[i][w] = max(dp[i-1][w], dp[i-1][w - weights[i-1]] + values[i-1])',
          'const dp = Array.from({length: n+1}, () => new Array(W+1).fill(0));\ndp[i][w] = Math.max(dp[i-1][w], dp[i-1][w - weights[i-1]] + values[i-1]);',
        ],
      },
    ],
    animation: {
      type: 'dataFlow',
      title: 'Fibonacci: the recursion tree collapses under memoization',
      steps: [
        { caption: 'fib_naive(5) calls fib(4) and fib(3). fib(4) calls fib(3) and fib(2)...' },
        { caption: 'fib(3) is computed 2 times, fib(2) 3 times — exponential blow-up.' },
        { caption: 'fib_memo(5): fib(3) computed once, stored. Second call returns instantly.' },
        { caption: 'Only 6 distinct subproblems for fib(5); each computed once → O(n).' },
      ],
    },
    activity: {
      type: 'codeChallenge',
      title: 'Bottom-up Fibonacci with O(1) space',
      prompt:
        'Rewrite fib using only two variables (a, b) instead of a full ' +
        'table. fib(10) must print 55.',
      languageId: 'python',
      starterCode: 'def fib(n):\n    if n < 2: return n\n    a, b = 0, 1\n    for _ in range(2, n + 1):\n        # a, b = b, a + b  -- the key update\n\n        pass\n    return b\n\nprint(fib(10))  # 55',
      checks: [
        { description: 'Uses two variables updated in a loop', assertion: { kind: 'matchesRegex', pattern: 'a, b = b' } },
        { description: 'Returns 55 for fib(10)', assertion: { kind: 'outputEquals', value: '55' } },
      ],
    },
    comprehensionChecks: [
      {
        question: 'What two properties must a problem have for dynamic programming to apply?',
        options: [
          'Optimal substructure and overlapping subproblems.',
          'Greedy choice and sorting.',
          'Recursion and randomness.',
          'In-place and stable.',
        ],
        correctIndex: 0,
        explanation:
          'Optimal substructure (an optimal solution contains optimal ' +
          'subproblem solutions) lets you build up the answer; overlapping ' +
          'subproblems make the naive recursion wasteful, which is exactly ' +
          'what memoization/tabulation fixes.',
      },
      {
        question: 'Memoization (top-down) computes only needed subproblems. Tabulation (bottom-up) computes?',
        options: [
          'Only needed subproblems.',
          'All subproblems up to n, in order.',
          'No subproblems.',
          'Random subproblems.',
        ],
        correctIndex: 1,
        explanation:
          'Tabulation fills the table from the smallest subproblem upward, ' +
          'computing every entry even if some are not on the path to the ' +
          'answer. This is the trade-off: simpler iteration but possibly ' +
          'more computation than top-down.',
      },
    ],
  },

  // ── 4. Backtracking ───────────────────────────────────────────────
  {
    id: 'lesson-backtracking',
    title: 'Backtracking: Try, Undo, Try Else',
    moduleId: 'module-paradigms',
    languageId: 'python',
    difficulty: 4,
    estimatedMinutes: 13,
    summary:
      'Backtracking explores a decision tree by making a choice, recursing, ' +
      'and undoing the choice if it leads nowhere. It powers N-Queens, ' +
      'sudoku solvers, and permutation generation.',
    teachesConceptIds: ['backtracking', 'recursion', 'algorithm'],
    prerequisiteConceptIds: ['recursion', 'algorithm', 'complexity'],
    objectives: [
      'Describe the make-a-choice, recurse, undo pattern of backtracking.',
      'Implement a recursive permutation generator.',
      'Solve the N-Queens problem with backtracking and pruning.',
      'Explain why backtracking is exponential and how pruning helps.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'Backtracking is recursion for search problems where you build a ' +
          'solution one choice at a time. When a choice leads to a dead end, ' +
          'you undo it and try the next. The structure is always: choose, ' +
          'recurse, un-choose. It is the engine behind puzzle solvers and ' +
          'combinatorial generation.',
      },
      {
        kind: 'heading',
        text: 'The three-line skeleton',
      },
      {
        kind: 'code',
        languageId: 'python',
        caption: 'The universal backtracking shape.',
        code: 'def backtrack(path, choices):\n    if is_goal(path):\n        record(path)\n        return\n    for choice in choices:\n        if valid(choice, path):\n            path.append(choice)       # choose\n            backtrack(path, next_choices(path))  # recurse\n            path.pop()                # un-choose (the backtrack)',
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'The un-choose is what makes it backtrack',
        text:
          'Without the pop, each recursive call would mutate the same list ' +
          'and you would build one giant path, not explore alternatives. The ' +
          'undo restores the state so the next loop iteration starts clean.',
      },
      {
        kind: 'heading',
        text: 'Permutations: choose, recurse, undo',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'Generate all permutations of a list.',
        code: 'def permutations(path, remaining, out):\n    if not remaining:\n        out.append(path[:])  # copy! the path will be mutated\n        return\n    for i in range(len(remaining)):\n        path.append(remaining[i])\n        permutations(path, remaining[:i] + remaining[i+1:], out)\n        path.pop()\n\nout = []\npermutations([], [1, 2, 3], out)\nprint(out)',
        output: '[[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]',
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'Copy the result, not the path',
        text:
          'When you record a complete path, append path[:] (a copy). The ' +
          'path list is shared across the recursion and will be mutated by ' +
          'later pops; a direct append would store a reference that becomes ' +
          'empty by the end.',
      },
      {
        kind: 'heading',
        text: 'N-Queens: place, check, undo',
      },
      {
        kind: 'paragraph',
        text:
          'Place N queens on an N×N board so no two attack each other. For ' +
          'each row, try every column; if a column is safe given the queens ' +
          'already placed, place and recurse to the next row. If recursion ' +
          'fails, remove the queen and try the next column. Pruning (reject ' +
          'unsafe columns immediately) is what makes it tractable.',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'Count solutions for N-Queens.',
        code: 'def safe(cols, r, c):\n    for prev_r in range(r):\n        if cols[prev_r] == c or abs(cols[prev_r] - c) == r - prev_r:\n            return False\n    return True\n\ndef nqueens(cols, r, n):\n    if r == n: return 1\n    total = 0\n    for c in range(n):\n        if safe(cols, r, c):\n            cols[r] = c\n            total += nqueens(cols, r + 1, n)\n            cols[r] = -1  # undo (backtrack)\n    return total\n\nprint(nqueens([-1]*8, 0, 8))  # 92 solutions for 8-queens',
        output: '92',
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'Pruning turns exponential into merely exponential',
        text:
          'N-Queens without pruning explores n^n board states. With pruning ' +
          '(reject unsafe columns), the search tree shrinks dramatically — ' +
          '8-queens runs instantly. Pruning does not change the worst-case ' +
          'class (still exponential) but the constant becomes manageable.',
      },
      {
        kind: 'compare',
        languageIds: ['python', 'javascript'],
        caption:
          'The pattern is identical; JS users must be careful that array ' +
          'mutations are shared (no structural sharing).',
        snippets: [
          'path.append(choice)\nbacktrack(path, ...)\npath.pop()  # undo',
          'path.push(choice);\nbacktrack(path, ...);\npath.pop(); // undo',
        ],
      },
    ],
    animation: {
      type: 'treeTraversal',
      title: 'Backtracking permutations of [1,2,3]',
      steps: [
        { caption: 'path=[]. Try 1 → path=[1]. Try 2 → path=[1,2]. Try 3 → path=[1,2,3]. Record!' },
        { caption: 'Pop 3 → path=[1,2]. No more choices. Pop 2 → path=[1].' },
        { caption: 'Try 3 → path=[1,3]. Try 2 → path=[1,3,2]. Record!' },
        { caption: 'Backtrack fully. Try 2 first → path=[2,1,3], [2,3,1]...' },
        { caption: 'The undo (pop) is what lets the tree branch instead of grow into one long path.' },
      ],
    },
    activity: {
      type: 'codeChallenge',
      title: 'Generate permutations of [1,2]',
      prompt:
        'Using the backtracking pattern (choose, recurse, un-choose), ' +
        'generate all permutations of [1,2]. Output must be [[1,2],[2,1]].',
      languageId: 'python',
      starterCode: 'def perms(path, remaining, out):\n    if not remaining:\n        out.append(path[:])\n        return\n    for i in range(len(remaining)):\n        path.append(remaining[i])\n        perms(path, remaining[:i] + remaining[i+1:], out)\n        path.pop()  # un-choose\n\nout = []\nperms([], [1, 2], out)\nprint(out)  # [[1, 2], [2, 1]]',
      checks: [
        { description: 'Uses the pop to un-choose', assertion: { kind: 'contains', value: 'pop()' } },
        { description: 'Copies the path when recording', assertion: { kind: 'contains', value: 'path[:]' } },
        { description: 'Outputs both permutations', assertion: { kind: 'outputEquals', value: '[[1, 2], [2, 1]]' } },
      ],
    },
    comprehensionChecks: [
      {
        question: 'Why is the un-choose step (path.pop) essential in backtracking?',
        options: [
          'It frees memory.',
          'It restores the path state so the next loop iteration can try a different choice from the same starting point.',
          'It is faster.',
          'It is required for the goal check.',
        ],
        correctIndex: 1,
        explanation:
          'Without undoing, the path accumulates across iterations and you ' +
          'never explore alternatives. The pop restores the pre-choice state ' +
          'so the next choice starts from the same point.',
      },
      {
        question: 'Why must you copy the path (path[:]) when recording a complete solution?',
        options: [
          'Copying is faster.',
          'The path list is mutated by later pops; a direct reference would end up empty.',
          'It saves memory.',
          'It is required by Python.',
        ],
        correctIndex: 1,
        explanation:
          'The path is shared and will be mutated as the recursion backtracks. ' +
          'Recording path[:] captures the state at this moment; recording ' +
          'path itself would store a reference that all later pops would ' +
          'modify, leaving an empty list at the end.',
      },
    ],
  },
]
