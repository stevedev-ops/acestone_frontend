import React from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { formatKSh, formatDateTime } from '../../utils/formatters';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  User, 
  ShieldCheck, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const ApprovalsView: React.FC = () => {
  const { approvals, resolveApproval } = useStore();
  const { currentUser } = useAuth();

  const isOwnerOrManager = currentUser?.role === 'OWNER' || currentUser?.role === 'MANAGER';

  const pendingApprovals = approvals.filter((a) => a.status === 'PENDING');
  const pastApprovals = approvals.filter((a) => a.status !== 'PENDING');

  const handleAction = (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    if (!currentUser) return;
    resolveApproval(
      requestId,
      status,
      `${currentUser.name} (${currentUser.role === 'OWNER' ? 'Owner' : 'Manager'})`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">
            Authorization Gateway
          </span>
          <h2 className="text-xl font-bold text-white tracking-wide font-brand">
            Below-Minimum Selling Price Overrides
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Employees require supervisor or owner authorization whenever a negotiated price falls below floor margin.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-bold font-mono">
            {pendingApprovals.length} Pending Approval{pendingApprovals.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Pending Approvals Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>Active Pending Requests</span>
        </h3>

        {pendingApprovals.length === 0 ? (
          <div className="py-12 bg-charcoal-900 border border-charcoal-800 rounded-2xl text-center p-6">
            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-300">All price requests resolved</h4>
            <p className="text-xs text-slate-500 mt-1">
              There are no pending price discount approvals waiting for authorization.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingApprovals.map((req) => {
              const discount = req.suggestedPrice - req.proposedPrice;
              const belowFloor = req.minSellingPrice - req.proposedPrice;

              return (
                <div
                  key={req.id}
                  className="bg-charcoal-900 border-2 border-amber-500/50 rounded-2xl p-5 shadow-lg relative overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-gold-400">
                        {req.productCode}
                      </span>
                      <h4 className="text-sm font-bold text-white leading-snug">
                        {req.productName}
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse">
                      Pending Auth
                    </span>
                  </div>

                  <div className="bg-charcoal-950 p-3 rounded-xl border border-charcoal-800 space-y-2 mb-4 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Suggested Price:</span>
                      <span className="text-slate-200">{formatKSh(req.suggestedPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Min Floor Price:</span>
                      <span className="text-slate-300 font-medium">{formatKSh(req.minSellingPrice)}</span>
                    </div>
                    <div className="flex justify-between border-t border-charcoal-800 pt-2 font-bold text-sm text-amber-400">
                      <span>Proposed Agreed Price:</span>
                      <span className="font-mono">{formatKSh(req.proposedPrice)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-red-400">
                      <span>Below Floor By:</span>
                      <span className="font-mono font-semibold">- {formatKSh(belowFloor)}</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 mb-4 space-y-1">
                    <div className="flex items-center space-x-1.5">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>Requested by: <strong className="text-white">{req.employeeName}</strong></span>
                    </div>
                    {req.reason && (
                      <p className="italic text-[11px] text-slate-300 bg-charcoal-950/60 p-2 rounded-lg border border-charcoal-800">
                        "{req.reason}"
                      </p>
                    )}
                  </div>

                  {/* Authorization Buttons */}
                  {isOwnerOrManager ? (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-charcoal-800">
                      <button
                        type="button"
                        onClick={() => handleAction(req.id, 'REJECTED')}
                        className="py-2.5 px-3 rounded-xl bg-charcoal-800 hover:bg-red-950 hover:text-red-300 text-slate-300 text-xs font-semibold border border-charcoal-700 flex items-center justify-center space-x-1"
                      >
                        <XCircle className="w-4 h-4 text-red-400" />
                        <span>Reject</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAction(req.id, 'APPROVED')}
                        className="py-2.5 px-3 rounded-xl gold-button-gradient text-charcoal-950 text-xs font-bold shadow-gold-glow flex items-center justify-center space-x-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Authorize Override</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-[11px] text-amber-400 text-center py-2 bg-amber-500/10 rounded-xl">
                      Owner or Manager PIN required to authorize.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Historic Overrides Section */}
      <div className="space-y-4 pt-4">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Historic Price Decisions
        </h3>

        <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-charcoal-950 border-b border-charcoal-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Item & Code</th>
                  <th className="py-3 px-3">Consultant</th>
                  <th className="py-3 px-3">Proposed Price</th>
                  <th className="py-3 px-3">Floor Price</th>
                  <th className="py-3 px-3">Decision</th>
                  <th className="py-3 px-3">Authorized By</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-800">
                {pastApprovals.map((req) => (
                  <tr key={req.id} className="hover:bg-charcoal-850/60">
                    <td className="py-3 px-4">
                      <span className="font-mono text-gold-400 font-bold block text-[11px]">
                        {req.productCode}
                      </span>
                      <span className="text-white font-medium">{req.productName}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{req.employeeName}</td>
                    <td className="py-3 px-3 font-mono font-bold text-white">
                      {formatKSh(req.proposedPrice)}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400">
                      {formatKSh(req.minSellingPrice)}
                    </td>
                    <td className="py-3 px-3">
                      {req.status === 'APPROVED' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/40">
                          Rejected
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-300">{req.approvedBy || 'Owner'}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {formatDateTime(req.approvedAt || req.requestedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

