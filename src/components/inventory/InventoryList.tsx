import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { JewelleryItem, JewelleryCategory, ProductStatus } from '../../types';
import { formatKSh } from '../../utils/formatters';
import { exportToCSV } from '../../utils/csvExport';
import { ProductFormModal } from './ProductFormModal';
import { useNavigate } from '../router/Router';
import {
  Package,
  Search,
  Filter,
  Plus,
  Lock,
  Eye,
  Edit2,
  Trash2,
  Grid3X3,
  Camera,
  ShoppingBag,
  Gem,
  CheckCircle,
  Tag,
  ArrowUpDown,
  Download,
} from 'lucide-react';

export const InventoryList: React.FC = () => {
  const { products, deleteProduct } = useStore();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const isOwner = currentUser?.role === 'OWNER';
  const isManager = currentUser?.role === 'MANAGER';
  const isOwnerOrManager = isOwner || isManager;

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<JewelleryItem | undefined>(undefined);
  const [detailItem, setDetailItem] = useState<JewelleryItem | null>(null);

  const categories = ['All', 'Chains', 'Necklaces', 'Rings', 'Bracelets', 'Bangles', 'Earrings', 'Pendants'];

  const filteredProducts = products.filter((p) => {
    if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;
    if (statusFilter !== 'All' && p.status !== statusFilter) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.code.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.compartmentCode.toLowerCase().includes(q) ||
        p.purity.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleEdit = (item: JewelleryItem) => {
    setEditingItem(item);
    setIsFormModalOpen(true);
  };

  const handleDelete = (item: JewelleryItem) => {
    if (!currentUser) return;
    if (confirm(`Are you sure you want to deactivate ${item.name} (${item.code})?`)) {
      deleteProduct(item.id, currentUser.name, currentUser.role);
    }
  };

  const handleSellInPOS = (item: JewelleryItem) => {
    navigate(`/pos?code=${item.code}`);
  };

  const handleExportInventory = () => {
    const exportData = filteredProducts.map((p) => {
      const base: Record<string, any> = {
        'Product Code': p.code,
        'Jewellery Name': p.name,
        Category: p.category,
        Purity: p.purity,
        'Weight (Grams)': p.weightGrams,
        'Shelf Tray': p.compartmentCode,
        Status: p.status,
        'Suggested Price (KSh)': p.suggestedPrice,
      };
      if (isOwner) {
        base['Buying Cost (KSh)'] = p.buyingPrice;
        base['Minimum Floor (KSh)'] = p.minSellingPrice;
        base['Gross Margin %'] = `${(((p.suggestedPrice - p.buyingPrice) / p.suggestedPrice) * 100).toFixed(1)}%`;
        base['Supplier'] = p.supplier;
      }
      return base;
    });
    exportToCSV('Acestone_Inventory_Valuation', exportData);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-charcoal-900 border border-charcoal-800 rounded-2xl p-5">
        <div>
          <span className="text-xs uppercase tracking-widest text-gold-400 font-semibold">
            {isOwner ? 'Master Inventory Vault' : 'Showroom Jewellery Catalogue'}
          </span>
          <h2 className="text-xl font-bold text-white tracking-wide font-brand">
            {filteredProducts.length} Registered Individual Pieces
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {isOwner
              ? 'Complete product ledger with buying costs, suggested prices, and minimum margins.'
              : 'Browse catalogue, check availability, and inspect photos for physical matching.'}
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={handleExportInventory}
            className="px-3.5 py-2.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-slate-300 hover:text-white border border-charcoal-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-gold-400" />
            <span>Export CSV</span>
          </button>

          {isOwner && (
            <button
              onClick={() => {
                setEditingItem(undefined);
                setIsFormModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl gold-button-gradient text-charcoal-950 font-bold text-xs shadow-gold-glow flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Register Piece</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by code (AC-GOLD-001), name, purity, tray..."
              className="w-full pl-10 pr-4 py-2 bg-charcoal-950 border border-charcoal-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-gold-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-charcoal-950 border border-charcoal-700 rounded-xl text-white text-xs focus:outline-none focus:border-gold-500"
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available Only</option>
              <option value="Sold">Sold Pieces</option>
              <option value="Reserved">Reserved</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex bg-charcoal-950 p-1 rounded-xl border border-charcoal-800">
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  viewMode === 'table' ? 'bg-gold-500 text-charcoal-950' : 'text-slate-400'
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  viewMode === 'grid' ? 'bg-gold-500 text-charcoal-950' : 'text-slate-400'
                }`}
              >
                Cards
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? 'bg-gold-500 text-charcoal-950 shadow-gold-glow'
                  : 'bg-charcoal-950 text-slate-300 hover:bg-charcoal-800 border border-charcoal-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table View */}
      {viewMode === 'table' ? (
        <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl overflow-hidden shadow-premium">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-charcoal-950/80 border-b border-charcoal-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Jewellery Piece</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3">Purity & Wt</th>
                  <th className="py-3 px-3">Status</th>
                  {isOwner && <th className="py-3 px-3">Buying Cost</th>}
                  <th className="py-3 px-3">Suggested</th>
                  {isOwner && <th className="py-3 px-3">Min Floor</th>}
                  {isOwner && <th className="py-3 px-3">Margin %</th>}
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-800/80">
                {filteredProducts.map((p) => {
                  const isAvailable = p.status === 'Available';
                  const marginPct = isOwner
                    ? (((p.suggestedPrice - p.buyingPrice) / p.suggestedPrice) * 100).toFixed(0)
                    : null;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-charcoal-850/60 transition-colors group"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover border border-charcoal-700 flex-shrink-0"
                          />
                          <div>
                            <span className="font-mono text-gold-400 font-bold block text-[11px]">
                              {p.code}
                            </span>
                            <span className="text-white font-semibold line-clamp-1">
                              {p.name}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-slate-300">
                        <span className="px-2 py-0.5 rounded bg-charcoal-950 border border-charcoal-800 text-gold-400">
                          {p.compartmentCode}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-300">
                        <div>{p.purity}</div>
                        <div className="text-[10px] text-gold-400 font-mono font-bold">{p.weightGrams}g</div>
                      </td>

                      <td className="py-3 px-3">
                        {p.status === 'Available' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            Available
                          </span>
                        )}
                        {p.status === 'Reserved' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            Reserved
                          </span>
                        )}
                        {p.status === 'Sold' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                            Sold
                          </span>
                        )}
                      </td>

                      {/* Owner Confidential Columns */}
                      {isOwner && (
                        <td className="py-3 px-3 font-mono text-slate-400">
                          {formatKSh(p.buyingPrice)}
                        </td>
                      )}

                      <td className="py-3 px-3 font-mono font-bold text-gold-400">
                        {formatKSh(p.suggestedPrice)}
                      </td>

                      {isOwner && (
                        <td className="py-3 px-3 font-mono text-amber-400">
                          {formatKSh(p.minSellingPrice)}
                        </td>
                      )}

                      {isOwner && (
                        <td className="py-3 px-3 font-mono font-semibold text-emerald-400">
                          {marginPct}%
                        </td>
                      )}

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {isAvailable && (
                            <button
                              onClick={() => handleSellInPOS(p)}
                              title="Sell in POS"
                              className="p-1.5 rounded-lg bg-charcoal-800 hover:bg-gold-500 hover:text-charcoal-950 text-gold-400 transition-colors"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {isOwner && (
                            <>
                              <button
                                onClick={() => handleEdit(p)}
                                title="Edit piece"
                                className="p-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-slate-300 transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(p)}
                                title="Deactivate"
                                className="p-1.5 rounded-lg bg-charcoal-800 hover:bg-red-950 text-slate-400 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards View Mode */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-4 flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-charcoal-950">
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-charcoal-950/80 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-gold-400">
                    {p.code}
                  </div>
                  <div className="absolute top-2 right-2 bg-charcoal-950/80 px-2 py-0.5 rounded text-[10px] font-mono text-white">
                    Tray: {p.compartmentCode}
                  </div>
                </div>

                <h4 className="text-sm font-bold text-white line-clamp-1">{p.name}</h4>
                <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
                  <span>{p.purity}</span>
                  <span>•</span>
                  <span className="text-gold-400 font-bold">{p.weightGrams}g</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-charcoal-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">
                    Suggested Price
                  </span>
                  <span className="text-base font-extrabold text-gold-400">
                    {formatKSh(p.suggestedPrice)}
                  </span>
                </div>

                {p.status === 'Available' && (
                  <button
                    onClick={() => handleSellInPOS(p)}
                    className="px-3 py-1.5 rounded-lg gold-button-gradient text-charcoal-950 text-xs font-bold shadow-gold-glow flex items-center space-x-1"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>POS</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Registration / Edit Modal */}
      {isFormModalOpen && (
        <ProductFormModal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingItem(undefined);
          }}
          initialItem={editingItem}
        />
      )}
    </div>
  );
};

