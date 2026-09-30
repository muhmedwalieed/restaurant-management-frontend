import React from 'react';
import { Modal } from '../../../../shared/components/Modal.jsx';
import { UtensilsCrossed, ShoppingBag, Truck, Phone, User, MapPin } from 'lucide-react';
const ORDER_TYPES = [{ id: 'PICKUP', label: 'استلام', icon: ShoppingBag }, { id: 'DELIVERY', label: 'توصيل', icon: Truck }, { id: 'DINE_IN', label: 'صالة', icon: UtensilsCrossed }];
export const PosCustomerModal = ({ isOpen, onClose, orderType, onChangeOrderType, source, onChangeSource, availableSources = [], customerInfo = {}, onChangeCustomerInfo, tables = [], callerData }) => {
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="بيانات الطلب والعميل" maxWidth="md">
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-full border border-zinc-200 bg-zinc-100/80 shadow-inner">
          {ORDER_TYPES.map((t) => {
            const Icon = t.icon; const sel = orderType === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onChangeOrderType(t.id)}
                className={`py-2 rounded-full text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                  sel
                    ? 'bg-zinc-900 text-white font-medium shadow-sm border-transparent'
                    : 'border-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60 font-normal'
                }`}
              >
                <Icon size={14} strokeWidth={sel ? 2.2 : 1.8} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
        {availableSources.length > 1 && <div className="flex gap-1.5 flex-wrap">{availableSources.map((s) => <button key={s.value} type="button" onClick={() => onChangeSource(s.value)} className="px-3 py-1.5 rounded-full text-xs font-black cursor-pointer" style={source === s.value ? { background: 'var(--ac)', color: 'var(--ti, #ffffff)' } : { background: 'var(--s2)', border: '1px solid var(--bd)', color: 'var(--t2)' }}>{s.label}</button>)}</div>}
        {orderType === 'DINE_IN' && (
          <select value={customerInfo.table || ''} onChange={(e) => onChangeCustomerInfo({ ...customerInfo, table: e.target.value || null })} className="w-full py-2.5 px-3 rounded-full text-xs font-bold focus:outline-none" style={{ background: 'var(--s2)', border: '1px solid var(--bd)', color: 'var(--t1)' }}>
            {!customerInfo.table && <option value="" disabled>اختر طاولة...</option>}
            {tables.map((t) => (
              <option key={t.id} value={t.id}>
                طاولة {t.label || t.name || (t.number != null ? t.number : t.tableNumber || t.id)}
              </option>
            ))}
          </select>
        )}
        {orderType === 'DELIVERY' && (
          <div className="space-y-3 pt-3" style={{ borderTop: '1px solid var(--bd)' }}>
            <div className="relative"><User size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--t3)' }} /><input type="text" value={customerInfo.name || ''} onChange={(e) => onChangeCustomerInfo({ ...customerInfo, name: e.target.value })} placeholder="اسم العميل *" className="w-full pr-9 pl-3 py-2.5 rounded-full text-xs font-bold focus:outline-none" style={{ background: 'var(--s2)', border: '1px solid var(--bd)', color: 'var(--t1)' }} /></div>
            <div className="relative"><Phone size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--t3)' }} /><input type="tel" dir="rtl" value={customerInfo.phone || ''} onChange={(e) => onChangeCustomerInfo({ ...customerInfo, phone: e.target.value })} placeholder="رقم الهاتف *" className="w-full pr-9 pl-3 py-2.5 rounded-full text-xs font-bold text-right focus:outline-none" style={{ background: 'var(--s2)', border: '1px solid var(--bd)', color: 'var(--t1)', textAlign: 'right' }} /></div>
            {callerData?.customer && <span className="text-xs font-bold" style={{ color: '#10b981' }}>✓ {callerData.customer.name}</span>}
            <div className="relative"><MapPin size={13} className="absolute right-3 top-3 pointer-events-none" style={{ color: 'var(--t3)' }} /><textarea rows={2} value={customerInfo.address || ''} onChange={(e) => onChangeCustomerInfo({ ...customerInfo, address: e.target.value })} placeholder="عنوان التوصيل بالتفصيل *" className="w-full pr-9 pl-3 py-2.5 rounded-2xl text-xs font-bold focus:outline-none resize-none" style={{ background: 'var(--s2)', border: '1px solid var(--bd)', color: 'var(--t1)' }} /></div>
          </div>
        )}
        <button type="button" onClick={onClose} className="w-full h-10 rounded-full font-black text-xs cursor-pointer" style={{ background: 'var(--ac)', color: 'var(--ti, #ffffff)' }}>تأكيد</button>
      </div>
    </Modal>
  );
};
