import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';
import { HashRouter, useLocation, useNavigate } from './components/router/Router';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './components/auth/LoginPage';
import { BossDashboard } from './components/dashboard/BossDashboard';
import { EmployeeDashboard } from './components/dashboard/EmployeeDashboard';
import { POSView } from './components/pos/POSView';
import { DailySalesPad } from './components/pos/DailySalesPad';
import { EndOfDayReconciliation } from './components/dashboard/EndOfDayReconciliation';
import { ShelfMappingView } from './components/shelves/ShelfMappingView';
import { InventoryList } from './components/inventory/InventoryList';
import { ApprovalsView } from './components/approvals/ApprovalsView';
import { SalesHistoryView } from './components/sales/SalesHistoryView';
import { ReturnsView } from './components/sales/ReturnsView';
import { ExpensesView } from './components/expenses/ExpensesView';
import { SuppliersView } from './components/suppliers/SuppliersView';
import { AuditLogsView } from './components/audit/AuditLogsView';

const MainRoutes: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // If not logged in, enforce Login Page
  if (!isAuthenticated || !currentUser) {
    return <LoginPage />;
  }

  // Active view router based on hash path
  const renderCurrentView = () => {
    const path = location.pathname.split('?')[0];

    switch (path) {
      case '/sales-pad':
        return <DailySalesPad />;

      case '/reconciliation':
        return <EndOfDayReconciliation />;

      case '/pos':
        return <POSView />;

      case '/shelves':
        return <ShelfMappingView />;

      case '/inventory':
        return <InventoryList />;

      case '/approvals':
        return <ApprovalsView />;

      case '/sales':
        return <SalesHistoryView />;

      case '/my-sales':
        return <EmployeeDashboard />;

      case '/returns':
        return <ReturnsView />;

      case '/expenses':
        return <ExpensesView />;

      case '/suppliers':
        return <SuppliersView />;

      case '/audit':
        return <AuditLogsView />;

      case '/dashboard':
      case '/':
      default:
        // Employee default view is Daily Sales Pad (Instant Notebook Entry)
        if (currentUser.role === 'EMPLOYEE') {
          return <DailySalesPad />;
        }
        return <BossDashboard />;
    }
  };

  return <AppLayout>{renderCurrentView()}</AppLayout>;
};

export const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <StoreProvider>
          <MainRoutes />
        </StoreProvider>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;

