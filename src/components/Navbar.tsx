import React from 'react';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Receipt, 
  FileCheck2, 
  Activity, 
  PlusCircle, 
  Sparkles,
  RefreshCw,
  Building2,
  Zap
} from 'lucide-react';

export type NavTab = 'dashboard' | 'transactions' | 'realtime-analysis' | 'risk-analysis' | 'evidence-center' | 'model-performance';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenSimulateModal: () => void;
  onResetData: () => void;
  disputeCount: number;
  highRiskCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSimulateModal,
  onResetData,
  disputeCount,
  highRiskCount,
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'realtime-analysis' as NavTab,
      label: 'Real-Time Analysis',
      icon: Zap,
      badge: 'Live',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    },
    {
      id: 'transactions' as NavTab,
      label: 'Transactions',
      icon: Receipt,
      badge: highRiskCount > 0 ? `${highRiskCount} Risk` : null,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
    },
    {
      id: 'risk-analysis' as NavTab,
      label: 'Risk Details',
      icon: Activity,
      badge: null
    },
    {
      id: 'evidence-center' as NavTab,
      label: 'Evidence Center',
      icon: FileCheck2,
      badge: disputeCount > 0 ? `${disputeCount} Open` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    },
    {
      id: 'model-performance' as NavTab,
      label: 'Model Performance',
      icon: Sparkles,
      badge: 'ML LIVE',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#262626]">
      {/* Top Notification / Merchant Ribbon */}
      <div className="bg-[#0F0F0F] border-b border-[#262626] px-4 py-1.5 text-xs text-neutral-400 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-neutral-300">
            <Building2 className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-semibold text-white">Apex Retail India Pvt Ltd</span>
            <span className="text-neutral-600">•</span>
            <span className="text-neutral-400">Gateway: Razorpay / 3DS 2.0 Active</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="font-medium">Demo Environment</span>
            <span className="text-amber-500/60">• Real-Time Dispute Sandbox</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-neutral-400 text-[11px] hidden md:inline">Currency: <strong className="text-white">INR (₹)</strong></span>
          <button 
            onClick={onResetData}
            title="Reset to default 32+ demo transactions"
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#171717] hover:bg-[#262626] border border-[#262626] text-neutral-400 hover:text-white transition-colors text-[11px]"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center shadow-md shadow-amber-500/20">
              <ShieldCheck className="w-5 h-5 text-black font-black stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white">
                  ChargeGuard <span className="text-amber-500">AI</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  Defense
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-normal">
                AI-powered chargeback risk management
              </p>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors duration-150 ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-500' : 'text-neutral-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full border ${item.badgeColor || 'bg-[#171717] text-neutral-300 border-[#262626]'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Button */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenSimulateModal}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors cursor-pointer shadow-sm"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Simulate Transaction</span>
              <span className="sm:hidden">Simulate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Scroll Row */}
      <div className="lg:hidden flex items-center gap-1.5 px-4 py-2 overflow-x-auto border-t border-[#262626] bg-[#0F0F0F]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
              {item.badge && (
                <span className="text-[9px] px-1 rounded bg-[#262626] text-neutral-300">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
