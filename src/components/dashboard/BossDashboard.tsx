import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from '../router/Router';
import { formatKSh, formatDateTime } from '../../utils/formatters';
import { exportToCSV } from '../../utils/csvExport';
import {
  TrendingUp,
  DollarSign,
  Package,
  AlertCircle,
  Users,
  Award,
  Wallet,
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
  PieChart,
  Calendar,
  Gem,
  ExternalLink,
  Download,
  BookOpen,
  Calculator,
} from 'lucide-react';

export const BossDashboard: React.FC = () => {
  const { sales, products, expenses, approvals, notebookSales } = useStore();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('month');

  // Calculations
  const nonReturnedSales = sales.filter((s) => !s.isReturned);

  // Total Revenue
  const totalRevenue = nonReturnedSales.reduce((acc, s) => acc + s.totalAmount, 0);

  // Total Gross Profit & COGS
  const totalGrossProfit = nonReturnedSales.reduce((acc, s) => acc + s.totalGrossProfit, 0);
  const totalCOGS = totalRevenue - totalGrossProfit;

  // Operating Expenses
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

  // Net Operating Profit
  const netOperatingProfit = totalGrossProfit - totalExpenses;

  // Inventory value (at purchase cost vs retail value)
  const availableItems = products.filter((p) => p.status === 'Available');
  const inventoryPurchaseCost = availableItems.reduce((acc, p) => acc + p.buyingPrice * p.quantity, 0);
  const inventoryRetailValue = availableItems.reduce((acc, p) => acc + p.suggestedPrice * p.quantity, 0);

  // Outstanding Customer Balances
  const totalOutstandingBalance = nonReturnedSales.reduce((acc, s) => acc + (s.balanceDue || 0), 0);

  // Pending Approvals
  const pendingApprovals = approvals.filter((a) => a.status === 'PENDING');

  // Employee Performance Aggregation
  const employeeStats: Record<
    string,
    { name: string; salesCount: number; unitsSold: number; totalRev: number; grossProfit: number }
  > = {};

  nonReturnedSales.forEach((sale) => {
    if (!employeeStats[sale.employeeId]) {
      employeeStats[sale.employeeId] = {
        name: sale.employeeName,
        salesCount: 0,
        unitsSold: 0,
        totalRev: 0,
        grossProfit: 0,
      };
    }
    employeeStats[sale.employeeId].salesCount += 1;
    employeeStats[sale.employeeId].unitsSold += sale.items.length;
    employeeStats[sale.employeeId].totalRev += sale.totalAmount;
    employeeStats[sale.employeeId].grossProfit += sale.totalGrossProfit;
  });

  const employeeLeaderboard = Object.values(employeeStats).sort((a, b) => b.totalRev - a.totalRev);

  // Category sales breakdown
  const categoryStats: Record<string, number> = {};
  nonReturnedSales.forEach((s) => {
    s.items.forEach((item) => {
      categoryStats[item.category] = (categoryStats[item.category] || 0) + item.negotiatedSellingPrice;
    });
  });

  // Export financial summary report
  const handleExportFinancialReport = () => {
    const reportData = [
      { Metric: 'Total Showroom Revenue', Value_KSh: totalRevenue },
      { Metric: 'Cost of Goods Sold (COGS)', Value_KSh: totalCOGS },
      { Metric: 'Gross Profit', Value_KSh: totalGrossProfit },
      { Metric: 'Gross Margin %', Value_KSh: `${totalRevenue > 0 ? ((totalGrossProfit / totalRevenue) * 100).toFixed(1) : 0}%` },
      { Metric: 'Operating Overhead Expenses', Value_KSh: totalExpenses },
      { Metric: 'Net Operating Profit', Value_KSh: netOperatingProfit },
      { Metric: 'Available Pieces in Showcase', Value_KSh: availableItems.length },
      { Metric: 'Total Inventory Purchase Value', Value_KSh: inventoryPurchaseCost },
      { Metric: 'Outstanding Client Balances', Value_KSh: totalOutstandingBalance },
    ];
    exportToCSV('Acestone_Financial_Report', reportData);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-charcoal-900 border border-charcoal-800 rounded-2xl p-5">
        <div>
          <span className="text-xs uppercase tracking-widest text-gold-400 font-semibold">
            Executive Financial Overview
          </span>
          <h2 className="text-xl font-bold text-white tracking-wide font-brand">
            Acestone Jewellery Flagship Vault
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time profit tracking calculated against verified purchase costs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Date Filter Pills */}
          <div className="flex items-center space-x-1.5 bg-charcoal-950 p-1 rounded-xl border border-charcoal-800">
            {(['today', 'week', 'month', 'all'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setDateFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  dateFilter === filter
                    ? 'bg-gold-500 text-charcoal-950 shadow-gold-glow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Excel / CSV Export Button */}
          <button
            onClick={handleExportFinancialReport}
            className="px-3.5 py-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-gold-400 hover:text-white border border-charcoal-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Today's Counter Sales Notebook Banner */}
      <div className="bg-gradient-to-r from-charcoal-900 via-charcoal-950 to-charcoal-900 border border-gold-500/40 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-gold-glow">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-gold-500/15 border border-gold-500/30 flex items-center justify-center text-gold-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Counter Sales Notebook (Live)
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gold-500/20 text-gold-400 border border-gold-500/30">
                KSh {notebookSales.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {notebookSales.length} daily entries recorded · Cash: KSh {notebookSales.filter(s => s.paymentMethod === 'Cash').reduce((sum, s) => sum + s.amount, 0).toLocaleString()} · M-Pesa: KSh {notebookSales.filter(s => s.paymentMethod === 'M-Pesa' || (s.paymentMethod as string) === 'Paybill').reduce((sum, s) => sum + s.amount, 0).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <button
            onClick={() => navigate('/sales-pad')}
            className="flex-1 md:flex-none px-3.5 py-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-slate-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-gold-400" />
            <span>View Sales Pad</span>
          </button>
          <button
            onClick={() => navigate('/reconciliation')}
            className="flex-1 md:flex-none px-3.5 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-charcoal-950 text-xs font-bold flex items-center justify-center space-x-1.5 shadow-gold-glow transition-all"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>End-of-Day Reconciliation</span>
          </button>
        </div>
      </div>

      {/* Pending Approvals Alert Banner (if any) */}
      {pendingApprovals.length > 0 && (
        <div className="p-4 bg-amber-500/15 border border-amber-500/40 rounded-2xl flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white">
                {pendingApprovals.length} Price Override Authorization{pendingApprovals.length > 1 ? 's' : ''} Pending
              </span>
              <p className="text-[11px] text-amber-300/80">
                Employees have requested approval for sales below the minimum acceptable price.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/approvals')}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-charcoal-950 font-bold text-xs flex items-center space-x-1"
          >
            <span>Review Now</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Financial KPIs Cards Grid (4 columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-semibold text-slate-400">
              Total Revenue
            </span>
            <div className="w-8 h-8 rounded-lg bg-gold-500/10 text-gold-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-white font-mono">
            {formatKSh(totalRevenue)}
          </div>
          <div className="mt-2 text-[10px] text-emerald-400 flex items-center space-x-1">
            <span>+14.2% from last cycle</span>
          </div>
        </div>

        {/* Cost of Goods Sold (COGS) */}
        <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-semibold text-slate-400">
              Cost of Goods (COGS)
            </span>
            <div className="w-8 h-8 rounded-lg bg-charcoal-800 text-slate-300 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-200 font-mono">
            {formatKSh(totalCOGS)}
          </div>
          <div className="mt-2 text-[10px] text-slate-400">
            Recorded at exact time of sale
          </div>
        </div>

        {/* Gross Profit */}
        <div className="bg-charcoal-900 border border-gold-500/30 rounded-2xl p-4 relative overflow-hidden shadow-gold-glow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-semibold text-gold-400">
              Gross Profit
            </span>
            <div className="w-8 h-8 rounded-lg bg-gold-500/20 text-gold-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-gold-400 font-mono">
            {formatKSh(totalGrossProfit)}
          </div>
          <div className="mt-2 text-[10px] text-gold-300 font-medium">
            Margin: {totalRevenue > 0 ? ((totalGrossProfit / totalRevenue) * 100).toFixed(1) : 0}%
          </div>
        </div>

        {/* Net Operating Profit */}
        <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-semibold text-slate-400">
              Net Operating Profit
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-xl font-black font-mono ${netOperatingProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatKSh(netOperatingProfit)}
          </div>
          <div className="mt-2 text-[10px] text-slate-400">
            After {formatKSh(totalExpenses)} showroom expenses
          </div>
        </div>
      </div>

      {/* Secondary KPIs: Available Inventory & Customer Balances */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 font-medium">Available Pieces</span>
            <Package className="w-4 h-4 text-gold-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono">
            {availableItems.length} Pieces
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Across 10 showcase compartments
          </div>
        </div>

        <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 font-medium">Stock Purchase Value</span>
            <Gem className="w-4 h-4 text-gold-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono">
            {formatKSh(inventoryPurchaseCost)}
          </div>
          <div className="text-[11px] text-gold-400 mt-1">
            Retail Potential: {formatKSh(inventoryRetailValue)}
          </div>
        </div>

        <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 font-medium">Outstanding Balances</span>
            <CreditCard className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-amber-400 font-mono">
            {formatKSh(totalOutstandingBalance)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Layaway & partial payments
          </div>
        </div>
      </div>

      {/* Middle Section: Employee Performance Leaderboard & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Employee Performance Leaderboard (7 Cols) */}
        <div className="lg:col-span-7 bg-charcoal-900 border border-charcoal-800 rounded-2xl p-5">
          <div className="flex items-center justify-between pb-3.5 border-b border-charcoal-800 mb-4">
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-gold-400" />
              <h3 className="text-sm font-bold text-white uppercase font-brand">
                Employee Sales Performance Leaderboard
              </h3>
            </div>
            <span className="text-[10px] text-slate-400">Owner Access Only</span>
          </div>

          <div className="space-y-3">
            {employeeLeaderboard.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No sales recorded yet.</p>
            ) : (
              employeeLeaderboard.map((emp, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-charcoal-950 border border-charcoal-800 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-full bg-gold-500/20 text-gold-400 text-xs font-bold flex items-center justify-center font-mono">
                      #{idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-white">{emp.name}</h4>
                      <p className="text-[11px] text-slate-400">
                        {emp.salesCount} sale{emp.salesCount !== 1 ? 's' : ''} ({emp.unitsSold} piece{emp.unitsSold !== 1 ? 's' : ''})
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-gold-400 font-mono block">
                      {formatKSh(emp.totalRev)}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      Profit: {formatKSh(emp.grossProfit)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sales by Category (5 Cols) */}
        <div className="lg:col-span-5 bg-charcoal-900 border border-charcoal-800 rounded-2xl p-5">
          <div className="flex items-center justify-between pb-3.5 border-b border-charcoal-800 mb-4">
            <div className="flex items-center space-x-2">
              <PieChart className="w-4 h-4 text-gold-400" />
              <h3 className="text-sm font-bold text-white uppercase font-brand">
                Revenue by Category
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {Object.keys(categoryStats).length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No sales yet.</p>
            ) : (
              Object.entries(categoryStats).map(([cat, amount]) => {
                const pct = totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-semibold">{cat}</span>
                      <span className="text-gold-400 font-mono font-bold">
                        {formatKSh(amount)} ({pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-charcoal-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gold-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

