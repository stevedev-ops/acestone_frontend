import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from '../router/Router';
import { isBackendConfigured } from '../../services/api';
import { 
  ShieldCheck, 
  Gem, 
  Lock, 
  Mail, 
  KeyRound, 
  ArrowRight, 
  Sparkles, 
  UserCheck, 
  Crown, 
  Briefcase, 
  User,
  Radio
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, availableUsers } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Please enter your email or employee ID.');
      return;
    }

    const success = login(email, pin || undefined);
    if (success) {
      const user = availableUsers.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() || u.id === email
      );
      if (user?.role === 'EMPLOYEE') {
        navigate('/pos');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError('Invalid credentials or PIN. Please try again or use a demo account below.');
    }
  };

  const handleQuickLogin = (user: typeof availableUsers[0]) => {
    login(user.id);
    if (user.role === 'EMPLOYEE') {
      navigate('/pos');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-950 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Subtle luxury ambient gold glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-gold-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="text-center mb-6 relative z-10 max-w-md px-2">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/95 border border-gold-500/40 shadow-gold-glow mb-3">
          <img
            src="/logo.png"
            alt="Acestone Jewellery Official Logo"
            className="h-14 sm:h-16 w-auto object-contain"
          />
        </div>
        <p className="text-[11px] tracking-[0.25em] uppercase text-gold-400 font-bold mb-1">
          Nairobi Flagship Vault
        </p>
        <p className="text-xs text-slate-400">
          Tagless POS, Inventory Vault & Daily Counter Sales Register
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-charcoal-900/90 backdrop-blur-xl border border-charcoal-700/60 rounded-2xl shadow-premium p-6 sm:p-8 relative z-10">
        <div className="flex items-center justify-between pb-5 border-b border-charcoal-800 mb-6">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-gold-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Staff & Management Portal
            </span>
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gold-500/15 text-gold-400 border border-gold-500/30">
            Encrypted
          </span>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-start space-x-2">
            <span className="font-bold">Error:</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleManualLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
              Employee Email / ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. sarah@acestone.co.ke"
                className="w-full pl-10 pr-4 py-2.5 bg-charcoal-950 border border-charcoal-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
              Security PIN / Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter 4-digit PIN"
                className="w-full pl-10 pr-4 py-2.5 bg-charcoal-950 border border-charcoal-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl font-semibold text-charcoal-950 text-sm gold-button-gradient shadow-gold-glow flex items-center justify-center space-x-2 mt-2"
          >
            <span>Authenticate & Enter Vault</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast-Login Section */}
        <div className="mt-8 pt-6 border-t border-charcoal-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gold-400 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>1-Click Demo Accounts</span>
            </span>
            <span className="text-[10px] text-slate-400">Switch role anytime</span>
          </div>

          <div className="space-y-2">
            {availableUsers.map((user) => {
              const isOwner = user.role === 'OWNER';
              const isMgr = user.role === 'MANAGER';
              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleQuickLogin(user)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-charcoal-950/70 hover:bg-charcoal-800 border border-charcoal-800 hover:border-gold-500/40 text-left transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover border border-gold-500/40 group-hover:border-gold-400"
                    />
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-semibold text-white group-hover:text-gold-300">
                          {user.name}
                        </span>
                        {isOwner && (
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-semibold bg-gold-500/20 text-gold-400 border border-gold-500/30">
                            <Crown className="w-2.5 h-2.5 mr-0.5" /> Boss
                          </span>
                        )}
                        {isMgr && (
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            <Briefcase className="w-2.5 h-2.5 mr-0.5" /> Manager
                          </span>
                        )}
                        {!isOwner && !isMgr && (
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-medium bg-slate-700/40 text-slate-300">
                            <User className="w-2.5 h-2.5 mr-0.5" /> Sales
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">{user.title}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-gold-400 group-hover:translate-x-0.5 transition-transform inline-block">
                      Sign In &rarr;
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Security badge footer */}
        <div className="mt-6 pt-4 border-t border-charcoal-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Role-Based Access</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className={`w-2 h-2 rounded-full ${isBackendConfigured() ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-[10px] text-slate-400">
              {isBackendConfigured() ? 'Render API Linked' : 'PWA Offline Ready'}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-slate-500 max-w-sm">
        To switch between Owner, Employee, and Manager views, click <strong>Log Out</strong> in the sidebar and log in to the next account.
      </div>
    </div>
  );
};

