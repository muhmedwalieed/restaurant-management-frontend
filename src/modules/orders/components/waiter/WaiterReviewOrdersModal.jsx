import React, { useState, useMemo } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  UtensilsCrossed,
  Plus,
  Minus,
  Trash2,
  PlusCircle,
  Search,
  Loader2,
} from 'lucide-react';
import { Modal } from '../../../../shared/components/Modal.jsx';
import { useCurrency } from '../../../../shared/hooks/useCurrency.js';
import { formatTableLabel } from '../../../tables/utils/tableLabel.js';

export const WaiterReviewOrdersModal = ({
  isOpen,
  onClose,
  table,
  products = [],
  onConfirmOrder,
  onRejectOrder,
  onUpdateItemQty,
  onRemoveItem,
  onAddItem,
  isLoading = false,
  isRejecting = false,
}) => {
  const { currency } = useCurrency();
  const [showAddSection, setShowAddSection] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [addQty, setAddQty] = useState(1);
  const [searchFilter, setSearchFilter] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const availableProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];
    if (!searchFilter.trim()) return products.slice(0, 30);
    const q = searchFilter.toLowerCase();
    return products.filter((p) => p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q));
  }, [products, searchFilter]);

  if (!isOpen || !table) return null;

  const session = table.session;
  const reviewItems = session?.reviewItems || [];
  const orderNumber = session?.pendingOrderNumber;
  const total = reviewItems.reduce((s, it) => s + (Number(it.price) || 0) * (it.qty || 1), 0);

  const handleQtyChange = async (item, delta) => {
    const nextQty = item.qty + delta;
    if (nextQty <= 0) {
      handleDeleteItem(item);
      return;
    }
    if (!onUpdateItemQty) return;
    setActionLoadingId(item.id || item.itemId || item.productId);
    try {
      await onUpdateItemQty(item, nextQty);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteItem = async (item) => {
    if (!onRemoveItem) return;
    setActionLoadingId(item.id || item.itemId || item.productId);
    try {
      await onRemoveItem(item);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmAddItem = async () => {
    if (!selectedProductId || !onAddItem) return;
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;
    setActionLoadingId('add-new');
    try {
      await onAddItem(prod, addQty);
      setSelectedProductId('');
      setAddQty(1);
      setShowAddSection(false);
      setSearchFilter('');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`مراجعة وتعديل طلب ${formatTableLabel(table.displayNum)} ${orderNumber ? `(#${orderNumber})` : ''}`}
    >
      <div className="space-y-4 text-xs">
        {/* Info Banner */}
        <div className="p-3 rounded-lg bg-bg-surface-elevated border border-border-default text-txt-muted flex items-center gap-2">
          <UtensilsCrossed size={16} className="shrink-0 text-txt-muted" />
          <span>طلب QR بانتظار موافقتك. يمكنك تعديل الكميات أو حذف أو إضافة أصناف قبل إرساله للمطبخ.</span>
        </div>

        {/* Review Items Table — scrolls horizontally on narrow screens */}
        <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--bd)' }}>
          <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[440px] text-right">
            <thead style={{ background: 'var(--s2)' }}>
              <tr className="border-b" style={{ borderColor: 'var(--bd)', color: 'var(--t2)' }}>
                <th className="p-2.5">الصنف</th>
                <th className="p-2.5 text-center">الكمية</th>
                <th className="p-2.5 text-left">السعر</th>
                <th className="p-2.5 text-left">الإجمالي</th>
                <th className="p-2.5 text-center w-10">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--bd)' }}>
              {reviewItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-txt-muted">
                    لا توجد أصناف في هذا الطلب حالياً.
                  </td>
                </tr>
              ) : (
                reviewItems.map((it, idx) => {
                  const itemId = it.id || it.itemId || it.productId;
                  const isItemBusy = actionLoadingId === itemId;
                  return (
                    <tr key={idx} className="hover:bg-bg-surface-elevated/50 transition-colors">
                      <td className="p-2.5 font-medium" style={{ color: 'var(--t1)' }}>
                        <div className="flex items-center gap-2">
                          {isItemBusy && <Loader2 size={12} className="animate-spin text-txt-muted" />}
                          <span>{it.name}</span>
                        </div>
                      </td>
                      <td className="p-2.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            disabled={isItemBusy || isLoading}
                            onClick={() => handleQtyChange(it, -1)}
                            className="w-6 h-6 rounded flex items-center justify-center bg-bg-surface-elevated hover:bg-border-default text-txt-primary transition-colors cursor-pointer disabled:opacity-40"
                            title={it.qty === 1 ? 'حذف الصنف' : 'تقليل الكمية'}
                          >
                            <Minus size={12} />
                          </button>
                          <span className="mono font-bold text-xs min-w-[20px] text-center" style={{ color: 'var(--t1)' }}>
                            {it.qty}
                          </span>
                          <button
                            type="button"
                            disabled={isItemBusy || isLoading}
                            onClick={() => handleQtyChange(it, 1)}
                            className="w-6 h-6 rounded flex items-center justify-center bg-bg-surface-elevated hover:bg-border-default text-txt-primary transition-colors cursor-pointer disabled:opacity-40"
                            title="زيادة الكمية"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </td>
                      <td className="p-2.5 text-left mono" style={{ color: 'var(--t2)' }}>
                        {Number(it.price).toFixed(2)}
                      </td>
                      <td className="p-2.5 text-left mono font-bold" style={{ color: 'var(--t1)' }}>
                        {(Number(it.price) * it.qty).toFixed(2)}
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          type="button"
                          disabled={isItemBusy || isLoading}
                          onClick={() => handleDeleteItem(it)}
                          className="p-1 rounded text-status-danger/80 hover:text-status-danger hover:bg-status-danger-bg transition-colors cursor-pointer disabled:opacity-40"
                          title="حذف هذا الصنف"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot style={{ background: 'var(--s2)' }}>
              <tr>
                <td colSpan={3} className="p-2.5 font-bold" style={{ color: 'var(--t1)' }}>
                  إجمالي الطلب:
                </td>
                <td colSpan={2} className="p-2.5 text-left mono font-bold text-sm" style={{ color: 'var(--t1)' }}>
                  {total.toFixed(2)} {currency}
                </td>
              </tr>
            </tfoot>
          </table>
          </div>
        </div>

        {/* Add Product into this Order Section */}
        {products.length > 0 && onAddItem && (
          <div className="space-y-2">
            {!showAddSection ? (
              <button
                type="button"
                onClick={() => setShowAddSection(true)}
                className="text-xs font-bold text-txt-primary hover:text-txt-primary flex items-center gap-1.5 py-1 px-2 rounded-lg bg-bg-surface-elevated hover:bg-border-default transition-colors cursor-pointer border border-border-default"
              >
                <PlusCircle size={14} />
                <span>إضافة صنف جديد للطلب</span>
              </button>
            ) : (
              <div className="p-3 rounded-lg border space-y-3" style={{ background: 'var(--s2)', borderColor: 'var(--bd)' }}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs" style={{ color: 'var(--t1)' }}>
                    إضافة صنف للطلب
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddSection(false);
                      setSelectedProductId('');
                    }}
                    className="p-1 text-txt-muted hover:text-txt-primary rounded"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-[1fr_80px_auto] gap-2 items-center">
                  <div className="space-y-1">
                    <div className="relative">
                      <Search size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-txt-muted" />
                      <input
                        type="text"
                        placeholder="ابحث عن الصنف..."
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        className="w-full min-h-[40px] pr-8 pl-2.5 py-1.5 rounded-lg border bg-bg-base text-base sm:text-xs select-text text-txt-primary border-border-default focus:border-brand-primary outline-none"
                      />
                    </div>
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="w-full min-h-[40px] px-2.5 py-1.5 rounded-lg border bg-bg-base text-base sm:text-xs text-txt-primary border-border-default focus:border-brand-primary outline-none mt-1"
                    >
                      <option value="">-- اختر صنفاً --</option>
                      {availableProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({Number(p.price).toFixed(2)} {currency})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => setAddQty((q) => Math.max(1, q - 1))}
                      className="w-7 h-7 rounded border border-border-default flex items-center justify-center bg-bg-surface-elevated hover:bg-border-default"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="font-mono font-bold text-xs px-1 text-center min-w-[20px]">
                      {addQty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAddQty((q) => q + 1)}
                      className="w-7 h-7 rounded border border-border-default flex items-center justify-center bg-bg-surface-elevated hover:bg-border-default"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={!selectedProductId || actionLoadingId === 'add-new'}
                    onClick={handleConfirmAddItem}
                    className="px-3.5 py-2 rounded-lg font-bold text-white transition-all bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1 shrink-0"
                  >
                    {actionLoadingId === 'add-new' ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                    <span>إضافة</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t" style={{ borderColor: 'var(--bd)' }}>
          <button
            type="button"
            disabled={isLoading || isRejecting}
            onClick={() => onRejectOrder(table)}
            className="px-4 py-2 rounded-lg font-bold transition-colors bg-status-danger-bg hover:bg-status-danger/20 text-status-danger flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isRejecting ? <Loader2 size={15} className="animate-spin" /> : <XCircle size={15} />}
            <span>{isRejecting ? 'جاري الإلغاء...' : 'رفض الطلب'}</span>
          </button>

          <button
            type="button"
            disabled={isLoading || isRejecting || reviewItems.length === 0}
            onClick={() => onConfirmOrder(table)}
            className="px-5 py-2 rounded-lg font-bold text-white transition-all shadow-sm active:scale-98 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 bg-emerald-600 hover:bg-emerald-500 border border-emerald-500/20"
          >
            {isLoading ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
            <span>{isLoading ? 'جاري التأكيد...' : 'تأكيد وإرسال للمطبخ'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
