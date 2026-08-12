/**
 * Cambric Labs — Module: Computational Complexity
 *
 * Two genuine lessons on growth analysis: Big O notation and amortized cost.
 */
import type { LessonDetail } from '../types'

export const complexityLessons: LessonDetail[] = [
  // ── 1. Big O ──────────────────────────────────────────────────────
  {
    id: 'lesson-big-o',
    title: 'Big O: How Runtime Grows',
    moduleId: 'module-complexity',
    languageId: 'python',
    difficulty: 3,
    estimatedMinutes: 12,
    summary:
      'Big O describes how runtime scales with input size, ignoring ' +
      'constants and lower-order terms. It is the shared vocabulary for ' +
      'comparing algorithms.',
    teachesConceptIds: ['big-o', 'complexity', 'big-omega', 'big-theta', 'algorithm'],
    prerequisiteConceptIds: ['algorithm', 'complexity', 'loop', 'recursion'],
    objectives: [
      'Express the Big O of a loop, nested loop, and recursion.',
      'Drop constants and lower-order terms to find the dominant class.',
      'Rank common complexity classes from O(1) to O(2^n).',
      'Use Big O to decide when an algorithm is fast enough.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'Big O answers "what happens as n grows?" not "how fast on this ' +
          'machine?" It describes the rate of growth — whether doubling the ' +
          'input doubles the work, quadruples it, or explodes. Two algorithms ' +
          'with the same Big O might differ 10× in real time, but a different ' +
          'Big O class means one will eventually win no matter the constant.',
      },
      {
        kind: 'heading',
        text: 'Count the dominant term, drop the rest',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'Three loops; the nested loop dominates.',
        code: 'def f(n):\n    for i in range(n):       # O(n)\n        pass\n    for i in range(n):       # O(n)\n        for j in range(n):   # O(n^2)\n            pass\n    # total: O(n) + O(n^2) = O(n^2) — the n^2 dominates',
        output: '',
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'Why constants do not matter asymptotically',
        text:
          'O(2n) and O(n) are the same class — both grow linearly. A 2× ' +
          'constant is swamped by the difference between O(n) and O(n²): ' +
          'for n = 1,000,000, O(n) is a million ops while O(n²) is a trillion. ' +
          'Big O tells you WHEN one algorithm overtakes another, not the ' +
          'exact runtime.',
      },
      {
        kind: 'heading',
        text: 'The ladder of common classes',
      },
      {
        kind: 'paragraph',
        text:
          'From fastest to slowest: O(1) constant (array index), O(log n) ' +
          'logarithmic (binary search), O(n) linear (single loop), O(n log n) ' +
          'linearithmic (merge sort), O(n²) quadratic (nested loop, simple ' +
          'sorts), O(2^n) exponential (naive recursion like naive Fibonacci). ' +
          'Each step up is dramatically worse at large n.',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'How many operations each class does at n = 1000.',
        code: 'import math\nn = 1000\nprint("O(1):", 1)\nprint("O(log n):", round(math.log2(n)))\nprint("O(n):", n)\nprint("O(n log n):", round(n * math.log2(n)))\nprint("O(n^2):", n * n)\nprint("O(2^n):", 2 ** n if n < 60 else "huge")',
        output: 'O(1): 1\nO(log n): 10\nO(n): 1000\nO(n log n): 9966\nO(n^2): 1000000\nO(2^n): huge',
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'Exponential is not "slow", it is "impossible"',
        text:
          'O(2^n) for n=30 is a billion ops — feasible. For n=60 it exceeds ' +
          'the lifetime of the universe. Exponential algorithms are usable ' +
          'only for tiny n; they are why naive recursion on Fibonacci fails ' +
          'and why NP-hard problems demand clever pruning or heuristics.',
      },
      {
        kind: 'heading',
        text: 'Recursion: count from the recurrence',
      },
      {
        kind: 'paragraph',
        text:
          'A recursive function that makes two half-size calls does T(n) = ' +
          '2·T(n/2) + O(n) work — that solves to O(n log n) (merge sort). One ' +
          'that makes two full-size calls does T(n) = 2·T(n-1) + O(1) — that ' +
          'is O(2^n) (naive Fibonacci). The branching factor and the shrink ' +
          'rate set the class.',
      },
      {
        kind: 'code',
        languageId: 'python',
        caption: 'Naive Fibonacci is exponential; memoized is linear.',
        code: 'def fib_naive(n):           # O(2^n): two full-size calls\n    if n < 2: return n\n    return fib_naive(n-1) + fib_naive(n-2)\n\ndef fib_memo(n, m={}):        # O(n): each value computed once\n    if n < 2: return n\n    if n not in m:\n        m[n] = fib_memo(n-1, m) + fib_memo(n-2, m)\n    return m[n]',
      },
      {
        kind: 'heading',
        text: 'Big Omega and Big Theta',
      },
      {
        kind: 'paragraph',
        text:
          'Big O is an UPPER bound (grows no faster than). Big Omega is a ' +
          'LOWER bound (grows no slower than). Big Theta is a TIGHT bound ' +
          '(grows exactly at this rate — both upper and lower). When people ' +
          'say "this is O(n)" they usually mean Theta(n), but Big O alone ' +
          'only promises an upper limit.',
      },
      {
        kind: 'compare',
        languageIds: ['python', 'javascript'],
        caption:
          'The analysis is language-agnostic; the code differs but the loop ' +
          'and recursion counts are identical.',
        snippets: [
          'for i in range(n):\n    for j in range(n):\n        pass  # O(n^2)',
          'for (let i = 0; i < n; i++) {\n  for (let j = 0; j < n; j++) {}\n} // O(n^2)',
        ],
      },
    ],
    animation: {
      type: 'dataFlow',
      title: 'Operation counts grow very differently',
      steps: [
        { caption: 'At n=10: O(1)=1, O(log n)≈3, O(n)=10, O(n²)=100, O(2^n)=1024.' },
        { caption: 'At n=100: O(log n)≈7, O(n)=100, O(n²)=10000, O(2^n)≈10^30.' },
        { caption: 'At n=1000: O(n²)=1M, O(2^n)=astronomical. The classes diverge catastrophically.' },
        { caption: 'Doubling n: O(n) doubles, O(n²) quadruples, O(2^n) squares. Higher classes punish growth more.' },
      ],
    },
    activity: {
      type: 'multipleChoice',
      title: 'Identify the complexity',
      prompt:
        'What is the Big O of this code? for i in range(n): for j in range(i): print(j)',
      languageId: 'pseudo',
      data: {
        question: 'for i in range(n): for j in range(i): print(j)  — what is the Big O?',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(2^n)'],
        correctIndex: 2,
        explanation:
          'The inner loop runs i times for each i, so total work is ' +
          '0+1+2+...+(n-1) = n(n-1)/2, which is O(n²). The exact half-constant ' +
          'is dropped.',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'Why is O(2n) the same class as O(n)?',
        options: [
          'Because 2 is a constant factor, and Big O drops constant multipliers.',
          'Because 2n and n are both even.',
          'They are not — O(2n) is twice as slow.',
          'Because n is always small.',
        ],
        correctIndex: 0,
        explanation:
          'Big O describes growth rate, not exact count. A constant ' +
          'multiplier (2) does not change how the work scales with n, so ' +
          'O(2n) = O(n).',
      },
      {
        question: 'Naive recursive Fibonacci is O(2^n). What makes it exponential?',
        options: [
          'It runs on a fast computer.',
          'Each call makes two calls of nearly the same size, so work doubles each level.',
          'It uses too much memory.',
          'It is written in Python.',
        ],
        correctIndex: 1,
        explanation:
          'fib(n) calls fib(n-1) and fib(n-2), each of which branches again. ' +
          'The work roughly doubles at each depth level, giving 2^n total ' +
          'calls. Memoizing collapses the two calls to share work, making it O(n).',
      },
    ],
  },

  // ── 2. Amortized cost ─────────────────────────────────────────────
  {
    id: 'lesson-amortized-cost',
    title: 'Amortized Cost: Rare Expensive Ops, Averaged',
    moduleId: 'module-complexity',
    languageId: 'python',
    difficulty: 4,
    estimatedMinutes: 11,
    summary:
      'Some data structures do rare expensive operations (like resizing a ' +
      'dynamic array). Amortized analysis averages them over a sequence, ' +
      'showing the per-operation cost is still O(1).',
    teachesConceptIds: ['amortized-cost', 'complexity', 'dynamic-array', 'big-o'],
    prerequisiteConceptIds: ['complexity', 'big-o', 'array', 'list'],
    objectives: [
      'Distinguish worst-case per operation from amortized per operation.',
      'Explain why a dynamic array append is amortized O(1).',
      'Reason about the geometric resizing strategy.',
      'Identify when amortized analysis applies and when it does not.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'A Python list append is almost always O(1) — write to the next ' +
          'free slot. But occasionally the backing array is full and must be ' +
          'resized: allocate a bigger array, copy every element, free the ' +
          'old one — that single append is O(n). Yet we call list append ' +
          '"amortized O(1)". Why?',
      },
      {
        kind: 'heading',
        text: 'The accountant view: save up for the rare expense',
      },
      {
        kind: 'paragraph',
        text:
          'Imagine each cheap append costs 1 unit and we charge 2 units ' +
          'for it. We spend 1 now and bank 1. After many appends the bank ' +
          'has grown enough to pay for the next resize without going into ' +
          'debt. Averaged over the sequence, the cost per append is constant — ' +
          'amortized O(1) — even though one specific append was O(n).',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'Track the cumulative cost of n appends.',
        code: 'def append_costs(n):\n    capacity = 1\n    total = 0\n    for i in range(n):\n        if i + 1 > capacity:\n            total += capacity      # copy existing on resize\n            capacity *= 2\n        total += 1              # the append itself\n    return total, total / n\n\nprint(append_costs(1000))  # total cost, avg per append',
        output: '(1998, 1.998)',
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'Total is ~2n, so average is ~2 — constant',
        text:
          'For 1000 appends the total work is about 2000, so the average per ' +
          'append is about 2 — a constant. That is amortized O(1). The ' +
          'resizing copies become rarer as capacity grows (doubling), so ' +
          'their total contribution is bounded by a constant times n.',
      },
      {
        kind: 'heading',
        text: 'Geometric growth is the key',
      },
      {
        kind: 'paragraph',
        text:
          'Doubling on resize (geometric growth) is what makes the bound ' +
          'work. Each resize costs O(current size), but resizes happen half ' +
          'as often as capacity grows. The sum of resize costs is a geometric ' +
          'series: n + n/2 + n/4 + ... < 2n. So total work over n appends is ' +
          'at most 2n — O(n) total, O(1) amortized per append.',
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'Why not grow by 1 each time?',
        text:
          'If you grew by a constant amount (capacity += 1) instead of ' +
          'doubling, every append past the initial capacity would resize. ' +
          'Total work becomes 1 + 2 + 3 + ... + n = O(n²). The growth factor ' +
          'must be geometric (×2, ×1.5) for the amortized O(1) bound to hold.',
      },
      {
        kind: 'heading',
        text: 'When amortized does NOT apply',
      },
      {
        kind: 'paragraph',
        text:
          'Amortized O(1) is fine when you do many operations. If you need ' +
          'a single append to be guaranteed fast (say, in a real-time system ' +
          'where a 50ms resize would miss a deadline), the worst-case O(n) ' +
          'resize matters and amortized analysis is not enough. Real-time ' +
          'systems use pre-allocated or linked structures to bound every ' +
          'single operation.',
      },
      {
        kind: 'compare',
        languageIds: ['python', 'rust'],
        caption:
          'Python list and Rust Vec both double on resize for the same ' +
          'amortized O(1) push. Rust makes the resize cost explicit in docs.',
        snippets: [
          's = []\nfor _ in range(1000):\n    s.append(1)  # amortized O(1)',
          'let mut s = Vec::new();\nfor _ in 0..1000 {\n    s.push(1); // amortized O(1)\n}',
        ],
      },
    ],
    animation: {
      type: 'timeline',
      title: 'Appends and resizes: the rare expensive moments',
      steps: [
        { caption: 'capacity=1. Append: 1 unit. Total so far: 1.' },
        { caption: 'Full! Resize to 2: copy 1 (cost 1), then append: 1. This append cost 2.' },
        { caption: 'Append: 1. Full again. Resize to 4: copy 2, append 1. This append cost 3.' },
        { caption: 'Next two appends each cost 1. Resize to 8: copy 4, append 1.' },
        { caption: 'Resizes happen at 1, 2, 4, 8... geometrically rarer. Total copies ≈ 2n → avg O(1).' },
      ],
    },
    activity: {
      type: 'multipleChoice',
      title: 'Why doubling, not +1?',
      prompt:
        'If a dynamic array grew by +1 slot on each resize instead of ' +
        'doubling, what would the amortized append cost become?',
      languageId: 'pseudo',
      data: {
        question: 'Growth strategy += 1 instead of ×2. Amortized append cost?',
        options: ['Still O(1)', 'O(log n)', 'O(n) — every resize copies everything before it', 'O(n²) — total work is 1+2+3+...+n'],
        correctIndex: 3,
        explanation:
          'Growing by 1 means resize i copies i elements. Sum over n appends ' +
          'is 1+2+...+n = O(n²), so amortized per append is O(n). Geometric ' +
          'growth (doubling) makes the resize series geometric, summing to O(n).',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'A dynamic array append is amortized O(1). What does that mean?',
        options: [
          'Every append is O(1).',
          'Some appends are O(n) (resize), but averaged over many appends the per-append cost is O(1).',
          'The array never resizes.',
          'Appends are O(n) always.',
        ],
        correctIndex: 1,
        explanation:
          'Amortized analysis averages over a sequence. Rare O(n) resizes ' +
          'are paid for by many cheap O(1) appends, so the average per ' +
          'operation is O(1) — even though the worst single operation is O(n).',
      },
      {
        question: 'In a real-time system, why might amortized O(1) be insufficient?',
        options: [
          'Real-time systems are too fast.',
          'A single O(n) resize could miss a hard deadline; real-time needs every operation bounded, not just the average.',
          'Amortized analysis is wrong.',
          'Real-time systems cannot use arrays.',
        ],
        correctIndex: 1,
        explanation:
          'Amortized analysis guarantees the average, not each operation. A ' +
          'real-time system needs every individual operation under a deadline, ' +
          'so the occasional O(n) resize is unacceptable — it needs worst-case ' +
          'bounds, hence pre-allocated or linked structures.',
      },
    ],
  },
]
