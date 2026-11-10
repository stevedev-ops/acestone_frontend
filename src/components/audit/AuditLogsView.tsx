import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { formatDateTime } from '../../utils/formatters';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  Clock, 
  User, 
  Lock, 
  Tag, 
  ArrowRight,
  Database,
  CheckCircle2
} from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useStore();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    if (filterType !== 'ALL' && log.entityType !== filterType) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.userName.toLowerCase().includes(q) ||
        log.entityId.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getActionBadge = (action: string) => {
    if (action.includes('SALE')) {
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    }
    if (action.includes('PRICE') || action.includes('DISCOUNT')) {
      return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    }
    if (action.includes('RELOCATION') || action.includes('COMPARTMENT')) {
      return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
    }
    if (action.includes('RETURN')) {
      return 'bg-red-500/15 text-red-400 border-red-500/30';
    }
    return 'bg-charcoal-800 text-slate-300 border-charcoal-700';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-gold-400 font-semibold">
            Security & Compliance
          </span>
          <h2 className="text-xl font-bold text-white tracking-wide font-brand">
            Immutable Audit Trail & Activity Logs
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographic ledger tracking price modifications, stock relocations, manager approvals, and completed sales.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1.5 rounded-xl bg-charcoal-950 border border-charcoal-800 text-gold-400 text-xs font-mono font-bold">
            {filteredLogs.length} Security Entries
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
            placeholder="Search action, actor, entity ID, or details..."
            className="w-full pl-10 pr-4 py-2 bg-charcoal-950 border border-charcoal-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-gold-500"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 bg-charcoal-950 border border-charcoal-700 rounded-xl text-white text-xs focus:outline-none focus:border-gold-500"
        >
          <option value="ALL">All Categories</option>
          <option value="SALE">Sales & Transactions</option>
          <option value="PRICE">Pricing & Overrides</option>
          <option value="APPROVAL">Approvals</option>
          <option value="COMPARTMENT">Stock Relocations</option>
          <option value="PRODUCT">Inventory Creation</option>
          <option value="EXPENSE">Expenses</option>
        </select>
      </div>

      {/* Audit Log Entries List */}
      <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl overflow-hidden shadow-premium">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-charcoal-950 border-b border-charcoal-800 text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-3">Actor & Role</th>
                <th className="py-3 px-3">Action Type</th>
                <th className="py-3 px-3">Target Entity</th>
                <th className="py-3 px-4">Audit Description</th>
                <th className="py-3 px-3">State Change (Before &rarr; After)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-800">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-charcoal-850/60 transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                    {formatDateTime(log.timestamp)}
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-semibold text-white block">{log.userName}</span>
                    <span className="text-[10px] text-gold-400 capitalize">{log.userRole.toLowerCase()}</span>
                  </td>

                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getActionBadge(log.action)}`}>
                      {log.action}
                    </span>
                  </td>

                  <td className="py-3 px-3 font-mono font-bold text-slate-300">
                    {log.entityId}
                  </td>

                  <td className="py-3 px-4 text-slate-300 max-w-sm">
                    {log.details}
                  </td>

                  <td className="py-3 px-3 text-[11px]">
                    {log.previousValue || log.newValue ? (
                      <div className="space-y-0.5">
                        {log.previousValue && (
                          <div className="text-slate-500 line-through">
                            {log.previousValue}
                          </div>
                        )}
                        {log.newValue && (
                          <div className="text-gold-400 font-semibold">
                            {log.newValue}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-600">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

