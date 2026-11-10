export type UserRole = 'OWNER' | 'EMPLOYEE' | 'MANAGER' | 'boss' | 'employee' | 'manager';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  pinCode: string;
  pin?: string;
  title: string;
  phone?: string;
  active?: boolean;
  commissionRate?: number;
}

export type JewelleryCategory = 
  | 'Chains' 
  | 'Necklaces' 
  | 'Rings' 
  | 'Bracelets' 
  | 'Earrings' 
  | 'Pendants' 
  | 'Bangles'
  | 'Bridal Sets';

export type JewelleryMaterial = 
  | 'Gold' 
  | 'Silver' 
  | 'Platinum' 
  | 'Diamond' 
  | 'Rose Gold'
  | 'White Gold'
  | 'Gemstone';

export type ProductStatus = 'Available' | 'Sold' | 'Reserved' | 'available' | 'sold' | 'reserved';

export interface JewelleryItem {
  id: string;
  code: string; // e.g. AC-GOLD-001
  name: string;
  category: JewelleryCategory;
  jewelleryType: string;
  material: JewelleryMaterial;
  purity: string; // '9K', '14K', '18K', '22K', '24K', '925 Silver'
  weightGrams: number;
  lengthDimensions?: string;
  lengthOrSize?: string;
  description: string;
  images: string[];
  buyingPrice: number; // Confidential: Boss/Manager only
  suggestedPrice: number; // Visible to all
  minSellingPrice: number; // Confidential: Boss/Manager only
  minimumPrice?: number;
  quantity: number;
  showcaseId: string;
  compartmentCode: string; // e.g. A-03
  supplier: string;
  datePurchased: string;
  status: ProductStatus;
  soldAt?: string;
  soldPrice?: number;
  createdAt?: string;
}

export type Product = JewelleryItem;

export interface ShelfCompartment {
  id: string;
  showcaseId: string;
  code: string; // e.g. A-01, B-03
  name: string;
  capacity: number;
  shelfNumber?: number;
  description?: string;
}

export type Compartment = ShelfCompartment;

export interface Showcase {
  id: string;
  name: string;
  description: string;
  shelvesCount?: number;
  compartments: ShelfCompartment[];
}

export type NegotiatedPriceStatus = 
  | 'ABOVE_SUGGESTED' 
  | 'SUGGESTED' 
  | 'WITHIN_RANGE' 
  | 'BELOW_MINIMUM';

export interface SaleItem {
  productId: string;
  productCode: string;
  productName: string;
  category: JewelleryCategory;
  purity: string;
  weightGrams: number;
  originalBuyingCost: number;
  suggestedPrice: number;
  minSellingPrice: number;
  negotiatedSellingPrice: number;
  grossProfit: number;
  images: string[];
  compartmentCode: string;
  approvedBy?: string;
  approvalNotes?: string;
  isBelowMinimum?: boolean;
}

export type PaymentMethod = 
  | 'M-Pesa' 
  | 'Cash' 
  | 'Card' 
  | 'Bank Transfer' 
  | 'Split'
  | 'mpesa' 
  | 'cash' 
  | 'card' 
  | 'bank_transfer' 
  | 'split';

export type PaymentStatus = 'Completed' | 'Partial' | 'Pending' | 'completed' | 'partial' | 'refunded';

export interface Sale {
  id: string;
  receiptNumber: string; // e.g. ACE-REC-2026-0042
  transactionDate: string;
  employeeId: string;
  employeeName: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  totalAmount: number;
  totalGrossProfit: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  balanceDue: number;
  customerName?: string;
  customerPhone?: string;
  customerNotes?: string;
  approvedBy?: string;
  approvedAt?: string;
  isReturned?: boolean;
  returnReason?: string;
}

export type SaleTransaction = Sale;

export interface ApprovalRequest {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  suggestedPrice: number;
  minSellingPrice: number;
  proposedPrice: number;
  employeeId: string;
  employeeName: string;
  requestedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  approvedAt?: string;
  reason?: string;
}

export interface Expense {
  id: string;
  title: string;
  category: 'Rent' | 'Salaries' | 'Electricity' | 'Transport' | 'Security' | 'Insurance' | 'Electricity & Utilities' | 'Packaging & Boxes' | 'Transport & Logistics' | 'Marketing' | 'Other';
  amount: number;
  date: string;
  description: string;
  recordedBy: string;
  receiptRef?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  outstandingBalance: number;
  totalPurchasedValue: number;
  invoicesCount: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType?: 'PRODUCT' | 'SALE' | 'PRICE' | 'COMPARTMENT' | 'EXPENSE' | 'AUTH' | 'APPROVAL' | string;
  entityId?: string;
  relatedEntityId?: string;
  previousValue?: string;
  newValue?: string;
  details: string;
}

export interface LiveGoldRate {
  karat24: number; // KSh per gram
  karat22: number;
  karat18: number;
  karat14: number;
  silver925: number;
  lastUpdated: string;
}

export type NotebookItemType = 'JEWELLERY' | 'SERVICE' | 'UNLINKED';

export interface NotebookSaleEntry {
  id: string;
  itemDescription: string;
  itemType: NotebookItemType;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  productId?: string;
  productCode?: string;
  compartmentCode?: string;
  timestamp: string;
  recordedBy: string;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  reconciled?: boolean;
  reconciledWithProductId?: string;
}

export interface CashDenominationCount {
  k1000: number;
  k500: number;
  k200: number;
  k100: number;
  k50: number;
}

export interface DailyRegisterClosing {
  id: string;
  date: string;
  totalSales: number;
  totalCashExpected: number;
  totalCashCounted: number;
  cashDifference: number;
  totalMpesaPaybill: number;
  totalCardBank: number;
  servicesRevenue: number;
  totalItemsCount: number;
  denominations: CashDenominationCount;
  signedOffBy: string;
  signedOffAt: string;
  status: 'BALANCED' | 'DISCREPANCY' | 'PENDING';
  closingNotes?: string;
}

