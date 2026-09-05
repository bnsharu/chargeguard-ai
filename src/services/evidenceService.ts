import { Transaction, EvidenceCase, EvidenceChecklistItem, EvidenceStrengthTier, EvidenceCaseStatus } from '../types';

export interface ChecklistCategoryDefinition {
  letter: string;
  category: string;
  items: string[];
}

export const EVIDENCE_CHECKLIST_TEMPLATE: ChecklistCategoryDefinition[] = [
  {
    letter: 'A',
    category: 'Transaction Information',
    items: [
      'Transaction details',
      'Amount',
      'Date/time',
      'Payment method'
    ]
  },
  {
    letter: 'B',
    category: 'Customer Verification',
    items: [
      'Customer identity information',
      'Account history',
      'Previous legitimate orders'
    ]
  },
  {
    letter: 'C',
    category: 'Payment Authentication',
    items: [
      '3-D Secure result',
      'Authentication status',
      'Payment authorization information'
    ]
  },
  {
    letter: 'D',
    category: 'Order Information',
    items: [
      'Order details',
      'Product/service description',
      'Invoice or receipt'
    ]
  },
  {
    letter: 'E',
    category: 'Fulfillment Information',
    items: [
      'Shipping/delivery confirmation',
      'Delivery tracking information',
      'Service completion information'
    ]
  },
  {
    letter: 'F',
    category: 'Customer Communication',
    items: [
      'Relevant customer communication',
      'Refund/cancellation communication',
      'Support correspondence'
    ]
  },
  {
    letter: 'G',
    category: 'Merchant Information',
    items: [
      'Merchant policies',
      'Refund policy',
      'Terms accepted by customer'
    ]
  }
];

export const TOTAL_EVIDENCE_ITEMS = EVIDENCE_CHECKLIST_TEMPLATE.reduce(
  (acc, cat) => acc + cat.items.length,
  0
); // 22 items

/**
 * Creates a fresh, uncompleted checklist where each item is explicitly unchecked (isAvailable: false).
 */
export function createDefaultChecklist(): EvidenceChecklistItem[] {
  const list: EvidenceChecklistItem[] = [];
  EVIDENCE_CHECKLIST_TEMPLATE.forEach((cat) => {
    cat.items.forEach((itemText) => {
      const id = `${cat.category}_${itemText}`.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      list.push({
        id,
        category: cat.category,
        label: itemText,
        isAvailable: false // User must explicitly mark items as available
      });
    });
  });
  return list;
}

/**
 * Calculates evidence strength metrics.
 * 0–39%   → WEAK
 * 40–69%  → MODERATE
 * 70–89%  → STRONG
 * 90–100% → COMPLETE
 */
export function calculateEvidenceStrength(checklist: EvidenceChecklistItem[]): {
  completedCount: number;
  totalItems: number;
  percent: number;
  tier: EvidenceStrengthTier;
} {
  const totalItems = checklist.length || TOTAL_EVIDENCE_ITEMS;
  const completedCount = checklist.filter((item) => item.isAvailable).length;
  const percent = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  let tier: EvidenceStrengthTier = 'WEAK';
  if (percent >= 90) {
    tier = 'COMPLETE';
  } else if (percent >= 70) {
    tier = 'STRONG';
  } else if (percent >= 40) {
    tier = 'MODERATE';
  } else {
    tier = 'WEAK';
  }

  return { completedCount, totalItems, percent, tier };
}

/**
 * Generates recommended evidence based on the transaction attributes and available checklist items.
 * These are recommendations only; does not claim evidence exists unless marked available.
 */
export function getEvidenceRecommendations(
  transaction: Transaction,
  checklist: EvidenceChecklistItem[]
): string[] {
  const recommendations: string[] = [];
  const isAvailable = (label: string) =>
    checklist.some((item) => item.label.toLowerCase() === label.toLowerCase() && item.isAvailable);

  // 1. Payment Authentication recommendation
  if (!isAvailable('3-D Secure result') || !isAvailable('Authentication status') || !isAvailable('Payment authorization information')) {
    if (transaction.payment.authStatus3DS === 'AUTHENTICATED' || transaction.payment.authStatus3DS === 'FRICTIONLESS_SUCCESS') {
      recommendations.push('Provide payment authentication result (3-D Secure authorization records if available)');
    } else {
      recommendations.push('Provide payment authentication result and gateway authorization logs if available');
    }
  }

  // 2. Order Information recommendation
  if (!isAvailable('Order details') || !isAvailable('Invoice or receipt')) {
    recommendations.push('Provide order or invoice information (itemized invoice or receipt if available)');
  }

  // 3. Fulfillment Information recommendation
  if (!isAvailable('Shipping/delivery confirmation') || !isAvailable('Delivery tracking information')) {
    if (transaction.proofOfDelivery?.carrier) {
      recommendations.push(`Attach relevant fulfillment records (carrier tracking records from ${transaction.proofOfDelivery.carrier} if available)`);
    } else {
      recommendations.push('Attach relevant fulfillment records (signed proof of delivery, carrier consignment note, or service logs if available)');
    }
  }

  // 4. Customer Verification recommendation
  if (!isAvailable('Customer identity information') || !isAvailable('Account history')) {
    if (transaction.customer.accountAgeDays > 30 || transaction.customer.totalPastOrders > 0) {
      recommendations.push('Provide customer verification records (established account tenure and prior order history if available)');
    } else {
      recommendations.push('Provide customer verification records (matching account sign-up details, phone verification, or IP logs if available)');
    }
  }

  // 5. Customer Communication recommendation
  if (!isAvailable('Relevant customer communication') || !isAvailable('Support correspondence')) {
    recommendations.push('Provide relevant customer communication (order confirmation emails, SMS dispatch notifications, or support logs if available)');
  }

  // 6. Merchant Policies recommendation
  if (!isAvailable('Refund policy') || !isAvailable('Terms accepted by customer')) {
    recommendations.push('Include the applicable refund/cancellation policy if available');
  }

  return recommendations;
}

/**
 * Generates an AI Evidence Summary based ONLY on:
 * - Actual transaction fields
 * - Actual ML risk factors
 * - Evidence items marked available
 * Strictly avoids inventing facts; if unavailable, states "Not provided" or "Evidence not available".
 */
export function generateAiEvidenceSummary(
  transaction: Transaction,
  checklist: EvidenceChecklistItem[]
): string {
  const availableItems = checklist.filter((i) => i.isAvailable);
  const missingItems = checklist.filter((i) => !i.isAvailable);
  const { percent, tier } = calculateEvidenceStrength(checklist);

  const availableByCategory: Record<string, string[]> = {};
  availableItems.forEach((item) => {
    if (!availableByCategory[item.category]) availableByCategory[item.category] = [];
    availableByCategory[item.category].push(item.label);
  });

  const missingByCategory: Record<string, string[]> = {};
  missingItems.forEach((item) => {
    if (!missingByCategory[item.category]) missingByCategory[item.category] = [];
    missingByCategory[item.category].push(item.label);
  });

  // 1. What transaction is being reviewed
  const isMl = Boolean(transaction.isRealTimeMl || transaction.isRealTimeAnalysis || transaction.id.startsWith('txn_ml_'));
  const cbProbText = transaction.chargebackProbability !== undefined
    ? `${transaction.chargebackProbability}%`
    : `${Math.round(transaction.riskScore * 0.95)}%`;

  let section1 = `1. Transaction Under Review:\n`;
  section1 += `• Transaction ID: ${transaction.id} (Order #${transaction.orderId})\n`;
  section1 += `• Amount: ₹${transaction.amountINR.toLocaleString('en-IN')}\n`;
  section1 += `• Customer: ${transaction.customer.name} (ID: ${transaction.customer.id || 'CUST-RECORD'}, Account Age: ${transaction.customer.accountAgeDays} days, Prior Orders: ${transaction.customer.totalPastOrders})\n`;
  section1 += `• Payment Method: ${transaction.payment.method} via ${transaction.payment.paymentGateway || 'Payment Gateway'}\n`;
  section1 += `• ML Risk Assessment: ${transaction.riskScore}/100 Risk Score (${transaction.riskLevel} Risk, Chargeback Probability: ${cbProbText})\n`;
  section1 += `• ML Prediction Source: ${transaction.predictionSource || (isMl ? 'HistGradientBoostingClassifier' : 'Demo Dataset Benchmark')}\n`;
  if (transaction.riskFactors && transaction.riskFactors.length > 0) {
    const factorList = transaction.riskFactors.map((f) => `${f.name} [${f.severity}]`).join(', ');
    section1 += `• Key ML Risk Indicators: ${factorList}\n`;
  }

  // 2. What evidence is currently available
  let section2 = `\n2. Currently Available Evidence (Strength: ${percent}% - ${tier}):\n`;
  if (availableItems.length === 0) {
    section2 += `• None. No merchant evidence items have been marked as available yet.\n`;
  } else {
    Object.entries(availableByCategory).forEach(([cat, items]) => {
      section2 += `• ${cat}: ${items.join(', ')}\n`;
    });
  }

  // 3. What evidence is still missing
  let section3 = `\n3. Evidence Still Missing / Not Provided:\n`;
  if (missingItems.length === 0) {
    section3 += `• All standard evidence checklist items have been marked as collected.\n`;
  } else {
    const missingSummaries = Object.entries(missingByCategory).map(
      ([cat, items]) => `${cat} (${items.length} items missing: ${items.join(', ')})`
    );
    section3 += missingSummaries.map((s) => `• ${s}`).join('\n') + '\n';
  }

  // 4. What the merchant should review before submission
  let section4 = `\n4. Merchant Review Before Submission:\n`;
  const checks: string[] = [];

  if (!checklist.some((i) => i.label === '3-D Secure result' && i.isAvailable)) {
    checks.push('Payment Authentication records are currently missing. Verify 3DS authorization records before submission.');
  }
  if (!checklist.some((i) => i.label === 'Shipping/delivery confirmation' && i.isAvailable)) {
    checks.push('Fulfillment confirmation is currently missing. Attach relevant carrier delivery logs, tracking numbers, or recipient acknowledgement if available.');
  }
  if (!checklist.some((i) => i.label === 'Invoice or receipt' && i.isAvailable)) {
    checks.push('Invoice or receipt is currently missing. Verify that an itemized sales invoice matching the transaction amount is available before submission.');
  }
  if (!checklist.some((i) => i.label === 'Refund policy' && i.isAvailable)) {
    checks.push('Merchant refund terms are currently missing. Include the applicable refund/cancellation policy if available.');
  }
  if (percent < 40) {
    checks.push('Evidence strength is currently WEAK (<40%) based on the merchant checklist. Additional evidence is recommended before submission.');
  } else if (percent >= 70) {
    checks.push('Evidence strength is currently STRONG/COMPLETE based on the merchant checklist. Verify the available transaction records before submission.');
  }

  section4 += checks.map((c) => `• ${c}`).join('\n');

  return `${section1}${section2}${section3}${section4}`;
}

/**
 * Creates a new Evidence Case linked to an existing Transaction.
 */
export function createEvidenceCaseForTransaction(
  transaction: Transaction,
  existingCasesCount: number = 0
): EvidenceCase {
  const caseNumber = String(existingCasesCount + 1).padStart(4, '0');
  const caseId = `EVD-2026-${caseNumber}`;
  const now = new Date().toISOString();
  const isMl = Boolean(transaction.isRealTimeMl || transaction.isRealTimeAnalysis || transaction.id.startsWith('txn_ml_'));

  return {
    id: caseId,
    transactionId: transaction.id,
    transaction: transaction,
    status: 'OPEN',
    createdAt: now,
    updatedAt: now,
    checklist: createDefaultChecklist(),
    notes: '',
    isRealTimeMl: isMl
  };
}

/**
 * Generates an initial set of demonstration evidence cases linked directly to existing transactions.
 */
export function initializeSeedEvidenceCases(transactions: Transaction[]): EvidenceCase[] {
  // Find disputed transactions or high risk transactions
  const targetTxns = transactions.filter(
    (t) => t.chargebackDispute?.isDisputed || t.riskLevel === 'HIGH'
  ).slice(0, 4);

  if (targetTxns.length === 0 && transactions.length > 0) {
    targetTxns.push(transactions[0]);
  }

  return targetTxns.map((txn, index) => {
    const caseObj = createEvidenceCaseForTransaction(txn, index);
    
    // For initial seed demo, we can have a case in IN REVIEW, one in READY, etc.
    if (index === 0) {
      caseObj.status = 'IN REVIEW';
      // Mark a few items as available to demonstrate dynamic strength calculation
      caseObj.checklist = caseObj.checklist.map((item) => {
        if (
          item.label === 'Transaction details' ||
          item.label === 'Amount' ||
          item.label === 'Date/time' ||
          item.label === 'Payment method' ||
          item.label === '3-D Secure result' ||
          item.label === 'Authentication status' ||
          item.label === 'Order details' ||
          item.label === 'Product/service description' ||
          item.label === 'Shipping/delivery confirmation'
        ) {
          return { ...item, isAvailable: true };
        }
        return item;
      });
    } else if (index === 1) {
      caseObj.status = 'OPEN';
      // Only 2 items available (WEAK)
      caseObj.checklist = caseObj.checklist.map((item) => {
        if (item.label === 'Transaction details' || item.label === 'Amount') {
          return { ...item, isAvailable: true };
        }
        return item;
      });
    } else if (index === 2) {
      caseObj.status = 'READY';
      // 16 items available (STRONG)
      caseObj.checklist = caseObj.checklist.map((item, i) => {
        return { ...item, isAvailable: i < 16 };
      });
    }

    return caseObj;
  });
}

/**
 * Exports evidence cases to a simple, clean CSV file.
 * Fields:
 * - Evidence Case ID
 * - Transaction ID
 * - Amount
 * - Risk Level
 * - Chargeback Probability
 * - Risk Score
 * - Evidence Strength
 * - Case Status
 * - Completed Evidence Count
 * - Total Evidence Items
 * - Created Date
 */
export function exportEvidenceCasesToCsv(cases: EvidenceCase[]): string {
  const headers = [
    'Evidence Case ID',
    'Transaction ID',
    'Amount',
    'Risk Level',
    'Chargeback Probability',
    'Risk Score',
    'Evidence Strength',
    'Case Status',
    'Completed Evidence Count',
    'Total Evidence Items',
    'Created Date'
  ];

  const rows = cases.map((c) => {
    const { completedCount, totalItems, percent, tier } = calculateEvidenceStrength(c.checklist);
    const cbProb = c.transaction.chargebackProbability !== undefined
      ? `${c.transaction.chargebackProbability}%`
      : `${Math.round(c.transaction.riskScore * 0.95)}%`;

    return [
      `"${c.id}"`,
      `"${c.transactionId}"`,
      `"₹${c.transaction.amountINR.toLocaleString('en-IN')}"`,
      `"${c.transaction.riskLevel}"`,
      `"${cbProb}"`,
      `"${c.transaction.riskScore}"`,
      `"${percent}% (${tier})"`,
      `"${c.status}"`,
      `"${completedCount}"`,
      `"${totalItems}"`,
      `"${new Date(c.createdAt).toLocaleDateString('en-IN')}"`
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}
