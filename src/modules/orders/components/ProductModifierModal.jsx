import { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { ModifierItemRow } from './modifiers/ModifierItemRow.jsx';
import { ModifierModalFooter } from './modifiers/ModifierModalFooter.jsx';

export const ProductModifierModal = ({
  isOpen,
  product,
  onClose,
  onConfirm,
  currency = 'EGP',
}) => {
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

  const isOn = (mod) =>
    mod.quantityMode === 'QUANTITY' ? (quantities[mod.id] || 0) > 0 : selected.has(mod.id);

  const modifierCost = (mod) =>
    Number(mod.priceDelta || 0) * (mod.quantityMode === 'QUANTITY' ? quantities[mod.id] || 0 : 1);

  const unitPrice =
    Number(product.price || 0) +
    modifiers.reduce((sum, m) => sum + (isOn(m) ? modifierCost(m) : 0), 0);

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
      quantity: m.quantityMode === 'QUANTITY' ? quantities[modIdOrId(m)] || 1 : 1,
      priceDelta: Number(m.priceDelta || 0),
    }));
    onConfirm({
      modifiers: chosen.map((c) => ({ modifierId: c.modifierId, quantity: c.quantity })),
      modifierNames: chosen.map((c) => (c.quantity > 1 ? `${c.name} ×${c.quantity}` : c.name)),
      unitPrice,
    });
  };

  const modIdOrId = (m) => m.id;
  const hasRequired = modifiers.some((m) => m.isRequired);

  return (
    <div
      className="overlay ai"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="card au flex flex-col overflow-hidden"
        style={{
          width: 480,
          maxWidth: '95vw',
          maxHeight: '92vh',
          background: 'var(--s1)',
          border: '1px solid var(--bd)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: '1px solid var(--bd)', background: 'var(--s1)' }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'var(--ac-bg)', color: 'var(--ac)' }}
            >
              <Sparkles size={16} />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold truncate" style={{ color: 'var(--t1)' }}>
                {product.name}
              </h2>
              <p className="text-xs" style={{ color: 'var(--t3)' }}>
                السعر الأساسي:{' '}
                <span className="mono font-semibold" style={{ color: 'var(--t2)' }}>
                  {Number(product.price || 0).toFixed(2)} {currency}
                </span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer hover:bg-slate-100"
            style={{ color: 'var(--t3)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modifiers List */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3 custom-scrollbar">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold" style={{ color: 'var(--t2)' }}>
              تخصيص الإضافات
            </span>
            {hasRequired && (
              <span className="badge b-warn" style={{ fontSize: 10 }}>
                توجد إضافات إلزامية
              </span>
            )}
          </div>

          {modifiers.length === 0 ? (
            <div className="py-8 text-center text-xs" style={{ color: 'var(--t3)' }}>
              لا توجد إضافات متاحة لهذا الصنف.
            </div>
          ) : (
            modifiers.map((mod) => (
              <ModifierItemRow
                key={mod.id}
                mod={mod}
                isOn={isOn(mod)}
                isQty={mod.quantityMode === 'QUANTITY'}
                qty={quantities[mod.id] || 0}
                priceDelta={Number(mod.priceDelta || 0)}
                onToggleSingle={toggleSingle}
                onAdjustQty={adjustQty}
                currency={currency}
              />
            ))
          )}
        </div>

        {/* Footer Summary & Confirm */}
        <ModifierModalFooter
          unitPrice={unitPrice}
          currency={currency}
          onClose={onClose}
          onConfirm={handleConfirm}
        />
      </div>
    </div>
  );
};

export default ProductModifierModal;