import React, { useState, useMemo } from 'react';
import { Search, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Modal } from '../../../../shared/components/Modal.jsx';
import { useCurrency } from '../../../../shared/hooks/useCurrency.js';

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
      title={`إضافة أصناف — طاولة ${table.displayNum}`}
      maxWidth="lg"
    >
      <div className="space-y-4 text-xs">
        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative w-full sm:flex-1">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن صنف بالاسم..."
              className="w-full pr-9 pl-3 py-2 rounded-lg bg-bg-surface border border-border-default text-xs text-txt-primary focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-thin">
            <button
              type="button"
              onClick={() => setSelectedCat('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCat === 'ALL'
                  ? 'bg-brand-primary text-white font-bold'
                  : 'bg-bg-surface border border-border-default text-txt-muted hover:text-txt-primary'
              }`}
            >
              الكل
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCat(c.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCat === c.id
                    ? 'bg-brand-primary text-white font-bold'
                    : 'bg-bg-surface border border-border-default text-txt-muted hover:text-txt-primary'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="max-h-80 overflow-y-auto custom-scrollbar pr-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {filteredProducts.map((p) => {
            const curQty = selectedItems[p.id]?.qty || 0;
            return (
              <div
                key={p.id}
                className="p-3 rounded-xl border flex flex-col justify-between gap-2 transition-colors"
                style={{
                  background: curQty > 0 ? 'var(--ac-bg)' : 'var(--s2)',
                  borderColor: curQty > 0 ? 'var(--ac)' : 'var(--bd)',
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-xs leading-snug" style={{ color: 'var(--t1)' }}>
                    {p.name}
                  </span>
                  <span className="mono font-bold text-xs shrink-0" style={{ color: 'var(--t1)' }}>
                    {Number(p.price).toFixed(2)} ج
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                  <span className="text-[11px]" style={{ color: 'var(--t3)' }}>
                    {p.category?.name || ''}
                  </span>

                  {curQty === 0 ? (
                    <button
                      type="button"
                      onClick={() => handleQtyChange(p.id, 1)}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold transition-colors hover:bg-white/10 flex items-center gap-1 cursor-pointer"
                      style={{ color: 'var(--ac)' }}
                    >
                      <Plus size={13} />
                      <span>إضافة</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleQtyChange(p.id, -1)}
                        className="w-6 h-6 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
                        style={{ color: 'var(--t1)' }}
                      >
                        <Minus size={12} />
                      </button>
                      <span className="mono font-bold text-xs w-5 text-center" style={{ color: 'var(--ac)' }}>
                        {curQty}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQtyChange(p.id, 1)}
                        className="w-6 h-6 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
                        style={{ color: 'var(--t1)' }}
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

        {/* Footer Summary & Submit */}
        <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--bd)' }}>
          <div className="flex items-center gap-2">
            <ShoppingBag size={16} style={{ color: 'var(--ac)' }} />
            <span className="text-xs" style={{ color: 'var(--t2)' }}>
              تم اختيار: <strong style={{ color: 'var(--t1)' }}>{selectedCount}</strong> صنف (
              <strong className="mono" style={{ color: 'var(--ac)' }}>{selectedTotal.toFixed(2)} {currency}</strong>)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border text-xs font-medium text-slate-300 hover:bg-white/5 cursor-pointer"
              style={{ borderColor: 'var(--bd)' }}
            >
              إلغاء
            </button>
            <button
              type="button"
              disabled={selectedCount === 0 || isLoading}
              onClick={handleSubmit}
              className="px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all active:scale-98 cursor-pointer disabled:opacity-50"
              style={{ background: 'var(--ac)', color: 'var(--ti, #ffffff)' }}
            >
              {isLoading ? 'جاري الإضافة...' : `إضافة للطلب (${selectedTotal.toFixed(2)} ج)`}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
