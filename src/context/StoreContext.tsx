import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  JewelleryItem, 
  Showcase, 
  Sale, 
  Expense, 
  Supplier, 
  ApprovalRequest, 
  AuditLog, 
  UserRole,
  NotebookSaleEntry 
} from '../types';
import { 
  MOCK_PRODUCTS, 
  MOCK_SHOWCASES, 
  MOCK_SALES, 
  MOCK_EXPENSES, 
  MOCK_SUPPLIERS, 
  MOCK_APPROVALS, 
  MOCK_AUDIT_LOGS,
  MOCK_NOTEBOOK_SALES 
} from '../data/mockData';
import { generateReceiptNumber } from '../utils/formatters';

interface StoreContextType {
  products: JewelleryItem[];
  showcases: Showcase[];
  sales: Sale[];
  expenses: Expense[];
  suppliers: Supplier[];
  approvals: ApprovalRequest[];
  auditLogs: AuditLog[];
  notebookSales: NotebookSaleEntry[];

  // Actions
  addProduct: (product: Omit<JewelleryItem, 'id'>, actorName: string, actorRole: UserRole) => JewelleryItem;
  updateProduct: (id: string, updates: Partial<JewelleryItem>, actorName: string, actorRole: UserRole) => void;
  deleteProduct: (id: string, actorName: string, actorRole: UserRole) => void;
  moveProduct: (productId: string, newCompartmentCode: string, newShowcaseId: string, actorName: string, actorRole: UserRole) => void;

  // Sales & POS
  completeSale: (saleData: Omit<Sale, 'id' | 'receiptNumber' | 'transactionDate'>) => Sale;

  // Digital Daily Sales Notebook
  addNotebookSale: (entry: Omit<NotebookSaleEntry, 'id' | 'timestamp'>) => NotebookSaleEntry;
  reconcileNotebookSale: (entryId: string, productId?: string, notes?: string) => void;
  deleteNotebookSale: (entryId: string) => void;

  // Approvals
  submitApprovalRequest: (request: Omit<ApprovalRequest, 'id' | 'requestedAt' | 'status'>) => ApprovalRequest;
  resolveApproval: (requestId: string, status: 'APPROVED' | 'REJECTED', approverName: string) => void;

  // Returns & Refunds
  processReturn: (saleId: string, reason: string, restoreStock: boolean, actorName: string, actorRole: UserRole) => boolean;

  // Expenses & Suppliers
  addExpense: (expense: Omit<Expense, 'id'>, actorName: string, actorRole: UserRole) => void;
  addSupplier: (supplier: Omit<Supplier, 'id'>, actorName: string, actorRole: UserRole) => void;

  // Helpers
  getProductsInCompartment: (compartmentCode: string) => JewelleryItem[];
  resetToSampleData: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_PREFIX = 'acestone_store_';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<JewelleryItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'products');
    return saved ? JSON.parse(saved) : MOCK_PRODUCTS;
  });

  const [showcases, setShowcases] = useState<Showcase[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'showcases');
    return saved ? JSON.parse(saved) : MOCK_SHOWCASES;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'sales');
    return saved ? JSON.parse(saved) : MOCK_SALES;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'expenses');
    return saved ? JSON.parse(saved) : MOCK_EXPENSES;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'suppliers');
    return saved ? JSON.parse(saved) : MOCK_SUPPLIERS;
  });

  const [approvals, setApprovals] = useState<ApprovalRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'approvals');
    return saved ? JSON.parse(saved) : MOCK_APPROVALS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'audit');
    return saved ? JSON.parse(saved) : MOCK_AUDIT_LOGS;
  });

  const [notebookSales, setNotebookSales] = useState<NotebookSaleEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'notebook_sales');
    return saved ? JSON.parse(saved) : MOCK_NOTEBOOK_SALES;
  });

  // Persist state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'approvals', JSON.stringify(approvals));
  }, [approvals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'audit', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'notebook_sales', JSON.stringify(notebookSales));
  }, [notebookSales]);

  const logAudit = (
    actorName: string,
    actorRole: UserRole,
    action: string,
    entityType: 'PRODUCT' | 'SALE' | 'PRICE' | 'COMPARTMENT' | 'EXPENSE' | 'AUTH' | 'APPROVAL',
    entityId: string,
    details: string,
    previousValue?: string,
    newValue?: string
  ) => {
    const newLog: AuditLog = {
      id: 'aud-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString(),
      userId: actorName.toLowerCase().replace(/\s+/g, '-'),
      userName: actorName,
      userRole: actorRole,
      action,
      entityType,
      entityId,
      previousValue,
      newValue,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const addProduct = (
    itemData: Omit<JewelleryItem, 'id'>,
    actorName: string,
    actorRole: UserRole
  ): JewelleryItem => {
    const newProduct: JewelleryItem = {
      ...itemData,
      id: 'prod-' + Date.now(),
    };
    setProducts((prev) => [newProduct, ...prev]);
    logAudit(
      actorName,
      actorRole,
      'PRODUCT_CREATED',
      'PRODUCT',
      newProduct.code,
      `Registered jewellery item ${newProduct.name} (${newProduct.code}) in compartment ${newProduct.compartmentCode}`,
      undefined,
      `Suggested: KSh ${newProduct.suggestedPrice.toLocaleString()} | Min: KSh ${newProduct.minSellingPrice.toLocaleString()}`
    );
    return newProduct;
  };

  const updateProduct = (
    id: string,
    updates: Partial<JewelleryItem>,
    actorName: string,
    actorRole: UserRole
  ) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;

    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );

    logAudit(
      actorName,
      actorRole,
      'PRODUCT_UPDATED',
      'PRODUCT',
      target.code,
      `Updated details for ${target.code}: ${Object.keys(updates).join(', ')}`,
      `Price: KSh ${target.suggestedPrice.toLocaleString()}`,
      `New price: KSh ${updates.suggestedPrice?.toLocaleString() || target.suggestedPrice.toLocaleString()}`
    );
  };

  const deleteProduct = (id: string, actorName: string, actorRole: UserRole) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    logAudit(
      actorName,
      actorRole,
      'PRODUCT_DEACTIVATED',
      'PRODUCT',
      target.code,
      `Deactivated product ${target.name} (${target.code}) from inventory.`
    );
  };

  const moveProduct = (
    productId: string,
    newCompartmentCode: string,
    newShowcaseId: string,
    actorName: string,
    actorRole: UserRole
  ) => {
    const target = products.find((p) => p.id === productId);
    if (!target) return;

    const oldLocation = `${target.showcaseId} (${target.compartmentCode})`;
    const newLocation = `${newShowcaseId} (${newCompartmentCode})`;

    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, compartmentCode: newCompartmentCode, showcaseId: newShowcaseId }
          : p
      )
    );

    logAudit(
      actorName,
      actorRole,
      'STOCK_RELOCATION',
      'COMPARTMENT',
      target.code,
      `Moved jewellery piece ${target.name} (${target.code}) from ${oldLocation} to ${newLocation}`,
      oldLocation,
      newLocation
    );
  };

  const completeSale = (
    saleData: Omit<Sale, 'id' | 'receiptNumber' | 'transactionDate'>
  ): Sale => {
    const receiptNumber = generateReceiptNumber();
    const newSale: Sale = {
      ...saleData,
      id: 'sale-' + Date.now(),
      receiptNumber,
      transactionDate: new Date().toISOString(),
    };

    // 1. Mark sold products as Sold and reduce quantity
    const soldProductIds = newSale.items.map((it) => it.productId);

    setProducts((prev) =>
      prev.map((item) => {
        if (soldProductIds.includes(item.id)) {
          const soldItem = newSale.items.find((it) => it.productId === item.id);
          return {
            ...item,
            quantity: Math.max(0, item.quantity - 1),
            status: 'Sold',
            soldAt: newSale.transactionDate,
            soldPrice: soldItem ? soldItem.negotiatedSellingPrice : item.suggestedPrice,
          };
        }
        return item;
      })
    );

    // 2. Add to sales record
    setSales((prev) => [newSale, ...prev]);

    // 3. Create Audit Log
    const itemNames = newSale.items.map((it) => `${it.productCode} (${it.productName})`).join(', ');
    logAudit(
      newSale.employeeName,
      'EMPLOYEE',
      'SALE_COMPLETED',
      'SALE',
      receiptNumber,
      `Completed sale for ${itemNames} via ${newSale.paymentMethod}. Total: KSh ${newSale.totalAmount.toLocaleString()} (Gross Profit: KSh ${newSale.totalGrossProfit.toLocaleString()})`,
      undefined,
      `KSh ${newSale.totalAmount.toLocaleString()}`
    );

    return newSale;
  };

  const addNotebookSale = (
    entry: Omit<NotebookSaleEntry, 'id' | 'timestamp'>
  ): NotebookSaleEntry => {
    const newEntry: NotebookSaleEntry = {
      ...entry,
      id: 'note-' + Date.now(),
      timestamp: new Date().toISOString(),
    };

    // If it's a registered jewellery product with an ID, reduce inventory count
    if (newEntry.itemType === 'JEWELLERY' && newEntry.productId) {
      setProducts((prev) =>
        prev.map((item) => {
          if (item.id === newEntry.productId) {
            return {
              ...item,
              quantity: Math.max(0, item.quantity - 1),
              status: item.quantity <= 1 ? 'Sold' : item.status,
              soldAt: newEntry.timestamp,
              soldPrice: newEntry.amount,
            };
          }
          return item;
        })
      );
    }
    // IMPORTANT: If itemType === 'SERVICE' (e.g. Polish KSh 150), ZERO inventory is deducted!

    setNotebookSales((prev) => [newEntry, ...prev]);

    logAudit(
      newEntry.recordedBy,
      'EMPLOYEE',
      'SALE_COMPLETED',
      'SALE',
      newEntry.id,
      `Sales Pad: ${newEntry.itemDescription} (${newEntry.itemType}) sold for KSh ${newEntry.amount.toLocaleString()} via ${newEntry.paymentMethod}${newEntry.notes ? ` - ${newEntry.notes}` : ''}`,
      undefined,
      `KSh ${newEntry.amount.toLocaleString()}`
    );

    return newEntry;
  };

  const reconcileNotebookSale = (
    entryId: string, 
    productId?: string, 
    notes?: string
  ) => {
    setNotebookSales((prev) =>
      prev.map((item) =>
        item.id === entryId
          ? {
              ...item,
              reconciled: true,
              reconciledWithProductId: productId || item.reconciledWithProductId,
              notes: notes ? `${item.notes || ''} [Reconciled: ${notes}]` : item.notes,
            }
          : item
      )
    );
  };

  const deleteNotebookSale = (entryId: string) => {
    setNotebookSales((prev) => prev.filter((item) => item.id !== entryId));
  };

  const submitApprovalRequest = (
    request: Omit<ApprovalRequest, 'id' | 'requestedAt' | 'status'>
  ): ApprovalRequest => {
    const newRequest: ApprovalRequest = {
      ...request,
      id: 'appr-' + Date.now(),
      requestedAt: new Date().toISOString(),
      status: 'PENDING',
    };
    setApprovals((prev) => [newRequest, ...prev]);
    logAudit(
      request.employeeName,
      'EMPLOYEE',
      'APPROVAL_REQUESTED',
      'APPROVAL',
      request.productCode,
      `Requested below-minimum price authorization for ${request.productName} (${request.productCode}): Proposed KSh ${request.proposedPrice.toLocaleString()}`,
      `Min price: KSh ${request.minSellingPrice.toLocaleString()}`,
      `Proposed: KSh ${request.proposedPrice.toLocaleString()}`
    );
    return newRequest;
  };

  const resolveApproval = (
    requestId: string,
    status: 'APPROVED' | 'REJECTED',
    approverName: string
  ) => {
    const target = approvals.find((a) => a.id === requestId);
    if (!target) return;

    setApprovals((prev) =>
      prev.map((a) =>
        a.id === requestId
          ? {
            ...a,
            status,
            approvedBy: approverName,
            approvedAt: new Date().toISOString(),
          }
          : a
      )
    );

    logAudit(
      approverName,
      'OWNER',
      status === 'APPROVED' ? 'APPROVAL_GRANTED' : 'APPROVAL_REJECTED',
      'APPROVAL',
      target.productCode,
      `${status === 'APPROVED' ? 'Approved' : 'Rejected'} discount for ${target.productName} (${target.productCode}) at KSh ${target.proposedPrice.toLocaleString()}`
    );
  };

  const processReturn = (
    saleId: string,
    reason: string,
    restoreStock: boolean,
    actorName: string,
    actorRole: UserRole
  ): boolean => {
    const sale = sales.find((s) => s.id === saleId);
    if (!sale || sale.isReturned) return false;

    // Mark sale as returned
    setSales((prev) =>
      prev.map((s) =>
        s.id === saleId
          ? { ...s, isReturned: true, returnReason: reason }
          : s
      )
    );

    // If restoreStock, return items to Available
    if (restoreStock) {
      const returnedProductIds = sale.items.map((it) => it.productId);
      setProducts((prev) =>
        prev.map((item) => {
          if (returnedProductIds.includes(item.id)) {
            return {
              ...item,
              quantity: item.quantity + 1,
              status: 'Available',
              soldAt: undefined,
              soldPrice: undefined,
            };
          }
          return item;
        })
      );
    }

    logAudit(
      actorName,
      actorRole,
      'PRODUCT_RETURN',
      'SALE',
      sale.receiptNumber,
      `Processed return for receipt ${sale.receiptNumber}. Reason: "${reason}". Stock restored: ${restoreStock ? 'Yes' : 'No'}.`
    );

    return true;
  };

  const addExpense = (
    expenseData: Omit<Expense, 'id'>,
    actorName: string,
    actorRole: UserRole
  ) => {
    const newExpense: Expense = {
      ...expenseData,
      id: 'exp-' + Date.now(),
    };
    setExpenses((prev) => [newExpense, ...prev]);
    logAudit(
      actorName,
      actorRole,
      'EXPENSE_RECORDED',
      'EXPENSE',
      newExpense.id,
      `Recorded expense: ${newExpense.title} (${newExpense.category}) - KSh ${newExpense.amount.toLocaleString()}`
    );
  };

  const addSupplier = (
    supplierData: Omit<Supplier, 'id'>,
    actorName: string,
    actorRole: UserRole
  ) => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: 'sup-' + Date.now(),
    };
    setSuppliers((prev) => [newSupplier, ...prev]);
    logAudit(
      actorName,
      actorRole,
      'SUPPLIER_ADDED',
      'AUTH',
      newSupplier.name,
      `Registered jewellery supplier ${newSupplier.name} (${newSupplier.contactPerson})`
    );
  };

  const getProductsInCompartment = (compartmentCode: string): JewelleryItem[] => {
    return products.filter((p) => p.compartmentCode === compartmentCode);
  };

  const resetToSampleData = () => {
    localStorage.removeItem(STORAGE_PREFIX + 'products');
    localStorage.removeItem(STORAGE_PREFIX + 'showcases');
    localStorage.removeItem(STORAGE_PREFIX + 'sales');
    localStorage.removeItem(STORAGE_PREFIX + 'expenses');
    localStorage.removeItem(STORAGE_PREFIX + 'suppliers');
    localStorage.removeItem(STORAGE_PREFIX + 'approvals');
    localStorage.removeItem(STORAGE_PREFIX + 'audit');
    localStorage.removeItem(STORAGE_PREFIX + 'notebook_sales');
    setProducts(MOCK_PRODUCTS);
    setShowcases(MOCK_SHOWCASES);
    setSales(MOCK_SALES);
    setExpenses(MOCK_EXPENSES);
    setSuppliers(MOCK_SUPPLIERS);
    setApprovals(MOCK_APPROVALS);
    setAuditLogs(MOCK_AUDIT_LOGS);
    setNotebookSales(MOCK_NOTEBOOK_SALES);
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        showcases,
        sales,
        expenses,
        suppliers,
        approvals,
        auditLogs,
        notebookSales,
        addProduct,
        updateProduct,
        deleteProduct,
        moveProduct,
        completeSale,
        addNotebookSale,
        reconcileNotebookSale,
        deleteNotebookSale,
        submitApprovalRequest,
        resolveApproval,
        processReturn,
        addExpense,
        addSupplier,
        getProductsInCompartment,
        resetToSampleData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

