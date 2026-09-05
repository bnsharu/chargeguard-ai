import React, { useState, useMemo } from 'react';
import { 
  FileCheck2, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Send, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  ArrowLeft, 
  Eye, 
  Copy, 
  Check, 
  FileText, 
  ExternalLink, 
  Zap, 
  ShieldCheck, 
  Sparkles, 
  User, 
  CreditCard, 
  Truck, 
  RotateCcw,
  Building,
  Info,
  ChevronRight
} from 'lucide-react';
import { Transaction, EvidenceCase, EvidenceCaseStatus, EvidenceChecklistItem } from '../types';
import { 
  EVIDENCE_CHECKLIST_TEMPLATE, 
  calculateEvidenceStrength, 
  getEvidenceRecommendations, 
  generateAiEvidenceSummary, 
  createEvidenceCaseForTransaction, 
  exportEvidenceCasesToCsv,
  TOTAL_EVIDENCE_ITEMS
} from '../services/evidenceService';
import { useToast } from './Toast';

interface EvidenceCenterViewProps {
  transactions: Transaction[];
  selectedTransaction: Transaction | null;
  onSelectTransaction: (txn: Transaction) => void;
  evidenceCases: EvidenceCase[];
  onUpdateEvidenceCases: (cases: EvidenceCase[]) => void;
  activeEvidenceCaseId: string | null;
  onSelectEvidenceCaseId: (id: string | null) => void;
}

export const EvidenceCenterView: React.FC<EvidenceCenterViewProps> = ({
  transactions,
  selectedTransaction,
  onSelectTransaction,
  evidenceCases,
  onUpdateEvidenceCases,
  activeEvidenceCaseId,
  onSelectEvidenceCaseId,
}) => {
  const { showToast } = useToast();

  // Search and Filter states for Case List
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | EvidenceCaseStatus | 'HIGH_RISK'>('ALL');
  
  // Create Evidence Case modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTxnIdForNewCase, setSelectedTxnIdForNewCase] = useState<string>(
    selectedTransaction?.id || (transactions[0]?.id ?? '')
  );

  // Copy feedback state
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Active case object
  const activeCase = useMemo(() => {
    if (!activeEvidenceCaseId) return null;
    return evidenceCases.find((c) => c.id === activeEvidenceCaseId) || null;
  }, [evidenceCases, activeEvidenceCaseId]);

  // Dynamic Overview Calculations (Section 2)
  const stats = useMemo(() => {
    const total = evidenceCases.length;
    const openCount = evidenceCases.filter((c) => c.status === 'OPEN').length;
    const readyCount = evidenceCases.filter((c) => c.status === 'IN REVIEW' || c.status === 'READY').length;
    const completeCount = evidenceCases.filter((c) => {
      const { tier } = calculateEvidenceStrength(c.checklist);
      return tier === 'COMPLETE';
    }).length;
    const highRiskCount = evidenceCases.filter((c) => {
      return (
        c.transaction.riskLevel === 'HIGH' ||
        (c.transaction.chargebackProbability !== undefined && c.transaction.chargebackProbability >= 20) ||
        c.transaction.riskScore >= 70
      );
    }).length;

    return { total, openCount, readyCount, completeCount, highRiskCount };
  }, [evidenceCases]);

  // Filtered Evidence Cases for Case List (Section 3 & 12)
  const filteredCases = useMemo(() => {
    let result = [...evidenceCases];

    // Search by Transaction ID, Evidence Case ID, Customer ID
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.transactionId.toLowerCase().includes(q) ||
          (c.transaction.customer.id && c.transaction.customer.id.toLowerCase().includes(q)) ||
          c.transaction.customer.name.toLowerCase().includes(q) ||
          c.transaction.orderId.toLowerCase().includes(q)
      );
    }

    // Filter by Case Status or High Risk
    if (statusFilter === 'HIGH_RISK') {
      result = result.filter(
        (c) =>
          c.transaction.riskLevel === 'HIGH' ||
          (c.transaction.chargebackProbability !== undefined && c.transaction.chargebackProbability >= 20) ||
          c.transaction.riskScore >= 70
      );
    } else if (statusFilter !== 'ALL') {
      result = result.filter((c) => c.status === statusFilter);
    }

    // Sort newest first
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return result;
  }, [evidenceCases, searchQuery, statusFilter]);

  // Status update handler
  const handleUpdateCaseStatus = (caseId: string, newStatus: EvidenceCaseStatus) => {
    const updated = evidenceCases.map((c) =>
      c.id === caseId ? { ...c, status: newStatus, updatedAt: new Date().toISOString() } : c
    );
    onUpdateEvidenceCases(updated);
    showToast({
      type: 'info',
      title: 'Evidence Case Status Updated',
      description: `Case ${caseId} status set to ${newStatus}`
    });
  };

  // Toggle checklist item
  const handleToggleChecklistItem = (caseId: string, itemId: string) => {
    const updated = evidenceCases.map((c) => {
      if (c.id !== caseId) return c;
      const updatedChecklist = c.checklist.map((item) =>
        item.id === itemId ? { ...item, isAvailable: !item.isAvailable } : item
      );
      return { ...c, checklist: updatedChecklist, updatedAt: new Date().toISOString() };
    });
    onUpdateEvidenceCases(updated);
  };

  // Batch toggle all items in a category
  const handleBatchToggleCategory = (caseId: string, category: string, targetState: boolean) => {
    const updated = evidenceCases.map((c) => {
      if (c.id !== caseId) return c;
      const updatedChecklist = c.checklist.map((item) =>
        item.category === category ? { ...item, isAvailable: targetState } : item
      );
      return { ...c, checklist: updatedChecklist, updatedAt: new Date().toISOString() };
    });
    onUpdateEvidenceCases(updated);
    showToast({
      type: 'info',
      title: `${category} Updated`,
      description: `Marked all items as ${targetState ? 'available' : 'not available'}`
    });
  };

  // Create new Evidence Case from transaction selection (Section 4)
  const handleCreateCaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetTxn = transactions.find((t) => t.id === selectedTxnIdForNewCase);
    if (!targetTxn) {
      showToast({
        type: 'warning',
        title: 'Selection Required',
        description: 'Please select an existing transaction from the ledger'
      });
      return;
    }

    // Check if case already exists
    const existing = evidenceCases.find((c) => c.transactionId === targetTxn.id);
    if (existing) {
      showToast({
        type: 'info',
        title: 'Existing Case Located',
        description: `Evidence Case ${existing.id} already exists for this transaction`
      });
      onSelectEvidenceCaseId(existing.id);
      onSelectTransaction(targetTxn);
      setIsCreateModalOpen(false);
      return;
    }

    const newCase = createEvidenceCaseForTransaction(targetTxn, evidenceCases.length);
    const updated = [newCase, ...evidenceCases];
    onUpdateEvidenceCases(updated);
    onSelectEvidenceCaseId(newCase.id);
    onSelectTransaction(targetTxn);
    setIsCreateModalOpen(false);

    showToast({
      type: 'success',
      title: 'Evidence Case Created',
      description: `Initialized defense case ${newCase.id} for Order #${targetTxn.orderId}`
    });
  };

  // CSV Export handler (Section 15)
  const handleExportCsv = () => {
    const casesToExport = activeCase ? [activeCase] : filteredCases;
    if (casesToExport.length === 0) {
      showToast({
        type: 'warning',
        title: 'No Cases to Export',
        description: 'There are no evidence cases matching the current view'
      });
      return;
    }

    const csvContent = exportEvidenceCasesToCsv(casesToExport);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `chargeguard_evidence_summary_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast({
      type: 'success',
      title: 'Evidence Summary Exported',
      description: `Exported ${casesToExport.length} evidence case record(s) to CSV`
    });
  };

  // Copy AI Summary to clipboard
  const handleCopyAiSummary = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    showToast({
      type: 'success',
      title: 'Summary Copied',
      description: 'AI Evidence Summary copied to clipboard'
    });
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  // Render Status Badge
  const renderStatusBadge = (status: EvidenceCaseStatus) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-neutral-800 text-neutral-300 border border-neutral-700">
            OPEN
          </span>
        );
      case 'IN REVIEW':
        return (
          <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            IN REVIEW
          </span>
        );
      case 'READY':
        return (
          <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            READY
          </span>
        );
      case 'SUBMITTED':
        return (
          <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
            SUBMITTED
          </span>
        );
    }
  };

  // Render Strength Tier Badge
  const renderStrengthBadge = (percent: number, tier: string) => {
    let colorClass = 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    if (percent >= 90) colorClass = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    else if (percent >= 70) colorClass = 'bg-teal-500/15 text-teal-300 border-teal-500/30';
    else if (percent >= 40) colorClass = 'bg-amber-500/15 text-amber-300 border-amber-500/30';

    return (
      <div className="flex items-center gap-2">
        <span className={`px-2 py-0.5 rounded text-[11px] font-bold border font-mono ${colorClass}`}>
          {percent}% • {tier}
        </span>
      </div>
    );
  };

  // ==========================================
  // VIEW: DETAILED EVIDENCE CASE WORKSPACE
  // ==========================================
  if (activeCase) {
    const { completedCount, totalItems, percent, tier } = calculateEvidenceStrength(activeCase.checklist);
    const recommendations = getEvidenceRecommendations(activeCase.transaction, activeCase.checklist);
    const aiSummary = generateAiEvidenceSummary(activeCase.transaction, activeCase.checklist);
    const isMl = Boolean(
      activeCase.transaction.isRealTimeMl ||
      activeCase.transaction.isRealTimeAnalysis ||
      activeCase.transaction.id.startsWith('txn_ml_')
    );
    const cbProb = activeCase.transaction.chargebackProbability !== undefined
      ? activeCase.transaction.chargebackProbability
      : Math.round(activeCase.transaction.riskScore * 0.95);

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Breadcrumb & Top Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121212] p-4 rounded-xl border border-[#262626]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectEvidenceCaseId(null)}
              className="px-3 py-1.5 rounded-lg bg-[#1F1F1F] hover:bg-[#2A2A2A] text-neutral-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Evidence Cases</span>
            </button>
            <div className="h-4 w-px bg-[#2E2E2E]" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold text-amber-400">{activeCase.id}</span>
                <span className="text-neutral-500 text-xs">•</span>
                <span className="text-xs font-mono text-neutral-300">Txn: {activeCase.transactionId}</span>
                {isMl && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-500 text-black uppercase">
                    ⚡ Real-Time ML
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Customer: <strong className="text-neutral-200">{activeCase.transaction.customer.name}</strong> • Amount:{' '}
                <strong className="text-white font-mono">₹{activeCase.transaction.amountINR.toLocaleString('en-IN')}</strong> • Order #{activeCase.transaction.orderId}
              </p>
            </div>
          </div>

          {/* Status Changer & Export */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-[#171717] p-1 rounded-lg border border-[#2B2B2B]">
              {(['OPEN', 'IN REVIEW', 'READY', 'SUBMITTED'] as EvidenceCaseStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={() => handleUpdateCaseStatus(activeCase.id, st)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                    activeCase.status === st
                      ? 'bg-amber-500 text-black shadow-sm'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 rounded-lg bg-[#262626] hover:bg-neutral-800 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Section 11: Dynamic Evidence Completeness & Strength Banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#171717] to-[#121212] border border-[#2B2B2B] shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Evidence Completeness & Defense Strength</h3>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Organize legitimate merchant records and documentation for dispute representation.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="text-right">
                <span className="text-[11px] text-neutral-400 block font-sans">Evidence Checklist:</span>
                <strong className="text-white text-sm">
                  {completedCount} / {totalItems} complete
                </strong>
              </div>
              <div className="h-8 w-px bg-[#262626]" />
              <div className="text-right">
                <span className="text-[11px] text-neutral-400 block font-sans">Evidence Strength:</span>
                <strong
                  className={`text-sm ${
                    percent >= 90
                      ? 'text-emerald-400'
                      : percent >= 70
                      ? 'text-teal-300'
                      : percent >= 40
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {percent}% ({tier})
                </strong>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[#262626] rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                percent >= 90
                  ? 'bg-emerald-500'
                  : percent >= 70
                  ? 'bg-teal-400'
                  : percent >= 40
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono pt-1">
            <span>0% (Weak)</span>
            <span>40% (Moderate)</span>
            <span>70% (Strong)</span>
            <span>90–100% (Complete)</span>
          </div>
        </div>

        {/* Main Content Grid: Left Column (Checklist) & Right Column (ML Risk + Recommendations + AI Summary) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Section 5 - Evidence Checklist (7 Categories) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  Legitimate Merchant Evidence Checklist
                </h4>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Explicitly mark available documentation. Unmarked items remain marked as not available.
                </p>
              </div>
              <span className="text-xs font-mono text-neutral-400">
                {completedCount}/{totalItems} items
              </span>
            </div>

            {/* Checklist Categories Accordion / Cards */}
            <div className="space-y-3">
              {EVIDENCE_CHECKLIST_TEMPLATE.map((catDef) => {
                const categoryItems = activeCase.checklist.filter((i) => i.category === catDef.category);
                const availableCatItems = categoryItems.filter((i) => i.isAvailable).length;
                const isAllAvailable = availableCatItems === categoryItems.length && categoryItems.length > 0;

                return (
                  <div
                    key={catDef.category}
                    className="p-4 rounded-xl bg-[#121212] border border-[#262626] hover:border-[#333] transition-colors space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-[#222] text-amber-400 font-mono text-xs font-bold flex items-center justify-center">
                          {catDef.letter}
                        </span>
                        <h5 className="text-xs font-bold text-neutral-200">{catDef.category}</h5>
                        <span className="text-[10px] font-mono text-neutral-400">
                          ({availableCatItems}/{categoryItems.length})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleBatchToggleCategory(activeCase.id, catDef.category, !isAllAvailable)}
                        className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold hover:underline"
                      >
                        {isAllAvailable ? 'Unmark Category' : 'Mark Category Available'}
                      </button>
                    </div>

                    <div className="divide-y divide-[#1F1F1F]">
                      {categoryItems.map((item) => (
                        <label
                          key={item.id}
                          className="py-2 flex items-start gap-3 cursor-pointer group select-none"
                        >
                          <input
                            type="checkbox"
                            checked={item.isAvailable}
                            onChange={() => handleToggleChecklistItem(activeCase.id, item.id)}
                            className="mt-0.5 w-4 h-4 rounded border-[#383838] bg-[#171717] text-amber-500 focus:ring-amber-400 focus:ring-offset-0 cursor-pointer"
                          />
                          <div className="flex-1">
                            <span
                              className={`text-xs block ${
                                item.isAvailable ? 'text-neutral-100 font-semibold' : 'text-neutral-400'
                              }`}
                            >
                              {item.label}
                            </span>
                            <span className="text-[10px] text-neutral-500 block">
                              {item.isAvailable ? (
                                <span className="text-emerald-400 flex items-center gap-1 font-mono">
                                  <Check className="w-2.5 h-2.5" /> Marked available in merchant records
                                </span>
                              ) : (
                                <span className="text-neutral-500">Evidence not available (Click to verify & attach)</span>
                              )}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN: ML Context, Recommendations, AI Summary */}
          <div className="lg:col-span-5 space-y-5">
            {/* Section 8: ML Risk Context */}
            <div className="p-4 rounded-xl bg-[#121212] border border-[#262626] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">ML Risk Context</h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1C1C1C] text-neutral-400 border border-neutral-700">
                  ML-generated risk assessment
                </span>
              </div>

              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Evaluated by machine learning inference engine. <span className="text-amber-400/90 font-medium">Notice:</span> An internal ML risk score is an operational assessment to assist merchant review before submission.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
                <div className="p-2.5 rounded-lg bg-[#171717] border border-[#2B2B2B]">
                  <span className="text-[10px] text-neutral-500 block uppercase font-sans">Risk Score</span>
                  <span className="text-sm font-bold text-white">{activeCase.transaction.riskScore}/100</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#171717] border border-[#2B2B2B]">
                  <span className="text-[10px] text-neutral-500 block uppercase font-sans">CB Probability</span>
                  <span className={`text-sm font-bold ${cbProb >= 20 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {cbProb}%
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#171717] border border-[#2B2B2B]">
                  <span className="text-[10px] text-neutral-500 block uppercase font-sans">Risk Level</span>
                  <span
                    className={`text-xs font-bold ${
                      activeCase.transaction.riskLevel === 'HIGH'
                        ? 'text-rose-400'
                        : activeCase.transaction.riskLevel === 'MEDIUM'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {activeCase.transaction.riskLevel}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#171717] border border-[#2B2B2B]">
                  <span className="text-[10px] text-neutral-500 block uppercase font-sans">Recommended Action</span>
                  <span className="text-xs font-bold text-amber-300 truncate block">
                    {activeCase.transaction.recommendedAction}
                  </span>
                </div>
              </div>

              {activeCase.transaction.riskFactors && activeCase.transaction.riskFactors.length > 0 && (
                <div className="pt-2 border-t border-[#222]">
                  <span className="text-[10px] font-bold text-neutral-400 block mb-1.5">Detected Risk Indicators:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeCase.transaction.riskFactors.map((rf, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[10px] bg-[#1C1C1C] border border-[#333] text-neutral-300"
                      >
                        {rf.name} ({rf.severity})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Section 7: Recommended Evidence */}
            <div className="p-4 rounded-xl bg-[#121212] border border-[#262626] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Recommended Evidence</h4>
                </div>
                <span className="text-[10px] text-neutral-500 font-mono">Defense Guidance</span>
              </div>

              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Recommendations derived from order characteristics and missing documentation. Recommendations only; evidence is not marked available until confirmed.
              </p>

              {recommendations.length === 0 ? (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>All high-priority defense evidence items have been marked as available.</span>
                </div>
              ) : (
                <ul className="space-y-2">
                  {recommendations.map((rec, i) => (
                    <li
                      key={i}
                      className="text-xs text-neutral-300 flex items-start gap-2 bg-[#171717] p-2.5 rounded-lg border border-[#262626]"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Section 9: AI Evidence Summary */}
            <div className="p-4 rounded-xl bg-[#121212] border border-[#262626] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">AI Evidence Summary</h4>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyAiSummary(aiSummary)}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSummary ? 'Copied' : 'Copy Summary'}</span>
                </button>
              </div>

              <p className="text-[11px] text-neutral-500">
                Synthesized strictly from transaction records and marked evidence items. Unavailable fields are explicitly reported as [Not provided].
              </p>

              <div className="p-3.5 rounded-lg bg-[#0A0A0A] border border-[#222] font-mono text-[11px] text-neutral-300 leading-relaxed whitespace-pre-line max-h-96 overflow-y-auto selection:bg-amber-500/20">
                {aiSummary}
              </div>
            </div>

            {/* Section 18 & 19: Defense-Only Safety & Synthetic Data Disclaimer */}
            <div className="p-3.5 rounded-xl bg-[#101010] border border-[#222] text-[11px] text-neutral-500 space-y-1.5">
              <div className="flex items-center gap-1.5 text-neutral-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                <span>Defense-Only Chargeback Safeguards</span>
              </div>
              <p>
                ChargeGuard AI organizes legitimate merchant records strictly for legal dispute defense and representation. No evasion or manipulation techniques are supported.
              </p>
              <p className="text-[10px] text-neutral-600">
                Synthetic / Demo Data: Transaction records in this environment utilize realistic test parameters. No live cardholder credentials or active processor API secrets are handled.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: EVIDENCE CASE LIST & SUMMARY OVERVIEW
  // ==========================================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Evidence Center</h2>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Defense Workflow
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl">
            Manage legitimate merchant chargeback rebuttal cases. Connect directly to ledger transactions, collect evidence checklists, and prepare dispute defense packages.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-lg bg-[#1F1F1F] hover:bg-[#2A2A2A] text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-[#2E2E2E]"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Export Evidence Summary</span>
          </button>

          {/* Section 4: Create Evidence Case Button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create Evidence Case</span>
          </button>
        </div>
      </div>

      {/* Section 2: Summary Cards at the Top (Dynamic Calculations) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#121212] border border-[#262626]">
          <span className="text-xs font-semibold text-neutral-400 block">Open Evidence Cases</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-white">{stats.openCount}</span>
            <span className="text-[11px] text-neutral-500">awaiting review</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#121212] border border-[#262626]">
          <span className="text-xs font-semibold text-neutral-400 block">Ready for Review</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-amber-400">{stats.readyCount}</span>
            <span className="text-[11px] text-neutral-500">in review / ready</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#121212] border border-[#262626]">
          <span className="text-xs font-semibold text-neutral-400 block">Evidence Complete</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-emerald-400">{stats.completeCount}</span>
            <span className="text-[11px] text-neutral-500">&gt;= 90% strength</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#121212] border border-[#262626]">
          <span className="text-xs font-semibold text-neutral-400 block">High-Risk Cases</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-rose-400">{stats.highRiskCount}</span>
            <span className="text-[11px] text-neutral-500">critical vulnerability</span>
          </div>
        </div>
      </div>

      {/* Section 12: Search and Filter Bar */}
      <div className="p-4 rounded-xl bg-[#121212] border border-[#262626] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Transaction ID, Case ID, Customer ID..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#171717] border border-[#333] text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(
            [
              { id: 'ALL', label: 'All Cases' },
              { id: 'OPEN', label: 'Open' },
              { id: 'IN REVIEW', label: 'In Review' },
              { id: 'READY', label: 'Ready' },
              { id: 'SUBMITTED', label: 'Submitted' },
              { id: 'HIGH_RISK', label: 'High Risk' }
            ] as const
          ).map((filter) => (
            <button
              key={filter.id}
              onClick={() => setStatusFilter(filter.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === filter.id
                  ? 'bg-amber-500 text-black'
                  : 'bg-[#1A1A1A] text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Section 3: Evidence Case List (Table/Card Layout) */}
      <div className="rounded-xl bg-[#121212] border border-[#262626] overflow-hidden">
        {evidenceCases.length === 0 ? (
          /* Empty state: No evidence records exist */
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#1F1F1F] mx-auto flex items-center justify-center text-amber-400">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No Evidence Cases Created Yet</h3>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              You haven't initiated any dispute defense cases. Create an evidence case linked to an existing transaction from your ledger to start assembling evidence.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer mt-2"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create Evidence Case</span>
            </button>
          </div>
        ) : filteredCases.length === 0 ? (
          /* Empty state: Filter returned 0 results */
          <div className="p-10 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#1F1F1F] mx-auto flex items-center justify-center text-neutral-400">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">No matching evidence cases</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              No evidence cases matched your search query or filter selection. Try modifying your search criteria.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
              }}
              className="px-3 py-1.5 rounded-lg bg-[#222] hover:bg-[#333] text-amber-400 text-xs font-semibold cursor-pointer inline-flex items-center gap-1"
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
                  <th className="py-3 px-4">Evidence Case ID</th>
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4">CB Probability</th>
                  <th className="py-3 px-4">Evidence Strength</th>
                  <th className="py-3 px-4">Case Status</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {filteredCases.map((evCase) => {
                  const { completedCount, totalItems, percent, tier } = calculateEvidenceStrength(evCase.checklist);
                  const isMl = Boolean(
                    evCase.transaction.isRealTimeMl ||
                    evCase.transaction.isRealTimeAnalysis ||
                    evCase.transaction.id.startsWith('txn_ml_')
                  );
                  const cbProbVal = evCase.transaction.chargebackProbability !== undefined
                    ? evCase.transaction.chargebackProbability
                    : Math.round(evCase.transaction.riskScore * 0.95);

                  const dateFormatted = new Date(evCase.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  });

                  return (
                    <tr
                      key={evCase.id}
                      onClick={() => {
                        onSelectEvidenceCaseId(evCase.id);
                        onSelectTransaction(evCase.transaction);
                      }}
                      className="hover:bg-[#181818] transition-colors cursor-pointer group"
                    >
                      {/* Evidence Case ID */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-amber-400 group-hover:underline">
                            {evCase.id}
                          </span>
                          {isMl && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-500 text-black uppercase">
                              ⚡ ML
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Transaction ID */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-neutral-300">
                        {evCase.transactionId}
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-neutral-200 font-semibold">{evCase.transaction.customer.name}</div>
                        <div className="text-[10px] text-neutral-500 font-mono">
                          ID: {evCase.transaction.customer.id || 'CUST-RECORD'}
                        </div>
                      </td>

                      {/* Transaction Amount */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono font-semibold text-white">
                        ₹{evCase.transaction.amountINR.toLocaleString('en-IN')}
                      </td>

                      {/* Risk Level */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border font-mono ${
                            evCase.transaction.riskLevel === 'HIGH'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : evCase.transaction.riskLevel === 'MEDIUM'
                              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {evCase.transaction.riskLevel}
                        </span>
                      </td>

                      {/* Chargeback Probability */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono">
                        <span className={cbProbVal >= 20 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                          {cbProbVal}%
                        </span>
                        <span className="text-[10px] text-neutral-500 ml-1">
                          {cbProbVal >= 20 ? '(>0.20)' : '(<0.20)'}
                        </span>
                      </td>

                      {/* Evidence Strength */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {renderStrengthBadge(percent, tier)}
                        <span className="text-[10px] text-neutral-500 block mt-0.5 font-mono">
                          {completedCount}/{totalItems} items
                        </span>
                      </td>

                      {/* Case Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {renderStatusBadge(evCase.status)}
                      </td>

                      {/* Created Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-neutral-400 text-[11px]">
                        {dateFormatted}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectEvidenceCaseId(evCase.id);
                            onSelectTransaction(evCase.transaction);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-[#222] group-hover:bg-amber-500 group-hover:text-black text-neutral-300 text-xs font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Case</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 4: CREATE EVIDENCE CASE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#121212] border border-[#2B2B2B] rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Create Evidence Case</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-neutral-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-400">
              Select an existing transaction from the ledger. An evidence case must reference an actual transaction record.
            </p>

            <form onSubmit={handleCreateCaseSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Select Transaction:
                </label>
                <select
                  value={selectedTxnIdForNewCase}
                  onChange={(e) => setSelectedTxnIdForNewCase(e.target.value)}
                  className="w-full py-2 px-3 rounded-lg bg-[#171717] border border-[#333] text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                  required
                >
                  {transactions.map((txn) => (
                    <option key={txn.id} value={txn.id}>
                      {txn.id} — {txn.customer.name} (₹{txn.amountINR.toLocaleString('en-IN')}) — {txn.riskLevel} RISK ({txn.riskScore}/100)
                    </option>
                  ))}
                </select>
              </div>

              {/* Automatically Populated Values Display (Section 4) */}
              {(() => {
                const previewTxn = transactions.find((t) => t.id === selectedTxnIdForNewCase);
                if (!previewTxn) return null;

                const isAlreadyCreated = evidenceCases.some((c) => c.transactionId === previewTxn.id);
                const isMl = Boolean(
                  previewTxn.isRealTimeMl ||
                  previewTxn.isRealTimeAnalysis ||
                  previewTxn.id.startsWith('txn_ml_')
                );
                const cbProb = previewTxn.chargebackProbability !== undefined
                  ? `${previewTxn.chargebackProbability}%`
                  : `${Math.round(previewTxn.riskScore * 0.95)}%`;

                return (
                  <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#262626] space-y-2 text-xs">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                      Auto-Populated Transaction Parameters:
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div>
                        <span className="text-neutral-500">Transaction ID:</span>{' '}
                        <strong className="text-neutral-200">{previewTxn.id}</strong>
                      </div>
                      <div>
                        <span className="text-neutral-500">Amount:</span>{' '}
                        <strong className="text-white">₹{previewTxn.amountINR.toLocaleString('en-IN')}</strong>
                      </div>
                      <div>
                        <span className="text-neutral-500">Customer ID:</span>{' '}
                        <strong className="text-neutral-200">{previewTxn.customer.id || 'CUST-RECORD'}</strong>
                      </div>
                      <div>
                        <span className="text-neutral-500">Timestamp:</span>{' '}
                        <strong className="text-neutral-300">
                          {new Date(previewTxn.timestamp).toLocaleDateString('en-IN')}
                        </strong>
                      </div>
                      <div>
                        <span className="text-neutral-500">Risk Score:</span>{' '}
                        <strong className="text-white">{previewTxn.riskScore}/100</strong>
                      </div>
                      <div>
                        <span className="text-neutral-500">CB Probability:</span>{' '}
                        <strong className="text-rose-400">{cbProb}</strong>
                      </div>
                      <div>
                        <span className="text-neutral-500">Risk Level:</span>{' '}
                        <strong className="text-amber-300">{previewTxn.riskLevel}</strong>
                      </div>
                      <div>
                        <span className="text-neutral-500">Recommended Action:</span>{' '}
                        <strong className="text-neutral-200">{previewTxn.recommendedAction}</strong>
                      </div>
                      <div className="col-span-2 truncate">
                        <span className="text-neutral-500">Prediction Source:</span>{' '}
                        <strong className="text-neutral-300">
                          {previewTxn.predictionSource || (isMl ? 'HistGradientBoostingClassifier' : 'Demo Benchmark')}
                        </strong>
                      </div>
                    </div>

                    {isAlreadyCreated && (
                      <div className="mt-2 p-2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 shrink-0" />
                        <span>An evidence case already exists for this transaction. Clicking continue will open it.</span>
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#222] hover:bg-[#333] text-neutral-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs cursor-pointer transition-colors"
                >
                  Initialize Evidence Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Synthetic Demo Disclaimer */}
      <div className="p-3.5 rounded-xl bg-[#121212] border border-[#262626] text-center text-xs text-neutral-500">
        <span>
          ChargeGuard AI Evidence Center organizes merchant dispute documentation based on the defense checklist. Transactions and evidence cases utilize synthetic demonstration records.
        </span>
      </div>
    </div>
  );
};
