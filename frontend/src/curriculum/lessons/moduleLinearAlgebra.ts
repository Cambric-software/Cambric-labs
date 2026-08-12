/**
 * Cambric Labs — Module: Linear Algebra (AI & ML Foundations)
 *
 * Two lessons: vectors (the object, operations, geometry), and matrices
 * (linear maps, multiplication, why GPUs love them).
 */
import type { LessonDetail } from '../types'

export const linearAlgebraLessons: LessonDetail[] = [
  {
    id: 'lesson-vectors',
    title: 'Vectors: Direction, Magnitude, and the Dot Product',
    moduleId: 'module-linear-algebra',
    languageId: 'python',
    difficulty: 4,
    estimatedMinutes: 12,
    summary:
      'A vector is a list of numbers representing a direction and length ' +
      'in space. Addition combines displacements, scalar multiply scales ' +
      'length, and the dot product measures how much two vectors point ' +
      'the same way — the single operation underlying attention, ' +
      'similarity, and projections in ML.',
    teachesConceptIds: ['vector', 'vector-addition', 'dot-product', 'matrix', 'linear-algebra'],
    prerequisiteConceptIds: ['arithmetic', 'function', 'coordinate-system', 'array'],
    objectives: [
      'Represent a vector and interpret it geometrically.',
      'Add vectors and scale them, and picture each operation.',
      'Compute and interpret the dot product as similarity.',
      'Explain why the dot product is the engine of attention.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'A vector is an ordered list of numbers — [3, 4] or [1, 0, -2]. ' +
          'Geometrically it is an arrow from the origin: the numbers are ' +
          'its coordinates. Vectors are the native data type of ML: an ' +
          'image is a long vector of pixel values, a word is a vector of ' +
          'embedding dimensions, a user is a vector of features. Linear ' +
          'algebra is the arithmetic of these lists.',
      },
      {
        kind: 'heading',
        text: 'A vector is an arrow',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'A 2D vector as coordinates; magnitude is its length.',
        code: "import numpy as np\n\nv = np.array([3, 4])          # arrow from origin to (3,4)\nprint('magnitude =', np.linalg.norm(v))   # length = sqrt(3^2 + 4^2) = 5\nprint('direction =', v / np.linalg.norm(v))  # unit vector pointing that way",
        output: 'magnitude = 5.0\ndirection = [0.6 0.8]',
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'Magnitude and direction',
        text:
          'A vector has a length (magnitude, by the Pythagorean theorem: ' +
          'sqrt of summed squares) and a direction (the unit vector: ' +
          'divide by magnitude). Normalizing a vector to unit length keeps ' +
          'only its direction — useful when you want to compare direction ' +
          'without being fooled by scale (e.g., a short and long vector ' +
          'pointing the same way).',
      },
      {
        kind: 'heading',
        text: 'Vector addition: combine displacements',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'Add componentwise: walk v then w, you end at v+w.',
        code: "import numpy as np\nv = np.array([1, 2])    # walk right 1, up 2\nw = np.array([3, 1])    # then right 3, up 1\nprint('v + w =', v + w)   # you end at (4, 3): right 4, up 3\n# scalar multiply: stretch/shrink without changing direction\nprint('2 * v =', 2 * v)    # twice as far in the same direction",
        output: 'v + w = [4 3]\n2 * v = [2 4]',
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'Addition is tip-to-tail',
        text:
          'Picture vectors as arrows: to add v + w, place w\'s tail at ' +
          'v\'s tip and draw the arrow from origin to w\'s new tip. The ' +
          'result is the single displacement equivalent to doing v then w. ' +
          'This geometric meaning is why vectors model physical movement, ' +
          'forces, and gradients.',
      },
      {
        kind: 'heading',
        text: 'The dot product: how aligned are two vectors?',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'Sum of products; large when vectors point the same way, zero when perpendicular.',
        code: "import numpy as np\n\na = np.array([1, 0])    # pointing right\nb = np.array([0, 1])    # pointing up\nprint('a . b =', a @ b)             # 0: perpendicular\n\nc = np.array([1, 0])\nd = np.array([1, 0])\nprint('c . d =', c @ d)             # 1: same direction (max)\n\ne = np.array([1, 0])\nf = np.array([-1, 0])\nprint('e . f =', e @ f)             # -1: opposite direction (min)",
        output: 'a . b = 0\nc . d = 1\ne . f = -1',
      },
      {
        kind: 'callout',
        variant: 'success',
        title: 'The dot product is similarity',
        text:
          'Two vectors pointing the same way have a large positive dot ' +
          'product; perpendicular, zero; opposite, large negative. This ' +
          'is why the dot product is everywhere in ML: it measures how ' +
          'similar two vectors are. Cosine similarity (dot product of ' +
          'normalized vectors) powers search, recommendation, and — ' +
          'critically — the attention mechanism in transformers, which is ' +
          'a learned dot product between queries and keys.',
      },
      {
        kind: 'heading',
        text: 'Vectors in ML: everything is a list of numbers',
      },
      {
        kind: 'code',
        languageId: 'python',
        caption: 'An embedding turns a word into a vector; similar words point the same way.',
        code: "# 'king'  -> [0.2, 0.9, -0.1, ...]\n# 'queen' -> [0.3, 0.8, -0.2, ...]  (similar direction -> similar meaning)\n# 'apple' -> [-0.5, 0.1, 0.7, ...]  (different direction -> different meaning)\n#\n# cosine_similarity(king, queen) is high\n# cosine_similarity(king, apple) is low\n# the dot product of embeddings IS how a model knows 'king' is closer to 'queen' than to 'apple'",
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'High-dim vectors are not pictures, but the algebra is the same',
        text:
          'A 768-dim word embedding cannot be visualized as an arrow, but ' +
          'the operations are identical: the dot product still measures ' +
          'alignment. The geometric intuition (same direction = similar) ' +
          'carries to high dimensions even though you cannot draw it. Trust ' +
          'the algebra; the picture is a mnemonic.',
      },
      {
        kind: 'compare',
        languageIds: ['python', 'python'],
        caption:
          'Perpendicular (dot=0, unrelated) vs same direction (dot=max, similar).',
        snippets: [
          "a = [1, 0]; b = [0, 1]\na @ b == 0   # perpendicular: no alignment, zero similarity",
          "c = [1, 0]; d = [1, 0]\nc @ d == 1   # identical direction: full alignment, max similarity",
        ],
      },
    ],
    animation: {
      type: 'memoryDiagram',
      title: 'The dot product as alignment',
      steps: [
        { caption: 'a = [1,0] (right), b = [0,1] (up). They are perpendicular. a.b = 1*0 + 0*1 = 0. No alignment.' },
        { caption: 'c = [1,0], d = [1,0]. Same direction. c.d = 1. Maximum alignment.' },
        { caption: 'e = [1,0], f = [-1,0]. Opposite. e.f = -1. Maximum anti-alignment.' },
        { caption: 'In ML: "king" and "queen" embeddings point nearly the same way -> high dot product -> "similar meaning."' },
        { caption: '"king" and "apple" point in different directions -> low dot product -> "different meaning." Attention in transformers is a learned dot product between query and key vectors.' },
      ],
    },
    activity: {
      type: 'multipleChoice',
      title: 'Interpret the dot product',
      prompt:
        'Two embedding vectors have a dot product of 0. What does that ' +
        'mean about what they represent?',
      languageId: 'python',
      data: {
        question: 'Dot product 0 means?',
        options: [
          'They are identical.',
          'They are perpendicular (orthogonal): there is no alignment between them, so in embedding space the things they represent are unrelated.',
          'They are opposites.',
          'One of them is zero.',
        ],
        correctIndex: 1,
        explanation:
          'A zero dot product means the vectors are perpendicular — no ' +
          'shared direction. In an embedding space, that translates to ' +
          '"unrelated": the things the vectors represent share no common ' +
          'meaning along any axis. This is why cosine similarity (a ' +
          'normalized dot product) is the standard measure of semantic ' +
          'similarity in ML.',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'Geometrically, what does vector addition do?',
        options: [
          'It multiplies their lengths.',
          'It places the second vector\'s tail at the first\'s tip and draws the resultant arrow; the sum is the single displacement equivalent to walking along v then along w.',
          'It rotates them.',
          'It inverts them.',
        ],
        correctIndex: 1,
        explanation:
          'Addition is tip-to-tail: v + w is the arrow you get by ' +
          'following v, then following w from where v ended. The result ' +
          'is a single displacement equal to doing both in sequence. This ' +
          'is why vectors model combined forces, movements, and ' +
          'gradients: the sum is the net effect.',
      },
      {
        question: 'Why is the dot product described as the "engine" of attention in transformers?',
        options: [
          'It is the fastest operation.',
          'Attention computes a learned dot product between a query vector and each key vector; the result is large (high attention) when the query aligns with a key, so the model attends to the most relevant positions — similarity IS the dot product.',
          'Dot products cannot be parallelized.',
          'It uses less memory than other ops.',
        ],
        correctIndex: 1,
        explanation:
          'Attention asks: "for this query, which keys are relevant?" ' +
          'Relevance is similarity, and similarity of vectors is their ' +
          'dot product (how aligned they are). So attention computes ' +
          'query·key for every key, softmaxes those into weights, and ' +
          'mixes values accordingly. The dot product — alignment — is ' +
          'literally the operation deciding where a transformer attends.',
      },
    ],
  },
  {
    id: 'lesson-matrices-and-linear-maps',
    title: 'Matrices: Linear Maps and the GPU-Friendly Bulk Operation',
    moduleId: 'module-linear-algebra',
    languageId: 'python',
    difficulty: 4,
    estimatedMinutes: 13,
    summary:
      'A matrix is a 2D grid of numbers, but more usefully it is a ' +
      'function: it transforms a vector into another vector. Matrix ' +
      'multiplication composes these transformations, and doing it on ' +
      'thousands of vectors at once is exactly what GPUs accelerate — ' +
      'which is why deep learning runs on GPUs.',
    teachesConceptIds: ['matrix', 'matrix-multiplication', 'linear-transformation', 'eigenvalue', 'linear-algebra'],
    prerequisiteConceptIds: ['vector', 'vector-addition', 'dot-product', 'function', 'array'],
    objectives: [
      'Interpret a matrix as a function from vectors to vectors.',
      'Multiply matrices as composing linear transformations.',
      'Explain why a matrix-vector product is a batch of dot products.',
      'Connect matrix bulk multiply to why GPUs power deep learning.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'A vector is one column of numbers; a matrix is a grid — a list ' +
          'of vectors. The powerful view is that a matrix is a function: ' +
          'it takes a vector in and produces a vector out, by a specific ' +
          'rule (each output coordinate is a dot product with a row of the ' +
          'matrix). Every layer of a neural network is a matrix multiply ' +
          'plus a nonlinearity; understanding matrices is understanding ' +
          'what those layers do.',
      },
      {
        kind: 'heading',
        text: 'A matrix is a function on vectors',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'Matrix-vector multiply: each output row is a dot product with a matrix row.',
        code: "import numpy as np\n\n# a 2x2 matrix: rotates and scales\nM = np.array([[0, -1],   # row 1\n              [1,  0]])  # row 2\nv = np.array([1, 0])      # pointing right\n\nout = M @ v               # matrix-vector product\nprint(out)                # [0, 1]: now points up -> rotated 90 degrees",
        output: '[0 1]',
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'Each output is a dot product',
        text:
          'The first output coordinate is the dot product of the first ' +
          'matrix row with the input vector; the second is the second row. ' +
          'So matrix-vector multiply is "a batch of dot products," one per ' +
          'output dimension. This is why the dot product lesson matters: a ' +
          'matrix is just many dot products stacked, computed at once.',
      },
      {
        kind: 'heading',
        text: 'Matrix multiply = composing transformations',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'A @ B applies B then A; the product is a single matrix that does both.',
        code: "import numpy as np\n\nA = np.array([[0, -1], [1, 0]])  # rotate 90 deg\nB = np.array([[2, 0], [0, 2]])  # scale by 2\n\nv = np.array([1, 0])\n# apply B (scale) then A (rotate): (A @ B) @ v\nprint((A @ B) @ v)   # [0, 2]: scaled to length 2, then rotated\n\n# A @ B is a single matrix that does both at once\nC = A @ B\nprint(C @ v)         # [0, 2]: same result, one multiply",
        output: '[0 2]\n[0 2]',
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'Composition is the deep idea',
        text:
          'Matrix multiply is not arbitrary arithmetic; it is function ' +
          'composition. If A rotates and B scales, then A @ B is a single ' +
          'matrix that scales then rotates — doing both in one step. A ' +
          'deep network stacks many matrix multiplies because each composes ' +
          'a transformation on top of the last, building complex mappings ' +
          'from simple linear pieces.',
      },
      {
        kind: 'heading',
        text: 'Bulk: many vectors at once',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'A matrix-matrix product applies the same map to many vectors (columns of the second matrix) at once.',
        code: "import numpy as np\n\nM = np.array([[0, -1], [1, 0]])  # the rotation\n# a batch of 3 vectors as columns of a 2x3 matrix\nV = np.array([[1, 2, 3],   # x-coords\n               [0, 0, 0]])  # y-coords\n\nout = M @ V   # rotate all three at once -> 2x3\nprint(out)",
        output: '[[ 0  0  0]\n [ 1  2  3]]',
      },
      {
        kind: 'callout',
        variant: 'success',
        title: 'This is why deep learning uses GPUs',
        text:
          'A GPU is a thousands-core chip that excels at doing the same ' +
          'operation in parallel. Matrix multiply is the perfect workload: ' +
          'thousands of independent dot products. A neural network layer ' +
          'is one giant matrix multiply over a batch of examples — exactly ' +
          'what a GPU accelerates. The hardware-software alignment is why ' +
          'deep learning went from weeks on CPU to minutes on GPU.',
      },
      {
        kind: 'heading',
        text: 'Eigenvalues: the directions a matrix stretches',
      },
      {
        kind: 'paragraph',
        text:
          'Most vectors get rotated and scaled in complex ways by a matrix, ' +
          'but a few special directions (eigenvectors) are only stretched — ' +
          'the matrix leaves their direction unchanged and scales them by ' +
          'the eigenvalue. Eigenvalues reveal a matrix\'s character: the ' +
          'largest eigenvalue of a network weight matrix tells you whether ' +
          'signals grow (explode) or shrink (vanish) through the layers — ' +
          'central to training stability.',
      },
      {
        kind: 'code',
        languageId: 'python',
        caption: 'Eigenvectors keep their direction; eigenvalues scale them.',
        code: "import numpy as np\nM = np.array([[2, 0], [0, 3]])  # stretches x by 2, y by 3\nvals, vecs = np.linalg.eig(M)\nprint('eigenvalues:', vals)     # [2, 3]\n# eigenvector [1,0] is stretched by 2; [0,1] by 3\n# M @ [1,0] = [2,0] = 2 * [1,0]  (same direction, scaled)",
      },
      {
        kind: 'compare',
        languageIds: ['python', 'python'],
        caption:
          'One vector (slow loop) vs a batch as columns (one GPU-friendly multiply).',
        snippets: [
          "for v in batch: out.append(M @ v)   # N separate multiplies",
          "out = M @ batch                    # one bulk multiply; GPU does all dots in parallel",
        ],
      },
    ],
    animation: {
      type: 'dataFlow',
      title: 'A matrix is a function; multiply composes functions',
      steps: [
        { caption: 'Matrix M is a function: it maps any input vector v to an output M @ v, where each output coordinate is a dot product with a row of M.' },
        { caption: 'M @ v on [1,0] = [0,1]: the matrix rotated the input 90 degrees. The matrix IS the rotation.' },
        { caption: 'Two matrices: A rotates, B scales. A @ B is a single matrix that does scale-then-rotate — composition. One multiply replaces two.' },
        { caption: 'Bulk: stack many input vectors as columns of V. M @ V applies the same map to ALL of them at once — thousands of independent dot products.' },
        { caption: 'A GPU is built for exactly this: thousands of cores doing thousands of dot products in parallel. That is why neural networks (stacked matrix multiplies) run on GPUs.' },
      ],
    },
    activity: {
      type: 'multipleChoice',
      title: 'Why GPUs for deep learning?',
      prompt:
        'A neural network layer is one matrix multiply over a batch of ' +
        'examples. Why does this run dramatically faster on a GPU than a ' +
        'CPU?',
      languageId: 'python',
      data: {
        question: 'Why is the matrix multiply GPU-friendly?',
        options: [
          'GPUs have more memory.',
          'A matrix multiply is thousands of independent dot products; a GPU has thousands of cores that run them in parallel, whereas a CPU has few cores optimized for sequential logic.',
          'GPUs are newer.',
          'CPUs cannot multiply matrices.',
        ],
        correctIndex: 1,
        explanation:
          'The matrix-vector product is "a batch of dot products" and the ' +
          'matrix-matrix product is an even larger batch — all independent, ' +
          'no dependencies. A GPU is a thousands-core processor built for ' +
          'exactly this pattern: the same arithmetic, replicated massively in ' +
          'parallel. A CPU has few cores tuned for complex branching. The ' +
          'workload-hardware match is why GPUs dominate deep learning.',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'In what sense is a matrix a "function," and what does matrix multiply compose?',
        options: [
          'A matrix stores data; multiply combines data.',
          'A matrix maps an input vector to an output vector (each output coordinate is a dot product with a matrix row); multiplying two matrices composes their maps — A @ B is the single matrix that applies B then A.',
          'A matrix is a type of variable.',
          'Matrix multiply is random access.',
        ],
        correctIndex: 1,
        explanation:
          'A matrix is a linear function: it transforms vectors. Each ' +
          'output coordinate is the dot product of a row of the matrix ' +
          'with the input. Multiplying matrices composes functions: the ' +
          'product is a single matrix whose effect equals applying one ' +
          'then the other. This is why a deep network — many stacked ' +
          'matrix multiplies — builds a complex transformation from ' +
          'simple linear pieces plus nonlinearities.',
      },
      {
        question: 'What do eigenvalues reveal about a matrix, and why does that matter for neural network training?',
        options: [
          'They are the matrix\'s size.',
          'Eigenvalues are the scaling factors along the special directions (eigenvectors) the matrix leaves unrotated; the largest tells you whether signals grow or shrink through repeated application — which governs exploding/vanishing gradients in deep networks.',
          'They are always 1.',
          'They are the number of rows.',
        ],
        correctIndex: 1,
        explanation:
          'An eigenvector keeps its direction under the matrix; the ' +
          'eigenvalue scales it. Repeated application (like signals ' +
          'passing through many layers) scales by the eigenvalue each ' +
          'time: if |λ|>1 signals explode, if |λ|<1 they vanish. This ' +
          'is the root of the exploding/vanishing gradient problem that ' +
          'makes deep networks hard to train, and why techniques like ' +
          'residual connections and careful initialization exist.',
      },
    ],
  },
]
