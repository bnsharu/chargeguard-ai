import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Activity, 
  Layers, 
  TrendingUp, 
  ShieldCheck, 
  SlidersHorizontal,
  Info,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Cpu,
  Database,
  Calculator,
  Sliders,
  AlertTriangle,
  Scale,
  ListFilter
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine
} from 'recharts';
import { syntheticEvaluationData } from '../data/modelMetrics';
import { checkMlApiHealth } from '../services/mlApi';

export const ModelPerformanceView: React.FC = () => {
  // Live ML API health status
  const [mlHealth, setMlHealth] = useState<{
    checking: boolean;
    isOnline: boolean;
    model: string;
    threshold: number;
  }>({
    checking: true,
    isOnline: false,
    model: syntheticEvaluationData.modelName,
    threshold: syntheticEvaluationData.decisionThreshold
  });

  const fetchHealth = async () => {
    setMlHealth(prev => ({ ...prev, checking: true }));
    try {
      const res = await checkMlApiHealth();
      setMlHealth({
        checking: false,
        isOnline: res.isOnline,
        model: res.data?.model || syntheticEvaluationData.modelName,
        threshold: Number(res.data?.threshold ?? syntheticEvaluationData.decisionThreshold)
      });
    } catch {
      setMlHealth(prev => ({ ...prev, checking: false, isOnline: false }));
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // Format INR currency
  const formatINR = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* 1. MODEL OVERVIEW & LIVE STATUS HEADER */}
      <div className="bg-[#171717] p-5 sm:p-6 rounded-xl border border-[#262626] space-y-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Model Performance & Evaluation
              </h1>
              <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {syntheticEvaluationData.modelName}
              </span>
              <span className="text-[10px] font-mono text-neutral-400 bg-[#0F0F0F] px-2 py-0.5 rounded border border-[#262626]">
                v{syntheticEvaluationData.modelVersion}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              Held-out test performance of the ChargeGuard AI classification engine across {syntheticEvaluationData.heldOutTestSamples.toLocaleString('en-IN')} evaluation samples.
            </p>
          </div>

          {/* 9. Live Model Status Strip */}
          <div className="flex items-center gap-2 flex-wrap self-start lg:self-auto">
            {mlHealth.checking ? (
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-neutral-800 text-neutral-400 border border-neutral-700 flex items-center gap-1.5 font-mono">
                <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
                Checking ML API...
              </span>
            ) : mlHealth.isOnline ? (
              <span className="text-[11px] font-bold px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                ML Status: LIVE / CONNECTED
              </span>
            ) : (
              <span className="text-[11px] font-bold px-3 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 flex items-center gap-1.5 font-mono">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                ML Status: OFFLINE
              </span>
            )}

            <div className="flex items-center gap-1.5 bg-[#0F0F0F] border border-[#262626] px-2.5 py-1 rounded-lg text-xs font-mono text-neutral-300">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              <span>Inference: <strong className="text-white">{syntheticEvaluationData.inferenceEngine}</strong></span>
            </div>

            <button
              type="button"
              onClick={fetchHealth}
              title="Refresh ML health status"
              className="p-1 rounded-lg bg-[#0F0F0F] hover:bg-[#262626] text-neutral-400 hover:text-white border border-[#262626] transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Overview Parameters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-3 border-t border-[#262626] text-xs">
          <div className="p-2.5 rounded-lg bg-[#0F0F0F] border border-[#262626]">
            <span className="text-[10px] text-neutral-500 block uppercase font-mono">Model</span>
            <strong className="text-neutral-200 font-mono text-[11px] truncate block" title={syntheticEvaluationData.modelName}>
              HistGradientBoosting
            </strong>
          </div>
          <div className="p-2.5 rounded-lg bg-[#0F0F0F] border border-[#262626]">
            <span className="text-[10px] text-neutral-500 block uppercase font-mono">Input Features</span>
            <strong className="text-white font-mono text-sm">{syntheticEvaluationData.featureCount} Features</strong>
          </div>
          <div className="p-2.5 rounded-lg bg-[#0F0F0F] border border-[#262626]">
            <span className="text-[10px] text-neutral-500 block uppercase font-mono">Decision Threshold</span>
            <strong className="text-amber-400 font-mono text-sm">{syntheticEvaluationData.decisionThreshold.toFixed(2)}</strong>
          </div>
          <div className="p-2.5 rounded-lg bg-[#0F0F0F] border border-[#262626]">
            <span className="text-[10px] text-neutral-500 block uppercase font-mono">Training Samples</span>
            <strong className="text-neutral-200 font-mono text-sm">{syntheticEvaluationData.trainingSamples.toLocaleString('en-IN')}</strong>
          </div>
          <div className="p-2.5 rounded-lg bg-[#0F0F0F] border border-[#262626]">
            <span className="text-[10px] text-neutral-500 block uppercase font-mono">Held-out Test Samples</span>
            <strong className="text-neutral-200 font-mono text-sm">{syntheticEvaluationData.heldOutTestSamples.toLocaleString('en-IN')}</strong>
          </div>
          <div className="p-2.5 rounded-lg bg-[#0F0F0F] border border-[#262626]">
            <span className="text-[10px] text-neutral-500 block uppercase font-mono">Dataset Type</span>
            <strong className="text-neutral-300 font-mono text-[11px] truncate block" title={syntheticEvaluationData.datasetType}>
              Synthetic Demo
            </strong>
          </div>
        </div>

        {/* 11. Prominent Truthfulness & Synthetic Demonstration Disclaimer */}
        <div className="p-3.5 rounded-lg bg-amber-500/5 border border-amber-500/25 text-xs text-neutral-300 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <strong className="text-amber-400 font-semibold">Synthetic Demonstration Results:</strong>
              <span className="text-[11px] font-mono px-2 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                Held-out Synthetic Test Results (N = 4,000)
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-neutral-400">
              Synthetic demonstration results — not production Razorpay performance. The evaluation metrics and confusion matrix below reflect model behavior on a curated synthetic benchmark designed to assess risk discrimination and operational cost trade-offs under class imbalance.
            </p>
          </div>
        </div>
      </div>

      {/* 2. KEY PERFORMANCE METRICS (6 Cards with plain-English explanations) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-500" />
            Key Performance Metrics (Operating Threshold {syntheticEvaluationData.decisionThreshold.toFixed(2)})
          </h2>
          <span className="text-[11px] font-mono text-neutral-400">
            Held-out Test Set (N = {syntheticEvaluationData.heldOutTestSamples.toLocaleString('en-IN')})
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
          {/* Accuracy */}
          <div className="bg-[#171717] p-4 rounded-xl border border-[#262626] flex flex-col justify-between hover:border-neutral-700 transition-colors">
            <div>
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">Accuracy</span>
              <div className="text-2xl sm:text-3xl font-bold text-white font-mono mt-1">
                {syntheticEvaluationData.metrics.accuracyPercent.toFixed(2)}%
              </div>
            </div>
            <p className="text-[11px] text-neutral-400 mt-2.5 leading-relaxed border-t border-[#262626] pt-2">
              Overall percentage of predictions that were correct.
            </p>
          </div>

          {/* Precision */}
          <div className="bg-[#171717] p-4 rounded-xl border border-[#262626] flex flex-col justify-between hover:border-neutral-700 transition-colors">
            <div>
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">Precision</span>
              <div className="text-2xl sm:text-3xl font-bold text-amber-400 font-mono mt-1">
                {syntheticEvaluationData.metrics.precisionPercent.toFixed(2)}%
              </div>
            </div>
            <p className="text-[11px] text-neutral-400 mt-2.5 leading-relaxed border-t border-[#262626] pt-2">
              Of transactions flagged as chargeback-risk, the percentage that were actually chargebacks.
            </p>
          </div>

          {/* Recall */}
          <div className="bg-[#171717] p-4 rounded-xl border border-[#262626] flex flex-col justify-between hover:border-neutral-700 transition-colors">
            <div>
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">Recall</span>
              <div className="text-2xl sm:text-3xl font-bold text-emerald-400 font-mono mt-1">
                {syntheticEvaluationData.metrics.recallPercent.toFixed(2)}%
              </div>
            </div>
            <p className="text-[11px] text-neutral-400 mt-2.5 leading-relaxed border-t border-[#262626] pt-2">
              Percentage of actual chargebacks detected by the model.
            </p>
          </div>

          {/* F1 Score */}
          <div className="bg-[#171717] p-4 rounded-xl border border-[#262626] flex flex-col justify-between hover:border-neutral-700 transition-colors">
            <div>
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">F1 Score</span>
              <div className="text-2xl sm:text-3xl font-bold text-amber-300 font-mono mt-1">
                {syntheticEvaluationData.metrics.f1ScorePercent.toFixed(2)}%
              </div>
            </div>
            <p className="text-[11px] text-neutral-400 mt-2.5 leading-relaxed border-t border-[#262626] pt-2">
              Balance between precision and recall.
            </p>
          </div>

          {/* ROC-AUC */}
          <div className="bg-[#171717] p-4 rounded-xl border border-[#262626] flex flex-col justify-between hover:border-neutral-700 transition-colors">
            <div>
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">ROC-AUC</span>
              <div className="text-2xl sm:text-3xl font-bold text-blue-400 font-mono mt-1">
                {syntheticEvaluationData.metrics.rocAucPercent.toFixed(2)}%
              </div>
            </div>
            <p className="text-[11px] text-neutral-400 mt-2.5 leading-relaxed border-t border-[#262626] pt-2">
              How well the model separates chargeback and non-chargeback transactions.
            </p>
          </div>

          {/* False Positive Rate */}
          <div className="bg-[#171717] p-4 rounded-xl border border-[#262626] flex flex-col justify-between hover:border-neutral-700 transition-colors">
            <div>
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">False Positive Rate</span>
              <div className="text-2xl sm:text-3xl font-bold text-neutral-300 font-mono mt-1">
                {syntheticEvaluationData.metrics.falsePositiveRatePercent.toFixed(2)}%
              </div>
            </div>
            <p className="text-[11px] text-neutral-400 mt-2.5 leading-relaxed border-t border-[#262626] pt-2">
              Percentage of legitimate transactions incorrectly flagged.
            </p>
          </div>
        </div>
      </div>

      {/* 3. CONFUSION MATRIX & 5. FALSE POSITIVE COST */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 3. Confusion Matrix (2x2) */}
        <div className="lg:col-span-7 bg-[#171717] p-5 sm:p-6 rounded-xl border border-[#262626] space-y-4">
          <div className="flex items-center justify-between border-b border-[#262626] pb-3">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-500" />
                Confusion Matrix (Held-out Test Set, N = 4,000)
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Evaluation results partitioned at decision threshold {syntheticEvaluationData.decisionThreshold.toFixed(2)}
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#0F0F0F] text-amber-400 border border-[#262626]">
              Cutoff: 0.20
            </span>
          </div>

          {/* 2x2 Matrix Table Layout */}
          <div className="overflow-x-auto">
            <div className="min-w-[480px]">
              {/* Column Headers: Actual Class */}
              <div className="grid grid-cols-12 gap-2 text-xs font-semibold mb-2">
                <div className="col-span-4 text-neutral-500 font-mono text-[11px] flex items-center">
                  Prediction \ Reality
                </div>
                <div className="col-span-4 p-2 rounded bg-[#0F0F0F] border border-[#262626] text-center text-neutral-300">
                  <span className="text-[10px] text-neutral-500 block uppercase font-mono">Actual</span>
                  Non-Chargeback ({syntheticEvaluationData.confusionMatrix.actualNonChargebackTotal.toLocaleString('en-IN')})
                </div>
                <div className="col-span-4 p-2 rounded bg-[#0F0F0F] border border-[#262626] text-center text-red-300">
                  <span className="text-[10px] text-neutral-500 block uppercase font-mono">Actual</span>
                  Chargeback ({syntheticEvaluationData.confusionMatrix.actualChargebackTotal.toLocaleString('en-IN')})
                </div>
              </div>

              {/* Row 1: Predicted Non-Risk */}
              <div className="grid grid-cols-12 gap-2 text-xs mb-2">
                <div className="col-span-4 p-3 rounded-lg bg-[#0F0F0F] border border-[#262626] flex flex-col justify-center">
                  <strong className="text-white font-medium">Predicted Non-Risk</strong>
                  <span className="text-[10px] text-neutral-500 font-mono">Prob &lt; 0.20 (Approved)</span>
                </div>

                {/* True Negative = 1861 */}
                <div className="col-span-4 p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">True Negative (TN)</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-white font-mono my-1">
                    {syntheticEvaluationData.confusionMatrix.trueNegatives.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-emerald-300/80">
                    Legitimate orders approved with zero friction
                  </span>
                </div>

                {/* False Negative = 302 */}
                <div className="col-span-4 p-3.5 rounded-lg bg-red-950/25 border border-red-500/35 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">False Negative (FN)</span>
                    <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-white font-mono my-1">
                    {syntheticEvaluationData.confusionMatrix.falseNegatives.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-red-300/80">
                    Chargebacks missed as false approvals
                  </span>
                </div>
              </div>

              {/* Row 2: Predicted Risk */}
              <div className="grid grid-cols-12 gap-2 text-xs">
                <div className="col-span-4 p-3 rounded-lg bg-[#0F0F0F] border border-[#262626] flex flex-col justify-center">
                  <strong className="text-amber-400 font-medium">Predicted Risk</strong>
                  <span className="text-[10px] text-neutral-500 font-mono">Prob &ge; 0.20 (Flagged)</span>
                </div>

                {/* False Positive = 1121 */}
                <div className="col-span-4 p-3.5 rounded-lg bg-amber-950/20 border border-amber-500/30 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">False Positive (FP)</span>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-white font-mono my-1">
                    {syntheticEvaluationData.confusionMatrix.falsePositives.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-amber-300/80">
                    Legitimate buyers flagged for review
                  </span>
                </div>

                {/* True Positive = 716 */}
                <div className="col-span-4 p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">True Positive (TP)</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-white font-mono my-1">
                    {syntheticEvaluationData.confusionMatrix.truePositives.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-emerald-300/80">
                    Actual chargebacks caught by model
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Operational significance explanation */}
          <div className="p-3.5 rounded-lg bg-[#0F0F0F] border border-[#262626] text-xs space-y-1.5">
            <strong className="text-neutral-200 block text-[11px]">
              Why False Positives and False Negatives Matter:
            </strong>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              In chargeback risk management, <strong className="text-red-400">False Negatives (302 missed)</strong> result in direct revenue loss, lost merchandise, and payment network dispute fines. Conversely, <strong className="text-amber-400">False Positives (1,121 flagged)</strong> introduce review friction, potential customer churn, and operational verification overhead. Balancing both requires careful threshold alignment.
            </p>
          </div>
        </div>

        {/* 5. FALSE POSITIVE COST & 6. DATASET INFORMATION */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          
          {/* False Positive Friction Cost Card */}
          <div className="bg-[#171717] p-5 rounded-xl border border-[#262626] space-y-4">
            <div className="flex items-center justify-between border-b border-[#262626] pb-3">
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <Calculator className="w-4 h-4 text-amber-500" />
                False Positive Friction Cost
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                Operating Threshold 0.20
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-lg bg-[#0F0F0F] border border-[#262626]">
                <span className="text-[10px] text-neutral-500 block uppercase font-mono">False Positives</span>
                <strong className="text-xl font-bold font-mono text-amber-400 mt-0.5 block">
                  {syntheticEvaluationData.frictionCost.falsePositivesCount.toLocaleString('en-IN')}
                </strong>
                <span className="text-[9px] text-neutral-500">Flagged clean txns</span>
              </div>

              <div className="p-3 rounded-lg bg-[#0F0F0F] border border-[#262626]">
                <span className="text-[10px] text-neutral-500 block uppercase font-mono">Assumed Cost / FP</span>
                <strong className="text-xl font-bold font-mono text-white mt-0.5 block">
                  {formatINR(syntheticEvaluationData.frictionCost.assumedCostPerFpINR)}
                </strong>
                <span className="text-[9px] text-amber-400 font-semibold block truncate" title="Assumption for demonstration">
                  Demo Assumption
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[#0F0F0F] border border-[#262626]">
                <span className="text-[10px] text-neutral-500 block uppercase font-mono">Friction Cost</span>
                <strong className="text-xl font-bold font-mono text-amber-300 mt-0.5 block">
                  {formatINR(syntheticEvaluationData.frictionCost.estimatedFrictionCostINR)}
                </strong>
                <span className="text-[9px] text-neutral-500">1,121 &times; ₹150</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#0F0F0F] border border-[#262626] text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 text-[11px] font-semibold">
                <Info className="w-3.5 h-3.5" />
                <span>Assumption for demonstration</span>
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                A false positive can cause unnecessary review or customer friction, so threshold selection should consider both fraud loss and legitimate-customer impact. This ₹150 benchmark is a pedagogical assumption for demonstration and not an actual Razorpay operational figure.
              </p>
            </div>
          </div>

          {/* 6. Dataset Information Card */}
          <div className="bg-[#171717] p-5 rounded-xl border border-[#262626] space-y-3">
            <div className="flex items-center justify-between border-b border-[#262626] pb-2.5">
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <Database className="w-4 h-4 text-neutral-400" />
                Dataset Information
              </h3>
              <span className="text-[10px] font-mono text-neutral-400">Benchmark Split</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[#0F0F0F] border border-[#262626]">
                <span className="text-[10px] text-neutral-500 block font-mono">Total Synthetic</span>
                <strong className="text-sm font-bold font-mono text-white">
                  {syntheticEvaluationData.totalSyntheticTransactions.toLocaleString('en-IN')}
                </strong>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0F0F0F] border border-[#262626]">
                <span className="text-[10px] text-neutral-500 block font-mono">Training Set</span>
                <strong className="text-sm font-bold font-mono text-neutral-200">
                  {syntheticEvaluationData.trainingSamples.toLocaleString('en-IN')}
                </strong>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0F0F0F] border border-[#262626]">
                <span className="text-[10px] text-neutral-500 block font-mono">Held-out Test</span>
                <strong className="text-sm font-bold font-mono text-amber-400">
                  {syntheticEvaluationData.heldOutTestSamples.toLocaleString('en-IN')}
                </strong>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0F0F0F] border border-[#262626]">
                <span className="text-[10px] text-neutral-500 block font-mono">Chargeback Rate</span>
                <strong className="text-sm font-bold font-mono text-red-400">
                  {syntheticEvaluationData.syntheticChargebackRatePercent}%
                </strong>
              </div>
            </div>

            <div className="text-[10px] text-neutral-500 italic">
              Synthetic demonstration results — not production Razorpay performance.
            </div>
          </div>
        </div>
      </div>

      {/* 4. THRESHOLD ANALYSIS (Table and Trade-off Curve) */}
      <div className="bg-[#171717] p-5 sm:p-6 rounded-xl border border-[#262626] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#262626] pb-3">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-500" />
              Threshold Analysis & Evaluation Comparison
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Held-out test performance across candidate probability decision boundaries
            </p>
          </div>
          <span className="text-xs text-neutral-400 bg-[#0F0F0F] px-3 py-1 rounded-lg border border-[#262626] self-start sm:self-auto font-mono">
            Selected Operating Threshold: <strong className="text-amber-400">0.20</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Threshold Table */}
          <div className="lg:col-span-7 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#262626] text-neutral-400 text-[11px] font-mono">
                  <th className="py-2.5 px-3">Threshold</th>
                  <th className="py-2.5 px-3">Recall</th>
                  <th className="py-2.5 px-3">Precision</th>
                  <th className="py-2.5 px-3">F1</th>
                  <th className="py-2.5 px-3">False Pos Rate</th>
                  <th className="py-2.5 px-3 text-right">Estimated FP Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {syntheticEvaluationData.thresholdAnalysis.map((row) => (
                  <tr
                    key={row.threshold}
                    className={`transition-colors font-mono ${
                      row.isOperatingPoint
                        ? 'bg-amber-500/10 text-white font-bold border-l-2 border-amber-500'
                        : 'hover:bg-[#0F0F0F] text-neutral-300'
                    }`}
                  >
                    <td className="py-3 px-3 flex items-center gap-2">
                      <span>{row.threshold.toFixed(2)}</span>
                      {row.isOperatingPoint && (
                        <span className="text-[9px] font-sans px-2 py-0.5 rounded bg-amber-500 text-black font-bold uppercase tracking-wider">
                          Selected Operating Threshold
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-emerald-400 font-semibold">
                      {row.recall.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-amber-300 font-semibold">
                      {row.precision.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-neutral-200">
                      {row.f1.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-neutral-400">
                      {row.fpr.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-white">
                      {formatINR(row.estimatedFpCostINR)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Precision vs Recall Curve Chart */}
          <div className="lg:col-span-5 bg-[#0F0F0F] p-4 rounded-xl border border-[#262626]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white">Trade-off Curve: Recall vs. Precision</span>
              <span className="text-[10px] font-mono text-neutral-400">ROC-AUC: 73.43%</span>
            </div>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={syntheticEvaluationData.thresholdAnalysis}
                  margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis
                    dataKey="threshold"
                    stroke="#737373"
                    fontSize={10}
                    tickFormatter={(v) => `${v.toFixed(2)}`}
                  />
                  <YAxis
                    stroke="#737373"
                    fontSize={10}
                    domain={[0, 1]}
                    tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '8px', fontSize: '11px', color: '#fff' }}
                    formatter={(val: any, name: any) => [`${(Number(val) * 100).toFixed(0)}%`, name]}
                    labelFormatter={(label) => `Threshold: ${Number(label).toFixed(2)}`}
                  />
                  <ReferenceLine x={0.20} stroke="#F59E0B" strokeDasharray="3 3" label={{ value: '0.20 Cutoff', fill: '#F59E0B', fontSize: 10 }} />
                  <Line type="monotone" dataKey="recall" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} name="Recall (Catch Rate)" />
                  <Line type="monotone" dataKey="precision" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} name="Precision" />
                  <Line type="monotone" dataKey="fpr" stroke="#9CA3AF" strokeWidth={1.5} strokeDasharray="2 2" dot={false} name="False Positive Rate" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-4 text-[10px] text-neutral-400 mt-2 font-mono">
              <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-emerald-500 inline-block" /> Recall</span>
              <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-amber-500 inline-block" /> Precision</span>
              <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-neutral-400 inline-block" /> FP Rate</span>
            </div>
          </div>
        </div>

        {/* Operating boundary explanation */}
        <div className="p-3.5 rounded-lg bg-[#0F0F0F] border border-[#262626] text-xs space-y-1">
          <p className="text-[11px] text-neutral-300 leading-relaxed">
            <strong className="text-amber-400">Threshold Rationale:</strong> The 0.20 threshold prioritizes higher recall while controlling false-positive friction compared with more aggressive thresholds. Note that 0.20 is not universally optimal: merchants with high manual-review costs may prefer 0.25–0.30, whereas high-margin digital goods with irreversible fulfillment may prefer lower cutoffs.
          </p>
        </div>
      </div>

      {/* 7. MODEL INTERPRETATION ("What these results mean") */}
      <div className="bg-[#171717] p-5 sm:p-6 rounded-xl border border-[#262626] space-y-4">
        <div className="flex items-center gap-2 border-b border-[#262626] pb-3">
          <ShieldCheck className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-bold text-white tracking-tight">What these results mean</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-lg bg-[#0F0F0F] border border-[#262626] space-y-1">
            <strong className="text-emerald-400 block font-semibold text-[11px]">
              1. Recall of 70.33%
            </strong>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Means the model detected about 70% of chargeback examples in the held-out test set (716 out of 1,018 actual chargebacks intercepted).
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0F0F0F] border border-[#262626] space-y-1">
            <strong className="text-amber-400 block font-semibold text-[11px]">
              2. Precision of 38.98%
            </strong>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Means many flagged transactions were legitimate (1,121 false positives vs 716 true positives), so manual review overhead and customer checkout friction need to be actively managed.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0F0F0F] border border-[#262626] space-y-1">
            <strong className="text-neutral-200 block font-semibold text-[11px]">
              3. Decision-Support Role
            </strong>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              The model should be treated as a risk-ranking and decision-support system rather than a perfect fraud detector. Predictions inform step-up authentication (3DS challenge) and dispute preparation rather than silent cancellations.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0F0F0F] border border-[#262626] space-y-1">
            <strong className="text-neutral-200 block font-semibold text-[11px]">
              4. Inherent Operational Trade-Off
            </strong>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Threshold selection involves a trade-off between detecting more chargebacks and creating more false positives. Lower cutoffs capture more fraud but hold more legitimate buyers.
            </p>
          </div>
        </div>
      </div>

      {/* 8. FEATURE SIGNALS (The 11 input features) */}
      <div className="bg-[#171717] p-5 sm:p-6 rounded-xl border border-[#262626] space-y-4">
        <div className="flex items-center justify-between border-b border-[#262626] pb-3">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <ListFilter className="w-4 h-4 text-amber-500" />
              Model Input Feature Signals (11 Evaluated Features)
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Verified feature vectors passed into the trained HistGradientBoostingClassifier inference pipeline
            </p>
          </div>
          <span className="text-[11px] font-mono text-neutral-400 bg-[#0F0F0F] px-2.5 py-1 rounded-lg border border-[#262626]">
            Total: 11 Features
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {syntheticEvaluationData.features.map((feat, index) => (
            <div
              key={feat.name}
              className="p-3.5 rounded-lg bg-[#0F0F0F] border border-[#262626] flex flex-col justify-between space-y-2 hover:border-neutral-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-mono text-xs font-bold text-amber-400 truncate">
                    {index + 1}. {feat.name}
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700 shrink-0">
                    {feat.dataType}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  {feat.description}
                </p>
              </div>

              <div className="pt-2 border-t border-[#262626]/60 flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                <span>Signal Category:</span>
                <span className="text-neutral-400 font-medium">{feat.category}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 rounded-lg bg-[#0F0F0F] border border-[#262626] text-[11px] text-neutral-400">
          <Info className="w-3.5 h-3.5 text-neutral-500 inline mr-1.5 -mt-0.5" />
          Feature descriptions reflect the official input signature of the model. No speculative or unverified feature weights are claimed.
        </div>
      </div>
    </div>
  );
};
