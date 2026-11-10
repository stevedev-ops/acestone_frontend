# Acestone Jewellery — Mobile PWA Frontend

Point of Sale (POS), Tagless Inventory Management, and Counter Sales Register for **Acestone Jewellery** (Nairobi, Kenya).

## 💎 Features
- **Official Brand Identity**: Acestone custom luxury theme with official brand logo.
- **Progressive Web App (PWA)**: Installable on iOS, Android, and Desktop with offline caching (`manifest.json` + `sw.js`).
- **Dual-Mode POS**:
  - **⚡ Daily Sales Pad**: Fast notebook-like daily entries with auto-calculating running totals (pre-loaded with verified KSh 49,450 records).
  - **💎 Showcase POS**: Compartment tray matching (e.g. `A-03`), macro photography comparison, purity/weight validation, and supervisor PIN authorization.
- **End-of-Day Reconciliation**: Banknote denomination counter ($1000\times$, $500\times$, $200\times$, $100\times$, $50\times$), Safaricom M-Pesa cross-check, unlinked item matcher, and supervisor PIN sign-off.
- **Digital Shelf & Compartment Mapping**: Showcase A & B physical display tray mapper.
- **Confidential Pricing**: Employees never see buying prices or minimum acceptable floor prices.
- **Branded Customer Receipts**: 80mm thermal receipt format, A4 PDF preview, and native WhatsApp share link.
- **Live Nairobi Bullion Ticker**: 24K, 22K, 18K, 14K, and 925 Silver rates with craftsmanship markup calculator.

## 🚀 Setup & Run
```bash
npm install
npm run dev
# Running on http://localhost:3000
```

To build for production:
```bash
npm run build
```

