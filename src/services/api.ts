/**
 * Acestone Jewellery API Client Service
 * Connects frontend to the Django REST Framework backend on Render.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || '';

export const isBackendConfigured = (): boolean => {
  return Boolean(API_BASE && API_BASE.trim().length > 0);
};

export const getApiBaseUrl = (): string => API_BASE;

export interface BackendHealthResponse {
  status: string;
  service: string;
  version: string;
  currency: string;
}

export const checkBackendHealth = async (): Promise<{ ok: boolean; data?: BackendHealthResponse; error?: string }> => {
  if (!API_BASE) {
    return { ok: false, error: 'VITE_API_BASE_URL is not configured.' };
  }
  try {
    const res = await fetch(`${API_BASE}/health/`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) {
      return { ok: false, error: `Backend responded with HTTP ${res.status}` };
    }
    const data = await res.json();
    return { ok: true, data };
  } catch (err: any) {
    return { ok: false, error: err.message || 'Failed to connect to backend server' };
  }
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('acestone_jwt_access');
};

export const setAuthToken = (token: string, refreshToken?: string) => {
  localStorage.setItem('acestone_jwt_access', token);
  if (refreshToken) {
    localStorage.setItem('acestone_jwt_refresh', refreshToken);
  }
};

export const clearAuthTokens = () => {
  localStorage.removeItem('acestone_jwt_access');
  localStorage.removeItem('acestone_jwt_refresh');
};

const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Authentication
  login: async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/auth/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Invalid email or password');
    const data = await res.json();
    setAuthToken(data.access, data.refresh);
    return data;
  },

  // Products & Inventory
  getProducts: async () => {
    const res = await fetch(`${API_BASE}/api/inventory/items/`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load inventory');
    return res.json();
  },

  // Showcases & Compartments
  getShowcases: async () => {
    const res = await fetch(`${API_BASE}/api/shelves/showcases/`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load showcases');
    return res.json();
  },

  // Transactions & POS Checkout
  createSale: async (salePayload: any) => {
    const res = await fetch(`${API_BASE}/api/sales/transactions/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(salePayload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Checkout failed');
    }
    return res.json();
  },

  // Digital Daily Counter Sales Notebook (KSh 49,450 Digitized Records)
  getNotebookSales: async () => {
    const res = await fetch(`${API_BASE}/api/sales/notebook-sales/`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load notebook sales');
    return res.json();
  },

  createNotebookSale: async (payload: {
    item_description: string;
    item_type: 'JEWELLERY' | 'SERVICE' | 'UNLINKED';
    amount: number;
    payment_method: string;
    payment_status?: string;
    product?: number;
    product_code?: string;
    compartment_code?: string;
    customer_name?: string;
    notes?: string;
  }) => {
    const res = await fetch(`${API_BASE}/api/sales/notebook-sales/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to record notebook sale');
    }
    return res.json();
  },

  reconcileNotebookSale: async (id: number | string, productId?: string, notes?: string) => {
    const res = await fetch(`${API_BASE}/api/sales/notebook-sales/${id}/reconcile/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ product_id: productId, notes }),
    });
    if (!res.ok) throw new Error('Failed to reconcile sale');
    return res.json();
  },

  // End-of-Day Register Closing
  createRegisterClosing: async (closingPayload: any) => {
    const res = await fetch(`${API_BASE}/api/sales/closings/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(closingPayload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit register closing');
    }
    return res.json();
  },
};
