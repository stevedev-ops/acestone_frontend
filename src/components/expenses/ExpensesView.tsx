import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { Expense } from '../../types';
import { formatKSh, formatDate } from '../../utils/formatters';
import { 
  Wallet, 
  Plus, 
  Building2, 
  Users, 
  Zap, 
  ShieldCheck, 
  Car, 
  FileText, 
  Check, 
  X 
} from 'lucide-react';

export const ExpensesView: React.FC = () => {
  const { expenses, addExpense, sales } = useStore();
  const { currentUser } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Expense['category']>('Rent');
  const [amount, setAmount] = useState<number>(15000);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

  // Operating Profit Calculation
  const totalGrossProfit = sales
    .filter((s) => !s.isReturned)
    .reduce((acc, s) => acc + s.totalGrossProfit, 0);
  const netOperatingProfit = totalGrossProfit - totalExpenses;

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !currentUser) return;

    addExpense(
      {
        title,
        category,
        amount,
        date,
        description,
        recordedBy: currentUser.name,
      },
      currentUser.name,
      currentUser.role
    );

    setIsModalOpen(false);
    setTitle('');
    setDescription('');
  };

  const getCategoryIcon = (cat: Expense['category']) => {
    switch (cat) {
      case 'Rent':
        return <Building2 className="w-4 h-4 text-gold-400" />;
      case 'Salaries':
        return <Users className="w-4 h-4 text-emerald-400" />;
      case 'Electricity':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'Security':
        return <ShieldCheck className="w-4 h-4 text-blue-400" />;
      case 'Transport':
        return <Car className="w-4 h-4 text-purple-400" />;
      default:
        return <Wallet className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-gold-400 font-semibold">
            Financial Health & Overhead
          </span>
          <h2 className="text-xl font-bold text-white tracking-wide font-brand">
            Showroom Operating Expenses
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Record operating expenses to compute net business profit separately from jewellery gross margin.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl gold-button-gradient text-charcoal-950 font-bold text-xs shadow-gold-glow flex items-center space-x-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Expense</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400 block uppercase font-medium">
            Total Showroom Overhead
          </span>
          <span className="text-xl font-black text-red-400 font-mono block mt-1">
            {formatKSh(totalExpenses)}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Across {expenses.length} operating line items
          </span>
        </div>

        <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400 block uppercase font-medium">
            Jewellery Gross Profit
          </span>
          <span className="text-xl font-black text-gold-400 font-mono block mt-1">
            {formatKSh(totalGrossProfit)}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">
            From verified sales transactions
          </span>
        </div>

        <div className="bg-charcoal-900 border border-gold-500/30 rounded-2xl p-4 shadow-gold-glow">
          <span className="text-xs text-gold-400 block uppercase font-medium">
            Net Operating Profit
          </span>
          <span className={`text-xl font-black font-mono block mt-1 ${netOperatingProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatKSh(netOperatingProfit)}
          </span>
          <span className="text-[10px] text-slate-300 mt-1 block">
            Gross Margin minus overheads
          </span>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl overflow-hidden shadow-premium">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-charcoal-950 border-b border-charcoal-800 text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Expense Title</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Description</th>
                <th className="py-3 px-3">Recorded By</th>
                <th className="py-3 px-4 text-right">Amount (KSh)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-800">
              {expenses.map((e) => (
                <tr key={e.id} className="hover:bg-charcoal-850/60">
                  <td className="py-3 px-4 font-semibold text-white">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 rounded-lg bg-charcoal-950 border border-charcoal-800">
                        {getCategoryIcon(e.category)}
                      </div>
                      <span>{e.title}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-charcoal-950 text-slate-300 border border-charcoal-800">
                      {e.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                    {formatDate(e.date)}
                  </td>
                  <td className="py-3 px-3 text-slate-400 max-w-xs truncate">
                    {e.description || '-'}
                  </td>
                  <td className="py-3 px-3 text-slate-300">{e.recordedBy}</td>
                  <td className="py-3 px-4 font-mono font-bold text-white text-right">
                    {formatKSh(e.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Expense Modal */}
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
              Record Business Expense
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter operational costs for the showroom or staff overhead.
            </p>

            <form onSubmit={handleAddExpense} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1 uppercase">
                  Expense Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Monthly Showroom Lease (Nov)"
                  className="w-full px-3 py-2 bg-charcoal-950 border border-charcoal-700 rounded-xl text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Expense['category'])}
                    className="w-full px-3 py-2 bg-charcoal-950 border border-charcoal-700 rounded-xl text-white focus:outline-none focus:border-gold-500"
                  >
                    <option value="Rent">Rent</option>
                    <option value="Salaries">Salaries</option>
                    <option value="Electricity">Electricity</option>
                    <option value="Security">Security</option>
                    <option value="Transport">Transport</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase">
                    Amount (KSh)
                  </label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-charcoal-950 border border-charcoal-700 rounded-xl text-white font-mono focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 uppercase">
                  Description / Vendor Notes
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Paid to building management via NCBA"
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
                  <span>Save Expense</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

