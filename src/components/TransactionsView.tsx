import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  CreditCard, 
  Smartphone, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Eye, 
  ShieldAlert, 
  Download, 
  RefreshCw, 
  Layers,
  ChevronDown,
  ArrowRight,
  Zap,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  FileCheck2
} from 'lucide-react';
import { Transaction, RiskLevel, PaymentMethodType, TransactionStatus, RecommendedAction, EvidenceCase } from '../types';

interface TransactionsViewProps {
  transactions: Transaction[];
  onSelectTransaction: (txn: Transaction) => void;
  onOpenSimulateModal: () => void;
  onNavigateToRealTime?: () => void;
  evidenceCases?: EvidenceCase[];
  onOpenOrCreateEvidenceCase?: (txn: Transaction) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  onSelectTransaction,
  onOpenSimulateModal,
  onNavigateToRealTime,
  evidenceCases,
  onOpenOrCreateEvidenceCase
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<'ALL' | RiskLevel>('ALL');
  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'REALTIME_ML' | 'DEMO'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | TransactionStatus>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | PaymentMethodType>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest-risk' | 'highest-amount'>('newest');

  // Count stats
  const totalCount = transactions.length;
  const realTimeMlCount = transactions.filter(t => t.isRealTimeMl || t.isRealTimeAnalysis || t.id.startsWith('txn_ml_')).length;
  const demoCount = totalCount - realTimeMlCount;

  // Filtered & Sorted list
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    // Search query: Searches by Transaction ID, Customer ID, and Customer Name
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((t) => 
        t.id.toLowerCase().includes(q) ||
        t.orderId.toLowerCase().includes(q) ||
        (t.customer.id && t.customer.id.toLowerCase().includes(q)) ||
        t.customer.name.toLowerCase().includes(q) ||
        t.customer.email.toLowerCase().includes(q) ||
        t.customer.phone.includes(q) ||
        t.customer.locationCity.toLowerCase().includes(q) ||
        t.payment.gatewayRefId.toLowerCase().includes(q) ||
        (t.payment.cardLast4 && t.payment.cardLast4.includes(q)) ||
        (t.payment.upiVpa && t.payment.upiVpa.toLowerCase().includes(q))
      );
    }

    // Risk level filter: All | Low Risk | Medium Risk | High Risk
    if (riskFilter !== 'ALL') {
      result = result.filter((t) => t.riskLevel === riskFilter);
    }

    // Source filter: All | Real-Time ML | Demo
    if (sourceFilter === 'REALTIME_ML') {
      result = result.filter((t) => t.isRealTimeMl || t.isRealTimeAnalysis || t.id.startsWith('txn_ml_'));
    } else if (sourceFilter === 'DEMO') {
      result = result.filter((t) => !(t.isRealTimeMl || t.isRealTimeAnalysis || t.id.startsWith('txn_ml_')));
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      result = result.filter((t) => t.status === statusFilter);
    }

    // Payment method filter
    if (paymentFilter !== 'ALL') {
      result = result.filter((t) => t.payment.method === paymentFilter);
    }

    // Sorting: newest, oldest, highest risk, highest transaction amount
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      }
      if (sortBy === 'highest-risk') {
        return b.riskScore - a.riskScore;
      }
      if (sortBy === 'highest-amount') {
        return b.amountINR - a.amountINR;
      }
      return 0;
    });

    return result;
  }, [transactions, searchQuery, riskFilter, sourceFilter, statusFilter, paymentFilter, sortBy]);

  const totalFilteredVolume = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => acc + t.amountINR, 0);
  }, [filteredTransactions]);

  const exportCSV = () => {
    const headers = [
      'Transaction ID', 
      'Date Time', 
      'Amount INR', 
      'Customer ID', 
      'Customer Name', 
      'Risk Score', 
      'Risk Level', 
      'Chargeback Probability %', 
      'Recommended Action', 
      'Prediction Source',
      'Payment Method',
      'Status'
    ];
    const rows = filteredTransactions.map(t => {
      const cbProb = t.chargebackProbability !== undefined ? `${t.chargebackProbability}%` : `${Math.round(t.riskScore * 0.95)}%`;
      const source = (t.isRealTimeMl || t.isRealTimeAnalysis || t.id.startsWith('txn_ml_')) 
        ? (t.predictionSource || 'Real-Time ML (HistGradientBoostingClassifier)')
        : (t.predictionSource || 'Demo Benchmark Dataset');

      return [
        t.id,
        t.timestamp,
        t.amountINR,
        `"${t.customer.id || 'N/A'}"`,
        `"${t.customer.name}"`,
        t.riskScore,
        t.riskLevel,
        cbProb,
        t.recommendedAction,
        `"${source}"`,
        t.payment.method,
        t.status
      ];
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ChargeGuard_Transactions_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper for Recommended Action visual badges
  const renderActionBadge = (action: RecommendedAction) => {
    switch (action) {
      case 'APPROVE':
        return (
          <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-full border bg-emerald-500/15 text-emerald-400 border-emerald-500/30 tracking-wide inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            APPROVE
          </span>
        );
      case 'MONITOR':
        return (
          <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-full border bg-amber-500/15 text-amber-400 border-amber-500/30 tracking-wide inline-flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" />
            MONITOR
          </span>
        );
      case 'MANUAL_VERIFICATION':
      case 'REJECT':
      default:
        return (
          <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-full border bg-rose-500/15 text-rose-400 border-rose-500/30 tracking-wide inline-flex items-center gap-1 whitespace-nowrap">
            <ShieldAlert className="w-3 h-3 text-rose-400" />
            MANUAL VERIFICATION
          </span>
        );
    }
  };

  // Helper for Risk Level visual badges
  const renderRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'LOW':
        return (
          <span className="px-2.5 py-1 text-[11px] font-extrabold uppercase rounded-full border bg-green-400/10 text-green-400 border-green-400/25 tracking-wider inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            LOW
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2.5 py-1 text-[11px] font-extrabold uppercase rounded-full border bg-amber-400/10 text-amber-400 border-amber-400/25 tracking-wider inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            MEDIUM
          </span>
        );
      case 'HIGH':
      default:
        return (
          <span className="px-2.5 py-1 text-[11px] font-extrabold uppercase rounded-full border bg-red-400/10 text-red-400 border-red-400/25 tracking-wider inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            HIGH
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5 flex-wrap">
            Merchant Transactions Ledger
            <span className="text-xs px-2.5 py-0.5 rounded bg-[#171717] text-neutral-300 border border-[#262626] font-mono font-medium">
              {filteredTransactions.length} of {totalCount} records
            </span>
            {realTimeMlCount > 0 && (
              <span className="text-xs px-2.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" />
                {realTimeMlCount} Real-Time ML
              </span>
            )}
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Central audit ledger capturing multi-channel payments, real-time ML risk scores, decision thresholds, and defense recommendations.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onNavigateToRealTime && (
            <button
              onClick={onNavigateToRealTime}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors cursor-pointer shadow-sm"
            >
              <Zap className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>+ Real-Time Analysis</span>
            </button>
          )}
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#171717] hover:bg-[#262626] text-neutral-300 hover:text-white border border-[#262626] text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-amber-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenSimulateModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#171717] hover:bg-[#262626] text-neutral-300 hover:text-white border border-[#262626] text-xs font-semibold transition-colors cursor-pointer"
          >
            <span>Simulate Order</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#171717] p-4 sm:p-5 rounded-xl border border-[#262626] space-y-3.5">
        {/* Search input & Risk Quick Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Box: Searches by Transaction ID, Customer ID, Customer Name */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Transaction ID, Customer ID, or Customer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-12 py-2.5 rounded-lg bg-[#0F0F0F] border border-[#262626] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Risk Level Pills: All, Low Risk, Medium Risk, High Risk */}
          <div className="md:col-span-6 flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <span className="text-[11px] font-semibold text-neutral-400 shrink-0 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-amber-500" /> Filter Risk:
            </span>
            {(['ALL', 'LOW', 'MEDIUM', 'HIGH'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setRiskFilter(lvl)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                  riskFilter === lvl
                    ? lvl === 'HIGH'
                      ? 'bg-red-400 text-black shadow-sm'
                      : lvl === 'MEDIUM'
                      ? 'bg-amber-400 text-black shadow-sm'
                      : lvl === 'LOW'
                      ? 'bg-green-400 text-black shadow-sm'
                      : 'bg-white text-black shadow-sm'
                    : 'bg-[#0F0F0F] text-neutral-400 hover:text-white border border-[#262626]'
                }`}
              >
                {lvl === 'ALL' ? 'All' : `${lvl.charAt(0) + lvl.slice(1).toLowerCase()} Risk`}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filter Controls: Source Filter, Status, Payment, and Sorting */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3 border-t border-[#262626] text-xs">
          {/* Source Filter: All / Real-Time ML / Demo Benchmark */}
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 text-[11px] font-medium shrink-0">Source:</span>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as any)}
              className="w-full py-1.5 px-3 rounded-lg bg-[#0F0F0F] border border-[#262626] text-neutral-200 text-xs focus:outline-none focus:border-amber-500/50"
            >
              <option value="ALL">All Sources ({totalCount})</option>
              <option value="REALTIME_ML">⚡ Real-Time ML Only ({realTimeMlCount})</option>
              <option value="DEMO">Demo Benchmark ({demoCount})</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 text-[11px] font-medium shrink-0">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full py-1.5 px-3 rounded-lg bg-[#0F0F0F] border border-[#262626] text-neutral-200 text-xs focus:outline-none focus:border-amber-500/50"
            >
              <option value="ALL">All Statuses</option>
              <option value="APPROVED">Approved</option>
              <option value="MONITORED">Monitored</option>
              <option value="UNDER_VERIFICATION">Under Verification</option>
              <option value="CHARGEBACK_DISPUTED">Chargeback Disputed</option>
              <option value="BLOCKED">Blocked</option>
            </select>
          </div>

          {/* Payment Method Filter */}
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 text-[11px] font-medium shrink-0">Payment:</span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as any)}
              className="w-full py-1.5 px-3 rounded-lg bg-[#0F0F0F] border border-[#262626] text-neutral-200 text-xs focus:outline-none focus:border-amber-500/50"
            >
              <option value="ALL">All Channels</option>
              <option value="UPI">UPI</option>
              <option value="CREDIT_CARD">Credit Card</option>
              <option value="DEBIT_CARD">Debit Card</option>
              <option value="EMI">EMI</option>
              <option value="NETBANKING">NetBanking</option>
            </select>
          </div>

          {/* Sort By: newest, oldest, highest risk, highest transaction amount */}
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 text-[11px] font-medium shrink-0">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full py-1.5 px-3 rounded-lg bg-[#0F0F0F] border border-[#262626] text-neutral-200 text-xs focus:outline-none focus:border-amber-500/50"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="highest-risk">Highest Risk</option>
              <option value="highest-amount">Highest Transaction Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Volume Summary Indicator */}
      <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
        <div>
          Showing <strong className="text-white font-mono">{filteredTransactions.length}</strong> transactions
          {sourceFilter === 'REALTIME_ML' && <span className="text-amber-400 ml-1.5">(Filtered to Real-Time ML)</span>}
        </div>
        <div>
          Filtered GMV: <strong className="text-amber-500 font-mono">₹{totalFilteredVolume.toLocaleString('en-IN')}</strong>
        </div>
      </div>

      {/* Table & Empty States */}
      <div className="bg-[#171717] rounded-xl border border-[#262626] overflow-hidden">
        {totalCount === 0 ? (
          /* Empty state 1: No transactions in ledger yet */
          <div className="p-16 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 mx-auto flex items-center justify-center text-amber-500">
              <Layers className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">No transactions have been analyzed yet</h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                Evaluate a payment on the Real-Time Transaction Analysis page to automatically generate live scored records.
              </p>
            </div>
            {onNavigateToRealTime && (
              <button
                onClick={onNavigateToRealTime}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
              >
                <Zap className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Go to Real-Time Analysis</span>
              </button>
            )}
          </div>
        ) : filteredTransactions.length === 0 ? (
          /* Empty state 2: Search or Filter yields no match */
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#262626] mx-auto flex items-center justify-center text-neutral-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No matching transactions found</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              No records match your search criteria. Try modifying your search query or reset filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setRiskFilter('ALL');
                setSourceFilter('ALL');
                setStatusFilter('ALL');
                setPaymentFilter('ALL');
                setSortBy('newest');
              }}
              className="px-4 py-2 rounded-lg bg-[#262626] hover:bg-neutral-800 text-amber-400 font-semibold text-xs transition-colors mt-2 cursor-pointer inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0F0F0F] text-neutral-500 font-bold border-b border-[#262626] text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Date / Time</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Risk Score</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4">Chargeback Prob</th>
                  <th className="py-3 px-4">Recommended Action</th>
                  <th className="py-3 px-4">Prediction Source</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {filteredTransactions.map((txn) => {
                  const isMlAnalyzed = Boolean(txn.isRealTimeMl || txn.isRealTimeAnalysis || txn.id.startsWith('txn_ml_'));
                  const linkedCase = evidenceCases?.find((c) => c.transactionId === txn.id);
                  const dateFormatted = new Date(txn.timestamp).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  const cbProbValue = txn.chargebackProbability !== undefined 
                    ? txn.chargebackProbability 
                    : Math.round(txn.riskScore * 0.95);

                  return (
                    <tr
                      key={txn.id}
                      onClick={() => onSelectTransaction(txn)}
                      className="hover:bg-white/5 transition-colors cursor-pointer group"
                    >
                      {/* 1. Transaction ID & Badge */}
                      <td className="py-3.5 px-4 font-mono font-medium text-neutral-300">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-amber-400 group-hover:underline font-bold">
                              #{txn.id.replace('txn_in_', '').replace('txn_rt_', '').replace('txn_ml_', '')}
                            </span>
                            {/* Visible Real-Time ML Badge */}
                            {isMlAnalyzed && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500 text-black shadow-sm inline-flex items-center gap-1">
                                ⚡ Real-Time ML
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-neutral-500 font-sans truncate max-w-[140px]">
                            {txn.orderId}
                          </span>
                        </div>
                      </td>

                      {/* 2. Date/Time */}
                      <td className="py-3.5 px-4 text-neutral-300 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-neutral-300 font-medium">
                          <Clock className="w-3 h-3 text-neutral-500" />
                          <span>{dateFormatted}</span>
                        </div>
                      </td>

                      {/* 3. Amount */}
                      <td className="py-3.5 px-4 font-mono font-bold text-white text-xs whitespace-nowrap">
                        ₹{txn.amountINR.toLocaleString('en-IN')}
                      </td>

                      {/* 4. Customer */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white truncate max-w-[150px]">
                          {txn.customer.name}
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono flex items-center gap-1">
                          <span>{txn.customer.id || 'CUST-DEMO'}</span>
                          {txn.customer.locationCity && <span>• {txn.customer.locationCity}</span>}
                        </div>
                      </td>

                      {/* 5. Risk Score */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 text-right font-mono font-bold text-xs">
                            <span className={
                              txn.riskScore >= 70 ? 'text-red-400' : txn.riskScore >= 35 ? 'text-amber-400' : 'text-green-400'
                            }>
                              {txn.riskScore}
                            </span>
                          </div>
                          <div className="w-12 bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                txn.riskScore >= 70 ? 'bg-red-400' : txn.riskScore >= 35 ? 'bg-amber-400' : 'bg-green-400'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(5, txn.riskScore))}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* 6. Risk Level: Clear visual badges for LOW, MEDIUM, HIGH */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {renderRiskBadge(txn.riskLevel)}
                      </td>

                      {/* 7. Chargeback Probability */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono">
                        <div className="flex items-center gap-1">
                          <span className={`font-bold text-xs ${
                            cbProbValue >= 20 ? 'text-red-400' : cbProbValue >= 10 ? 'text-amber-400' : 'text-green-400'
                          }`}>
                            {cbProbValue}%
                          </span>
                          <span className="text-[9px] text-neutral-500">
                            {cbProbValue >= 20 ? '(>0.20)' : '(<0.20)'}
                          </span>
                        </div>
                      </td>

                      {/* 8. Recommended Action: Clear visual badges for APPROVE, MONITOR, MANUAL VERIFICATION */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {renderActionBadge(txn.recommendedAction)}
                      </td>

                      {/* 9. Prediction Source */}
                      <td className="py-3.5 px-4">
                        {isMlAnalyzed ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500 text-black text-[10px] font-extrabold tracking-wide uppercase shadow-sm w-fit">
                              ⚡ Real-Time ML
                            </span>
                            <span className="text-[10px] text-neutral-400 font-mono truncate max-w-[160px]" title={txn.predictionSource || 'FastAPI /predict'}>
                              {txn.predictionSource || 'HistGradientBoosting'}
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#262626] text-neutral-400 border border-neutral-700 text-[10px] font-medium w-fit">
                              Demo Dataset
                            </span>
                            <span className="text-[10px] text-neutral-500 font-mono">
                              Benchmark
                            </span>
                          </div>
                        )}
                      </td>

                      {/* 10. Actions (Evidence + Risk Details) */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {onOpenOrCreateEvidenceCase && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenOrCreateEvidenceCase(txn);
                              }}
                              title={linkedCase ? `Open Evidence Case (${linkedCase.id})` : 'Create Evidence Case'}
                              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer ${
                                linkedCase
                                  ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500 hover:text-black'
                                  : 'bg-[#1C1C1C] hover:bg-[#2A2A2A] text-neutral-300 hover:text-white border border-[#333]'
                              }`}
                            >
                              <FileCheck2 className="w-3.5 h-3.5" />
                              <span>Evidence</span>
                              {linkedCase && (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-black/40 text-amber-200 font-mono">
                                  {linkedCase.status}
                                </span>
                              )}
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectTransaction(txn);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-[#262626] group-hover:bg-amber-500 group-hover:text-black text-neutral-200 text-[11px] font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Risk Details</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Synthetic Demo Disclaimer */}
      <div className="p-3.5 rounded-xl bg-[#121212] border border-[#262626] text-center text-xs text-neutral-500">
        <span>
          ChargeGuard AI uses synthetic e-commerce transaction data paired with a trained HistGradientBoostingClassifier ML model. No real customer credentials, live credit cards, or actual payment processor accounts are utilized.
        </span>
      </div>
    </div>
  );
};
