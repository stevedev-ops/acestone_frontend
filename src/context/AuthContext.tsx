import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { MOCK_USERS } from '../data/mockData';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (emailOrId: string, customPin?: string) => boolean;
  logout: () => void;
  verifyPin: (pin: string) => { valid: boolean; approverName?: string; role?: UserRole };
  availableUsers: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'acestone_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    // Default to null so user arrives at login page
    return null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [currentUser]);

  const login = (emailOrId: string, customPin?: string): boolean => {
    const user = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === emailOrId.toLowerCase() || u.id === emailOrId
    );

    if (user) {
      if (customPin && user.pinCode && user.pinCode !== customPin) {
        return false;
      }
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const verifyPin = (pin: string): { valid: boolean; approverName?: string; role?: UserRole } => {
    const ownerOrManager = MOCK_USERS.find(
      (u) => (u.role === 'OWNER' || u.role === 'MANAGER') && u.pinCode === pin.trim()
    );

    if (ownerOrManager) {
      return {
        valid: true,
        approverName: `${ownerOrManager.name} (${ownerOrManager.role === 'OWNER' ? 'Owner' : 'Manager'})`,
        role: ownerOrManager.role,
      };
    }

    return { valid: false };
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        logout,
        verifyPin,
        availableUsers: MOCK_USERS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
