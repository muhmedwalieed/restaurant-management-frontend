import React from 'react';
import { Modal } from '../../../../shared/components/Modal.jsx';
import { UtensilsCrossed, ShoppingBag, Truck, Phone, User, MapPin } from 'lucide-react';

const ORDER_TYPES = [
  { id: 'DINE_IN', label: 'صالة', icon: UtensilsCrossed },
  { id: 'PICKUP', label: 'استلام سفري', icon: ShoppingBag },
  { id: 'DELIVERY', label: 'توصيل ديليفري', icon: Truck },
];

export const PosCustomerModal = ({
  isOpen,
  onClose,
  orderType,
  onChangeOrderType,
  source,
  onChangeSource,
  availableSources = [],
  customerInfo = {},
  onChangeCustomerInfo,
  tables = [],
  callerData,
}) => {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="بيانات نوع الطلب والعميل"
      maxWidth="md"
    >
      <div className="space-y-4 text-xs">
        {/* Order Type Segment */}
        <div>
          <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--t2)' }}>
            نوع الطلب:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {ORDER_TYPES.map((t) => {
              const Icon = t.icon;
              const isSel = orderType === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onChangeOrderType(t.id)}
                  className={`py-2.5 px-3 rounded-xl border font-bold flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                    isSel
                      ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                      : 'border-border-default bg-bg-surface text-txt-muted hover:text-txt-primary'
                  }`}
                >
                  <Icon size={16} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Order Source */}
        {availableSources.length > 1 && (
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--t2)' }}>
              مصدر الطلب:
            </label>
            <div className="flex items-center gap-2">
              {availableSources.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => onChangeSource(s.value)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                    source === s.value
                      ? 'border-brand-primary bg-brand-primary text-white font-bold'
                      : 'border-border-default bg-bg-surface text-txt-muted'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Table Selection if DINE_IN */}
        {orderType === 'DINE_IN' && (
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--t2)' }}>
              اختر الطاولة:
            </label>
            <select
              value={customerInfo.table || ''}
              onChange={(e) =>
                onChangeCustomerInfo({ ...customerInfo, table: e.target.value ? Number(e.target.value) : null })
              }
              className="w-full py-2 px-3 rounded-lg bg-bg-surface border border-border-default text-txt-primary text-xs"
            >
              <option value="">-- بدون طاولة محددة --</option>
              {tables.map((t) => (
                <option key={t.id} value={t.id}>
                  طاولة {t.label || t.name || t.tableNumber || t.id} ({t.capacity || 4} كراسي)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Phone & Customer Info */}
        <div className="space-y-3 pt-2 border-t" style={{ borderColor: 'var(--bd)' }}>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--t2)' }}>
              رقم هاتف العميل:
            </label>
            <div className="relative">
              <Phone size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="tel"
                value={customerInfo.phone || ''}
                onChange={(e) => onChangeCustomerInfo({ ...customerInfo, phone: e.target.value })}
                placeholder="مثال: 01012345678"
                className="w-full pr-9 pl-3 py-2 rounded-lg bg-bg-surface border border-border-default text-txt-primary text-xs mono"
              />
            </div>
            {callerData?.customer && (
              <span className="text-[11px] text-emerald-400 mt-1 block">
                ✓ تم العثور على بيانات العميل: {callerData.customer.name}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--t2)' }}>
              اسم العميل:
            </label>
            <div className="relative">
              <User size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={customerInfo.name || ''}
                onChange={(e) => onChangeCustomerInfo({ ...customerInfo, name: e.target.value })}
                placeholder="اسم العميل (اختياري)..."
                className="w-full pr-9 pl-3 py-2 rounded-lg bg-bg-surface border border-border-default text-txt-primary text-xs"
              />
            </div>
          </div>

          {orderType === 'DELIVERY' && (
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--t2)' }}>
                عنوان التوصيل بالتفصيل:
              </label>
              <div className="relative">
                <MapPin size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                <textarea
                  rows={2}
                  value={customerInfo.address || ''}
                  onChange={(e) => onChangeCustomerInfo({ ...customerInfo, address: e.target.value })}
                  placeholder="الشارع، المنطقة، رقم العقار، رقم الشقة..."
                  className="w-full pr-9 pl-3 py-2 rounded-lg bg-bg-surface border border-border-default text-txt-primary text-xs"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Submit */}
        <div className="flex justify-end pt-3 border-t" style={{ borderColor: 'var(--bd)' }}>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl font-bold text-xs text-white shadow-sm transition-all active:scale-98 cursor-pointer"
            style={{ background: 'var(--ac)' }}
          >
            تأكيد البيانات
          </button>
        </div>
      </div>
    </Modal>
  );
};
