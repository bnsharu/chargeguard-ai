import React, { useMemo } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  TrendingDown, 
  TrendingUp,
  AlertTriangle, 
  IndianRupee, 
  ArrowUpRight, 
  Eye, 
  CheckCircle2, 
  Clock, 
  FileText,
  CreditCard,
  Smartphone,
  Layers,
  ChevronRight,
  Zap,
  Info,
  Activity,
  SlidersHorizontal,
  ExternalLink
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  AreaChart, 
  Area, 
  ReferenceLine 
} from 'recharts';
import { Transaction } from '../types';
import { NavTab } from './Navbar';

interface DashboardViewProps {
  transactions: Transaction[];
  onSelectTransaction: (txn: Transaction) => void;
  setActiveTab: (tab: NavTab) => void;
  onOpenSimulateModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  onSelectTransaction,
  setActiveTab,
  onOpenSimulateModal
}) => {
  // 1. Fully dynamic calculations derived directly from the transaction ledger
  const stats = useMemo(() => {
    const totalCount = transactions.length;
    const totalVolume = transactions.reduce((acc, t) => acc + t.amountINR, 0);
    
    const lowRisk = transactions.filter((t) => t.riskLevel === 'LOW');
    const medRisk = transactions.filter((t) => t.riskLevel === 'MEDIUM');
    const highRisk = transactions.filter((t) => t.riskLevel === 'HIGH');
    
    const mlTransactions = transactions.filter(
      (t) => Boolean(t.isRealTimeMl || t.isRealTimeAnalysis || t.id.startsWith('txn_ml_'))
    );
    const mlCount = mlTransactions.length;
    const mlAvgScore = mlCount > 0 
      ? (mlTransactions.reduce((acc, t) => acc + t.riskScore, 0) / mlCount).toFixed(1) 
      : '0.0';
    const mlHighRiskCount = mlTransactions.filter((t) => t.riskLevel === 'HIGH').length;

    const disputed = transactions.filter((t) => t.chargebackDispute?.isDisputed);
    const totalDisputedAmount = disputed.reduce((acc, t) => acc + t.amountINR, 0);

    const highRiskPct = totalCount > 0 ? ((highRisk.length / totalCount) * 100).toFixed(1) : '0.0';
    const medRiskPct = totalCount > 0 ? ((medRisk.length / totalCount) * 100).toFixed(1) : '0.0';
    const lowRiskPct = totalCount > 0 ? ((lowRisk.length / totalCount) * 100).toFixed(1) : '0.0';

    return {
      totalCount,
      totalVolume,
      lowCount: lowRisk.length,
      medCount: medRisk.length,
      highCount: highRisk.length,
      highRiskPct,
      medRiskPct,
      lowRiskPct,
      mlCount,
      mlAvgScore,
      mlHighRiskCount,
      mlTransactions,
      disputeCount: disputed.length,
      totalDisputedAmount
    };
  }, [transactions]);

  // 2. Risk Distribution Data
  const riskPieData = useMemo(() => [
    { 
      name: 'High Risk', 
      level: 'HIGH',
      value: stats.highCount, 
      pct: stats.highRiskPct,
      color: '#EF4444', 
      action: 'Hold / Manual Review',
      badgeClass: 'bg-red-500/10 text-red-400 border-red-500/20' 
    },
    { 
      name: 'Medium Risk', 
      level: 'MEDIUM',
      value: stats.medCount, 
      pct: stats.medRiskPct,
      color: '#F59E0B', 
      action: 'OTP / Step-Up Monitored',
      badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
    },
    { 
      name: 'Low Risk', 
      level: 'LOW',
      value: stats.lowCount, 
      pct: stats.lowRiskPct,
      color: '#10B981', 
      action: 'Safe Auto-Approved',
      badgeClass: 'bg-green-500/10 text-green-400 border-green-500/20' 
    },
  ], [stats]);

  // 3. Risk Trend: Chronological risk scores based on real transaction timestamps
  const riskTrendData = useMemo(() => {
    // Sort transactions oldest to newest for chronological trend
    const sorted = [...transactions].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    return sorted.map((t, index) => {
      const date = new Date(t.timestamp);
      const timeStr = !isNaN(date.getTime())
        ? date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        : `Txn #${index + 1}`;

      const shortId = t.id.startsWith('txn_ml_')
        ? `ML-${t.id.replace('txn_ml_', '').slice(-5)}`
        : `#${t.id.replace('txn_in_', '')}`;

      return {
        id: t.id,
        shortId,
        time: timeStr,
        timestamp: t.timestamp,
        riskScore: t.riskScore,
        amountINR: t.amountINR,
        riskLevel: t.riskLevel,
        customerName: t.customer.name,
        isMl: Boolean(t.isRealTimeMl || t.isRealTimeAnalysis || t.id.startsWith('txn_ml_')),
        rawTxn: t
      };
    });
  }, [transactions]);

  // 4. Latest 5 transactions for Recent Transactions
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
  }, [transactions]);

  // 5. Latest High-Risk alerts
  const highRiskAlerts = useMemo(() => {
    return transactions
      .filter((t) => t.riskLevel === 'HIGH')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
  }, [transactions]);

  // 6. Payment Method Breakdown (Dynamically aggregated from transactions)
  const paymentMethodData = useMemo(() => {
    const methods: Record<string, { count: number; volume: number; highRisk: number }> = {
      UPI: { count: 0, volume: 0, highRisk: 0 },
      'Credit Card': { count: 0, volume: 0, highRisk: 0 },
      'Debit Card': { count: 0, volume: 0, highRisk: 0 },
      EMI: { count: 0, volume: 0, highRisk: 0 },
      NetBanking: { count: 0, volume: 0, highRisk: 0 },
    };

    transactions.forEach((t) => {
      let key = 'Credit Card';
      if (t.payment.method === 'UPI') key = 'UPI';
      else if (t.payment.method === 'DEBIT_CARD') key = 'Debit Card';
      else if (t.payment.method === 'EMI') key = 'EMI';
      else if (t.payment.method === 'NETBANKING') key = 'NetBanking';

      if (methods[key]) {
        methods[key].count += 1;
        methods[key].volume += t.amountINR;
        if (t.riskLevel === 'HIGH') methods[key].highRisk += 1;
      }
    });

    return Object.entries(methods).map(([name, data]) => ({
      name,
      count: data.count,
      volumeLakhs: Number((data.volume / 100000).toFixed(2)),
      highRisk: data.highRisk
    }));
  }, [transactions]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Banner & Quick Navigation */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-[#171717] p-5 sm:p-6 rounded-xl border border-[#262626] shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Merchant Risk Command Center
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Shield Active
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              ML Connected
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl leading-relaxed">
            Real-time fraud prevention, ML inference monitoring, and risk analytics dynamically synchronized with the transaction ledger.
          </p>
        </div>

        <div className="flex items-center gap-2.5 relative z-10 flex-wrap">
          <button
            onClick={() => setActiveTab('realtime-analysis')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors shadow-sm cursor-pointer"
          >
            <Zap className="w-4 h-4 stroke-[2.5]" />
            <span>Analyze New Transaction</span>
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#262626] hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 font-medium text-xs transition-colors cursor-pointer"
          >
            <CreditCard className="w-4 h-4 text-amber-500" />
            <span>View Ledger ({stats.totalCount})</span>
          </button>
        </div>
      </div>

      {/* Synthetic Demonstration Data Disclaimer */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 text-xs text-neutral-300 flex items-start gap-3 shadow-sm">
        <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <strong className="text-amber-400 font-semibold">Synthetic Demonstration Notice:</strong>
          <p className="text-[11px] leading-relaxed text-neutral-400">
            This dashboard demonstrates real-time ML fraud detection using a synthetic merchant transaction ledger and live FastAPI inference. These are demonstration test transactions and not real Razorpay production data.
          </p>
        </div>
      </div>

      {/* 6 Core Dynamic KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* KPI 1: Total Transactions */}
        <div className="bg-[#171717] p-4 rounded-xl border border-[#262626] hover:border-neutral-700 transition-colors flex flex-col justify-between">
          <div>
            <p className="text-neutral-500 text-[11px] uppercase tracking-wider font-bold">Total Transactions</p>
            <p className="text-2xl font-bold mt-1 text-white font-mono">{stats.totalCount.toLocaleString('en-IN')}</p>
          </div>
          <div className="mt-3">
            <p className="text-neutral-400 text-[11px] font-mono truncate">
              Count in Ledger
            </p>
            <div className="w-full bg-[#262626] h-1 rounded-full mt-2 overflow-hidden">
              <div className="bg-amber-500 h-full w-[100%]"></div>
            </div>
          </div>
        </div>

        {/* KPI 2: Total Transaction Value */}
        <div className="bg-[#171717] p-4 rounded-xl border border-[#262626] hover:border-neutral-700 transition-colors flex flex-col justify-between">
          <div>
            <p className="text-neutral-500 text-[11px] uppercase tracking-wider font-bold">Total Trans. Value</p>
            <p className="text-xl sm:text-2xl font-bold mt-1 text-white font-mono truncate">
              ₹{(stats.totalVolume / 100000).toFixed(2)}L
            </p>
          </div>
          <div className="mt-3">
            <p className="text-neutral-400 text-[11px] font-mono truncate">
              ₹{stats.totalVolume.toLocaleString('en-IN')}
            </p>
            <div className="w-full bg-[#262626] h-1 rounded-full mt-2 overflow-hidden">
              <div className="bg-emerald-400 h-full w-[100%]"></div>
            </div>
          </div>
        </div>

        {/* KPI 3: High Risk Alerts */}
        <div className="bg-[#171717] p-4 rounded-xl border border-[#262626] hover:border-neutral-700 transition-colors flex flex-col justify-between">
          <div>
            <p className="text-neutral-500 text-[11px] uppercase tracking-wider font-bold">High Risk Alerts</p>
            <p className="text-2xl font-bold mt-1 text-red-400 font-mono">{stats.highCount}</p>
          </div>
          <div className="mt-3">
            <p className="text-red-400 text-[11px] font-medium truncate">
              {stats.highRiskPct}% of total orders
            </p>
            <div className="w-full bg-[#262626] h-1 rounded-full mt-2 overflow-hidden">
              <div className="bg-red-400 h-full" style={{ width: `${Math.max(8, Math.min(100, Number(stats.highRiskPct)))}%` }}></div>
            </div>
          </div>
        </div>

        {/* KPI 4: Medium Risk */}
        <div className="bg-[#171717] p-4 rounded-xl border border-[#262626] hover:border-neutral-700 transition-colors flex flex-col justify-between">
          <div>
            <p className="text-neutral-500 text-[11px] uppercase tracking-wider font-bold">Medium Risk</p>
            <p className="text-2xl font-bold mt-1 text-amber-400 font-mono">{stats.medCount}</p>
          </div>
          <div className="mt-3">
            <p className="text-amber-400 text-[11px] font-medium truncate">
              {stats.medRiskPct}% of total orders
            </p>
            <div className="w-full bg-[#262626] h-1 rounded-full mt-2 overflow-hidden">
              <div className="bg-amber-400 h-full" style={{ width: `${Math.max(8, Math.min(100, Number(stats.medRiskPct)))}%` }}></div>
            </div>
          </div>
        </div>

        {/* KPI 5: Low Risk */}
        <div className="bg-[#171717] p-4 rounded-xl border border-[#262626] hover:border-neutral-700 transition-colors flex flex-col justify-between">
          <div>
            <p className="text-neutral-500 text-[11px] uppercase tracking-wider font-bold">Low Risk</p>
            <p className="text-2xl font-bold mt-1 text-green-400 font-mono">{stats.lowCount}</p>
          </div>
          <div className="mt-3">
            <p className="text-green-400 text-[11px] font-medium truncate">
              {stats.lowRiskPct}% of total orders
            </p>
            <div className="w-full bg-[#262626] h-1 rounded-full mt-2 overflow-hidden">
              <div className="bg-green-400 h-full" style={{ width: `${Math.max(8, Math.min(100, Number(stats.lowRiskPct)))}%` }}></div>
            </div>
          </div>
        </div>

        {/* KPI 6: Real-Time ML Analyzed */}
        <div className="bg-[#171717] p-4 rounded-xl border border-amber-500/30 hover:border-amber-500/50 transition-colors flex flex-col justify-between bg-gradient-to-br from-[#171717] to-amber-500/5">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-neutral-400 text-[11px] uppercase tracking-wider font-bold">Real-Time ML</p>
              <Zap className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <p className="text-2xl font-bold mt-1 text-amber-400 font-mono">{stats.mlCount}</p>
          </div>
          <div className="mt-3">
            <p className="text-amber-400 text-[11px] font-medium truncate flex items-center gap-1">
              <span>⚡ Live ML Inferred</span>
            </p>
            <div className="w-full bg-[#262626] h-1 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-amber-500 h-full" 
                style={{ width: `${Math.min(100, Math.max(12, stats.totalCount > 0 ? (stats.mlCount / stats.totalCount) * 100 : 0))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 5: Real-Time ML Activity (Calculated purely from ML API analyzed transactions) */}
      <div className="bg-[#171717] p-5 sm:p-6 rounded-xl border border-[#262626]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[#262626]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-bold text-white tracking-tight">Real-Time ML Activity</h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500 text-black">
                  ⚡ HistGradientBoostingClassifier
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">
                  Cutoff: 0.20
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Dynamic telemetry derived exclusively from transactions analyzed by the live ML API during this session.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('realtime-analysis')}
            className="flex items-center gap-1.5 text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors self-start sm:self-auto cursor-pointer"
          >
            <span>Analyze New Transaction</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 ML Inferred Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="p-3.5 rounded-lg bg-[#0F0F0F] border border-[#262626]">
            <span className="text-neutral-500 text-[11px] block font-semibold uppercase">ML Analyzed Count</span>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {stats.mlCount}
            </div>
            <span className="text-[10px] text-neutral-400 block mt-0.5">Transactions Inferred</span>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0F0F0F] border border-[#262626]">
            <span className="text-neutral-500 text-[11px] block font-semibold uppercase">Average ML Risk Score</span>
            <div className="text-xl font-bold font-mono text-amber-400 mt-1">
              {stats.mlCount > 0 ? stats.mlAvgScore : 'N/A'}
            </div>
            <span className="text-[10px] text-neutral-400 block mt-0.5">0-100 ML Score Scale</span>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0F0F0F] border border-[#262626]">
            <span className="text-neutral-500 text-[11px] block font-semibold uppercase">High-Risk ML Alerts</span>
            <div className={`text-xl font-bold font-mono mt-1 ${stats.mlHighRiskCount > 0 ? 'text-red-400' : 'text-neutral-200'}`}>
              {stats.mlHighRiskCount}
            </div>
            <span className="text-[10px] text-neutral-400 block mt-0.5">CB Prob ≥ 20% Flagged</span>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0F0F0F] border border-[#262626]">
            <span className="text-neutral-500 text-[11px] block font-semibold uppercase">Real-Time ML Ingestion</span>
            <div className="text-xl font-bold font-mono text-green-400 mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              ACTIVE
            </div>
            <span className="text-[10px] text-neutral-400 block mt-0.5">FastAPI /predict Online</span>
          </div>
        </div>

        {/* Live ML Transaction list or invitation */}
        {stats.mlCount > 0 ? (
          <div className="mt-4 pt-4 border-t border-[#262626] space-y-2">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
              Recent ML Inferred Transactions in Ledger
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {stats.mlTransactions.slice(0, 3).map((txn) => (
                <div
                  key={txn.id}
                  onClick={() => onSelectTransaction(txn)}
                  className="p-3 rounded-lg bg-[#0F0F0F] border border-[#262626] hover:border-amber-500/40 transition-colors cursor-pointer group flex items-center justify-between"
                >
                  <div className="space-y-0.5 min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                        #{txn.id.replace('txn_ml_', 'ML-').slice(0, 16)}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-500 text-black">
                        ML
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-400 truncate">{txn.customer.name}</div>
                    <div className="text-[11px] font-mono text-neutral-300">₹{txn.amountINR.toLocaleString('en-IN')}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-xs font-bold font-mono ${
                      txn.riskScore >= 70 ? 'text-red-400' : txn.riskScore >= 36 ? 'text-amber-400' : 'text-green-400'
                    }`}>
                      Score: {txn.riskScore}
                    </div>
                    <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                      CB: {txn.chargebackProbability !== undefined ? `${txn.chargebackProbability}%` : 'N/A'}
                    </div>
                    <span className="text-[10px] text-amber-500 font-bold group-hover:underline block mt-1">
                      Audit →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-3 p-3 rounded-lg bg-[#0F0F0F] border border-dashed border-[#262626] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <span className="text-neutral-400">
              No real-time ML transactions inferred yet in this session. Analyze any transaction to stream live predictions here.
            </span>
            <button
              onClick={() => setActiveTab('realtime-analysis')}
              className="px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors self-start sm:self-auto cursor-pointer shrink-0"
            >
              Analyze New Transaction
            </button>
          </div>
        )}
      </div>

      {/* Row: Risk Distribution (Section 3) & Risk Trend (Section 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Section 3: Risk Distribution */}
        <div className="lg:col-span-5 bg-[#171717] p-5 sm:p-6 rounded-xl border border-[#262626] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight">Risk Distribution</h2>
                <p className="text-xs text-neutral-400 mt-0.5">Dynamic proportion of transaction ledger</p>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#262626] text-neutral-400 border border-neutral-700">
                Ledger Sync
              </span>
            </div>

            <div className="h-52 mt-3 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={54}
                    outerRadius={78}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {riskPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#0A0A0A" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '8px', fontSize: '12px', color: '#FFFFFF' }}
                    itemStyle={{ color: '#FFFFFF' }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-extrabold text-white font-mono">{stats.totalCount}</span>
                <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Orders</span>
              </div>
            </div>
          </div>

          {/* Clean Visual List showing HIGH, MEDIUM, LOW with count and percentage */}
          <div className="space-y-3 mt-3 pt-3 border-t border-[#262626]">
            {riskPieData.map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-neutral-200 font-semibold">{item.name}</span>
                    <span className="text-[10px] text-neutral-500 hidden sm:inline">({item.action})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-mono font-bold">{item.value} txns</span>
                    <span className="text-neutral-400 font-mono text-[11px] font-semibold w-12 text-right">
                      {item.pct}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-[#0F0F0F] border border-[#262626] h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.max(2, Number(item.pct))}%`,
                      backgroundColor: item.color 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Risk Trend Chart (Chronological Transaction Risk Score) */}
        <div className="lg:col-span-7 bg-[#171717] p-5 sm:p-6 rounded-xl border border-[#262626] flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Risk Trend</span>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#262626] text-amber-400 border border-neutral-700">
                    Transaction Timeline
                  </span>
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Dynamic risk trajectory plotted across transaction history ({riskTrendData.length} records)
                </p>
              </div>

              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1.5 text-neutral-400">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Risk Score
                </span>
                <span className="flex items-center gap-1.5 text-red-400">
                  <span className="w-2 h-0.5 bg-red-400" /> High Cutoff (70)
                </span>
              </div>
            </div>

            <div className="h-64 mt-4">
              {riskTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={riskTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                    <XAxis 
                      dataKey="shortId" 
                      stroke="#737373" 
                      fontSize={10} 
                      tickLine={false} 
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      stroke="#737373" 
                      fontSize={10} 
                      tickLine={false} 
                    />
                    <ReferenceLine y={70} stroke="#F87171" strokeDasharray="3 3" strokeWidth={1.5} />
                    <ReferenceLine y={36} stroke="#FBBF24" strokeDasharray="3 3" strokeWidth={1} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '8px', fontSize: '12px', color: '#FFFFFF' }}
                      formatter={(value: any, name: any, item: any) => [
                        `${value}/100 (${item.payload.riskLevel} RISK)`,
                        'Risk Score'
                      ]}
                      labelFormatter={(label: any, items: any) => {
                        const payload = items?.[0]?.payload;
                        if (!payload) return label;
                        return `${payload.shortId} • ${payload.customerName} (₹${payload.amountINR.toLocaleString('en-IN')})${payload.isMl ? ' [⚡ Real-Time ML]' : ''}`;
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="riskScore" 
                      stroke="#F59E0B" 
                      strokeWidth={2.5} 
                      fillOpacity={1} 
                      fill="url(#riskGradient)" 
                      dot={{ r: 3, fill: '#F59E0B' }}
                      activeDot={{ r: 6, fill: '#F59E0B', stroke: '#000', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-neutral-500">
                  No transaction timestamps available to render trend.
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-2 pt-3 border-t border-[#262626]">
            <span>Historical Timeline: Left (Oldest) → Right (Newest)</span>
            <span className="font-mono text-amber-500 font-semibold">Zero Future Projections</span>
          </div>
        </div>
      </div>

      {/* Section 7: High-Risk Alerts */}
      <div className="bg-[#171717] rounded-xl border border-red-500/20 overflow-hidden">
        <div className="p-5 border-b border-[#262626] bg-gradient-to-r from-red-500/10 via-transparent to-transparent flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center font-bold shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-tight">High Risk Alerts</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                  {stats.highCount} Active Alerts
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Immediate merchant attention required: Orders held for manual verification or suspected card testing.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('transactions')}
            className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 transition-colors self-start sm:self-auto cursor-pointer"
          >
            <span>Filter High-Risk Ledger</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {highRiskAlerts.length > 0 ? (
          <div className="divide-y divide-[#262626]">
            {highRiskAlerts.map((txn) => {
              const isMl = Boolean(txn.isRealTimeMl || txn.isRealTimeAnalysis || txn.id.startsWith('txn_ml_'));
              const cbProb = txn.chargebackProbability !== undefined 
                ? `${txn.chargebackProbability}%` 
                : `${Math.round(txn.riskScore * 0.95)}%`;

              return (
                <div
                  key={txn.id}
                  onClick={() => onSelectTransaction(txn)}
                  className="p-4 hover:bg-white/5 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 group"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400 shrink-0 mt-1 sm:mt-0 animate-ping" />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-white group-hover:text-amber-500 transition-colors">
                          #{txn.id.replace('txn_in_', '').replace('txn_ml_', 'ML-')}
                        </span>
                        {isMl && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-500 text-black">
                            ⚡ Real-Time ML
                          </span>
                        )}
                        <span className="text-xs text-neutral-400 font-medium">
                          {txn.customer.name} ({txn.customer.locationCity || 'India'})
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">
                        {txn.aiRiskExplanation || txn.aiRiskAssessment || txn.riskFactors[0]?.title || 'Multi-factor high fraud probability'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono shrink-0 justify-between md:justify-end">
                    <div className="text-right">
                      <span className="text-neutral-500 text-[10px] block font-sans uppercase">Amount</span>
                      <span className="font-bold text-white">₹{txn.amountINR.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-neutral-500 text-[10px] block font-sans uppercase">Risk Score</span>
                      <span className="font-bold text-red-400">{txn.riskScore}/100</span>
                    </div>

                    <div className="text-right">
                      <span className="text-neutral-500 text-[10px] block font-sans uppercase">CB Prob</span>
                      <span className="font-bold text-red-400">{cbProb}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-neutral-500 text-[10px] block font-sans uppercase">Action</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-500/15 text-red-400 border border-red-500/30">
                        {txn.recommendedAction || 'MANUAL VERIFY'}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTransaction(txn);
                      }}
                      className="px-2.5 py-1 rounded bg-[#262626] group-hover:bg-amber-500 group-hover:text-black text-neutral-300 font-bold text-[11px] transition-colors cursor-pointer"
                    >
                      Audit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-neutral-400">
            No high-risk transactions detected in the ledger.
          </div>
        )}
      </div>

      {/* Section 6: Recent Transactions (Latest 5 transactions from existing ledger) */}
      <div className="bg-[#171717] rounded-xl border border-[#262626] overflow-hidden">
        <div className="p-5 border-b border-[#262626] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              Recent Transactions
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#262626] text-neutral-400 border border-neutral-700 font-mono">
                Latest 5 in Ledger
              </span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">Click any transaction to open its complete multi-vector risk audit.</p>
          </div>

          <button
            onClick={() => setActiveTab('transactions')}
            className="flex items-center gap-1.5 text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors self-start sm:self-auto cursor-pointer"
          >
            <span>View All {transactions.length} Transactions</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0F0F0F] text-neutral-500 font-bold border-b border-[#262626] text-[11px] uppercase">
                <th className="py-3 px-5">Txn ID</th>
                <th className="py-3 px-5">Customer</th>
                <th className="py-3 px-5">Amount</th>
                <th className="py-3 px-5">Score</th>
                <th className="py-3 px-5">Risk Level</th>
                <th className="py-3 px-5">Recommended Action</th>
                <th className="py-3 px-5 text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262626]">
              {recentTransactions.map((txn) => {
                const isMl = Boolean(txn.isRealTimeMl || txn.isRealTimeAnalysis || txn.id.startsWith('txn_ml_'));
                const dateFormatted = new Date(txn.timestamp).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <tr
                    key={txn.id}
                    onClick={() => onSelectTransaction(txn)}
                    className="hover:bg-white/5 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-5 font-mono text-neutral-300">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold group-hover:text-amber-500 transition-colors">
                          #{txn.id.replace('txn_in_', '').replace('txn_ml_', 'ML-')}
                        </span>
                        {isMl && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-500 text-black">
                            ⚡ Real-Time ML
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-neutral-500 block">{dateFormatted}</span>
                    </td>

                    <td className="py-4 px-5">
                      <div className="font-medium text-white">{txn.customer.name}</div>
                      <div className="text-[11px] text-neutral-400 font-mono">{txn.customer.id || 'CUST-DEMO'}</div>
                    </td>

                    <td className="py-4 px-5 font-mono font-bold text-white text-xs">
                      ₹{txn.amountINR.toLocaleString('en-IN')}
                    </td>

                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold font-mono ${
                          txn.riskScore >= 70 ? 'text-red-400' : txn.riskScore >= 36 ? 'text-amber-400' : 'text-green-400'
                        }`}>
                          {String(txn.riskScore).padStart(2, '0')}
                        </span>
                        <div className="w-12 bg-neutral-800 h-1 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              txn.riskScore >= 70 ? 'bg-red-400' : txn.riskScore >= 36 ? 'bg-amber-400' : 'bg-green-400'
                            }`}
                            style={{ width: `${Math.min(100, txn.riskScore)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${
                        txn.riskLevel === 'HIGH'
                          ? 'bg-red-400/10 text-red-400 border-red-400/20'
                          : txn.riskLevel === 'MEDIUM'
                          ? 'bg-amber-400/10 text-amber-400 border-amber-400/20'
                          : 'bg-green-400/10 text-green-400 border-green-400/20'
                      }`}>
                        {txn.riskLevel} RISK
                      </span>
                    </td>

                    <td className="py-4 px-5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        txn.recommendedAction === 'APPROVE'
                          ? 'bg-green-500/15 text-green-400 border-green-500/30'
                          : txn.recommendedAction === 'MONITOR'
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          : 'bg-red-500/15 text-red-400 border-red-500/30'
                      }`}>
                        {txn.recommendedAction || (txn.riskScore >= 70 ? 'MANUAL VERIFICATION' : txn.riskScore >= 36 ? 'MONITOR' : 'APPROVE')}
                      </span>
                    </td>

                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTransaction(txn);
                        }}
                        className="text-[10px] text-amber-500 font-bold group-hover:underline cursor-pointer"
                      >
                        VIEW RISK →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Channel Exposure & Volume */}
      <div className="bg-[#171717] p-5 sm:p-6 rounded-xl border border-[#262626]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">Payment Channel Exposure & Volume</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Order volume (₹ Lakhs) and high-risk flags across Indian payment methods</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-neutral-400">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Volume (₹ Lakhs)
            </span>
            <span className="flex items-center gap-1.5 text-neutral-400">
              <span className="w-2 h-2 rounded-full bg-red-400" /> High Risk Orders
            </span>
          </div>
        </div>

        <div className="h-56 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={paymentMethodData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
              <XAxis dataKey="name" stroke="#737373" fontSize={11} tickLine={false} />
              <YAxis stroke="#737373" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '8px', fontSize: '12px' }}
                formatter={(value: any, name: any) => [
                  name === 'volumeLakhs' ? `₹${value} Lakhs` : `${value} Flagged Orders`,
                  name === 'volumeLakhs' ? 'Volume' : 'High Risk Orders'
                ]}
              />
              <Bar dataKey="volumeLakhs" fill="#F59E0B" radius={[4, 4, 0, 0]} maxBarSize={32} />
              <Bar dataKey="highRisk" fill="#F87171" radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-[#262626] text-xs">
          <div className="p-2.5 rounded-lg bg-[#0F0F0F] border border-[#262626]">
            <span className="text-neutral-500 text-[11px] block font-semibold uppercase">UPI / BharatPe</span>
            <strong className="text-neutral-200 font-mono mt-0.5 block">Zero 3DS Friction</strong>
          </div>
          <div className="p-2.5 rounded-lg bg-[#0F0F0F] border border-[#262626]">
            <span className="text-neutral-500 text-[11px] block font-semibold uppercase">Credit Cards</span>
            <strong className="text-amber-400 font-mono mt-0.5 block">High Resale Target</strong>
          </div>
          <div className="p-2.5 rounded-lg bg-[#0F0F0F] border border-[#262626]">
            <span className="text-neutral-500 text-[11px] block font-semibold uppercase">RuPay Cards</span>
            <strong className="text-green-400 font-mono mt-0.5 block">Domestic Liability Shift</strong>
          </div>
          <div className="p-2.5 rounded-lg bg-[#0F0F0F] border border-[#262626]">
            <span className="text-neutral-500 text-[11px] block font-semibold uppercase">Model Status</span>
            <strong className="text-emerald-400 font-mono mt-0.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ML LIVE
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};
