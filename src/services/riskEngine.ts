/**
 * ChargeGuard AI - Modular Risk Scoring Engine (Defense-Only)
 * 
 * Engine Label: "Demo Risk Engine"
 * 
 * Architecture:
 * - Implements IRiskScoringEngine interface allowing hot-swapping between the Demo Risk Engine
 *   and future trained machine-learning models (e.g. XGBoost, Random Forest, or ONNX runtimes)
 *   without modifying the UI or consuming layers.
 * 
 * Multi-dimensional Merchant Signals Evaluated:
 * - Transaction Amount / Order Value
 * - Customer Account Age & Order History
 * - Historical Chargeback Records (Dispute Recidivism)
 * - Failed Payment Attempts (Card Testing / Brute-force Signatures)
 * - Address Verification (Billing vs Shipping Mismatch)
 * - Transaction Velocity (Orders in 24h & 1h)
 * - Device Switching / Recent Hardware Change
 * - Payment Channel Integrity (UPI, Credit/Debit Card, 3DS Authentication Status)
 * - Fulfillment & Delivery Trajectory
 */

import { RiskFactor, RiskLevel, RecommendedAction, Transaction, PaymentMethodType, DeliveryStatus, Auth3DSStatus } from '../types';

export const ML_DECISION_THRESHOLD = 0.20;
export const ML_DECISION_THRESHOLD_PERCENT = 20.0;

export interface RawRiskEvaluationInput {
  amountINR: number;
  customerId?: string;
  accountAgeDays: number;
  totalPastOrders: number;
  pastChargebackCount: number;
  failedAttemptsLast24h: number;
  billingShippingMatch: boolean;
  txnsLast24Hours: number;
  txnsLast1Hour?: number;
  deviceChangedRecently?: boolean;
  deviceSwitchesLast7Days?: number;
  paymentMethod: PaymentMethodType;
  deliveryStatus?: DeliveryStatus;
  orderValue?: number;
  isVpnProxy?: boolean;
  authStatus3DS?: Auth3DSStatus;
  hasHighResaleRiskItem?: boolean;
}

export interface RiskEvaluationResult {
  engineName: string;
  engineType: 'DEMO_HEURISTIC' | 'PRODUCTION_ML';
  engineVersion: string;
  isDemoEngine: boolean;
  decisionThreshold: number;
  riskScore: number; // 0 to 100
  riskLevel: RiskLevel;
  chargebackProbability: number; // 0.0% to 100.0%
  exceedsThreshold: boolean;
  riskFactors: RiskFactor[];
  aiExplanation: string;
  recommendedAction: RecommendedAction;
  actionReason: string;
  factorContributions: Record<string, number>;
  rawProbability?: number;
  predictedChargeback?: number;
  predictionSource?: string;
  modelType?: string;
}

/**
 * Common interface for risk evaluation engines.
 * Production ML models (e.g., Python XGBoost microservice or ONNX in-browser runtime)
 * implement this exact interface so the UI layer requires zero changes.
 */
export interface IRiskScoringEngine {
  engineName: string;
  engineType: 'DEMO_HEURISTIC' | 'PRODUCTION_ML';
  version: string;
  isDemoEngine: boolean;
  evaluate(input: RawRiskEvaluationInput): RiskEvaluationResult;
}

/**
 * Deterministically calibrates chargeback probability (%) from raw risk score and high-severity factor weights.
 */
export function calculateChargebackProbability(riskScore: number, factors: RiskFactor[]): number {
  // Base non-linear sigmoid calibration
  // P(CB) ranges from ~1.8% for clean transactions to ~96.5% for critical fraud vectors
  const baseProb = 100 / (1 + Math.exp(-0.075 * (riskScore - 48)));
  
  // Factor amplification adjustments (deterministic)
  let factorBoost = 0;
  const criticalCount = factors.filter(f => f.severity === 'CRITICAL').length;
  const highCount = factors.filter(f => f.severity === 'HIGH').length;
  
  factorBoost += criticalCount * 3.5;
  factorBoost += highCount * 1.5;
  
  const rawProb = baseProb + factorBoost;
  // Floor at 1.5% (standard baseline retail dispute rate) and cap at 98.8%
  const clamped = Math.max(1.5, Math.min(98.8, rawProb));
  return Number(clamped.toFixed(1));
}

/**
 * Generates an articulate, natural-language explanation of the risk score.
 */
export function generateAiRiskExplanation(
  score: number,
  level: RiskLevel,
  probability: number,
  factors: RiskFactor[],
  input: RawRiskEvaluationInput,
  recommendedAction: RecommendedAction
): string {
  if (level === 'LOW') {
    return 'This transaction is assessed as low risk with standard baseline indicators. Verified signals include established account history, consistent billing and shipping information, and normal transaction velocity. Safe for standard merchant fulfillment.';
  }

  // Helper to map factor to concise natural language phrase
  const getFactorSummaryPhrase = (factorId: string, factorName: string): string => {
    const id = factorId.toLowerCase();
    const name = factorName.toLowerCase();

    if (id.includes('new-account') || id.includes('young-account') || name.includes('account registration') || name.includes('new customer')) {
      return 'a recently created account';
    }
    if (id.includes('failed-attempts') || name.includes('failed payment')) {
      return 'repeated payment failures';
    }
    if (id.includes('address-mismatch') || name.includes('mismatch')) {
      return 'billing/shipping mismatch';
    }
    if (id.includes('velocity') || name.includes('velocity')) {
      return 'high transaction velocity';
    }
    if (id.includes('device') || name.includes('device')) {
      return 'a recent device change';
    }
    if (id.includes('3ds') || name.includes('3-d secure') || name.includes('authentication')) {
      return 'incomplete authentication';
    }
    if (id.includes('amount') || name.includes('amount') || name.includes('value')) {
      return 'an elevated transaction value';
    }
    if (id.includes('chargeback') || name.includes('chargeback')) {
      return 'prior chargeback history';
    }
    if (id.includes('vpn') || name.includes('vpn') || name.includes('proxy')) {
      return 'anonymized network routing';
    }
    if (id.includes('resale') || name.includes('resale')) {
      return 'high-resale merchandise';
    }
    if (id.includes('delivery') || name.includes('delivery')) {
      return 'courier delivery anomalies';
    }
    return name;
  };

  // Deduplicate and prioritize highest-contributing factors
  const sortedFactors = [...factors].sort((a, b) => b.scoreImpact - a.scoreImpact);
  const uniquePhrases: string[] = [];
  const seen = new Set<string>();

  for (const factor of sortedFactors) {
    const phrase = getFactorSummaryPhrase(factor.id, factor.name);
    if (!seen.has(phrase)) {
      seen.add(phrase);
      uniquePhrases.push(phrase);
    }
  }

  const formatList = (items: string[]): string => {
    if (items.length === 0) return '';
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} and ${items[1]}`;
    return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
  };

  const phraseList = formatList(uniquePhrases);

  if (level === 'HIGH') {
    if (uniquePhrases.length > 0) {
      return `This transaction contains several elevated-risk signals, including ${phraseList}. These signals increase uncertainty around the transaction and warrant additional merchant verification.`;
    }
    return 'This transaction contains elevated-risk signals that increase uncertainty around the transaction and warrant additional merchant verification.';
  }

  // MEDIUM
  if (uniquePhrases.length > 0) {
    return `This transaction received a moderate risk score based on the demo risk engine. Moderate risk indicators were detected, including ${phraseList}. These signals warrant active monitoring and carrier OTP confirmation upon delivery.`;
  }
  return 'This transaction received a moderate risk score with estimated chargeback risk based on the demo risk engine. Active monitoring is recommended.';
}

/**
 * Demo Risk Engine Implementation
 * Uses multi-signal weighted heuristics calibrated to synthetic ML feature weights.
 * Features:
 * - Deterministic output (identical inputs yield identical results)
 * - 0.20 ML Decision Threshold
 * - Transparent contribution scoring
 */
export class DemoRiskScoringEngine implements IRiskScoringEngine {
  public readonly engineName = 'Demo Risk Engine';
  public readonly engineType = 'DEMO_HEURISTIC' as const;
  public readonly version = 'v1.4-defense-demo';
  public readonly isDemoEngine = true;

  public evaluate(input: RawRiskEvaluationInput): RiskEvaluationResult {
    let baseScore = 4; // Baseline score for standard clean commerce
    const factors: RiskFactor[] = [];
    const contributions: Record<string, number> = {};

    const amount = Number(input.amountINR || input.orderValue || 0);
    const accountAge = Number(input.accountAgeDays || 0);
    const pastOrders = Number(input.totalPastOrders || 0);
    const pastChargebacks = Number(input.pastChargebackCount || 0);
    const failedAttempts = Number(input.failedAttemptsLast24h || 0);
    const txns24h = Number(input.txnsLast24Hours || 1);
    const txns1h = Number(input.txnsLast1Hour || (txns24h > 3 ? Math.ceil(txns24h / 2) : 1));
    const deviceSwitches = Number(input.deviceSwitchesLast7Days || (input.deviceChangedRecently ? 3 : 0));

    // 1. Transaction Amount / High-Ticket Order
    if (amount >= 80000) {
      const impact = 22;
      baseScore += impact;
      contributions['HIGH_TRANSACTION_AMOUNT'] = impact;
      factors.push({
        id: 'factor-high-amount',
        name: 'High Transaction Amount',
        severity: 'CRITICAL',
        scoreImpact: impact,
        explanation: 'Transaction value is significantly above the merchant\'s average order baseline, increasing financial exposure.',
        category: 'AMOUNT'
      });
    } else if (amount >= 35000) {
      const impact = 14;
      baseScore += impact;
      contributions['HIGH_TRANSACTION_AMOUNT'] = impact;
      factors.push({
        id: 'factor-elevated-amount',
        name: 'Elevated Transaction Value',
        severity: 'HIGH',
        scoreImpact: impact,
        explanation: 'Transaction value is moderately above the standard order baseline for new or unverified sessions.',
        category: 'AMOUNT'
      });
    } else if (amount >= 15000) {
      const impact = 6;
      baseScore += impact;
      contributions['HIGH_TRANSACTION_AMOUNT'] = impact;
    } else if (amount <= 5000 && pastOrders >= 3) {
      const discount = -4;
      baseScore += discount;
      contributions['LOW_TICKET_LOYALTY'] = discount;
    }

    // 2. Customer Account Age & Maturity
    if (accountAge < 2 && pastOrders === 0) {
      const impact = 20;
      baseScore += impact;
      contributions['NEW_CUSTOMER_ACCOUNT'] = impact;
      factors.push({
        id: 'factor-new-account',
        name: 'Recent Account Registration',
        severity: 'HIGH',
        scoreImpact: impact,
        explanation: 'Recently created customer accounts provide limited historical behavior for risk assessment.',
        category: 'IDENTITY'
      });
    } else if (accountAge < 14 && pastOrders <= 1) {
      const impact = 10;
      baseScore += impact;
      contributions['NEW_CUSTOMER_ACCOUNT'] = impact;
      factors.push({
        id: 'factor-young-account',
        name: 'Recent Account Registration',
        severity: 'MEDIUM',
        scoreImpact: impact,
        explanation: 'Recently created customer accounts provide limited historical behavior for risk assessment.',
        category: 'IDENTITY'
      });
    } else if (pastOrders >= 5 && accountAge > 60) {
      // Historical loyalty discount
      const discount = -12;
      baseScore += discount;
      contributions['LOYAL_CUSTOMER_DISCOUNT'] = discount;
    }

    // 3. Previous Chargeback History (Dispute Recidivism)
    if (pastChargebacks > 0) {
      const impact = 28;
      baseScore += impact;
      contributions['PREVIOUS_CHARGEBACKS'] = impact;
      factors.push({
        id: 'factor-prior-chargebacks',
        name: 'Previous Chargeback History',
        severity: 'CRITICAL',
        scoreImpact: impact,
        explanation: 'Prior chargeback activity associated with the customer profile is a historical risk indicator.',
        category: 'BEHAVIOR'
      });
    }

    // 4. Failed Payment Attempts
    if (failedAttempts >= 4) {
      const impact = 25;
      baseScore += impact;
      contributions['FAILED_PAYMENTS'] = impact;
      factors.push({
        id: 'factor-failed-attempts-critical',
        name: 'Multiple Failed Payment Attempts',
        severity: 'CRITICAL',
        scoreImpact: impact,
        explanation: 'Repeated failed attempts before a successful payment increase transaction risk and may warrant additional verification.',
        category: 'PAYMENT'
      });
    } else if (failedAttempts >= 2) {
      const impact = 12;
      baseScore += impact;
      contributions['FAILED_PAYMENTS'] = impact;
      factors.push({
        id: 'factor-failed-attempts-moderate',
        name: 'Multiple Failed Payment Attempts',
        severity: 'MEDIUM',
        scoreImpact: impact,
        explanation: 'Repeated failed attempts before a successful payment increase transaction risk and may warrant additional verification.',
        category: 'PAYMENT'
      });
    } else if (failedAttempts === 1) {
      const impact = 4;
      baseScore += impact;
      contributions['FAILED_PAYMENTS'] = impact;
    }

    // 5. Billing vs Shipping Address Mismatch
    if (input.billingShippingMatch === false) {
      const impact = 18;
      baseScore += impact;
      contributions['ADDRESS_MISMATCH'] = impact;
      factors.push({
        id: 'factor-address-mismatch',
        name: 'Billing/Shipping Mismatch',
        severity: 'HIGH',
        scoreImpact: impact,
        explanation: 'A mismatch between billing and shipping information is an additional risk signal.',
        category: 'FULFILLMENT'
      });
    }

    // 6. Transaction Velocity (24 Hours & 1 Hour)
    if (txns24h >= 6 || txns1h >= 3) {
      const impact = txns24h >= 8 || txns1h >= 4 ? 20 : 14;
      baseScore += impact;
      contributions['HIGH_VELOCITY'] = impact;
      factors.push({
        id: 'factor-high-velocity',
        name: 'High Transaction Velocity',
        severity: impact >= 20 ? 'CRITICAL' : 'HIGH',
        scoreImpact: impact,
        explanation: 'Multiple transactions within a short period indicate unusual transaction activity.',
        category: 'VELOCITY'
      });
    } else if (txns24h >= 3) {
      const impact = 8;
      baseScore += impact;
      contributions['HIGH_VELOCITY'] = impact;
      factors.push({
        id: 'factor-elevated-velocity',
        name: 'Elevated Transaction Velocity',
        severity: 'MEDIUM',
        scoreImpact: impact,
        explanation: 'Multiple transactions within a short period indicate unusual transaction activity.',
        category: 'VELOCITY'
      });
    }

    // 7. Recent Device Change
    if (input.deviceChangedRecently || deviceSwitches >= 3) {
      const impact = 15;
      baseScore += impact;
      contributions['RECENT_DEVICE_CHANGE'] = impact;
      factors.push({
        id: 'factor-device-change',
        name: 'Recent Device Change',
        severity: 'HIGH',
        scoreImpact: impact,
        explanation: 'A newly observed device differs from the customer\'s historical device pattern.',
        category: 'IDENTITY'
      });
    }

    // 8. Payment Method & 3DS Authentication Signals
    const auth3DS = input.authStatus3DS as string | undefined;
    if (auth3DS === 'CHALLENGED_FAILED' || auth3DS === 'CHALLENGE_FAILED') {
      const impact = 26;
      baseScore += impact;
      contributions['3DS_CHALLENGE_FAILED'] = impact;
      factors.push({
        id: 'factor-3ds-challenge-failed',
        name: '3-D Secure Challenge Failed',
        severity: 'CRITICAL',
        scoreImpact: impact,
        explanation: 'Cardholder challenge verification failed before re-attempt, indicating authentication friction.',
        category: 'PAYMENT'
      });
    } else if (auth3DS === 'ATTEMPTED_ONLY') {
      const impact = 22;
      baseScore += impact;
      contributions['3DS_ATTEMPTED_ONLY'] = impact;
      factors.push({
        id: 'factor-3ds-friction',
        name: '3-D Secure Incomplete Authentication',
        severity: 'HIGH',
        scoreImpact: impact,
        explanation: 'Authentication was attempted but not completed with verified liability shift credentials.',
        category: 'PAYMENT'
      });
    } else if (auth3DS === 'NOT_ENROLLED') {
      const impact = 14;
      baseScore += impact;
      contributions['3DS_NOT_ENROLLED'] = impact;
      factors.push({
        id: 'factor-3ds-not-enrolled',
        name: 'Card Not Enrolled in 3DS',
        severity: 'MEDIUM',
        scoreImpact: impact,
        explanation: 'The card account is not enrolled in card-scheme two-factor verification programs.',
        category: 'PAYMENT'
      });
    } else if (auth3DS === 'AUTHENTICATED' || auth3DS === 'FRICTIONLESS_SUCCESS') {
      const discount = -8;
      baseScore += discount;
      contributions['3DS_AUTHENTICATED'] = discount;
    }

    // 9. VPN / Proxy Anonymity
    if (input.isVpnProxy) {
      const impact = 14;
      baseScore += impact;
      contributions['VPN_PROXY'] = impact;
      factors.push({
        id: 'factor-vpn-proxy',
        name: 'VPN / Anonymous Proxy Detected',
        severity: 'MEDIUM',
        scoreImpact: impact,
        explanation: 'The transaction connection originated from an anonymized network or VPN, reducing geographic verification confidence.',
        category: 'IDENTITY'
      });
    }

    // 10. High Resale Risk Item
    if (input.hasHighResaleRiskItem && (accountAge < 15 || input.billingShippingMatch === false)) {
      const impact = 12;
      baseScore += impact;
      contributions['HIGH_RESALE_RISK'] = impact;
      factors.push({
        id: 'factor-high-resale',
        name: 'High Resale Liquid Asset',
        severity: 'MEDIUM',
        scoreImpact: impact,
        explanation: 'The order includes high-liquidity items that are frequently targeted for rapid resale.',
        category: 'FULFILLMENT'
      });
    }

    // 11. Delivery Status Anomaly
    if (input.deliveryStatus === 'DELIVERY_FAILED') {
      const impact = 16;
      baseScore += impact;
      contributions['DELIVERY_FAILED'] = impact;
      factors.push({
        id: 'factor-delivery-failed',
        name: 'Courier Delivery Failure Reported',
        severity: 'HIGH',
        scoreImpact: impact,
        explanation: 'Fulfillment tracking indicates delivery difficulties or return to origin, which may increase dispute likelihood.',
        category: 'FULFILLMENT'
      });
    }

    // Final Clamped Score (0 - 100)
    const finalScore = Math.max(0, Math.min(100, Math.round(baseScore)));

    // Calibrate Chargeback Probability
    const chargebackProbability = calculateChargebackProbability(finalScore, factors);

    // Decision Threshold & Risk Level Classification using 0.20 (20.0%) decision boundary
    const exceedsThreshold = chargebackProbability >= ML_DECISION_THRESHOLD_PERCENT;

    let riskLevel: RiskLevel = 'LOW';
    if (finalScore >= 70 || chargebackProbability >= 60.0) {
      riskLevel = 'HIGH';
    } else if (finalScore >= 36 || chargebackProbability >= ML_DECISION_THRESHOLD_PERCENT) {
      riskLevel = 'MEDIUM';
    } else {
      riskLevel = 'LOW';
    }

    // Recommended Merchant Action & Action Reason
    let recommendedAction: RecommendedAction = 'APPROVE';
    let actionReason = '';

    if (riskLevel === 'HIGH') {
      recommendedAction = 'MANUAL_VERIFICATION';
      actionReason = 'Manual verification is recommended because multiple elevated-risk signals were detected, placing chargeback risk significantly above the 0.20 demonstration threshold. Merchant review and customer verification are advised prior to fulfillment.';
    } else if (riskLevel === 'MEDIUM') {
      recommendedAction = 'MONITOR';
      actionReason = 'Active monitoring is recommended because the estimated chargeback probability meets or exceeds the 0.20 demonstration threshold. Proceed with fulfillment while tracking delivery status and verifying customer OTP confirmation.';
    } else {
      recommendedAction = 'APPROVE';
      actionReason = 'Standard approval is recommended. Estimated chargeback probability is below the 0.20 decision threshold, with account maturity, address consistency, and payment signals matching normal merchant baselines.';
    }

    // Generate Natural Language AI Risk Explanation
    const aiExplanation = generateAiRiskExplanation(
      finalScore,
      riskLevel,
      chargebackProbability,
      factors,
      input,
      recommendedAction
    );

    return {
      engineName: this.engineName,
      engineType: this.engineType,
      engineVersion: this.version,
      isDemoEngine: this.isDemoEngine,
      decisionThreshold: ML_DECISION_THRESHOLD,
      riskScore: finalScore,
      riskLevel,
      chargebackProbability,
      exceedsThreshold,
      riskFactors: factors,
      aiExplanation,
      recommendedAction,
      actionReason,
      factorContributions: contributions
    };
  }
}

// Global active engine instance (defaults to DemoRiskScoringEngine)
let activeRiskEngine: IRiskScoringEngine = new DemoRiskScoringEngine();

/**
 * Returns the currently active risk scoring engine.
 * Allows switching or inspecting the engine provider.
 */
export function getRiskEngine(): IRiskScoringEngine {
  return activeRiskEngine;
}

/**
 * Sets a custom or trained machine learning model engine provider.
 */
export function setRiskEngine(engine: IRiskScoringEngine): void {
  activeRiskEngine = engine;
}

/**
 * Evaluates raw inputs using the active risk scoring engine.
 */
export function calculateRiskScore(input: RawRiskEvaluationInput): RiskEvaluationResult {
  return activeRiskEngine.evaluate(input);
}

/**
 * Evaluates a complete Transaction object using the active risk scoring engine.
 */
export function calculateTransactionRisk(txn: Transaction): RiskEvaluationResult {
  const hasHighResale = txn.items ? txn.items.some(item => item.isHighResaleRisk) : false;
  return calculateRiskScore({
    amountINR: txn.amountINR,
    customerId: txn.customer?.id,
    accountAgeDays: txn.customer.accountAgeDays,
    totalPastOrders: txn.customer.totalPastOrders,
    pastChargebackCount: txn.customer.pastChargebackCount,
    failedAttemptsLast24h: txn.velocity.failedAttemptsLast24h,
    txnsLast1Hour: txn.velocity.txnsLast1Hour,
    txnsLast24Hours: txn.velocity.txnsLast24Hours,
    billingShippingMatch: txn.billingShippingMatch,
    deviceChangedRecently: txn.velocity.deviceChangedRecently,
    deviceSwitchesLast7Days: txn.velocity.deviceSwitchesLast7Days || 0,
    isVpnProxy: txn.customer.isVpnProxy,
    authStatus3DS: txn.payment.authStatus3DS,
    paymentMethod: txn.payment.method,
    hasHighResaleRiskItem: hasHighResale,
    deliveryStatus: txn.deliveryStatus,
    orderValue: txn.amountINR
  });
}

/**
 * Evaluates and returns a fully populated Transaction object with updated score, level, factors,
 * probability, and recommended action.
 */
export function evaluateTransaction(txn: Transaction): Transaction {
  const evalResult = calculateTransactionRisk(txn);

  return {
    ...txn,
    riskScore: evalResult.riskScore,
    riskLevel: evalResult.riskLevel,
    chargebackProbability: evalResult.chargebackProbability,
    riskFactors: evalResult.riskFactors,
    recommendedAction: evalResult.recommendedAction,
    actionReason: evalResult.actionReason,
    aiRiskAssessment: evalResult.aiExplanation
  };
}

/**
 * Helper to construct a complete, validated Transaction instance from the Real-Time Analysis form.
 */
export function createAnalyzedTransactionFromForm(params: {
  amountINR: number;
  customerId: string;
  customerName?: string;
  customerCity?: string;
  accountAgeDays: number;
  totalPastOrders: number;
  pastChargebackCount: number;
  failedAttemptsLast24h: number;
  billingShippingMatch: boolean;
  txnsLast24Hours: number;
  deviceChangedRecently: boolean;
  authStatus3DS?: Auth3DSStatus;
  paymentMethod: PaymentMethodType;
  orderValue?: number;
  deliveryStatus: DeliveryStatus;
  productTitle?: string;
  isVpnProxy?: boolean;
}): { transaction: Transaction; evaluation: RiskEvaluationResult } {
  const resolvedAuth3DS: Auth3DSStatus = params.authStatus3DS || (params.failedAttemptsLast24h >= 3 ? 'ATTEMPTED_ONLY' : 'AUTHENTICATED');

  const evalInput: RawRiskEvaluationInput = {
    amountINR: params.amountINR,
    customerId: params.customerId,
    accountAgeDays: params.accountAgeDays,
    totalPastOrders: params.totalPastOrders,
    pastChargebackCount: params.pastChargebackCount,
    failedAttemptsLast24h: params.failedAttemptsLast24h,
    billingShippingMatch: params.billingShippingMatch,
    txnsLast24Hours: params.txnsLast24Hours,
    txnsLast1Hour: params.txnsLast24Hours > 3 ? Math.ceil(params.txnsLast24Hours / 3) : 1,
    deviceChangedRecently: params.deviceChangedRecently,
    paymentMethod: params.paymentMethod,
    deliveryStatus: params.deliveryStatus,
    orderValue: params.orderValue || params.amountINR,
    isVpnProxy: params.isVpnProxy ?? false,
    authStatus3DS: resolvedAuth3DS,
    hasHighResaleRiskItem: params.amountINR >= 35000
  };

  const evaluation = calculateRiskScore(evalInput);
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const now = new Date().toISOString();
  const cleanCustId = params.customerId.trim().toUpperCase() || `CUST-${randomSuffix}`;

  const cityName = params.customerCity?.trim() || (params.billingShippingMatch ? 'Bengaluru' : 'New Delhi');
  const custName = params.customerName?.trim() || `Customer (${cleanCustId})`;

  const newTxn: Transaction = {
    id: `txn_rt_${Date.now().toString().slice(-6)}_${randomSuffix}`,
    orderId: `ORD-RT-${Date.now().toString().slice(-6)}`,
    amountINR: params.amountINR,
    currency: 'INR',
    timestamp: now,
    isRealTimeAnalysis: true,
    customer: {
      id: cleanCustId,
      name: custName,
      email: `${cleanCustId.toLowerCase()}@user.example.in`,
      phone: `+91 98${Math.floor(10000000 + Math.random() * 89999999)}`,
      accountAgeDays: params.accountAgeDays,
      totalPastOrders: params.totalPastOrders,
      totalPastSpentINR: params.totalPastOrders * Math.round(params.amountINR * 0.8),
      pastChargebackCount: params.pastChargebackCount,
      pastDisputeRate: params.totalPastOrders > 0 
        ? Number(((params.pastChargebackCount / params.totalPastOrders) * 100).toFixed(1)) 
        : (params.pastChargebackCount > 0 ? 100 : 0),
      ipAddress: params.isVpnProxy ? '104.28.194.22 (VPN)' : '103.212.144.18',
      locationCity: cityName,
      locationState: cityName === 'Bengaluru' ? 'Karnataka' : 'Maharashtra',
      locationCountry: 'India',
      deviceFingerprint: `fp_rt_${Math.random().toString(36).substring(2, 10)}`,
      deviceType: 'Mobile (Android)',
      isVpnProxy: params.isVpnProxy ?? false
    },
    payment: {
      method: params.paymentMethod,
      cardNetwork: params.paymentMethod === 'UPI' ? undefined : 'Visa',
      cardLast4: params.paymentMethod === 'UPI' ? undefined : `${Math.floor(1000 + Math.random() * 9000)}`,
      cardIssuerBank: params.paymentMethod === 'UPI' ? undefined : 'HDFC Bank',
      upiVpa: params.paymentMethod === 'UPI' ? `${custName.toLowerCase().replace(/[^a-z0-9]/g, '')}@okhdfcbank` : undefined,
      authStatus3DS: resolvedAuth3DS,
      gatewayRefId: `pay_rt_${Date.now().toString().slice(-8)}`,
      arnRrn: `7249${Math.floor(10000000 + Math.random() * 90000000)}`,
      paymentGateway: 'Razorpay'
    },
    billingAddress: {
      line1: `Plot 42, Sector 18`,
      city: cityName,
      state: cityName === 'Bengaluru' ? 'Karnataka' : 'Maharashtra',
      postalCode: cityName === 'Bengaluru' ? '560001' : '110001',
      country: 'India'
    },
    shippingAddress: {
      line1: params.billingShippingMatch ? `Plot 42, Sector 18` : `Apt 904, Tower B, High Street`,
      city: params.billingShippingMatch ? cityName : 'Mumbai',
      state: params.billingShippingMatch ? (cityName === 'Bengaluru' ? 'Karnataka' : 'Maharashtra') : 'Maharashtra',
      postalCode: params.billingShippingMatch ? (cityName === 'Bengaluru' ? '560001' : '110001') : '400001',
      country: 'India'
    },
    billingShippingMatch: params.billingShippingMatch,
    items: [
      {
        id: `item_rt_${randomSuffix}`,
        title: params.productTitle?.trim() || (params.amountINR >= 40000 ? 'Flagship Smartphone (128GB)' : 'Consumer Merchandise'),
        category: params.amountINR >= 40000 ? 'Consumer Electronics' : 'Apparel & Fashion',
        quantity: 1,
        unitPriceINR: params.amountINR,
        isHighResaleRisk: params.amountINR >= 35000
      }
    ],
    deliveryStatus: params.deliveryStatus,
    proofOfDelivery: {
      carrier: 'Delhivery',
      trackingNumber: `DEL-RT-${randomSuffix}IN`,
      otpVerified: params.deliveryStatus === 'DELIVERED',
      deliveryAddressMatch: params.billingShippingMatch
    },
    velocity: {
      txnsLast1Hour: evalInput.txnsLast1Hour || 1,
      txnsLast24Hours: params.txnsLast24Hours,
      failedAttemptsLast24h: params.failedAttemptsLast24h,
      deviceSwitchesLast7Days: params.deviceChangedRecently ? 3 : 0,
      deviceChangedRecently: params.deviceChangedRecently
    },
    chargebackDispute: params.pastChargebackCount > 0 ? {
      isDisputed: false,
      disputeReasonCode: '10.4',
      disputeReasonName: 'Other Fraud - Card-Absent Environment',
      status: 'OPEN'
    } : undefined,
    status: evaluation.recommendedAction === 'APPROVE' 
      ? 'APPROVED' 
      : evaluation.recommendedAction === 'MONITOR' 
      ? 'MONITORED' 
      : 'UNDER_VERIFICATION',
    riskScore: evaluation.riskScore,
    riskLevel: evaluation.riskLevel,
    chargebackProbability: evaluation.chargebackProbability,
    riskFactors: evaluation.riskFactors,
    recommendedAction: evaluation.recommendedAction,
    actionReason: evaluation.actionReason,
    aiRiskAssessment: evaluation.aiExplanation
  };

  return { transaction: newTxn, evaluation };
}
