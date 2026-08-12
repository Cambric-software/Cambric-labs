/**
 * Cambric Labs — Module: Searching & Sorting
 *
 * Four genuine lessons: linear vs binary search, simple O(n²) sorts,
 * the divide-and-conquer sorts (merge, quick), and non-comparison sorts.
 */
import type { LessonDetail } from '../types'

export const searchingSortingLessons: LessonDetail[] = [
  // ── 1. Binary search ─────────────────────────────────────────────
  {
    id: 'lesson-binary-search',
    title: 'Binary Search: Halve Until Found',
    moduleId: 'module-searching-sorting',
    languageId: 'python',
    difficulty: 3,
    estimatedMinutes: 11,
    summary:
      'Binary search finds an item in a sorted sequence by repeatedly ' +
      'halving the search range, giving O(log n) instead of O(n).',
    teachesConceptIds: ['binary-search', 'searching', 'complexity', 'algorithm'],
    prerequisiteConceptIds: ['searching', 'array', 'complexity'],
    objectives: [
      'Implement binary search iteratively with lo and hi bounds.',
      'Explain why the input must be sorted.',
      'Avoid the integer-overflow midpoint bug (and its Python equivalent trap).',
      'Reason about the O(log n) cost from the halving argument.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'If a sequence is sorted, you can find an item by checking the ' +
          'middle and throwing away the half that cannot contain it. Each ' +
          'step halves the range, so for a million items you need only ' +
          'about 20 comparisons instead of a million. Sortedness is the ' +
          'price for that speed.',
      },
      {
        kind: 'heading',
        text: 'Iterative binary search with lo and hi',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'Narrow the range until the target is found or the range is empty.',
        code: 'def binary_search(arr, target):\n    lo, hi = 0, len(arr) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if arr[mid] == target:\n            return mid\n        if arr[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1\n\nprint(binary_search([1, 3, 5, 7, 9], 7))  # 3\nprint(binary_search([1, 3, 5, 7, 9], 4))  # -1',
        output: '3\n-1',
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'mid + 1 / mid - 1, never just mid',
        text:
          'If you set lo = mid or hi = mid without the ±1, you can loop ' +
          'forever when lo and hi are adjacent: mid = (lo + lo + 1) // 2 = lo, ' +
          'and nothing changes. The +1/-1 guarantees the range shrinks each step.',
      },
      {
        kind: 'heading',
        text: 'The midpoint overflow trap',
      },
      {
        kind: 'paragraph',
        text:
          'In C and Java, (lo + hi) can overflow a 32-bit int for huge arrays. ' +
          'The safe form is lo + (hi - lo) // 2, which computes the same ' +
          'midpoint without ever summing two large numbers. Python ints are ' +
          'arbitrary precision so it never matters in Python — but the habit ' +
          'is portable.',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'Overflow-safe midpoint (same value, safer in fixed-width ints).',
        code: 'def mid(lo, hi):\n    return lo + (hi - lo) // 2\n\nprint(mid(0, 9))   # 4\nprint(mid(7, 8))  # 7',
        output: '4\n7',
      },
      {
        kind: 'heading',
        text: 'The halving argument: why O(log n)',
      },
      {
        kind: 'paragraph',
        text:
          'After 1 step the range is n/2; after 2 steps n/4; after k steps ' +
          'n/2^k. The range hits 1 when 2^k ≈ n, so k ≈ log₂(n). For n = ' +
          '1,000,000 that is 20 steps. Doubling the array size adds ONE step.',
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'Sorting first is not always a win',
        text:
          'Binary search is O(log n) but requires a sorted array, and ' +
          'sorting is O(n log n). If you search ONCE, linear search (O(n)) ' +
          'beats sort + binary search (O(n log n)). Binary search wins when ' +
          'you can amortise the sort across many queries.',
      },
      {
        kind: 'heading',
        text: 'Linear search: the unsorted baseline',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'Scan one by one; works on any sequence, O(n).',
        code: 'def linear_search(arr, target):\n    for i, v in enumerate(arr):\n        if v == target:\n            return i\n    return -1\n\nprint(linear_search([9, 3, 7, 1], 7))  # 2',
        output: '2',
      },
      {
        kind: 'compare',
        languageIds: ['python', 'c'],
        caption:
          'Python hides the overflow trap with big ints; C forces you to ' +
          'use the safe midpoint form (mid = lo + (hi - lo) / 2).',
        snippets: [
          'mid = (lo + hi) // 2  # safe in Python, risky in C/Java',
          'int mid = lo + (hi - lo) / 2;  // safe; (lo+hi) can overflow',
        ],
      },
    ],
    animation: {
      type: 'dataFlow',
      title: 'Halving the range to find 7 in [1,3,5,7,9]',
      steps: [
        { caption: 'lo=0, hi=4. mid=2, arr[2]=5. 7 > 5 → lo = mid+1 = 3.' },
        { caption: 'lo=3, hi=4. mid=3, arr[3]=7. Found! Return 3.' },
        { caption: 'Two comparisons. Linear search would take up to 4.' },
        { caption: 'For 1M items: ~20 comparisons. The halving is the whole saving.' },
      ],
    },
    activity: {
      type: 'fixCode',
      title: 'Fix the infinite loop',
      prompt:
        'This binary search loops forever on [1,2] searching for 2. Fix the ' +
        'bug so it returns the correct index 1.',
      languageId: 'python',
      starterCode: 'def binary_search(arr, target):\n    lo, hi = 0, len(arr) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if arr[mid] == target:\n            return mid\n        if arr[mid] < target:\n            lo = mid          # BUG: should narrow the range\n        else:\n            hi = mid - 1\n    return -1\n\nprint(binary_search([1, 2], 2))  # must print 1',
      checks: [
        { description: 'Uses mid + 1 to narrow lo', assertion: { kind: 'contains', value: 'mid + 1' } },
        { description: 'Returns 1 for the sample', assertion: { kind: 'outputEquals', value: '1' } },
      ],
    },
    comprehensionChecks: [
      {
        question: 'Why must the array be sorted for binary search to work?',
        options: [
          'Binary search only works on numbers.',
          'Sortedness is what lets you discard half the range at each step.',
          'It does not — binary search works on any array.',
          'To make the code shorter.',
        ],
        correctIndex: 1,
        explanation:
          'The decision to go left or right depends on the order: if arr[mid] ' +
          '< target, the target can only be in the right half — true only ' +
          'because the array is sorted.',
      },
      {
        question: 'Why is lo + (hi - lo) // 2 safer than (lo + hi) // 2 in C or Java?',
        options: [
          'It is faster.',
          'It avoids integer overflow when lo and hi are large.',
          'It is more accurate.',
          'It uses less memory.',
        ],
        correctIndex: 1,
        explanation:
          'In fixed-width ints, lo + hi can overflow the maximum value. ' +
          'Computing hi - lo first keeps both operands small. Python big ' +
          'ints make this a non-issue, but the habit is portable.',
      },
    ],
  },

  // ── 2. Simple sorts ──────────────────────────────────────────────
  {
    id: 'lesson-simple-sorts',
    title: 'Simple Sorts: Insertion, Selection, Bubble',
    moduleId: 'module-searching-sorting',
    languageId: 'python',
    difficulty: 3,
    estimatedMinutes: 12,
    summary:
      'Three O(n²) sorts that are easy to write and reason about. Each ' +
      'teaches a distinct idea and is genuinely the right tool somewhere.',
    teachesConceptIds: ['sorting', 'insertion-sort', 'selection-sort', 'bubble-sort', 'in-place'],
    prerequisiteConceptIds: ['array', 'for-loop', 'complexity'],
    objectives: [
      'Implement insertion sort, selection sort, and bubble sort.',
      'Explain the distinct idea each sort relies on.',
      'Identify when an O(n²) sort is actually the right choice.',
      'Distinguish stable from unstable sorting.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'Three classic sorts are O(n²): insertion, selection, and bubble. ' +
          'They are not the sorts you reach for at scale, but each teaches a ' +
          'distinct sorting idea and each is genuinely best in some niche — ' +
          'insertion sort on nearly-sorted data is hard to beat.',
      },
      {
        kind: 'heading',
        text: 'Insertion sort: grow a sorted prefix',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'Insert each card into its place in the already-sorted left part.',
        code: 'def insertion_sort(a):\n    for i in range(1, len(a)):\n        key = a[i]\n        j = i - 1\n        while j >= 0 and a[j] > key:\n            a[j + 1] = a[j]   # shift right\n            j -= 1\n        a[j + 1] = key\n    return a\n\nprint(insertion_sort([5, 2, 4, 1, 3]))',
        output: '[1, 2, 3, 4, 5]',
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'Nearly-sorted is insertion sort superpower',
        text:
          'When each element is close to its final position, the inner ' +
          'while loop barely runs — insertion sort becomes ~O(n). It is why ' +
          'many library sorts switch to insertion sort for small or ' +
          'nearly-sorted partitions (TimSort does this).',
      },
      {
        kind: 'heading',
        text: 'Selection sort: pick the smallest remaining',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'Find the min of the unsorted tail and swap it into place.',
        code: 'def selection_sort(a):\n    for i in range(len(a)):\n        m = i\n        for j in range(i + 1, len(a)):\n            if a[j] < a[m]: m = j\n        a[i], a[m] = a[m], a[i]\n    return a\n\nprint(selection_sort([5, 2, 4, 1, 3]))',
        output: '[1, 2, 3, 4, 5]',
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'Selection sort minimises swaps',
        text:
          'It does at most n-1 swaps total — useful when a swap is expensive ' +
          '(e.g. writing to flash memory with a wear limit). The comparisons ' +
          'are still O(n²), but the swaps are O(n).',
      },
      {
        kind: 'heading',
        text: 'Bubble sort: swap adjacent out-of-order pairs',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'Repeat passes until a pass makes no swaps.',
        code: 'def bubble_sort(a):\n    n = len(a)\n    for _ in range(n):\n        swapped = False\n        for i in range(n - 1):\n            if a[i] > a[i + 1]:\n                a[i], a[i + 1] = a[i + 1], a[i]\n                swapped = True\n        if not swapped:\n            break\n    return a\n\nprint(bubble_sort([5, 2, 4, 1, 3]))',
        output: '[1, 2, 3, 4, 5]',
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'Bubble sort is mostly pedagogical',
        text:
          'Bubble sort is famous precisely because it is easy to explain ' +
          'and easy to prove correct, not because it is fast. With the early ' +
          'exit on no-swaps it is O(n) on sorted input, but O(n²) in general. ' +
          'Do not reach for it in production.',
      },
      {
        kind: 'heading',
        text: 'Stability: equal keys keep their order',
      },
      {
        kind: 'paragraph',
        text:
          'A stable sort preserves the relative order of equal keys. Insertion ' +
          'and bubble are stable (they only swap when strictly greater, so ' +
          'equal items never pass each other). Selection is NOT stable in ' +
          'this form — a swap can leap an equal item. Stability matters when ' +
          'you sort by a secondary key after a primary one.',
      },
      {
        kind: 'compare',
        languageIds: ['python', 'javascript'],
        caption:
          'Both implement the same loops. Python tuple-swaps inline; JS ' +
          'uses a temp or destructuring.',
        snippets: [
          'a[i], a[m] = a[m], a[i]  # tuple swap',
          '[a[i], a[m]] = [a[m], a[i]]; // destructuring swap',
        ],
      },
    ],
    animation: {
      type: 'sorting',
      title: 'Insertion sort on [5,2,4,1,3]',
      steps: [
        { caption: 'Sorted prefix [5]. Insert 2: shift 5 right → [2,5,4,1,3].' },
        { caption: 'Prefix [2,5]. Insert 4: shift 5 → [2,4,5,1,3].' },
        { caption: 'Prefix [2,4,5]. Insert 1: shift 5,4,2 → [1,2,4,5,3].' },
        { caption: 'Prefix [1,2,4,5]. Insert 3: shift 5,4 → [1,2,3,4,5]. Done.' },
      ],
    },
    activity: {
      type: 'predictOutput',
      title: 'Trace selection sort first pass',
      prompt:
        'selection_sort on [5,2,4,1,3]. After the FIRST pass (i=0), the ' +
        'smallest element is swapped to index 0. What is the array?',
      languageId: 'python',
      starterCode: 'a = [5, 2, 4, 1, 3]\nm = 0\nfor j in range(1, 5):\n    if a[j] < a[m]: m = j\na[0], a[m] = a[m], a[0]\nprint(a)  # after one pass',
      checks: [
        { description: 'First pass puts 1 at index 0', assertion: { kind: 'outputEquals', value: '[1, 2, 4, 5, 3]' } },
      ],
    },
    comprehensionChecks: [
      {
        question: 'Which sort is best for nearly-sorted input and why?',
        options: [
          'Selection sort — few swaps.',
          'Insertion sort — the inner loop barely runs when elements are near their place.',
          'Bubble sort — it is always fastest.',
          'None — always use merge sort.',
        ],
        correctIndex: 1,
        explanation:
          'When each element is close to its target position, the inner ' +
          'while loop of insertion sort shifts very little, giving near-O(n).',
      },
      {
        question: 'Which of these sorts is NOT stable in its basic form?',
        options: ['Insertion sort', 'Bubble sort', 'Selection sort', 'They are all stable'],
        correctIndex: 2,
        explanation:
          'Selection sort can leap an equal item with its swap. Insertion ' +
          'and bubble only act on strict inequality, so equal keys stay in ' +
          'relative order — stable.',
      },
    ],
  },

  // ── 3. Merge and quick sort ──────────────────────────────────────
  {
    id: 'lesson-merge-quick-sort',
    title: 'Merge & Quick Sort: Divide and Conquer',
    moduleId: 'module-searching-sorting',
    languageId: 'python',
    difficulty: 4,
    estimatedMinutes: 14,
    summary:
      'Merge sort splits, sorts halves, and merges — O(n log n) always, ' +
      'stable, O(n) space. Quick sort partitions around a pivot — O(n log n) ' +
      'average, in-place, but O(n²) worst case.',
    teachesConceptIds: ['merge-sort', 'quick-sort', 'sorting', 'divide-and-conquer', 'in-place'],
    prerequisiteConceptIds: ['sorting', 'recursion', 'divide-and-conquer', 'array'],
    objectives: [
      'Implement merge sort and explain its guaranteed O(n log n).',
      'Implement quick sort with a partition step.',
      'Explain why quick sort is O(n²) worst case and how to mitigate it.',
      'Compare stability and space use between merge and quick sort.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'Two divide-and-conquer sorts dominate practical sorting. Merge ' +
          'sort guarantees O(n log n) by splitting evenly and merging sorted ' +
          'halves — at the cost of O(n) extra space. Quick sort partitions ' +
          'in place around a pivot — usually faster, but a bad pivot ' +
          'degrades it to O(n²).',
      },
      {
        kind: 'heading',
        text: 'Merge sort: split, sort, merge',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'Recursive merge sort with a classic merge step.',
        code: 'def merge_sort(a):\n    if len(a) <= 1:\n        return a\n    mid = len(a) // 2\n    left = merge_sort(a[:mid])\n    right = merge_sort(a[mid:])\n    return merge(left, right)\n\ndef merge(l, r):\n    out = []\n    i = j = 0\n    while i < len(l) and j < len(r):\n        if l[i] <= r[j]:\n            out.append(l[i]); i += 1\n        else:\n            out.append(r[j]); j += 1\n    out.extend(l[i:]); out.extend(r[j:])\n    return out\n\nprint(merge_sort([5, 2, 4, 1, 3]))',
        output: '[1, 2, 3, 4, 5]',
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'Why merge sort is always O(n log n)',
        text:
          'The recursion tree has log n levels (we split in half each time), ' +
          'and the merge at each level touches all n elements once. log n ' +
          'levels × n work per level = O(n log n), regardless of input order.',
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'Merge sort is stable',
        text:
          'The merge takes from the left half on ties (l[i] <= r[j]), so ' +
          'equal elements from the left half stay before equal elements from ' +
          'the right — their original order is preserved. Stability is a ' +
          'byproduct of the comparison direction.',
      },
      {
        kind: 'heading',
        text: 'Quick sort: partition around a pivot',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'Lomuto partition: smaller to the left, larger to the right.',
        code: 'def quick_sort(a):\n    if len(a) <= 1:\n        return a\n    pivot = a[-1]\n    left = [x for x in a[:-1] if x <= pivot]\n    right = [x for x in a[:-1] if x > pivot]\n    return quick_sort(left) + [pivot] + quick_sort(right)\n\nprint(quick_sort([5, 2, 4, 1, 3]))',
        output: '[1, 2, 3, 4, 5]',
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'Already-sorted input is quick sort worst case',
        text:
          'If the pivot is always the largest (or smallest) element, one ' +
          'partition is empty and the recursion depth is n. That is O(n²). ' +
          'Mitigations: randomise the pivot, take median-of-three, or switch ' +
          'to a heap sort when recursion gets deep (introsort).',
      },
      {
        kind: 'heading',
        text: 'Space and stability compared',
      },
      {
        kind: 'paragraph',
        text:
          'Merge sort uses O(n) extra space (the merge output) and is stable. ' +
          'Quick sort, done in place with pointer swaps, uses O(log n) stack ' +
          'space and is NOT stable — the partition can move equal elements ' +
          'past each other. The in-place quick sort above is a teaching ' +
          'version; production quick sorts partition by index without ' +
          'allocating left/right lists.',
      },
      {
        kind: 'code',
        languageId: 'python',
        caption: 'In-place Lomuto partition (no extra lists).',
        code: 'def partition(a, lo, hi):\n    pivot = a[hi]\n    i = lo\n    for j in range(lo, hi):\n        if a[j] <= pivot:\n            a[i], a[j] = a[j], a[i]\n            i += 1\n    a[i], a[hi] = a[hi], a[i]\n    return i\n\ndef quick_sort_inplace(a, lo, hi):\n    if lo < hi:\n        p = partition(a, lo, hi)\n        quick_sort_inplace(a, lo, p - 1)\n        quick_sort_inplace(a, p + 1, hi)',
      },
      {
        kind: 'compare',
        languageIds: ['python', 'javascript'],
        caption:
          'The recursion is the same shape; JS users often write quick sort ' +
          'with filter for clarity (also O(n) extra space).',
        snippets: [
          'left = [x for x in a[:-1] if x <= pivot]\nright = [x for x in a[:-1] if x > pivot]',
          'const left = a.slice(0,-1).filter(x => x <= pivot);\nconst right = a.slice(0,-1).filter(x => x > pivot);',
        ],
      },
    ],
    animation: {
      type: 'sorting',
      title: 'Merge sort on [5,2,4,1,3]',
      steps: [
        { caption: 'Split into [5,2] and [4,1,3].' },
        { caption: 'Sort [5,2] → [2,5]. Sort [4,1,3] → [1,3,4].' },
        { caption: 'Merge [2,5] with [1,3,4]: take 1, 2, 3, 4, 5.' },
        { caption: 'Result [1,2,3,4,5]. log2(5)≈3 levels, each level does O(n) merge work.' },
      ],
    },
    activity: {
      type: 'codeChallenge',
      title: 'Implement the merge step',
      prompt:
        'Given two sorted lists l=[1,3,5] and r=[2,4,6], write merge(l,r) ' +
        'that returns [1,2,3,4,5,6]. Use the two-pointer technique; do not ' +
        'use sorted(l+r).',
      languageId: 'python',
      starterCode: 'def merge(l, r):\n    out = []\n    i = j = 0\n    # while both have elements, append the smaller\n\n    # append any remaining\n\n    return out\n\nprint(merge([1,3,5], [2,4,6]))  # [1,2,3,4,5,6]',
      checks: [
        { description: 'Uses two pointers (i and j)', assertion: { kind: 'contains', value: 'i' } },
        { description: 'Merges to sorted output', assertion: { kind: 'outputEquals', value: '[1, 2, 3, 4, 5, 6]' } },
      ],
    },
    comprehensionChecks: [
      {
        question: 'Why is merge sort always O(n log n) while quick sort can be O(n²)?',
        options: [
          'Merge sort is faster because it is stable.',
          'Merge sort always splits in half (log n levels); quick sort can split unevenly if the pivot is bad, making depth n.',
          'Quick sort uses less memory.',
          'They are the same complexity.',
        ],
        correctIndex: 1,
        explanation:
          'Merge sort halves every time, guaranteeing log n levels. Quick ' +
          'sort depth depends on the pivot: a balanced pivot gives log n, ' +
          'but the smallest/largest pivot gives depth n → O(n²).',
      },
      {
        question: 'Which statement about the two sorts is correct?',
        options: [
          'Both are stable and in-place.',
          'Merge sort is stable and uses O(n) space; quick sort is in-place and unstable.',
          'Quick sort is stable and merge sort is not.',
          'Both use O(1) space.',
        ],
        correctIndex: 1,
        explanation:
          'Merge sort needs O(n) for the merge buffer and is stable. Quick ' +
          'sort partitions in place (O(log n) stack) but the partition swaps ' +
          'can reorder equal keys, so it is unstable.',
      },
    ],
  },

  // ── 4. Counting sort ──────────────────────────────────────────────
  {
    id: 'lesson-counting-sort',
    title: 'Counting Sort: Sort Without Comparing',
    moduleId: 'module-searching-sorting',
    languageId: 'python',
    difficulty: 4,
    estimatedMinutes: 11,
    summary:
      'When keys come from a small range, counting sort runs in O(n + k) ' +
      'without any comparisons, beating the comparison-sort lower bound.',
    teachesConceptIds: ['counting-sort', 'sorting', 'array', 'complexity'],
    prerequisiteConceptIds: ['sorting', 'array', 'complexity'],
    objectives: [
      'Implement counting sort for non-negative integer keys.',
      'Explain why it is O(n + k) and when that beats O(n log n).',
      'State the comparison-sort lower bound and how counting sort escapes it.',
      'Identify the range-size constraint that limits counting sort.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'Every comparison sort (merge, quick, insertion) needs at least ' +
          'O(n log n) comparisons — that is a proven lower bound. Counting ' +
          'sort escapes the bound by NOT comparing elements. It counts how ' +
          'many of each value exist, then reconstructs the sorted output ' +
          'from the counts. The catch: the key range must be small.',
      },
      {
        kind: 'heading',
        text: 'Count, then unfold',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'Sort scores 0-10 by counting occurrences.',
        code: 'def counting_sort(a, max_val):\n    counts = [0] * (max_val + 1)\n    for v in a:\n        counts[v] += 1\n    out = []\n    for v in range(max_val + 1):\n        out.extend([v] * counts[v])\n    return out\n\nprint(counting_sort([3, 1, 2, 3, 1, 0], 3))  # max value is 3',
        output: '[0, 1, 1, 2, 3, 3]',
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'O(n + k), not O(n log n)',
        text:
          'n is the number of elements, k is the range size (max value + 1). ' +
          'Counting is O(n), unfolding is O(n + k). When k is small relative ' +
          'to n — say sorting a million test scores from 0 to 100 — this is ' +
          'O(n), vastly faster than O(n log n) comparison sorts.',
      },
      {
        kind: 'heading',
        text: 'When the range kills it',
      },
      {
        kind: 'paragraph',
        text:
          'If the keys are 64-bit integers, k is 2^64. The counts array alone ' +
          'would need 2^64 entries — impossible. Counting sort only works ' +
          'when the range is small and known, like grades 0-100, ages 0-120, ' +
          'or byte values 0-255. For arbitrary keys you fall back to ' +
          'comparison sorts or radix sort (counting sort applied per digit).',
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'Memory is the constraint',
        text:
          'The cost is O(n + k) SPACE too. A huge k means a huge counts array. ' +
          'Counting sort is fast because it trades memory for time — only ' +
          'worth it when k is modest.',
      },
      {
        kind: 'heading',
        text: 'Stability with a cumulative count',
      },
      {
        kind: 'paragraph',
        text:
          'The simple unfold above is not stable. To make counting sort stable ' +
          '(important when sorting records by a secondary key), build a ' +
          'cumulative count array (count of values ≤ v), then place elements ' +
          'from the END of the input into their counted positions. Stable and ' +
          'still O(n + k).',
      },
      {
        kind: 'code',
        languageId: 'python',
        caption: 'Stable counting sort via cumulative counts (prefix sums).',
        code: 'def counting_sort_stable(a, max_val):\n    counts = [0] * (max_val + 1)\n    for v in a: counts[v] += 1\n    # cumulative: counts[v] = number of values <= v\n    for v in range(1, max_val + 1):\n        counts[v] += counts[v - 1]\n    out = [0] * len(a)\n    for v in reversed(a):  # reverse for stability\n        counts[v] -= 1\n        out[counts[v]] = v\n    return out',
      },
      {
        kind: 'compare',
        languageIds: ['python', 'javascript'],
        caption:
          'Both allocate a counts array sized by the range. JS uses ' +
          'Array(max+1).fill(0).',
        snippets: [
          'counts = [0] * (max_val + 1)\nfor v in a: counts[v] += 1',
          'const counts = new Array(maxVal + 1).fill(0);\nfor (const v of a) counts[v]++;',
        ],
      },
    ],
    animation: {
      type: 'sorting',
      title: 'Counting sort on [3,1,2,3,1,0] (max 3)',
      steps: [
        { caption: 'Count: index 0→1, 1→2, 2→1, 3→2. counts = [1,2,1,2].' },
        { caption: 'Unfold value 0 once, 1 twice, 2 once, 3 twice.' },
        { caption: 'Output: [0,1,1,2,3,3]. No comparisons were ever made between elements.' },
        { caption: 'n=6, k=4. O(n+k)=O(10). A comparison sort would be O(n log n) ≈ O(15).' },
      ],
    },
    activity: {
      type: 'predictOutput',
      title: 'Counting sort output',
      prompt:
        'counting_sort([2,0,2,1,0], 2) — what is the sorted output?',
      languageId: 'python',
      starterCode: 'def counting_sort(a, max_val):\n    counts = [0] * (max_val + 1)\n    for v in a: counts[v] += 1\n    out = []\n    for v in range(max_val + 1):\n        out.extend([v] * counts[v])\n    return out\nprint(counting_sort([2, 0, 2, 1, 0], 2))',
      checks: [
        { description: 'Sorted output', assertion: { kind: 'outputEquals', value: '[0, 0, 1, 2, 2]' } },
      ],
    },
    comprehensionChecks: [
      {
        question: 'Counting sort is O(n + k). What is k?',
        options: [
          'The number of elements.',
          'The range of possible key values (max value + 1).',
          'The number of comparisons.',
          'The recursion depth.',
        ],
        correctIndex: 1,
        explanation:
          'k is the key range. Building and unfolding the counts array is ' +
          'O(k). When k is small the algorithm is near-linear; when k is ' +
          'huge (e.g. 64-bit ints) the counts array is infeasible.',
      },
      {
        question: 'How does counting sort beat the O(n log n) comparison-sort lower bound?',
        options: [
          'It uses a faster computer.',
          'It does not compare elements at all — the lower bound only applies to comparison sorts.',
          'It is not actually faster.',
          'It cheats by using more comparisons.',
        ],
        correctIndex: 1,
        explanation:
          'The Ω(n log n) lower bound applies only to sorts that decide order ' +
          'via pairwise comparisons. Counting sort decides order by counting ' +
          'value occurrences, so the bound does not apply to it.',
      },
    ],
  },
]
