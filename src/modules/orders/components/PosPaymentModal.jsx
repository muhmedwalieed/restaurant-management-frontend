import React, { useState, useEffect } from 'react';
import { X, Check, Printer } from 'lucide-react';
import { lookupCallerApi } from '../../../lib/api/phone-order.api.js';
import { PosPaymentMethodSelector } from './payment/PosPaymentMethodSelector.jsx';
import { PosPaymentCashCalculator } from './payment/PosPaymentCashCalculator.jsx';
import { PosPaymentCustomerFields } from './payment/PosPaymentCustomerFields.jsx';
import { useCurrency } from '../../../shared/hooks/useCurrency.js';

export const PosPaymentModal = ({
  isOpen,
  onClose,
  orderType,
  cart,
  total,
  currency,
  tables,
  tableId,
  setTableId,
  customerPhone,
  setCustomerPhone,
  customerName,
  setCustomerName,
  address,
  setAddress,
  notes,
  setNotes,
  onConfirmOrder,
  isSubmitting,
  autoPrintReceipt,
  setAutoPrintReceipt,
}) => {
  const { currency: defaultCurrency } = useCurrency();
  const displayCurrency = currency || defaultCurrency;
  const [payMethod, setPayMethod] = useState('CASH');
  const [amountPaid, setAmountPaid] = useState(String(total));
  const [caller, setCaller] = useState(null);
  const [isLookingUp, setIsLookingUp] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAmountPaid(String(total));
    }
  }, [isOpen, total]);

  useEffect(() => {
    const clean = customerPhone?.trim() || '';
    if (clean.length < 8) {
      setCaller(null);
      return undefined;
    }
    const timer = setTimeout(async () => {
      try {
        setIsLookingUp(true);
        const data = await lookupCallerApi(clean);
        if (data) {
          setCaller(data);
          if (data.customer?.name && !customerName?.trim()) {
            setCustomerName(data.customer.name);
          }
          if (data.defaultAddress && !address?.trim()) {
            const addr = [data.defaultAddress.street, data.defaultAddress.city].filter(Boolean).join('، ');
            if (addr) setAddress(addr);
          }
        }
      } catch (err) {
        void err;
      } finally {
        setIsLookingUp(false);
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [customerPhone, customerName, address, setCustomerName, setAddress]);

  if (!isOpen) return null;

  const paid = parseFloat(amountPaid) || 0;
  const remaining = Math.max(0, total - paid);
  const change = Math.max(0, paid - total);

  const canProceed = () => {
    if (cart.length === 0) return false;
    if (orderType === 'DINE_IN') return Boolean(tableId);
    if (orderType === 'DELIVERY') {
      return Boolean(customerPhone?.trim() && customerName?.trim() && address?.trim());
    }
    if (orderType === 'PICKUP') {
      return Boolean(customerPhone?.trim());
    }
    return true;
  };

  const handleConfirm = () => {
    if (!canProceed()) return;
    onConfirmOrder({
      payMethod,
      amountPaid: paid,
      remaining,
      change,
      autoPrint: autoPrintReceipt,
    });
  };

  return (
    <div className="overlay ai p-4">
      <div
        className="card au w-full max-w-lg bg-white shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        style={{ borderRadius: 'var(--r, 12px)' }}
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border-default shrink-0 bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold text-txt-primary">تفاصيل الطلب والدفع</h2>
            <p className="text-[11px] text-txt-muted">
              {orderType === 'DINE_IN' && 'طلب صالة — داخل المطعم'}
              {orderType === 'PICKUP' && 'طلب استلام — من الكاشير'}
              {orderType === 'DELIVERY' && 'طلب توصيل — للعميل'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-txt-muted hover:text-txt-primary hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
          <PosPaymentCustomerFields
            orderType={orderType}
            tables={tables}
            tableId={tableId}
            setTableId={setTableId}
            customerPhone={customerPhone}
            setCustomerPhone={setCustomerPhone}
            customerName={customerName}
            setCustomerName={setCustomerName}
            address={address}
            setAddress={setAddress}
            notes={notes}
            setNotes={setNotes}
            caller={caller}
            isLookingUp={isLookingUp}
          />

          {/* Order Summary Inset */}
          <div className="inset overflow-hidden">
            <div className="flex justify-between px-3 py-2 text-xs border-b border-border-default font-semibold text-txt-muted">
              <span>ملخص الأصناف ({cart.length})</span>
              <span className="mono font-bold text-txt-primary">{total.toFixed(2)} ج</span>
            </div>
            <div className="px-3 py-2 space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar">
              {cart.map((item) => (
                <div key={item.lineKey} className="flex justify-between items-center text-xs">
                  <div className="min-w-0 flex-1 truncate pr-1">
                    <span className="text-txt-primary font-medium">{item.name}</span>
                    <span className="text-txt-muted text-[11px] font-mono mr-1">× {item.quantity}</span>
                    {item.modifierNames && item.modifierNames.length > 0 && (
                      <span className="text-[10px] text-brand-primary block truncate">
                        +{item.modifierNames.join(', ')}
                      </span>
                    )}
                  </div>
                  <span className="mono font-semibold text-txt-primary shrink-0">
                    {(item.unitPrice * item.quantity).toFixed(2)} ج
                  </span>
                </div>
              ))}
            </div>
          </div>

          <PosPaymentMethodSelector
            payMethod={payMethod}
            setPayMethod={setPayMethod}
          />

          {payMethod === 'CASH' && (
            <PosPaymentCashCalculator
              total={total}
              amountPaid={amountPaid}
              setAmountPaid={setAmountPaid}
              paid={paid}
              remaining={remaining}
              change={change}
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border-default bg-slate-50/50 flex flex-col gap-3 shrink-0">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-txt-primary">
              <input
                type="checkbox"
                checked={autoPrintReceipt}
                onChange={(e) => setAutoPrintReceipt(e.target.checked)}
                className="w-4 h-4 rounded border-border-default text-brand-primary focus:ring-0 cursor-pointer"
              />
              <span className="flex items-center gap-1">
                <Printer size={13} className="text-txt-muted" />
                طباعة الفاتورة تلقائيًا فور التأكيد
              </span>
            </label>

            <div className="text-left">
              <span className="text-[10px] text-txt-muted block">الإجمالي المطلوب</span>
              <span className="text-lg font-mono font-bold text-txt-primary leading-tight">
                {total.toFixed(2)} {displayCurrency}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline flex-1 text-xs py-2.5 cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!canProceed() || isSubmitting}
              className="btn btn-primary flex-[2] text-xs py-2.5 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Check size={16} />
              <span>{isSubmitting ? 'جاري التأكيد...' : 'تأكيد وحفظ الطلب'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
