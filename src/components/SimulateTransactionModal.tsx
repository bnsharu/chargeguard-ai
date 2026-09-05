import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Smartphone, 
  CreditCard, 
  PlusCircle, 
  Layers,
  Check
} from 'lucide-react';
import { Transaction, PaymentMethodType, Auth3DSStatus } from '../types';
import { calculateTransactionRisk } from '../services/riskEngine';
import { useToast } from './Toast';

interface SimulateTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (txn: Transaction) => void;
}

export const SimulateTransactionModal: React.FC<SimulateTransactionModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
}) => {
  const { showToast } = useToast();

  // Form State
  const [customerName, setCustomerName] = useState('Raghav Sharma');
  const [customerEmail, setCustomerEmail] = useState('raghav.s@gmail.com');
  const [customerCity, setCustomerCity] = useState('Bengaluru');
  const [amountINR, setAmountINR] = useState(48999);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('CREDIT_CARD');
  const [cardBrand, setCardBrand] = useState('Visa Platinum');
  const [auth3DS, setAuth3DS] = useState<Auth3DSStatus>('CHALLENGE_FAILED');
  const [accountAgeDays, setAccountAgeDays] = useState(2);
  const [failedAttempts, setFailedAttempts] = useState(3);
  const [addressMatch, setAddressMatch] = useState(false);
  const [isVpn, setIsVpn] = useState(true);
  const [productTitle, setProductTitle] = useState('Sony PlayStation 5 Digital Edition');

  if (!isOpen) return null;

  // Preset loader
  const loadPreset = (type: 'HIGH_RISK_TESTING' | 'SAFE_UPI' | 'MEDIUM_VARIANCE' | 'GIFT_CARD_ATTACK') => {
    if (type === 'HIGH_RISK_TESTING') {
      setCustomerName('Vikram Malhotra');
      setCustomerEmail('temp_user99281@protonmail.com');
      setCustomerCity('Surat');
      setAmountINR(89999);
      setPaymentMethod('CREDIT_CARD');
      setCardBrand('Mastercard World');
      setAuth3DS('CHALLENGE_FAILED');
      setAccountAgeDays(1);
      setFailedAttempts(4);
      setAddressMatch(false);
      setIsVpn(true);
      setProductTitle('Apple iPhone 16 Pro 256GB Desert Titanium');
    } else if (type === 'SAFE_UPI') {
      setCustomerName('Ananya Iyer');
      setCustomerEmail('ananya.iyer@tcs.com');
      setCustomerCity('Chennai');
      setAmountINR(4200);
      setPaymentMethod('UPI');
      setCardBrand('');
      setAuth3DS('AUTHENTICATED');
      setAccountAgeDays(240);
      setFailedAttempts(0);
      setAddressMatch(true);
      setIsVpn(false);
      setProductTitle('Cotton Silk Handloom Saree');
    } else if (type === 'MEDIUM_VARIANCE') {
      setCustomerName('Rohan Deshmukh');
      setCustomerEmail('rohan.deshmukh@gmail.com');
      setCustomerCity('Pune');
      setAmountINR(18500);
      setPaymentMethod('DEBIT_CARD');
      setCardBrand('HDFC Visa Debit');
      setAuth3DS('AUTHENTICATED');
      setAccountAgeDays(14);
      setFailedAttempts(1);
      setAddressMatch(false);
      setIsVpn(false);
      setProductTitle('Sony WH-1000XM5 Wireless Headphones');
    } else if (type === 'GIFT_CARD_ATTACK') {
      setCustomerName('Guest Checkout');
      setCustomerEmail('fastdeal_india@mailinator.com');
      setCustomerCity('Noida');
      setAmountINR(50000);
      setPaymentMethod('CREDIT_CARD');
      setCardBrand('Amex Gold');
      setAuth3DS('NOT_ENROLLED');
      setAccountAgeDays(0);
      setFailedAttempts(5);
      setAddressMatch(false);
      setIsVpn(true);
      setProductTitle('Amazon Pay Instant E-Gift Card ₹10,000 (x5)');
    }
  };

  // Build simulated object
  const tempTxn: Transaction = {
    id: `txn_in_${Math.random().toString(36).substring(2, 8)}`,
    orderId: `ORD-IN-${Math.floor(100000 + Math.random() * 900000)}`,
    timestamp: new Date().toISOString(),
    amountINR: Number(amountINR) || 1000,
    currency: 'INR',
    customer: {
      id: `cust_${Math.random().toString(36).substring(2, 7)}`,
      name: customerName,
      email: customerEmail,
      phone: '+91 98841 55210',
      accountAgeDays: Number(accountAgeDays),
      totalPastOrders: accountAgeDays > 60 ? 8 : accountAgeDays > 10 ? 2 : 0,
      totalPastSpentINR: accountAgeDays > 60 ? 45000 : 0,
      pastChargebackCount: failedAttempts > 3 ? 1 : 0,
      pastDisputeRate: 0,
      ipAddress: isVpn ? '185.220.101.44' : '103.15.24.89',
      isVpnProxy: isVpn,
      deviceFingerprint: `dev_${Math.random().toString(36).substring(2, 9)}`,
      deviceType: 'Mobile (Android)',
      locationCity: customerCity,
      locationState: 'Karnataka',
      locationCountry: 'IN'
    },
    payment: {
      method: paymentMethod,
      cardNetwork: cardBrand ? (cardBrand.includes('Visa') ? 'Visa' : cardBrand.includes('Mastercard') ? 'Mastercard' : 'Amex') : undefined,
      cardLast4: paymentMethod !== 'UPI' ? '8812' : undefined,
      authStatus3DS: auth3DS,
      gatewayRefId: `pay_${Math.random().toString(36).substring(2, 10)}`,
      paymentGateway: 'Razorpay',
      arnRrn: `728190${Math.floor(100000 + Math.random() * 900000)}`
    },
    billingAddress: {
      line1: '14, Residency Road',
      city: addressMatch ? customerCity : 'Mumbai',
      state: addressMatch ? 'Karnataka' : 'Maharashtra',
      postalCode: '560025',
      country: 'IN'
    },
    shippingAddress: {
      line1: 'Flat 402, Green Glen Layout, Bellandur',
      city: customerCity,
      state: 'Karnataka',
      postalCode: '560103',
      country: 'IN'
    },
    billingShippingMatch: addressMatch,
    deliveryStatus: 'PENDING_FULFILLMENT',
    items: [
      {
        id: 'item_1',
        title: productTitle,
        category: 'Consumer Electronics',
        quantity: 1,
        unitPriceINR: Number(amountINR) || 1000,
        isHighResaleRisk: Number(amountINR) > 20000
      }
    ],
    velocity: {
      txnsLast1Hour: failedAttempts > 2 ? 3 : 1,
      txnsLast24Hours: failedAttempts > 2 ? 6 : 1,
      failedAttemptsLast24h: Number(failedAttempts),
      deviceSwitchesLast7Days: failedAttempts > 2 ? 3 : 0,
      uniqueCardsUsed24h: failedAttempts > 2 ? 3 : 1
    },
    riskScore: 0,
    riskLevel: 'LOW',
    recommendedAction: 'APPROVE',
    actionReason: 'Pending evaluation',
    riskFactors: [],
    status: 'UNDER_VERIFICATION'
  };

  const calculated = calculateTransactionRisk(tempTxn);
  tempTxn.riskScore = calculated.riskScore;
  tempTxn.riskLevel = calculated.riskLevel;
  tempTxn.chargebackProbability = calculated.chargebackProbability;
  tempTxn.recommendedAction = calculated.recommendedAction;
  tempTxn.actionReason = calculated.actionReason;
  tempTxn.aiRiskAssessment = calculated.aiExplanation;
  tempTxn.riskFactors = calculated.riskFactors;
  tempTxn.isRealTimeAnalysis = true;
  tempTxn.status = calculated.riskLevel === 'HIGH' ? 'UNDER_VERIFICATION' : calculated.riskLevel === 'MEDIUM' ? 'MONITORED' : 'APPROVED';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTransaction(tempTxn);
    showToast({
      type: calculated.riskLevel === 'HIGH' ? 'warning' : 'success',
      title: 'Transaction Ingested',
      description: `Order #${tempTxn.orderId} scored ${tempTxn.riskScore}/100 (${calculated.chargebackProbability}% Chargeback Prob).`
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#171717] border border-[#262626] rounded-xl shadow-2xl max-w-2xl w-full my-8 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#262626] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Simulate Merchant Transaction</h2>
              <p className="text-xs text-neutral-400">Test how payment and identity signals shape the risk engine score</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#262626] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="px-5 pt-4 pb-3 border-b border-[#262626] bg-[#0F0F0F]">
          <span className="text-[11px] font-semibold text-neutral-400 block mb-2">Instant Threat & Normal Presets:</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <button
              type="button"
              onClick={() => loadPreset('SAFE_UPI')}
              className="p-2.5 rounded-lg bg-[#171717] border border-[#262626] hover:border-green-500/40 text-left transition-colors cursor-pointer"
            >
              <span className="font-bold block text-[11px] text-green-400">Safe UPI Repeat</span>
              <span className="text-[10px] text-neutral-500">Low Risk (~10)</span>
            </button>

            <button
              type="button"
              onClick={() => loadPreset('HIGH_RISK_TESTING')}
              className="p-2.5 rounded-lg bg-[#171717] border border-[#262626] hover:border-red-500/40 text-left transition-colors cursor-pointer"
            >
              <span className="font-bold block text-[11px] text-red-400">Card Testing Attack</span>
              <span className="text-[10px] text-neutral-500">High Risk (~88)</span>
            </button>

            <button
              type="button"
              onClick={() => loadPreset('MEDIUM_VARIANCE')}
              className="p-2.5 rounded-lg bg-[#171717] border border-[#262626] hover:border-amber-500/40 text-left transition-colors cursor-pointer"
            >
              <span className="font-bold block text-[11px] text-amber-400">Address Mismatch</span>
              <span className="text-[10px] text-neutral-500">Medium (~58)</span>
            </button>

            <button
              type="button"
              onClick={() => loadPreset('GIFT_CARD_ATTACK')}
              className="p-2.5 rounded-lg bg-[#171717] border border-[#262626] hover:border-purple-500/40 text-left transition-colors cursor-pointer"
            >
              <span className="font-bold block text-[11px] text-purple-400">Voucher Resale Burst</span>
              <span className="text-[10px] text-neutral-500">Critical (~95)</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-neutral-400 font-medium block mb-1">Customer Name:</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                className="w-full py-2 px-3 rounded-lg bg-[#0F0F0F] border border-[#262626] text-neutral-200 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <label className="text-neutral-400 font-medium block mb-1">Customer City / Location:</label>
              <input
                type="text"
                value={customerCity}
                onChange={(e) => setCustomerCity(e.target.value)}
                required
                className="w-full py-2 px-3 rounded-lg bg-[#0F0F0F] border border-[#262626] text-neutral-200 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <label className="text-neutral-400 font-medium block mb-1">Amount (INR ₹):</label>
              <input
                type="number"
                min="100"
                max="500000"
                value={amountINR}
                onChange={(e) => setAmountINR(Number(e.target.value))}
                required
                className="w-full py-2 px-3 rounded-lg bg-[#0F0F0F] border border-[#262626] text-white font-mono font-bold focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <label className="text-neutral-400 font-medium block mb-1">Product Description:</label>
              <input
                type="text"
                value={productTitle}
                onChange={(e) => setProductTitle(e.target.value)}
                required
                className="w-full py-2 px-3 rounded-lg bg-[#0F0F0F] border border-[#262626] text-neutral-200 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <label className="text-neutral-400 font-medium block mb-1">Payment Method:</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full py-2 px-3 rounded-lg bg-[#0F0F0F] border border-[#262626] text-neutral-200 focus:outline-none focus:border-amber-500/50"
              >
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="UPI">UPI / QR Code</option>
                <option value="DEBIT_CARD">Debit Card</option>
                <option value="EMI">EMI</option>
              </select>
            </div>

            <div>
              <label className="text-neutral-400 font-medium block mb-1">3-D Secure Authentication:</label>
              <select
                value={auth3DS}
                onChange={(e) => setAuth3DS(e.target.value as any)}
                className="w-full py-2 px-3 rounded-lg bg-[#0F0F0F] border border-[#262626] text-neutral-200 focus:outline-none focus:border-amber-500/50"
              >
                <option value="AUTHENTICATED">AUTHENTICATED (Issuer Liability Shift)</option>
                <option value="FRICTIONLESS_SUCCESS">FRICTIONLESS_SUCCESS (Verified)</option>
                <option value="CHALLENGE_FAILED">CHALLENGE_FAILED (OTP Failed / Bypassed)</option>
                <option value="NOT_ENROLLED">NOT_ENROLLED (No Liability Shift)</option>
              </select>
            </div>

            <div>
              <label className="text-neutral-400 font-medium block mb-1">Account Age (Days):</label>
              <input
                type="number"
                min="0"
                max="730"
                value={accountAgeDays}
                onChange={(e) => setAccountAgeDays(Number(e.target.value))}
                className="w-full py-2 px-3 rounded-lg bg-[#0F0F0F] border border-[#262626] text-neutral-200 font-mono focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <label className="text-neutral-400 font-medium block mb-1">Failed Attempts (24h):</label>
              <input
                type="number"
                min="0"
                max="10"
                value={failedAttempts}
                onChange={(e) => setFailedAttempts(Number(e.target.value))}
                className="w-full py-2 px-3 rounded-lg bg-[#0F0F0F] border border-[#262626] text-neutral-200 font-mono focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => setAddressMatch(!addressMatch)}
              className={`py-2 px-3 rounded-lg border text-center transition-colors cursor-pointer ${
                addressMatch ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
            >
              {addressMatch ? '✓ Billing Matches Shipping' : '✗ Shipping Address Mismatch'}
            </button>

            <button
              type="button"
              onClick={() => setIsVpn(!isVpn)}
              className={`py-2 px-3 rounded-lg border text-center transition-colors cursor-pointer ${
                !isVpn ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
            >
              {isVpn ? '⚠ VPN / Proxy Detected' : '✓ Residential Clean IP'}
            </button>
          </div>

          {/* Live Calculated Score Output */}
          <div className="p-4 rounded-lg bg-[#0F0F0F] border border-[#262626] flex items-center justify-between">
            <div>
              <span className="text-neutral-400 text-[11px] block">Live Evaluated Chargeback Risk:</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-xl font-bold font-mono ${
                  tempTxn.riskScore >= 70 ? 'text-red-400' : tempTxn.riskScore >= 36 ? 'text-amber-400' : 'text-green-400'
                }`}>
                  {tempTxn.riskScore}/100
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase border ${
                  tempTxn.riskLevel === 'HIGH' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                  tempTxn.riskLevel === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                  'bg-green-500/10 text-green-400 border-green-500/20'
                }`}>
                  {tempTxn.riskLevel} RISK
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-neutral-400 text-[11px] block">Merchant Action:</span>
              <strong className="text-amber-400 font-bold text-xs">{tempTxn.recommendedAction.replace('_', ' ')}</strong>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#0F0F0F] hover:bg-[#262626] text-neutral-300 hover:text-white border border-[#262626] font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold transition-all cursor-pointer shadow-sm"
            >
              Inject Into Live Ledger
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
