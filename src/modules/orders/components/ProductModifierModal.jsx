import { useState, useEffect } from 'react';
import { Modal } from '../../../shared/components/Modal.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { Check, Plus, Minus, Info } from 'lucide-react';

export const ProductModifierModal = ({ isOpen, product, onClose, onConfirm }) => {
  const [selected, setSelected] = useState(() => new Set());
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    if (isOpen && product) {
      const initSelected = new Set();
      const initQuantities = {};
      (product.modifiers || []).forEach((m) => {
        if (m.quantityMode === 'QUANTITY') {
          initQuantities[m.id] = m.isRequired ? 1 : 0;
        } else if (m.isRequired) {
          initSelected.add(m.id);
        }
      });
      setSelected(initSelected);
      setQuantities(initQuantities);
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const modifiers = product.modifiers || [];
  const currency = 'EGP';

  const isOn = (mod) =>
    mod.quantityMode === 'QUANTITY' ? (quantities[mod.id] || 0) > 0 : selected.has(mod.id);

  const modifierCost = (mod) =>
    Number(mod.priceDelta || 0) * (mod.quantityMode === 'QUANTITY' ? quantities[mod.id] || 0 : 1);

  const unitPrice = Number(product.price || 0) + modifiers.reduce((sum, m) => sum + (isOn(m) ? modifierCost(m) : 0), 0);

  const toggleSingle = (mod) => {
    if (mod.isRequired) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(mod.id)) next.delete(mod.id);
      else next.add(mod.id);
      return next;
    });
  };

  const adjustQty = (mod, delta) => {
    const max = mod.maxQuantity || 99;
    const min = mod.isRequired ? 1 : 0;
    setQuantities((prev) => {
      const current = prev[mod.id] || 0;
      return { ...prev, [mod.id]: Math.max(min, Math.min(max, current + delta)) };
    });
  };

  const handleConfirm = () => {
    const chosen = modifiers.filter((m) => isOn(m)).map((m) => ({
      modifierId: m.id,
      name: m.name,
      quantity: m.quantityMode === 'QUANTITY' ? quantities[m.id] || 1 : 1,
    }));
    onConfirm({
      modifiers: chosen.map((c) => ({ modifierId: c.modifierId, quantity: c.quantity })),
      modifierNames: chosen.map((c) => (c.quantity > 1 ? `${c.name} ×${c.quantity}` : c.name)),
      unitPrice,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={product.name} size="md">
      <div className="space-y-4">
        {modifiers.length === 0 ? (
          <p className="text-xs text-txt-muted">لا توجد إضافات لهذا الصنف.</p>
        ) : (
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-txt-muted flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              اختر الإضافات (الإجبارية محددة مسبقاً)
            </p>
            {modifiers.map((mod) => {
              const on = isOn(mod);
              const isQty = mod.quantityMode === 'QUANTITY';
              const qty = quantities[mod.id] || 0;
              return (
                <div
                  key={mod.id}
                  className={`flex items-center justify-between gap-2 rounded-xl border p-3 transition-colors ${
                    on ? 'border-brand-primary bg-brand-primary/[0.05]' : 'border-border-subtle bg-bg-base/40'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-txt-primary flex items-center gap-1.5">
                      {mod.name}
                      {mod.isRequired && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-status-warning/10 text-status-warning border border-status-warning/30">
                          إجباري
                        </span>
                      )}
                      {isQty}
                    </p>
                    <p className="text-[11px] text-txt-muted font-mono" dir="ltr">
                      {Number(mod.priceDelta || 0).toFixed(2)} {currency}
                      {isQty && qty > 1 ? ` × ${qty}` : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isQty ? (
                      <div className="flex items-center gap-1 bg-bg-surface border border-border-subtle rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={() => adjustQty(mod, -1)}
                          disabled={qty <= (mod.isRequired ? 1 : 0)}
                          aria-label={`إنقاص ${mod.name}`}
                          className="w-6 h-6 rounded-md hover:bg-white/[0.06] flex items-center justify-center text-txt-muted transition-colors disabled:opacity-30"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-mono font-bold">{qty}</span>
                        <button
                          type="button"
                          onClick={() => adjustQty(mod, 1)}
                          disabled={qty >= (mod.maxQuantity || 99)}
                          aria-label={`زيادة ${mod.name}`}
                          className="w-6 h-6 rounded-md hover:bg-white/[0.06] flex items-center justify-center text-txt-muted transition-colors disabled:opacity-30"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleSingle(mod)}
                        disabled={mod.isRequired}
                        aria-label={mod.name}
                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors ${
                          on
                            ? 'bg-brand-primary border-brand-primary text-slate-950'
                            : 'bg-slate-800 border-slate-500 text-transparent hover:border-white'
                        } ${mod.isRequired ? 'opacity-90' : ''}`}
                        title={mod.isRequired ? 'إضافة إجبارية' : 'اختياري'}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 pt-3 border-t border-border-subtle">
          <span className="text-xs font-semibold text-txt-muted">
            سعر الصنف بعد الإضافات:
            <span dir="ltr" className="font-mono font-bold text-txt-primary mr-1 inline-block">
              {unitPrice.toFixed(2)} {currency}
            </span>
          </span>
          <div className="flex gap-2 shrink-0">
            <Button size="sm" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button size="sm" variant="primary" onClick={handleConfirm} className="gap-1.5">
              <span>إضافة للسلة</span>
              <span dir="ltr" className="font-mono">
                {unitPrice.toFixed(2)} {currency}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ProductModifierModal;