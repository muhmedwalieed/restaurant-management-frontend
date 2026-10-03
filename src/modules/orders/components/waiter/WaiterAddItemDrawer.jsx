import React, { useState, useMemo } from 'react';
import { Search, Plus, Minus, ShoppingBag, UtensilsCrossed, X } from 'lucide-react';
import { Modal } from '../../../../shared/components/Modal.jsx';
import { useCurrency } from '../../../../shared/hooks/useCurrency.js';
import { formatTableLabel } from '../../../tables/utils/tableLabel.js';

export const WaiterAddItemDrawer = ({
  isOpen,
  onClose,
  table,
  products = [],
  categories = [],
  onAddItemsToSession,
  isLoading,
}) => {
  const { currency } = useCurrency();
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [selectedItems, setSelectedItems] = useState({});

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCat === 'ALL' || p.categoryId === selectedCat;
      const matchQuery =
        !search.trim() ||
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.sku?.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [products, selectedCat, search]);

  const handleQtyChange = (productId, delta) => {
    setSelectedItems((prev) => {
      const cur = prev[productId]?.qty || 0;
      const next = cur + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      const prod = products.find((p) => p.id === productId);
      return {
        ...prev,
        [productId]: {
          productId,
          product: prod,
          qty: next,
          price: Number(prod?.price || 0),
        },
      };
    });
  };

  const selectedCount = Object.values(selectedItems).reduce((s, it) => s + it.qty, 0);
  const selectedTotal = Object.values(selectedItems).reduce(
    (s, it) => s + it.qty * it.price,
    0
  );

  const handleSubmit = () => {
    const itemsArray = Object.values(selectedItems);
    if (itemsArray.length === 0) return;
    onAddItemsToSession(table, itemsArray);
    setSelectedItems({});
    onClose();
  };

  if (!isOpen || !table) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`إضافة أصناف — ${formatTableLabel(table.displayNum)}`}
      size="xl"
    >
      <div className="flex flex-col gap-4 text-xs">
        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative w-full sm:w-56 shrink-0">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--t3)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن صنف بالاسم..."
              className="w-full min-h-[40px] pr-9 pl-8 py-2 rounded-lg text-base sm:text-xs select-text focus:outline-none"
              style={{ background: 'var(--s3)', border: '1px solid var(--bd)', color: 'var(--t1)' }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                style={{ background: 'var(--bd)', color: 'var(--t2)' }}
                title="مسح البحث"
              >
                <X size={10} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full min-w-0 pb-1 custom-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedCat('ALL')}
              className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap shrink-0 transition-all cursor-pointer border ${
                selectedCat === 'ALL'
                  ? 'bg-zinc-900 dark:bg-zinc-800 text-white font-medium border-zinc-900 dark:border-zinc-700 shadow-sm'
                  : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 font-medium'
              }`}
            >
              الكل
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCat(c.id)}
                className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap shrink-0 transition-all cursor-pointer border ${
                  selectedCat === c.id
                    ? 'bg-zinc-900 dark:bg-zinc-800 text-white font-medium border-zinc-900 dark:border-zinc-700 shadow-sm'
                    : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 font-medium'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="max-h-[48vh] overflow-y-auto custom-scrollbar">
          {filteredProducts.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center">
              <UtensilsCrossed size={22} className="mb-2" style={{ color: 'var(--t3)' }} />
              <p className="text-sm font-semibold" style={{ color: 'var(--t2)' }}>لا توجد أصناف مطابقة</p>
              <p className="text-xs mt-1" style={{ color: 'var(--t3)' }}>جرّب البحث بكلمة أخرى أو اختر تصنيفاً مختلفاً</p>
            </div>
          ) : (
            <div
              className="grid gap-2.5"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}
            >
              {filteredProducts.map((p) => {
                const curQty = selectedItems[p.id]?.qty || 0;
                return (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl border flex flex-col justify-between gap-2 transition-colors"
                    style={{
                      background: curQty > 0 ? 'var(--ac-bg)' : 'var(--s3)',
                      borderColor: curQty > 0 ? 'var(--ac)' : 'var(--bd)',
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-xs leading-snug line-clamp-2" style={{ color: 'var(--t1)' }}>
                        {p.name}
                      </span>
                      <span className="mono font-bold text-xs shrink-0" style={{ color: 'var(--t1)' }}>
                        {Number(p.price).toFixed(2)} {currency}
                      </span>
                    </div>

                    <div
                      className="flex items-center justify-between gap-2 pt-1 border-t"
                      style={{ borderColor: 'var(--bd)' }}
                    >
                      <span className="text-[11px] truncate" style={{ color: 'var(--t3)' }}>
                        {p.category?.name || ''}
                      </span>

                      {curQty === 0 ? (
                        <button
                          type="button"
                          onClick={() => handleQtyChange(p.id, 1)}
                          className="h-7 px-2.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shrink-0 hover:bg-black/5 dark:hover:bg-white/10"
                          style={{ color: 'var(--ac)' }}
                        >
                          <Plus size={13} />
                          <span>إضافة</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleQtyChange(p.id, -1)}
                            className="w-7 h-7 rounded-md flex items-center justify-center cursor-pointer transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                            style={{ background: 'var(--s1)', color: 'var(--t1)' }}
                          >
                            <Minus size={12} />
                          </button>
                          <span className="mono font-bold text-xs w-5 text-center" style={{ color: 'var(--ac)' }}>
                            {curQty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQtyChange(p.id, 1)}
                            className="w-7 h-7 rounded-md flex items-center justify-center cursor-pointer transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                            style={{ background: 'var(--s1)', color: 'var(--t1)' }}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Summary & Submit */}
        <div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t"
          style={{ borderColor: 'var(--bd)' }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <ShoppingBag size={16} className="shrink-0" style={{ color: 'var(--ac)' }} />
            <span className="text-xs truncate" style={{ color: 'var(--t2)' }}>
              تم اختيار: <strong style={{ color: 'var(--t1)' }}>{selectedCount}</strong> صنف
            </span>
          </div>

          <div className="flex items-center gap-2 sm:shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              style={{ borderColor: 'var(--bd)', color: 'var(--t2)' }}
            >
              إلغاء
            </button>
            <button
              type="button"
              disabled={selectedCount === 0 || isLoading}
              onClick={handleSubmit}
              className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold text-white shadow-sm transition-all active:scale-98 cursor-pointer disabled:opacity-50 bg-emerald-600 hover:bg-emerald-500 border border-emerald-500/20"
            >
              {isLoading ? 'جاري الإضافة...' : `إضافة للطلب (${selectedTotal.toFixed(2)} ${currency})`}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default WaiterAddItemDrawer;
