import React from 'react';
import { Button } from '../../../../shared/components/Button.jsx';
import { LoadingSkeleton } from '../../../../shared/components/LoadingSkeleton.jsx';
import { PermissionGate } from '../../../../shared/components/PermissionGate.jsx';
import { Layers, PlusCircle, Edit3, Trash2 } from 'lucide-react';
import { useCurrency } from '../../../../shared/hooks/useCurrency.js';

export const ProductModifiersSection = ({
  modifiers = [],
  isLoading = false,
  isError = false,
  errorMessage = '',
  onAddModifier,
  onEditModifier,
  onDeleteModifier,
}) => {
  const { currency } = useCurrency();
  return (
    <div className="bg-bg-surface border border-border-default rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-brand-primary" />
          <h3 className="text-xs font-bold text-txt-primary">خيارات وإضافات الصنف</h3>
        </div>

        <PermissionGate permission="menu.manage">
          <Button
            variant="outline"
            size="sm"
            icon={PlusCircle}
            onClick={onAddModifier}
            className="border-white/10 text-xs h-7 px-2.5"
          >
            إضافة خيار
          </Button>
        </PermissionGate>
      </div>

      <p className="text-xs text-txt-muted leading-relaxed">
        إتاحة أحجام، صوصات، أو إضافات خاصة (Add-ons) يختار منها العميل عند الطلب.
      </p>

      {isLoading ? (
        <LoadingSkeleton height={120} className="w-full" />
      ) : isError ? (
        <div className="p-4 bg-status-danger/10 border border-status-danger/30 rounded-lg text-xs text-status-danger text-center">
          {errorMessage || 'تعذر جلب إضافات المنتج'}
        </div>
      ) : modifiers.length === 0 ? (
        <div className="py-6 text-center space-y-1 bg-bg-base/30 rounded-lg border border-border-subtle">
          <Layers className="w-5 h-5 text-txt-muted mx-auto" />
          <p className="text-xs font-semibold text-txt-primary">لا توجد إضافات لهذا الصنف بعد</p>
          <p className="text-[11px] text-txt-muted">مثل: جبنة إضافية (+15 ج.م)، حجم كبير (+20 ج.م).</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border-subtle">
          <table className="w-full text-right text-xs">
            <thead className="bg-bg-base/60 border-b border-border-subtle text-txt-muted font-bold">
              <tr>
                <th className="p-2.5">الخيار</th>
                <th className="p-2.5">الفرق</th>
                <th className="p-2.5 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {modifiers.map((mod) => (
                <tr key={mod.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-2.5">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-txt-primary block">{mod.name}</span>
                      {mod.isRequired && (
                        <span className="text-[10px] text-txt-muted font-bold">إجباري</span>
                      )}
                    </div>
                  </td>
                  <td className="p-2.5 font-mono font-bold text-txt-primary whitespace-nowrap">
                    {Number(mod.priceDelta) > 0 ? `+${mod.priceDelta} ${currency}` : 'مجاني'}
                  </td>
                  <td className="p-2.5 text-center">
                    <PermissionGate permission="menu.manage">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEditModifier(mod)}
                          className="p-1 rounded-md text-txt-muted hover:text-txt-primary hover:bg-bg-surface-elevated transition-colors cursor-pointer"
                          title="تعديل الإضافة"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteModifier(mod)}
                          className="p-1 rounded-md text-txt-muted hover:text-status-danger hover:bg-status-danger-bg transition-colors cursor-pointer"
                          title="حذف الإضافة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </PermissionGate>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
