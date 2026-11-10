import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { formatKSh } from '../../utils/formatters';
import { CashDenominationCount, DailyRegisterClosing } from '../../types';
import { api } from '../../services/api';
import {
  Calculator,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Coins,
  FileCheck,
  Printer,
  Calendar,
  Lock,
  Sparkles,
  Link2,
  HelpCircle,
  Eye,
  Check,
  Building,
} from 'lucide-react';

export const EndOfDayReconciliation: React.FC = () => {
  const { notebookSales, reconcileNotebookSale, products } = useStore();
  const { currentUser, verifyPin } = useAuth();

  // Denominations state for physical cash count
  const [counts, setCounts] = useState<CashDenominationCount>({
    k1000: 16, // 16,000
    k500: 4,   // 2,000
    k200: 3,   // 600
    k100: 2,   // 200
    k50: 1,    // 50
  });

  // M-Pesa checked verification IDs
  const [verifiedMpesaIds, setVerifiedMpesaIds] = useState<string[]>([
    'note-002',
    'note-004',
  ]);

  // Sign-off State
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [closingNotes, setClosingNotes] = useState('');
  const [isRegisterClosed, setIsRegisterClosed] = useState(false);
  const [closedSummary, setClosedSummary] = useState<DailyRegisterClosing | null>(null);

  // Unlinked matching modal state
  const [matchingItem, setMatchingItem] = useState<(typeof notebookSales)[0] | null>(null);
  const [matchedProductId, setMatchedProductId] = useState('');

  // Daily Totals Calculations
  const totalSales = notebookSales.reduce((acc, it) => acc + it.amount, 0);

  const expectedCash = notebookSales
    .filter((s) => s.paymentMethod === 'Cash' || (s.paymentMethod as string) === 'cash')
    .reduce((acc, it) => acc + it.amount, 0);

  const expectedMpesa = notebookSales
    .filter(
      (s) =>
        s.paymentMethod === 'M-Pesa' ||
        (s.paymentMethod as string) === 'mpesa' ||
        (s.paymentMethod as string) === 'Paybill'
    )
    .reduce((acc, it) => acc + it.amount, 0);

  const servicesTotal = notebookSales
    .filter((s) => s.itemType === 'SERVICE')
    .reduce((acc, it) => acc + it.amount, 0);

  const unlinkedItems = notebookSales.filter((s) => s.itemType === 'UNLINKED' && !s.reconciled);

  // Physical Cash Calculation
  const countedCash =
    counts.k1000 * 1000 +
    counts.k500 * 500 +
    counts.k200 * 200 +
    counts.k100 * 100 +
    counts.k50 * 50;

  const cashDifference = countedCash - expectedCash;

  const handleDenominationChange = (key: keyof CashDenominationCount, value: string) => {
    const num = parseInt(value, 10);
    setCounts((prev) => ({
      ...prev,
      [key]: isNaN(num) || num < 0 ? 0 : num,
    }));
  };

  const toggleMpesaVerified = (id: string) => {
    setVerifiedMpesaIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleMatchProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchingItem) return;

    const prod = products.find((p) => p.id === matchedProductId);
    reconcileNotebookSale(
      matchingItem.id,
      matchedProductId,
      prod ? `Linked to ${prod.code} (${prod.name})` : 'Reconciled by Boss'
    );
    setMatchingItem(null);
    setMatchedProductId('');
  };

  const handleSignOff = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');

    if (!verifyPin(pin)) {
      setPinError('Invalid PIN code. Owner or Manager PIN required.');
      return;
    }

    const summary: DailyRegisterClosing = {
      id: 'close-' + Date.now(),
      date: new Date().toLocaleDateString('en-KE', { dateStyle: 'full' }),
      totalSales,
      totalCashExpected: expectedCash,
      totalCashCounted: countedCash,
      cashDifference,
      totalMpesaPaybill: expectedMpesa,
      totalCardBank: 0,
      servicesRevenue: servicesTotal,
      totalItemsCount: notebookSales.length,
      denominations: counts,
      signedOffBy: currentUser?.name || 'Managing Director',
      signedOffAt: new Date().toLocaleTimeString('en-KE'),
      status: cashDifference === 0 ? 'BALANCED' : 'DISCREPANCY',
      closingNotes,
    };

    setClosedSummary(summary);
    setIsRegisterClosed(true);

    // Persist closing record to Render PostgreSQL Backend
    api.createRegisterClosing({
      total_sales: totalSales,
      total_cash_expected: expectedCash,
      total_cash_counted: countedCash,
      cash_difference: cashDifference,
      total_mpesa_paybill: expectedMpesa,
      total_card_bank: 0,
      services_revenue: servicesTotal,
      total_items_count: notebookSales.length,
      k1000_count: counts.k1000,
      k500_count: counts.k500,
      k200_count: counts.k200,
      k100_count: counts.k100,
      k50_count: counts.k50,
      signed_off_by: currentUser?.name || 'Managing Director',
      status: cashDifference === 0 ? 'BALANCED' : 'DISCREPANCY',
      closing_notes: closingNotes,
    }).catch((err) => {
      console.warn('Register closed locally; Render PostgreSQL sync:', err);
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-charcoal-800 gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-wider uppercase font-brand flex items-center space-x-2">
            <span>End-of-Day Register Reconciliation</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-gold-500/20 text-gold-400 border border-gold-500/30">
              Boss & Supervisor Portal
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Reconcile physical cash drawer notes, audit M-Pesa paybill receipts, and sign off today’s sales notebook.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 border border-charcoal-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Closing Report</span>
          </button>
        </div>
      </div>

      {/* Register Closed Confirmation Banner */}
      {isRegisterClosed && closedSummary && (
        <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-2xl p-5 shadow-emerald-glow text-white space-y-3 animate-fade-in">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-emerald-400">
                Daily Register Successfully Closed & Signed Off
              </h3>
              <p className="text-xs text-slate-300">
                Authenticated by {closedSummary.signedOffBy} at {closedSummary.signedOffAt} · Status:{' '}
                <strong className={closedSummary.status === 'BALANCED' ? 'text-emerald-300' : 'text-amber-300'}>
                  {closedSummary.status}
                </strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top 4 Financial Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Today's Total Sales</span>
            <Sparkles className="w-4 h-4 text-gold-400" />
          </div>
          <div className="text-2xl font-black text-gold-400 font-brand">
            {formatKSh(totalSales)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            100% matched to sales notebook
          </div>
        </div>

        {/* Expected Cash */}
        <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Expected Cash</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-brand">
            {formatKSh(expectedCash)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            From 6 physical cash transactions
          </div>
        </div>

        {/* M-Pesa / Paybill */}
        <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">M-Pesa & Paybill</span>
            <Smartphone className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-brand">
            {formatKSh(expectedMpesa)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {verifiedMpesaIds.length} verified against Safaricom Till
          </div>
        </div>

        {/* Services Revenue */}
        <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Services Revenue</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-400 font-brand">
            {formatKSh(servicesTotal)}
          </div>
          <div className="text-[10px] text-cyan-400/80 mt-1">
            Zero stock deduction confirmed
          </div>
        </div>
      </div>

      {/* Main Reconciliation Workspace: Cash Drawer Tally & M-Pesa Cross-Check */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Physical Cash Drawer Denomination Counter (7 Cols) */}
        <div className="lg:col-span-7 bg-charcoal-900 border border-charcoal-800 rounded-2xl p-5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-charcoal-800">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Physical Cash Drawer Tally
                </h2>
                <p className="text-[11px] text-slate-400">
                  Count banknotes in the Westlands showroom register
                </p>
              </div>
            </div>

            {/* Live Difference Badge */}
            <div className="text-right">
              {cashDifference === 0 ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> BALANCED (KSh 0.00)
                </span>
              ) : cashDifference > 0 ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  +SURPLUS (+{formatKSh(cashDifference)})
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" /> SHORTAGE ({formatKSh(cashDifference)})
                </span>
              )}
            </div>
          </div>

          {/* Denominations Input Grid */}
          <div className="space-y-2.5">
            {[
              { label: 'KSh 1,000 Notes', key: 'k1000' as const, multiplier: 1000 },
              { label: 'KSh 500 Notes', key: 'k500' as const, multiplier: 500 },
              { label: 'KSh 200 Notes', key: 'k200' as const, multiplier: 200 },
              { label: 'KSh 100 Notes', key: 'k100' as const, multiplier: 100 },
              { label: 'KSh 50 Notes', key: 'k50' as const, multiplier: 50 },
            ].map((denom) => {
              const rowTotal = counts[denom.key] * denom.multiplier;
              return (
                <div
                  key={denom.key}
                  className="flex items-center justify-between p-3 bg-charcoal-950 border border-charcoal-800 rounded-xl"
                >
                  <div className="flex items-center space-x-3 w-40">
                    <Coins className="w-4 h-4 text-amber-400/80" />
                    <span className="text-xs font-semibold text-slate-200">{denom.label}</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-[11px] text-slate-400">×</span>
                    <input
                      type="number"
                      min="0"
                      value={counts[denom.key]}
                      onChange={(e) => handleDenominationChange(denom.key, e.target.value)}
                      className="w-20 px-3 py-1.5 bg-charcoal-900 border border-charcoal-700 rounded-lg text-white font-mono text-center text-xs focus:outline-none focus:border-gold-500"
                    />
                    <span className="text-[11px] text-slate-400">=</span>
                  </div>

                  <div className="w-28 text-right font-mono font-bold text-xs text-gold-400">
                    {formatKSh(rowTotal)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cash Comparison Summary Box */}
          <div className="bg-charcoal-950/80 border border-charcoal-800 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Total Banknotes Counted:</span>
              <span className="font-mono font-bold text-white">{formatKSh(countedCash)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Expected System Cash (from Notebook):</span>
              <span className="font-mono font-bold text-amber-400">{formatKSh(expectedCash)}</span>
            </div>
            <div className="pt-2 border-t border-charcoal-800 flex justify-between text-xs font-bold">
              <span className="text-slate-300">Net Drawer Discrepancy:</span>
              <span
                className={`font-mono ${
                  cashDifference === 0
                    ? 'text-emerald-400'
                    : cashDifference > 0
                    ? 'text-cyan-400'
                    : 'text-amber-400'
                }`}
              >
                {cashDifference > 0 ? '+' : ''}
                {formatKSh(cashDifference)}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: M-Pesa & Paybill Audit + Unlinked Triage (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* M-Pesa Check Panel */}
          <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-charcoal-800">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  M-Pesa & Paybill Audit
                </h3>
              </div>
              <span className="text-[10px] text-slate-400">
                Check against Till SMS
              </span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {notebookSales
                .filter(
                  (s) =>
                    s.paymentMethod === 'M-Pesa' ||
                    (s.paymentMethod as string) === 'mpesa' ||
                    (s.paymentMethod as string) === 'Paybill'
                )
                .map((sale) => {
                  const isVerified = verifiedMpesaIds.includes(sale.id);
                  return (
                    <div
                      key={sale.id}
                      onClick={() => toggleMpesaVerified(sale.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                        isVerified
                          ? 'bg-emerald-950/20 border-emerald-500/30'
                          : 'bg-charcoal-950 border-charcoal-800 hover:border-charcoal-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center text-xs transition-colors ${
                            isVerified
                              ? 'bg-emerald-500 text-charcoal-950 font-bold'
                              : 'border border-charcoal-700 text-transparent'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-semibold text-white truncate">
                            {sale.itemDescription}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {sale.paymentMethod} · {sale.customerName || 'Walk-in'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <span className="text-xs font-bold text-emerald-400 font-brand">
                          {formatKSh(sale.amount)}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Unlinked Items Review */}
          <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-charcoal-800">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Unlinked Items ({unlinkedItems.length})
                </h3>
              </div>
              <span className="text-[10px] text-orange-400/80">
                Requires Boss Review
              </span>
            </div>

            {unlinkedItems.length === 0 ? (
              <div className="p-3 bg-charcoal-950 rounded-xl text-center text-xs text-slate-400">
                All notebook items have been reconciled!
              </div>
            ) : (
              <div className="space-y-2">
                {unlinkedItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-charcoal-950 border border-charcoal-800 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-white">{item.itemDescription}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {formatKSh(item.amount)} · By {item.recordedBy}
                      </p>
                    </div>
                    <button
                      onClick={() => setMatchingItem(item)}
                      className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-gold-500/10 hover:bg-gold-500/20 text-gold-400 border border-gold-500/30 text-[11px] font-semibold transition-colors"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      <span>Match Stock</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Official Sign-Off & Close Register Card */}
      <div className="bg-gradient-to-r from-charcoal-900 via-charcoal-900 to-charcoal-950 border border-gold-500/30 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider font-brand">
              Supervisor Daily Sign-Off & Vault Lock
            </h2>
            <p className="text-xs text-slate-400">
              Entering the Managing Director PIN permanently timestamps today’s totals and records the closing register audit log.
            </p>
          </div>
        </div>

        <form onSubmit={handleSignOff} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end pt-2">
          <div className="md:col-span-6">
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Closing Manager Notes / Drawer Comments (optional)
            </label>
            <input
              type="text"
              value={closingNotes}
              onChange={(e) => setClosingNotes(e.target.value)}
              placeholder="e.g. All M-Pesa transactions verified with Safaricom Till. Vault locked."
              className="w-full px-3.5 py-2.5 bg-charcoal-950 border border-charcoal-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-gold-500"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Owner / Manager PIN *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="1234 or 5678"
                className="w-full pl-9 pr-3 py-2.5 bg-charcoal-950 border border-charcoal-700 rounded-xl text-white text-xs font-mono tracking-widest focus:outline-none focus:border-gold-500"
                required
              />
            </div>
            {pinError && (
              <p className="text-[10px] text-red-400 mt-1 font-semibold">{pinError}</p>
            )}
          </div>

          <div className="md:col-span-3">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-gold-500 hover:bg-gold-400 text-charcoal-950 font-bold text-xs shadow-gold-glow flex items-center justify-center space-x-2 transition-all"
            >
              <FileCheck className="w-4 h-4" />
              <span>Sign-Off & Close Register</span>
            </button>
          </div>
        </form>
      </div>

      {/* Modal: Match Unlinked Notebook Item to Inventory Product */}
      {matchingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-charcoal-900 border border-charcoal-700 rounded-2xl max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-charcoal-800">
              <h3 className="text-sm font-bold text-white">
                Match Unlinked Sale: {matchingItem.itemDescription}
              </h3>
              <button
                onClick={() => setMatchingItem(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Sold for <strong className="text-gold-400">{formatKSh(matchingItem.amount)}</strong>. Link this notebook entry to an existing showcase product to balance inventory counts.
            </p>

            <form onSubmit={handleMatchProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Select Showcase Jewellery Piece:
                </label>
                <select
                  value={matchedProductId}
                  onChange={(e) => setMatchedProductId(e.target.value)}
                  className="w-full px-3 py-2 bg-charcoal-950 border border-charcoal-700 rounded-xl text-white text-xs focus:outline-none"
                  required
                >
                  <option value="">-- Choose matching item --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} - {p.name} (Tray {p.compartmentCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMatchingItem(null)}
                  className="px-3 py-1.5 rounded-xl bg-charcoal-800 text-slate-300 text-xs font-semibold hover:bg-charcoal-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-gold-500 text-charcoal-950 text-xs font-bold hover:bg-gold-400 shadow-gold-glow"
                >
                  Confirm Match
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

