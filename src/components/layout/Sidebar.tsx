import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { useNavigate, useLocation } from '../router/Router';
import {
  Gem,
  LayoutDashboard,
  Smartphone,
  Grid3X3,
  Package,
  CheckCircle,
  Receipt,
  RotateCcw,
  Wallet,
  Users,
  ShieldAlert,
  LogOut,
  Crown,
  Briefcase,
  User,
  X,
  ExternalLink,
  BookOpen,
  Calculator,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentUser, logout } = useAuth();
  const { approvals } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  if (!currentUser) return null;

  const pendingApprovalsCount = approvals.filter((a) => a.status === 'PENDING').length;

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose();
  };

  const navItemClick = (path: string) => {
    navigate(path);
    onClose();
  };

  const isOwner = currentUser.role === 'OWNER';
  const isManager = currentUser.role === 'MANAGER';
  const isEmployee = currentUser.role === 'EMPLOYEE';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-charcoal-900 border-r border-charcoal-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-charcoal-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 rounded-xl bg-white border border-gold-500/30 flex items-center justify-center shadow-gold-glow">
              <img
                src="/logo.png"
                alt="Acestone Logo"
                className="h-8 w-auto object-contain"
              />
            </div>
            <div>
              <h2 className="text-xs font-extrabold tracking-widest text-white uppercase font-brand leading-none">
                Acestone
              </h2>
              <span className="text-[9px] tracking-[0.2em] text-gold-400 font-semibold uppercase">
                Jewellery Vault
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-charcoal-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current User Card */}
        <div className="p-4 mx-3 my-3 rounded-xl bg-charcoal-950/80 border border-charcoal-800 flex items-center space-x-3">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-10 h-10 rounded-full object-cover border border-gold-500/40"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-white truncate">
                {currentUser.name}
              </span>
            </div>
            <div className="mt-0.5">
              {isOwner && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gold-500/20 text-gold-400 border border-gold-500/30">
                  <Crown className="w-2.5 h-2.5 mr-1" /> Owner / Boss
                </span>
              )}
              {isManager && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Briefcase className="w-2.5 h-2.5 mr-1" /> Store Manager
                </span>
              )}
              {isEmployee && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-700/50 text-slate-300">
                  <User className="w-2.5 h-2.5 mr-1" /> Sales Executive
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {/* OWNER & MANAGER: Dashboard */}
          {(isOwner || isManager) && (
            <button
              onClick={() => navItemClick('/dashboard')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                location.pathname === '/dashboard' || location.pathname === '/'
                  ? 'bg-gold-500 text-charcoal-950 font-bold shadow-gold-glow'
                  : 'text-slate-300 hover:text-white hover:bg-charcoal-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
              <span>{isOwner ? 'Financial Dashboard' : 'Supervisor Dashboard'}</span>
            </button>
          )}

          {/* EVERYONE: Digital Daily Sales Pad (Notebook) */}
          <button
            onClick={() => navItemClick('/sales-pad')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
              location.pathname === '/sales-pad'
                ? 'bg-gold-500 text-charcoal-950 font-bold shadow-gold-glow'
                : 'text-slate-300 hover:text-white hover:bg-charcoal-800'
            }`}
          >
            <div className="flex items-center space-x-3">
              <BookOpen className="w-4 h-4 flex-shrink-0 text-gold-400" />
              <span>Daily Sales Pad (Notebook)</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-gold-400/20 text-gold-400 border border-gold-400/30 font-semibold">
              KSh 49.4k
            </span>
          </button>

          {/* EVERYONE: Mobile POS */}
          <button
            onClick={() => navItemClick('/pos')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
              location.pathname === '/pos'
                ? 'bg-gold-500 text-charcoal-950 font-bold shadow-gold-glow'
                : 'text-slate-300 hover:text-white hover:bg-charcoal-800'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Smartphone className="w-4 h-4 flex-shrink-0" />
              <span>Showcase POS (Tray & Photo)</span>
            </div>
            {isEmployee && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-charcoal-800 text-slate-300">
                Visual
              </span>
            )}
          </button>

          {/* EVERYONE: Shelf & Compartment Mapping */}
          <button
            onClick={() => navItemClick('/shelves')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
              location.pathname === '/shelves'
                ? 'bg-gold-500 text-charcoal-950 font-bold shadow-gold-glow'
                : 'text-slate-300 hover:text-white hover:bg-charcoal-800'
            }`}
          >
            <Grid3X3 className="w-4 h-4 flex-shrink-0" />
            <span>Digital Shelf Map</span>
          </button>

          {/* EVERYONE: Jewellery Inventory */}
          <button
            onClick={() => navItemClick('/inventory')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
              location.pathname === '/inventory'
                ? 'bg-gold-500 text-charcoal-950 font-bold shadow-gold-glow'
                : 'text-slate-300 hover:text-white hover:bg-charcoal-800'
            }`}
          >
            <Package className="w-4 h-4 flex-shrink-0" />
            <span>{isOwner ? 'Inventory Vault (All Data)' : 'Jewellery Catalogue'}</span>
          </button>

          {/* OWNER & MANAGER: Price Approvals */}
          {(isOwner || isManager) && (
            <button
              onClick={() => navItemClick('/approvals')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                location.pathname === '/approvals'
                  ? 'bg-gold-500 text-charcoal-950 font-bold shadow-gold-glow'
                  : 'text-slate-300 hover:text-white hover:bg-charcoal-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>Price Approvals</span>
              </div>
              {pendingApprovalsCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-charcoal-950 animate-pulse">
                  {pendingApprovalsCount}
                </span>
              )}
            </button>
          )}

          {/* SALES & RECEIPTS */}
          {(isOwner || isManager) && (
            <button
              onClick={() => navItemClick('/sales')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                location.pathname === '/sales'
                  ? 'bg-gold-500 text-charcoal-950 font-bold shadow-gold-glow'
                  : 'text-slate-300 hover:text-white hover:bg-charcoal-800'
              }`}
            >
              <Receipt className="w-4 h-4 flex-shrink-0" />
              <span>Sales Ledger & Receipts</span>
            </button>
          )}

          {/* OWNER & MANAGER: End-of-Day Reconciliation */}
          {(isOwner || isManager) && (
            <button
              onClick={() => navItemClick('/reconciliation')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                location.pathname === '/reconciliation'
                  ? 'bg-gold-500 text-charcoal-950 font-bold shadow-gold-glow'
                  : 'text-slate-300 hover:text-white hover:bg-charcoal-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Calculator className="w-4 h-4 flex-shrink-0 text-amber-400" />
                <span>Daily Reconciliation</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                Register
              </span>
            </button>
          )}

          {/* EMPLOYEE ONLY: My Personal Sales */}
          {isEmployee && (
            <button
              onClick={() => navItemClick('/my-sales')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                location.pathname === '/my-sales'
                  ? 'bg-gold-500 text-charcoal-950 font-bold shadow-gold-glow'
                  : 'text-slate-300 hover:text-white hover:bg-charcoal-800'
              }`}
            >
              <Receipt className="w-4 h-4 flex-shrink-0" />
              <span>My Sales Performance</span>
            </button>
          )}

          {/* OWNER ONLY: Returns & Exchanges */}
          {isOwner && (
            <button
              onClick={() => navItemClick('/returns')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                location.pathname === '/returns'
                  ? 'bg-gold-500 text-charcoal-950 font-bold shadow-gold-glow'
                  : 'text-slate-300 hover:text-white hover:bg-charcoal-800'
              }`}
            >
              <RotateCcw className="w-4 h-4 flex-shrink-0" />
              <span>Returns & Exchanges</span>
            </button>
          )}

          {/* OWNER ONLY: Operating Expenses */}
          {isOwner && (
            <button
              onClick={() => navItemClick('/expenses')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                location.pathname === '/expenses'
                  ? 'bg-gold-500 text-charcoal-950 font-bold shadow-gold-glow'
                  : 'text-slate-300 hover:text-white hover:bg-charcoal-800'
              }`}
            >
              <Wallet className="w-4 h-4 flex-shrink-0" />
              <span>Operating Expenses</span>
            </button>
          )}

          {/* OWNER ONLY: Suppliers */}
          {isOwner && (
            <button
              onClick={() => navItemClick('/suppliers')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                location.pathname === '/suppliers'
                  ? 'bg-gold-500 text-charcoal-950 font-bold shadow-gold-glow'
                  : 'text-slate-300 hover:text-white hover:bg-charcoal-800'
              }`}
            >
              <Users className="w-4 h-4 flex-shrink-0" />
              <span>Suppliers & Purchases</span>
            </button>
          )}

          {/* OWNER ONLY: Audit Logs */}
          {isOwner && (
            <button
              onClick={() => navItemClick('/audit')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                location.pathname === '/audit'
                  ? 'bg-gold-500 text-charcoal-950 font-bold shadow-gold-glow'
                  : 'text-slate-300 hover:text-white hover:bg-charcoal-800'
              }`}
            >
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>Audit Logs & Security</span>
            </button>
          )}
        </div>

        {/* Footer Actions: Explicit Logout / Switch Account */}
        <div className="p-4 border-t border-charcoal-800 bg-charcoal-950/60">
          <div className="mb-2 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Showroom: Westlands Gallery</span>
            <span className="flex items-center space-x-1 text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Live Vault</span>
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-charcoal-800 hover:bg-red-950/60 hover:text-red-300 text-slate-300 text-xs font-semibold border border-charcoal-700 hover:border-red-500/40 transition-all group"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Log Out & Switch Account</span>
          </button>
        </div>
      </aside>
    </>
  );
};

