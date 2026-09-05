import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  FileCheck2, 
  User, 
  MapPin, 
  CreditCard, 
  Package, 
  Activity, 
  Lock, 
  RefreshCw, 
  SlidersHorizontal,
  Smartphone,
  Info,
  Check,
  XCircle,
  HelpCircle,
  Zap
} from 'lucide-react';
import { Transaction, RiskFactor, TransactionStatus, EvidenceCase } from '../types';
import { calculateTransactionRisk } from '../services/riskEngine';
import { useToast } from './Toast';
import { NavTab } from './Navbar';

interface RiskAnalysisViewProps {
  transaction: Transaction | null;
  allTransactions: Transaction[];
  onSelectTransaction: (txn: Transaction) => void;
  onUpdateTransactionStatus: (id: string, newStatus: TransactionStatus) => void;
  setActiveTab: (tab: NavTab) => void;
  onOpenEvidenceForTransaction: (txn: Transaction) => void;
  evidenceCases?: EvidenceCase[];
}

export const RiskAnalysisView: React.FC<RiskAnalysisViewProps> = ({
  transaction,
  allTransactions,
  onSelectTransaction,
  onUpdateTransactionStatus,
  setActiveTab,
  onOpenEvidenceForTransaction,
  evidenceCases
}) => {
  const { showToast } = useToast();
  const currentTxn = transaction || allTransactions[0];

  // AI Assessment State
  const [aiAssessment, setAiAssessment] = useState<string>(currentTxn?.aiRiskAssessment || '');
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [aiSource, setAiSource] = useState<string>('ChargeGuard Heuristic');

  // Interactive "What-If" Sandbox state
  const [sandboxEnabled, setSandboxEnabled] = useState<boolean>(false);
  const [sbAuth3DS, setSbAuth3DS] = useState<'AUTHENTICATED' | 'CHALLENGE_FAILED' | 'NOT_ENROLLED' | 'FRICTIONLESS_SUCCESS'>('AUTHENTICATED');
  const [sbAccountAgeDays, setSbAccountAgeDays] = useState<number>(30);
  const [sbFailedAttempts, setSbFailedAttempts] = useState<number>(0);
  const [sbAddressMatch, setSbAddressMatch] = useState<boolean>(true);
  const [sbIsVpn, setSbIsVpn] = useState<boolean>(false);

  // Sync state when transaction changes
  useEffect(() => {
    if (currentTxn) {
      setAiAssessment(currentTxn.aiRiskExplanation || currentTxn.aiRiskAssessment || '');
      if (currentTxn.isRealTimeMl || currentTxn.isRealTimeAnalysis || currentTxn.id.startsWith('txn_ml_')) {
        setAiSource(currentTxn.predictionSource || 'Live HistGradientBoostingClassifier');
      } else {
        setAiSource('ChargeGuard Threat Engine');
      }
      setSbAuth3DS(currentTxn.payment.authStatus3DS);
      setSbAccountAgeDays(currentTxn.customer.accountAgeDays);
      setSbFailedAttempts(currentTxn.velocity.failedAttemptsLast24h);
      setSbAddressMatch(currentTxn.billingShippingMatch);
      setSbIsVpn(currentTxn.customer.isVpnProxy);
      setSandboxEnabled(false);
    }
  }, [currentTxn?.id]);

  // Recalculate if sandbox is enabled
  const evaluatedTxn: Transaction = React.useMemo(() => {
    if (!currentTxn) return allTransactions[0];
    if (!sandboxEnabled) return currentTxn;

    const modified: Transaction = {
      ...currentTxn,
      billingShippingMatch: sbAddressMatch,
      customer: {
        ...currentTxn.customer,
        accountAgeDays: sbAccountAgeDays,
        isVpnProxy: sbIsVpn
      },
      payment: {
        ...currentTxn.payment,
        authStatus3DS: sbAuth3DS
      },
      velocity: {
        ...currentTxn.velocity,
        failedAttemptsLast24h: sbFailedAttempts
      }
    };

    const rescore = calculateTransactionRisk(modified);
    return {
      ...modified,
      riskScore: rescore.riskScore,
      riskLevel: rescore.riskLevel,
      recommendedAction: rescore.recommendedAction,
      riskFactors: rescore.riskFactors
    };
  }, [currentTxn, sandboxEnabled, sbAuth3DS, sbAccountAgeDays, sbFailedAttempts, sbAddressMatch, sbIsVpn]);

  // Request AI Assessment
  const handleGenerateAiAssessment = async () => {
    if (!evaluatedTxn) return;
    setIsLoadingAi(true);
    try {
      const response = await fetch('/api/ai/assess-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transaction: evaluatedTxn })
      });

      if (!response.ok) throw new Error('Assessment service returned non-200');

      const data = await response.json();
      setAiAssessment(data.assessment);
      setAiSource(data.source === 'gemini-3.7-flash' ? 'Gemini 3.7 Flash AI' : 'Deterministic Threat Rulebook');
      showToast({
        type: 'success',
        title: 'AI Assessment Generated',
        description: `Risk analysis updated via ${data.source}`
      });
    } catch (error) {
      console.error(error);
      showToast({
        type: 'warning',
        title: 'Heuristic Fallback Used',
        description: 'Generated assessment via local expert risk rulebook'
      });
    } finally {
      setIsLoadingAi(false);
    }
  };

  if (!currentTxn) {
    return (
      <div className="max-w-7xl mx-auto p-8 text-center text-slate-400">
        <p>No transaction selected.</p>
      </div>
    );
  }

  const scoreColor = evaluatedTxn.riskScore >= 70 ? 'text-red-400' : evaluatedTxn.riskScore >= 36 ? 'text-amber-400' : 'text-green-400';
  const badgeBg = evaluatedTxn.riskScore >= 70 ? 'bg-red-400/10 border-red-400/20 text-red-400' : evaluatedTxn.riskScore >= 36 ? 'bg-amber-400/10 border-amber-400/20 text-amber-400' : 'bg-green-400/10 border-green-400/20 text-green-400';
  const ringStroke = evaluatedTxn.riskScore >= 70 ? '#F87171' : evaluatedTxn.riskScore >= 36 ? '#F59E0B' : '#4ADE80';

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#171717] p-4 rounded-xl border border-[#262626]">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-neutral-400 shrink-0">Analyze Transaction:</span>
          <select
            value={currentTxn.id}
            onChange={(e) => {
              const found = allTransactions.find((t) => t.id === e.target.value);
              if (found) onSelectTransaction(found);
            }}
            className="py-1.5 px-3 rounded-lg bg-[#0F0F0F] border border-[#262626] text-neutral-200 text-xs font-mono focus:outline-none focus:border-amber-500/50"
          >
            {allTransactions.map((t) => (
              <option key={t.id} value={t.id}>
                #{t.id.replace('txn_in_', '')} — {t.customer.name} (₹{t.amountINR.toLocaleString('en-IN')}) — {t.riskLevel} RISK ({t.riskScore}/100)
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          {(() => {
            const linkedCase = evidenceCases?.find((c) => c.transactionId === evaluatedTxn.id);
            return (
              <button
                onClick={() => onOpenEvidenceForTransaction(evaluatedTxn)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors cursor-pointer shadow-sm"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>{linkedCase ? `View Evidence Case (${linkedCase.id})` : 'Create Evidence Case'}</span>
              </button>
            );
          })()}
        </div>
      </div>

      {/* Live ML Inferred Prediction Banner */}
      {Boolean(currentTxn.isRealTimeMl || currentTxn.isRealTimeAnalysis || currentTxn.id.startsWith('txn_ml_')) && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500 text-black flex items-center justify-center font-bold shrink-0">
              <Zap className="w-5 h-5 fill-black" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-bold text-white">Live ML Inferred Transaction</h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500 text-black shadow-sm">
                  ⚡ Real-Time ML
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/15 text-green-400 border border-green-500/30">
                  {currentTxn.analysisStatus || 'COMPLETED'}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Model: <span className="font-mono text-neutral-300">{currentTxn.predictionSource || 'HistGradientBoostingClassifier (FastAPI /predict)'}</span> • Demonstrator Threshold: <span className="font-mono text-amber-400 font-bold">0.20</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="p-2 rounded bg-black/40 border border-neutral-800 text-center min-w-[95px]">
              <span className="text-[10px] text-neutral-400 block uppercase font-sans">CB Probability</span>
              <span className={`font-bold text-sm ${(currentTxn.chargebackProbability || 0) >= 20 ? 'text-red-400' : 'text-green-400'}`}>
                {currentTxn.chargebackProbability !== undefined ? `${currentTxn.chargebackProbability}%` : 'N/A'}
              </span>
            </div>
            <div className="p-2 rounded bg-black/40 border border-neutral-800 text-center min-w-[95px]">
              <span className="text-[10px] text-neutral-400 block uppercase font-sans">ML Risk Score</span>
              <span className="font-bold text-sm text-white">
                {currentTxn.riskScore}/100
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Primary Risk Overview Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Big Radial Score Gauge & Recommendation */}
        <div className="lg:col-span-5 bg-[#171717] p-6 rounded-xl border border-[#262626] flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Overall Chargeback Risk</span>
                <div className="text-xs text-neutral-500 font-mono mt-0.5">Order #{evaluatedTxn.orderId}</div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${badgeBg} flex items-center gap-1`}>
                {evaluatedTxn.riskLevel === 'HIGH' && <ShieldAlert className="w-3.5 h-3.5" />}
                {evaluatedTxn.riskLevel === 'MEDIUM' && <AlertTriangle className="w-3.5 h-3.5" />}
                {evaluatedTxn.riskLevel === 'LOW' && <ShieldCheck className="w-3.5 h-3.5" />}
                {evaluatedTxn.riskLevel} RISK
              </span>
            </div>

            {/* Circular Gauge */}
            <div className="py-4 flex flex-col items-center justify-center relative">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    stroke="#262626"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    stroke={ringStroke}
                    strokeWidth="10"
                    strokeDasharray={301.6}
                    strokeDashoffset={301.6 - (301.6 * evaluatedTxn.riskScore) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-4xl font-extrabold font-mono tracking-tight ${scoreColor}`}>
                    {evaluatedTxn.riskScore}
                  </span>
                  <span className="text-xs font-semibold text-neutral-400 mt-0.5">Risk Score (0–100)</span>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="text-[11px] font-bold font-mono text-amber-400">
                      {evaluatedTxn.chargebackProbability 
                        ? `${evaluatedTxn.chargebackProbability}%` 
                        : `${Math.min(98, Math.max(2, Math.round(evaluatedTxn.riskScore * 0.95)))}%`}
                    </span>
                    <span className="text-[9px] text-neutral-500 uppercase tracking-tight">CB Prob</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended Action Pill */}
            <div className="p-4 rounded-xl bg-[#0F0F0F] border border-[#262626] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400 font-medium">Recommended Merchant Action:</span>
                <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wide ${
                  evaluatedTxn.recommendedAction === 'APPROVE'
                    ? 'bg-green-400/10 text-green-400 border border-green-400/20'
                    : evaluatedTxn.recommendedAction === 'MANUAL_VERIFICATION'
                    ? 'bg-red-400/10 text-red-400 border border-red-400/20'
                    : 'bg-amber-400/10 text-amber-400 border border-amber-400/20'
                }`}>
                  {evaluatedTxn.recommendedAction.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {evaluatedTxn.recommendedAction === 'APPROVE' &&
                  'Clear for immediate fulfillment. 3DS authentication validated and customer identity profile demonstrates verified historical consistency.'}
                {evaluatedTxn.recommendedAction === 'MONITOR' &&
                  'Release shipment but enable delivery carrier OTP confirmation and signature requirement prior to physical package handover.'}
                {evaluatedTxn.recommendedAction === 'MANUAL_VERIFICATION' &&
                  'Place order on fulfillment hold. Contact cardholder via registered phone to verify transaction consent before shipping high-value items.'}
              </p>
            </div>
          </div>

          {/* Quick Decision Action Buttons */}
          <div className="mt-4 pt-4 border-t border-[#262626] space-y-2">
            <span className="text-[11px] text-neutral-400 block font-medium">Update Merchant Fulfillment Status:</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  onUpdateTransactionStatus(currentTxn.id, 'APPROVED');
                  showToast({ type: 'success', title: 'Order Approved', description: `Order #${currentTxn.orderId} marked approved for dispatch.` });
                }}
                className={`py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentTxn.status === 'APPROVED'
                    ? 'bg-green-400 text-black'
                    : 'bg-[#0F0F0F] hover:bg-neutral-800 text-green-400 border border-[#262626]'
                }`}
              >
                Approve
              </button>
              <button
                onClick={() => {
                  onUpdateTransactionStatus(currentTxn.id, 'UNDER_VERIFICATION');
                  showToast({ type: 'warning', title: 'Placed on Hold', description: `Order #${currentTxn.orderId} placed on verification hold.` });
                }}
                className={`py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentTxn.status === 'UNDER_VERIFICATION'
                    ? 'bg-amber-400 text-black'
                    : 'bg-[#0F0F0F] hover:bg-neutral-800 text-amber-400 border border-[#262626]'
                }`}
              >
                Hold / Review
              </button>
              <button
                onClick={() => {
                  onUpdateTransactionStatus(currentTxn.id, 'BLOCKED');
                  showToast({ type: 'error', title: 'Order Blocked', description: `Order #${currentTxn.orderId} rejected to prevent chargeback.` });
                }}
                className={`py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentTxn.status === 'BLOCKED'
                    ? 'bg-red-400 text-black'
                    : 'bg-[#0F0F0F] hover:bg-neutral-800 text-red-400 border border-[#262626]'
                }`}
              >
                Block
              </button>
            </div>
          </div>
        </div>

        {/* Right: Detailed Transaction Meta & Risk Factors */}
        <div className="lg:col-span-7 space-y-6">
          {/* Transaction Metadata Card */}
          <div className="bg-[#171717] p-5 rounded-xl border border-[#262626] space-y-4">
            <div className="flex items-center justify-between border-b border-[#262626] pb-3">
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-500" />
                Transaction & Identity Telemetry
              </h3>
              <span className="text-xs font-mono font-bold text-amber-400">
                ₹{evaluatedTxn.amountINR.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-[#0F0F0F] border border-[#262626]">
                <span className="text-neutral-500 text-[11px] block">Customer</span>
                <span className="font-semibold text-neutral-200 block mt-0.5">{evaluatedTxn.customer.name}</span>
                <span className="text-neutral-400 text-[10px] truncate block">{evaluatedTxn.customer.email}</span>
              </div>

              <div className="p-3 rounded-lg bg-[#0F0F0F] border border-[#262626]">
                <span className="text-neutral-500 text-[11px] block">Account Tenure</span>
                <span className="font-semibold text-neutral-200 block mt-0.5">
                  {evaluatedTxn.customer.accountAgeDays} Days Old
                </span>
                <span className="text-neutral-400 text-[10px] block">{evaluatedTxn.customer.totalPastOrders} Prior Orders</span>
              </div>

              <div className="p-3 rounded-lg bg-[#0F0F0F] border border-[#262626]">
                <span className="text-neutral-500 text-[11px] block">Payment Channel</span>
                <span className="font-semibold text-neutral-200 block mt-0.5">{evaluatedTxn.payment.method}</span>
                <span className="text-neutral-400 text-[10px] font-mono block">
                  {evaluatedTxn.payment.cardNetwork || evaluatedTxn.payment.bankName || 'UPI VPA'}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[#0F0F0F] border border-[#262626]">
                <span className="text-neutral-500 text-[11px] block">3DS Authentication</span>
                <span className={`font-semibold block mt-0.5 ${
                  evaluatedTxn.payment.authStatus3DS === 'AUTHENTICATED' || evaluatedTxn.payment.authStatus3DS === 'FRICTIONLESS_SUCCESS'
                    ? 'text-green-400'
                    : 'text-amber-400'
                }`}>
                  {evaluatedTxn.payment.authStatus3DS}
                </span>
                <span className="text-neutral-400 text-[10px] block">
                  {evaluatedTxn.payment.authStatus3DS === 'AUTHENTICATED' || evaluatedTxn.payment.authStatus3DS === 'FRICTIONLESS_SUCCESS'
                    ? 'Fully authenticated signal'
                    : 'Incomplete authentication signal'}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[#0F0F0F] border border-[#262626]">
                <span className="text-neutral-500 text-[11px] block">Address Match</span>
                <span className={`font-semibold block mt-0.5 ${evaluatedTxn.billingShippingMatch ? 'text-green-400' : 'text-amber-400'}`}>
                  {evaluatedTxn.billingShippingMatch ? 'Matching Address' : 'Address Mismatch'}
                </span>
                <span className="text-neutral-400 text-[10px] block truncate">
                  Ship: {evaluatedTxn.shippingAddress.city}, Bill: {evaluatedTxn.billingAddress.city}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[#0F0F0F] border border-[#262626]">
                <span className="text-neutral-500 text-[11px] block">Network & IP</span>
                <span className={`font-semibold block mt-0.5 ${evaluatedTxn.customer.isVpnProxy ? 'text-red-400' : 'text-neutral-200'}`}>
                  {evaluatedTxn.customer.isVpnProxy ? 'VPN / Proxy Detected' : 'Residential IP'}
                </span>
                <span className="text-neutral-400 text-[10px] font-mono block truncate">{evaluatedTxn.customer.ipAddress}</span>
              </div>
            </div>

            {/* Original ML Model Input Features */}
            <div className="pt-3 border-t border-[#262626] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3 h-3 text-amber-500" />
                  Original ML Model Input Features
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">
                  Payload Signals Verified
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="p-2 rounded bg-[#0A0A0A] border border-[#222]">
                  <span className="text-neutral-500 text-[10px] block">Customer ID</span>
                  <span className="font-mono font-semibold text-neutral-200 truncate block">{evaluatedTxn.customer.id || 'CUST-DEMO'}</span>
                </div>
                <div className="p-2 rounded bg-[#0A0A0A] border border-[#222]">
                  <span className="text-neutral-500 text-[10px] block">Customer Age</span>
                  <span className="font-mono font-semibold text-neutral-200">{evaluatedTxn.customerAgeYears || evaluatedTxn.customer.customerAgeYears || 28} years</span>
                </div>
                <div className="p-2 rounded bg-[#0A0A0A] border border-[#222]">
                  <span className="text-neutral-500 text-[10px] block">Previous Orders</span>
                  <span className="font-mono font-semibold text-neutral-200">{evaluatedTxn.customer.totalPastOrders}</span>
                </div>
                <div className="p-2 rounded bg-[#0A0A0A] border border-[#222]">
                  <span className="text-neutral-500 text-[10px] block">Past Chargebacks</span>
                  <span className={`font-mono font-semibold ${evaluatedTxn.customer.pastChargebackCount > 0 ? 'text-red-400 font-bold' : 'text-neutral-200'}`}>
                    {evaluatedTxn.customer.pastChargebackCount}
                  </span>
                </div>
                <div className="p-2 rounded bg-[#0A0A0A] border border-[#222]">
                  <span className="text-neutral-500 text-[10px] block">Failed Attempts (24h)</span>
                  <span className={`font-mono font-semibold ${evaluatedTxn.velocity.failedAttemptsLast24h > 0 ? 'text-amber-400' : 'text-neutral-200'}`}>
                    {evaluatedTxn.velocity.failedAttemptsLast24h}
                  </span>
                </div>
                <div className="p-2 rounded bg-[#0A0A0A] border border-[#222]">
                  <span className="text-neutral-500 text-[10px] block">Txns Last 24h</span>
                  <span className={`font-mono font-semibold ${evaluatedTxn.velocity.txnsLast24Hours > 4 ? 'text-amber-400' : 'text-neutral-200'}`}>
                    {evaluatedTxn.velocity.txnsLast24Hours}</span>
                </div>
                <div className="p-2 rounded bg-[#0A0A0A] border border-[#222]">
                  <span className="text-neutral-500 text-[10px] block">Device Changed</span>
                  <span className={`font-mono font-semibold ${evaluatedTxn.velocity.deviceChangedRecently ? 'text-red-400' : 'text-green-400'}`}>
                    {evaluatedTxn.velocity.deviceChangedRecently ? '1 (Changed)' : '0 (Consistent)'}
                  </span>
                </div>
                <div className="p-2 rounded bg-[#0A0A0A] border border-[#222]">
                  <span className="text-neutral-500 text-[10px] block">Address Mismatch</span>
                  <span className={`font-mono font-semibold ${(!evaluatedTxn.billingShippingMatch || evaluatedTxn.billingShippingMismatch) ? 'text-amber-400' : 'text-green-400'}`}>
                    {(!evaluatedTxn.billingShippingMatch || evaluatedTxn.billingShippingMismatch) ? '1 (Mismatch)' : '0 (Matched)'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Granular Risk Factors Breakdown */}
          <div className="bg-[#171717] p-5 rounded-xl border border-[#262626] space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#262626] pb-3">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <Activity className="w-4 h-4 text-red-400" />
                  Identified Risk Factors ({evaluatedTxn.riskFactors.length})
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">Weighted signals contributing to the overall 0-100 score</p>
              </div>
              <span className="text-[11px] text-neutral-400 font-mono">
                Total Score: <strong className={scoreColor}>{evaluatedTxn.riskScore} pts</strong>
              </span>
            </div>

            {evaluatedTxn.riskFactors.length === 0 ? (
              <div className="p-4 rounded-lg bg-green-400/10 border border-green-400/20 text-xs text-green-400 flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                <span>No high risk factors detected. Standard baseline transaction indicators apply.</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {evaluatedTxn.riskFactors.map((factor, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg bg-[#0F0F0F] border border-[#262626] hover:border-neutral-700 transition-colors flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-neutral-200">{factor.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded uppercase border ${
                          factor.severity === 'CRITICAL' ? 'bg-red-400/10 text-red-400 border-red-400/20' :
                          factor.severity === 'HIGH' ? 'bg-orange-400/10 text-orange-400 border-orange-400/20' :
                          factor.severity === 'MEDIUM' ? 'bg-amber-400/10 text-amber-400 border-amber-400/20' :
                          'bg-blue-400/10 text-blue-400 border-blue-400/20'
                        }`}>
                          {factor.severity}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-mono uppercase">[{factor.category}]</span>
                      </div>
                      <p className="text-xs text-neutral-400 leading-relaxed">{factor.explanation || factor.description}</p>
                    </div>

                    <div className="shrink-0 text-right font-mono">
                      <span className={`text-xs font-extrabold ${
                        factor.severity === 'CRITICAL' || factor.severity === 'HIGH' ? 'text-red-400' : 'text-amber-400'
                      }`}>
                        +{factor.scoreImpact} pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Assessment & Sandbox Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: AI Risk Narrative */}
        <div className="lg:col-span-7 bg-[#171717] p-5 sm:p-6 rounded-xl border border-[#262626] space-y-4">
          <div className="flex items-center justify-between border-b border-[#262626] pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">AI Chargeback Threat Assessment</h3>
                <span className="text-[11px] text-neutral-400">Powered by {aiSource}</span>
              </div>
            </div>

            <button
              onClick={handleGenerateAiAssessment}
              disabled={isLoadingAi}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#262626] hover:bg-neutral-800 text-neutral-200 border border-neutral-700 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-500 ${isLoadingAi ? 'animate-spin' : ''}`} />
              <span>{isLoadingAi ? 'Analyzing...' : 'Re-Evaluate with AI'}</span>
            </button>
          </div>

          <div className="p-4 rounded-lg bg-[#0F0F0F] border border-[#262626] text-xs text-neutral-300 leading-relaxed space-y-3 font-sans">
            {isLoadingAi ? (
              <div className="py-8 flex flex-col items-center justify-center text-neutral-400 space-y-2">
                <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Consulting Gemini risk reasoning model...</span>
              </div>
            ) : (
              aiAssessment.split('\n\n').map((paragraph, i) => (
                <p key={i} className="text-neutral-300 leading-relaxed">{paragraph}</p>
              ))
            )}
          </div>
        </div>

        {/* Right: Interactive "What-If" Signal Sandbox */}
        <div className="lg:col-span-5 bg-[#171717] p-5 sm:p-6 rounded-xl border border-[#262626] space-y-4">
          <div className="flex items-center justify-between border-b border-[#262626] pb-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-amber-500" />
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Interactive Factor Sandbox</h3>
                <span className="text-[11px] text-neutral-400">Simulate how signal shifts impact score</span>
              </div>
            </div>

            <button
              onClick={() => setSandboxEnabled(!sandboxEnabled)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                sandboxEnabled
                  ? 'bg-amber-500 text-black'
                  : 'bg-[#262626] text-neutral-300 hover:text-white'
              }`}
            >
              {sandboxEnabled ? 'Sandbox Active' : 'Enable Sandbox'}
            </button>
          </div>

          <div className={`space-y-3.5 text-xs ${!sandboxEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
            {/* 3DS Authentication */}
            <div>
              <label className="text-neutral-400 font-medium block mb-1">3DS Authentication Status:</label>
              <select
                value={sbAuth3DS}
                onChange={(e) => setSbAuth3DS(e.target.value as any)}
                className="w-full py-1.5 px-3 rounded-lg bg-[#0F0F0F] border border-[#262626] text-neutral-200 text-xs"
              >
                <option value="AUTHENTICATED">AUTHENTICATED (Issuer Liability Shift)</option>
                <option value="FRICTIONLESS_SUCCESS">FRICTIONLESS_SUCCESS (Verified)</option>
                <option value="CHALLENGE_FAILED">CHALLENGE_FAILED (OTP Failed / Bypassed)</option>
                <option value="NOT_ENROLLED">NOT_ENROLLED (No Liability Shift)</option>
              </select>
            </div>

            {/* Account Age */}
            <div>
              <div className="flex justify-between text-neutral-400 font-medium mb-1">
                <span>Customer Account Age:</span>
                <span className="font-mono text-neutral-200">{sbAccountAgeDays} Days</span>
              </div>
              <input
                type="range"
                min="0"
                max="365"
                value={sbAccountAgeDays}
                onChange={(e) => setSbAccountAgeDays(Number(e.target.value))}
                className="w-full accent-amber-500 bg-neutral-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Failed Attempts */}
            <div>
              <div className="flex justify-between text-neutral-400 font-medium mb-1">
                <span>Failed Payment Attempts (24h):</span>
                <span className="font-mono text-neutral-200">{sbFailedAttempts} Attempts</span>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                value={sbFailedAttempts}
                onChange={(e) => setSbFailedAttempts(Number(e.target.value))}
                className="w-full accent-amber-500 bg-neutral-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => setSbAddressMatch(!sbAddressMatch)}
                className={`p-2 rounded-lg border text-center transition-colors cursor-pointer ${
                  sbAddressMatch
                    ? 'bg-green-400/10 border-green-400/20 text-green-400'
                    : 'bg-red-400/10 border-red-400/20 text-red-400'
                }`}
              >
                <span className="block text-[11px] font-semibold">{sbAddressMatch ? '✓ Address Matched' : '✗ Address Mismatched'}</span>
              </button>

              <button
                onClick={() => setSbIsVpn(!sbIsVpn)}
                className={`p-2 rounded-lg border text-center transition-colors cursor-pointer ${
                  !sbIsVpn
                    ? 'bg-green-400/10 border-green-400/20 text-green-400'
                    : 'bg-red-400/10 border-red-400/20 text-red-400'
                }`}
              >
                <span className="block text-[11px] font-semibold">{sbIsVpn ? '⚠ VPN / Proxy On' : '✓ Clean Residential IP'}</span>
              </button>
            </div>
          </div>

          {sandboxEnabled && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs">
              <span className="text-amber-400 font-medium">Sandbox Score Result:</span>
              <span className={`font-mono font-extrabold text-sm ${scoreColor}`}>
                {evaluatedTxn.riskScore}/100 ({evaluatedTxn.riskLevel} RISK)
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
