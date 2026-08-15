/**
 * Loss Functions for CAMBRIC LABS
 *
 * Ported 1:1 from backend/neural/loss.py.
 */

export interface LossInfo {
  name: string;
  formula: string;
  range: string;
  best_for?: string;
  uses?: string[];
  pros?: string[];
  cons?: string[];
  why?: string;
}

function mean(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export class LossFunctions {
  /** Mean Squared Error: L = (1/n) * Σ(prediction - target)^2 */
  static mse(predictions: number[], targets: number[]): number {
    return mean(predictions.map((p, i) => (p - targets[i]) ** 2));
  }

  /** dL/dp = (2/n) * (prediction - target) */
  static mseDerivative(predictions: number[], targets: number[]): number[] {
    const n = predictions.length;
    return predictions.map((p, i) => (2 / n) * (p - targets[i]));
  }

  /** Mean Absolute Error: L = (1/n) * Σ|prediction - target| */
  static mae(predictions: number[], targets: number[]): number {
    return mean(predictions.map((p, i) => Math.abs(p - targets[i])));
  }

  /** dL/dp = sign(prediction - target) / n */
  static maeDerivative(predictions: number[], targets: number[]): number[] {
    const n = predictions.length;
    return predictions.map((p, i) => Math.sign(p - targets[i]) / n);
  }

  /** Binary cross-entropy, with clipping for numerical stability */
  static crossEntropy(predictions: number[], targets: number[]): number {
    const clipped = predictions.map((p) => Math.min(Math.max(p, 1e-15), 1 - 1e-15));
    const terms = clipped.map(
      (p, i) => targets[i] * Math.log(p) + (1 - targets[i]) * Math.log(1 - p)
    );
    return -mean(terms);
  }

  /** dL/dp = (p - t) / (p * (1 - p) * n), matching backend/neural/loss.py exactly */
  static crossEntropyDerivative(predictions: number[], targets: number[]): number[] {
    const n = predictions.length;
    const clipped = predictions.map((p) => Math.min(Math.max(p, 1e-15), 1 - 1e-15));
    return clipped.map((p, i) => (p - targets[i]) / (p * (1 - p)) / n);
  }

  /** Categorical cross-entropy for one-hot targets (predictions/targets: samples x classes) */
  static categoricalCrossEntropy(predictions: number[][], targets: number[][]): number {
    const perSample = predictions.map((predRow, i) => {
      const targetRow = targets[i];
      let sum = 0;
      for (let c = 0; c < predRow.length; c++) {
        const p = Math.min(Math.max(predRow[c], 1e-15), 1 - 1e-15);
        sum += targetRow[c] * Math.log(p);
      }
      return sum;
    });
    return -mean(perSample);
  }

  /** With softmax, simplifies to: prediction - target */
  static categoricalCrossEntropyDerivative(
    predictions: number[][],
    targets: number[][]
  ): number[][] {
    return predictions.map((row, i) => row.map((p, c) => p - targets[i][c]));
  }

  static binaryAccuracy(predictions: number[], targets: number[], threshold = 0.5): number {
    const correct = predictions.map((p, i) => ((p >= threshold ? 1 : 0) === targets[i] ? 1 : 0));
    return mean(correct);
  }

  /** predictions/targets: samples x classes (one-hot) */
  static categoricalAccuracy(predictions: number[][], targets: number[][]): number {
    const argmax = (row: number[]) => row.indexOf(Math.max(...row));
    const correct = predictions.map((row, i) => (argmax(row) === argmax(targets[i]) ? 1 : 0));
    return mean(correct);
  }

  private static readonly FUNCTIONS: Record<string, (p: number[], t: number[]) => number> = {
    mse: LossFunctions.mse,
    mae: LossFunctions.mae,
    cross_entropy: LossFunctions.crossEntropy,
  };

  private static readonly DERIVATIVES: Record<string, (p: number[], t: number[]) => number[]> = {
    mse: LossFunctions.mseDerivative,
    mae: LossFunctions.maeDerivative,
    cross_entropy: LossFunctions.crossEntropyDerivative,
  };

  static compute(name: string, predictions: number[], targets: number[]): number {
    const fn = LossFunctions.FUNCTIONS[name];
    if (!fn) {
      throw new Error(`Unknown loss: ${name}. Choose from: ${Object.keys(LossFunctions.FUNCTIONS).join(', ')}`);
    }
    return fn(predictions, targets);
  }

  static computeDerivative(name: string, predictions: number[], targets: number[]): number[] {
    const fn = LossFunctions.DERIVATIVES[name];
    if (!fn) {
      throw new Error(`Unknown or non-differentiable loss: ${name}`);
    }
    return fn(predictions, targets);
  }

  /** Educational metadata used by the UI's "WHY" explanations. */
  static getInfo(name: string): LossInfo {
    const info: Record<string, LossInfo> = {
      mse: {
        name: 'Mean Squared Error (MSE)',
        formula: 'L = (1/n) * Σ(prediction - target)²',
        range: '[0, ∞)',
        best_for: 'Regression problems',
        uses: ['Price prediction', 'Age estimation', 'Any continuous value prediction'],
        pros: [
          'Smooth gradients everywhere',
          'Penalizes large errors heavily',
          'Well-suited for Gaussian noise',
        ],
        cons: ['Sensitive to outliers', 'Can get stuck in local minima with noisy data'],
        why:
          'MSE squares the errors, so large mistakes are penalized much more than small ones. ' +
          'This makes sense when large errors are particularly bad. However, it can cause issues ' +
          'when data has outliers, as a single bad prediction can dominate the loss.',
      },
      mae: {
        name: 'Mean Absolute Error (MAE)',
        formula: 'L = (1/n) * Σ|prediction - target|',
        range: '[0, ∞)',
        best_for: 'Robust regression',
        uses: ['Forecasting with outliers', 'Robust regression', 'Anomaly detection'],
        pros: [
          'Robust to outliers',
          'More interpretable (same units as output)',
          'Stable gradients',
        ],
        cons: ['Gradient is constant (not optimal near minimum)', 'Slower convergence'],
        why:
          "MAE uses absolute values, so all errors contribute equally regardless of size. This " +
          "makes it robust to outliers — a single huge error won't dominate the loss. However, " +
          'the gradient is the same everywhere, which can make fine-tuning near the minimum difficult.',
      },
      cross_entropy: {
        name: 'Cross-Entropy (Binary)',
        formula: 'L = -[target * log(pred) + (1-target) * log(1-pred)]',
        range: '[0, ∞)',
        best_for: 'Binary classification',
        uses: ['Spam detection', 'Image classification (binary)', 'Medical diagnosis'],
        pros: [
          'Strong gradients when prediction is wrong',
          'Works well with sigmoid activation',
          'Interpretable (related to information theory)',
        ],
        cons: [
          'Can be unstable with wrong predictions',
          'Requires clipping for numerical stability',
        ],
        why:
          'Cross-entropy loss is based on information theory. When the prediction is confident ' +
          'and wrong, the loss is very large (near infinity). When confident and right, the loss ' +
          'is near zero. This provides a strong learning signal, especially in the early stages of training.',
      },
      categorical_cross_entropy: {
        name: 'Categorical Cross-Entropy',
        formula: 'L = -Σ Σ target_i * log(prediction_i)',
        range: '[0, ∞)',
        best_for: 'Multi-class classification',
        uses: ['Image classification (many classes)', 'Text classification', 'Any multi-class problem'],
        pros: [
          'Natural for multi-class problems',
          'Strong gradients with softmax',
          'Outputs are valid probabilities',
        ],
        cons: ['Requires mutually exclusive classes', 'Can be numerically unstable'],
        why:
          'Categorical cross-entropy extends binary cross-entropy to multiple classes. It measures ' +
          'the difference between the predicted probability distribution and the true distribution ' +
          '(which is 1 for the correct class, 0 for others). When combined with softmax, the ' +
          'gradient simplifies to prediction minus target, making training very effective.',
      },
    };

    return info[name] ?? { name, formula: 'N/A', range: 'N/A', best_for: 'N/A' };
  }

  static getAllNames(): string[] {
    return [...Object.keys(LossFunctions.FUNCTIONS), 'categorical_cross_entropy'];
  }
}
