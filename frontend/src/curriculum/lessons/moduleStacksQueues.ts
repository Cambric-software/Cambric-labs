/**
 * Cambric Labs — Module: Stacks & Queues
 *
 * Four genuine lessons on LIFO/FIFO structures. Each teaches a distinct
 * idea (LIFO semantics, FIFO semantics, both-ends access, priority
 * ordering) with different code, use cases, animations, and activities.
 */
import type { LessonDetail } from '../types'

export const stacksQueuesLessons: LessonDetail[] = [
  // ── 1. Stacks intro ───────────────────────────────────────────────
  {
    id: 'lesson-stacks-intro',
    title: 'Stacks: Last In, First Out',
    moduleId: 'module-stacks-queues',
    languageId: 'python',
    difficulty: 2,
    estimatedMinutes: 10,
    summary:
      'A stack returns the most recently added item first. This LIFO ' +
      'discipline powers undo, expression evaluation, and the call stack.',
    teachesConceptIds: ['stack-ds', 'list', 'mutation'],
    prerequisiteConceptIds: ['list', 'linked-list'],
    objectives: [
      'Push and pop elements on a stack and explain why the last item comes out first.',
      'Implement a stack using a Python list and identify its O(1) operations.',
      'Use a stack to detect balanced parentheses in an expression.',
      'Explain how the program call stack is itself a LIFO stack.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'A stack is a collection where you can only add and remove at one ' +
          'end, called the top. The last item you pushed is the first one ' +
          'you pop. That single rule — last in, first out — is enough to ' +
          'solve a surprising range of problems.',
      },
      {
        kind: 'heading',
        text: 'Push and pop are the only operations you need',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'Pushing three items then popping them back off.',
        code: 'stack = []\nstack.append("a")\nstack.append("b")\nstack.append("c")\nprint(stack.pop())  # c\nprint(stack.pop())  # b',
        output: 'c\nb',
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'Why list.append and list.pop are O(1)',
        text:
          'CPython stores a list as a growable array. Appending writes to ' +
          'the next free slot (amortized O(1)) and popping removes the last ' +
          'slot (O(1)). Both touch only the end, so they are fast and ' +
          'predictable — exactly the pattern a stack needs.',
      },
      {
        kind: 'heading',
        text: 'A stack mirrors how functions call each other',
      },
      {
        kind: 'paragraph',
        text:
          'When function A calls function B which calls function C, the ' +
          'runtime pushes A, then B, then C onto its call stack. When C ' +
          'returns, it is popped first — last called, first returned. ' +
          'Stacks are not an exotic data structure; they are how your ' +
          'program runs.',
      },
      {
        kind: 'heading',
        text: 'Use case: balanced parentheses',
      },
      {
        kind: 'paragraph',
        text:
          'Checking whether every "(" has a matching ")" is a classic stack ' +
          'problem. Walk left to right: push opens, pop on closes, and if ' +
          'a close does not match the most recent open, the string is ' +
          'unbalanced. At the end the stack must be empty.',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'A balanced-parenthesis checker using a stack.',
        code: 'def is_balanced(text):\n    pairs = {")": "(", "]": "[", "}": "{"}\n    stack = []\n    for ch in text:\n        if ch in "([{":\n            stack.append(ch)\n        elif ch in ")]}":\n            if not stack or stack.pop() != pairs[ch]:\n                return False\n    return not stack  # unbalanced if anything left\n\nprint(is_balanced("([{}])"))   # True\nprint(is_balanced("([)]"))     # False — wrong order',
        output: 'True\nFalse',
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'The order of pops is the whole test',
        text:
          '"([)]" has the right counts of each bracket but the wrong nesting. ' +
          'A stack catches this because the ")" tries to match the most ' +
          'recently pushed "[" — which fails. A counter would miss it.',
      },
      {
        kind: 'compare',
        languageIds: ['python', 'javascript'],
        caption:
          'Both languages back a stack with a dynamic array. The API differs ' +
          'but the LIFO behaviour is identical.',
        snippets: [
          's = []\ns.append(1); s.append(2)\nprint(s.pop())  # 2',
          'const s = [];\ns.push(1); s.push(2);\nconsole.log(s.pop()); // 2',
        ],
      },
    ],
    animation: {
      type: 'callStack',
      title: 'Pushing and popping to check brackets',
      steps: [
        { caption: 'Stack is empty. Read "(" — push it. Stack: ["("].', highlightLines: [6] },
        { caption: 'Read "[" — push it. Stack: ["(", "["].', highlightLines: [6] },
        { caption: 'Read "{" — push it. Stack: ["(", "[", "{"].', highlightLines: [6] },
        { caption: 'Read "}" — pop "{". It matches. Stack: ["(", "["].', highlightLines: [7, 8] },
        { caption: 'Read "]" — pop "[". It matches. Stack: ["("].', highlightLines: [7, 8] },
        { caption: 'Read ")" — pop "(". It matches. Stack empty → balanced.', highlightLines: [7, 8, 9] },
      ],
    },
    activity: {
      type: 'codeChallenge',
      title: 'Reverse a string with a stack',
      prompt:
        'Use a stack (a Python list) to reverse the string "abcde". Push each ' +
        'character, then pop them all into a result. The output must be "edcba".',
      languageId: 'python',
      starterCode: 's = "abcde"\nresult = ""\n\n# push each char onto a stack\n\n\n# pop them back off into result\n\n\nprint(result)',
      checks: [
        { description: 'Uses append to push characters', assertion: { kind: 'contains', value: '.append' } },
        { description: 'Uses pop to remove characters', assertion: { kind: 'contains', value: '.pop' } },
        { description: 'Prints the reversed string', assertion: { kind: 'outputEquals', value: 'edcba' } },
      ],
    },
    comprehensionChecks: [
      {
        question: 'You push 1, 2, 3 then pop once. What value comes out?',
        options: ['1', '2', '3', 'Nothing — stack is empty'],
        correctIndex: 2,
        explanation:
          'A stack is LIFO: the last item pushed (3) is the first popped.',
      },
      {
        question: 'Why does a counter (count opens, subtract on closes) fail to catch "([)]"?',
        options: [
          'It cannot count brackets at all.',
          'The counts are correct but the nesting is wrong, and a counter ignores order.',
          'Counters are too slow.',
          'Counters only work on square brackets.',
        ],
        correctIndex: 1,
        explanation:
          'A counter tracks how many opens remain, not which kind. A stack ' +
          'remembers the exact most-recent open, so it catches wrong nesting.',
      },
    ],
  },

  // ── 2. Queues intro ───────────────────────────────────────────────
  {
    id: 'lesson-queues-intro',
    title: 'Queues: First In, First Out',
    moduleId: 'module-stacks-queues',
    languageId: 'python',
    difficulty: 2,
    estimatedMinutes: 10,
    summary:
      'A queue returns the oldest item first. This FIFO discipline models ' +
      'fair scheduling, breadth-first traversal, and producer/consumer buffers.',
    teachesConceptIds: ['queue-ds', 'list', 'iteration'],
    prerequisiteConceptIds: ['list', 'stack-ds'],
    objectives: [
      'Enqueue and dequeue elements and explain why the oldest item comes out first.',
      'Choose collections.deque over a list for a queue and justify the O(1) dequeue.',
      'Simulate a print queue that processes jobs in arrival order.',
      'Explain why breadth-first search needs a queue rather than a stack.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'A queue is the opposite of a stack: you add at one end and remove ' +
          'from the other. The first item in is the first item out. That ' +
          'FIFO rule models anything where fairness or arrival order matters.',
      },
      {
        kind: 'heading',
        text: 'A Python list makes a bad queue',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'Naive queue using a list — pop(0) shifts every remaining element.',
        code: 'q = ["job1", "job2", "job3"]\nprint(q.pop(0))  # job1 — but jobs 2,3 just shifted left',
        output: 'job1',
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'pop(0) is O(n)',
        text:
          'Removing from the front of a list shifts all later elements one ' +
          'slot left. For a million-item queue that is a million copies per ' +
          'dequeue. The data structure is wrong for the access pattern.',
      },
      {
        kind: 'heading',
        text: 'collections.deque is the right tool',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'A deque gives O(1) append and popleft.',
        code: 'from collections import deque\nq = deque()\nq.append("job1")\nq.append("job2")\nprint(q.popleft())  # job1\nprint(q.popleft())  # job2',
        output: 'job1\njob2',
      },
      {
        kind: 'paragraph',
        text:
          'A deque is a doubly-linked block structure: appending and popping ' +
          'at either end touches only the end pointers, so both are O(1). ' +
          'For a queue, dequeue-from-front + enqueue-at-back, that is exactly ' +
          'the operations we need.',
      },
      {
        kind: 'heading',
        text: 'Use case: a fair print queue',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'Process print jobs in the order they arrived.',
        code: 'from collections import deque\n\ndef process_queue(jobs):\n    q = deque(jobs)\n    while q:\n        print("printing:", q.popleft())\n\nprocess_queue(["report", "invoice", "draft"])',
        output: 'printing: report\nprinting: invoice\nprinting: draft',
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'BFS needs FIFO',
        text:
          'Breadth-first graph traversal explores nodes in arrival order: it ' +
          'discovers a node, queues it, then dequeues nodes to expand. A ' +
          'stack would give depth-first order instead — a different algorithm.',
      },
      {
        kind: 'compare',
        languageIds: ['python', 'javascript'],
        caption:
          'Python ships deque in the stdlib; JavaScript arrays shift() is ' +
          'O(n) like Python pop(0), so JS queue users reach for a library or ' +
          'a head index.',
        snippets: [
          'from collections import deque\nq = deque([1, 2, 3])\nq.append(4)\nprint(q.popleft())  # 1',
          'const q = [1, 2, 3];\nq.push(4);\nconsole.log(q.shift()); // 1, but O(n)',
        ],
      },
    ],
    animation: {
      type: 'timeline',
      title: 'Jobs flowing through a print queue',
      steps: [
        { caption: 'Jobs "report", "invoice", "draft" enqueued in order.' },
        { caption: 'Front of queue: "report". Dequeue it → printing report.' },
        { caption: 'Front of queue: "invoice". Dequeue it → printing invoice.' },
        { caption: 'Front of queue: "draft". Dequeue it → printing draft.' },
        { caption: 'Queue empty. All jobs processed in arrival order (FIFO).' },
      ],
    },
    activity: {
      type: 'predictOutput',
      title: 'Trace the queue',
      prompt:
        'What does this print? q = deque([10, 20]); q.append(30); q.appendleft(5); print(q.popleft(), q.popleft())',
      languageId: 'python',
      starterCode: 'from collections import deque\nq = deque([10, 20])\nq.append(30)\nq.appendleft(5)\nprint(q.popleft(), q.popleft())',
      checks: [
        { description: 'Output is the two dequeued values in order', assertion: { kind: 'outputEquals', value: '5 10' } },
      ],
    },
    comprehensionChecks: [
      {
        question: 'Why is list.pop(0) a poor choice for a queue?',
        options: [
          'It does not remove the element.',
          'It is O(n) because it shifts every remaining element left.',
          'It only works on strings.',
          'It raises an error on empty lists.',
        ],
        correctIndex: 1,
        explanation:
          'Removing from the front shifts all later items, so pop(0) costs ' +
          'time proportional to the queue length. deque.popleft is O(1).',
      },
      {
        question: 'You enqueue A, B, C then dequeue twice. Which comes out?',
        options: ['C then B', 'A then B', 'B then A', 'C then A'],
        correctIndex: 1,
        explanation: 'A queue is FIFO: A (oldest) then B come out first.',
      },
    ],
  },

  // ── 3. Deque ──────────────────────────────────────────────────────
  {
    id: 'lesson-deque',
    title: 'Deques: Both Ends, Fast',
    moduleId: 'module-stacks-queues',
    languageId: 'python',
    difficulty: 3,
    estimatedMinutes: 10,
    summary:
      'A deque generalises stacks and queues: O(1) add and remove at BOTH ' +
      'ends, enabling sliding-window and palindrome algorithms.',
    teachesConceptIds: ['deque', 'queue-ds'],
    prerequisiteConceptIds: ['queue-ds', 'stack-ds'],
    objectives: [
      'Add and remove elements from both ends of a deque in O(1).',
      'Use a deque as a stack, a queue, or both at once.',
      'Implement a sliding-window maximum with a monotonic deque.',
      'Explain why a deque is faster than a list for front-end access.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'A deque — double-ended queue — removes the restriction that one ' +
          'end is only for adding and the other only for removing. You can ' +
          'push and pop at either end, all in O(1). That makes it a superset ' +
          'of both a stack and a queue.',
      },
      {
        kind: 'heading',
        text: 'Four O(1) operations instead of two',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'append, appendleft, pop, popleft — pick any end.',
        code: 'from collections import deque\nd = deque([2, 3, 4])\nd.appendleft(1)\nd.append(5)\nprint(list(d))          # [1, 2, 3, 4, 5]\nprint(d.pop())          # 5 (right end)\nprint(d.popleft())      # 1 (left end)',
        output: '[1, 2, 3, 4, 5]\n5\n1',
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'Stack + queue in one structure',
        text:
          'Use only pop and append and you have a stack. Use only popleft ' +
          'and append and you have a queue. Use all four and you have a deque. ' +
          'One type, three behaviours, by choosing which operations to call.',
      },
      {
        kind: 'heading',
        text: 'Use case: palindrome checker',
      },
      {
        kind: 'paragraph',
        text:
          'A palindrome reads the same forwards and backwards. Pop from both ' +
          'ends of a deque and compare: if every pair matches, it is a ' +
          'palindrome. This is O(n) and clearer than two-pointer index math.',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'Two-ended pop to verify symmetry.',
        code: 'from collections import deque\n\ndef is_palindrome(word):\n    d = deque(word)\n    while len(d) > 1:\n        if d.popleft() != d.pop():\n            return False\n    return True\n\nprint(is_palindrome("racecar"))  # True\nprint(is_palindrome("hello"))    # False',
        output: 'True\nFalse',
      },
      {
        kind: 'heading',
        text: 'Use case: sliding window maximum',
      },
      {
        kind: 'paragraph',
        text:
          'For each window of k items in a list, find the max. A naive scan ' +
          'is O(n·k). A monotonic deque stores useful candidates only and ' +
          'solves it in O(n): the deque front always holds the current max.',
      },
      {
        kind: 'code',
        languageId: 'python',
        caption: 'Monotonic deque keeping decreasing candidates.',
        code: 'from collections import deque\n\ndef sliding_max(nums, k):\n    dq = deque()\n    out = []\n    for i, n in enumerate(nums):\n        while dq and nums[dq[-1]] <= n:\n            dq.pop()               # smaller candidates are useless\n        dq.append(i)\n        if dq[0] <= i - k:         # front slid out of the window\n            dq.popleft()\n        if i >= k - 1:\n            out.append(nums[dq[0]])\n    return out\n\nprint(sliding_max([1, 3, -1, 5, 3, 2], 3))  # [3, 5, 5, 5]',
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'Why "monotonic"?',
        text:
          'We pop any candidate smaller than the new value because they can ' +
          'never be the window max — the newer, larger value outlives them. ' +
          'That keeps the deque decreasing, so the front is always the max.',
      },
      {
        kind: 'compare',
        languageIds: ['python', 'javascript'],
        caption:
          'Python deque is stdlib; JavaScript has no built-in deque, so the ' +
          'idiomatic equivalent is a plain array with a head index.',
        snippets: [
          'from collections import deque\nd = deque()\nd.append(1); d.appendleft(0)\nprint(d.popleft())  # 0',
          '// no deque in JS stdlib\nconst d = [];\nd.push(1); d.unshift(0);\nconsole.log(d.shift()); // 0, but O(n)',
        ],
      },
    ],
    animation: {
      type: 'dataFlow',
      title: 'Palindrome check by two-ended pop',
      steps: [
        { caption: 'deque("racecar"). Pop left "r", pop right "r" — match.' },
        { caption: 'deque("aceca"). Pop left "a", pop right "a" — match.' },
        { caption: 'deque("cec"). Pop left "c", pop right "c" — match.' },
        { caption: 'deque("e"). Length 1 — stop. Palindrome confirmed.' },
      ],
    },
    activity: {
      type: 'codeChallenge',
      title: 'Deque as a stack AND a queue',
      prompt:
        'Using a deque, append 1, then appendleft 2, then append 3. Now pop ' +
        'once (right end) and popleft once. Print the two values on one line. ' +
        'The output must be "3 2".',
      languageId: 'python',
      starterCode: 'from collections import deque\nd = deque()\n\n# append 1, appendleft 2, append 3\n\n\n# pop once, popleft once, print both\n\n',
      checks: [
        { description: 'Uses append and appendleft', assertion: { kind: 'contains', value: 'appendleft' } },
        { description: 'Uses pop and popleft', assertion: { kind: 'contains', value: 'popleft' } },
        { description: 'Prints 3 then 2', assertion: { kind: 'outputEquals', value: '3 2' } },
      ],
    },
    comprehensionChecks: [
      {
        question: 'Which operation is NOT O(1) on a collections.deque?',
        options: ['append', 'appendleft', 'pop', 'accessing d[500] by index'],
        correctIndex: 3,
        explanation:
          'Indexed access into the middle of a deque is O(n) — it must walk ' +
          'the block list. Only the two ends are O(1).',
      },
      {
        question: 'In the sliding-window max, why do we pop smaller candidates before appending?',
        options: [
          'To keep the deque short.',
          'Because a smaller, older value can never be a future max once a larger, newer value exists.',
          'To sort the deque.',
          'To avoid duplicates.',
        ],
        correctIndex: 1,
        explanation:
          'A newer, larger value outlives any older, smaller one, so the ' +
          'smaller one can never become the window max. Removing it keeps ' +
          'the deque monotonic and the front equal to the current max.',
      },
    ],
  },

  // ── 4. Priority queues ────────────────────────────────────────────
  {
    id: 'lesson-priority-queues',
    title: 'Priority Queues: Out by Importance',
    moduleId: 'module-stacks-queues',
    languageId: 'python',
    difficulty: 3,
    estimatedMinutes: 12,
    summary:
      'A priority queue dequeues the highest-priority element, not the ' +
      'oldest. A binary heap backs it so both insert and extract are O(log n).',
    teachesConceptIds: ['priority-queue', 'heap'],
    prerequisiteConceptIds: ['queue-ds', 'heap'],
    objectives: [
      'Distinguish a priority queue from a plain FIFO queue.',
      'Use heapq to insert and extract the smallest element.',
      'Explain why a sorted list is the wrong backing structure.',
      'Apply a priority queue to merge k sorted streams.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'In an emergency room, the next patient is not the one who arrived ' +
          'first — it is the one in the worst condition. A priority queue ' +
          'generalises a queue: each element has a priority, and dequeue ' +
          'always returns the highest-priority one, regardless of arrival order.',
      },
      {
        kind: 'heading',
        text: 'A sorted list feels right but is wrong',
      },
      {
        kind: 'code',
        languageId: 'python',
        caption: 'Naive priority queue via bisect — insert is O(n) due to the shift.',
        code: 'import bisect\npq = []\nbisect.insort(pq, (3, "low"))\nbisect.insort(pq, (1, "high"))\nbisect.insort(pq, (2, "mid"))\nprint(pq[0])  # (1, "high") — peek is O(1)\n# but every insort shifted elements — O(n) per insert',
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'Sorted insert is O(n)',
        text:
          'Keeping a list sorted means each insert shifts half the list on ' +
          'average. For n inserts that is O(n²) total — fine for 100 items, ' +
          'painful for a million.',
      },
      {
        kind: 'heading',
        text: 'A binary heap gives O(log n) on both ends',
      },
      {
        kind: 'paragraph',
        text:
          'A heap is a partially-ordered binary tree: each parent is smaller ' +
          '(or larger) than its children. It does NOT fully sort the data — ' +
          'it only guarantees the root is the extreme. That weaker promise ' +
          'is enough for a priority queue and lets both insert and extract ' +
          'cost O(log n) instead of O(n).',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'heapq implements a min-heap over a plain list.',
        code: 'import heapq\npq = []\nheapq.heappush(pq, 3)\nheapq.heappush(pq, 1)\nheapq.heappush(pq, 2)\nprint(heapq.heappop(pq))  # 1 (smallest)\nprint(heapq.heappop(pq))  # 2',
        output: '1\n2',
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'heapq is a min-heap — pop gives the smallest',
        text:
          'For a max-priority queue, store negated priorities (push -priority) ' +
          'or wrap items in a class with reversed comparison. The structure ' +
          'is identical; only the comparison direction flips.',
      },
      {
        kind: 'heading',
        text: 'Use case: merge k sorted streams',
      },
      {
        kind: 'paragraph',
        text:
          'Given k sorted lists, produce one merged sorted output. The next ' +
          'smallest overall item must be among the k current heads. A heap ' +
          'of those heads gives the next smallest in O(log k), and we refill ' +
          'from the winner list — O(n log k) total instead of O(n·k).',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'Merge k sorted lists with a heap.',
        code: 'import heapq\n\ndef merge_sorted(lists):\n    pq = []\n    for i, lst in enumerate(lists):\n        heapq.heappush(pq, (lst[0], i, 0))\n    out = []\n    while pq:\n        val, i, j = heapq.heappop(pq)\n        out.append(val)\n        if j + 1 < len(lists[i]):\n            heapq.heappush(pq, (lists[i][j + 1], i, j + 1))\n    return out\n\nprint(merge_sorted([[1, 4, 7], [2, 5, 8], [3, 6, 9]]))',
        output: '[1, 2, 3, 4, 5, 6, 7, 8, 9]',
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'Same structure, different algorithm',
        text:
          'Dijkstra shortest path picks the next-closest unvisited node the ' +
          'same way: a priority queue over frontier nodes, keyed by distance. ' +
          'Swap the priority meaning and the same heap solves it.',
      },
      {
        kind: 'compare',
        languageIds: ['python', 'javascript'],
        caption:
          'Python ships heapq; JavaScript has no stdlib heap, so JS users ' +
          'roll their own or use a library.',
        snippets: [
          'import heapq\npq = []\nheapq.heappush(pq, 3)\nheapq.heappush(pq, 1)\nprint(heapq.heappop(pq))  # 1',
          '// no stdlib heap in JS\n// typical hand-rolled or library-based\n// const pq = new MinHeap(); pq.push(3); pq.push(1);\n// console.log(pq.pop()); // 1',
        ],
      },
    ],
    animation: {
      type: 'memoryDiagram',
      title: 'A heap is only partially ordered',
      steps: [
        { caption: 'Push 3 → heap [3]. Root is 3.' },
        { caption: 'Push 1 → bubble up: 1 < 3, swap. Heap [1, 3]. Root is 1.' },
        { caption: 'Push 2 → bubble up past 3 only (2 < 3), but 2 > 1 so stop. Heap [1, 3, 2].' },
        { caption: 'Pop → return root 1, move 2 to root, sift down. Heap [2, 3].' },
        { caption: 'Note: 2 and 3 are NOT sorted, but the root (2) is the smallest — that is all a heap promises.' },
      ],
    },
    activity: {
      type: 'predictOutput',
      title: 'Trace the heap',
      prompt:
        'Push 5, 2, 8, 1 in that order to an empty heapq, then pop twice. ' +
        'What two values come out (in pop order)?',
      languageId: 'python',
      starterCode: 'import heapq\npq = []\nfor n in [5, 2, 8, 1]:\n    heapq.heappush(pq, n)\nprint(heapq.heappop(pq), heapq.heappop(pq))',
      checks: [
        { description: 'Output is the two smallest, in order', assertion: { kind: 'outputEquals', value: '1 2' } },
      ],
    },
    comprehensionChecks: [
      {
        question: 'Why is a sorted list a poor backing for a priority queue?',
        options: [
          'Peeking the smallest is O(n).',
          'Inserting in sorted order is O(n) because of element shifts.',
          'It cannot store tuples.',
          'It uses too much memory.',
        ],
        correctIndex: 1,
        explanation:
          'bisect.insort finds the position in O(log n) but then shifts up ' +
          'to n elements — O(n) per insert, O(n²) for n inserts. A heap is ' +
          'O(log n) per insert.',
      },
      {
        question: 'A heap guarantees which property?',
        options: [
          'The array is fully sorted.',
          'Every parent is ordered relative to its children, but siblings are unordered.',
          'Elements are stored in arrival order.',
          'All leaves are at the same depth.',
        ],
        correctIndex: 1,
        explanation:
          'A heap only promises the heap property (parent vs children). ' +
          'Siblings and the full array may be unsorted — that is why pop ' +
          'must sift down to restore the property.',
      },
    ],
  },
]
