import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { JewelleryItem } from '../../types';
import { formatKSh } from '../../utils/formatters';
import { ShieldCheck, KeyRound, AlertTriangle, X, CheckCircle, UserCheck } from 'lucide-react';

interface ApprovalModalProps {
  item: JewelleryItem;
  proposedPrice: number;
  isOpen: boolean;
  onClose: () => void;
  onApproved: (approverName: string, notes?: string) => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  item,
  proposedPrice,
  isOpen,
  onClose,
  onApproved,
}) => {
  const { verifyPin, availableUsers } = useAuth();
  const [pin, setPin] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!pin.trim()) {
      setError('Please enter Boss or Manager authorization PIN.');
      return;
    }

    const result = verifyPin(pin);
    if (result.valid && result.approverName) {
      onApproved(result.approverName, notes || 'Approved below-minimum price exception.');
      setPin('');
      setNotes('');
      onClose();
    } else {
      setError('Incorrect authorization PIN. Owner or Manager authorization required.');
    }
  };

  const handleQuickApprove = (approver: typeof availableUsers[0]) => {
    onApproved(
      `${approver.name} (${approver.role === 'OWNER' ? 'Owner' : 'Manager'})`,
      notes || `Authorized by ${approver.name} via quick supervisor bypass.`
    );
    setPin('');
    setNotes('');
    onClose();
  };

  const discountAmount = item.suggestedPrice - proposedPrice;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-charcoal-900 border border-amber-500/50 rounded-2xl max-w-md w-full p-6 shadow-premium relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-charcoal-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Alert */}
        <div className="flex items-start space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center flex-shrink-0 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-brand">
              Manager / Boss Price Approval
            </h3>
            <p className="text-xs text-amber-300/90 mt-0.5">
              Proposed price is below the minimum allowable selling threshold.
            </p>
          </div>
        </div>

        {/* Transaction Summary Card */}
        <div className="bg-charcoal-950 p-3.5 rounded-xl border border-charcoal-800 mb-5 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Jewellery Item:</span>
            <span className="font-semibold text-white text-right truncate max-w-[200px]">
              {item.name} ({item.code})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Suggested Price:</span>
            <span className="text-slate-300 font-medium">{formatKSh(item.suggestedPrice)}</span>
          </div>
          <div className="flex justify-between border-t border-charcoal-800/80 pt-2">
            <span className="text-amber-400 font-bold">Proposed Selling Price:</span>
            <span className="text-amber-400 font-extrabold text-sm">{formatKSh(proposedPrice)}</span>
          </div>
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Special Discount:</span>
            <span className="text-red-400 font-semibold">- {formatKSh(discountAmount)}</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Owner / Manager PIN (e.g. 1234 or 5678)
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter 4-digit PIN"
                autoFocus
                className="w-full pl-9 pr-3 py-2.5 bg-charcoal-950 border border-charcoal-700 rounded-xl text-white text-sm focus:outline-none focus:border-gold-500 font-mono tracking-widest"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Reason / Justification (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Special cash bundle deal for loyal client"
              className="w-full p-2.5 bg-charcoal-950 border border-charcoal-700 rounded-xl text-white text-xs focus:outline-none focus:border-gold-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl gold-button-gradient text-charcoal-950 font-bold text-xs shadow-gold-glow flex items-center justify-center space-x-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Authenticate & Authorize Price</span>
          </button>
        </form>

        {/* Fast Supervisor Demo Authorizer */}
        <div className="mt-5 pt-4 border-t border-charcoal-800">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Supervisor On Duty (1-Click Authorize):
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickApprove(availableUsers[0])} // Sarah Stone (Owner)
              className="p-2 rounded-lg bg-charcoal-950 hover:bg-charcoal-800 border border-charcoal-800 hover:border-gold-500/40 text-left transition-colors flex items-center space-x-2"
            >
              <img
                src={availableUsers[0].avatar}
                alt="Sarah"
                className="w-6 h-6 rounded-full object-cover border border-gold-500/40"
              />
              <div className="truncate">
                <span className="text-[11px] font-bold text-white block truncate">
                  Sarah Stone
                </span>
                <span className="text-[9px] text-gold-400 block">PIN: 1234 (Owner)</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickApprove(availableUsers[3])} // Grace Mwangi (Manager)
              className="p-2 rounded-lg bg-charcoal-950 hover:bg-charcoal-800 border border-charcoal-800 hover:border-amber-500/40 text-left transition-colors flex items-center space-x-2"
            >
              <img
                src={availableUsers[3].avatar}
                alt="Grace"
                className="w-6 h-6 rounded-full object-cover border border-amber-500/40"
              />
              <div className="truncate">
                <span className="text-[11px] font-bold text-white block truncate">
                  Grace Mwangi
                </span>
                <span className="text-[9px] text-amber-400 block">PIN: 5678 (Mgr)</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

