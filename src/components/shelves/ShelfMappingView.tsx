import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from '../router/Router';
import { JewelleryItem, ShelfCompartment } from '../../types';
import { formatKSh } from '../../utils/formatters';
import {
  Grid3X3,
  Search,
  Gem,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  MoveRight,
  Sparkles,
  Info,
  Maximize2,
  X,
  Layers,
  ShoppingBag,
} from 'lucide-react';

export const ShelfMappingView: React.FC = () => {
  const { showcases, products, moveProduct } = useStore();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [selectedShowcaseId, setSelectedShowcaseId] = useState<string>(showcases[0]?.id || 'showcase-a');
  const [selectedCompartmentCode, setSelectedCompartmentCode] = useState<string>('A-03');
  const [searchCode, setSearchCode] = useState<string>('');
  const [activePhotoModal, setActivePhotoModal] = useState<JewelleryItem | null>(null);
  const [movingProduct, setMovingProduct] = useState<JewelleryItem | null>(null);
  const [destinationCode, setDestinationCode] = useState<string>('A-01');

  const isOwnerOrManager = currentUser?.role === 'OWNER' || currentUser?.role === 'MANAGER';

  const currentShowcase = showcases.find((s) => s.id === selectedShowcaseId) || showcases[0];

  // Helper to determine status color for a compartment
  const getCompartmentStatus = (code: string) => {
    const items = products.filter((p) => p.compartmentCode === code);
    if (items.length === 0) return 'empty';
    if (items.some((i) => i.status === 'Available')) return 'available';
    if (items.some((i) => i.status === 'Reserved')) return 'reserved';
    return 'sold';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return {
          bg: 'bg-emerald-500/15',
          border: 'border-emerald-500/40',
          text: 'text-emerald-400',
          dot: 'bg-emerald-400',
          label: 'Available Stock',
        };
      case 'reserved':
        return {
          bg: 'bg-amber-500/15',
          border: 'border-amber-500/40',
          text: 'text-amber-400',
          dot: 'bg-amber-400',
          label: 'Reserved Stock',
        };
      case 'sold':
        return {
          bg: 'bg-red-500/15',
          border: 'border-red-500/40',
          text: 'text-red-400',
          dot: 'bg-red-400',
          label: 'All Sold',
        };
      default:
        return {
          bg: 'bg-charcoal-800/50',
          border: 'border-charcoal-700',
          text: 'text-slate-400',
          dot: 'bg-slate-500',
          label: 'Empty Compartment',
        };
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) return;
    const clean = searchCode.trim().toUpperCase();

    // Check if it's a compartment code (e.g. A-03)
    let found = false;
    showcases.forEach((sc) => {
      const comp = sc.compartments.find((c) => c.code === clean);
      if (comp) {
        setSelectedShowcaseId(sc.id);
        setSelectedCompartmentCode(comp.code);
        found = true;
      }
    });

    if (!found) {
      // Check if it's a product code (e.g. AC-GOLD-001)
      const prod = products.find((p) => p.code.toUpperCase() === clean);
      if (prod) {
        setSelectedShowcaseId(prod.showcaseId);
        setSelectedCompartmentCode(prod.compartmentCode);
        found = true;
      }
    }
  };

  const selectedItems = products.filter((p) => p.compartmentCode === selectedCompartmentCode);

  const handleSellInPOS = (product: JewelleryItem) => {
    // Navigate to POS with preselected item
    navigate(`/pos?code=${product.code}`);
  };

  const handleConfirmMove = () => {
    if (!movingProduct || !currentUser) return;
    const destShowcase = showcases.find((sc) =>
      sc.compartments.some((c) => c.code === destinationCode)
    );
    if (!destShowcase) return;

    moveProduct(
      movingProduct.id,
      destinationCode,
      destShowcase.id,
      currentUser.name,
      currentUser.role
    );
    setMovingProduct(null);
  };

  return (
    <div className="space-y-6">
      {/* Workflow Explanation Banner */}
      <div className="bg-charcoal-900/80 border border-gold-500/30 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-gold-glow">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/40 flex items-center justify-center flex-shrink-0 text-gold-400 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide uppercase font-brand">
                Tagless Physical Jewellery Identification
              </h2>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-2xl">
                Physical jewellery in showcases does not carry barcodes or stickers. Locate the compartment number on the display tray (e.g. <strong className="text-gold-400">A-03</strong>), then match the physical piece against high-resolution photography, weight in grams, and purity.
              </p>
            </div>
          </div>

          {/* Quick Compartment Finder Form */}
          <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="Enter code (e.g. A-03)"
                className="pl-9 pr-3 py-2 bg-charcoal-950 border border-charcoal-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold-500 uppercase font-mono w-44"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl gold-button-gradient text-charcoal-950 text-xs font-bold shadow-gold-glow"
            >
              Lookup
            </button>
          </form>
        </div>
      </div>

      {/* Color Indicator Legend */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-6 bg-charcoal-900/60 border border-charcoal-800 rounded-xl px-4 py-2.5 text-xs">
        <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
          Indicator Legend:
        </span>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-emerald-500/30" />
          <span className="text-slate-200">Green: Available Stock</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400 ring-2 ring-red-500/30" />
          <span className="text-slate-200">Red: Sold Out</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-amber-500/30" />
          <span className="text-slate-200">Orange: Reserved</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
          <span className="text-slate-400">Grey: Empty</span>
        </div>
      </div>

      {/* Showcase Selector Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-charcoal-800 pb-3">
        {showcases.map((sc) => {
          const isActive = sc.id === selectedShowcaseId;
          return (
            <button
              key={sc.id}
              onClick={() => {
                setSelectedShowcaseId(sc.id);
                setSelectedCompartmentCode(sc.compartments[0]?.code || 'A-01');
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                isActive
                  ? 'bg-gold-500 text-charcoal-950 shadow-gold-glow'
                  : 'bg-charcoal-900 text-slate-300 hover:bg-charcoal-800 border border-charcoal-800'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
              <span>{sc.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Showcase Layout: Left Grid, Right Compartment Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Showcase Compartments Grid (Lg: 5 Cols) */}
        <div className="lg:col-span-5 bg-charcoal-900 border border-charcoal-800 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase font-brand">
                {currentShowcase.name}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentShowcase.description}
              </p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-charcoal-800 text-gold-400 border border-charcoal-700">
              {currentShowcase.compartments.length} Trays
            </span>
          </div>

          {/* Visual Shelf Trays Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {currentShowcase.compartments.map((comp) => {
              const status = getCompartmentStatus(comp.code);
              const badge = getStatusBadge(status);
              const isSelected = selectedCompartmentCode === comp.code;
              const itemsInComp = products.filter((p) => p.compartmentCode === comp.code);

              return (
                <button
                  key={comp.id}
                  onClick={() => setSelectedCompartmentCode(comp.code)}
                  className={`p-3.5 rounded-xl text-left border transition-all relative overflow-hidden group flex flex-col justify-between h-32 ${
                    isSelected
                      ? 'bg-charcoal-800 border-gold-500 shadow-gold-glow'
                      : 'bg-charcoal-950/80 border-charcoal-800 hover:border-charcoal-700 hover:bg-charcoal-800/40'
                  }`}
                >
                  {/* Status Indicator Pill */}
                  <div className="flex items-center justify-between w-full">
                    <span className="font-mono text-base font-extrabold text-white tracking-wider">
                      {comp.code}
                    </span>
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${badge.dot} ${
                        status === 'available' ? 'animate-pulse' : ''
                      }`}
                    />
                  </div>

                  <div>
                    <p className="text-[11px] font-medium text-slate-300 line-clamp-1 mt-1">
                      {comp.name}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">
                        {itemsInComp.length} piece{itemsInComp.length !== 1 ? 's' : ''}
                      </span>
                      <span className={`font-semibold ${badge.text}`}>
                        {badge.label}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="absolute top-0 right-0 w-2 h-full bg-gold-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Compartment Detail & Photo Matching (Lg: 7 Cols) */}
        <div className="lg:col-span-7 bg-charcoal-900 border border-charcoal-800 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between pb-4 border-b border-charcoal-800 mb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-gold-500/20 text-gold-400 border border-gold-500/40 font-mono text-sm font-extrabold">
                  {selectedCompartmentCode}
                </span>
                <h3 className="text-sm font-bold text-white uppercase font-brand">
                  Compartment Inventory ({selectedItems.length} Piece{selectedItems.length !== 1 ? 's' : ''})
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Visual photo comparison for physical verification
              </p>
            </div>

            {selectedItems.length > 1 && (
              <span className="text-[11px] text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/30 flex items-center space-x-1">
                <Info className="w-3 h-3" />
                <span>Multiple pieces in tray — verify photo</span>
              </span>
            )}
          </div>

          {selectedItems.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-charcoal-950 border border-charcoal-800 flex items-center justify-center mx-auto text-slate-500 mb-3">
                <Layers className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-slate-300">
                Compartment {selectedCompartmentCode} is currently empty
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No jewellery is assigned to this compartment. You can move pieces here from the inventory vault.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedItems.map((item) => {
                const isAvailable = item.status === 'Available';
                const isSold = item.status === 'Sold';
                const isReserved = item.status === 'Reserved';

                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border p-4 transition-all ${
                      isAvailable
                        ? 'bg-charcoal-950/90 border-charcoal-700/80 hover:border-gold-500/40'
                        : isReserved
                        ? 'bg-amber-950/20 border-amber-800/40'
                        : 'bg-charcoal-950/40 border-charcoal-800 opacity-70'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Photo Thumbnail Gallery */}
                      <div className="flex-shrink-0 relative group">
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="w-full sm:w-36 h-36 rounded-xl object-cover border border-charcoal-700 shadow-md group-hover:border-gold-400 transition-colors"
                        />
                        <button
                          onClick={() => setActivePhotoModal(item)}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center text-white text-xs font-semibold space-x-1"
                        >
                          <Maximize2 className="w-4 h-4" />
                          <span>Enlarge Photos</span>
                        </button>
                        {item.images.length > 1 && (
                          <span className="absolute bottom-1.5 right-1.5 bg-black/70 px-1.5 py-0.5 rounded text-[10px] text-white">
                            {item.images.length} photos
                          </span>
                        )}
                      </div>

                      {/* Product Specifications for Physical Matching */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-mono font-bold text-gold-400 tracking-wider">
                                {item.code}
                              </span>
                              <h4 className="text-sm font-bold text-white leading-snug">
                                {item.name}
                              </h4>
                            </div>

                            {/* Status Tag */}
                            <div>
                              {isAvailable && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                                  Available
                                </span>
                              )}
                              {isReserved && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                                  Reserved
                                </span>
                              )}
                              {isSold && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/40">
                                  Sold
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Matching Specs Badges */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 my-2.5 text-xs">
                            <div className="bg-charcoal-900 p-2 rounded-lg border border-charcoal-800">
                              <span className="text-[10px] text-slate-400 block uppercase">
                                Purity
                              </span>
                              <span className="font-semibold text-slate-200">
                                {item.purity}
                              </span>
                            </div>
                            <div className="bg-charcoal-900 p-2 rounded-lg border border-charcoal-800">
                              <span className="text-[10px] text-slate-400 block uppercase">
                                Weight
                              </span>
                              <span className="font-semibold text-gold-400">
                                {item.weightGrams} grams
                              </span>
                            </div>
                            <div className="bg-charcoal-900 p-2 rounded-lg border border-charcoal-800">
                              <span className="text-[10px] text-slate-400 block uppercase">
                                Dimensions
                              </span>
                              <span className="font-semibold text-slate-200 truncate block">
                                {item.lengthDimensions || 'Standard'}
                              </span>
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-400 line-clamp-2">
                            {item.description}
                          </p>
                        </div>

                        {/* Pricing & Actions */}
                        <div className="flex items-center justify-between pt-3 border-t border-charcoal-800/80 mt-3">
                          <div>
                            <span className="text-[10px] text-slate-400 block uppercase">
                              Suggested Price
                            </span>
                            <span className="text-base font-extrabold text-gold-400">
                              {formatKSh(item.suggestedPrice)}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            {/* Move button for Boss/Manager */}
                            {isOwnerOrManager && (
                              <button
                                onClick={() => setMovingProduct(item)}
                                className="px-2.5 py-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-slate-300 text-xs font-semibold border border-charcoal-700 flex items-center space-x-1"
                              >
                                <MoveRight className="w-3.5 h-3.5" />
                                <span>Relocate</span>
                              </button>
                            )}

                            {/* Sell in POS Button */}
                            {isAvailable && (
                              <button
                                onClick={() => handleSellInPOS(item)}
                                className="px-3 py-1.5 rounded-lg gold-button-gradient text-charcoal-950 text-xs font-bold shadow-gold-glow flex items-center space-x-1"
                              >
                                <ShoppingBag className="w-3.5 h-3.5" />
                                <span>Sell in POS</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Multiple Photos Enlarge Modal */}
      {activePhotoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-charcoal-900 border border-gold-500/40 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-charcoal-800 mb-4">
              <div>
                <span className="text-xs font-mono font-bold text-gold-400">
                  {activePhotoModal.code} • Compartment {activePhotoModal.compartmentCode}
                </span>
                <h3 className="text-base font-bold text-white">
                  {activePhotoModal.name}
                </h3>
              </div>
              <button
                onClick={() => setActivePhotoModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-charcoal-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activePhotoModal.images.map((imgUrl, idx) => (
                <div key={idx} className="space-y-1">
                  <img
                    src={imgUrl}
                    alt={`${activePhotoModal.name} view ${idx + 1}`}
                    className="w-full h-64 object-cover rounded-xl border border-charcoal-700"
                  />
                  <span className="text-[11px] text-slate-400 text-center block">
                    Macro Angle {idx + 1}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 rounded-xl bg-charcoal-950 border border-charcoal-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400">Exact Weight: </span>
                <strong className="text-gold-400">{activePhotoModal.weightGrams}g</strong>
                <span className="text-slate-400 ml-3">Purity: </span>
                <strong className="text-white">{activePhotoModal.purity}</strong>
              </div>
              <button
                onClick={() => {
                  setActivePhotoModal(null);
                  handleSellInPOS(activePhotoModal);
                }}
                className="px-4 py-2 rounded-xl gold-button-gradient text-charcoal-950 font-bold"
              >
                Select for POS Sale
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Relocate Jewellery Modal */}
      {movingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-charcoal-900 border border-charcoal-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2 font-brand">
              Relocate Jewellery Piece
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Moving <strong className="text-white">{movingProduct.name} ({movingProduct.code})</strong> from current compartment <span className="text-gold-400 font-mono font-bold">{movingProduct.compartmentCode}</span>.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Select Destination Compartment
                </label>
                <select
                  value={destinationCode}
                  onChange={(e) => setDestinationCode(e.target.value)}
                  className="w-full p-2.5 bg-charcoal-950 border border-charcoal-700 rounded-xl text-white text-xs focus:outline-none focus:border-gold-500"
                >
                  {showcases.flatMap((sc) =>
                    sc.compartments.map((comp) => (
                      <option key={comp.code} value={comp.code}>
                        {sc.name.split(' ')[0]} {sc.name.split(' ')[1]} — {comp.code} ({comp.name})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-charcoal-800">
                <button
                  type="button"
                  onClick={() => setMovingProduct(null)}
                  className="px-4 py-2 rounded-xl bg-charcoal-800 text-slate-300 text-xs font-semibold hover:bg-charcoal-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmMove}
                  className="px-4 py-2 rounded-xl gold-button-gradient text-charcoal-950 text-xs font-bold"
                >
                  Confirm Relocation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

