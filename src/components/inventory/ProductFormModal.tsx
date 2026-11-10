import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { JewelleryItem, JewelleryCategory, JewelleryMaterial, ProductStatus } from '../../types';
import { generateProductCode } from '../../utils/formatters';
import { 
  X, 
  Upload, 
  Camera, 
  Sparkles, 
  Lock, 
  Gem, 
  Plus, 
  Trash2,
  Check
} from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialItem?: JewelleryItem;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  initialItem,
}) => {
  const { showcases, products, suppliers, addProduct, updateProduct } = useStore();
  const { currentUser } = useAuth();

  const isEditing = !!initialItem;

  // Form fields
  const [name, setName] = useState(initialItem?.name || '');
  const [category, setCategory] = useState<JewelleryCategory>(initialItem?.category || 'Chains');
  const [jewelleryType, setJewelleryType] = useState(initialItem?.jewelleryType || 'Cuban Link Chain');
  const [material, setMaterial] = useState<JewelleryMaterial>(initialItem?.material || 'Gold');
  const [purity, setPurity] = useState(initialItem?.purity || '18K (750)');
  const [weightGrams, setWeightGrams] = useState<number>(initialItem?.weightGrams || 20);
  const [lengthDimensions, setLengthDimensions] = useState(initialItem?.lengthDimensions || '55 cm');
  const [description, setDescription] = useState(initialItem?.description || '');
  
  // Pricing fields (Owner only sets buying & minimum prices)
  const [buyingPrice, setBuyingPrice] = useState<number>(initialItem?.buyingPrice || 25000);
  const [suggestedPrice, setSuggestedPrice] = useState<number>(initialItem?.suggestedPrice || 35000);
  const [minSellingPrice, setMinSellingPrice] = useState<number>(initialItem?.minSellingPrice || 29000);

  // Shelf & Compartment
  const [showcaseId, setShowcaseId] = useState(initialItem?.showcaseId || showcases[0]?.id || 'showcase-a');
  const [compartmentCode, setCompartmentCode] = useState(initialItem?.compartmentCode || 'A-03');
  const [supplier, setSupplier] = useState(initialItem?.supplier || suppliers[0]?.name || 'Dubai Gold Souk Imports');
  const [status, setStatus] = useState<ProductStatus>(initialItem?.status || 'Available');

  // Photographs (Multiple photos for physical tagless matching)
  const [images, setImages] = useState<string[]>(
    initialItem?.images || [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1611591475102-468ae701358d?w=600&auto=format&fit=crop&q=80',
    ]
  );
  const [newImageUrl, setNewImageUrl] = useState('');

  if (!isOpen) return null;

  // Auto-generate code if adding new
  const productCode = isEditing
    ? initialItem.code
    : generateProductCode(category, products.length);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddSamplePhoto = () => {
    const samplePhotos = [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&auto=format&fit=crop&q=80',
    ];
    const nextPhoto = samplePhotos[images.length % samplePhotos.length];
    setImages([...images, nextPhoto]);
  };

  const handleRemovePhoto = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !currentUser) return;

    if (isEditing && initialItem) {
      updateProduct(
        initialItem.id,
        {
          name,
          category,
          jewelleryType,
          material,
          purity,
          weightGrams,
          lengthDimensions,
          description,
          buyingPrice,
          suggestedPrice,
          minSellingPrice,
          showcaseId,
          compartmentCode,
          supplier,
          status,
          images,
        },
        currentUser.name,
        currentUser.role
      );
    } else {
      addProduct(
        {
          code: productCode,
          name,
          category,
          jewelleryType,
          material,
          purity,
          weightGrams,
          lengthDimensions,
          description,
          buyingPrice,
          suggestedPrice,
          minSellingPrice,
          quantity: 1,
          showcaseId,
          compartmentCode,
          supplier,
          datePurchased: new Date().toISOString().split('T')[0],
          status,
          images,
        },
        currentUser.name,
        currentUser.role
      );
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-charcoal-900 border border-gold-500/40 rounded-2xl max-w-2xl w-full p-6 shadow-premium relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-charcoal-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/40 flex items-center justify-center text-gold-400">
            <Gem className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-brand">
              {isEditing ? 'Edit Jewellery Piece' : 'Register New Jewellery Piece'}
            </h3>
            <p className="text-xs text-slate-400">
              Assigned Product Code:{' '}
              <span className="text-gold-400 font-mono font-bold">{productCode}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Basic Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider">
                Product Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. 18K Yellow Gold Miami Cuban Link Chain"
                className="w-full px-3 py-2.5 bg-charcoal-950 border border-charcoal-700 rounded-xl text-white text-xs focus:outline-none focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as JewelleryCategory)}
                className="w-full px-3 py-2 bg-charcoal-950 border border-charcoal-700 rounded-xl text-white text-xs focus:outline-none focus:border-gold-500"
              >
                {(['Chains', 'Necklaces', 'Rings', 'Bracelets', 'Bangles', 'Earrings', 'Pendants'] as JewelleryCategory[]).map(
                  (c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider">
                Material & Type
              </label>
              <input
                type="text"
                value={jewelleryType}
                onChange={(e) => setJewelleryType(e.target.value)}
                placeholder="e.g. Cuban Link Chain, Solitaire"
                className="w-full px-3 py-2 bg-charcoal-950 border border-charcoal-700 rounded-xl text-white text-xs focus:outline-none focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider">
                Gold Purity / Metal Grade
              </label>
              <select
                value={purity}
                onChange={(e) => setPurity(e.target.value)}
                className="w-full px-3 py-2 bg-charcoal-950 border border-charcoal-700 rounded-xl text-white text-xs focus:outline-none focus:border-gold-500"
              >
                <option value="9K (375)">9K (375 Gold)</option>
                <option value="14K (585)">14K (585 Gold)</option>
                <option value="18K (750)">18K (750 High Gold)</option>
                <option value="22K (916)">22K (916 Pure Gold)</option>
                <option value="24K (999)">24K (999 Fine Gold)</option>
                <option value="925 Sterling Silver">925 Sterling Silver</option>
                <option value="Platinum 950">Platinum 950</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider">
                Weight in Grams
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={weightGrams}
                onChange={(e) => setWeightGrams(Number(e.target.value))}
                className="w-full px-3 py-2 bg-charcoal-950 border border-charcoal-700 rounded-xl text-white text-xs focus:outline-none focus:border-gold-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider">
                Length / Ring Size
              </label>
              <input
                type="text"
                value={lengthDimensions}
                onChange={(e) => setLengthDimensions(e.target.value)}
                placeholder="e.g. 60 cm, Ring Size 7"
                className="w-full px-3 py-2 bg-charcoal-950 border border-charcoal-700 rounded-xl text-white text-xs focus:outline-none focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider">
                Supplier Source
              </label>
              <select
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full px-3 py-2 bg-charcoal-950 border border-charcoal-700 rounded-xl text-white text-xs focus:outline-none focus:border-gold-500"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location Assignment */}
          <div className="p-3.5 bg-charcoal-950 rounded-xl border border-charcoal-800 space-y-3">
            <span className="text-[11px] font-bold text-gold-400 uppercase tracking-wider block">
              Physical Showcase & Compartment Assignment
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Showcase Display Unit</label>
                <select
                  value={showcaseId}
                  onChange={(e) => setShowcaseId(e.target.value)}
                  className="w-full px-3 py-2 bg-charcoal-900 border border-charcoal-700 rounded-lg text-white text-xs"
                >
                  {showcases.map((sc) => (
                    <option key={sc.id} value={sc.id}>
                      {sc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Numbered Compartment Code</label>
                <select
                  value={compartmentCode}
                  onChange={(e) => setCompartmentCode(e.target.value)}
                  className="w-full px-3 py-2 bg-charcoal-900 border border-charcoal-700 rounded-lg text-gold-400 font-mono font-bold text-xs"
                >
                  {showcases
                    .find((s) => s.id === showcaseId)
                    ?.compartments.map((comp) => (
                      <option key={comp.code} value={comp.code}>
                        {comp.code} — {comp.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* Pricing Engine (Owner Confidentiality) */}
          <div className="p-3.5 bg-charcoal-950 rounded-xl border border-gold-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gold-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>Pricing Vault (Owner Authority)</span>
              </span>
              <span className="text-[10px] text-slate-500">
                Buying & Min prices hidden from employees
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Buying Cost (KSh)</label>
                <input
                  type="number"
                  required
                  value={buyingPrice}
                  onChange={(e) => setBuyingPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-charcoal-900 border border-charcoal-700 rounded-lg text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Suggested Selling (KSh)</label>
                <input
                  type="number"
                  required
                  value={suggestedPrice}
                  onChange={(e) => setSuggestedPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-charcoal-900 border border-charcoal-700 rounded-lg text-gold-400 font-mono font-bold text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Minimum Floor Price (KSh)</label>
                <input
                  type="number"
                  required
                  value={minSellingPrice}
                  onChange={(e) => setMinSellingPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-charcoal-900 border border-charcoal-700 rounded-lg text-amber-400 font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Multiple Photographs for Tagless Visual Matching */}
          <div className="p-3.5 bg-charcoal-950 rounded-xl border border-charcoal-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-white uppercase tracking-wider block">
                  Macro Jewellery Photographs
                </span>
                <span className="text-[10px] text-slate-400">
                  Multiple photos replace physical labels for side-by-side identification
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  id="camera-photo-input"
                  className="hidden"
                  multiple
                />
                <label
                  htmlFor="camera-photo-input"
                  className="px-2.5 py-1.5 rounded-lg bg-gold-500 hover:bg-gold-400 text-charcoal-950 text-xs font-bold flex items-center space-x-1 cursor-pointer shadow-gold-glow transition-all"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Snap Photo</span>
                </label>
                <button
                  type="button"
                  onClick={handleAddSamplePhoto}
                  className="px-2 py-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-slate-400 text-xs font-medium"
                >
                  + Sample
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {images.map((imgUrl, idx) => (
                <div key={idx} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-charcoal-700">
                  <img src={imgUrl} alt={`angle ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="absolute top-1 right-1 p-1 rounded bg-black/70 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-charcoal-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-charcoal-800 text-slate-300 text-xs font-semibold hover:bg-charcoal-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl gold-button-gradient text-charcoal-950 font-bold text-xs shadow-gold-glow flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? 'Save Changes' : 'Register Piece in Vault'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

