import React, { useState } from 'react';
import { Sale } from '../../types';
import { formatKSh, formatDateTime } from '../../utils/formatters';
import { 
  Printer, 
  Share2, 
  Download, 
  CheckCircle2, 
  X, 
  Gem, 
  FileText,
  Copy,
  Check
} from 'lucide-react';

interface ReceiptModalProps {
  sale: Sale;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  sale,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [receiptFormat, setReceiptFormat] = useState<'thermal' | 'a4'>('thermal');

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const receiptSummaryText = `*ACESTONE JEWELLERY — OFFICIAL RECEIPT*
Receipt No: ${sale.receiptNumber}
Date: ${formatDateTime(sale.transactionDate)}
Consultant: ${sale.employeeName}
----------------------------------------
${sale.items
  .map(
    (it) =>
      `${it.productName} (${it.productCode})\nPurity: ${it.purity} | Wt: ${it.weightGrams}g\nPrice: ${formatKSh(it.negotiatedSellingPrice)}`
  )
  .join('\n\n')}
----------------------------------------
*TOTAL PAID: ${formatKSh(sale.amountPaid)}*
Payment Method: ${sale.paymentMethod}
${sale.balanceDue > 0 ? `*Balance Due: ${formatKSh(sale.balanceDue)}*` : 'Status: Fully Settled (✓)'}
${sale.customerName ? `Client: ${sale.customerName}` : ''}
${sale.approvedBy ? `Special Authorization: ${sale.approvedBy}` : ''}
----------------------------------------
Thank you for choosing Acestone Jewellery. Handcrafted elegance for generations.
Westlands Gallery, Nairobi | +254 712 345 678`;

  const handleCopy = () => {
    navigator.clipboard.writeText(receiptSummaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const phone = sale.customerPhone
      ? sale.customerPhone.replace(/[^0-9]/g, '')
      : '';
    const encoded = encodeURIComponent(receiptSummaryText);
    const url = phone
      ? `https://wa.me/${phone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-charcoal-900 border border-gold-500/50 rounded-2xl max-w-md w-full p-6 shadow-premium relative max-h-[92vh] flex flex-col">
        {/* Top Controls */}
        <div className="flex items-center justify-between pb-3 border-b border-charcoal-800 mb-3">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider font-brand">
              Transaction Settled
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setReceiptFormat(receiptFormat === 'thermal' ? 'a4' : 'thermal')}
              className="px-2 py-1 rounded bg-charcoal-800 text-[10px] text-slate-300 hover:text-white"
            >
              Mode: {receiptFormat.toUpperCase()}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-charcoal-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Preview (Printable Target) */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div
            id="printable-receipt"
            className={`mx-auto bg-white text-slate-900 rounded-xl p-5 shadow-inner transition-all font-sans text-xs ${
              receiptFormat === 'thermal' ? 'max-w-[320px]' : 'max-w-full'
            }`}
          >
            {/* Receipt Header */}
            <div className="text-center pb-3 border-b border-dashed border-slate-300">
              <div className="flex justify-center mb-1.5">
                <img
                  src="/logo.png"
                  alt="Acestone Jewellery"
                  className="h-10 w-auto object-contain"
                />
              </div>
              <p className="text-[10px] text-slate-700 uppercase tracking-wider font-bold">
                Westlands Gallery Showroom, Nairobi
              </p>
              <p className="text-[10px] text-slate-500">
                Tel: +254 712 345 678 • info@acestone.co.ke
              </p>
            </div>

            {/* Meta Information */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px] text-slate-700">
              <div className="flex justify-between">
                <span>Receipt No:</span>
                <span className="font-mono font-bold text-slate-900">{sale.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{formatDateTime(sale.transactionDate)}</span>
              </div>
              <div className="flex justify-between">
                <span>Consultant:</span>
                <span className="font-semibold text-slate-900">{sale.employeeName}</span>
              </div>
              {sale.customerName && (
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span className="font-medium text-slate-900">{sale.customerName}</span>
                </div>
              )}
              {sale.customerPhone && (
                <div className="flex justify-between">
                  <span>Phone:</span>
                  <span>{sale.customerPhone}</span>
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="py-3 border-b border-dashed border-slate-300 space-y-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Purchased Pieces
              </span>
              {sale.items.map((it, idx) => (
                <div key={idx} className="space-y-0.5 text-xs">
                  <div className="flex justify-between items-start font-semibold text-slate-900">
                    <span className="pr-2">{it.productName}</span>
                    <span className="font-mono font-bold whitespace-nowrap">
                      {formatKSh(it.negotiatedSellingPrice)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-500">
                    <span>Code: {it.productCode}</span>
                    <span>•</span>
                    <span>{it.purity}</span>
                    <span>•</span>
                    <span>{it.weightGrams}g</span>
                  </div>
                  {it.approvedBy && (
                    <span className="text-[10px] text-amber-700 italic block">
                      Supervisor auth: {it.approvedBy}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Totals & Payments */}
            <div className="py-3 border-b border-dashed border-slate-300 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>{formatKSh(sale.totalAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-200">
                <span>Amount Paid:</span>
                <span className="font-mono text-base">{formatKSh(sale.amountPaid)}</span>
              </div>
              <div className="flex justify-between text-slate-700 text-[11px]">
                <span>Payment Method:</span>
                <span className="font-semibold uppercase">{sale.paymentMethod}</span>
              </div>
              {sale.balanceDue > 0 && (
                <div className="flex justify-between text-red-600 font-bold text-xs pt-1">
                  <span>Outstanding Balance:</span>
                  <span>{formatKSh(sale.balanceDue)}</span>
                </div>
              )}
            </div>

            {/* Thank You Note & Watermark */}
            <div className="pt-3 text-center text-[10px] text-slate-500 space-y-1">
              <p className="font-semibold text-slate-700">
                Handcrafted Elegance • Designed for Eternity
              </p>
              <p>Items exchangeable within 7 days with this official receipt.</p>
              <p className="font-mono text-[9px] text-slate-400">
                Digital Verification: {sale.id}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-charcoal-800 mt-3">
          <button
            onClick={handlePrint}
            className="py-2.5 px-3 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-gold-400" />
            <span>Print</span>
          </button>

          <button
            onClick={handleWhatsAppShare}
            className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={handleCopy}
            className="py-2.5 px-3 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-slate-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-gold-400" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

