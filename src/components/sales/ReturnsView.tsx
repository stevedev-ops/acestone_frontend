import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { Sale } from '../../types';
import { formatKSh, formatDateTime } from '../../utils/formatters';
import { 
  RotateCcw, 
  Search, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  RefreshCw, 
  ShieldAlert, 
  FileText 
} from 'lucide-react';

export const ReturnsView: React.FC = () => {
  const { sales, processReturn } = useStore();
  const { currentUser } = useAuth();

  const [receiptSearch, setReceiptSearch] = useState('');
  const [targetSale, setTargetSale] = useState<Sale | null>(null);
  const [returnReason, setReturnReason] = useState('Customer requested different chain length / design exchange');
  const [restoreStock, setRestoreStock] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    const found = sales.find(
      (s) => s.receiptNumber.toUpperCase() === receiptSearch.trim().toUpperCase()
    );
    if (found) {
      setTargetSale(found);
    } else {
      setTargetSale(null);
      alert('Receipt number not found. Please verify the code on customer receipt.');
    }
  };

  const handleProcessReturn = () => {
    if (!targetSale || !currentUser) return;

    if (targetSale.isReturned) {
      alert('This sale has already been marked as returned.');
      return;
    }

    const success = processReturn(
      targetSale.id,
      returnReason,
      restoreStock,
      currentUser.name,
      currentUser.role
    );

    if (success) {
      setSuccessMessage(
        `Return processed successfully for Receipt ${targetSale.receiptNumber}. Inventory stock ${
          restoreStock ? 'has been restored to Available' : 'was quarantined'
        }.`
      );
      setTargetSale(null);
      setReceiptSearch('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-5">
        <span className="text-xs uppercase tracking-widest text-gold-400 font-semibold">
          Customer Service & Exchanges
        </span>
        <h2 className="text-xl font-bold text-white tracking-wide font-brand">
          Jewellery Returns & Refund Processing
        </h2>
        <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
          Complies with Acestone 7-day exchange policy. Original sales transactions are never deleted from database; returns create a permanent linked reversal trail.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl flex items-center space-x-3 text-xs text-emerald-300">
          <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Lookup Card */}
      <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-5 max-w-xl">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
          Step 1: Locate Customer Original Sale
        </h3>

        <form onSubmit={handleSearch} className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={receiptSearch}
              onChange={(e) => setReceiptSearch(e.target.value)}
              placeholder="Enter Receipt # (e.g. ACE-REC-2026-1049)"
              className="w-full pl-9 pr-3 py-2.5 bg-charcoal-950 border border-charcoal-700 rounded-xl text-white font-mono text-xs uppercase font-bold focus:outline-none focus:border-gold-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl gold-button-gradient text-charcoal-950 font-bold text-xs shadow-gold-glow"
          >
            Find Receipt
          </button>
        </form>

        <p className="text-[11px] text-slate-500 mt-2">
          Try demo receipt: <strong className="text-gold-400 font-mono">ACE-REC-2026-1049</strong>
        </p>
      </div>

      {/* Target Transaction Details & Return Form */}
      {targetSale && (
        <div className="bg-charcoal-900 border border-charcoal-700 rounded-2xl p-6 max-w-xl space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-charcoal-800">
            <div>
              <span className="text-xs font-mono font-bold text-gold-400">
                {targetSale.receiptNumber}
              </span>
              <h4 className="text-sm font-bold text-white">Original Sale Found</h4>
            </div>
            <span className="text-xs text-slate-400">
              {formatDateTime(targetSale.transactionDate)}
            </span>
          </div>

          {/* Items Summary */}
          <div className="bg-charcoal-950 p-4 rounded-xl border border-charcoal-800 space-y-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Purchased Jewellery Piece
            </span>
            {targetSale.items.map((it, idx) => (
              <div key={idx} className="flex items-center space-x-3">
                <img
                  src={it.images[0]}
                  alt={it.productName}
                  className="w-12 h-12 rounded-lg object-cover border border-charcoal-700"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-mono font-bold text-gold-400">
                    {it.productCode}
                  </span>
                  <h5 className="text-xs font-bold text-white truncate">{it.productName}</h5>
                  <div className="text-[11px] text-slate-400">
                    Original Price: <strong className="text-white font-mono">{formatKSh(it.negotiatedSellingPrice)}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Reason Selection */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Return / Exchange Reason
              </label>
              <select
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="w-full px-3 py-2.5 bg-charcoal-950 border border-charcoal-700 rounded-xl text-white text-xs focus:outline-none focus:border-gold-500"
              >
                <option value="Customer requested different chain length / design exchange">
                  Exchange for different chain length / design
                </option>
                <option value="Ring size adjustment / resizing exchange">
                  Ring size adjustment / resizing exchange
                </option>
                <option value="Stone or clasp setting adjustment needed">
                  Stone or clasp setting adjustment needed
                </option>
                <option value="Customer changed mind (Store credit issued)">
                  Customer changed mind (Store credit issued)
                </option>
              </select>
            </div>

            {/* Restore Stock Checkbox */}
            <div className="p-3 bg-charcoal-950 rounded-xl border border-charcoal-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-white block">
                  Restore Jewellery to Available Stock
                </span>
                <span className="text-[10px] text-slate-400">
                  Piece will re-appear in compartment for sale
                </span>
              </div>
              <input
                type="checkbox"
                checked={restoreStock}
                onChange={(e) => setRestoreStock(e.target.checked)}
                className="w-4 h-4 rounded border-charcoal-700 text-gold-500 focus:ring-0"
              />
            </div>
          </div>

          {/* Confirm Button */}
          <button
            type="button"
            onClick={handleProcessReturn}
            className="w-full py-3 px-4 rounded-xl gold-button-gradient text-charcoal-950 font-bold text-xs shadow-gold-glow flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Process Return & Issue Reversal Record</span>
          </button>
        </div>
      )}
    </div>
  );
};

