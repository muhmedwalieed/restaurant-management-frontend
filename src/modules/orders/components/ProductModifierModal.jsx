import { useState, useEffect } from 'react';
import { Modal } from '../../../shared/components/Modal.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { Check, Plus, Minus, Info } from 'lucide-react';

export const ProductModifierModal = ({ isOpen, product, onClose, onConfirm }) => {
  const [selected, setSelected] = useState(() => new Set());
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    if (isOpen && product) {
      const init = new Set();
      (product.modifiers || []).forEach((m) => {
        if (m.isRequired) init.add(m.id);
      });
      setSelected(init);
      setQuantities({});
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const modifiers = product.modifiers || [];
  const currency = 'EGP';

  const selectedDelta = [...selected].reduce((sum, id) => {
    const m = modifiers.find((x) => x.id === id);
    return sum + Number(m?.priceDelta || 0) * (quantities[id] || 1);
  }, 0);
  const unitPrice = Number(product.price || 0) + selectedDelta;

  const toggle = (mod) => {
    if (mod.isRequired) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(mod.id)) next.delete(mod.id);
      else next.add(mod.id);
      return next;
    });
  };

  const adjustQty = (mod, delta) => {
    if (mod.priceDelta <= 0) return;
    setQuantities((prev) => ({ ...prev, [mod.id]: Math.max(1, (prev[mod.id] || 1) + delta) }));
  };

  const handleConfirm = () => {
    const chosen = modifiers.filter((m) => selected.has(m.id));
    onConfirm({
      modifierIds: chosen.map((m) => m.id),
      modifierNames: chosen.map((m) => m.name),
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
              const isOn = selected.has(mod.id);
              const qty = quantities[mod.id] || 1;
              return (
                <div
                  key={mod.id}
                  className={`flex items-center justify-between gap-2 rounded-xl border p-3 transition-colors ${
                    isOn ? 'border-brand-primary bg-brand-primary/[0.05]' : 'border-border-subtle bg-bg-base/40'
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
                    </p>
                    <p className="text-[11px] text-txt-muted font-mono" dir="ltr">
                      {Number(mod.priceDelta || 0).toFixed(2)} {currency}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isOn && mod.priceDelta > 0 && (
                      <div className="flex items-center gap-1 bg-bg-surface border border-border-subtle rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={() => adjustQty(mod, -1)}
                          className="w-6 h-6 rounded-md hover:bg-white/[0.06] flex items-center justify-center text-txt-muted transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-4 text-center text-xs font-mono font-bold">{qty}</span>
                        <button
                          type="button"
                          onClick={() => adjustQty(mod, 1)}
                          className="w-6 h-6 rounded-md hover:bg-white/[0.06] flex items-center justify-center text-txt-muted transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => toggle(mod)}
                      disabled={mod.isRequired}
                      className={`w-7 h-7 rounded-full border flex items-center justify-center transition-colors ${
                        isOn
                          ? 'bg-brand-primary border-brand-primary text-slate-950'
                          : 'border-border-default text-transparent hover:border-white/30'
                      } ${mod.isRequired ? 'opacity-90' : ''}`}
                      title={mod.isRequired ? 'إضافة إجبارية' : 'اختياري'}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
          <span className="text-xs font-semibold text-txt-muted">
            سعر الصنف بعد الإضافات:
            <span className="font-mono font-bold text-txt-primary mr-1" dir="ltr">
              {unitPrice.toFixed(2)} {currency}
            </span>
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button size="sm" variant="primary" onClick={handleConfirm}>
              إضافة للسلة ({unitPrice.toFixed(2)} {currency})
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ProductModifierModal;