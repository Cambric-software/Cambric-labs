/**
 * Cambric Labs — Module: Statistics (AI & ML Foundations)
 *
 * Two lessons: descriptive statistics (mean/median/mode, variance,
 * distributions), and statistical reasoning (sampling, correlation vs
 * causation, the bias-variance tradeoff that underlies all of ML).
 */
import type { LessonDetail } from '../types'

export const statisticsLessons: LessonDetail[] = [
  {
    id: 'lesson-descriptive-statistics',
    title: 'Descriptive Statistics: Summarizing Data Without Lying',
    moduleId: 'module-statistics',
    languageId: 'python',
    difficulty: 3,
    estimatedMinutes: 12,
    summary:
      'Mean, median, and variance summarize a dataset in a few numbers — ' +
      'but each hides what the others show. The mean lies under skew, the ' +
      'median hides spread, variance has no units. Use them together, and ' +
      'always plot first.',
    teachesConceptIds: ['statistics', 'mean-median', 'variance', 'normal-distribution', 'outlier'],
    prerequisiteConceptIds: ['variable', 'function', 'arithmetic', 'graph'],
    objectives: [
      'Compute mean, median, and mode and know when each is honest.',
      'Compute variance and standard deviation as spread in the data\'s units.',
      'Recognize skew and how it breaks the mean.',
      'Explain why outliers dominate the mean but barely move the median.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'A dataset of a million numbers is useless raw; you need a few ' +
          'numbers that summarize it. Descriptive statistics — mean, ' +
          'median, variance — are those summaries. Each captures one ' +
          'aspect and hides others, so the skill is knowing what each ' +
          'conceals. The mean lies when the data is skewed; the median ' +
          'hides the spread; variance has no units. Use them together.',
      },
      {
        kind: 'heading',
        text: 'Mean: the balance point, fooled by extremes',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'The mean is the sum divided by the count; one huge value drags it.',
        code: "import statistics\n\nsalaries = [40, 45, 50, 55, 5000]   # four normal, one CEO\nprint('mean  =', statistics.mean(salaries))\nprint('median=', statistics.median(salaries))\n# mean is dragged up by the CEO; median reflects the typical worker",
        output: 'mean  = 1038.0\nmedian= 50',
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'Mean lies under skew',
        text:
          'Income, wealth, city populations, web traffic are right-skewed: ' +
          'a few huge values pull the mean far above the typical case. ' +
          'Reporting "average salary = 1038" for the data above is ' +
          'technically correct and deeply misleading. For skewed data, ' +
          'the median is the honest "typical" value.',
      },
      {
        kind: 'heading',
        text: 'Median: the middle value, robust to outliers',
      },
      {
        kind: 'code',
        languageId: 'python',
        caption: 'Sort, take the middle; barely moves when you add an outlier.',
        code: "# median = middle of the sorted list\n# [40, 45, 50, 55, 5000] -> median = 50 (the third of five)\n# add a 999999 salary -> mean jumps ~200k, median moves from 50 to 52.5\n# that robustness is why income is reported as MEDIAN household income",
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'Robust = unmoved by outliers',
        text:
          'The median is robust because it depends on order, not magnitude: ' +
          'the CEO could earn a trillion and the median still only moves ' +
          'one position. The mean is non-robust because it sums every ' +
          'value, so one extreme dominates. Choose your summary by the ' +
          'data: robust (median) for skewed, non-robust (mean) for ' +
          'symmetric.',
      },
      {
        kind: 'heading',
        text: 'Variance and standard deviation: how spread out',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'Variance is the mean squared deviation; std dev is its square root (back in real units).',
        code: "import statistics\n\na = [48, 49, 50, 51, 52]      # tight around 50\nb = [10, 30, 50, 70, 90]     # same mean, wide spread\n\nprint('a: mean=%.0f stdev=%.1f' % (statistics.mean(a), statistics.stdev(a)))\nprint('b: mean=%.0f stdev=%.1f' % (statistics.mean(b), statistics.stdev(b)))\n# same mean, very different spread -> mean alone is a lie",
        output: 'a: mean=50 stdev=1.6\nb: mean=50 stdev=31.6',
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'Standard deviation has units, variance does not',
        text:
          'Variance squares the deviations, so its units are "dollars ' +
          'squared" — uninterpretable. Standard deviation is the square ' +
          'root, returning to the original units (dollars). Report std ' +
          'dev, not variance; it is in the same units as the data and ' +
          'readers can compare it to the mean.',
      },
      {
        kind: 'heading',
        text: 'The normal distribution and outliers',
      },
      {
        kind: 'paragraph',
        text:
          'Many natural measurements cluster symmetrically around the mean ' +
          'in a bell curve (the normal distribution): heights, test scores, ' +
          'measurement error. In a normal, ~68% of data is within one std ' +
          'dev of the mean, ~95% within two. An outlier is a value many ' +
          'std devs away — often a measurement error, sometimes a real ' +
          'anomaly worth investigating.',
      },
      {
        kind: 'compare',
        languageIds: ['python', 'python'],
        caption:
          'Same mean, different spread -> report mean AND std dev, not mean alone.',
        snippets: [
          "a = [48,49,50,51,52]   # mean 50, stdev 1.6 -> tight, predictable",
          "b = [10,30,50,70,90]  # mean 50, stdev 31.6 -> wide, unpredictable",
        ],
      },
    ],
    animation: {
      type: 'timeline',
      title: 'Mean vs median under an outlier',
      steps: [
        { caption: 'Salaries: [40, 45, 50, 55, 5000]. Four typical workers and one CEO.' },
        { caption: 'Mean = 1038. The CEO drags the balance point far above the typical worker. Misleading headline.' },
        { caption: 'Median = 50. The middle of the sorted list. Untouched by the CEO\'s magnitude. Honest "typical."' },
        { caption: 'Add a second CEO at 9999. Mean jumps to ~2000. Median moves from 50 to 52.5 — barely.' },
        { caption: 'Lesson: for skewed data, median is robust and honest; mean is dragged by extremes. Always report spread (std dev) too.' },
      ],
    },
    activity: {
      type: 'multipleChoice',
      title: 'Mean or median?',
      prompt:
        'You are reporting the "typical" home price in a city with a few ' +
        'mega-mansions among ordinary homes. Which is honest?',
      languageId: 'python',
      data: {
        question: 'Mean or median for home prices?',
        options: [
          'Mean — it uses all the data.',
          'Median — home prices are right-skewed by mansions; the mean is dragged above what a typical buyer pays, the median reflects the middle sale and is robust to the extremes.',
          'Both are always the same.',
          'Neither; use the max.',
        ],
        correctIndex: 1,
        explanation:
          'Home prices are right-skewed: most homes are mid-range, a few ' +
          'are enormous. The mean is pulled up by the mansions and ' +
          'overstates what a typical buyer faces. The median is the ' +
          'middle sale — robust to the extremes and honest about the ' +
          'typical transaction. Report the median for skewed data.',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'Why does the standard deviation have the same units as the data while variance does not?',
        options: [
          'They are the same thing.',
          'Variance squares deviations (dollars squared); taking the square root for std dev returns to the original units (dollars), making it comparable to the mean.',
          'Std dev is always 1.',
          'Variance is deprecated.',
        ],
        correctIndex: 1,
        explanation:
          'Variance averages squared differences, so its units are the ' +
          'square of the data\'s units — uninterpretable next to a mean. ' +
          'Standard deviation is the square root of variance, which ' +
          'undoes the squaring and returns to the data\'s units, so you ' +
          'can say "the mean is 50 with std dev 1.6" meaningfully.',
      },
      {
        question: 'Two datasets have the same mean but different std dev. What does that tell you?',
        options: [
          'They are the same dataset.',
          'The mean alone is insufficient: one is tightly clustered around the mean (low std dev, predictable), the other is widely spread (high std dev, unpredictable). Always report spread with the center.',
          'The higher std dev is wrong.',
          'Means are unreliable.',
        ],
        correctIndex: 1,
        explanation:
          'The mean locates the center; the std dev locates the spread. ' +
          'Two datasets can share a mean yet differ entirely in ' +
          'variability. Reporting only the mean hides whether the data is ' +
          'tightly predictable or wildly variable. Always pair a measure of ' +
          'center (mean/median) with a measure of spread (std dev/IQR).',
      },
    ],
  },
  {
    id: 'lesson-statistical-reasoning',
    title: 'Statistical Reasoning: Sampling, Correlation, Bias-Variance',
    moduleId: 'module-statistics',
    languageId: 'python',
    difficulty: 4,
    estimatedMinutes: 13,
    summary:
      'A sample lets you reason about a population you cannot measure ' +
      'fully — but only if it is representative. Correlation between two ' +
      'variables does not imply one causes the other. And every predictor ' +
      'faces the bias-variance tradeoff: too simple and it is wrong, too ' +
      'flexible and it memorizes noise.',
    teachesConceptIds: ['statistics', 'sampling', 'correlation', 'bias-variance', 'overfitting'],
    prerequisiteConceptIds: ['statistics', 'mean-median', 'variance', 'function'],
    objectives: [
      'Explain why a non-representative sample invalidates conclusions.',
      'Distinguish correlation from causation and name a confounder.',
      'Describe the bias-variance tradeoff in plain terms.',
      'Recognize overfitting as memorizing noise instead of signal.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'Descriptive statistics summarize the data you have. ' +
          'Statistical reasoning uses that data to draw conclusions about ' +
          'the world you cannot fully measure — and it is where most ' +
          'errors live. A bad sample, a confused confounder, an overfit ' +
          'model: each produces a confident, wrong conclusion. The skill ' +
          'is skepticism about how the data was collected and what it ' +
          'actually shows.',
      },
      {
        kind: 'heading',
        text: 'Sampling: the population you cannot measure',
      },
      {
        kind: 'paragraph',
        text:
          'You cannot survey every voter, so you ask 1000 and extrapolate. ' +
          'That only works if the 1000 are representative of all voters. A ' +
          'classic failure: a 1936 poll predicted Landon would beat ' +
          'Roosevelt, sampling from car-owner and telephone-subscriber ' +
          'lists — in the Depression, those were the wealthy, who favored ' +
          'Landon. The sample was large but biased, and the prediction was ' +
          'disastrously wrong.',
      },
      {
        kind: 'callout',
        variant: 'danger',
        title: 'A big biased sample is worse than a small random one',
        text:
          'Sample size reduces random error; randomness reduces systematic ' +
          'error (bias). A huge biased sample confidently gives you the ' +
          'wrong answer, because the bias does not shrink as n grows. ' +
          'Representativeness beats size: a random sample of 500 beats a ' +
          'biased sample of 50,000.',
      },
      {
        kind: 'heading',
        text: 'Correlation is not causation',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'Two variables move together; that does not mean one causes the other.',
        code: "import numpy as np\n\n# ice cream sales and shark attacks, by month\nicecream   = np.array([10, 15, 30, 60, 80, 95, 90, 70, 40, 20, 12, 8])\nshark      = np.array([ 2,  3,  5,  9, 12, 15, 14, 11,  7,  4,  2, 1])\nprint('correlation =', round(np.corrcoef(icecream, shark)[0,1], 3))\n# strong positive correlation! does ice cream cause shark attacks?",
        output: 'correlation = 0.972',
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'The confounder: summer',
        text:
          'Ice cream and shark attacks correlate at 0.97 — but ice cream ' +
          'does not cause sharks. Both rise in summer (the confounder: ' +
          'temperature). Correlation tells you two variables move ' +
          'together; it cannot tell you why. To claim causation you need a ' +
          'randomized experiment or a principled argument that excludes ' +
          'confounders.',
      },
      {
        kind: 'heading',
        text: 'The bias-variance tradeoff',
      },
      {
        kind: 'paragraph',
        text:
          'Every model that predicts from data faces a fundamental split ' +
          'of its error: bias (the model is too simple to capture the real ' +
          'pattern — it systematically misses) and variance (the model is ' +
          'too flexible and fits the noise in this particular sample — it ' +
          'would change drastically with a new sample). You cannot ' +
          'minimize both; reducing one often raises the other.',
      },
      {
        kind: 'compare',
        languageIds: ['python', 'python'],
        caption:
          'Underfit (high bias, too simple) vs overfit (high variance, memorizes noise).',
        snippets: [
          "# underfit: y = a*x + b on data that is actually a sine wave\n# the line misses the curve systematically (high bias)\n# train error high, test error high",
          "# overfit: a degree-20 polynomial through 10 points\n# the curve hits every point but oscillates wildly between them\n# train error 0, test error enormous (memorized noise)",
        ],
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'Overfitting = memorizing noise',
        text:
          'A model flexible enough to pass through every training point is ' +
          'not "smarter" — it has memorized the noise specific to this ' +
          'sample, which will not repeat. On new data it fails. The cure ' +
          'is to hold out data the model never sees (a test set) and ' +
          'report that error, not the training error. If train error is ' +
          'low but test error is high, you overfit.',
      },
      {
        kind: 'heading',
        text: 'The train/test split catches overfitting',
      },
      {
        kind: 'code',
        languageId: 'python',
        caption: 'Never evaluate a model on the data it learned from; hold some out.',
        code: "from sklearn.model_selection import train_test_split\nfrom sklearn.metrics import mean_squared_error\n\nX_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2)\n\nmodel.fit(X_tr, y_tr)              # learn ONLY on the train split\ntrain_err = mean_squared_error(y_tr, model.predict(X_tr))   # low\n test_err = mean_squared_error(y_te, model.predict(X_te))   # the honest number\n# if train_err << test_err -> overfit; the model learned noise, not signal",
      },
      {
        kind: 'compare',
        languageIds: ['python', 'python'],
        caption:
          'Evaluate on train (lies, rewards memorization) vs test (honest, rewards generalization).',
        snippets: [
          "err = mean_squared_error(y_train, model.predict(X_train))\n# low; but proves nothing — the model saw this data",
          "err = mean_squared_error(y_test,  model.predict(X_test))\n# honest; data the model never saw -> measures generalization",
        ],
      },
    ],
    animation: {
      type: 'dataFlow',
      title: 'Underfit, just right, overfit',
      steps: [
        { caption: 'Underfit (high bias): a straight line fit to a sine wave. Misses the pattern; high train AND test error.' },
        { caption: 'Just right (balanced): a smooth curve captures the sine shape without chasing the noise. Moderate bias and variance; lowest test error.' },
        { caption: 'Overfit (high variance): a degree-20 polynomial through every point. Train error 0, but wild oscillations between points; test error enormous.' },
        { caption: 'Why test error is U-shaped in model flexibility: at first, more flexibility reduces bias faster than variance rises (good). Past the sweet spot, variance explodes and test error rises (bad).' },
        { caption: 'Lesson: pick the flexibility that minimizes TEST error, not train error. Train error is a lie; it monotonically decreases as you overfit.' },
      ],
    },
    activity: {
      type: 'multipleChoice',
      title: 'Correlation or causation?',
      prompt:
        'A study finds that cities with more hospitals have more deaths. ' +
        'Does building a hospital cause deaths?',
      languageId: 'python',
      data: {
        question: 'What is going on?',
        options: [
          'Yes; hospitals are dangerous.',
          'No — the confounder is population: bigger cities have more hospitals AND more deaths. Correlation does not imply the hospitals cause the deaths.',
          'No; the data is wrong.',
          'Yes; the study is peer-reviewed.',
        ],
        correctIndex: 1,
        explanation:
          'Cities with more people have more of everything — hospitals ' +
          'and deaths both rise with population, the confounder. The ' +
          'correlation is real but the causal claim ("hospitals cause ' +
          'deaths") is wrong. To establish causation you would need to ' +
          'compare cities of equal population, or run an experiment that ' +
          'isolates the effect of hospital count.',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'Why is a large biased sample more dangerous than a small random one?',
        options: [
          'Small samples are always better.',
          'Size reduces random error but not bias; a large biased sample confidently gives the wrong answer, because the systematic error does not shrink as n grows.',
          'Large samples cost more.',
          'Biased samples cannot be large.',
        ],
        correctIndex: 1,
        explanation:
          'Bias is systematic error — it does not vanish as you collect ' +
          'more data the same way. Sampling 100,000 wealthy voters still ' +
          'measures wealthy voters, not the electorate. A small random ' +
          'sample is noisy but unbiased; averaging more of it converges ' +
          'to the truth. A biased sample, however large, converges to the ' +
          'wrong answer. Representativeness beats size.',
      },
      {
        question: 'What does it mean to say a model "overfits", and how do you detect it?',
        options: [
          'It runs slowly.',
          'It is flexible enough to memorize the noise in the training data, so train error is near zero but test error is high; detect via a train/test split — if test error is much higher than train error, the model overfit.',
          'It uses too few parameters.',
          'It has high bias.',
        ],
        correctIndex: 1,
        explanation:
          'Overfitting is the failure mode of high variance: the model ' +
          'fits the specific sample, noise included, instead of the ' +
          'underlying signal. Training error looks great (near zero) but ' +
          'is meaningless because the model saw that data. You detect it ' +
          'by holding out a test set the model never trained on; if its ' +
          'error is far higher, the model memorized rather than ' +
          'generalized.',
      },
    ],
  },
]
