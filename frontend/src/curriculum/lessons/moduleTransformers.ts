/**
 * Cambric Labs — Module: Transformers & LLMs (AI & Deep Learning)
 *
 * Two lessons: the attention mechanism (queries, keys, values, softmax),
 * and the full transformer stack (embeddings, positional encoding,
 * multi-head attention, feed-forward, stacking, and what makes an LLM).
 */
import type { LessonDetail } from '../types'

export const transformersLessons: LessonDetail[] = [
  {
    id: 'lesson-attention-mechanism',
    title: 'Attention: Queries, Keys, Values, and Softmax',
    moduleId: 'module-transformers',
    languageId: 'python',
    difficulty: 5,
    estimatedMinutes: 14,
    summary:
      'Attention lets each position look at every other position and ' +
      'mix their information by relevance. Relevance is a learned dot ' +
      'product (query · key), normalized by softmax into weights, used to ' +
      'average the values. This single idea — differentiable lookup by ' +
      'similarity — is what made transformers overtake RNNs.',
    teachesConceptIds: ['attention', 'transformer', 'softmax', 'embedding', 'dot-product'],
    prerequisiteConceptIds: ['vector', 'dot-product', 'matrix', 'matrix-multiplication', 'neural-network'],
    objectives: [
      'Map the query/key/value roles onto a dictionary-lookup analogy.',
      'Compute attention as softmax(Q·K^T / sqrt(d)) · V.',
      'Explain why softmax turns raw scores into a probability distribution.',
      'Describe why attention removed the bottleneck that crippled RNNs.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'Before transformers, sequence models (RNNs) processed text one ' +
          'word at a time, squeezing the whole sentence into one hidden ' +
          'vector passed forward. Long-range information decayed. Attention ' +
          'solves this: every position looks at every other position ' +
          'directly, weighting each by relevance. No decay, no bottleneck. ' +
          'This single mechanism replaced recurrence and enabled LLMs.',
      },
      {
        kind: 'heading',
        text: 'The query/key/value analogy',
      },
      {
        kind: 'paragraph',
        text:
          'Think of a dictionary lookup. In a normal dict, you look up a ' +
          'key and get the value for exactly that key. Attention is a ' +
          'soft dictionary: you have a query, and you compare it to every ' +
          'key to get a relevance score; the output is a weighted average ' +
          'of all values, where more-relevant keys contribute more of ' +
          'their value. Soft lookup, not hard.',
      },
      {
        kind: 'code',
        languageId: 'python',
        caption: 'The roles: Q asks "what am I looking for"; K answers "what do I offer"; V is "what I contribute".',
        code: "# for each position i, its query Q_i is compared to every key K_j\n# a high score (Q_i . K_j) means position i attends strongly to position j\n# the output at i is a weighted average of all values V_j, weighted by those scores\n#\n# in the sentence 'the cat sat on the mat', the query at 'sat' may attend\n# strongly to 'cat' (subject) and 'mat' (object); the value at 'cat' carries\n# subject info that flows into the representation of 'sat'",
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'Q, K, V are learned linear projections',
        text:
          'The queries, keys, and values are not the raw token embeddings; ' +
          'they are three learned linear projections of them (multiply by ' +
          'weight matrices W_Q, W_K, W_V). The network learns what to ask ' +
          '(Q), what to offer as a key (K), and what information to pass (V). ' +
          'Learning these projections is most of what a transformer learns.',
      },
      {
        kind: 'heading',
        text: 'Computing attention: the scaled dot product',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'Attention(Q,K,V) = softmax(Q @ K^T / sqrt(d_k)) @ V.',
        code: "import numpy as np\n\n# tiny example: 3 tokens, embedding dim 4 (toy)\nQ = np.array([[1,0,0,0], [0,1,0,0], [0,0,1,0]])  # queries\nK = np.array([[1,0,0,0], [0,1,0,0], [0,0,1,0]])  # keys (here = Q for illustration)\nV = np.array([[10,0], [0,20], [0,0]])           # values: token 0->vec, 1->vec, 2->zero\n\nscores = Q @ K.T / np.sqrt(4)        # (3,3) raw relevance, scaled by sqrt(d_k)\nprint('scores\\n', scores.round(2))\n\ndef softmax(x):\n    e = np.exp(x - x.max(axis=-1, keepdims=True))\n    return e / e.sum(axis=-1, keepdims=True)\n\nweights = softmax(scores)            # normalize each row to sum to 1\nprint('weights\\n', weights.round(2))\n\nout = weights @ V                   # weighted average of values\nprint('output\\n', out.round(2))     # token 0 gets its own value back",
        output: 'scores\n [[0.5 0.  0. ]\n [0.  0.5 0. ]\n [0.  0.  0.5]]\nweights\n [[0.67 0.17 0.17]\n [0.17 0.67 0.17]\n [0.17 0.17 0.67]]\noutput\n [[6.67 3.33]\n [3.33 13.33]\n [0.   0.  ]]',
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'Why divide by sqrt(d_k)?',
        text:
          'The dot product of two high-dimensional vectors can get large, ' +
          'and large inputs to softmax saturate it (one weight ≈ 1, others ' +
          '≈ 0, gradient vanishes). Dividing by sqrt(d_k) keeps the ' +
          'variance of the scores stable as dimension grows — a small ' +
          'numerical detail that prevents training from breaking at scale.',
      },
      {
        kind: 'heading',
        text: 'Softmax: scores become a distribution',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'exp + normalize: turns any vector of scores into probabilities summing to 1.',
        code: "import numpy as np\n\ndef softmax(x):\n    e = np.exp(x - max(x))\n    return e / e.sum()\n\nprint(softmax([1.0, 2.0, 3.0]))     # higher scores get more weight\nprint(softmax([0, 0, 0]))           # tie -> uniform\nprint(softmax([10, 0, 0]))          # huge score -> near one-hot",
        output: '[0.09 0.24 0.67]\n[0.33 0.33 0.33]\n[1.   0.   0.]',
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'Softmax is differentiable, argmax is not',
        text:
          'Why not just pick the max-relevance key (argmax)? Because argmax ' +
          'has zero gradient almost everywhere — you cannot train a network ' +
          'through a hard pick. Softmax is a smooth approximation: it ' +
          'concentrates weight on the max but keeps small gradients ' +
          'everywhere, so backprop can flow and the relevance weights can ' +
          'be learned.',
      },
      {
        kind: 'heading',
        text: 'Why attention beat recurrence',
      },
      {
        kind: 'paragraph',
        text:
          'An RNN compresses the whole prefix into one fixed-size hidden ' +
          'vector, losing old information as new tokens arrive. Attention ' +
          'has no such bottleneck: position 1 can attend to position 1000 ' +
          'in one operation, with a relevance weight the network learned ' +
          'to set. Long-range dependencies — the kind that make pronouns ' +
          'refer to nouns pages earlier — became directly accessible.',
      },
      {
        kind: 'compare',
        languageIds: ['python', 'python'],
        caption:
          'RNN (sequential, decaying) vs attention (parallel, direct access).',
        snippets: [
          "# RNN: h_t = f(h_{t-1}, x_t). To use token 1 from token 1000,\n# the signal must survive 999 recurrence steps -> vanishes",
          "# Attention: out_t = sum_j softmax(Q_t.K_j) V_j. Token t attends\n# to token 1 in ONE step, weight learned. No decay, fully parallel.",
        ],
      },
    ],
    animation: {
      type: 'dataFlow',
      title: 'Attention as soft lookup',
      steps: [
        { caption: 'Token "sat" projects its embedding to a query Q: "I am a verb; I am looking for my subject and object."' },
        { caption: 'Every other token projects to keys K: "cat" offers subject-ness, "mat" offers object-ness, "the" offers little.' },
        { caption: 'Compute Q·K for each: high with "cat" and "mat", low with "the". Scale by sqrt(d) and softmax into weights.' },
        { caption: 'Each token also projects to a value V carrying its information. The output at "sat" is a weighted average of all values — mostly "cat"\'s subject-info and "mat"\'s object-info.' },
        { caption: 'Crucially, this is one parallel operation over all positions (no recurrence), and every weight is differentiable so the network learns what to ask, offer, and contribute.' },
      ],
    },
    activity: {
      type: 'multipleChoice',
      title: 'Why softmax, not argmax?',
      prompt:
        'Attention uses softmax to turn query-key scores into weights. ' +
        'Why not just pick the single most-relevant key (argmax)?',
      languageId: 'python',
      data: {
        question: 'Why softmax over argmax?',
        options: [
          'Argmax is slower.',
          'Argmax is not differentiable (zero gradient almost everywhere), so the network could not learn the Q/K/V projections through it; softmax is a smooth, differentiable approximation with gradients everywhere.',
          'Softmax is more accurate.',
          'Argmax is deprecated.',
        ],
        correctIndex: 1,
        explanation:
          'Training requires gradients to flow. Argmax selects one index ' +
          'and has zero gradient for every weight, so no learning signal ' +
          'passes. Softmax is a smooth relaxation: it concentrates weight ' +
          'on the max (like argmax) but keeps small gradients on every ' +
          'alternative, so backprop can adjust the Q/K/V projections. The ' +
          'differentiability is the whole point; it makes relevance ' +
          'learnable.',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'In the query/key/value framing, what does the query represent and what does the value carry?',
        options: [
          'The query is the answer; the value is the question.',
          'The query encodes what a position is looking for; the key encodes what a position offers to match against; the value carries the information that position contributes to the output when attended to.',
          'All three are the same vector.',
          'The query is computed after the value.',
        ],
        correctIndex: 1,
        explanation:
          'A query asks "what am I looking for?"; a key advertises "what ' +
          'do I match against?"; a value is "what information do I ' +
          'contribute?" The query-key dot product scores how well they ' +
          'match; softmax turns scores into weights; the weighted average ' +
          'of values is the output. All three are learned linear ' +
          'projections of the token embedding, so the network learns what ' +
          'to ask, offer, and contribute.',
      },
      {
        question: 'What does the scaling by 1/sqrt(d_k) in attention prevent, and why does that matter?',
        options: [
          'It prevents overflow.',
          'In high dimensions the raw dot product grows large, which saturates softmax (one weight ≈ 1, others ≈ 0) and vanishes the gradient; scaling keeps the scores\' variance stable so softmax stays smooth and trainable as dimension grows.',
          'It makes the result smaller.',
          'It converts to integer.',
        ],
        correctIndex: 1,
        explanation:
          'The dot product of two d-dimensional vectors has variance ' +
          'that scales with d, so high dims produce huge scores. Huge ' +
          'scores through softmax saturate to near one-hot, where the ' +
          'gradient is ≈ 0 and learning stalls. Dividing by sqrt(d_k) ' +
          'normalizes the variance so softmax stays in its sensitive, ' +
          'differentiable range regardless of dimension — a small fix that ' +
          'keeps large models trainable.',
      },
    ],
  },
  {
    id: 'lesson-transformer-architecture',
    title: 'The Transformer Stack: From Embeddings to LLMs',
    moduleId: 'module-transformers',
    languageId: 'python',
    difficulty: 5,
    estimatedMinutes: 14,
    summary:
      'A transformer layers four pieces: embeddings + positional encoding, ' +
      'multi-head self-attention, a feed-forward network per position, and ' +
      'residual+layer-norm. Stack this block N times; add a language-' +
      'modeling head; train on next-token prediction at scale. The result ' +
      'is an LLM. Each piece is simple; the stack and scale produce the ' +
      'magic.',
    teachesConceptIds: ['transformer', 'attention', 'embedding', 'positional-encoding', 'layer-normalization', 'residual-connection'],
    prerequisiteConceptIds: ['attention', 'embedding', 'matrix-multiplication', 'neural-network', 'vector'],
    objectives: [
      'Explain why positional encoding is needed in a position-invariant model.',
      'Describe multi-head attention as attending to different relation types in parallel.',
      'State the role of the feed-forward sublayer and the residual + layernorm.',
      'Connect the stacked-block architecture to what an LLM actually is.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'Attention is the headline, but a transformer is a stack of ' +
          'identical blocks, each with four parts: embedding + positional ' +
          'encoding, multi-head self-attention, a feed-forward network, ' +
          'and residual connections with layer normalization. No single ' +
          'part is mysterious; the achievement is that stacking this block ' +
          'with enough parameters, trained on next-token prediction across ' +
          'the internet, produces a model that writes code and answers ' +
          'questions. Architecture + scale.',
      },
      {
        kind: 'heading',
        text: 'Embeddings + positional encoding',
      },
      {
        kind: 'code',
        languageId: 'python',
        caption: 'Tokens become vectors; positions are added because attention is permutation-invariant.',
        code: "# token -> id -> embedding (learned vector)\n# 'cat' -> 412 -> [0.2, -0.1, 0.7, ...]  (one row of an embedding matrix)\n#\n# BUT attention is order-invariant: it weights by similarity,\n# ignoring position. 'dog bites man' and 'man bites dog' attend identically.\n# So we ADD a positional encoding to the embedding so each position\n# carries a unique 'where am I' signal the attention can use:\n# emb[pos] = token_embedding[token] + positional_encoding[pos]",
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'Attention is blind to order',
        text:
          'Self-attention computes query-key relevance and averages values; ' +
          'shuffle the input and the attention weights shuffle with it, ' +
          'giving the same set of outputs in a new order. To make a ' +
          'transformer care about word order, you inject positional ' +
          'information — sinusoidal encodings or learned position ' +
          'embeddings — so each token\'s vector knows where it sits. ' +
          'Without this, "dog bites man" and "man bites dog" are ' +
          'indistinguishable.',
      },
      {
        kind: 'heading',
        text: 'Multi-head attention: parallel relation types',
      },
      {
        kind: 'code',
        languageId: 'python',
        caption: 'Run attention h times with h different learned Q/K/V; concatenate.',
        code: "# instead of ONE attention, run h parallel 'heads'\nhead_i = Attention(Q @ Wq_i, K @ Wk_i, V @ Wv_i)   # each head learns a different relation\n# head_0 might attend to subject-verb; head_1 to adjective-noun; etc.\nout = concat(head_0, ..., head_{h-1}) @ W_o   # project back to d_model\n# multiple heads let one layer model several relationship types at once",
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'Heads specialize',
        text:
          'Empirically, different attention heads learn to track different ' +
          'relations: some attend to the previous word, some to the subject, ' +
          'some to a syntactic dependency. Multi-head attention is a way ' +
          'to give a single layer the capacity to model several kinds of ' +
          'structure at once, rather than forcing one attention to do ' +
          'everything.',
      },
      {
        kind: 'heading',
        text: 'Feed-forward sublayer: per-position MLP',
      },
      {
        kind: 'code',
        languageId: 'python',
        caption: 'A small MLP applied to each position independently; adds nonlinearity and capacity.',
        code: "# after attention mixes information across positions,\n# a feed-forward network transforms EACH position independently:\nffn(x) = relu(x @ W1 + b1) @ W2 + b2\n# this adds the nonlinearity attention lacks and per-position capacity\n# (attention is linear in V; the FFN is where most of a transformer's\n# parameters actually live, in the two big matrices W1, W2)",
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'The FFN is where the parameters live',
        text:
          'Counterintuitively, most of a transformer\'s parameters are in ' +
          'the feed-forward matrices, not the attention. Attention mixes ' +
          'information across positions; the FFN processes each position. ' +
          'If you scale a model, the FFN hidden dimension (usually 4× the ' +
          'model dimension) grows fastest. "Attention is all you need" ' +
          'was a catchy title; the FFN matters too.',
      },
      {
        kind: 'heading',
        text: 'Residual connections and layer norm',
      },
      {
        kind: 'code',
        languageId: 'python',
        caption: 'Add the input back (residual) and normalize; stabilizes deep stacks.',
        code: "# each sublayer is wrapped:\n#   x = LayerNorm(x + Sublayer(x))   (post-LN) or\n#   x = x + Sublayer(LayerNorm(x))   (pre-LN, common in modern LLMs)\n#\n# residual (x + ...): lets gradients flow through the stack;\n#   without it, a 96-layer model could not train (vanishing gradients)\n# layernorm: normalizes each token's vector to zero mean, unit variance;\n#   keeps activations stable across depth and batch",
      },
      {
        kind: 'callout',
        variant: 'success',
        title: 'Residuals let you stack deep',
        text:
          'A 96-layer transformer is a very deep network. Without residual ' +
          'connections (adding the input to the sublayer output), gradients ' +
          'would vanish through 96 layers and the bottom would never learn. ' +
          'The residual gives gradient a direct path backward, and ' +
          'lets each layer refine rather than recompute. Layer norm keeps ' +
          'the magnitude of activations bounded so training is stable.',
      },
      {
        kind: 'heading',
        text: 'Stack N blocks; add a head',
      },
      {
        kind: 'code',
        languageId: 'python',
        caption: 'The full transformer: repeat the block N times, then a linear head to vocabulary.',
        code: "# one transformer block:\n#   1. x = x + MultiHeadAttention(LayerNorm(x))   # mix across positions\n#   2. x = x + FeedForward(LayerNorm(x))           # transform each position\n# stack N of these blocks (e.g., 12 for base BERT, 96 for GPT-3)\n# then a final linear layer: logits = x @ W_vocab  (size vocab)\n# softmax over logits -> P(next token | context)\n# train to maximize P(actual next token) across billions of examples",
      },
      {
        kind: 'compare',
        languageIds: ['python', 'python'],
        caption:
          'Position-blind attention (shuffled in = shuffled out) vs attention + positional encoding (order matters).',
        snippets: [
          "out = softmax(Q@K^T) @ V   # permutation-equivariant; 'dog bites man' == 'man bites dog'",
          "x = embed(token) + posenc(pos)   # each position carries a 'where' signal\nout = Attention(x)              # now order is visible; the two sentences differ",
        ],
      },
    ],
    animation: {
      type: 'dataFlow',
      title: 'One transformer block, then stack to an LLM',
      steps: [
        { caption: 'Tokens -> embeddings + positional encoding. Each token is now a vector that knows what it is and where it sits.' },
        { caption: 'Multi-head self-attention: h parallel attentions each learn a relation type (subject-verb, adjective-noun...). Outputs concatenated and projected.' },
        { caption: 'Residual + layernorm: add the input back, normalize. Stabilizes and lets gradients flow; required for deep stacks.' },
        { caption: 'Feed-forward sublayer (per-position MLP): adds nonlinearity and capacity; this is where most parameters live.' },
        { caption: 'Residual + layernorm again. That is one block. Stack N blocks (12, 48, 96...), add a linear head to the vocabulary, train on next-token prediction at internet scale -> an LLM.' },
      ],
    },
    activity: {
      type: 'multipleChoice',
      title: 'Why positional encoding?',
      prompt:
        'Self-attention is permutation-equivariant: shuffling the input ' +
        'shuffles the output identically. How does a transformer know word ' +
        'order?',
      languageId: 'python',
      data: {
        question: 'How does the transformer encode order?',
        options: [
          'It sorts tokens alphabetically.',
          'A positional encoding (sinusoidal or learned) is added to each token\'s embedding so every position carries a unique "where am I" signal that attention can use to distinguish order.',
          'The attention weights are sorted.',
          'Order does not matter in language.',
        ],
        correctIndex: 1,
        explanation:
          'Attention computes similarity and averages values; it is blind ' +
          'to order — "dog bites man" and "man bites dog" attend ' +
          'identically. Positional encoding injects a per-position signal ' +
          'into each embedding so the model can tell positions apart. ' +
          'Sinusoidal encodings use fixed sine/cosine patterns; learned ' +
          'encodings train a vector per position. Either makes order ' +
          'visible to an otherwise order-invariant mechanism.',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'What is the role of the feed-forward sublayer in a transformer block, and where do most parameters live?',
        options: [
          'It mixes information across positions; parameters are in attention.',
          'It transforms each position independently (a per-position MLP), adding nonlinearity and capacity; its two weight matrices (typically 4x the model dimension) hold most of the transformer\'s parameters.',
          'It normalizes activations.',
          'It encodes positions.',
        ],
        correctIndex: 1,
        explanation:
          'Attention is linear in the values and mixes across positions; ' +
          'the feed-forward sublayer applies a small MLP to each position ' +
          'separately, supplying the nonlinearity and per-position ' +
          'capacity. Because its hidden dimension is usually 4× the model ' +
          'dimension, the two FFN matrices dominate the parameter count. ' +
          'The catchy title "attention is all you need" undersells the FFN; ' +
          'it is where most of the capacity (and most of the parameters) ' +
          'reside.',
      },
      {
        question: 'Why are residual connections essential for stacking transformer blocks deep (e.g., 96 layers)?',
        options: [
          'They make the model smaller.',
          'They give gradient a direct path backward through the stack, preventing the vanishing-gradient problem that would otherwise leave deep layers unlearnable, and let each layer refine the residual rather than recompute.',
          'They speed up inference.',
          'They replace layernorm.',
        ],
        correctIndex: 1,
        explanation:
          'In a 96-layer network, gradient must travel backward through ' +
          '96 sublayers. Without residual (add-the-input) connections, ' +
          'repeated multiplication shrinks the gradient to near zero by ' +
          'the bottom, and the early layers never learn. The residual ' +
          'connection provides a gradient highway — a path of "+1" back ' +
          'through every layer — so signal reaches all depths. Layer norm ' +
          'then keeps activations bounded; together they make deep stacks ' +
          'trainable.',
      },
    ],
  },
]
