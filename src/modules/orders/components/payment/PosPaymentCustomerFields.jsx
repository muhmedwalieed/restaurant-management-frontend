import React from 'react';
import { Phone, User, MapPin, MessageSquare, History } from 'lucide-react';

export const PosPaymentCustomerFields = ({
  orderType,
  tables = [],
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
  caller,
  isLookingUp,
}) => {
  return (
    <div className="space-y-4">
      {/* DINE_IN Table Selection Grid */}
      {orderType === 'DINE_IN' && (
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-txt-primary">
            اختر الطاولة <span className="text-status-danger">*</span>
          </label>
          {tables.length === 0 ? (
            <div className="p-3 text-center text-xs text-txt-muted bg-slate-50 rounded-lg border border-border-default">
              لا توجد طاولات متاحة حالياً
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1 border border-border-default rounded-xl bg-slate-50/50">
              {tables.map((t) => {
                const isSelected = String(tableId) === String(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTableId(t.id)}
                    className={`py-2 px-1 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                      isSelected
                        ? 'bg-ac text-txt-inverted shadow-xs'
                        : 'bg-white text-txt-primary border border-border-default hover:border-slate-400'
                    }`}
                  >
                    <span className="block text-[10px] opacity-70 font-normal">طاولة</span>
                    <span className="font-mono text-sm">
                      {t.label || t.name || t.tableNumber || tables.indexOf(t) + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* PICKUP or DELIVERY Info */}
      {(orderType === 'PICKUP' || orderType === 'DELIVERY') && (
        <div className="space-y-2.5">
          <div>
            <label className="block text-xs font-semibold text-txt-primary mb-1">
              رقم هاتف العميل <span className="text-status-danger">*</span>
            </label>
            <div className="relative flex items-center">
              <Phone size={14} className="absolute right-3 text-txt-muted pointer-events-none" />
              <input
                type="tel"
                dir="ltr"
                className="inp pr-9 text-xs"
                placeholder="01xxxxxxxxx"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
              {isLookingUp && (
                <span className="absolute left-3 text-[10px] text-txt-muted animate-pulse">جاري الفحص...</span>
              )}
            </div>
          </div>

          {caller && (
            <div className="p-2 rounded-lg bg-ac-bg border border-slate-200 flex items-center justify-between text-xs text-txt-primary">
              <div className="flex items-center gap-1.5">
                <History size={13} className="text-brand-primary" />
                <span>عميل سابق: <strong>{caller.customer?.name || 'عميل مسجل'}</strong></span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-txt-primary mb-1">
              اسم العميل {orderType === 'DELIVERY' && <span className="text-status-danger">*</span>}
            </label>
            <div className="relative flex items-center">
              <User size={14} className="absolute right-3 text-txt-muted pointer-events-none" />
              <input
                type="text"
                className="inp pr-9 text-xs"
                placeholder="اسم العميل الكامل"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
          </div>

          {orderType === 'DELIVERY' && (
            <div>
              <label className="block text-xs font-semibold text-txt-primary mb-1">
                عنوان التوصيل <span className="text-status-danger">*</span>
              </label>
              <div className="relative">
                <MapPin size={14} className="absolute right-3 top-3 text-txt-muted pointer-events-none" />
                <textarea
                  rows={2}
                  className="inp pr-9 text-xs"
                  placeholder="العنوان بالتفصيل، الشارع، المبنى، الشقة..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Order Notes */}
      <div>
        <label className="block text-xs font-semibold text-txt-primary mb-1">ملاحظات الطلب (اختياري)</label>
        <div className="relative">
          <MessageSquare size={14} className="absolute right-3 top-2.5 text-txt-muted pointer-events-none" />
          <input
            type="text"
            className="inp pr-9 text-xs"
            placeholder="بدون بصل، زيادة صوص..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
