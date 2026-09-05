/**
 * ChargeGuard AI - Model Performance & Evaluation Metrics Data
 * 
 * Actual held-out evaluation results of the HistGradientBoostingClassifier model
 * evaluated on a synthetic demonstration dataset (N = 4,000 test samples).
 * 
 * IMPORTANT DISCLAIMER:
 * These results are from a SYNTHETIC DEMONSTRATION DATASET.
 * They are NOT production Razorpay performance results.
 */

export interface ModelThresholdPoint {
  threshold: number;
  recall: number;
  precision: number;
  f1: number;
  fpr: number;
  estimatedFpCostINR: number;
  isOperatingPoint?: boolean;
}

export interface ModelFeatureSignal {
  name: string;
  category: 'TRANSACTION' | 'IDENTITY' | 'BEHAVIOR' | 'AUTHENTICATION' | 'VELOCITY';
  description: string;
  dataType: string;
}

export const syntheticEvaluationData = {
  modelName: 'HistGradientBoostingClassifier',
  modelVersion: '1.0.0-synthetic-demo',
  inferenceEngine: 'FastAPI',
  datasetType: 'Synthetic Demonstration Dataset',
  totalSyntheticTransactions: 20000,
  trainingSamples: 16000,
  heldOutTestSamples: 4000,
  syntheticChargebackRatePercent: 25.45,
  decisionThreshold: 0.20,
  featureCount: 11,

  // Held-out test set metrics at selected threshold 0.20
  metrics: {
    accuracyPercent: 64.42,
    precisionPercent: 38.98,
    recallPercent: 70.33,
    f1ScorePercent: 50.16,
    rocAucPercent: 73.43,
    falsePositiveRatePercent: 37.59
  },

  // 2x2 Confusion Matrix at threshold 0.20 (4,000 test samples)
  confusionMatrix: {
    trueNegatives: 1861,
    falsePositives: 1121,
    falseNegatives: 302,
    truePositives: 716,
    actualNonChargebackTotal: 2982,
    actualChargebackTotal: 1018
  },

  // Friction & Cost Assumptions
  frictionCost: {
    falsePositivesCount: 1121,
    assumedCostPerFpINR: 150,
    estimatedFrictionCostINR: 168150,
    costLabel: 'Assumption for demonstration'
  },

  // Threshold comparison table
  thresholdAnalysis: [
    { threshold: 0.10, recall: 1.00, precision: 0.26, f1: 0.41, fpr: 0.98, estimatedFpCostINR: 438300 },
    { threshold: 0.15, recall: 0.84, precision: 0.33, f1: 0.48, fpr: 0.57, estimatedFpCostINR: 255900 },
    { threshold: 0.20, recall: 0.70, precision: 0.39, f1: 0.50, fpr: 0.38, estimatedFpCostINR: 168150, isOperatingPoint: true },
    { threshold: 0.25, recall: 0.61, precision: 0.44, f1: 0.51, fpr: 0.27, estimatedFpCostINR: 118650 },
    { threshold: 0.30, recall: 0.53, precision: 0.48, f1: 0.50, fpr: 0.19, estimatedFpCostINR: 87150 }
  ] as ModelThresholdPoint[],

  // The 11 model input features (plain descriptions, no invented feature importance)
  features: [
    {
      name: 'transaction_amount',
      category: 'TRANSACTION',
      description: 'Transaction value in INR submitted at checkout authorization.',
      dataType: 'Numeric (INR)'
    },
    {
      name: 'account_age_days',
      category: 'IDENTITY',
      description: 'Customer account tenure measured in days since account creation.',
      dataType: 'Integer (Days)'
    },
    {
      name: 'previous_orders',
      category: 'BEHAVIOR',
      description: 'Lifetime count of legitimate completed orders prior to current checkout.',
      dataType: 'Integer'
    },
    {
      name: 'previous_chargebacks',
      category: 'BEHAVIOR',
      description: 'Lifetime count of prior disputed or chargeback transactions on this identity.',
      dataType: 'Integer'
    },
    {
      name: 'failed_payment_attempts',
      category: 'VELOCITY',
      description: 'Number of declined, failed, or cancelled payment attempts in the last 24 hours.',
      dataType: 'Integer'
    },
    {
      name: 'transactions_last_24h',
      category: 'VELOCITY',
      description: 'Total transaction attempt velocity initiated across the account in the last 24 hours.',
      dataType: 'Integer'
    },
    {
      name: 'device_changed',
      category: 'IDENTITY',
      description: 'Binary indicator showing if session device footprint is new or changed (0 = Unchanged, 1 = Changed).',
      dataType: 'Binary (0 / 1)'
    },
    {
      name: 'billing_shipping_mismatch',
      category: 'IDENTITY',
      description: 'Binary indicator showing postal or city divergence between billing card address and shipping address (0 = Match, 1 = Mismatch).',
      dataType: 'Binary (0 / 1)'
    },
    {
      name: 'three_ds_friction',
      category: 'AUTHENTICATION',
      description: '3D Secure 2.x protocol friction status (0 = Frictionless / Liability shift, 1 = Friction or challenge failure).',
      dataType: 'Binary (0 / 1)'
    },
    {
      name: 'customer_age_years',
      category: 'IDENTITY',
      description: 'Declared or KYC-verified age of the account holder in years.',
      dataType: 'Integer (Years)'
    },
    {
      name: 'order_value',
      category: 'TRANSACTION',
      description: 'Gross cart item merchandise subtotal before coupon or promotional discount deductions.',
      dataType: 'Numeric (INR)'
    }
  ] as ModelFeatureSignal[]
};

// Backward-compatible export for existing components if referenced
export const demoModelMetrics = {
  modelName: syntheticEvaluationData.modelName,
  modelVersion: syntheticEvaluationData.modelVersion,
  evaluationDatasetSize: syntheticEvaluationData.heldOutTestSamples,
  datasetDateRange: 'Synthetic Demonstration Dataset Held-out Test Split',
  isDemoModel: true,
  metrics: {
    precision: 0.3898,
    recall: 0.7033,
    f1Score: 0.5016,
    accuracy: 0.6442,
    falsePositiveRate: 0.3759,
    falsePositiveCostINR: 168150,
    totalChargebackLossPreventedINR: 3520000,
    aucRoc: 0.7343
  },
  confusionMatrix: {
    truePositives: 716,
    falsePositives: 1121,
    trueNegatives: 1861,
    falseNegatives: 302
  },
  thresholdCurve: syntheticEvaluationData.thresholdAnalysis.map(p => ({
    threshold: p.threshold,
    precision: p.precision,
    recall: p.recall,
    f1: p.f1,
    fpr: p.fpr,
    lossPreventedLakhs: (p.recall * 1018 * 4500) / 100000,
    frictionCostLakhs: p.estimatedFpCostINR / 100000
  }))
};

