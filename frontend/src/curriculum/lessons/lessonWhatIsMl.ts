/**
 * Cambric Labs — Lesson: What Is Machine Learning?
 *
 * Teaches the ML paradigm shift: instead of writing rules, learn them from
 * data. Uses the spam-filter example to make the contrast vivid. Avoids
 * math; focuses on the conceptual model.
 */
import type { LessonDetail } from '../types'

export const lessonWhatIsMl: LessonDetail = {
  id: 'lesson-what-is-ml',
  title: 'What Is Machine Learning? Learning From Data Instead of Rules',
  moduleId: 'module-ml-intro',
  languageId: 'python',
  difficulty: 2,
  estimatedMinutes: 13,
  summary:
    'Machine learning flips programming: instead of writing the rules, you ' +
    'show the computer labeled examples and it learns the rules itself.',
  teachesConceptIds: ['machine-learning', 'training', 'model', 'feature', 'supervised-learning'],
  prerequisiteConceptIds: ['function', 'conditional'],
  objectives: [
    'Contrast traditional programming (you write rules) with ML (the computer learns rules).',
    'Explain supervised learning: training on labeled examples.',
    'Identify features and labels in a training example.',
    'Describe the training loop: predict, measure error, adjust.',
  ],
  content: [
    {
      kind: 'paragraph',
      text:
        'In traditional programming, you write the RULES. To detect spam, you ' +
        'might write: if the email contains "free money" then mark it spam. ' +
        'This works — until spammers write "FR.EE MONEY" or "cash gift." You ' +
        'add more rules. They adapt. You add more. This is a losing game ' +
        'because the space of possible spam is infinite and you cannot enumerate ' +
        'every trick. Machine learning flips the approach: instead of writing ' +
        'the rules, you give the computer hundreds of EXAMPLES (spam and ' +
        'not-spam), and it learns the rules itself.',
    },
    {
      kind: 'callout',
      variant: 'info',
      title: 'The core shift: rules emerge from data, not from the programmer',
      text:
        'Traditional: data + rules (written by you) → answers.\n' +
        'Machine learning: data + answers → rules (learned by the model).\n' +
        'You provide labeled examples (inputs paired with correct outputs). ' +
        'The algorithm finds patterns that map inputs to outputs. The resulting ' +
        'pattern is called a MODEL — a function that can now predict outputs ' +
        'for inputs it has never seen.',
    },
    {
      kind: 'heading',
      text: 'Supervised learning: the most common flavor',
    },
    {
      kind: 'paragraph',
      text:
        'In SUPERVISED learning, every training example has a LABEL — the ' +
        'correct answer. To train a spam detector, you collect thousands of ' +
        'emails, each labeled "spam" or "not spam." The FEATURES are the ' +
        'measurable properties of each email (word counts, sender, time sent). ' +
        'The algorithm learns a function from features to label. Once trained, ' +
        'the model can predict the label for a new, unseen email.',
    },
    {
      kind: 'codeWithOutput',
      languageId: 'python',
      caption: 'The shape of supervised learning, in pseudocode. Real models use the same loop with math instead of if/else.',
      code:
        '# Training data: each example has FEATURES (x) and a LABEL (y)\ntraining_data = [\n    {"features": ["free", "money", "now"], "label": "spam"},\n    {"features": ["meeting", "tomorrow", "9am"], "label": "not_spam"},\n    {"features": ["winner", "claim", "prize"], "label": "spam"},\n    # ... thousands more examples\n]\n\n# The model LEARNS a function: features -> label\n# (you do not write this function — the algorithm finds it)\nmodel = train(training_data)\n\n# Now predict on a NEW email the model has never seen\nnew_email_features = ["urgent", "claim", "your", "prize"]\nprint(model.predict(new_email_features))  # "spam"',
      output: 'spam',
    },
    {
      kind: 'callout',
      variant: 'tip',
      title: 'Features are the model\'s only view of the world',
      text:
        'A model cannot read your mind or see the email beyond its features. ' +
        'If you do not include the sender\'s domain as a feature, the model ' +
        'cannot use it — even if it would be the single best spam signal. ' +
        'Feature engineering (choosing which measurable properties to give ' +
        'the model) is often the single biggest lever on model quality. More ' +
        'data and better features usually beat fancier algorithms.',
    },
    {
      kind: 'heading',
      text: 'The training loop: predict, measure error, adjust',
    },
    {
      kind: 'steps',
      caption: 'How a model actually learns, one step at a time',
      steps: [
        'PREDICT: the model makes a guess for a training example (e.g., it guesses "not spam" for a spam email).',
        'MEASURE: compare the guess to the true label. The guess was wrong, so there is ERROR.',
        'ADJUST: tweak the model\'s internal parameters slightly so it would guess better next time.',
        'REPEAT: do this for every example, many times over. Each pass through the data is called an EPOCH.',
      ],
    },
    {
      kind: 'paragraph',
      text:
        'Over many epochs, the error decreases. The model\'s predictions get ' +
        'closer to the true labels. Eventually the error stops dropping — the ' +
        'model has learned the patterns the data contains. At that point, it ' +
        'can generalize to new examples it has never seen, IF the new examples ' +
        'come from the same distribution as the training data.',
    },
    {
      kind: 'callout',
      variant: 'warning',
      title: 'Generalization is the goal — not memorization',
      text:
        'A model that perfectly labels every TRAINING example might just be ' +
        'memorizing. The real test is how it performs on UNSEEN data. This is ' +
        'why you split your data into a training set (to learn) and a test set ' +
        '(to evaluate). A model that does well on training data but poorly on ' +
        'test data has OVERFIT — it memorized instead of learning the general ' +
        'pattern. Preventing overfitting is a central concern of ML practice.',
    },
    {
      kind: 'heading',
      text: 'When to use ML vs traditional programming',
    },
    {
      kind: 'steps',
      caption: 'ML is powerful but not always the right tool',
      steps: [
        'Use TRADITIONAL CODE when the rules are clear and stable (e.g., calculating tax: the law specifies the formula).',
        'Use ML when the rules are too complex to write by hand (e.g., recognizing a cat in a photo — no one wrote rules for that).',
        'Use ML when the rules CHANGE over time (spam tactics evolve; the model can be retrained).',
        'Avoid ML when you need a guarantee of correctness — ML models are statistical, not exact. For banking ledgers, use deterministic code.',
      ],
    },
    {
      kind: 'compare',
      languageIds: ['python', 'python'],
      caption:
        'Same goal (detect spam), two approaches. The rules approach breaks ' +
        'the moment a spammer rephrases. The ML approach generalizes to new ' +
        'phrasings because it learned patterns, not a fixed list.',
      snippets: [
        '# Traditional: you write the rules (fragile)\ndef is_spam(email):\n    if "free money" in email:\n        return True\n    if "winner" in email:\n        return True\n    return False  # spammers easily evade this',
        '# ML: you train a model on labeled examples (robust)\nfrom sklearn.feature_extraction.text import CountVectorizer\nfrom sklearn.naive_bayes import MultinomialNB\nmodel = MultinomialNB()\nmodel.fit(email_features, labels)  # learns the patterns\nprediction = model.predict([new_email])',
      ],
    },
  ],
  animation: {
    type: 'dataFlow',
    title: 'The training loop: predict, measure, adjust',
    steps: [
      { caption: 'Start with a random model. Show it a training example: features = ["winner","claim"], true label = "spam".', highlightLines: [1] },
      { caption: 'PREDICT: the model guesses "not spam" (it is untrained).', highlightLines: [2] },
      { caption: 'MEASURE: the true label is "spam" but the guess was "not spam". There is ERROR.', highlightLines: [3] },
      { caption: 'ADJUST: the model tweaks its internal weights so it would lean toward "spam" for features like these.', highlightLines: [4] },
      { caption: 'Next example: features = ["meeting","9am"], label = "not spam". Predict "not spam" — correct. Tiny adjustment only.', highlightLines: [5] },
      { caption: 'After thousands of examples and many epochs, error is low. The model generalizes to new emails.', highlightLines: [6] },
    ],
  },
  activity: {
    type: 'spotBadPractice',
    title: 'Spot the bad ML practice',
    prompt:
      'A colleague trained a spam model and reports: "100% accuracy! It ' +
      'correctly labels every single email in my training set." What is the ' +
      'most likely problem?',
    languageId: 'python',
    data: {
      options: [
        'The model is too small and needs more parameters',
        'The model likely overfit — memorizing training data instead of generalizing. Test on unseen data to know.',
        '100% accuracy is always the goal, so there is no problem',
        'The training set was too large and should be reduced',
      ],
      correctIndex: 1,
      explanation:
        'Perfect accuracy on training data is a red flag for overfitting. The ' +
        'real question is how the model performs on data it has NEVER seen. ' +
        'Always evaluate on a held-out test set. A model that memorizes the ' +
        'training data will fail on new, slightly different spam.',
    },
  },
  comprehensionChecks: [
    {
      question: 'What is the fundamental difference between traditional programming and machine learning?',
      options: [
        'ML is faster at runtime',
        'In ML, you provide data and answers, and the algorithm learns the rules; in traditional programming, you write the rules',
        'ML uses Python and traditional programming uses C',
        'ML only works for large companies',
      ],
      correctIndex: 1,
      explanation:
        'Traditional: you write rules. ML: the rules are LEARNED from labeled ' +
        'examples. This is why ML works for problems where no human can write ' +
        'the rules (like recognizing a cat in a photo).',
    },
    {
      question: 'In supervised learning, what is a "label"?',
      options: [
        'A tag organizing the training files',
        'The correct answer for a training example (the thing the model learns to predict)',
        'A feature the model can choose to use or ignore',
        'The name of the algorithm being used',
      ],
      correctIndex: 1,
      explanation:
        'A label is the correct output for an example. For spam detection, ' +
        'the label is "spam" or "not spam." The model learns to map features ' +
        'to this label. Without labels, you cannot do supervised learning.',
    },
    {
      question: 'What does "overfitting" mean?',
      options: [
        'The model is too simple for the problem',
        'The model memorized the training data but does not generalize to new, unseen data',
        'The model used too many features',
        'The training took too long',
      ],
      correctIndex: 1,
      explanation:
        'Overfitting is when the model fits the training data perfectly but ' +
        'fails on new data. It learned noise or memorized examples instead of ' +
        'the underlying pattern. This is why you always evaluate on a held-out ' +
        'test set the model never trained on.',
    },
  ],
}
