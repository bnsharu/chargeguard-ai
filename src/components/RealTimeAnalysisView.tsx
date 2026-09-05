import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  FileCheck2, 
  RefreshCw, 
  ArrowRight, 
  Cpu, 
  Sliders, 
  Building2, 
  CreditCard, 
  Smartphone, 
  MapPin, 
  User, 
  Package, 
  Clock, 
  Activity, 
  Check, 
  AlertCircle,
  HelpCircle,
  TrendingUp,
  RotateCcw,
  Layers,
  Lock,
  Wifi,
  WifiOff,
  Server
} from 'lucide-react';
import { 
  Transaction, 
  PaymentMethodType, 
  DeliveryStatus, 
  RiskLevel, 
  RecommendedAction,
  Auth3DSStatus
} from '../types';
import { 
  RiskEvaluationResult,
  ML_DECISION_THRESHOLD,
  ML_DECISION_THRESHOLD_PERCENT,
  createAnalyzedTransactionFromForm
} from '../services/riskEngine';
import { 
  checkMlApiHealth, 
  createAnalyzedTransactionFromMlApi, 
  MlHealthResponse,
  ML_DIRECT_API_URL,
  updateMlApiConfig,
  getMlApiConfig
} from '../services/mlApi';
import { useToast } from './Toast';
import { NavTab } from './Navbar';

interface RealTimeAnalysisViewProps {
  onAddTransaction: (txn: Transaction) => void;
  onOpenEvidenceForTransaction: (txn: Transaction) => void;
  setActiveTab: (tab: NavTab) => void;
}

export const RealTimeAnalysisView: React.FC<RealTimeAnalysisViewProps> = ({
  onAddTransaction,
  onOpenEvidenceForTransaction,
  setActiveTab
}) => {
  const { showToast } = useToast();

  // ML API Health State
  const [mlHealth, setMlHealth] = useState<{
    isOnline: boolean;
    checking: boolean;
    data?: MlHealthResponse;
    error?: string;
    url?: string;
  }>({
    isOnline: false,
    checking: true,
    url: ML_DIRECT_API_URL
  });

  // URL Config Modal / Drawer State
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [customApiUrl, setCustomApiUrl] = useState<string>(ML_DIRECT_API_URL);
  const [isSavingConfig, setIsSavingConfig] = useState<boolean>(false);
  const [configMessage, setConfigMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form State - Starts completely empty (no hardcoded/demo values)
  const [amountINR, setAmountINR] = useState<number | ''>('');
  const [customerId, setCustomerId] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerCity, setCustomerCity] = useState<string>('');
  const [customerAgeYears, setCustomerAgeYears] = useState<number | ''>('');
  const [accountAgeDays, setAccountAgeDays] = useState<number | ''>('');
  const [totalPastOrders, setTotalPastOrders] = useState<number | ''>('');
  const [pastChargebackCount, setPastChargebackCount] = useState<number | ''>('');
  const [failedAttemptsLast24h, setFailedAttemptsLast24h] = useState<number | ''>('');
  const [billingShippingMatch, setBillingShippingMatch] = useState<boolean | ''>('');
  const [txnsLast24Hours, setTxnsLast24Hours] = useState<number | ''>('');
  const [deviceChangedRecently, setDeviceChangedRecently] = useState<boolean | ''>('');
  const [authStatus3DS, setAuthStatus3DS] = useState<Auth3DSStatus | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType | ''>('');
  const [orderValue, setOrderValue] = useState<number | ''>('');
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus | ''>('');
  const [productTitle, setProductTitle] = useState<string>('');
  const [isVpnProxy, setIsVpnProxy] = useState<boolean | ''>('');

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<number>(0);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analyzedResult, setAnalyzedResult] = useState<{
    transaction: Transaction;
    evaluation: RiskEvaluationResult;
  } | null>(null);

  // Validation Errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Check ML API Health on Mount & poll periodically
  const refreshMlHealth = async () => {
    setMlHealth(prev => ({ ...prev, checking: true }));
    const health = await checkMlApiHealth();
    setMlHealth({
      isOnline: health.isOnline,
      checking: false,
      data: health.data,
      error: health.error,
      url: health.url || customApiUrl
    });
  };

  useEffect(() => {
    // Load configured URL from backend
    getMlApiConfig().then(cfg => {
      if (cfg?.url) {
        setCustomApiUrl(cfg.url);
      }
    });
    refreshMlHealth();
    const timer = setInterval(refreshMlHealth, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleSaveApiUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customApiUrl.trim()) return;
    setIsSavingConfig(true);
    setConfigMessage(null);
    const res = await updateMlApiConfig(customApiUrl.trim());
    setIsSavingConfig(false);
    if (res.success) {
      setConfigMessage({ text: 'Endpoint updated successfully. Testing health...', type: 'success' });
      await refreshMlHealth();
      setTimeout(() => {
        setShowConfigModal(false);
        setConfigMessage(null);
      }, 1200);
    } else {
      setConfigMessage({ text: res.error || 'Failed to update endpoint URL', type: 'error' });
    }
  };

  // Preset Configurations for required testing scenarios:
  // 1. Clearly Low-Risk Transaction
  // 2. Medium-Risk Transaction
  // 3. Clearly High-Risk Transaction
  const loadPreset = (presetName: 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK' | 'VOUCHER_BURST') => {
    setFormErrors({});
    setAnalysisError(null);
    if (presetName === 'LOW_RISK') {
      // Scenario 1: Clearly Low-Risk
      setAmountINR(3500);
      setOrderValue(3500);
      setCustomerId('CUST-10492');
      setCustomerName('Rohan Sharma');
      setCustomerCity('Pune');
      setCustomerAgeYears(32);
      setAccountAgeDays(180);
      setTotalPastOrders(12);
      setPastChargebackCount(0);
      setFailedAttemptsLast24h(0);
      setBillingShippingMatch(true);
      setTxnsLast24Hours(1);
      setDeviceChangedRecently(false);
      setAuthStatus3DS('AUTHENTICATED');
      setPaymentMethod('UPI');
      setDeliveryStatus('DELIVERED');
      setProductTitle('Organic Coffee & Pantry Essentials');
      setIsVpnProxy(false);
    } else if (presetName === 'MEDIUM_RISK') {
      // Scenario 2: Medium-Risk
      setAmountINR(22000);
      setOrderValue(22000);
      setCustomerId('CUST-44120');
      setCustomerName('Pooja Nair');
      setCustomerCity('Bengaluru');
      setCustomerAgeYears(29);
      setAccountAgeDays(25);
      setTotalPastOrders(2);
      setPastChargebackCount(0);
      setFailedAttemptsLast24h(1);
      setBillingShippingMatch(false);
      setTxnsLast24Hours(3);
      setDeviceChangedRecently(false);
      setAuthStatus3DS('AUTHENTICATED');
      setPaymentMethod('DEBIT_CARD');
      setDeliveryStatus('IN_TRANSIT');
      setProductTitle('Smart Watch & Noise-Cancelling Earbuds');
      setIsVpnProxy(false);
    } else if (presetName === 'HIGH_RISK') {
      // Scenario 3: Clearly High-Risk
      setAmountINR(85000);
      setOrderValue(85000);
      setCustomerId('CUST-99214');
      setCustomerName('Vikram Sen');
      setCustomerCity('New Delhi');
      setCustomerAgeYears(24);
      setAccountAgeDays(1);
      setTotalPastOrders(0);
      setPastChargebackCount(1);
      setFailedAttemptsLast24h(4);
      setBillingShippingMatch(false);
      setTxnsLast24Hours(7);
      setDeviceChangedRecently(true);
      setAuthStatus3DS('ATTEMPTED_ONLY');
      setPaymentMethod('CREDIT_CARD');
      setDeliveryStatus('PENDING_FULFILLMENT');
      setProductTitle('High-End Gaming Laptop (16GB RAM)');
      setIsVpnProxy(true);
    } else if (presetName === 'VOUCHER_BURST') {
      setAmountINR(65000);
      setOrderValue(65000);
      setCustomerId('CUST-77401');
      setCustomerName('Ananya Deshmukh');
      setCustomerCity('Hyderabad');
      setCustomerAgeYears(22);
      setAccountAgeDays(0);
      setTotalPastOrders(0);
      setPastChargebackCount(0);
      setFailedAttemptsLast24h(3);
      setBillingShippingMatch(false);
      setTxnsLast24Hours(8);
      setDeviceChangedRecently(true);
      setAuthStatus3DS('CHALLENGED_FAILED');
      setPaymentMethod('CREDIT_CARD');
      setDeliveryStatus('PENDING_FULFILLMENT');
      setProductTitle('Instant Brand Gift Vouchers (5x ₹13,000)');
      setIsVpnProxy(true);
    }
  };

  // Validate form inputs
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (amountINR === '' || Number(amountINR) <= 0) {
      errors.amountINR = 'Enter transaction amount';
    }
    if (!customerId.trim()) {
      errors.customerId = 'Enter customer ID';
    }
    if (customerAgeYears === '' || Number(customerAgeYears) < 18) {
      errors.customerAgeYears = 'Enter customer age (18 or older)';
    }
    if (accountAgeDays === '' || Number(accountAgeDays) < 0) {
      errors.accountAgeDays = 'Enter account age in days';
    }
    if (totalPastOrders === '' || Number(totalPastOrders) < 0) {
      errors.totalPastOrders = 'Enter previous orders';
    }
    if (pastChargebackCount === '' || Number(pastChargebackCount) < 0) {
      errors.pastChargebackCount = 'Enter previous chargebacks';
    }
    if (failedAttemptsLast24h === '' || Number(failedAttemptsLast24h) < 0) {
      errors.failedAttemptsLast24h = 'Enter failed attempts';
    }
    if (txnsLast24Hours === '' || Number(txnsLast24Hours) < 1) {
      errors.txnsLast24Hours = 'Enter transaction velocity (at least 1)';
    }
    if (!paymentMethod) {
      errors.paymentMethod = 'Select payment method';
    }
    if (!authStatus3DS) {
      errors.authStatus3DS = 'Select 3-D Secure status';
    }
    if (billingShippingMatch === '') {
      errors.billingShippingMatch = 'Select address match status';
    }
    if (deviceChangedRecently === '') {
      errors.deviceChangedRecently = 'Select device status';
    }
    if (!deliveryStatus) {
      errors.deliveryStatus = 'Select delivery status';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Perform Analysis with Real Live ML API Inference
  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isAnalyzing) return;

    if (!validateForm()) {
      showToast({
        title: 'Validation Error',
        description: 'Please correct the highlighted inputs before analyzing.',
        type: 'error'
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStep(1);
    setAnalysisError(null);

    const stepInterval = setInterval(() => {
      setAnalysisStep(prev => (prev < 3 ? prev + 1 : prev));
    }, 200);

    try {
      // Call Live ML Model API
      const result = await createAnalyzedTransactionFromMlApi({
        amountINR: Number(amountINR),
        customerId: customerId.trim(),
        customerName: customerName.trim() || 'Unspecified Customer',
        customerCity: customerCity.trim() || 'Mumbai',
        customerAgeYears: Number(customerAgeYears),
        accountAgeDays: Number(accountAgeDays),
        totalPastOrders: Number(totalPastOrders),
        pastChargebackCount: Number(pastChargebackCount),
        failedAttemptsLast24h: Number(failedAttemptsLast24h),
        billingShippingMatch: Boolean(billingShippingMatch),
        txnsLast24Hours: Number(txnsLast24Hours),
        deviceChangedRecently: Boolean(deviceChangedRecently),
        authStatus3DS: (authStatus3DS || undefined) as Auth3DSStatus | undefined,
        paymentMethod: (paymentMethod || 'CREDIT_CARD') as PaymentMethodType,
        orderValue: Number(amountINR),
        deliveryStatus: (deliveryStatus || 'PENDING_FULFILLMENT') as DeliveryStatus,
        productTitle: productTitle.trim() || 'General Merchandise',
        isVpnProxy: Boolean(isVpnProxy)
      });

      clearInterval(stepInterval);
      setAnalyzedResult(result);
      setIsAnalyzing(false);
      setAnalysisStep(0);

      // Add to live ledger automatically
      onAddTransaction(result.transaction);

      showToast({
        title: `ML Prediction: Score ${result.evaluation.riskScore}/100`,
        description: `Level: ${result.evaluation.riskLevel} | Action: ${result.evaluation.recommendedAction.replace('_', ' ')} (${result.evaluation.chargebackProbability}% Chargeback Prob). Stored in live ledger.`,
        type: result.evaluation.riskLevel === 'HIGH' ? 'warning' : 'success'
      });
    } catch (err: any) {
      clearInterval(stepInterval);
      console.warn('ML inference error:', err);
      const errMsg = "Live ML API unavailable. Start the ChargeGuard FastAPI server and try again.";
      setAnalysisError(errMsg);
      setAnalyzedResult(null);
      setIsAnalyzing(false);
      setAnalysisStep(0);

      showToast({
        title: 'Live ML API Unavailable',
        description: errMsg,
        type: 'error'
      });
    }
  };

  const handleResetForAnother = () => {
    setAnalyzedResult(null);
    setAnalysisError(null);
    setAmountINR('');
    setCustomerId('');
    setCustomerName('');
    setCustomerCity('');
    setCustomerAgeYears('');
    setAccountAgeDays('');
    setTotalPastOrders('');
    setPastChargebackCount('');
    setFailedAttemptsLast24h('');
    setBillingShippingMatch('');
    setTxnsLast24Hours('');
    setDeviceChangedRecently('');
    setAuthStatus3DS('');
    setPaymentMethod('');
    setOrderValue('');
    setDeliveryStatus('');
    setProductTitle('');
    setIsVpnProxy('');
    setFormErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner / System Notice */}
      <div className="bg-[#171717] border border-[#262626] rounded-xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <Zap className="w-4 h-4" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Real-Time Transaction Analysis
              </h1>
              
              {/* ML Status Indicator */}
              <div className="flex items-center gap-2 flex-wrap">
                {mlHealth.checking ? (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700 flex items-center gap-1.5 font-mono">
                    <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
                    Checking ML API...
                  </span>
                ) : mlHealth.isOnline ? (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    ML API Connected
                  </span>
                ) : (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30 flex items-center gap-1.5 font-mono">
                    <WifiOff className="w-3 h-3 text-red-400" />
                    ML API Offline
                  </span>
                )}

                <span className="text-[10px] text-neutral-200 bg-[#0F0F0F] px-2.5 py-0.5 rounded border border-[#262626] font-mono flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-amber-400" />
                  {mlHealth.isOnline ? 'Live ML Model' : (mlHealth.data?.model || 'HistGradientBoostingClassifier')}
                </span>

                <span className="text-[10px] text-neutral-400 bg-[#0F0F0F] px-2 py-0.5 rounded border border-[#262626] font-mono">
                  Threshold: {mlHealth.data?.threshold ?? 0.20} ({(Number(mlHealth.data?.threshold ?? 0.20) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-3xl leading-relaxed">
              Real-time machine learning transaction risk inference. Ingests amounts, customer tenure, 3DS authentication telemetry, address verification, and velocity features directly into the trained <strong className="text-neutral-200">HistGradientBoostingClassifier</strong> model at <code className="text-amber-400/90 text-xs font-mono">POST /predict</code> to return live chargeback probabilities and automated merchant defense actions.
            </p>
          </div>

          {/* Defense Notice Badge */}
          <div className="p-3 rounded-lg bg-[#0F0F0F] border border-[#262626] text-xs text-neutral-400 max-w-sm flex items-start gap-2.5 shrink-0">
            <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <strong className="text-neutral-200 block text-[11px]">ML Inference Engine</strong>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowConfigModal(!showConfigModal)}
                    className="text-[10px] text-amber-400 hover:text-amber-300 hover:underline font-semibold"
                  >
                    {showConfigModal ? 'Close' : 'Configure URL'}
                  </button>
                  <button
                    type="button"
                    onClick={refreshMlHealth}
                    title="Ping ML health endpoint"
                    className="text-[10px] text-neutral-400 hover:text-white flex items-center gap-0.5"
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                    Ping
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-neutral-400 leading-tight mt-1 truncate font-mono">
                {mlHealth.url || customApiUrl}
              </p>
              {!mlHealth.isOnline && (
                <p className="text-[10px] text-amber-400/90 mt-1 leading-tight">
                  FastAPI tunnel offline. Local HistGradientBoosting demonstrator active for uninterrupted testing.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* URL Configuration Drawer/Box */}
        {showConfigModal && (
          <form onSubmit={handleSaveApiUrl} className="mt-4 p-4 rounded-lg bg-[#0F0F0F] border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white">Configure Live FastAPI / ngrok Inference Endpoint</span>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="text-neutral-500 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              If your ngrok tunnel generated a new URL or your FastAPI server is running on a different port, update the endpoint below. The backend proxy forwards <code className="text-amber-300 font-mono">/predict</code> and <code className="text-amber-300 font-mono">/health</code> requests here:
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={customApiUrl}
                onChange={e => setCustomApiUrl(e.target.value)}
                placeholder="https://your-ngrok-tunnel.ngrok-free.dev"
                className="flex-1 px-3 py-1.5 rounded-lg bg-[#171717] border border-[#333] text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                required
              />
              <button
                type="submit"
                disabled={isSavingConfig}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSavingConfig ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                Save & Connect
              </button>
              <button
                type="button"
                onClick={() => setCustomApiUrl('https://clinic-dictate-dolphin.ngrok-free.dev')}
                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-colors cursor-pointer"
              >
                Reset Default
              </button>
            </div>
            {configMessage && (
              <p className={`text-[11px] ${configMessage.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {configMessage.text}
              </p>
            )}
          </form>
        )}

        {analysisError && (
          <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span><strong>Notice:</strong> {analysisError}</span>
            </div>
            <button
              type="button"
              onClick={refreshMlHealth}
              className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[11px] font-semibold"
            >
              Retry Connection
            </button>
          </div>
        )}
      </div>

      {/* Preset Quick Load Bar */}
      <div className="bg-[#171717] border border-[#262626] rounded-xl p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-semibold text-white">Scenario Test Presets (Low / Medium / High Risk):</span>
          </div>
          <span className="text-[11px] text-neutral-400">Click a scenario to instantly populate verified signals</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 text-xs">
          {/* Preset 1: Low-Risk */}
          <button
            type="button"
            onClick={() => loadPreset('LOW_RISK')}
            className="p-3 rounded-lg bg-[#0F0F0F] hover:bg-[#262626] border border-[#262626] hover:border-green-500/40 text-left transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-[12px] text-green-400 group-hover:underline">1. Clearly Low-Risk</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-green-500/10 text-green-400 font-mono font-bold">~14.0 / 100</span>
            </div>
            <span className="text-[10px] text-neutral-400 block mt-1">₹3.5K • 180d Age • 3DS Verified • APPROVE</span>
          </button>

          {/* Preset 2: Medium-Risk */}
          <button
            type="button"
            onClick={() => loadPreset('MEDIUM_RISK')}
            className="p-3 rounded-lg bg-[#0F0F0F] hover:bg-[#262626] border border-[#262626] hover:border-amber-500/40 text-left transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-[12px] text-amber-400 group-hover:underline">2. Medium-Risk</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 font-mono font-bold">~46 / 100</span>
            </div>
            <span className="text-[10px] text-neutral-400 block mt-1">₹22K • Address Mismatch • MONITOR</span>
          </button>

          {/* Preset 3: High-Risk */}
          <button
            type="button"
            onClick={() => loadPreset('HIGH_RISK')}
            className="p-3 rounded-lg bg-[#0F0F0F] hover:bg-[#262626] border border-[#262626] hover:border-red-500/40 text-left transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-[12px] text-red-400 group-hover:underline">3. Clearly High-Risk</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-500/10 text-red-400 font-mono font-bold">~83.7 / 100</span>
            </div>
            <span className="text-[10px] text-neutral-400 block mt-1">₹85K • 4 Fails • 3DS Friction • MANUAL VERIF</span>
          </button>

          {/* Preset 4: Voucher Burst */}
          <button
            type="button"
            onClick={() => loadPreset('VOUCHER_BURST')}
            className="p-3 rounded-lg bg-[#0F0F0F] hover:bg-[#262626] border border-[#262626] hover:border-purple-500/40 text-left transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-[12px] text-purple-400 group-hover:underline">Resale Voucher Burst</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-400 font-mono font-bold">High Threat</span>
            </div>
            <span className="text-[10px] text-neutral-400 block mt-1">₹65K • 3DS Failed • High Velocity</span>
          </button>
        </div>
      </div>

      {/* Main Analysis Form & Output Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Comprehensive Transaction Form */}
        <div className="lg:col-span-7 bg-[#171717] border border-[#262626] rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#262626] flex items-center justify-between bg-[#0F0F0F]">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-white">Transaction Parameter Inputs</h2>
            </div>
            <span className="text-xs text-neutral-400 font-mono flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-amber-400" />
              Live ML Model Ingestion (11 Features)
            </span>
          </div>

          <form onSubmit={handleAnalyze} className="p-5 space-y-4 text-xs flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Section 1: Core Financial & Customer Identifiers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-neutral-300 font-medium block mb-1">
                    Transaction Amount (INR ₹): <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-neutral-500 font-bold">₹</span>
                    <input
                      type="number"
                      min="1"
                      value={amountINR}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : Number(e.target.value);
                        setAmountINR(val);
                        setOrderValue(val);
                      }}
                      required
                      placeholder="Enter transaction amount"
                      className={`w-full py-2 pl-8 pr-3 rounded-lg bg-[#0F0F0F] border ${
                        formErrors.amountINR ? 'border-red-500' : 'border-[#262626]'
                      } text-white font-mono font-bold focus:outline-none focus:border-amber-500/50`}
                    />
                  </div>
                  {formErrors.amountINR && <p className="text-red-400 text-[10px] mt-1">{formErrors.amountINR}</p>}
                </div>

                <div>
                  <label className="text-neutral-300 font-medium block mb-1">
                    Customer Age (Years): <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-500" />
                    <input
                      type="number"
                      min="18"
                      max="100"
                      value={customerAgeYears}
                      onChange={(e) => setCustomerAgeYears(e.target.value === '' ? '' : Number(e.target.value))}
                      required
                      placeholder="Enter customer age"
                      className={`w-full py-2 pl-8 pr-3 rounded-lg bg-[#0F0F0F] border ${
                        formErrors.customerAgeYears ? 'border-red-500' : 'border-[#262626]'
                      } text-white font-mono focus:outline-none focus:border-amber-500/50`}
                    />
                  </div>
                  {formErrors.customerAgeYears && <p className="text-red-400 text-[10px] mt-1">{formErrors.customerAgeYears}</p>}
                </div>

                <div>
                  <label className="text-neutral-300 font-medium block mb-1">
                    Customer ID: <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-500" />
                    <input
                      type="text"
                      value={customerId}
                      onChange={(e) => setCustomerId(e.target.value)}
                      required
                      placeholder="Enter customer ID"
                      className={`w-full py-2 pl-8 pr-3 rounded-lg bg-[#0F0F0F] border ${
                        formErrors.customerId ? 'border-red-500' : 'border-[#262626]'
                      } text-white font-mono focus:outline-none focus:border-amber-500/50`}
                    />
                  </div>
                  {formErrors.customerId && <p className="text-red-400 text-[10px] mt-1">{formErrors.customerId}</p>}
                </div>

                <div>
                  <label className="text-neutral-300 font-medium block mb-1">Customer Name:</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                    className="w-full py-2 px-3 rounded-lg bg-[#0F0F0F] border border-[#262626] text-neutral-200 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              {/* Section 2: Account History & Dispute Track Record */}
              <div className="pt-3 border-t border-[#262626]">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-2.5">
                  Customer History & Account Maturity (ML Features)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-neutral-300 font-medium block mb-1">
                      Account Age (Days):
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={accountAgeDays}
                      onChange={(e) => setAccountAgeDays(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Enter account age in days"
                      className={`w-full py-2 px-3 rounded-lg bg-[#0F0F0F] border ${
                        formErrors.accountAgeDays ? 'border-red-500' : 'border-[#262626]'
                      } text-neutral-200 font-mono focus:outline-none focus:border-amber-500/50`}
                    />
                    {formErrors.accountAgeDays && <p className="text-red-400 text-[10px] mt-1">{formErrors.accountAgeDays}</p>}
                  </div>

                  <div>
                    <label className="text-neutral-300 font-medium block mb-1">
                      Previous Orders:
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={totalPastOrders}
                      onChange={(e) => setTotalPastOrders(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Enter previous orders"
                      className={`w-full py-2 px-3 rounded-lg bg-[#0F0F0F] border ${
                        formErrors.totalPastOrders ? 'border-red-500' : 'border-[#262626]'
                      } text-neutral-200 font-mono focus:outline-none focus:border-amber-500/50`}
                    />
                    {formErrors.totalPastOrders && <p className="text-red-400 text-[10px] mt-1">{formErrors.totalPastOrders}</p>}
                  </div>

                  <div>
                    <label className="text-neutral-300 font-medium block mb-1">
                      Previous Chargebacks:
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={pastChargebackCount}
                      onChange={(e) => setPastChargebackCount(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Enter previous chargebacks"
                      className={`w-full py-2 px-3 rounded-lg bg-[#0F0F0F] border ${
                        formErrors.pastChargebackCount ? 'border-red-500' : (pastChargebackCount !== '' && Number(pastChargebackCount) > 0) ? 'border-red-500 text-red-400' : 'border-[#262626] text-neutral-200'
                      } font-mono focus:outline-none focus:border-amber-500/50`}
                    />
                    {formErrors.pastChargebackCount && <p className="text-red-400 text-[10px] mt-1">{formErrors.pastChargebackCount}</p>}
                  </div>
                </div>
              </div>

              {/* Section 3: Payment Channel & 3DS Verification */}
              <div className="pt-3 border-t border-[#262626]">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-2.5">
                  Payment Channel & 3-D Secure Telemetry
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-neutral-300 font-medium block mb-1">
                      Payment Method:
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethodType)}
                      className="w-full py-2 px-3 rounded-lg bg-[#0F0F0F] border border-[#262626] text-neutral-200 focus:outline-none focus:border-amber-500/50 cursor-pointer"
                    >
                      <option value="CREDIT_CARD">Credit Card (Visa/Mastercard)</option>
                      <option value="UPI">UPI / QR (NPCI)</option>
                      <option value="DEBIT_CARD">Debit Card / ATM Pin</option>
                      <option value="NETBANKING">NetBanking Direct</option>
                      <option value="EMI">EMI (Credit/Cardless)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-neutral-300 font-medium block mb-1">
                      3-D Secure Status:
                    </label>
                    <select
                      value={authStatus3DS}
                      onChange={(e) => setAuthStatus3DS(e.target.value as Auth3DSStatus)}
                      className="w-full py-2 px-3 rounded-lg bg-[#0F0F0F] border border-[#262626] text-neutral-200 focus:outline-none focus:border-amber-500/50 cursor-pointer"
                    >
                      <option value="AUTHENTICATED">AUTHENTICATED (Full 3DS Pass - 0 Friction)</option>
                      <option value="FRICTIONLESS_SUCCESS">FRICTIONLESS_SUCCESS (Pass - 0 Friction)</option>
                      <option value="ATTEMPTED_ONLY">ATTEMPTED_ONLY (1 Friction Signal)</option>
                      <option value="CHALLENGED_FAILED">CHALLENGED_FAILED (1 Friction Signal)</option>
                      <option value="NOT_ENROLLED">NOT_ENROLLED (1 Friction Signal)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-neutral-300 font-medium block mb-1">
                      Failed Attempts (24h):
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={failedAttemptsLast24h}
                      onChange={(e) => setFailedAttemptsLast24h(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="0"
                      className={`w-full py-2 px-3 rounded-lg bg-[#0F0F0F] border ${
                        Number(failedAttemptsLast24h) >= 3 ? 'border-red-500 text-red-400 font-bold' : 'border-[#262626] text-neutral-200'
                      } font-mono focus:outline-none focus:border-amber-500/50`}
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Velocity, Fulfillment & Environmental Signals */}
              <div className="pt-3 border-t border-[#262626]">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-2.5">
                  Velocity & Fulfillment Integrity
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-neutral-300 font-medium block mb-1">
                      Txn Velocity (24h):
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={txnsLast24Hours}
                      onChange={(e) => setTxnsLast24Hours(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="1"
                      className={`w-full py-2 px-3 rounded-lg bg-[#0F0F0F] border ${
                        Number(txnsLast24Hours) >= 5 ? 'border-amber-500 text-amber-400' : 'border-[#262626] text-neutral-200'
                      } font-mono focus:outline-none focus:border-amber-500/50`}
                    />
                  </div>

                  <div>
                    <label className="text-neutral-300 font-medium block mb-1">
                      Delivery Status:
                    </label>
                    <select
                      value={deliveryStatus}
                      onChange={(e) => setDeliveryStatus(e.target.value as DeliveryStatus)}
                      className="w-full py-2 px-3 rounded-lg bg-[#0F0F0F] border border-[#262626] text-neutral-200 focus:outline-none focus:border-amber-500/50 cursor-pointer"
                    >
                      <option value="PENDING_FULFILLMENT">Pending Fulfillment (Order Placed)</option>
                      <option value="IN_TRANSIT">In Transit (Courier Partner)</option>
                      <option value="OUT_FOR_DELIVERY">Out For Delivery (OTP Assigned)</option>
                      <option value="DELIVERED">Delivered (Signed / Handover Complete)</option>
                      <option value="DELIVERY_FAILED">Delivery Failed / Rejected</option>
                    </select>
                  </div>
                </div>

                {/* Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setBillingShippingMatch(!billingShippingMatch)}
                    className={`py-2 px-3 rounded-lg border text-left flex items-center justify-between transition-colors cursor-pointer ${
                      billingShippingMatch
                        ? 'bg-green-500/10 border-green-500/30 text-green-400'
                        : 'bg-red-500/10 border-red-500/30 text-red-400'
                    }`}
                  >
                    <div>
                      <span className="font-semibold block text-[11px]">Address Match</span>
                      <span className="text-[10px] opacity-80">{billingShippingMatch ? 'Match (0 Mismatch)' : 'Mismatch (1 Mismatch Signal)'}</span>
                    </div>
                    {billingShippingMatch ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeviceChangedRecently(!deviceChangedRecently)}
                    className={`py-2 px-3 rounded-lg border text-left flex items-center justify-between transition-colors cursor-pointer ${
                      !deviceChangedRecently
                        ? 'bg-[#0F0F0F] border-[#262626] text-neutral-300'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    }`}
                  >
                    <div>
                      <span className="font-semibold block text-[11px]">Device Changed</span>
                      <span className="text-[10px] opacity-80">{deviceChangedRecently ? '1 (New Device Signal)' : '0 (Recognized Hardware)'}</span>
                    </div>
                    {deviceChangedRecently ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4 text-green-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsVpnProxy(!isVpnProxy)}
                    className={`py-2 px-3 rounded-lg border text-left flex items-center justify-between transition-colors cursor-pointer ${
                      !isVpnProxy
                        ? 'bg-[#0F0F0F] border-[#262626] text-neutral-300'
                        : 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                    }`}
                  >
                    <div>
                      <span className="font-semibold block text-[11px]">VPN / Proxy</span>
                      <span className="text-[10px] opacity-80">{isVpnProxy ? 'VPN / Proxy Detected' : 'Residential IP'}</span>
                    </div>
                    {isVpnProxy ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4 text-green-400" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Action Button */}
            <div className="pt-5 mt-4 border-t border-[#262626] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleResetForAnother}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-[#0F0F0F] hover:bg-[#262626] text-neutral-400 hover:text-white border border-[#262626] font-medium text-xs transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Form</span>
              </button>

              <button
                type="submit"
                disabled={isAnalyzing}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Querying ML Model (/predict)...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 stroke-[2.5]" />
                    <span>{mlHealth.isOnline ? 'Analyze Transaction (Live ML Model)' : 'Analyze Transaction'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Real-Time Output / Results Card */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {isAnalyzing ? (
            /* Progress & Loading State */
            <div className="bg-[#171717] border border-[#262626] rounded-xl p-8 flex-1 flex flex-col items-center justify-center space-y-5 animate-pulse">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                <RefreshCw className="w-8 h-8 animate-spin" />
              </div>
              <div className="text-center space-y-2 max-w-sm">
                <h3 className="text-base font-bold text-white">Contacting Live ML Model</h3>
                <p className="text-xs text-neutral-400">
                  {analysisStep === 1 && 'Serializing 11 transaction features to JSON payload...'}
                  {analysisStep === 2 && 'Executing POST /predict on HistGradientBoostingClassifier...'}
                  {analysisStep >= 3 && 'Extracting risk score, chargeback probability, and risk factors...'}
                </p>
              </div>
              <div className="w-full max-w-xs bg-neutral-900 h-1.5 rounded-full overflow-hidden border border-[#262626]">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (analysisStep / 3) * 100)}%` }}
                />
              </div>
            </div>
          ) : analyzedResult ? (
            <div className="bg-[#171717] border border-[#262626] rounded-xl overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-300 flex-1 flex flex-col justify-between">
              {/* Output Header */}
              <div className="p-4 border-b border-[#262626] bg-[#0F0F0F] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Live ML Prediction Result</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-medium flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-emerald-400" />
                    {analyzedResult.evaluation.engineName}
                  </span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                    ⚡ Real-Time ML
                  </span>
                </div>
              </div>

              {/* Model & Endpoint Telemetry Strip */}
              <div className="px-4 py-2 bg-[#121212] border-b border-[#262626] grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono text-neutral-400">
                <div>
                  <span className="text-neutral-500 block text-[9px] uppercase">Model Type</span>
                  <span className="text-neutral-200 font-semibold">{analyzedResult.evaluation.modelType || analyzedResult.evaluation.engineVersion || 'HistGradientBoostingClassifier'}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[9px] uppercase">Prediction Source</span>
                  <span className="text-neutral-200 font-semibold truncate block">{analyzedResult.transaction.predictionSource || 'FastAPI /predict'}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[9px] uppercase">Decision Threshold</span>
                  <span className="text-amber-400 font-semibold">{analyzedResult.evaluation.decisionThreshold ?? 0.20} (20%)</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[9px] uppercase">Predicted Chargeback</span>
                  <span className={`font-bold ${
                    (analyzedResult.evaluation.predictedChargeback === 1 || analyzedResult.evaluation.exceedsThreshold)
                      ? 'text-red-400'
                      : 'text-green-400'
                  }`}>
                    {(analyzedResult.evaluation.predictedChargeback === 1 || analyzedResult.evaluation.exceedsThreshold)
                      ? '1 (Chargeback Flagged)'
                      : '0 (No Chargeback)'}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-4 flex-1">
                {/* Identification Row */}
                <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
                  <div>
                    <span className="text-[10px] text-neutral-500 block uppercase font-mono">Transaction Reference</span>
                    <strong className="text-xs font-mono text-amber-400">#{analyzedResult.transaction.id}</strong>
                    <span className="text-[11px] text-neutral-400 block">{analyzedResult.transaction.customer.name} ({analyzedResult.transaction.customer.locationCity})</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-neutral-500 block uppercase font-mono">Evaluated Amount (order_value)</span>
                    <strong className="text-base font-bold font-mono text-white">
                      ₹{analyzedResult.transaction.amountINR.toLocaleString('en-IN')}
                    </strong>
                    <span className="text-[10px] text-neutral-400 block">{analyzedResult.transaction.payment.method}</span>
                  </div>
                </div>

                {/* Score & Risk Level Badges Banner */}
                <div className="p-4 rounded-xl bg-[#0F0F0F] border border-[#262626] grid grid-cols-3 gap-2">
                  {/* 1. Risk Score */}
                  <div>
                    <span className="text-[11px] text-neutral-400 block font-medium">1. Risk Score</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                        analyzedResult.evaluation.riskScore >= 70 ? 'text-red-400' :
                        analyzedResult.evaluation.riskScore >= 36 ? 'text-amber-400' :
                        'text-green-400'
                      }`}>
                        {analyzedResult.evaluation.riskScore}
                      </span>
                      <span className="text-[10px] text-neutral-500 font-mono">/ 100</span>
                    </div>
                    <span className="text-[9px] text-neutral-500 block font-medium mt-0.5">FastAPI ML Output</span>
                  </div>

                  {/* 2. Risk Level */}
                  <div className="text-center">
                    <span className="text-[11px] text-neutral-400 block font-medium mb-1">2. Risk Level</span>
                    <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-md border tracking-wider inline-block ${
                      analyzedResult.evaluation.riskLevel === 'HIGH'
                        ? 'bg-red-500/15 text-red-400 border-red-500/30'
                        : analyzedResult.evaluation.riskLevel === 'MEDIUM'
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        : 'bg-green-500/15 text-green-400 border-green-500/30'
                    }`}>
                      {analyzedResult.evaluation.riskLevel}
                    </span>
                  </div>

                  {/* 3. Estimated Chargeback Risk & Threshold */}
                  <div className="text-right">
                    <span className="text-[11px] text-neutral-400 block font-medium">3. Chargeback Probability</span>
                    <div className="flex items-baseline justify-end gap-1 mt-0.5">
                      <span className={`text-xl sm:text-2xl font-bold font-mono ${
                        analyzedResult.evaluation.chargebackProbability >= 60 ? 'text-red-400' :
                        analyzedResult.evaluation.chargebackProbability >= ML_DECISION_THRESHOLD_PERCENT ? 'text-amber-400' :
                        'text-green-400'
                      }`}>
                        {analyzedResult.evaluation.chargebackProbability}%
                      </span>
                    </div>
                    <span className={`text-[9px] font-mono block mt-0.5 ${
                      analyzedResult.evaluation.chargebackProbability >= ML_DECISION_THRESHOLD_PERCENT
                        ? 'text-amber-400'
                        : 'text-green-400'
                    }`}>
                      {analyzedResult.evaluation.chargebackProbability >= ML_DECISION_THRESHOLD_PERCENT ? '≥ 0.20 Threshold' : '< 0.20 Threshold'}
                      {analyzedResult.evaluation.rawProbability !== undefined && ` (${analyzedResult.evaluation.rawProbability.toFixed(4)})`}
                    </span>
                  </div>
                </div>

                {/* 4. Individual Risk Factors Returned by ML API */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-amber-500" />
                      4. Risk Factors ({analyzedResult.evaluation.riskFactors.length})
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">FastAPI /predict signals</span>
                  </div>

                  {analyzedResult.evaluation.riskFactors.length === 0 ? (
                    <div className="p-3 rounded-lg bg-[#0F0F0F] border border-[#262626] text-xs text-green-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Zero elevated-risk factors returned by the live ML API.</span>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {analyzedResult.evaluation.riskFactors.map((factor) => (
                        <div
                          key={factor.id}
                          className="p-2.5 rounded-lg bg-[#0F0F0F] border border-[#262626] text-xs flex flex-col gap-0.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-neutral-200 text-[11px] flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                factor.severity === 'CRITICAL' ? 'bg-red-400' :
                                factor.severity === 'HIGH' ? 'bg-amber-400' : 'bg-blue-400'
                              }`} />
                              {factor.name}
                            </span>
                            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                              factor.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                              factor.severity === 'HIGH' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                              'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            }`}>
                              {factor.severity}
                            </span>
                          </div>
                          <p className="text-[10px] text-neutral-400 leading-relaxed mt-0.5">{factor.explanation}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 5. Natural-Language AI Risk Explanation */}
                <div className="p-3.5 rounded-lg bg-[#0F0F0F] border border-[#262626] text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 text-neutral-300 font-bold text-[11px]">
                    <Cpu className="w-3.5 h-3.5 text-amber-500" />
                    <span>5. AI Risk Explanation</span>
                  </div>
                  <p className="text-[11px] text-neutral-300 leading-relaxed">
                    {analyzedResult.evaluation.aiExplanation}
                  </p>
                </div>

                {/* 6. Recommended Merchant Action */}
                <div className="p-3.5 rounded-lg bg-[#0F0F0F] border border-[#262626] text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400 text-[11px] font-bold">6. Recommended Action:</span>
                    <span className={`px-2.5 py-0.5 rounded font-bold text-[11px] tracking-wide font-mono ${
                      analyzedResult.evaluation.recommendedAction === 'APPROVE'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : analyzedResult.evaluation.recommendedAction === 'MONITOR'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {analyzedResult.evaluation.recommendedAction}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400 leading-relaxed">
                    {analyzedResult.evaluation.actionReason}
                  </p>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="p-4 border-t border-[#262626] bg-[#0F0F0F] flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => onOpenEvidenceForTransaction(analyzedResult.transaction)}
                  className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors cursor-pointer shadow-sm"
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>Open Evidence Case</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetForAnother}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#171717] hover:bg-[#262626] text-neutral-300 border border-[#262626] font-semibold text-xs transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Analyze Another</span>
                </button>
              </div>
            </div>
          ) : analysisError ? (
            /* Explicit Offline Error State as required by prompt */
            <div className="bg-[#171717] border border-red-500/30 rounded-xl p-8 text-center flex-1 flex flex-col items-center justify-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shadow-inner">
                <WifiOff className="w-7 h-7" />
              </div>
              <div className="space-y-2 max-w-sm">
                <h3 className="text-base font-bold text-white">Live ML API Unavailable</h3>
                <p className="text-xs text-red-300 leading-relaxed">
                  Live ML API unavailable. Start the ChargeGuard FastAPI server and try again.
                </p>
                <p className="text-[11px] text-neutral-500">
                  Target Endpoint: <code className="text-neutral-400 font-mono">{customApiUrl || 'https://clinic-dictate-dolphin.ngrok-free.dev'}/predict</code>
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={refreshMlHealth}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors cursor-pointer shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry ML Connection</span>
                </button>
              </div>
            </div>
          ) : (
            /* Empty State / Initial Guide */
            <div className="bg-[#171717] border border-[#262626] rounded-xl p-8 text-center flex-1 flex flex-col items-center justify-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#0F0F0F] border border-[#262626] flex items-center justify-center text-amber-500 shadow-inner">
                <Activity className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h3 className="text-base font-bold text-white">Live ML Model Ready</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Select a test scenario preset above or configure custom transaction fields, then click <strong className="text-amber-400">"Analyze Transaction"</strong> to query the live FastAPI ML model at <code className="text-amber-400 font-mono text-[11px]">/predict</code>.
                </p>
              </div>

              <div className="w-full max-w-xs p-3 rounded-lg bg-[#0F0F0F] border border-[#262626] text-left text-xs space-y-2">
                <span className="text-[11px] font-semibold text-neutral-300 block">Live Inference API Features:</span>
                <div className="flex items-center gap-2 text-neutral-400 text-[11px]">
                  <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
                  <span>HistGradientBoostingClassifier Model</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-400 text-[11px]">
                  <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
                  <span>11 Input Features Evaluated</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-400 text-[11px]">
                  <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
                  <span>Real Risk Score & Chargeback Prob %</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-400 text-[11px]">
                  <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
                  <span>Action: APPROVE / MONITOR / MANUAL_VERIFICATION</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


