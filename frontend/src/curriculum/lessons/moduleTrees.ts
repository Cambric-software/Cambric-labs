/**
 * Cambric Labs — Module: Trees
 *
 * Four genuine lessons on hierarchical data. Each teaches a distinct tree
 * variant (general binary tree, search tree, heap, prefix tree) with
 * different algorithms and trade-offs.
 */
import type { LessonDetail } from '../types'

export const treesLessons: LessonDetail[] = [
  // ── 1. Binary trees ───────────────────────────────────────────────
  {
    id: 'lesson-binary-trees',
    title: 'Binary Trees: Two Children, Many Uses',
    moduleId: 'module-trees',
    languageId: 'python',
    difficulty: 3,
    estimatedMinutes: 12,
    summary:
      'A binary tree links each node to at most two children. Traversals ' +
      '(in/pre/post-order) visit nodes in genuinely different orders.',
    teachesConceptIds: ['tree', 'binary-tree', 'recursion', 'node'],
    prerequisiteConceptIds: ['linked-list', 'recursion', 'node'],
    objectives: [
      'Define a binary tree node with a value and left/right children.',
      'Implement in-order, pre-order, and post-order traversals recursively.',
      'Distinguish the visit orders and when each is useful.',
      'Explain why tree algorithms are naturally recursive.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'A binary tree is a node with a value and up to two children, left ' +
          'and right, each itself a binary tree. That recursive definition is ' +
          'why tree code is almost always recursive: the structure repeats ' +
          'itself at every node.',
      },
      {
        kind: 'heading',
        text: 'A node class with two links',
      },
      {
        kind: 'code',
        languageId: 'python',
        caption: 'A binary tree node — value plus two optional child links.',
        code: 'class TreeNode:\n    def __init__(self, value, left=None, right=None):\n        self.value = value\n        self.left = left\n        self.right = right\n\n# Build:       1\n#            /   \\\n#           2     3\nroot = TreeNode(1,\n    TreeNode(2),\n    TreeNode(3))',
      },
      {
        kind: 'heading',
        text: 'Three traversals, three orders',
      },
      {
        kind: 'paragraph',
        text:
          'A traversal visits every node once. The only difference between ' +
          'in-order, pre-order, and post-order is WHEN you visit the current ' +
          'node relative to its children. That ordering choice changes what ' +
          'the traversal is good for.',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'The three classical depth-first traversals.',
        code: 'def in_order(node):\n    if node is None: return\n    in_order(node.left)\n    print(node.value, end=" ")\n    in_order(node.right)\n\ndef pre_order(node):\n    if node is None: return\n    print(node.value, end=" ")\n    pre_order(node.left)\n    pre_order(node.right)\n\ndef post_order(node):\n    if node is None: return\n    post_order(node.left)\n    post_order(node.right)\n    print(node.value, end=" ")\n\nin_order(root)    # 2 1 3\npre_order(root)  # 1 2 3\npost_order(root) # 2 3 1',
        output: '2 1 3 1 2 3 2 3 1',
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'Memorise the name, not the code',
        text:
          '"Pre" means visit the node before its children. "In" means between ' +
          'them. "Post" means after. The code is identical except for where ' +
          'the print sits — before, between, or after the two recursive calls.',
      },
      {
        kind: 'heading',
        text: 'When does each traversal matter?',
      },
      {
        kind: 'paragraph',
        text:
          'In-order on a binary search tree yields sorted values. Pre-order ' +
          'is how you serialise a tree to disk (root first, so you can rebuild). ' +
          'Post-order is how you delete a tree safely (free children before ' +
          'the parent) and how you evaluate an expression tree (compute ' +
          'subtrees before applying the operator at the root).',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'Expression tree: (2 + 3) * 4 evaluates bottom-up via post-order.',
        code: '#        *\n#       / \\\n#      +   4\n#     / \\\n#    2   3\nexpr = TreeNode("*",\n    TreeNode("+", TreeNode(2), TreeNode(3)),\n    TreeNode(4))\n\ndef eval_tree(node):\n    if isinstance(node.value, int):\n        return node.value\n    a = eval_tree(node.left)\n    b = eval_tree(node.right)\n    return a + b if node.value == "+" else a * b\n\nprint(eval_tree(expr))',
        output: '20',
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'Post-order is forced by dependencies',
        text:
          'You cannot multiply until both operands are known. The operands ' +
          'live in subtrees, so they must evaluate first. Post-order visits ' +
          'the operator last, exactly when its inputs are ready.',
      },
      {
        kind: 'compare',
        languageIds: ['python', 'javascript'],
        caption:
          'Both define a node as {value,left,right}. Python uses a class; ' +
          'JavaScript the same shape as an object literal.',
        snippets: [
          'class TreeNode:\n    def __init__(self, v, l=None, r=None):\n        self.value, self.left, self.right = v, l, r',
          'class TreeNode {\n  constructor(v, l = null, r = null) {\n    this.value = v; this.left = l; this.right = r;\n  }\n}',
        ],
      },
    ],
    animation: {
      type: 'treeTraversal',
      title: 'In vs pre vs post order on the same tree',
      steps: [
        { caption: 'Tree: root 1, left 2, right 3.', payload: { tree: [1, 2, 3] } },
        { caption: 'In-order: go left (2), visit 2, back to root, visit 1, right (3), visit 3 → 2 1 3.' },
        { caption: 'Pre-order: visit 1 first, then left 2, then right 3 → 1 2 3.' },
        { caption: 'Post-order: left 2, right 3, then root 1 last → 2 3 1.' },
        { caption: 'Same tree, same recursion — only the visit timing differs.' },
      ],
    },
    activity: {
      type: 'predictOutput',
      title: 'Predict the in-order output',
      prompt:
        'Tree: root 4, left child 2 (with left 1, right 3), right child 6 ' +
        '(with left 5, right 7). What does in-order print?',
      languageId: 'python',
      starterCode: '#        4\n#      /   \\\n#     2     6\n#    / \\   / \\\n#   1   3 5   7\n# in_order(root) prints:',
      checks: [
        { description: 'In-order of a BST yields sorted order', assertion: { kind: 'outputEquals', value: '1 2 3 4 5 6 7' } },
      ],
    },
    comprehensionChecks: [
      {
        question: 'In which traversal do you visit the node BETWEEN its two children?',
        options: ['Pre-order', 'In-order', 'Post-order', 'Level-order'],
        correctIndex: 1,
        explanation:
          'In-order visits left, then current, then right — the current ' +
          'node is visited in between its children.',
      },
      {
        question: 'Why does evaluating an expression tree require post-order?',
        options: [
          'Post-order is faster.',
          'The operator at the root needs both subtree results first, so subtrees must evaluate before the root.',
          'Post-order uses less memory.',
          'It does not — any order works.',
        ],
        correctIndex: 1,
        explanation:
          'You cannot apply an operator until its operands are computed. ' +
          'Post-order guarantees children are fully processed before the parent.',
      },
    ],
  },

  // ── 2. Binary search trees ────────────────────────────────────────
  {
    id: 'lesson-bst',
    title: 'Binary Search Trees: Ordered for O(log n) Lookup',
    moduleId: 'module-trees',
    languageId: 'python',
    difficulty: 3,
    estimatedMinutes: 12,
    summary:
      'A BST keeps left descendants smaller and right descendants larger, ' +
      'so search, insert, and delete are O(log n) when the tree is balanced.',
    teachesConceptIds: ['bst', 'binary-tree', 'recursion', 'searching'],
    prerequisiteConceptIds: ['binary-tree', 'recursion', 'searching'],
    objectives: [
      'State the BST invariant and explain how it enables binary search.',
      'Insert and search in a BST recursively.',
      'Explain why an unbalanced BST degrades to O(n).',
      'Delete a node with two children using the successor strategy.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'A binary search tree adds one rule to a binary tree: every value ' +
          'in the left subtree is smaller than the node, and every value in ' +
          'the right subtree is larger. That single invariant makes search ' +
          'binary: at each node, discard half the tree.',
      },
      {
        kind: 'heading',
        text: 'Search is the same shape as binary search on an array',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'Recursive search: go left if smaller, right if larger.',
        code: 'class Node:\n    def __init__(self, v):\n        self.value = v\n        self.left = self.right = None\n\ndef search(node, target):\n    if node is None:\n        return False\n    if target == node.value:\n        return True\n    if target < node.value:\n        return search(node.left, target)\n    return search(node.right, target)\n\n# Build a small BST\nroot = Node(10); root.left = Node(5); root.right = Node(15)\nprint(search(root, 15))  # True\nprint(search(root, 7))   # False',
        output: 'True\nFalse',
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'In-order of a BST yields sorted data',
        text:
          'Because left < node < right, an in-order traversal emits values ' +
          'in ascending order. A BST is, in effect, a sorted structure you ' +
          'can also search — it is the bridge between arrays and trees.',
      },
      {
        kind: 'heading',
        text: 'Insert preserves the invariant',
      },
      {
        kind: 'code',
        languageId: 'python',
        caption: 'Insert walks down as if searching, then attaches a new leaf where it falls off.',
        code: 'def insert(node, v):\n    if node is None:\n        return Node(v)\n    if v < node.value:\n        node.left = insert(node.left, v)\n    elif v > node.value:\n        node.right = insert(node.right, v)\n    return node  # equal: ignore or handle duplicates per policy',
      },
      {
        kind: 'heading',
        text: 'The balance trap: why BSTs can become O(n)',
      },
      {
        kind: 'paragraph',
        text:
          'Insert 1, 2, 3, 4 in order and every new node goes to the right. ' +
          'The tree becomes a linked list. Search now walks the whole chain ' +
          '— O(n), not O(log n). The BST invariant is about ORDER, not SHAPE; ' +
          'a balanced tree (AVL, red-black) adds shape rules to fix this.',
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'Sorted input is the worst case',
        text:
          'Inserting pre-sorted data into a naive BST produces a degenerate ' +
          'spine. Real systems either randomise insertion, use a self- ' +
          'balancing variant, or build from sorted data via recursive ' +
          'midpoint splitting.',
      },
      {
        kind: 'heading',
        text: 'Delete with two children: borrow the successor',
      },
      {
        kind: 'paragraph',
        text:
          'Deleting a node with two children is the tricky case: you cannot ' +
          'just remove it — both subtrees would be orphaned. The fix is to ' +
          'find the successor (smallest value in the right subtree), copy its ' +
          'value into the node, then delete the successor (which has at most ' +
          'one child, an easy case).',
      },
      {
        kind: 'code',
        languageId: 'python',
        caption: 'The successor is the leftmost node of the right subtree.',
        code: 'def min_node(node):\n    while node.left:\n        node = node.left\n    return node\n\ndef delete(node, v):\n    if node is None: return None\n    if v < node.value:\n        node.left = delete(node.left, v)\n    elif v > node.value:\n        node.right = delete(node.right, v)\n    else:\n        # found the node to delete\n        if node.left is None: return node.right\n        if node.right is None: return node.left\n        succ = min_node(node.right)\n        node.value = succ.value\n        node.right = delete(node.right, succ.value)\n    return node',
      },
      {
        kind: 'compare',
        languageIds: ['python', 'java'],
        caption:
          'Python uses a class with None children; Java uses null and a ' +
          'typical generic class. The algorithm is identical.',
        snippets: [
          'class Node:\n    def __init__(self, v):\n        self.value = v\n        self.left = self.right = None',
          'class Node<T> {\n    T value;\n    Node<T> left, right;\n    Node(T v) { this.value = v; }\n}',
        ],
      },
    ],
    animation: {
      type: 'treeTraversal',
      title: 'Searching a BST: halving the candidates each step',
      steps: [
        { caption: 'Root 10. Search for 15. 15 > 10 → go right.' },
        { caption: 'At node 15. 15 == 15 → found.' },
        { caption: 'Two comparisons. An array linear search would take up to 3; a larger BST saves more.' },
        { caption: 'Now search for 7. 7 < 10 → go left to node 5.' },
        { caption: '7 > 5 → go right, but right is None → not found. Still O(height).' },
      ],
    },
    activity: {
      type: 'codeChallenge',
      title: 'Implement BST insert',
      prompt:
        'Implement insert(node, v) so that inserting 5, 3, 7 into an empty ' +
        'tree (None) produces a valid BST. Your function must be recursive ' +
        'and return the (sub)tree root.',
      languageId: 'python',
      starterCode: 'class Node:\n    def __init__(self, v):\n        self.value = v\n        self.left = self.right = None\n\ndef insert(node, v):\n    # base case: empty slot\n\n    # recurse left or right\n\n    return node\n\nroot = None\nfor v in [5, 3, 7]:\n    root = insert(root, v)\nprint(root.value, root.left.value, root.right.value)',
      checks: [
        { description: 'Recursion is used', assertion: { kind: 'contains', value: 'insert(' } },
        { description: 'Base case returns a new Node', assertion: { kind: 'contains', value: 'Node(' } },
        { description: 'Root is 5 with left 3 and right 7', assertion: { kind: 'outputEquals', value: '5 3 7' } },
      ],
    },
    comprehensionChecks: [
      {
        question: 'Inserting 1,2,3,4 in order into a naive BST produces what shape?',
        options: [
          'A perfectly balanced tree.',
          'A right-leaning spine — essentially a linked list.',
          'A left-leaning spine.',
          'A tree with two leaves.',
        ],
        correctIndex: 1,
        explanation:
          'Each new value is larger, so it always goes right. The tree ' +
          'degenerates into a chain, making search O(n).',
      },
      {
        question: 'When deleting a node with two children, where does the replacement value come from?',
        options: [
          'The root.',
          'The leftmost (smallest) node of the right subtree.',
          'A newly created node.',
          'The parent of the deleted node.',
        ],
        correctIndex: 1,
        explanation:
          'The successor — smallest value in the right subtree — is the ' +
          'next-larger value, so copying it preserves the BST invariant. ' +
          'The successor then gets deleted (it has at most one child).',
      },
    ],
  },

  // ── 3. Heaps ──────────────────────────────────────────────────────
  {
    id: 'lesson-heaps',
    title: 'Heaps: The Root Is Always the Extreme',
    moduleId: 'module-trees',
    languageId: 'python',
    difficulty: 3,
    estimatedMinutes: 12,
    summary:
      'A heap is a complete binary tree where each parent is ordered against ' +
      'its children. Only the root (the min or max) is guaranteed, which is ' +
      'enough to power a priority queue.',
    teachesConceptIds: ['heap', 'tree', 'array', 'priority-queue'],
    prerequisiteConceptIds: ['binary-tree', 'array', 'priority-queue'],
    objectives: [
      'Map a heap onto an array using parent/child index arithmetic.',
      'Explain why a heap is only partially ordered, not fully sorted.',
      'Push and pop in O(log n) via sift-up and sift-down.',
      'Build a heap from an array in O(n) bottom-up.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'A heap weakens the BST rule: instead of ordering ALL descendants, ' +
          'it only guarantees each parent is smaller (min-heap) or larger ' +
          '(max-heap) than its OWN children. Siblings can be in any order. ' +
          'That weaker promise is enough for "give me the extreme" and lets ' +
          'us store the whole tree in a flat array.',
      },
      {
        kind: 'heading',
        text: 'An array is a complete binary tree',
      },
      {
        kind: 'paragraph',
        text:
          'Index a node at i. Its left child is at 2i+1, right at 2i+2, parent ' +
          'at (i-1)//2. No pointers needed — the positions encode the tree. ' +
          'This is why heapq is just a list.',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'The same data as array and as tree.',
        code: '# Tree:       1\n#           /   \\\n#          3     2\nheap = [1, 3, 2]\nprint(heap[0])           # 1 — root is the min\nprint(heap[1], heap[2])   # 3 2 — children, unordered\n# parent of index 2 is (2-1)//2 = 0 → root',
        output: '1\n3 2',
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'Only the root is special',
        text:
          'heap[0] is always the min. heap[1] and heap[2] are children of ' +
          'the root but their order relative to each other is unspecified. ' +
          'If you need full order, use a sorted structure — a heap is for ' +
          'priority-queue operations, not iteration.',
      },
      {
        kind: 'heading',
        text: 'Push sifts up; pop sifts down',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'heapq implements sift-up and sift-down over a list.',
        code: 'import heapq\nh = []\nfor v in [5, 3, 8, 1]:\n    heapq.heappush(h, v)   # sift-up: bubble new value toward root\nprint(h)                  # [1, 3, 8, 5] — note: NOT sorted\n\nprint(heapq.heappop(h))   # 1 — move last to root, sift down\nprint(h)                  # [3, 5, 8]',
        output: '[1, 3, 8, 5]\n1\n[3, 5, 8]',
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'Sift-up vs sift-down',
        text:
          'Push appends at the end (the next free leaf) and sifts UP while ' +
          'it is smaller than its parent. Pop removes the root, moves the ' +
          'last leaf to the root, and sifts DOWN by swapping with the ' +
          'smaller child. Both touch at most the tree height — O(log n).',
      },
      {
        kind: 'heading',
        text: 'Build a heap in O(n), not O(n log n)',
      },
      {
        kind: 'paragraph',
        text:
          'heapify turns an arbitrary list into a heap in linear time. The ' +
          'trick: sift-down every non-leaf from the bottom up. Half the ' +
          'nodes (leaves) need no work; the rest sift down at most ' +
          'proportional to their height, which sums to O(n).',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'heapify is faster than pushing one at a time.',
        code: 'import heapq\nnums = [9, 4, 7, 1, 6]\nheapq.heapify(nums)   # O(n), in place\nprint(nums)            # [1, 4, 7, 9, 6] — heap, not sorted\nprint(heapq.heappop(nums))  # 1',
        output: '[1, 4, 7, 9, 6]\n1',
      },
      {
        kind: 'compare',
        languageIds: ['python', 'java'],
        caption:
          'Python heapq is a min-heap over a list. Java PriorityQueue is a ' +
          'min-heap by default but exposes a queue API, not raw array ops.',
        snippets: [
          'import heapq\nh = []\nheapq.heappush(h, 3)\nprint(heapq.heappop(h))  # 3',
          'import java.util.*;\nvar pq = new PriorityQueue<Integer>();\npq.offer(3);\nSystem.out.println(pq.poll()); // 3',
        ],
      },
    ],
    animation: {
      type: 'memoryDiagram',
      title: 'Push 1 into heap [3,8,5]: sift up',
      steps: [
        { caption: 'Append 1 at index 3. Parent index (3-1)//2 = 1 → value 8.' },
        { caption: '1 < 8 → swap. Heap now [3,1,5,8]. Parent of index 1 is 0 → value 3.' },
        { caption: '1 < 3 → swap. Heap now [1,3,5,8]. Index 0 is root → stop.' },
        { caption: 'Root is 1, the new min. The heap property holds everywhere.' },
      ],
    },
    activity: {
      type: 'predictOutput',
      title: 'Trace heapify',
      prompt:
        'What is the array after heapq.heapify([4, 2, 9, 1])? (Any valid ' +
        'min-heap ordering is acceptable; the root must be 1.)',
      languageId: 'python',
      starterCode: 'import heapq\nh = [4, 2, 9, 1]\nheapq.heapify(h)\nprint(h)\n# root must be 1',
      checks: [
        { description: 'Root (first element) is 1', assertion: { kind: 'matchesRegex', pattern: '^\\[1' } },
      ],
    },
    comprehensionChecks: [
      {
        question: 'In a min-heap stored as an array, what is the index of the parent of node i?',
        options: ['i // 2', '(i - 1) // 2', '2 * i', 'i + 1'],
        correctIndex: 1,
        explanation:
          'For 0-indexed arrays, parent is (i-1)//2. Children are 2i+1 and ' +
          '2i+2. The -1 accounts for 0-based indexing.',
      },
      {
        question: 'Why is heapify O(n) when pushing n items one at a time is O(n log n)?',
        options: [
          'heapify uses a different data structure.',
          'heapify sifts down from the bottom, and the total sift work across all nodes sums to O(n).',
          'heapify sorts the array first.',
          'It does not — heapify is also O(n log n).',
        ],
        correctIndex: 1,
        explanation:
          'Half the nodes are leaves (no work). Each higher level has fewer ' +
          'nodes but sifts down farther; the sum telescopes to O(n). One-at- ' +
          'a-time push does a full sift-up each, O(log n) each, O(n log n) total.',
      },
    ],
  },

  // ── 4. Tries ──────────────────────────────────────────────────────
  {
    id: 'lesson-tries',
    title: 'Tries: Storing Strings by Shared Prefix',
    moduleId: 'module-trees',
    languageId: 'python',
    difficulty: 4,
    estimatedMinutes: 13,
    summary:
      'A trie shares common prefixes across words so search and autocomplete ' +
      'depend on word length, not dataset size.',
    teachesConceptIds: ['trie', 'tree', 'string', 'searching'],
    prerequisiteConceptIds: ['tree', 'string', 'recursion'],
    objectives: [
      'Insert a word into a trie by walking one edge per character.',
      'Search for a complete word and for a prefix.',
      'Explain why lookup is O(word length), independent of dataset size.',
      'Describe the autocomplete use case and its trade-offs.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'A trie ( retrieval tree) stores strings one character per edge. ' +
          'Words that share a prefix share those edges. "cat" and "car" both ' +
          'descend through c-a, then split at t vs r. The shared structure ' +
          'is the whole point: lookup time depends on the word length, not ' +
          'how many words are stored.',
      },
      {
        kind: 'heading',
        text: 'A node is a map from char to child node',
      },
      {
        kind: 'code',
        languageId: 'python',
        caption: 'Each node holds children keyed by character and an end-of-word flag.',
        code: 'class TrieNode:\n    def __init__(self):\n        self.children = {}     # char -> TrieNode\n        self.is_word = False\n\nclass Trie:\n    def __init__(self):\n        self.root = TrieNode()',
      },
      {
        kind: 'heading',
        text: 'Insert walks one edge per character',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'Insert "cat", "car", "card" and check membership.',
        code: 'def insert(trie, word):\n    node = trie.root\n    for ch in word:\n        if ch not in node.children:\n            node.children[ch] = TrieNode()\n        node = node.children[ch]\n    node.is_word = True\n\ndef contains(trie, word):\n    node = trie.root\n    for ch in word:\n        if ch not in node.children:\n            return False\n        node = node.children[ch]\n    return node.is_word\n\nt = Trie()\nfor w in ["cat", "car", "card"]:\n    insert(t, w)\nprint(contains(t, "car"))   # True\nprint(contains(t, "care"))   # False (prefix, not a word)',
        output: 'True\nFalse',
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'Prefix search is almost free',
        text:
          'To check whether any word starts with a prefix, walk the prefix. ' +
          'If you do not fall off the tree, the prefix exists. You do not ' +
          'care about is_word for prefix queries — only complete-word ones.',
      },
      {
        kind: 'code',
        languageId: 'python',
        caption: 'Prefix check: same walk, ignore the end flag.',
        code: 'def starts_with(trie, prefix):\n    node = trie.root\n    for ch in prefix:\n        if ch not in node.children:\n            return False\n        node = node.children[ch]\n    return True  # prefix exists even if no complete word ends here',
      },
      {
        kind: 'heading',
        text: 'Why tries beat a hash set for autocomplete',
      },
      {
        kind: 'paragraph',
        text:
          'A hash set answers "is X a word" in O(1) expected, but it cannot ' +
          'answer "list all words starting with CA" without scanning every ' +
          'key. A trie walks the prefix in O(prefix length), then enumerates ' +
          'the subtree — proportional to the answer size, not the dictionary.',
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'Memory is the cost',
        text:
          'Each node stores a child map. For sparse alphabets (like natural ' +
          'language) this is fine; for dense ones each node may carry a large ' +
          'map of mostly-empty slots. Compressed tries (radix trees) merge ' +
          'single-child chains to cut the overhead.',
      },
      {
        kind: 'compare',
        languageIds: ['python', 'javascript'],
        caption:
          'Python uses a dict per node; JavaScript uses a Map or object. ' +
          'The walk algorithm is identical.',
        snippets: [
          'class TrieNode:\n    def __init__(self):\n        self.children = {}\n        self.is_word = False',
          'class TrieNode {\n  constructor() {\n    this.children = new Map();\n    this.isWord = false;\n  }\n}',
        ],
      },
    ],
    animation: {
      type: 'treeTraversal',
      title: 'Inserting "cat", "car", "card" shares the c-a prefix',
      steps: [
        { caption: 'Insert "cat": root → c (new) → a (new) → t (new), mark t.is_word.' },
        { caption: 'Insert "car": root → c (exists) → a (exists) → r (new), mark r.is_word.' },
        { caption: 'The c-a path was reused — no new nodes for the shared prefix.' },
        { caption: 'Insert "card": root → c → a → r (exists) → d (new), mark d.is_word.' },
        { caption: 'Search "car": walk c-a-r, r.is_word is True → found. Length 3 = 3 steps, regardless of how many words are stored.' },
      ],
    },
    activity: {
      type: 'codeChallenge',
      title: 'Count words in a trie',
      prompt:
        'Implement count_words(trie) that returns the number of complete ' +
        'words stored. Hint: DFS from root, count every node where is_word ' +
        'is True. The trie has "cat","car","card" so the answer is 3.',
      languageId: 'python',
      starterCode: 'class TrieNode:\n    def __init__(self):\n        self.children = {}\n        self.is_word = False\n\ndef count_words(node):\n    total = 0\n    # if this node ends a word, count it\n\n    # recurse into each child\n\n    return total\n\n# test setup omitted; your function must return 3 for the sample trie',
      checks: [
        { description: 'Recurses into children', assertion: { kind: 'contains', value: 'count_words(' } },
        { description: 'Checks the is_word flag', assertion: { kind: 'contains', value: 'is_word' } },
      ],
    },
    comprehensionChecks: [
      {
        question: 'Lookup in a trie is O(?) where L is the word length and N is the number of stored words?',
        options: ['O(N)', 'O(L)', 'O(L + N)', 'O(L * N)'],
        correctIndex: 1,
        explanation:
          'You walk one edge per character of the query, so the cost is ' +
          'proportional to word length L — independent of how many words ' +
          'the trie stores.',
      },
      {
        question: 'What is the key advantage of a trie over a hash set for autocomplete?',
        options: [
          'Tries use less memory.',
          'Tries can enumerate all words with a given prefix without scanning the whole dictionary.',
          'Tries have O(1) word lookup.',
          'Tries are simpler to implement.',
        ],
        correctIndex: 1,
        explanation:
          'A hash set cannot list prefix matches without scanning all keys. ' +
          'A trie walks the prefix once, then enumerates only the matching ' +
          'subtree — cost proportional to the answer size.',
      },
    ],
  },
]
