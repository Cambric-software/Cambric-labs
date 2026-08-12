/**
 * Cambric Labs — Module: Graphs
 *
 * Three genuine lessons on graph data: representation, BFS, and DFS. Each
 * teaches a distinct idea and uses a different traversal as the central
 * algorithm.
 */
import type { LessonDetail } from '../types'

export const graphsLessons: LessonDetail[] = [
  // ── 1. Graph representation ───────────────────────────────────────
  {
    id: 'lesson-graphs-intro',
    title: 'Graphs: Nodes, Edges, and How to Store Them',
    moduleId: 'module-graphs',
    languageId: 'python',
    difficulty: 3,
    estimatedMinutes: 12,
    summary:
      'A graph models arbitrary relationships. Storing it as an adjacency ' +
      'list or matrix trades memory for lookup speed; the right choice ' +
      'depends on density.',
    teachesConceptIds: ['graph', 'graph-representation', 'directed-graph', 'weighted-graph', 'map'],
    prerequisiteConceptIds: ['tree', 'linked-list', 'map'],
    objectives: [
      'Distinguish directed, undirected, and weighted graphs.',
      'Represent a graph as an adjacency list and as an adjacency matrix.',
      'Compare space and lookup cost of list vs matrix representations.',
      'Choose a representation based on graph density.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'A tree is a graph with exactly one path between any two nodes. ' +
          'A graph removes that restriction: nodes (vertices) connect by ' +
          'edges any way you like, including cycles and multiple paths. ' +
          'That freedom makes graphs the right model for maps, networks, ' +
          'dependencies, and social connections.',
      },
      {
        kind: 'heading',
        text: 'Directed, undirected, weighted',
      },
      {
        kind: 'paragraph',
        text:
          'In a directed graph, an edge A→B does not imply B→A (a one-way ' +
          'street). In an undirected graph, edges run both ways (a two-way ' +
          'friendship). A weighted graph attaches a cost to each edge — a ' +
          'distance, a latency, a capacity — so you can ask for the ' +
          'cheapest path, not just any path.',
      },
      {
        kind: 'heading',
        text: 'Adjacency list: a map from node to its neighbours',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'A small undirected graph as a dict of lists.',
        code: '#   A -- B\n#   |    |\n#   C -- D\ngraph = {\n    "A": ["B", "C"],\n    "B": ["A", "D"],\n    "C": ["A", "D"],\n    "D": ["B", "C"],\n}\nprint(graph["B"])  # neighbours of B',
        output: "['A', 'D']",
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'List uses O(V + E) memory',
        text:
          'You store each node once and each edge once (or twice for ' +
          'undirected). For a sparse graph (few edges per node), this is ' +
          'far smaller than a matrix. Listing a node neighbours is O(1) ' +
          'to fetch the list; checking a specific edge is O(degree of node).',
      },
      {
        kind: 'heading',
        text: 'Adjacency matrix: a V×V grid',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'The same graph as a matrix; 1 means an edge exists.',
        code: '#       A  B  C  D\nmatrix = [\n    [0, 1, 1, 0],  # A\n    [1, 0, 0, 1],  # B\n    [1, 0, 0, 1],  # C\n    [0, 1, 1, 0],  # D\n]\nprint(matrix[1][3])  # is there a B-D edge? 1',
        output: '1',
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'Matrix uses O(V²) memory',
        text:
          'A matrix stores an entry for every pair of nodes, whether or not ' +
          'an edge exists. For 10 000 nodes that is 100 million entries even ' +
          'if the graph has almost no edges. But checking any edge is O(1) — ' +
          'just index the grid.',
      },
      {
        kind: 'heading',
        text: 'Choose by density',
      },
      {
        kind: 'paragraph',
        text:
          'A dense graph (edges ~ V², like a fully-connected network) suits ' +
          'a matrix — the memory is not wasted. A sparse graph (edges ~ V, ' +
          'like a road map or a web link graph) suits a list — a matrix ' +
          'would be almost all zeros. Most real graphs are sparse.',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'A weighted directed graph: edges carry costs.',
        code: 'weighted = {\n    "A": [("B", 4), ("C", 1)],\n    "B": [("D", 2)],\n    "C": [("B", 3), ("D", 5)],\n    "D": [],\n}\nprint(weighted["C"])  # C reaches B (cost 3) and D (cost 5)',
        output: "[('B', 3), ('D', 5)]",
      },
      {
        kind: 'compare',
        languageIds: ['python', 'javascript'],
        caption:
          'Python dict-of-lists is idiomatic; JavaScript Map-of-arrays mirrors ' +
          'it. The representation, not the syntax, is the point.',
        snippets: [
          'graph = {"A": ["B", "C"]}\nprint(graph["A"])  # ["B", "C"]',
          'const graph = new Map([["A", ["B", "C"]]]);\nconsole.log(graph.get("A")); // ["B", "C"]',
        ],
      },
    ],
    animation: {
      type: 'graphTraversal',
      title: 'Walking the adjacency list',
      steps: [
        { caption: 'Graph A-B, A-C, B-D, C-D. Start at A.' },
        { caption: 'graph["A"] = ["B","C"]. Two neighbours to consider.' },
        { caption: 'Follow A→B. graph["B"] = ["A","D"]. A already seen, so go to D next.' },
        { caption: 'Follow A→C. graph["C"] = ["A","D"]. A seen, D seen.' },
        { caption: 'All nodes visited. The adjacency list was the only structure touched — no scan of the whole graph.' },
      ],
    },
    activity: {
      type: 'multipleChoice',
      title: 'Pick the representation',
      prompt:
        'You are storing a road network with 1 million intersections and ' +
        '2 million roads. Which representation is better, and why?',
      languageId: 'pseudo',
      data: {
        question: 'Sparse road graph (1M nodes, 2M edges). Which representation?',
        options: [
          'Adjacency matrix — O(1) edge lookup.',
          'Adjacency list — memory O(V+E) = 3M entries, far less than the 10^12 a matrix would need.',
          'Neither — use a linked list.',
          'Both are equally good.',
        ],
        correctIndex: 1,
        explanation:
          'A matrix would need 10^12 entries (1M × 1M). A list needs ~3M ' +
          'entries (nodes + edges). Sparse graphs demand adjacency lists.',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'When is an adjacency matrix a better choice than an adjacency list?',
        options: [
          'When the graph is sparse.',
          'When the graph is dense (edges ~ V²) and O(1) edge checks matter.',
          'When the graph is a tree.',
          'Never — lists are always better.',
        ],
        correctIndex: 1,
        explanation:
          'A dense graph wastes little in a matrix (most entries are real), ' +
          'and gains O(1) edge lookup. For sparse graphs the matrix is ' +
          'mostly zeros, wasting memory.',
      },
      {
        question: 'How much memory does an adjacency list use for V nodes and E edges (undirected)?',
        options: ['O(V)', 'O(E)', 'O(V + E)', 'O(V²)'],
        correctIndex: 2,
        explanation:
          'Each node is stored once (V) and each undirected edge appears ' +
          'twice (2E), giving O(V + E) overall.',
      },
    ],
  },

  // ── 2. BFS ────────────────────────────────────────────────────────
  {
    id: 'lesson-bfs',
    title: 'Breadth-First Search: Nearest First',
    moduleId: 'module-graphs',
    languageId: 'python',
    difficulty: 3,
    estimatedMinutes: 12,
    summary:
      'BFS explores a graph in expanding rings from the start, using a ' +
      'queue. It finds the shortest path in an unweighted graph and the ' +
      'fewest-edge path to any node.',
    teachesConceptIds: ['bfs', 'queue-ds', 'graph', 'shortest-path'],
    prerequisiteConceptIds: ['graph', 'queue-ds', 'iteration'],
    objectives: [
      'Implement BFS with a queue and a visited set.',
      'Explain why BFS finds the shortest path in an unweighted graph.',
      'Trace BFS on a small graph and report the visit order.',
      'Distinguish BFS (ring by ring) from DFS (deep first).',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'Breadth-first search explores a graph like ripples in water: all ' +
          'neighbours of the start, then all THEIR neighbours, then theirs, ' +
          'and so on. A queue is what makes this natural — you process ' +
          'nodes in arrival order, which is exactly ring-by-ring.',
      },
      {
        kind: 'heading',
        text: 'Queue + visited set',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'BFS over the graph A-B-C-D from A.',
        code: 'from collections import deque\n\ngraph = {\n    "A": ["B", "C"],\n    "B": ["A", "D"],\n    "C": ["A", "D"],\n    "D": ["B", "C"],\n}\n\ndef bfs(graph, start):\n    seen = {start}\n    q = deque([start])\n    order = []\n    while q:\n        node = q.popleft()\n        order.append(node)\n        for nb in graph[node]:\n            if nb not in seen:\n                seen.add(nb)\n                q.append(nb)\n    return order\n\nprint(bfs(graph, "A"))  # A, B, C, D',
        output: "['A', 'B', 'C', 'D']",
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'Mark visited when you QUEUE, not when you POP',
        text:
          'If you mark visited only on pop, the same node can be queued many ' +
          'times before it is processed, blowing up the work. Mark it the ' +
          'moment you enqueue it — that prevents any re-enqueue.',
      },
      {
        kind: 'heading',
        text: 'Why BFS gives the shortest path (unweighted)',
      },
      {
        kind: 'paragraph',
        text:
          'Because BFS explores in rings of increasing distance, the first ' +
          'time you reach a node, you reached it via a shortest path. Any ' +
          'later arrival would come from a ring farther out. To reconstruct ' +
          'the path, store a parent map and walk it back from the target.',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'Track parents to reconstruct the shortest path.',
        code: 'from collections import deque\n\ndef shortest_path(graph, start, target):\n    seen = {start}\n    parent = {start: None}\n    q = deque([start])\n    while q:\n        node = q.popleft()\n        if node == target:\n            break\n        for nb in graph[node]:\n            if nb not in seen:\n                seen.add(nb); parent[nb] = node\n                q.append(nb)\n    if target not in parent:\n        return None\n    path = []\n    cur = target\n    while cur is not None:\n        path.append(cur); cur = parent[cur]\n    return path[::-1]\n\nprint(shortest_path(graph, "A", "D"))  # A, B, D (or A, C, D — both length 2)',
        output: "['A', 'B', 'D']",
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'Multiple shortest paths',
        text:
          'In this graph A→B→D and A→C→D are both length 2. BFS returns ' +
          'whichever it found first, depending on neighbour order. It finds ' +
          'A shortest path, not all of them.',
      },
      {
        kind: 'heading',
        text: 'BFS vs DFS in one sentence',
      },
      {
        kind: 'paragraph',
        text:
          'BFS uses a queue and finds shortest unweighted paths; it uses ' +
          'more memory because the queue holds a whole ring. DFS uses a ' +
          'stack (or recursion) and goes deep first; it uses less memory ' +
          'but does not find shortest paths. Pick BFS for nearest-first, ' +
          'DFS for connectivity or cycle detection.',
      },
      {
        kind: 'compare',
        languageIds: ['python', 'javascript'],
        caption:
          'Both use a queue (deque/Array.shift) and a Set. The algorithm is ' +
          'identical; only the collection APIs differ.',
        snippets: [
          'from collections import deque\nq = deque([start])\nnode = q.popleft()',
          'const q = [start];\nconst node = q.shift(); // O(n) — see deque lesson',
        ],
      },
    ],
    animation: {
      type: 'graphTraversal',
      title: 'BFS rings on A-B-C-D',
      steps: [
        { caption: 'Start A. Queue [A]. Seen {A}.' },
        { caption: 'Pop A. Neighbours B, C. Enqueue both. Queue [B, C]. Ring 1 done.' },
        { caption: 'Pop B. Neighbour D (A already seen). Enqueue D. Queue [C, D].' },
        { caption: 'Pop C. Neighbour D already seen. Queue [D].' },
        { caption: 'Pop D. No unseen neighbours. Queue empty. Order: A, B, C, D.' },
      ],
    },
    activity: {
      type: 'predictOutput',
      title: 'Trace BFS order',
      prompt:
        'Graph: {1:[2,3], 2:[4], 3:[4], 4:[]}. What does bfs(graph, 1) ' +
        'return (the visit order)?',
      languageId: 'python',
      starterCode: 'from collections import deque\ndef bfs(graph, start):\n    seen = {start}\n    q = deque([start])\n    order = []\n    while q:\n        node = q.popleft()\n        order.append(node)\n        for nb in graph[node]:\n            if nb not in seen:\n                seen.add(nb); q.append(nb)\n    return order\nprint(bfs({1:[2,3],2:[4],3:[4],4:[]}, 1))',
      checks: [
        { description: 'BFS visit order is 1, 2, 3, 4', assertion: { kind: 'outputEquals', value: "[1, 2, 3, 4]" } },
      ],
    },
    comprehensionChecks: [
      {
        question: 'Why does BFS find the shortest path in an unweighted graph?',
        options: [
          'Because it visits nodes in alphabetical order.',
          'Because it explores in rings of increasing distance, so the first arrival is via the fewest edges.',
          'Because it uses a stack.',
          'Because it randomises the order.',
        ],
        correctIndex: 1,
        explanation:
          'Rings are distance 1, 2, 3, ... The first time a node is dequeued ' +
          'is via the smallest ring it appears in, which is its shortest path.',
      },
      {
        question: 'When should you mark a node as visited in BFS?',
        options: [
          'When you pop it from the queue.',
          'When you enqueue it.',
          'Never.',
          'Only at the end.',
        ],
        correctIndex: 1,
        explanation:
          'Marking on enqueue prevents the same node from being queued many ' +
          'times by different predecessors, which would waste work and memory.',
      },
    ],
  },

  // ── 3. DFS ────────────────────────────────────────────────────────
  {
    id: 'lesson-dfs',
    title: 'Depth-First Search: Go Deep, Backtrack',
    moduleId: 'module-graphs',
    languageId: 'python',
    difficulty: 3,
    estimatedMinutes: 12,
    summary:
      'DFS dives as far as possible along each branch before backtracking. ' +
      'A stack (or recursion) drives it; it powers cycle detection, ' +
      'topological sort, and connected-components counting.',
    teachesConceptIds: ['dfs', 'stack-ds', 'graph', 'recursion', 'topological-sort'],
    prerequisiteConceptIds: ['graph', 'stack-ds', 'recursion'],
    objectives: [
      'Implement DFS recursively and iteratively with a stack.',
      'Detect cycles in a directed graph using recursion-stack colours.',
      'Explain why DFS does not find shortest paths.',
      'Produce a topological order via DFS post-order.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'Depth-first search commits to one direction and keeps going until ' +
          'it hits a dead end, then backtracks. A stack (or the call stack ' +
          'via recursion) makes this natural — you push a node, dive into a ' +
          'child, and only return to siblings when that subtree is done.',
      },
      {
        kind: 'heading',
        text: 'Recursive DFS mirrors tree traversal',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'Recursive DFS with a visited set.',
        code: 'graph = {\n    "A": ["B", "C"],\n    "B": ["D"],\n    "C": ["D"],\n    "D": [],\n}\nseen = set()\ndef dfs(node):\n    if node in seen: return\n    seen.add(node)\n    print(node, end=" ")\n    for nb in graph[node]:\n        dfs(nb)\n\ndfs("A")  # A B D C',
        output: 'A B D C',
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'Different order from BFS, same coverage',
        text:
          'BFS on this graph printed A, B, C, D. DFS printed A, B, D, C — ' +
          'it went all the way to D before visiting C. Both visit every ' +
          'reachable node; the order reflects their strategy.',
      },
      {
        kind: 'heading',
        text: 'Iterative DFS: swap the queue for a stack',
      },
      {
        kind: 'code',
        languageId: 'python',
        caption: 'Same result, explicit stack, no recursion limit worries.',
        code: 'def dfs_iter(graph, start):\n    seen = set()\n    stack = [start]\n    order = []\n    while stack:\n        node = stack.pop()\n        if node in seen: continue\n        seen.add(node)\n        order.append(node)\n        # reverse so leftmost child is processed first (matches recursion)\n        for nb in reversed(graph[node]):\n            if nb not in seen:\n                stack.append(nb)\n    return order',
      },
      {
        kind: 'heading',
        text: 'Cycle detection via colours',
      },
      {
        kind: 'paragraph',
        text:
          'A cycle exists if, while exploring, you meet a node that is ' +
          'already on the current recursion path. Track three colours: ' +
          'white (unseen), grey (on the current path), black (fully done). ' +
          'Finding a grey neighbour during DFS means a back edge — a cycle.',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'Detect a cycle in a directed graph.',
        code: 'WHITE, GRAY, BLACK = 0, 1, 2\ndef has_cycle(graph):\n    color = {n: WHITE for n in graph}\n    def visit(n):\n        color[n] = GRAY\n        for nb in graph[n]:\n            if color[nb] == GRAY: return True\n            if color[nb] == WHITE and visit(nb): return True\n        color[n] = BLACK\n        return False\n    return any(visit(n) for n in graph if color[n] == WHITE)\n\nprint(has_cycle({"A": ["B"], "B": ["C"], "C": []}))      # False\nprint(has_cycle({"A": ["B"], "B": ["A"]}))               # True',
        output: 'False\nTrue',
      },
      {
        kind: 'heading',
        text: 'Topological sort from DFS post-order',
      },
      {
        kind: 'paragraph',
        text:
          'A topological order of a DAG is a linear sequence where every ' +
          'edge A→B has A before B. Run DFS, and when you finish a node ' +
          '(colour it black), prepend it to an output list. The reverse ' +
          'post-order is a valid topological order — dependencies first.',
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'Topological sort needs a DAG',
        text:
          'A cycle has no valid topological order (which task comes first ' +
          'in a circular dependency?). Detect cycles first; only sort if ' +
          'none exist.',
      },
      {
        kind: 'compare',
        languageIds: ['python', 'javascript'],
        caption:
          'Recursive DFS in both; the stack is the call stack. Iterative ' +
          'versions use an explicit list as a stack.',
        snippets: [
          'def dfs(node):\n    if node in seen: return\n    seen.add(node)\n    for nb in graph[node]: dfs(nb)',
          'function dfs(node) {\n  if (seen.has(node)) return;\n  seen.add(node);\n  for (const nb of graph[node]) dfs(nb);\n}',
        ],
      },
    ],
    animation: {
      type: 'graphTraversal',
      title: 'DFS dive-then-backtrack on A-B-D, A-C-D',
      steps: [
        { caption: 'Start A (gray). Go to B (gray).' },
        { caption: 'From B go to D (gray). D has no unseen neighbours — mark D black, return to B.' },
        { caption: 'B has no more neighbours — mark B black, return to A.' },
        { caption: 'A has another neighbour C — go to C (gray). C sees D but D is black (done), not gray.' },
        { caption: 'No back edge → no cycle. Mark C black, then A black. Post-order: D, B, C, A.' },
      ],
    },
    activity: {
      type: 'predictOutput',
      title: 'Trace DFS order',
      prompt:
        'Graph: {1:[2,3], 2:[4], 3:[], 4:[]}. What does the recursive dfs(1) print (visit order)?',
      languageId: 'python',
      starterCode: 'graph = {1:[2,3], 2:[4], 3:[], 4:[]}\nseen = set()\ndef dfs(node):\n    if node in seen: return\n    seen.add(node)\n    print(node, end=" ")\n    for nb in graph[node]:\n        dfs(nb)\ndfs(1)',
      checks: [
        { description: 'DFS visit order is 1 2 4 3', assertion: { kind: 'outputEquals', value: '1 2 4 3' } },
      ],
    },
    comprehensionChecks: [
      {
        question: 'In DFS cycle detection, what does encountering a GREY neighbour mean?',
        options: [
          'The node has already been fully processed.',
          'The node is on the current recursion path — a back edge, so there is a cycle.',
          'The node has not been visited yet.',
          'The graph is a tree.',
        ],
        correctIndex: 1,
        explanation:
          'Grey means "on the current path." Reaching a grey node means an ' +
          'edge loops back to an ancestor on this same DFS dive — a cycle.',
      },
      {
        question: 'Why does DFS not find shortest paths in an unweighted graph?',
        options: [
          'It is too slow.',
          'It dives deep, so the first time it reaches a node may be via a long path when a shorter one exists.',
          'It uses too much memory.',
          'It only works on trees.',
        ],
        correctIndex: 1,
        explanation:
          'DFS commits to a branch, so it may reach a node via a long detour ' +
          'while a shorter path sits unexplored elsewhere. BFS explores by ' +
          'rings so it always reaches a node by the shortest path first.',
      },
    ],
  },
]
