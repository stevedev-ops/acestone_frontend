import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { Sale } from '../../types';
import { formatKSh, formatDateTime } from '../../utils/formatters';
import { exportToCSV } from '../../utils/csvExport';
import { ReceiptModal } from '../pos/ReceiptModal';
import {
  Receipt,
  Search,
  Filter,
  Eye,
  Printer,
  Smartphone,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  DollarSign,
  User,
  Download,
} from 'lucide-react';

export const SalesHistoryView: React.FC = () => {
  const { sales } = useStore();
  const { currentUser } = useAuth();

  const isOwner = currentUser?.role === 'OWNER';
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('All');
  const [selectedSaleForReceipt, setSelectedSaleForReceipt] = useState<Sale | null>(null);

  const filteredSales = sales.filter((s) => {
    if (methodFilter !== 'All' && s.paymentMethod !== methodFilter) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchRec = s.receiptNumber.toLowerCase().includes(q);
      const matchEmp = s.employeeName.toLowerCase().includes(q);
      const matchCust = s.customerName?.toLowerCase().includes(q) || false;
      const matchItem = s.items.some((it) => it.productName.toLowerCase().includes(q) || it.productCode.toLowerCase().includes(q));
      return matchRec || matchEmp || matchCust || matchItem;
    }
    return true;
  });

  const handleExportSales = () => {
    const exportData = filteredSales.map((s) => {
      const row: Record<string, any> = {
        'Receipt Number': s.receiptNumber,
        'Transaction Date': formatDateTime(s.transactionDate),
        Consultant: s.employeeName,
        'Items Sold': s.items.map((i) => `${i.productName} (${i.productCode})`).join('; '),
        'Customer Name': s.customerName || 'Walk-in',
        'Payment Method': s.paymentMethod,
        'Total Amount (KSh)': s.totalAmount,
        'Amount Paid (KSh)': s.amountPaid,
        'Balance Due (KSh)': s.balanceDue,
        'Return Status': s.isReturned ? 'Returned' : 'Active',
      };
      if (isOwner) {
        row['Gross Profit (KSh)'] = s.totalGrossProfit;
        row['Authorized By'] = s.approvedBy || 'N/A';
      }
      return row;
    });
    exportToCSV('Acestone_Sales_Ledger', exportData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-gold-400 font-semibold">
            Transaction Ledger
          </span>
          <h2 className="text-xl font-bold text-white tracking-wide font-brand">
            Sales Ledger & Digital Receipts
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable audit record of all showroom sales, negotiated prices, and payment settlement methods.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={handleExportSales}
            className="px-3.5 py-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-slate-300 hover:text-white border border-charcoal-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-gold-400" />
            <span>Export CSV</span>
          </button>
          <span className="px-3 py-2 rounded-xl bg-charcoal-950 border border-charcoal-800 text-gold-400 text-xs font-mono font-bold">
            {filteredSales.length} Recorded
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search receipt number, client, consultant, or jewellery..."
            className="w-full pl-10 pr-4 py-2 bg-charcoal-950 border border-charcoal-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-gold-500"
          />
        </div>

        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="px-3 py-2 bg-charcoal-950 border border-charcoal-700 rounded-xl text-white text-xs focus:outline-none focus:border-gold-500"
        >
          <option value="All">All Payment Types</option>
          <option value="M-Pesa">M-Pesa</option>
          <option value="Cash">Cash</option>
          <option value="Card">Card</option>
          <option value="Bank Transfer">Bank Transfer</option>
          <option value="Split">Split</option>
        </select>
      </div>

      {/* Sales Table */}
      <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl overflow-hidden shadow-premium">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-charcoal-950 border-b border-charcoal-800 text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Receipt #</th>
                <th className="py-3 px-3">Date & Time</th>
                <th className="py-3 px-3">Consultant</th>
                <th className="py-3 px-3">Jewellery Items</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3">Amount</th>
                {isOwner && <th className="py-3 px-3">Gross Profit</th>}
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-800">
              {filteredSales.map((s) => (
                <tr key={s.id} className="hover:bg-charcoal-850/60 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono text-gold-400 font-bold block text-xs">
                      {s.receiptNumber}
                    </span>
                    {s.isReturned && (
                      <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
                        Returned
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                    {formatDateTime(s.transactionDate)}
                  </td>

                  <td className="py-3 px-3 text-slate-300">
                    <span className="font-semibold text-white block">{s.employeeName}</span>
                    {s.approvedBy && (
                      <span className="text-[10px] text-amber-400 italic block">
                        Auth: {s.approvedBy.split(' ')[0]}
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-slate-300">
                    {s.items.map((it, idx) => (
                      <div key={idx} className="line-clamp-1">
                        <span className="font-mono text-gold-400 text-[10px] mr-1">
                          {it.productCode}
                        </span>
                        <span>{it.productName}</span>
                      </div>
                    ))}
                  </td>

                  <td className="py-3 px-3 text-slate-400">
                    {s.customerName || <span className="text-slate-600">Walk-in</span>}
                  </td>

                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-charcoal-950 border border-charcoal-800 text-slate-300">
                      {s.paymentMethod}
                    </span>
                  </td>

                  <td className="py-3 px-3 font-mono font-bold text-white">
                    {formatKSh(s.totalAmount)}
                  </td>

                  {isOwner && (
                    <td className="py-3 px-3 font-mono font-semibold text-emerald-400">
                      {formatKSh(s.totalGrossProfit)}
                    </td>
                  )}

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedSaleForReceipt(s)}
                      className="px-2.5 py-1.5 rounded-lg bg-charcoal-800 hover:bg-gold-500 hover:text-charcoal-950 text-gold-400 text-xs font-semibold border border-charcoal-700 flex items-center space-x-1 ml-auto"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Modal for viewing and reprinting */}
      {selectedSaleForReceipt && (
        <ReceiptModal
          sale={selectedSaleForReceipt}
          isOpen={!!selectedSaleForReceipt}
          onClose={() => setSelectedSaleForReceipt(null)}
        />
      )}
    </div>
  );
};

