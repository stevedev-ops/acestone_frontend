import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { NotebookSaleEntry, NotebookItemType, PaymentMethod, PaymentStatus } from '../../types';
import { formatKSh } from '../../utils/formatters';
import { useNavigate } from '../router/Router';
import {
  BookOpen,
  Plus,
  Sparkles,
  Smartphone,
  Coins,
  CheckCircle2,
  Clock,
  Search,
  ExternalLink,
  Trash2,
  FileText,
  Printer,
  Eye,
  AlertCircle,
  HelpCircle,
  Wrench,
  Tag,
  Grid3X3,
  Layers,
  X,
  CreditCard,
  Building,
} from 'lucide-react';

export const DailySalesPad: React.FC = () => {
  const { notebookSales, addNotebookSale, deleteNotebookSale, products } = useStore();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [description, setDescription] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [itemType, setItemType] = useState<NotebookItemType>('JEWELLERY');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('M-Pesa');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Completed');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');

  // UI State
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('ALL');

  // Compute Daily Totals
  const totalAmount = notebookSales.reduce((sum, item) => sum + item.amount, 0);
  
  const cashTotal = notebookSales
    .filter((s) => s.paymentMethod === 'Cash' || (s.paymentMethod as string) === 'cash')
    .reduce((sum, s) => sum + s.amount, 0);

  const mpesaTotal = notebookSales
    .filter(
      (s) =>
        s.paymentMethod === 'M-Pesa' ||
        (s.paymentMethod as string) === 'mpesa' ||
        (s.paymentMethod as string) === 'Paybill'
    )
    .reduce((sum, s) => sum + s.amount, 0);

  const servicesTotal = notebookSales
    .filter((s) => s.itemType === 'SERVICE')
    .reduce((sum, s) => sum + s.amount, 0);

  const unlinkedCount = notebookSales.filter((s) => s.itemType === 'UNLINKED').length;

  // Inventory suggestions
  const filteredInventory = products
    .filter((p) => p.status === 'Available')
    .filter(
      (p) =>
        !productSearchQuery ||
        p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
        p.compartmentCode.toLowerCase().includes(productSearchQuery.toLowerCase())
    )
    .slice(0, 6);

  const handleSelectProduct = (prod: (typeof products)[0]) => {
    setSelectedProductId(prod.id);
    setDescription(prod.name);
    setAmountStr(prod.suggestedPrice.toString());
    setItemType('JEWELLERY');
    setIsProductDropdownOpen(false);
    setProductSearchQuery('');
  };

  const handleQuickAddService = (serviceName: string, defaultCost: number) => {
    setDescription(serviceName);
    setAmountStr(defaultCost.toString());
    setItemType('SERVICE');
    setSelectedProductId('');
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const numericAmount = parseFloat(amountStr.replace(/,/g, ''));
    if (!description.trim() || isNaN(numericAmount) || numericAmount <= 0) {
      alert('Please enter a valid item description and negotiated amount.');
      return;
    }

    const linkedProduct = products.find((p) => p.id === selectedProductId);

    addNotebookSale({
      itemDescription: description.trim(),
      itemType,
      amount: numericAmount,
      paymentMethod,
      paymentStatus,
      productId: linkedProduct?.id,
      productCode: linkedProduct?.code,
      compartmentCode: linkedProduct?.compartmentCode,
      recordedBy: currentUser?.name || 'Sales Consultant',
      customerName: customerName.trim() || undefined,
      notes: notes.trim() || undefined,
      reconciled: itemType === 'JEWELLERY' || itemType === 'SERVICE',
    });

    // Reset Form
    setDescription('');
    setAmountStr('');
    setItemType('JEWELLERY');
    setSelectedProductId('');
    setCustomerName('');
    setNotes('');
  };

  const filteredSales = notebookSales.filter((s) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'JEWELLERY') return s.itemType === 'JEWELLERY';
    if (filterType === 'SERVICE') return s.itemType === 'SERVICE';
    if (filterType === 'UNLINKED') return s.itemType === 'UNLINKED';
    if (filterType === 'MPESA') return s.paymentMethod === 'M-Pesa' || (s.paymentMethod as string) === 'Paybill';
    if (filterType === 'CASH') return s.paymentMethod === 'Cash';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Navigation Mode Switcher */}
      <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-2.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 w-full sm:w-auto">
          <button
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-gold-500 text-charcoal-950 font-bold text-xs shadow-gold-glow"
          >
            <BookOpen className="w-4 h-4" />
            <span>Digital Sales Pad (Notebook)</span>
            <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-charcoal-950 text-gold-400 font-extrabold">
              FAST
            </span>
          </button>
          <button
            onClick={() => navigate('/pos')}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-charcoal-800 text-xs font-semibold transition-all"
          >
            <Grid3X3 className="w-4 h-4 text-gold-400" />
            <span>Showcase POS (Tray & Photo)</span>
          </button>
        </div>

        {/* View Original Notebook Photo Action */}
        <button
          onClick={() => setShowPhotoModal(true)}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 px-3.5 py-2 rounded-xl bg-charcoal-950 hover:bg-charcoal-800 border border-gold-500/30 text-gold-400 hover:text-gold-300 text-xs font-semibold transition-all shadow-sm"
        >
          <Eye className="w-4 h-4" />
          <span>View Handwritten Paper Notebook</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-gold-500/20 rounded font-mono">
            KSh 49,450
          </span>
        </button>
      </div>

      {/* Running Total KPI Banner (Mimics Notebook Summary) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-charcoal-900 to-charcoal-950 border border-gold-500/40 rounded-2xl p-4 shadow-gold-glow">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-gold-400">
              Running Total
            </span>
            <Sparkles className="w-4 h-4 text-gold-400" />
          </div>
          <div className="text-2xl font-black text-gold-400 font-brand">
            {formatKSh(totalAmount)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {notebookSales.length} items recorded today
          </div>
        </div>

        <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">M-Pesa / Paybill</span>
            <Smartphone className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-400 font-brand">
            {formatKSh(mpesaTotal)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Instant digital receipts
          </div>
        </div>

        <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Physical Cash</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-amber-400 font-brand">
            {formatKSh(cashTotal)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            In showroom cash drawer
          </div>
        </div>

        <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Services Revenue</span>
            <Wrench className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-lg font-bold text-cyan-400 font-brand">
            {formatKSh(servicesTotal)}
          </div>
          <div className="text-[10px] text-cyan-400/80 mt-1">
            Zero stock deduction
          </div>
        </div>

        <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Unlinked Items</span>
            <AlertCircle className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-lg font-bold text-orange-400 font-brand">
            {unlinkedCount} <span className="text-xs font-normal text-slate-400">items</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Flagged for Boss review
          </div>
        </div>
      </div>

      {/* Rapid Notebook Entry Form (Quick Row Add) */}
      <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-4 md:p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-charcoal-800 gap-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Instant Sales Entry
              </h2>
              <p className="text-[11px] text-slate-400">
                10 November 2026 · Consultant: <span className="text-gold-400 font-semibold">{currentUser?.name}</span>
              </p>
            </div>
          </div>

          {/* Quick Service Presets */}
          <div className="flex items-center space-x-1.5 overflow-x-auto text-xs">
            <span className="text-[10px] text-slate-400 uppercase font-semibold mr-1">
              Quick Services:
            </span>
            <button
              type="button"
              onClick={() => handleQuickAddService('Gold Polish & Clean', 150)}
              className="px-2 py-1 rounded-lg bg-charcoal-950 hover:bg-charcoal-800 border border-charcoal-700 text-cyan-300 text-[11px] font-medium transition-colors"
            >
              Polish (KSh 150)
            </button>
            <button
              type="button"
              onClick={() => handleQuickAddService('Ring Resizing Service', 500)}
              className="px-2 py-1 rounded-lg bg-charcoal-950 hover:bg-charcoal-800 border border-charcoal-700 text-cyan-300 text-[11px] font-medium transition-colors"
            >
              Resizing (KSh 500)
            </button>
            <button
              type="button"
              onClick={() => handleQuickAddService('Chain Soldering / Repair', 350)}
              className="px-2 py-1 rounded-lg bg-charcoal-950 hover:bg-charcoal-800 border border-charcoal-700 text-cyan-300 text-[11px] font-medium transition-colors"
            >
              Soldering (KSh 350)
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Item Description & Search (5 cols) */}
            <div className="md:col-span-5 relative">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Item Sold / Description *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setProductSearchQuery(e.target.value);
                    setIsProductDropdownOpen(true);
                  }}
                  onFocus={() => setIsProductDropdownOpen(true)}
                  placeholder="e.g. Byzantine chain, Men's ring, Polish..."
                  className="w-full px-3.5 py-2.5 bg-charcoal-950 border border-charcoal-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-gold-500"
                  required
                />
                {description && (
                  <button
                    type="button"
                    onClick={() => {
                      setDescription('');
                      setSelectedProductId('');
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Autocomplete Catalogue Dropdown */}
              {isProductDropdownOpen && filteredInventory.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-charcoal-950 border border-charcoal-700 rounded-xl shadow-2xl p-2 space-y-1 max-h-56 overflow-y-auto">
                  <div className="text-[10px] uppercase font-bold text-gold-400 px-2 py-1">
                    Matching Showcase Stock ({filteredInventory.length})
                  </div>
                  {filteredInventory.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => handleSelectProduct(prod)}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-charcoal-800 cursor-pointer text-xs transition-colors"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <img
                          src={prod.images[0]}
                          alt={prod.name}
                          className="w-8 h-8 rounded-lg object-cover border border-charcoal-700"
                        />
                        <div className="truncate">
                          <p className="font-semibold text-white truncate">{prod.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {prod.code} · Tray {prod.compartmentCode}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <span className="font-bold text-gold-400 font-brand">
                          {formatKSh(prod.suggestedPrice)}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div
                    onClick={() => setIsProductDropdownOpen(false)}
                    className="text-[10px] text-center text-slate-500 hover:text-slate-300 py-1 cursor-pointer border-t border-charcoal-800"
                  >
                    Close suggestions (or keep custom typed name)
                  </div>
                </div>
              )}
            </div>

            {/* Item Type (2 cols) */}
            <div className="md:col-span-2">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Item Classification
              </label>
              <select
                value={itemType}
                onChange={(e) => setItemType(e.target.value as NotebookItemType)}
                className="w-full px-3 py-2.5 bg-charcoal-950 border border-charcoal-700 rounded-xl text-white text-xs focus:outline-none focus:border-gold-500"
              >
                <option value="JEWELLERY">💎 Jewellery (Stock)</option>
                <option value="SERVICE">🛠️ Service (0 Stock)</option>
                <option value="UNLINKED">❓ Unlinked (Review)</option>
              </select>
            </div>

            {/* Negotiated Amount (2 cols) */}
            <div className="md:col-span-2">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Negotiated Price (KSh) *
              </label>
              <input
                type="number"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="e.g. 20000"
                className="w-full px-3 py-2.5 bg-charcoal-950 border border-charcoal-700 rounded-xl text-gold-400 font-bold text-xs focus:outline-none focus:border-gold-500"
                required
              />
            </div>

            {/* Payment Method (3 cols) */}
            <div className="md:col-span-3">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-1">
                {(['M-Pesa', 'Cash', 'Paybill'] as PaymentMethod[]).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 px-1 text-[11px] font-bold rounded-lg border text-center transition-all ${
                      paymentMethod === method
                        ? 'bg-gold-500 text-charcoal-950 border-gold-400 shadow-sm'
                        : 'bg-charcoal-950 text-slate-400 border-charcoal-800 hover:text-white'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Secondary Details Row (Customer, Notes, Status, and Submit Button) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center pt-2">
            <div className="md:col-span-4">
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer Name / Reference (optional)"
                className="w-full px-3 py-2 bg-charcoal-950 border border-charcoal-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-gold-500"
              />
            </div>

            <div className="md:col-span-4">
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes (e.g. deposit paid, balance due, ring size...)"
                className="w-full px-3 py-2 bg-charcoal-950 border border-charcoal-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-gold-500"
              />
            </div>

            <div className="md:col-span-2">
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                className="w-full px-3 py-2 bg-charcoal-950 border border-charcoal-800 rounded-xl text-slate-300 text-xs focus:outline-none"
              >
                <option value="Completed">✓ Fully Paid</option>
                <option value="Partial">⏳ Partial / Deposit</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full py-2.5 px-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-charcoal-950 font-bold text-xs shadow-gold-glow flex items-center justify-center space-x-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Sale</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Notebook Records Table */}
      <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-charcoal-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-charcoal-950/60">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <span>Daily Sales Ledger</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-400 border border-gold-500/30">
                Live Digitized Notebook
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Entries recorded today · Running total auto-calculates to <span className="text-gold-400 font-bold">{formatKSh(totalAmount)}</span>
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto text-xs w-full sm:w-auto">
            {['ALL', 'JEWELLERY', 'SERVICE', 'UNLINKED', 'MPESA', 'CASH'].map((f) => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors ${
                  filterType === f
                    ? 'bg-gold-500 text-charcoal-950'
                    : 'bg-charcoal-800 text-slate-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile View: High-Touch Cards for Smartphones (hidden on sm+) */}
        <div className="sm:hidden divide-y divide-charcoal-800">
          {filteredSales.map((item, index) => (
            <div key={item.id} className="p-3.5 space-y-2 bg-charcoal-900/40">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-charcoal-950 text-slate-400 text-[10px] font-bold flex items-center justify-center font-mono border border-charcoal-800">
                    {index + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">
                      {item.itemDescription}
                    </h4>
                    <div className="flex items-center space-x-1.5 mt-0.5">
                      {item.productCode && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-charcoal-950 text-gold-400 border border-charcoal-800">
                          {item.productCode}
                        </span>
                      )}
                      {item.compartmentCode && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/50 text-emerald-400 border border-emerald-900/30">
                          Tray {item.compartmentCode}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-extrabold text-gold-400 font-brand block">
                    {formatKSh(item.amount)}
                  </span>
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold mt-0.5 ${
                      item.paymentMethod === 'M-Pesa' || (item.paymentMethod as string) === 'Paybill'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : item.paymentMethod === 'Cash'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                    }`}
                  >
                    {item.paymentMethod}
                  </span>
                </div>
              </div>

              {/* Bottom metadata */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-charcoal-800/40">
                <div className="flex items-center space-x-2">
                  {item.itemType === 'JEWELLERY' && <span className="text-amber-400 font-medium">💎 Piece</span>}
                  {item.itemType === 'SERVICE' && <span className="text-cyan-400 font-medium">🛠️ Service</span>}
                  {item.itemType === 'UNLINKED' && <span className="text-orange-400 font-medium">⚠️ Unlinked</span>}
                  <span>•</span>
                  <span>{item.recordedBy}</span>
                </div>

                <div className="flex items-center space-x-2">
                  {item.paymentStatus === 'Completed' ? (
                    <span className="text-emerald-400 font-semibold">✓ Paid</span>
                  ) : (
                    <span className="text-amber-400 font-semibold animate-pulse">⏳ Deposit</span>
                  )}
                  {(currentUser?.role === 'OWNER' || currentUser?.role === 'MANAGER') && (
                    <button
                      onClick={() => deleteNotebookSale(item.id)}
                      className="p-1 text-slate-500 hover:text-red-400 ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {/* Mobile Footer Total */}
          <div className="p-3.5 bg-charcoal-950 flex items-center justify-between font-bold text-xs border-t-2 border-gold-500/40">
            <span className="text-white uppercase tracking-wider">Running Total</span>
            <span className="text-gold-400 font-brand text-base">{formatKSh(totalAmount)}</span>
          </div>
        </div>

        {/* Desktop & Tablet Table (hidden on mobile) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-charcoal-950/80 text-[10px] text-slate-400 uppercase tracking-wider border-b border-charcoal-800">
              <tr>
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Item / Description</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4 text-right">Amount (KSh)</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Customer & Notes</th>
                <th className="py-3 px-4">Consultant</th>
                <th className="py-3 px-4 text-center">Status</th>
                {(currentUser?.role === 'OWNER' || currentUser?.role === 'MANAGER') && (
                  <th className="py-3 px-4 text-right w-16">Action</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-800/60 font-mono">
              {filteredSales.map((item, index) => (
                <tr
                  key={item.id}
                  className="hover:bg-charcoal-800/40 transition-colors group"
                >
                  <td className="py-3 px-4 text-center text-slate-500 font-bold">
                    {index + 1}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-sans font-semibold text-white flex items-center space-x-2">
                      <span>{item.itemDescription}</span>
                      {item.productCode && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-charcoal-950 text-gold-400 border border-charcoal-700">
                          {item.productCode}
                        </span>
                      )}
                      {item.compartmentCode && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/30">
                          Tray {item.compartmentCode}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-sans">
                    {item.itemType === 'JEWELLERY' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        💎 Jewellery Piece
                      </span>
                    )}
                    {item.itemType === 'SERVICE' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        🛠️ Service (0 Stock)
                      </span>
                    )}
                    {item.itemType === 'UNLINKED' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-orange-500/10 text-orange-300 border border-orange-500/20">
                        ⚠️ Unlinked Entry
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-brand text-sm font-bold text-gold-400">
                    {formatKSh(item.amount)}
                  </td>
                  <td className="py-3 px-4 font-sans">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.paymentMethod === 'M-Pesa' || (item.paymentMethod as string) === 'Paybill'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : item.paymentMethod === 'Cash'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                      }`}
                    >
                      {item.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-300 text-[11px] max-w-xs truncate">
                    {item.customerName && (
                      <span className="font-semibold text-white mr-1.5">
                        {item.customerName}:
                      </span>
                    )}
                    <span className="text-slate-400">{item.notes || '—'}</span>
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-400 text-[11px]">
                    {item.recordedBy}
                  </td>
                  <td className="py-3 px-4 text-center font-sans">
                    {item.paymentStatus === 'Completed' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400">
                        Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-400 animate-pulse">
                        Partial
                      </span>
                    )}
                  </td>
                  {(currentUser?.role === 'OWNER' || currentUser?.role === 'MANAGER') && (
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => deleteNotebookSale(item.id)}
                        className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-charcoal-800 transition-colors"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
            {/* Table Footer with Total */}
            <tfoot className="bg-charcoal-950 font-sans border-t-2 border-gold-500/40 font-bold">
              <tr>
                <td colSpan={3} className="py-3 px-4 text-white uppercase tracking-wider text-xs">
                  Daily Closing Running Total
                </td>
                <td className="py-3 px-4 text-right font-brand text-base text-gold-400">
                  {formatKSh(totalAmount)}
                </td>
                <td colSpan={currentUser?.role === 'OWNER' || currentUser?.role === 'MANAGER' ? 5 : 4} className="py-3 px-4 text-slate-400 text-xs">
                  Cash: <span className="text-amber-400">{formatKSh(cashTotal)}</span> · M-Pesa: <span className="text-emerald-400">{formatKSh(mpesaTotal)}</span> · Services: <span className="text-cyan-400">{formatKSh(servicesTotal)}</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Modal: View Original Handwritten Paper Notebook Photo */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-charcoal-900 border border-charcoal-700 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-charcoal-800 flex items-center justify-between bg-charcoal-950">
              <div className="flex items-center space-x-2.5">
                <BookOpen className="w-5 h-5 text-gold-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Original Handwritten Daily Notebook Photo
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Cross-verification against digitized records · Total: KSh 49,450
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-charcoal-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-black/50">
              <img
                src="/notebook-photo.jpg"
                alt="Handwritten sales notebook from Acestone Jewellery counter"
                className="max-h-[60vh] object-contain rounded-xl border border-charcoal-700 shadow-2xl"
              />
              <div className="mt-3 text-xs text-slate-400 text-center max-w-md">
                Transcribed entries: Patek Philippe watch (6k), Byzantine chain (20k), Men's pendant (2k), Earrings (1.8k), Polish (150), Men's ring (4k), Ladies' ring (3.5k), Ladies' set (5.7k), Ladies' bracelet (3.5k), Ladies' watch (2.8k) = <strong className="text-gold-400">KSh 49,450</strong>.
              </div>
            </div>

            <div className="p-4 border-t border-charcoal-800 bg-charcoal-950 flex justify-end">
              <button
                onClick={() => setShowPhotoModal(false)}
                className="px-4 py-2 rounded-xl bg-charcoal-800 text-white text-xs font-semibold hover:bg-charcoal-700"
              >
                Close Verification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

