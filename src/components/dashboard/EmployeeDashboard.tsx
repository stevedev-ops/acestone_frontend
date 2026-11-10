import React from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from '../router/Router';
import { formatKSh, formatDateTime } from '../../utils/formatters';
import {
  Smartphone,
  TrendingUp,
  Award,
  DollarSign,
  Receipt,
  Calendar,
  Gem,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const EmployeeDashboard: React.FC = () => {
  const { sales } = useStore();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  if (!currentUser) return null;

  // Filter ONLY current employee's sales
  const mySales = sales.filter((s) => s.employeeId === currentUser.id && !s.isReturned);

  const totalMyRevenue = mySales.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalMyUnits = mySales.reduce((acc, s) => acc + s.items.length, 0);
  const totalMyProfitContribution = mySales.reduce((acc, s) => acc + s.totalGrossProfit, 0);
  const averageTicket = mySales.length > 0 ? Math.round(totalMyRevenue / mySales.length) : 0;

  return (
    <div className="space-y-6">
      {/* Consultant Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-charcoal-900 border border-charcoal-800 rounded-2xl p-5">
        <div className="flex items-center space-x-3.5">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-12 h-12 rounded-xl object-cover border border-gold-500/50 shadow-gold-glow"
          />
          <div>
            <span className="text-xs uppercase tracking-widest text-gold-400 font-semibold">
              Sales Consultant Portal
            </span>
            <h2 className="text-xl font-bold text-white tracking-wide font-brand">
              Welcome back, {currentUser.name}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Personal performance tracker • {currentUser.title}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/pos')}
          className="px-4 py-2.5 rounded-xl gold-button-gradient text-charcoal-950 font-bold text-xs shadow-gold-glow flex items-center space-x-2 self-start sm:self-auto"
        >
          <Smartphone className="w-4 h-4" />
          <span>Launch Mobile POS</span>
        </button>
      </div>

      {/* Personal KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 font-medium">My Sales Volume</span>
            <Award className="w-4 h-4 text-gold-400" />
          </div>
          <div className="text-xl font-black text-white font-mono">
            {formatKSh(totalMyRevenue)}
          </div>
          <div className="text-[10px] text-emerald-400 mt-1">
            Across {mySales.length} closed transactions
          </div>
        </div>

        <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 font-medium">Pieces Sold</span>
            <Gem className="w-4 h-4 text-gold-400" />
          </div>
          <div className="text-xl font-black text-gold-400 font-mono">
            {totalMyUnits} Individual Pieces
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Chains, rings & fine jewellery
          </div>
        </div>

        <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 font-medium">Average Sale Ticket</span>
            <TrendingUp className="w-4 h-4 text-gold-400" />
          </div>
          <div className="text-xl font-black text-slate-200 font-mono">
            {formatKSh(averageTicket)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Per customer transaction
          </div>
        </div>

        <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 font-medium">Estimated Commission</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-black text-emerald-400 font-mono">
            {formatKSh(Math.round(totalMyRevenue * 0.03))}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Based on 3% standard floor incentive
          </div>
        </div>
      </div>

      {/* My Recent Sales Ledger */}
      <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-5">
        <div className="flex items-center justify-between pb-3.5 border-b border-charcoal-800 mb-4">
          <div className="flex items-center space-x-2">
            <Receipt className="w-4 h-4 text-gold-400" />
            <h3 className="text-sm font-bold text-white uppercase font-brand">
              My Recent Completed Sales
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {mySales.length} Transactions
          </span>
        </div>

        {mySales.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <Receipt className="w-10 h-10 mx-auto mb-2 text-slate-600" />
            <p className="text-sm font-medium">You haven't completed any sales yet today.</p>
            <p className="text-xs mt-1">Use the Mobile POS to start negotiating with customers!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {mySales.map((s) => (
              <div
                key={s.id}
                className="p-3.5 rounded-xl bg-charcoal-950 border border-charcoal-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-gold-400 font-bold text-xs">
                      {s.receiptNumber}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {formatDateTime(s.transactionDate)}
                    </span>
                  </div>
                  <div className="text-xs text-white font-medium mt-1">
                    {s.items.map((it) => `${it.productName} (${it.productCode})`).join(', ')}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Customer: {s.customerName || 'Walk-in'} • Method: {s.paymentMethod}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold text-white font-mono block">
                    {formatKSh(s.totalAmount)}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    Completed (✓)
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

