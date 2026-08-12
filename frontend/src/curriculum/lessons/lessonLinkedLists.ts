/**
 * Cambric Labs — Lesson: Linked Lists
 *
 * Teaches linked lists by MOTIVATION (why you'd want one), not just definition.
 * Connects to the pointer concept and the array the learner already knows,
 * showing the trade-off: O(1) insertion vs O(n) random access.
 */
import type { LessonDetail } from '../types'

export const lessonLinkedLists: LessonDetail = {
  id: 'lesson-linked-lists',
  title: 'Linked Lists: Trading Random Access for Fast Insertion',
  moduleId: 'module-linked-lists',
  languageId: 'python',
  difficulty: 3,
  estimatedMinutes: 14,
  summary:
    'A chain of nodes where each points to the next. Covers why linked lists ' +
    'exist, head/traversal, insertion, and the trade-off versus arrays.',
  teachesConceptIds: ['linked-list', 'pointer', 'data-structure', 'node', 'iteration'],
  prerequisiteConceptIds: ['data-structure', 'array', 'iteration'],
  objectives: [
    'Explain why a linked list exists when arrays already store sequences.',
    'Traverse a linked list from head to tail following pointers.',
    'Insert a node at the head in O(1) time.',
    'State the trade-off: O(1) insertion vs O(n) random access.',
  ],
  content: [
    {
      kind: 'paragraph',
      text:
        'You already know one way to store a sequence: an array (a Python list). ' +
        'Arrays give you O(1) access to any element by index — you can jump ' +
        'straight to list[5000]. But inserting at the FRONT of a large array ' +
        'means shifting every element over by one — O(n) work. A linked list ' +
        'flips this trade: it gives up fast random access in exchange for ' +
        'constant-time insertion and deletion anywhere in the list.',
    },
    {
      kind: 'callout',
      variant: 'info',
      title: 'The core idea: each node knows where the NEXT node is',
      text:
        'A linked list is a chain of NODES. Each node holds a value AND a ' +
        'reference (a pointer) to the next node. The list keeps a HEAD pointer ' +
        'to the first node. The last node points to nothing (null). You reach ' +
        'any node by starting at the head and following "next" pointers — one ' +
        'hop at a time.',
    },
    {
      kind: 'heading',
      text: 'Building a linked list in Python',
    },
    {
      kind: 'codeWithOutput',
      languageId: 'python',
      caption: 'A node is just a value plus a pointer to the next node.',
      code:
        'class Node:\n    def __init__(self, value, next=None):\n        self.value = value\n        self.next = next\n\n# Build: 10 -> 20 -> 30\ntail = Node(30)\nmid = Node(20, tail)\nhead = Node(10, mid)\n\nprint(head.value)           # 10\nprint(head.next.value)      # 20\nprint(head.next.next.value) # 30',
      output: '10\n20\n30',
    },
    {
      kind: 'paragraph',
      text:
        'Notice: there is no index. To reach the 3rd node, you wrote ' +
        'head.next.next — you hopped twice. To reach the 1000th node, you would ' +
        'hop 999 times. This is O(n) access. That is the price of the structure.',
    },
    {
      kind: 'heading',
      text: 'Traversal: the only way to visit every node',
    },
    {
      kind: 'codeWithOutput',
      languageId: 'python',
      caption: 'Walk the chain by following next until you hit the end (None).',
      code:
        'def print_list(head):\n    current = head\n    while current is not None:\n        print(current.value, end=" ")\n        current = current.next\n    print()\n\nprint_list(head)',
      output: '10 20 30',
    },
    {
      kind: 'callout',
      variant: 'tip',
      title: 'The traversal loop is the linked-list signature',
      text:
        'current = current.next is the ONE line that defines linked-list ' +
        'traversal. Every linked-list algorithm — search, insertion, deletion, ' +
        'reversal — is built around this single hop. Memorize this pattern; ' +
        'you will write it hundreds of times.',
    },
    {
      kind: 'heading',
      text: 'Insertion at the head: O(1), no shifting',
    },
    {
      kind: 'codeWithOutput',
      languageId: 'python',
      caption: 'To prepend, make a new node pointing at the old head, then move head.',
      code:
        'def insert_head(head, value):\n    new_node = Node(value, head)\n    return new_node   # the new node is now the head\n\nhead = insert_head(head, 5)\nprint_list(head)  # 5 10 20 30',
      output: '5 10 20 30',
    },
    {
      kind: 'paragraph',
      text:
        'That is it — two lines. No shifting 10,000 elements. The new node ' +
        'simply points at whatever the old head pointed at, and we update head. ' +
        'This is why linked lists shine when you frequently add or remove from ' +
        'the front: each operation is constant time, independent of list size.',
    },
    {
      kind: 'heading',
      text: 'The trade-off, made explicit',
    },
    {
      kind: 'steps',
      caption: 'Arrays vs linked lists — when to use which',
      steps: [
        'Need O(1) access to element #N by position? Use an ARRAY (list[n] is instant).',
        'Need to frequently insert/delete at the FRONT or MIDDLE? Use a LINKED LIST (no shifting).',
        'Need to iterate over everything in order? Both work, but arrays are more cache-friendly.',
        'Need a fixed, known size? Arrays. Need to grow/shrink a lot by insertion? Linked list.',
        'In practice: arrays win most of the time because cache and O(1) indexing matter more than insertion speed for most workloads.',
      ],
    },
    {
      kind: 'compare',
      languageIds: ['python', 'javascript'],
      caption:
        'The node-and-next pattern is identical across languages; only syntax differs. ' +
        'In JS the "pointer" is just an object reference.',
      snippets: [
        'class Node:\n    def __init__(self, value, next=None):\n        self.value = value\n        self.next = next\n\nhead = Node(10, Node(20, Node(30)))',
        'class Node {\n  constructor(value, next = null) {\n    this.value = value;\n    this.next = next;\n  }\n}\nconst head = new Node(10, new Node(20, new Node(30)));',
      ],
    },
    {
      kind: 'callout',
      variant: 'warning',
      title: 'The pointer is the abstraction',
      text:
        'A "pointer" is not magic — it is just a value that tells you where ' +
        'something else is. In Python and JS, object references ARE pointers ' +
        '(managed by the runtime). In C, you see the raw addresses. The concept ' +
        'is the same: a node holds a value plus the LOCATION of the next node. ' +
        'That indirection is what makes the chain work.',
    },
  ],
  animation: {
    type: 'dataFlow',
    title: 'Inserting 5 at the head of 10 -> 20 -> 30',
    steps: [
      { caption: 'Current list: head -> [10] -> [20] -> [30] -> None.', highlightLines: [1, 2, 3] },
      { caption: 'Create new node [5]. Its next is set to the current head (node 10).', highlightLines: [2] },
      { caption: 'List now: [5] -> [10] -> [20] -> [30] -> None. But head still points to [10].', highlightLines: [2, 3] },
      { caption: 'Update head to point to the new node [5].', highlightLines: [3] },
      { caption: 'Done. head -> [5] -> [10] -> [20] -> [30] -> None. Insertion was O(1) — no shifting.', highlightLines: [4] },
    ],
  },
  activity: {
    type: 'codeChallenge',
    title: 'Count the nodes in a linked list',
    prompt:
      'Write a function count_nodes(head) that returns the number of nodes in ' +
      'a linked list. Traverse from head following .next until None, counting. ' +
      'For head = Node(10, Node(20, Node(30))), count_nodes should return 3.',
    languageId: 'python',
    starterCode:
      'class Node:\n    def __init__(self, value, next=None):\n        self.value = value\n        self.next = next\n\ndef count_nodes(head):\n    count = 0\n    # traverse and count\n\n    return count\n\nhead = Node(10, Node(20, Node(30)))\nprint(count_nodes(head))',
    checks: [
      { description: 'Uses a while loop to traverse', assertion: { kind: 'contains', value: 'while' } },
      { description: 'Follows .next', assertion: { kind: 'contains', value: '.next' } },
      { description: 'Prints 3', assertion: { kind: 'outputEquals', value: '3' } },
    ],
  },
  comprehensionChecks: [
    {
      question: 'What is the time complexity of accessing the 1000th element of a linked list?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
      correctIndex: 2,
      explanation:
        'You must hop 999 times from the head to reach the 1000th node. There is ' +
        'no way to jump there directly — there is no index. So access is O(n).',
    },
    {
      question: 'Why is inserting at the head of a linked list O(1)?',
      options: [
        'The list re-sorts itself automatically',
        'You only create a node and update two pointers — no shifting',
        'Linked lists are always faster than arrays',
        'The runtime caches the head position',
      ],
      correctIndex: 1,
      explanation:
        'Insertion at the head takes two operations regardless of list size: ' +
        'point the new node at the old head, then update head. No other nodes ' +
        'move. That is constant time.',
    },
    {
      question: 'When would you choose a linked list over an array?',
      options: [
        'When you need fast random access by index',
        'When memory is very limited and contiguous blocks are expensive',
        'When you frequently insert/delete at the front or middle',
        'Never — arrays are always better',
      ],
      correctIndex: 2,
      explanation:
        'If your workload is dominated by insertions and deletions (especially ' +
        'at the front or middle), a linked list avoids the O(n) shifting that ' +
        'arrays require. For index-heavy or iteration-heavy work, arrays win.',
    },
  ],
}
