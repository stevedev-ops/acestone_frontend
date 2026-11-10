import React, { useState } from 'react';
import { PaymentMethod, PaymentStatus } from '../../types';
import { formatKSh } from '../../utils/formatters';
import { 
  CreditCard, 
  Banknote, 
  Smartphone, 
  Building2, 
  Split, 
  User, 
  Phone, 
  FileText, 
  Check, 
  X, 
  Loader2,
  CheckCircle2
} from 'lucide-react';

interface PaymentModalProps {
  totalAmount: number;
  isOpen: boolean;
  onClose: () => void;
  onProcessPayment: (paymentDetails: {
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    amountPaid: number;
    balanceDue: number;
    customerName?: string;
    customerPhone?: string;
    customerNotes?: string;
    mpesaRef?: string;
  }) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  totalAmount,
  isOpen,
  onClose,
  onProcessPayment,
}) => {
  const [method, setMethod] = useState<PaymentMethod>('M-Pesa');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+254 ');
  const [customerNotes, setCustomerNotes] = useState('');
  
  // Specific payment states
  const [mpesaPhone, setMpesaPhone] = useState('+254 7');
  const [mpesaRef, setMpesaRef] = useState('QKL' + Math.floor(100000 + Math.random() * 900000));
  const [isSimulatingSTK, setIsSimulatingSTK] = useState(false);
  const [stkSuccess, setStkSuccess] = useState(false);

  // Cash calculation
  const [cashTendered, setCashTendered] = useState<number>(totalAmount);
  
  // Split payment
  const [splitMpesa, setSplitMpesa] = useState<number>(Math.round(totalAmount / 2));
  const [splitCash, setSplitCash] = useState<number>(totalAmount - Math.round(totalAmount / 2));

  // Partial Payment toggle
  const [isPartialPayment, setIsPartialPayment] = useState(false);
  const [customAmountPaid, setCustomAmountPaid] = useState<number>(totalAmount);

  if (!isOpen) return null;

  const actualAmountPaid = isPartialPayment ? customAmountPaid : totalAmount;
  const balanceDue = Math.max(0, totalAmount - actualAmountPaid);
  const paymentStatus: PaymentStatus = balanceDue > 0 ? 'Partial' : 'Completed';

  const cashChange = Math.max(0, cashTendered - actualAmountPaid);

  const handleSimulateSTK = () => {
    setIsSimulatingSTK(true);
    setTimeout(() => {
      setIsSimulatingSTK(false);
      setStkSuccess(true);
      setMpesaRef('QKL' + Math.floor(100000 + Math.random() * 900000));
    }, 1500);
  };

  const handleComplete = () => {
    onProcessPayment({
      paymentMethod: method,
      paymentStatus,
      amountPaid: actualAmountPaid,
      balanceDue,
      customerName: customerName.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
      customerNotes: customerNotes.trim() || undefined,
      mpesaRef: method === 'M-Pesa' ? mpesaRef : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-charcoal-900 border border-gold-500/40 rounded-2xl max-w-lg w-full p-6 shadow-premium relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-charcoal-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/40 flex items-center justify-center text-gold-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-brand">
              Process Jewellery Payment
            </h3>
            <p className="text-xs text-slate-400">
              Total Negotiated Amount:{' '}
              <strong className="text-gold-400 text-sm">{formatKSh(totalAmount)}</strong>
            </p>
          </div>
        </div>

        {/* Payment Method Selector Pills */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-5">
          {(['M-Pesa', 'Cash', 'Card', 'Bank Transfer', 'Split'] as PaymentMethod[]).map((m) => {
            const isSelected = method === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center space-y-1 ${
                  isSelected
                    ? 'bg-gold-500 text-charcoal-950 font-bold border-gold-400 shadow-gold-glow'
                    : 'bg-charcoal-950 text-slate-300 border-charcoal-800 hover:bg-charcoal-800'
                }`}
              >
                {m === 'M-Pesa' && <Smartphone className="w-4 h-4" />}
                {m === 'Cash' && <Banknote className="w-4 h-4" />}
                {m === 'Card' && <CreditCard className="w-4 h-4" />}
                {m === 'Bank Transfer' && <Building2 className="w-4 h-4" />}
                {m === 'Split' && <Split className="w-4 h-4" />}
                <span className="text-[10px] leading-none">{m}</span>
              </button>
            );
          })}
        </div>

        {/* Method-Specific Inputs */}
        <div className="bg-charcoal-950 p-4 rounded-xl border border-charcoal-800 mb-5">
          {method === 'M-Pesa' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                  M-Pesa Express (Safaricom)
                </span>
                <span className="text-[10px] text-slate-400">Till: 402919</span>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Customer M-Pesa Phone Number
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={mpesaPhone}
                    onChange={(e) => setMpesaPhone(e.target.value)}
                    className="flex-1 px-3 py-2 bg-charcoal-900 border border-charcoal-700 rounded-lg text-white text-xs font-mono"
                    placeholder="+254 712 345 678"
                  />
                  <button
                    type="button"
                    onClick={handleSimulateSTK}
                    disabled={isSimulatingSTK}
                    className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1"
                  >
                    {isSimulatingSTK ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Prompting...</span>
                      </>
                    ) : (
                      <span>Send STK</span>
                    )}
                  </button>
                </div>
              </div>

              {stkSuccess && (
                <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Customer confirmed PIN! Confirmed ref: {mpesaRef}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  M-Pesa Transaction Reference Code
                </label>
                <input
                  type="text"
                  value={mpesaRef}
                  onChange={(e) => setMpesaRef(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-charcoal-900 border border-charcoal-700 rounded-lg text-gold-400 font-mono text-xs uppercase font-bold"
                  placeholder="e.g. QKL8921820"
                />
              </div>
            </div>
          )}

          {method === 'Cash' && (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Cash Tendered by Customer (KSh)
                </label>
                <input
                  type="number"
                  value={cashTendered}
                  onChange={(e) => setCashTendered(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-charcoal-900 border border-charcoal-700 rounded-lg text-white font-mono text-sm"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-charcoal-900 border border-charcoal-800 text-xs">
                <span className="text-slate-400">Change Due to Customer:</span>
                <span className={`font-mono font-bold text-sm ${cashChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatKSh(cashChange)}
                </span>
              </div>
            </div>
          )}

          {method === 'Card' && (
            <div className="space-y-2">
              <label className="block text-[11px] text-slate-400">
                POS Terminal Auth Approval Code
              </label>
              <input
                type="text"
                defaultValue="AUTH-VISA-9921"
                className="w-full px-3 py-2 bg-charcoal-900 border border-charcoal-700 rounded-lg text-white font-mono text-xs"
              />
              <span className="text-[10px] text-slate-500 block">
                Insert / Tap customer Visa, Mastercard or Amex on the bank counter terminal.
              </span>
            </div>
          )}

          {method === 'Bank Transfer' && (
            <div className="space-y-2">
              <label className="block text-[11px] text-slate-400">
                RTGS / EFT Reference Confirmation
              </label>
              <input
                type="text"
                defaultValue="EFT-NCBA-88219"
                className="w-full px-3 py-2 bg-charcoal-900 border border-charcoal-700 rounded-lg text-white font-mono text-xs"
              />
              <span className="text-[10px] text-slate-500 block">
                Acestone Jewellery NCBA Account: 0100 2938 1192
              </span>
            </div>
          )}

          {method === 'Split' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    M-Pesa Amount (KSh)
                  </label>
                  <input
                    type="number"
                    value={splitMpesa}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setSplitMpesa(val);
                      setSplitCash(totalAmount - val);
                    }}
                    className="w-full px-3 py-2 bg-charcoal-900 border border-charcoal-700 rounded-lg text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Cash Amount (KSh)
                  </label>
                  <input
                    type="number"
                    value={splitCash}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setSplitCash(val);
                      setSplitMpesa(totalAmount - val);
                    }}
                    className="w-full px-3 py-2 bg-charcoal-900 border border-charcoal-700 rounded-lg text-white text-xs font-mono"
                  />
                </div>
              </div>
              <div className="text-[11px] text-slate-400 text-right">
                Sum: {formatKSh(splitMpesa + splitCash)} (Total required: {formatKSh(totalAmount)})
              </div>
            </div>
          )}
        </div>

        {/* Customer Information (Optional) */}
        <div className="space-y-3 mb-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Customer Information (Optional)
            </span>
            <label className="flex items-center space-x-1.5 text-xs text-gold-400 cursor-pointer">
              <input
                type="checkbox"
                checked={isPartialPayment}
                onChange={(e) => setIsPartialPayment(e.target.checked)}
                className="rounded border-charcoal-700 text-gold-500 focus:ring-0"
              />
              <span>Partial Deposit / Layaway</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Client Name (e.g. Faith Wanjiku)"
                className="w-full px-3 py-2 bg-charcoal-950 border border-charcoal-700 rounded-xl text-white text-xs focus:outline-none focus:border-gold-500"
              />
            </div>
            <div>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Client Mobile (+254 7...)"
                className="w-full px-3 py-2 bg-charcoal-950 border border-charcoal-700 rounded-xl text-white text-xs focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>

          {isPartialPayment && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-amber-300 font-semibold">Deposit Paid Today:</span>
                <input
                  type="number"
                  value={customAmountPaid}
                  onChange={(e) => setCustomAmountPaid(Number(e.target.value))}
                  className="w-32 px-2 py-1 bg-charcoal-900 border border-amber-500/40 rounded text-right font-mono text-white text-xs"
                />
              </div>
              <div className="flex justify-between text-xs text-slate-300">
                <span>Remaining Balance Due:</span>
                <strong className="text-red-400 font-mono">{formatKSh(balanceDue)}</strong>
              </div>
            </div>
          )}

          <div>
            <input
              type="text"
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              placeholder="Notes (e.g. Custom chain clasp requested, resizing, VIP)"
              className="w-full px-3 py-2 bg-charcoal-950 border border-charcoal-700 rounded-xl text-white text-xs focus:outline-none focus:border-gold-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 pt-3 border-t border-charcoal-800">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-slate-300 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleComplete}
            className="flex-1 py-2.5 px-4 rounded-xl gold-button-gradient text-charcoal-950 font-bold text-xs shadow-gold-glow flex items-center justify-center space-x-2"
          >
            <Check className="w-4 h-4" />
            <span>Confirm & Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};

