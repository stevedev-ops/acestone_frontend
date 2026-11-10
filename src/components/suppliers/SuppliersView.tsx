import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { Supplier } from '../../types';
import { formatKSh } from '../../utils/formatters';
import { 
  Users, 
  Plus, 
  Building2, 
  Phone, 
  Mail, 
  Check, 
  X, 
  FileText, 
  CreditCard,
  ShieldCheck
} from 'lucide-react';

export const SuppliersView: React.FC = () => {
  const { suppliers, addSupplier } = useStore();
  const { currentUser } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('+254 ');
  const [email, setEmail] = useState('');
  const [outstandingBalance, setOutstandingBalance] = useState<number>(0);

  const totalOutstanding = suppliers.reduce((acc, s) => acc + s.outstandingBalance, 0);
  const totalVolume = suppliers.reduce((acc, s) => acc + s.totalPurchasedValue, 0);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !currentUser) return;

    addSupplier(
      {
        name,
        contactPerson,
        phone,
        email,
        outstandingBalance,
        totalPurchasedValue: 0,
        invoicesCount: 1,
      },
      currentUser.name,
      currentUser.role
    );

    setIsModalOpen(false);
    setName('');
    setContactPerson('');
    setEmail('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-gold-400 font-semibold">
            Supply Chain & Inward Stock
          </span>
          <h2 className="text-xl font-bold text-white tracking-wide font-brand">
            Jewellery Suppliers & Refiners
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage relationships with certified bullion refiners, gemstone houses, and international gold souk importers.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl gold-button-gradient text-charcoal-950 font-bold text-xs shadow-gold-glow flex items-center space-x-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register Supplier</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400 uppercase font-medium">
            Cumulative Purchase Volume
          </span>
          <span className="text-xl font-black text-gold-400 font-mono block mt-1">
            {formatKSh(totalVolume)}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Across {suppliers.length} active jewellery trading partners
          </span>
        </div>

        <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400 uppercase font-medium">
            Outstanding Supplier Payables
          </span>
          <span className="text-xl font-black text-amber-400 font-mono block mt-1">
            {formatKSh(totalOutstanding)}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Pending invoice consignments
          </span>
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {suppliers.map((s) => (
          <div
            key={s.id}
            className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-5 flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center space-x-2.5 mb-2">
                <div className="w-9 h-9 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 flex-shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">{s.name}</h3>
                  <span className="text-[11px] text-slate-400">{s.contactPerson}</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300 mt-3 pt-3 border-t border-charcoal-800">
                <div className="flex items-center space-x-2 text-slate-400">
                  <Phone className="w-3.5 h-3.5 text-gold-400" />
                  <span>{s.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-400">
                  <Mail className="w-3.5 h-3.5 text-gold-400" />
                  <span className="truncate">{s.email}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-charcoal-800/80 bg-charcoal-950 -mx-5 -mb-5 p-4 rounded-b-2xl space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Total Sourced:</span>
                <span className="font-mono font-bold text-white">{formatKSh(s.totalPurchasedValue)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Balance Due:</span>
                <span className={`font-mono font-bold ${s.outstandingBalance > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {formatKSh(s.outstandingBalance)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Supplier Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-charcoal-900 border border-gold-500/40 rounded-2xl max-w-md w-full p-6 shadow-premium relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-charcoal-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white font-brand mb-1">
              Register Jewellery Supplier
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Add a trusted refiner, lapidary, or international gold dealer.
            </p>

            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1 uppercase">
                  Company / Merchant Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Zurich Bullion Refiners"
                  className="w-full px-3 py-2 bg-charcoal-950 border border-charcoal-700 rounded-xl text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 uppercase">
                  Contact Person
                </label>
                <input
                  type="text"
                  required
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="e.g. Jean-Luc Meyer"
                  className="w-full px-3 py-2 bg-charcoal-950 border border-charcoal-700 rounded-xl text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-charcoal-950 border border-charcoal-700 rounded-xl text-white font-mono focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase">
                    Initial Balance (KSh)
                  </label>
                  <input
                    type="number"
                    value={outstandingBalance}
                    onChange={(e) => setOutstandingBalance(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-charcoal-950 border border-charcoal-700 rounded-xl text-white font-mono focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 uppercase">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="orders@supplier.com"
                  className="w-full px-3 py-2 bg-charcoal-950 border border-charcoal-700 rounded-xl text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-charcoal-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-charcoal-800 text-slate-300 font-semibold hover:bg-charcoal-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl gold-button-gradient text-charcoal-950 font-bold shadow-gold-glow flex items-center space-x-1"
                >
                  <Check className="w-4 h-4" />
                  <span>Register Supplier</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

