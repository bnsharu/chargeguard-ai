import React, { useState, useEffect } from 'react';
import { initialDemoTransactions } from './data/demoTransactions';
import { Transaction, TransactionStatus, EvidenceCase } from './types';
import { initializeSeedEvidenceCases, createEvidenceCaseForTransaction } from './services/evidenceService';
import { Navbar, NavTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { RealTimeAnalysisView } from './components/RealTimeAnalysisView';
import { TransactionsView } from './components/TransactionsView';
import { RiskAnalysisView } from './components/RiskAnalysisView';
import { EvidenceCenterView } from './components/EvidenceCenterView';
import { ModelPerformanceView } from './components/ModelPerformanceView';
import { SimulateTransactionModal } from './components/SimulateTransactionModal';
import { ToastProvider, useToast } from './components/Toast';

function AppContent() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('chargeguard_transactions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse cached transactions', e);
      }
    }
    return initialDemoTransactions;
  });

  const [evidenceCases, setEvidenceCases] = useState<EvidenceCase[]>(() => {
    const saved = localStorage.getItem('chargeguard_evidence_cases');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse cached evidence cases', e);
      }
    }
    return initializeSeedEvidenceCases(initialDemoTransactions);
  });

  const [selectedEvidenceCaseId, setSelectedEvidenceCaseId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(() => {
    return initialDemoTransactions.find(t => t.riskLevel === 'HIGH') || initialDemoTransactions[0];
  });
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);

  // Sync transactions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('chargeguard_transactions', JSON.stringify(transactions));
    } catch (e) {
      console.warn('LocalStorage limit reached or disabled', e);
    }
  }, [transactions]);

  // Sync evidenceCases to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('chargeguard_evidence_cases', JSON.stringify(evidenceCases));
    } catch (e) {
      console.warn('LocalStorage limit reached for evidence cases', e);
    }
  }, [evidenceCases]);

  // Update status handler
  const handleUpdateStatus = (id: string, newStatus: TransactionStatus) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
    if (selectedTransaction && selectedTransaction.id === id) {
      setSelectedTransaction((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  // Reset to default 32+ demo transactions & default evidence cases
  const handleResetData = () => {
    setTransactions(initialDemoTransactions);
    setSelectedTransaction(initialDemoTransactions.find(t => t.riskLevel === 'HIGH') || initialDemoTransactions[0]);
    setEvidenceCases(initializeSeedEvidenceCases(initialDemoTransactions));
    setSelectedEvidenceCaseId(null);
    localStorage.removeItem('chargeguard_transactions');
    localStorage.removeItem('chargeguard_evidence_cases');
  };

  // Add new simulated transaction
  const handleAddTransaction = (newTxn: Transaction) => {
    setTransactions((prev) => {
      if (prev.some(t => t.id === newTxn.id)) return prev;
      return [newTxn, ...prev];
    });
    setSelectedTransaction(newTxn);
    setActiveTab('risk-analysis');
  };

  // Open or create evidence case for a specific transaction (Section 13 & 14)
  const handleOpenOrCreateEvidenceCase = (txn: Transaction) => {
    const existing = evidenceCases.find((c) => c.transactionId === txn.id);
    if (existing) {
      setSelectedEvidenceCaseId(existing.id);
    } else {
      const newCase = createEvidenceCaseForTransaction(txn, evidenceCases.length);
      setEvidenceCases((prev) => [newCase, ...prev]);
      setSelectedEvidenceCaseId(newCase.id);
    }
    setSelectedTransaction(txn);
    setActiveTab('evidence-center');
  };

  const highRiskCount = transactions.filter(t => t.riskLevel === 'HIGH').length;
  const disputeCount = transactions.filter(t => t.chargebackDispute?.isDisputed).length;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSimulateModal={() => setIsSimulateModalOpen(true)}
        onResetData={handleResetData}
        disputeCount={disputeCount}
        highRiskCount={highRiskCount}
      />

      {/* Main View Router */}
      <main className="flex-1 pb-16">
        {activeTab === 'dashboard' && (
          <DashboardView
            transactions={transactions}
            onSelectTransaction={(txn) => {
              setSelectedTransaction(txn);
              setActiveTab('risk-analysis');
            }}
            setActiveTab={setActiveTab}
            onOpenSimulateModal={() => setIsSimulateModalOpen(true)}
          />
        )}

        {activeTab === 'realtime-analysis' && (
          <RealTimeAnalysisView
            onAddTransaction={(newTxn) => {
              setTransactions((prev) => {
                if (prev.some(t => t.id === newTxn.id)) return prev;
                return [newTxn, ...prev];
              });
              setSelectedTransaction(newTxn);
            }}
            onOpenEvidenceForTransaction={handleOpenOrCreateEvidenceCase}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView
            transactions={transactions}
            onSelectTransaction={(txn) => {
              setSelectedTransaction(txn);
              setActiveTab('risk-analysis');
            }}
            onOpenSimulateModal={() => setIsSimulateModalOpen(true)}
            onNavigateToRealTime={() => setActiveTab('realtime-analysis')}
            evidenceCases={evidenceCases}
            onOpenOrCreateEvidenceCase={handleOpenOrCreateEvidenceCase}
          />
        )}

        {activeTab === 'risk-analysis' && (
          <RiskAnalysisView
            transaction={selectedTransaction}
            allTransactions={transactions}
            onSelectTransaction={(txn) => setSelectedTransaction(txn)}
            onUpdateTransactionStatus={handleUpdateStatus}
            setActiveTab={setActiveTab}
            onOpenEvidenceForTransaction={handleOpenOrCreateEvidenceCase}
            evidenceCases={evidenceCases}
          />
        )}

        {activeTab === 'evidence-center' && (
          <EvidenceCenterView
            transactions={transactions}
            selectedTransaction={selectedTransaction}
            onSelectTransaction={(txn) => setSelectedTransaction(txn)}
            evidenceCases={evidenceCases}
            onUpdateEvidenceCases={setEvidenceCases}
            activeEvidenceCaseId={selectedEvidenceCaseId}
            onSelectEvidenceCaseId={setSelectedEvidenceCaseId}
          />
        )}

        {activeTab === 'model-performance' && (
          <ModelPerformanceView />
        )}
      </main>

      {/* Simulation Modal */}
      <SimulateTransactionModal
        isOpen={isSimulateModalOpen}
        onClose={() => setIsSimulateModalOpen(false)}
        onAddTransaction={handleAddTransaction}
      />
    </div>
  );
}

export function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
