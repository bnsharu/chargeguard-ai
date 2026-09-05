/**
 * ChargeGuard AI - Live ML Inference API Client
 * 
 * Target Endpoint: POST https://clinic-dictate-dolphin.ngrok-free.dev/predict
 * Health Endpoint: GET https://clinic-dictate-dolphin.ngrok-free.dev/health
 * 
 * Source of truth for live machine learning transaction risk prediction.
 */

import { RiskFactor, RiskLevel, RecommendedAction, Transaction, PaymentMethodType, DeliveryStatus, Auth3DSStatus } from '../types';
import { RiskEvaluationResult } from './riskEngine';

export const ML_API_BASE_URL: string = (
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.ML_API_BASE_URL) ||
  (typeof process !== 'undefined' && process.env?.ML_API_BASE_URL) ||
  'https://clinic-dictate-dolphin.ngrok-free.dev'
).trim().replace(/\/+$/, '');

export const ML_DIRECT_API_URL = ML_API_BASE_URL;

export interface MlPredictionPayload {
  transaction_amount: number;
  account_age_days: number;
  previous_orders: number;
  previous_chargebacks: number;
  failed_payment_attempts: number;
  transactions_last_24h: number;
  device_changed: 0 | 1;
  billing_shipping_mismatch: 0 | 1;
  three_ds_friction: 0 | 1;
  customer_age_years: number;
  order_value: number;
}

export interface MlApiRiskFactor {
  factor?: string;
  name?: string;
  description?: string;
  explanation?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  score_impact?: number;
}

export interface MlPredictionResponse {
  success?: boolean;
  prediction_source?: string;
  model_type?: string;
  threshold?: number;
  risk_score: number;
  chargeback_probability: number;
  chargeback_probability_percent?: number;
  predicted_chargeback?: number;
  risk_level: RiskLevel;
  recommended_action: RecommendedAction;
  risk_factors?: MlApiRiskFactor[];
  important_risk_factors?: MlApiRiskFactor[];
  risk_factor_count?: number;
  ai_risk_explanation?: string;
  notes?: string;
}

export interface MlHealthResponse {
  status: string;
  message?: string;
  model?: string;
  threshold?: number;
  feature_count?: number;
}

/**
 * Check health status of the Live ML API.
 * Calls ${ML_API_BASE_URL}/health directly and via proxy.
 */
export async function checkMlApiHealth(): Promise<{ isOnline: boolean; data?: MlHealthResponse; error?: string; url: string }> {
  // 1. Direct browser fetch to ${ML_API_BASE_URL}/health
  try {
    const directRes = await fetch(`${ML_API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'ngrok-skip-browser-warning': 'true',
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(3500)
    });
    if (directRes.ok) {
      const directText = await directRes.text();
      try {
        const data: MlHealthResponse = JSON.parse(directText);
        return { isOnline: true, data, url: ML_API_BASE_URL };
      } catch {
        // Non-JSON returned (e.g. ngrok offline or warning HTML)
      }
    }
  } catch {
    // Direct fetch might be blocked by browser iframe CORS or network
  }

  // 2. Server proxy check (${ML_API_BASE_URL}/health via Express backend)
  try {
    const proxyRes = await fetch('/api/ml/health', {
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache' },
      signal: AbortSignal.timeout(4000)
    });
    if (proxyRes.ok) {
      const json = await proxyRes.json();
      if (json.isOnline && json.data) {
        return {
          isOnline: true,
          data: json.data,
          url: json.url || ML_API_BASE_URL
        };
      }
    }
  } catch {
    // Proxy failed
  }

  return {
    isOnline: false,
    error: 'Live ML API unavailable. Start the ChargeGuard FastAPI server and try again.',
    url: ML_API_BASE_URL
  };
}

/**
 * Predict risk using the live ML model inference API.
 * Calls ${ML_API_BASE_URL}/predict directly or via proxy.
 * Strict Requirement: NEVER use demonstrator/fallback prediction when live API is unavailable.
 */
export async function predictTransactionWithMlApi(payload: MlPredictionPayload): Promise<MlPredictionResponse> {
  // Ensure order_value = transaction_amount
  const sanitizedPayload: MlPredictionPayload = {
    ...payload,
    order_value: payload.order_value ?? payload.transaction_amount
  };

  // 1. Direct browser fetch to ${ML_API_BASE_URL}/predict
  try {
    const directRes = await fetch(`${ML_API_BASE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'User-Agent': 'ChargeGuard-AI-Client/1.0',
        'Accept': 'application/json'
      },
      body: JSON.stringify(sanitizedPayload),
      signal: AbortSignal.timeout(6000)
    });

    if (directRes.ok) {
      const directText = await directRes.text();
      try {
        const data: MlPredictionResponse = JSON.parse(directText);
        if (typeof data.risk_score === 'number') {
          return data;
        }
      } catch {
        // Non-JSON HTML response (e.g. ngrok offline error page)
      }
    }
  } catch {
    // Direct fetch might fail due to iframe CORS
  }

  // 2. Server proxy fetch to ${ML_API_BASE_URL}/predict
  try {
    const proxyRes = await fetch('/api/ml/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sanitizedPayload),
      signal: AbortSignal.timeout(6000)
    });

    if (proxyRes.ok) {
      const data: MlPredictionResponse = await proxyRes.json();
      if (typeof data.risk_score === 'number') {
        return data;
      }
    }
  } catch {
    // Proxy request failed
  }

  // 3. Strict Requirement: NEVER use fallback prediction when live API is unavailable
  throw new Error('Live ML API unavailable. Start the ChargeGuard FastAPI server and try again.');
}

/**
 * Updates the ML API base URL on the backend proxy.
 */
export async function updateMlApiConfig(newUrl: string): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const res = await fetch('/api/ml/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: newUrl })
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, url: data.url };
    }
    return { success: false, error: 'Failed to update ML API configuration' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Fetches the current ML API configuration.
 */
export async function getMlApiConfig(): Promise<{ url: string; isDefault: boolean }> {
  try {
    const res = await fetch('/api/ml/config');
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // ignore
  }
  return { url: ML_API_BASE_URL, isDefault: true };
}

/**
 * Maps the live ML API response into the application's RiskEvaluationResult and Transaction model.
 */
export function mapMlResponseToEvaluation(
  mlResponse: MlPredictionResponse,
  input: {
    amountINR: number;
    accountAgeDays: number;
    totalPastOrders: number;
    pastChargebackCount: number;
    failedAttemptsLast24h: number;
    billingShippingMatch: boolean;
    txnsLast24Hours: number;
    deviceChangedRecently: boolean;
    authStatus3DS?: Auth3DSStatus;
    paymentMethod: PaymentMethodType;
    deliveryStatus: DeliveryStatus;
    orderValue: number;
    customerAgeYears?: number;
    isVpnProxy?: boolean;
    productTitle?: string;
  }
): RiskEvaluationResult {
  const threshold = mlResponse.threshold ?? 0.20;
  
  // Format chargeback probability as percent (0.0 - 100.0)
  let cbProbPercent = 0;
  let rawProb = 0;
  if (typeof mlResponse.chargeback_probability_percent === 'number') {
    cbProbPercent = Number(mlResponse.chargeback_probability_percent.toFixed(1));
    rawProb = typeof mlResponse.chargeback_probability === 'number' ? mlResponse.chargeback_probability : cbProbPercent / 100;
  } else if (typeof mlResponse.chargeback_probability === 'number') {
    rawProb = mlResponse.chargeback_probability <= 1.0 
      ? mlResponse.chargeback_probability 
      : mlResponse.chargeback_probability / 100;
    cbProbPercent = Number((rawProb * 100).toFixed(1));
  }

  const rawFactors = mlResponse.risk_factors || mlResponse.important_risk_factors || [];
  
  const mappedRiskFactors: RiskFactor[] = rawFactors.map((rf: any, idx: number) => {
    if (typeof rf === 'string') {
      return {
        id: `ml-factor-${idx}`,
        name: rf,
        severity: 'HIGH',
        scoreImpact: 15,
        explanation: rf,
        category: 'BEHAVIOR'
      };
    }

    const factorName = rf.factor || rf.name || rf.feature || `Risk Signal #${idx + 1}`;
    const desc = rf.description || rf.explanation || rf.reason || factorName;
    const severity = (rf.severity?.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') || 'HIGH';
    
    // Estimate score impact for visualization
    const impact = rf.score_impact ?? (
      severity === 'CRITICAL' ? 25 :
      severity === 'HIGH' ? 15 :
      severity === 'MEDIUM' ? 8 : 4
    );

    let category: RiskFactor['category'] = 'VELOCITY';
    const lower = factorName.toLowerCase();
    if (lower.includes('amount') || lower.includes('value')) category = 'AMOUNT';
    else if (lower.includes('account') || lower.includes('order') || lower.includes('registration') || lower.includes('age') || lower.includes('history')) category = 'IDENTITY';
    else if (lower.includes('device') || lower.includes('hardware') || lower.includes('vpn') || lower.includes('mismatch') || lower.includes('address')) category = 'BEHAVIOR';
    else if (lower.includes('3-d') || lower.includes('3ds') || lower.includes('friction') || lower.includes('payment') || lower.includes('attempt')) category = 'PAYMENT';
    else if (lower.includes('delivery') || lower.includes('courier')) category = 'FULFILLMENT';

    return {
      id: `ml-factor-${idx}-${factorName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: factorName,
      severity,
      scoreImpact: impact,
      explanation: desc,
      category
    };
  });

  const exceedsThreshold = (cbProbPercent / 100) >= threshold;
  const predictedChargeback = mlResponse.predicted_chargeback !== undefined
    ? Number(mlResponse.predicted_chargeback)
    : (exceedsThreshold ? 1 : 0);

  // Formulate action reason from ML notes / explanations
  let actionReason = mlResponse.notes || '';
  if (mlResponse.recommended_action === 'APPROVE') {
    actionReason = actionReason || 'The ML model assessed low dispute probability below the 0.20 threshold. The transaction complies with safe merchant baselines and is recommended for automated fulfillment.';
  } else if (mlResponse.recommended_action === 'MONITOR') {
    actionReason = actionReason || 'The ML model detected moderate risk signals meeting or exceeding the 0.20 threshold. Active delivery tracking and recipient verification are recommended.';
  } else {
    actionReason = actionReason || 'The ML model detected multiple critical risk indicators significantly exceeding the decision threshold. Merchant manual verification and customer OTP authorization are advised prior to shipping.';
  }

  const factorContributions: Record<string, number> = {};
  mappedRiskFactors.forEach(f => {
    factorContributions[f.name] = f.scoreImpact;
  });

  const predictionSource = mlResponse.prediction_source || 'ChargeGuard Live ML Model (FastAPI /predict)';
  const modelType = mlResponse.model_type || 'HistGradientBoostingClassifier';

  return {
    engineName: predictionSource,
    engineType: 'PRODUCTION_ML',
    engineVersion: modelType,
    isDemoEngine: false,
    decisionThreshold: threshold,
    riskScore: Number(Number(mlResponse.risk_score).toFixed(1)),
    riskLevel: mlResponse.risk_level || (mlResponse.risk_score >= 70 ? 'HIGH' : mlResponse.risk_score >= 35 ? 'MEDIUM' : 'LOW'),
    chargebackProbability: cbProbPercent,
    rawProbability: rawProb,
    predictedChargeback,
    predictionSource,
    modelType,
    exceedsThreshold,
    riskFactors: mappedRiskFactors,
    aiExplanation: mlResponse.ai_risk_explanation || `This transaction received a risk score of ${mlResponse.risk_score}/100 with an estimated chargeback probability of ${cbProbPercent}%. Evaluated by ${modelType}.`,
    recommendedAction: mlResponse.recommended_action || 'MANUAL_VERIFICATION',
    actionReason,
    factorContributions
  };
}

/**
 * Creates a fully validated Transaction object utilizing the Live ML API inference result.
 */
export async function createAnalyzedTransactionFromMlApi(params: {
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
  customerAgeYears?: number;
  productTitle?: string;
  isVpnProxy?: boolean;
}): Promise<{ transaction: Transaction; evaluation: RiskEvaluationResult }> {
  // Determine 3DS friction indicator (1 if incomplete, challenge failed, or not enrolled; 0 if authenticated/frictionless)
  const resolvedAuth3DS: Auth3DSStatus = params.authStatus3DS || (params.failedAttemptsLast24h >= 3 ? 'ATTEMPTED_ONLY' : 'AUTHENTICATED');
  const threeDsFriction: 0 | 1 = (
    resolvedAuth3DS === 'ATTEMPTED_ONLY' || 
    resolvedAuth3DS === 'CHALLENGED_FAILED' || 
    resolvedAuth3DS === 'NOT_ENROLLED'
  ) ? 1 : 0;

  const amount = Number(params.amountINR);
  const payload: MlPredictionPayload = {
    transaction_amount: amount,
    account_age_days: Number(params.accountAgeDays),
    previous_orders: Number(params.totalPastOrders),
    previous_chargebacks: Number(params.pastChargebackCount),
    failed_payment_attempts: Number(params.failedAttemptsLast24h),
    transactions_last_24h: Number(params.txnsLast24Hours),
    device_changed: params.deviceChangedRecently ? 1 : 0,
    billing_shipping_mismatch: params.billingShippingMatch ? 0 : 1,
    three_ds_friction: threeDsFriction,
    customer_age_years: Number(params.customerAgeYears || 28),
    order_value: amount // Requirement 5: Continue using order_value = transaction_amount
  };

  // Call Live ML Model Endpoint
  const mlResponse = await predictTransactionWithMlApi(payload);

  // Map to unified application evaluation result
  const evaluation = mapMlResponseToEvaluation(mlResponse, {
    ...params,
    orderValue: amount,
    authStatus3DS: resolvedAuth3DS
  });

  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const now = new Date().toISOString();
  const cleanCustId = params.customerId.trim().toUpperCase() || `CUST-${randomSuffix}`;
  const cityName = params.customerCity?.trim() || (params.billingShippingMatch ? 'Bengaluru' : 'New Delhi');
  const custName = params.customerName?.trim() || `Customer (${cleanCustId})`;

  const newTxn: Transaction = {
    id: `txn_ml_${Date.now().toString().slice(-6)}_${randomSuffix}`,
    orderId: `ORD-ML-${Date.now().toString().slice(-6)}`,
    amountINR: amount,
    orderValue: amount,
    currency: 'INR',
    timestamp: now,
    isRealTimeAnalysis: true,
    isRealTimeMl: true,
    predictionSource: mlResponse.prediction_source || evaluation.predictionSource || 'ChargeGuard Live ML Model (FastAPI /predict)',
    analysisStatus: 'COMPLETED',
    customerAgeYears: Number(params.customerAgeYears || 28),
    billingShippingMismatch: !params.billingShippingMatch,
    threeDsFriction,
    aiRiskExplanation: mlResponse.ai_risk_explanation || evaluation.aiExplanation,
    customer: {
      id: cleanCustId,
      name: custName,
      customerAgeYears: Number(params.customerAgeYears || 28),
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
      deviceFingerprint: `fp_ml_${Math.random().toString(36).substring(2, 10)}`,
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
      gatewayRefId: `pay_ml_${Date.now().toString().slice(-8)}`,
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
        id: `item_ml_${randomSuffix}`,
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
      trackingNumber: `DEL-ML-${randomSuffix}IN`,
      otpVerified: params.deliveryStatus === 'DELIVERED',
      deliveryAddressMatch: params.billingShippingMatch
    },
    velocity: {
      txnsLast1Hour: params.txnsLast24Hours > 3 ? Math.ceil(params.txnsLast24Hours / 3) : 1,
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
