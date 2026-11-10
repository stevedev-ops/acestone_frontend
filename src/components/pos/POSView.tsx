import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { JewelleryItem, Sale, PaymentMethod, PaymentStatus, JewelleryCategory } from '../../types';
import { formatKSh } from '../../utils/formatters';
import { useNavigate } from '../router/Router';
import { ApprovalModal } from './ApprovalModal';
import { PaymentModal } from './PaymentModal';
import { ReceiptModal } from './ReceiptModal';
import {
  Search,
  Grid3X3,
  Sparkles,
  ShoppingBag,
  CheckCircle,
  AlertTriangle,
  Lock,
  ArrowRight,
  ShieldCheck,
  Tag,
  Maximize2,
  Trash2,
  Layers,
  ChevronRight,
  Info,
  BookOpen,
} from 'lucide-react';

export const POSView: React.FC = () => {
  const { products, completeSale } = useStore();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [compartmentFilter, setCompartmentFilter] = useState<string>('');

  // Selected item for sale
  const [activeItem, setActiveItem] = useState<JewelleryItem | null>(null);
  const [negotiatedPrice, setNegotiatedPrice] = useState<number>(0);
  const [approvalInfo, setApprovalInfo] = useState<{ approvedBy: string; notes?: string } | null>(null);

  // Modals state
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  // Check URL params for preselected product (from shelf mapping)
  useEffect(() => {
    const hash = window.location.hash;
    const urlParams = new URLSearchParams(hash.split('?')[1]);
    const codeParam = urlParams.get('code');
    const compParam = urlParams.get('comp');

    if (codeParam) {
      const match = products.find((p) => p.code.toUpperCase() === codeParam.toUpperCase());
      if (match && match.status === 'Available') {
        selectProductForSale(match);
      }
    } else if (compParam) {
      setCompartmentFilter(compParam.toUpperCase());
    }
  }, [products]);

  const selectProductForSale = (item: JewelleryItem) => {
    setActiveItem(item);
    setNegotiatedPrice(item.suggestedPrice);
    setApprovalInfo(null); // reset approval state

    // On mobile screens, smoothly scroll down to the pricing engine
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setTimeout(() => {
        document.getElementById('pricing-engine-panel')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const clearSelection = () => {
    setActiveItem(null);
    setNegotiatedPrice(0);
    setApprovalInfo(null);
  };

  // Determine whether price is below minimum acceptable price
  // NOTE: Employee cannot see minimum price value, only whether approval is required!
  const isBelowMinimum = activeItem ? negotiatedPrice < activeItem.minSellingPrice : false;
  const isWithinRange = activeItem ? negotiatedPrice >= activeItem.minSellingPrice : false;
  const isApproved = !!approvalInfo;

  // Filter available products
  const availableProducts = products.filter((p) => {
    // Only available products can be sold
    if (p.status !== 'Available') return false;

    // Compartment filter (e.g. A-03)
    if (compartmentFilter && p.compartmentCode.toUpperCase() !== compartmentFilter.toUpperCase()) {
      return false;
    }

    // Category filter
    if (selectedCategory !== 'All' && p.category !== selectedCategory) {
      return false;
    }

    // Search query (code, name, material, compartment)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCode = p.code.toLowerCase().includes(q);
      const matchName = p.name.toLowerCase().includes(q);
      const matchComp = p.compartmentCode.toLowerCase().includes(q);
      const matchMaterial = p.material.toLowerCase().includes(q);
      return matchCode || matchName || matchComp || matchMaterial;
    }

    return true;
  });

  const categories = ['All', 'Chains', 'Necklaces', 'Rings', 'Bracelets', 'Bangles', 'Earrings', 'Pendants'];

  const handleCheckoutClick = () => {
    if (!activeItem) return;

    if (isBelowMinimum && !isApproved) {
      setIsApprovalModalOpen(true);
      return;
    }

    setIsPaymentModalOpen(true);
  };

  const handlePaymentConfirmed = (paymentDetails: {
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    amountPaid: number;
    balanceDue: number;
    customerName?: string;
    customerPhone?: string;
    customerNotes?: string;
  }) => {
    if (!activeItem || !currentUser) return;

    // Calculate gross profit using original buying price snapshot
    const grossProfit = negotiatedPrice - activeItem.buyingPrice;

    const sale = completeSale({
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      items: [
        {
          productId: activeItem.id,
          productCode: activeItem.code,
          productName: activeItem.name,
          category: activeItem.category,
          purity: activeItem.purity,
          weightGrams: activeItem.weightGrams,
          originalBuyingCost: activeItem.buyingPrice,
          suggestedPrice: activeItem.suggestedPrice,
          minSellingPrice: activeItem.minSellingPrice,
          negotiatedSellingPrice: negotiatedPrice,
          grossProfit,
          images: activeItem.images,
          compartmentCode: activeItem.compartmentCode,
          approvedBy: approvalInfo?.approvedBy,
          approvalNotes: approvalInfo?.notes,
        },
      ],
      subtotal: negotiatedPrice,
      discount: Math.max(0, activeItem.suggestedPrice - negotiatedPrice),
      totalAmount: negotiatedPrice,
      totalGrossProfit: grossProfit,
      paymentMethod: paymentDetails.paymentMethod,
      paymentStatus: paymentDetails.paymentStatus,
      amountPaid: paymentDetails.amountPaid,
      balanceDue: paymentDetails.balanceDue,
      customerName: paymentDetails.customerName,
      customerPhone: paymentDetails.customerPhone,
      customerNotes: paymentDetails.customerNotes,
      approvedBy: approvalInfo?.approvedBy,
      approvedAt: approvalInfo ? new Date().toISOString() : undefined,
    });

    setIsPaymentModalOpen(false);
    clearSelection();
    setCompletedSale(sale);
  };

  return (
    <div className="space-y-6">
      {/* Top POS Mode Switcher */}
      <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 w-full sm:w-auto">
          <button
            onClick={() => navigate('/sales-pad')}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-charcoal-800 text-xs font-semibold transition-all"
          >
            <BookOpen className="w-4 h-4 text-gold-400" />
            <span>Digital Sales Pad (Notebook)</span>
            <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-charcoal-950 text-gold-400 font-extrabold">
              FAST
            </span>
          </button>
          <button
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-gold-500 text-charcoal-950 font-bold text-xs shadow-gold-glow"
          >
            <Grid3X3 className="w-4 h-4" />
            <span>Showcase POS (Tray & Photo)</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Interactive Showcase Tray Matching</span>
        </div>
      </div>

      {/* Mobile-first POS Layout: Grid on desktop, stack on phone */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left Column: Catalogue & Physical Compartment Lookup (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">

          {/* Top Search & Compartment Bar */}
          <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Product Code / Name Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search code, name, or material..."
                  className="w-full pl-10 pr-4 py-2.5 bg-charcoal-950 border border-charcoal-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-gold-500"
                />
              </div>

              {/* Physical Shelf Compartment Filter */}
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Grid3X3 className="w-4 h-4 text-gold-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={compartmentFilter}
                    onChange={(e) => setCompartmentFilter(e.target.value.toUpperCase())}
                    placeholder="Shelf (e.g. A-03)"
                    className="w-36 pl-9 pr-3 py-2.5 bg-charcoal-950 border border-gold-500/40 rounded-xl text-gold-400 font-mono text-xs font-bold uppercase placeholder-slate-500 focus:outline-none focus:border-gold-500"
                  />
                </div>
                {compartmentFilter && (
                  <button
                    onClick={() => setCompartmentFilter('')}
                    className="p-2.5 rounded-xl bg-charcoal-800 text-slate-400 hover:text-white text-xs"
                    title="Clear shelf filter"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${selectedCategory === cat
                    ? 'bg-gold-500 text-charcoal-950 shadow-gold-glow'
                    : 'bg-charcoal-950 text-slate-300 hover:bg-charcoal-800 border border-charcoal-800'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Compartment Identification Notice when filtered */}
          {compartmentFilter && (
            <div className="p-3 bg-gold-500/10 border border-gold-500/30 rounded-xl flex items-center justify-between text-xs text-gold-300">
              <div className="flex items-center space-x-2">
                <Grid3X3 className="w-4 h-4 text-gold-400" />
                <span>
                  Displaying pieces in Showcase Compartment{' '}
                  <strong className="text-white font-mono">{compartmentFilter}</strong>. Compare photos to identify the physical item!
                </span>
              </div>
              <span className="font-bold font-mono">{availableProducts.length} items</span>
            </div>
          )}

          {/* Available Jewellery Grid */}
          {availableProducts.length === 0 ? (
            <div className="py-12 bg-charcoal-900 border border-charcoal-800 rounded-2xl text-center p-6">
              <Layers className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-slate-300">No available jewellery matched</h4>
              <p className="text-xs text-slate-500 mt-1">
                Try clearing your search query or selecting a different showcase compartment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {availableProducts.map((item) => {
                const isSelected = activeItem?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => selectProductForSale(item)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between group relative overflow-hidden ${isSelected
                      ? 'bg-charcoal-850 border-gold-500 shadow-gold-glow ring-1 ring-gold-500'
                      : 'bg-charcoal-900 border-charcoal-800 hover:border-charcoal-700 hover:bg-charcoal-850/80'
                      }`}
                  >
                    <div>
                      {/* Photo Thumbnail */}
                      <div className="relative mb-3 rounded-xl overflow-hidden aspect-[4/3] bg-charcoal-950">
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2 bg-charcoal-950/80 backdrop-blur-sm border border-charcoal-800 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-gold-400">
                          {item.code}
                        </div>
                        <div className="absolute top-2 right-2 bg-charcoal-950/80 backdrop-blur-sm border border-charcoal-800 px-2 py-0.5 rounded text-[10px] font-mono text-white">
                          Tray: {item.compartmentCode}
                        </div>
                        {item.images.length > 1 && (
                          <div className="absolute bottom-2 right-2 bg-black/70 px-1.5 py-0.5 rounded text-[9px] text-slate-300">
                            {item.images.length} photos
                          </div>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-white group-hover:text-gold-300 transition-colors line-clamp-1">
                        {item.name}
                      </h4>

                      <div className="flex items-center space-x-2 mt-1.5 text-[11px] text-slate-400">
                        <span>{item.purity}</span>
                        <span>•</span>
                        <span className="text-slate-300 font-semibold">{item.weightGrams}g</span>
                        <span>•</span>
                        <span className="truncate">{item.lengthDimensions || item.jewelleryType}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-charcoal-800 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-slate-500 block">
                          Suggested Price
                        </span>
                        <span className="text-sm font-extrabold text-gold-400">
                          {formatKSh(item.suggestedPrice)}
                        </span>
                      </div>

                      <button
                        type="button"
                        className={`p-2 rounded-xl text-xs font-bold flex items-center space-x-1 ${isSelected
                          ? 'bg-gold-500 text-charcoal-950'
                          : 'bg-charcoal-800 text-slate-300 group-hover:bg-gold-500/20 group-hover:text-gold-300'
                          }`}
                      >
                        <span>{isSelected ? 'Selected' : 'Select'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Negotiated Pricing & Cart Checkout Panel (5 Cols) */}
        <div id="pricing-engine-panel" className="lg:col-span-5 bg-charcoal-900 border border-charcoal-800 rounded-2xl p-4 sm:p-5 sticky top-20 shadow-premium">
          <div className="flex items-center justify-between pb-3.5 border-b border-charcoal-800 mb-4">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-4 h-4 text-gold-400" />
              <h3 className="text-sm font-bold text-white uppercase font-brand">
                Transaction & Pricing Engine
              </h3>
            </div>
            {activeItem && (
              <button
                onClick={clearSelection}
                className="text-[11px] text-slate-400 hover:text-red-400 flex items-center space-x-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {!activeItem ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-charcoal-950 border border-charcoal-800 flex items-center justify-center mx-auto text-gold-500/60 mb-3">
                <Tag className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">No Item Selected</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Choose a jewellery piece from the catalogue or enter shelf compartment (e.g. A-03) to begin negotiating.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Active Selected Item Header */}
              <div className="flex items-start space-x-3 p-3 bg-charcoal-950 rounded-xl border border-charcoal-800">
                <img
                  src={activeItem.images[0]}
                  alt={activeItem.name}
                  className="w-16 h-16 rounded-lg object-cover border border-charcoal-700 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-mono font-bold text-gold-400">
                    {activeItem.code} • Shelf {activeItem.compartmentCode}
                  </span>
                  <h4 className="text-xs font-bold text-white truncate">
                    {activeItem.name}
                  </h4>
                  <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                    <span>{activeItem.purity}</span>
                    <span>•</span>
                    <span className="text-gold-300 font-semibold">{activeItem.weightGrams}g</span>
                  </div>
                </div>
              </div>

              {/* Pricing Cards */}
              <div className="space-y-3">
                {/* Suggested Price Display */}
                <div className="p-3 bg-charcoal-950/80 rounded-xl border border-charcoal-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                      Owner's Suggested Price
                    </span>
                    <span className="text-sm font-bold text-slate-200">
                      {formatKSh(activeItem.suggestedPrice)}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 italic">Reference price</span>
                </div>

                {/* Negotiated Selling Price Input */}
                <div className="p-4 bg-charcoal-950 rounded-xl border-2 border-gold-500/40 relative">
                  <label className="block text-xs font-bold text-gold-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Customer Agreed Selling Price (KSh)</span>
                    <span className="text-[10px] text-slate-400 font-normal">Negotiated</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                      KSh
                    </span>
                    <input
                      type="number"
                      step={500}
                      value={negotiatedPrice || ''}
                      onChange={(e) => {
                        setNegotiatedPrice(Number(e.target.value));
                        setApprovalInfo(null); // Price changed, requires re-check
                      }}
                      className="w-full pl-14 pr-4 py-3 bg-charcoal-900 border border-charcoal-700 rounded-xl text-white font-mono text-xl font-extrabold focus:outline-none focus:border-gold-500"
                    />
                  </div>

                  {/* Real-time Validation Indicator */}
                  <div className="mt-3 pt-2.5 border-t border-charcoal-800 text-xs">
                    {isApproved ? (
                      <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
                        <CheckCircle className="w-4 h-4" />
                        <span>Authorized by {approvalInfo.approvedBy}</span>
                      </div>
                    ) : isWithinRange ? (
                      <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
                        <CheckCircle className="w-4 h-4" />
                        <span>Price within authorized selling range</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-amber-400 font-semibold">
                        <AlertTriangle className="w-4 h-4 animate-bounce" />
                        <span>Below allowable threshold — Boss PIN approval required</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Confidentiality Notice */}
                <div className="p-2.5 rounded-lg bg-charcoal-950/60 border border-charcoal-800/80 flex items-center space-x-2 text-[11px] text-slate-500">
                  <Lock className="w-3.5 h-3.5 text-gold-500/70 flex-shrink-0" />
                  <span>Buying cost & minimum allowable margins remain confidential.</span>
                </div>
              </div>

              {/* Checkout / Approval Trigger Button */}
              <div>
                {isBelowMinimum && !isApproved ? (
                  <button
                    type="button"
                    onClick={handleCheckoutClick}
                    className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-charcoal-950 font-extrabold text-xs tracking-wider uppercase flex items-center justify-center space-x-2 transition-all shadow-lg shadow-amber-500/20"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Request Boss / Manager Approval</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCheckoutClick}
                    className="w-full py-3.5 px-4 rounded-xl gold-button-gradient text-charcoal-950 font-extrabold text-xs tracking-wider uppercase flex items-center justify-center space-x-2 transition-all shadow-gold-glow"
                  >
                    <span>Proceed to Payment ({formatKSh(negotiatedPrice)})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Approval Modal */}
      {activeItem && (
        <ApprovalModal
          item={activeItem}
          proposedPrice={negotiatedPrice}
          isOpen={isApprovalModalOpen}
          onClose={() => setIsApprovalModalOpen(false)}
          onApproved={(approverName, notes) => {
            setApprovalInfo({ approvedBy: approverName, notes });
          }}
        />
      )}

      {/* Payment Processing Modal */}
      {activeItem && (
        <PaymentModal
          totalAmount={negotiatedPrice}
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onProcessPayment={handlePaymentConfirmed}
        />
      )}

      {/* Completed Sale Receipt Modal */}
      {completedSale && (
        <ReceiptModal
          sale={completedSale}
          isOpen={!!completedSale}
          onClose={() => setCompletedSale(null)}
        />
      )}
    </div>
  );
};

