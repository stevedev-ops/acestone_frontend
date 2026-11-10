import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { Sidebar } from './Sidebar';
import { useNavigate, useLocation } from '../router/Router';
import { GoldRateWidget } from '../common/GoldRateWidget';
import { 
  Menu, 
  Gem, 
  LogOut, 
  Shield, 
  Crown, 
  Briefcase, 
  User, 
  Sparkles,
  Calculator,
  BookOpen,
  Smartphone,
  Grid3X3,
  LayoutDashboard,
  Download,
  X 
} from 'lucide-react';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const { backendConnected } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [goldWidgetOpen, setGoldWidgetOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Listen for PWA Install Prompt on smartphones/tablets
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  if (!currentUser) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get current page title for the header
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/sales-pad':
        return 'Daily Sales Pad';
      case '/reconciliation':
        return 'Daily Reconciliation';
      case '/pos':
        return 'Showcase POS';
      case '/shelves':
        return 'Shelf Tray Map';
      case '/inventory':
        return currentUser.role === 'OWNER' ? 'Jewellery Inventory Vault' : 'Jewellery Catalogue';
      case '/approvals':
        return 'Price Approvals';
      case '/sales':
        return 'Sales Transactions';
      case '/my-sales':
        return 'My Performance';
      case '/returns':
        return 'Returns & Exchanges';
      case '/expenses':
        return 'Operating Expenses';
      case '/suppliers':
        return 'Suppliers & Purchases';
      case '/audit':
        return 'Audit Logs & Trail';
      default:
        return currentUser.role === 'OWNER' ? 'Executive Dashboard' : 'Supervisor Dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-950 flex flex-col text-slate-100">
      {/* Sidebar Component */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-72">
        
        {/* PWA Install App Banner (Mobile & Desktop) */}
        {showInstallBanner && (
          <div className="bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 text-charcoal-950 px-4 py-2.5 flex items-center justify-between text-xs font-bold shadow-gold-glow z-40 sticky top-0">
            <div className="flex items-center space-x-2">
              <Download className="w-4 h-4 animate-bounce" />
              <span>Install Acestone POS on your device for instant counter access & offline support</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleInstallClick}
                className="px-3 py-1 bg-charcoal-950 text-gold-400 rounded-lg text-[11px] font-extrabold uppercase hover:bg-black transition-colors"
              >
                Install App
              </button>
              <button
                onClick={() => setShowInstallBanner(false)}
                className="p-1 text-charcoal-900 hover:text-black"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Minimal Contextual Header (NO top navbar navigation - only sidebar toggle & status) */}
        <header className="sticky top-0 z-30 h-16 bg-charcoal-900/95 backdrop-blur-md border-b border-charcoal-800 px-3 sm:px-6 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            {/* Mobile Hamburger to open sidebar */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-charcoal-800 focus:outline-none"
              aria-label="Open Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile Official Logo */}
            <div className="p-1 rounded-lg bg-white border border-gold-500/30 flex items-center justify-center shadow-sm lg:hidden">
              <img
                src="/logo.png"
                alt="Acestone"
                className="h-6 w-auto object-contain"
              />
            </div>

            <div>
              <h1 className="text-xs sm:text-base font-bold text-white tracking-wide truncate max-w-[150px] sm:max-w-none">
                {getPageTitle()}
              </h1>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Acestone Jewellery • Physical Showcase Matching Engine
              </p>
            </div>
          </div>

          {/* Right Header Info */}
          <div className="flex items-center space-x-1.5 sm:space-x-3">
            {/* Live Render Backend Connection Status */}
            <div
              className={`flex items-center space-x-1.5 px-2 py-1 rounded-xl bg-charcoal-950 border text-[11px] font-medium transition-colors ${
                backendConnected
                  ? 'border-emerald-500/30 text-emerald-400'
                  : 'border-amber-500/30 text-amber-400'
              }`}
              title={
                backendConnected
                  ? 'Connected to Render PostgreSQL Backend (https://acestone-backend.onrender.com)'
                  : 'Operating in Local Offline Cache Mode'
              }
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  backendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="hidden md:inline font-mono text-[10px]">
                {backendConnected ? 'Render DB Live' : 'PWA Cache'}
              </span>
            </div>

            {/* Live Gold Bullion Rate Ticker Button */}
            <button
              onClick={() => setGoldWidgetOpen(true)}
              className="flex items-center space-x-1.5 px-2 py-1.5 sm:px-2.5 rounded-xl bg-charcoal-950 hover:bg-charcoal-800 border border-gold-500/40 text-gold-400 text-xs font-semibold shadow-gold-glow transition-all"
              title="Open Live Gold Spot Rate & Calculator"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">18K: KSh 7,840/g</span>
              <span className="sm:hidden text-[11px] font-mono">Spot</span>
            </button>

            {/* Current Role Badge */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 bg-charcoal-950 px-2 sm:px-3 py-1.5 rounded-xl border border-charcoal-800">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-gold-500/40"
              />
              <div className="text-left hidden sm:block">
                <span className="text-xs font-semibold text-slate-200 block leading-none">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-gold-400 capitalize">
                  {currentUser.role.toLowerCase()}
                </span>
              </div>
            </div>

            {/* Quick Log Out Button */}
            <button
              onClick={handleLogout}
              title="Log out and switch account"
              className="p-1.5 sm:p-2 rounded-xl bg-charcoal-800/80 hover:bg-red-950/60 text-slate-300 hover:text-red-300 border border-charcoal-700 hover:border-red-500/40 transition-colors flex items-center space-x-1 text-xs"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Log Out</span>
            </button>
          </div>
        </header>

        {/* Page Content Body (with pb-24 for mobile bottom nav bar clearance) */}
        <main className="flex-1 p-3 sm:p-6 pb-24 lg:pb-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile-First Bottom Navigation Bar (Smartphones & Tablets) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-charcoal-900/95 backdrop-blur-xl border-t border-charcoal-800 lg:hidden px-2 py-1.5 shadow-2xl safe-area-bottom">
        <div className="grid grid-cols-5 gap-1 items-center max-w-md mx-auto">
          {/* 1. Daily Sales Pad */}
          <button
            onClick={() => navigate('/sales-pad')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-[10px] font-semibold transition-all ${
              location.pathname === '/sales-pad'
                ? 'text-gold-400 font-bold bg-charcoal-950/90 border border-gold-500/40 shadow-gold-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-5 h-5 mb-0.5" />
            <span className="truncate">Sales Pad</span>
          </button>

          {/* 2. Showcase POS */}
          <button
            onClick={() => navigate('/pos')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-[10px] font-semibold transition-all ${
              location.pathname === '/pos'
                ? 'text-gold-400 font-bold bg-charcoal-950/90 border border-gold-500/40 shadow-gold-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-5 h-5 mb-0.5" />
            <span className="truncate">POS Tray</span>
          </button>

          {/* 3. Shelf Map */}
          <button
            onClick={() => navigate('/shelves')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-[10px] font-semibold transition-all ${
              location.pathname === '/shelves'
                ? 'text-gold-400 font-bold bg-charcoal-950/90 border border-gold-500/40 shadow-gold-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Grid3X3 className="w-5 h-5 mb-0.5" />
            <span className="truncate">Shelf Map</span>
          </button>

          {/* 4. Dashboard / My Sales */}
          <button
            onClick={() => navigate(currentUser.role === 'EMPLOYEE' ? '/my-sales' : '/dashboard')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-[10px] font-semibold transition-all ${
              location.pathname === '/dashboard' || location.pathname === '/my-sales' || location.pathname === '/'
                ? 'text-gold-400 font-bold bg-charcoal-950/90 border border-gold-500/40 shadow-gold-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span className="truncate">{currentUser.role === 'EMPLOYEE' ? 'My Sales' : 'Vault'}</span>
          </button>

          {/* 5. More / Menu */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-[10px] font-semibold text-slate-400 hover:text-white transition-all"
          >
            <Menu className="w-5 h-5 mb-0.5 text-gold-400/80" />
            <span className="truncate">Menu</span>
          </button>
        </div>
      </nav>

      {/* Gold Rate & Valuation Modal */}
      <GoldRateWidget
        isOpen={goldWidgetOpen}
        onClose={() => setGoldWidgetOpen(false)}
      />
    </div>
  );
};

