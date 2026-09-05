export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type TransactionStatus = 
  | 'APPROVED' 
  | 'MONITORED' 
  | 'UNDER_VERIFICATION' 
  | 'BLOCKED' 
  | 'CHARGEBACK_DISPUTED';

export type PaymentMethodType = 
  | 'UPI' 
  | 'CREDIT_CARD' 
  | 'DEBIT_CARD' 
  | 'NETBANKING' 
  | 'EMI';

export type Auth3DSStatus = 
  | 'AUTHENTICATED' 
  | 'CHALLENGED_FAILED' 
  | 'CHALLENGE_FAILED'
  | 'ATTEMPTED_ONLY' 
  | 'NOT_ENROLLED'
  | 'FRICTIONLESS_SUCCESS';

export type DeliveryStatus = 
  | 'DELIVERED' 
  | 'IN_TRANSIT' 
  | 'OUT_FOR_DELIVERY' 
  | 'PENDING_FULFILLMENT' 
  | 'DELIVERY_FAILED';

export type RecommendedAction = 
  | 'APPROVE' 
  | 'MONITOR' 
  | 'MANUAL_VERIFICATION' 
  | 'REJECT';

export interface RiskFactor {
  id: string;
  name: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  scoreImpact: number;
  explanation: string;
  description?: string;
  category: 'VELOCITY' | 'IDENTITY' | 'PAYMENT' | 'AMOUNT' | 'FULFILLMENT' | 'BEHAVIOR';
}

export interface CustomerProfile {
  id?: string;
  name: string;
  email: string;
  phone: string;
  customerAgeYears?: number;
  accountAgeDays: number;
  totalPastOrders: number;
  totalPastSpentINR: number;
  pastChargebackCount: number;
  pastDisputeRate: number; // percentage
  ipAddress: string;
  locationCity: string;
  locationState: string;
  locationCountry: string;
  deviceFingerprint: string;
  deviceType: 'Mobile (Android)' | 'Mobile (iOS)' | 'Desktop (Mac)' | 'Desktop (Windows)' | 'Unknown/Emulated';
  isVpnProxy: boolean;
}

export interface PaymentDetails {
  method: PaymentMethodType;
  cardNetwork?: 'Visa' | 'Mastercard' | 'RuPay' | 'Amex' | 'Diners';
  cardLast4?: string;
  cardIssuerBank?: string;
  bankName?: string;
  upiVpa?: string;
  authStatus3DS: Auth3DSStatus;
  gatewayRefId: string;
  arnRrn: string;
  paymentGateway: 'Razorpay' | 'PayU' | 'Cashfree' | 'Stripe India';
}


export interface Address {
  line1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  id: string;
  title: string;
  category: 'Consumer Electronics' | 'Apparel & Fashion' | 'Digital Goods/Voucher' | 'Jewelry & Gold' | 'Groceries & Essentials' | 'Travel & Flights' | 'Software SaaS';
  quantity: number;
  unitPriceINR: number;
  isHighResaleRisk: boolean;
}

export interface ProofOfDelivery {
  carrier: 'BlueDart' | 'Delhivery' | 'DTDC' | 'Shadowfax' | 'Digital Download OTP';
  trackingNumber: string;
  signedBy?: string;
  deliveryGeoLat?: number;
  deliveryGeoLng?: number;
  deliveredAt?: string;
  otpVerified: boolean;
  deliveryAddressMatch: boolean;
}

export interface VelocityMetrics {
  txnsLast1Hour: number;
  txnsLast24Hours: number;
  failedAttemptsLast24h: number;
  deviceSwitchesLast7Days: number;
  deviceChangedRecently?: boolean;
  uniqueCardsUsed24h?: number;
}

export interface ChargebackDisputeInfo {
  isDisputed: boolean;
  disputeId?: string;
  disputeReasonCode?: string; // e.g. "10.4" (Visa Fraud) or "4837" (Mastercard)
  disputeReasonName?: string;
  disputeFiledAt?: string;
  claimAmountINR?: number;
  gatewayDeadline?: string;
  status: 'OPEN' | 'REBUTTAL_SUBMITTED' | 'WON' | 'LOST' | 'EXPIRED';
  merchantRebuttalNotes?: string;
}

export interface Transaction {
  id: string;
  orderId: string;
  amountINR: number;
  currency: 'INR';
  timestamp: string;
  customer: CustomerProfile;
  payment: PaymentDetails;
  billingAddress: Address;
  shippingAddress: Address;
  billingShippingMatch: boolean;
  items: OrderItem[];
  deliveryStatus: DeliveryStatus;
  proofOfDelivery?: ProofOfDelivery;
  velocity: VelocityMetrics;
  chargebackDispute?: ChargebackDisputeInfo;
  
  // Real-Time & Evaluation Tags
  isRealTimeAnalysis?: boolean;
  isRealTimeMl?: boolean;
  predictionSource?: string;
  analysisStatus?: 'COMPLETED' | 'PENDING' | 'FAILED';
  customerAgeYears?: number;
  orderValue?: number;
  billingShippingMismatch?: boolean;
  threeDsFriction?: 0 | 1;
  aiRiskExplanation?: string;

  // Risk Engine Output
  status: TransactionStatus;
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  chargebackProbability?: number; // 0.0 to 100.0 %
  riskFactors: RiskFactor[];
  recommendedAction: RecommendedAction;
  actionReason: string;
  aiRiskAssessment?: string;
}

export interface EvidencePackage {
  generatedAt: string;
  transactionId: string;
  caseReferenceId: string;
  disputeReasonCode: string;
  disputeReasonName: string;
  claimAmountINR: number;
  
  // Evidence sections
  executiveSummary: string;
  cardholderVerification: {
    customerName: string;
    verifiedEmail: string;
    verifiedPhone: string;
    accountAge: string;
    totalSuccessfulTransactions: number;
    accountIpAddress: string;
    deviceFingerprintMatched: boolean;
  };
  paymentAuthentication: {
    gatewayRef: string;
    arnRrn: string;
    paymentMethod: string;
    cardDetails: string;
    threeDSecureResult: string;
    avsResult: string;
    authTimestamp: string;
  };
  orderDetails: {
    orderNumber: string;
    invoiceNumber: string;
    orderItems: Array<{ title: string; quantity: number; amount: string }>;
    totalAmountFormatted: string;
  };
  fulfillmentAndDelivery: {
    carrier: string;
    trackingId: string;
    shippingAddressFormatted: string;
    deliveryConfirmationDate: string;
    recipientSignature: string;
    otpVerificationStatus: string;
    geolocationVerified: boolean;
  };
  customerHistoryAndDevice: {
    firstOrderDate: string;
    lifetimeValueFormatted: string;
    priorDisputeCount: number;
    loginSessionIp: string;
  };
  riskAssessmentLog: {
    chargeGuardRiskScore: number;
    riskTier: string;
    preAuthChecksSummary: string;
  };
  merchantRebuttalStatement: string;
  evidenceChecklist: Array<{
    item: string;
    status: 'ATTACHED' | 'VERIFIED' | 'NOT_APPLICABLE';
    description: string;
  }>;
}

export type EvidenceCaseStatus = 'OPEN' | 'IN REVIEW' | 'READY' | 'SUBMITTED';

export type EvidenceStrengthTier = 'WEAK' | 'MODERATE' | 'STRONG' | 'COMPLETE';

export interface EvidenceChecklistItem {
  id: string;
  category: string;
  label: string;
  isAvailable: boolean;
}

export interface EvidenceCase {
  id: string; // e.g. "EVD-2026-001"
  transactionId: string;
  transaction: Transaction;
  status: EvidenceCaseStatus;
  createdAt: string;
  updatedAt: string;
  checklist: EvidenceChecklistItem[];
  notes?: string;
  isRealTimeMl?: boolean;
}

export interface ModelMetricsData {
  modelName: string;
  modelVersion: string;
  evaluationDatasetSize: number;
  datasetDateRange: string;
  isDemoModel: boolean;
  metrics: {
    precision: number;
    recall: number;
    f1Score: number;
    accuracy: number;
    falsePositiveRate: number;
    falsePositiveCostINR: number;
    totalChargebackLossPreventedINR: number;
    aucRoc: number;
  };
  confusionMatrix: {
    truePositives: number;
    falsePositives: number;
    trueNegatives: number;
    falseNegatives: number;
  };
  thresholdCurve: Array<{
    threshold: number;
    precision: number;
    recall: number;
    f1: number;
    fpr: number;
    lossPreventedLakhs: number;
    frictionCostLakhs: number;
  }>;
  featureImportance: Array<{
    feature: string;
    importance: number; // 0 to 1
    category: string;
    description: string;
  }>;
}
