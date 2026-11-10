import React, { useState } from 'react';
import { formatKSh } from '../../utils/formatters';
import { 
  TrendingUp, 
  Calculator, 
  Gem, 
  X, 
  Sparkles, 
  Clock, 
  ArrowRight,
  ShieldCheck 
} from 'lucide-react';

interface GoldRateWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPrice?: (calculatedPrice: number) => void;
}

export const GoldRateWidget: React.FC<GoldRateWidgetProps> = ({
  isOpen,
  onClose,
  onApplyPrice,
}) => {
  const [selectedKarat, setSelectedKarat] = useState<'24K' | '22K' | '18K' | '14K' | '925 Silver'>('18K');
  const [weightGrams, setWeightGrams] = useState<number>(24.5);
  const [craftsmanshipMarkup, setCraftsmanshipMarkup] = useState<number>(25); // 25%

  if (!isOpen) return null;

  // Live Nairobi Gold Spot Rates in KSh / gram
  const spotRates: Record<string, number> = {
    '24K': 10450,
    '22K': 9580,
    '18K': 7840,
    '14K': 6100,
    '925 Silver': 145,
  };

  const ratePerGram = spotRates[selectedKarat] || 7840;
  const rawMetalCost = Math.round(weightGrams * ratePerGram);
  const retailEstimate = Math.round(rawMetalCost * (1 + craftsmanshipMarkup / 100));

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-charcoal-900 border border-gold-500/50 rounded-2xl max-w-lg w-full p-6 shadow-premium relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-charcoal-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/40 flex items-center justify-center text-gold-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-brand">
              Live Nairobi Bullion Rate & Valuation
            </h3>
            <p className="text-xs text-slate-400">
              Spot bullion reference for negotiated pricing & buying verification
            </p>
          </div>
        </div>

        {/* Spot Rates Ticker Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
          {Object.entries(spotRates).slice(0, 4).map(([karat, rate]) => (
            <div
              key={karat}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                selectedKarat === karat
                  ? 'bg-gold-500/15 border-gold-400'
                  : 'bg-charcoal-950 border-charcoal-800'
              }`}
            >
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                {karat} Gold
              </span>
              <span className="text-xs font-mono font-bold text-gold-400">
                {formatKSh(rate)}
                <span className="text-[9px] text-slate-500 font-normal">/g</span>
              </span>
            </div>
          ))}
        </div>

        {/* Interactive Craftsmanship Calculator */}
        <div className="bg-charcoal-950 p-4 rounded-xl border border-charcoal-800 space-y-3.5 mb-5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase text-[10px]">
                Selected Grade
              </label>
              <select
                value={selectedKarat}
                onChange={(e) => setSelectedKarat(e.target.value as any)}
                className="w-full px-3 py-2 bg-charcoal-900 border border-charcoal-700 rounded-lg text-white font-semibold"
              >
                <option value="24K">24K (Fine Bullion)</option>
                <option value="22K">22K (916 Traditional)</option>
                <option value="18K">18K (750 High Jewellery)</option>
                <option value="14K">14K (585 Commercial)</option>
                <option value="925 Silver">925 Sterling Silver</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase text-[10px]">
                Piece Weight (Grams)
              </label>
              <input
                type="number"
                step="0.1"
                value={weightGrams}
                onChange={(e) => setWeightGrams(Number(e.target.value))}
                className="w-full px-3 py-2 bg-charcoal-900 border border-charcoal-700 rounded-lg text-white font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-slate-300 font-semibold uppercase text-[10px]">
                Craftsmanship & Design Premium
              </label>
              <span className="text-gold-400 font-bold">{craftsmanshipMarkup}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={craftsmanshipMarkup}
              onChange={(e) => setCraftsmanshipMarkup(Number(e.target.value))}
              className="w-full accent-gold-500"
            />
          </div>

          {/* Results Comparison */}
          <div className="pt-3 border-t border-charcoal-800 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Intrinsic Metal Bullion Cost:</span>
              <span className="font-mono text-slate-200">{formatKSh(rawMetalCost)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-gold-400 pt-1">
              <span>Fair Minimum Retail Floor:</span>
              <span className="font-mono text-base">{formatKSh(retailEstimate)}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-charcoal-800 text-slate-300 text-xs font-semibold hover:bg-charcoal-700"
          >
            Close
          </button>
          {onApplyPrice && (
            <button
              type="button"
              onClick={() => {
                onApplyPrice(retailEstimate);
                onClose();
              }}
              className="px-4 py-2 rounded-xl gold-button-gradient text-charcoal-950 font-bold text-xs shadow-gold-glow flex items-center space-x-1"
            >
              <span>Apply KSh {retailEstimate.toLocaleString()} to POS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

