import React from 'react';
import { Button } from '../../../../shared/components/Button.jsx';
import { LoadingSkeleton } from '../../../../shared/components/LoadingSkeleton.jsx';
import { PermissionGate } from '../../../../shared/components/PermissionGate.jsx';
import { ADDRESS_LABELS } from '../../schemas/customer.schema.js';
import { MapPin, Plus, Edit3, Trash2 } from 'lucide-react';

export const CustomerAddressesCard = ({
  addresses = [],
  isLoading = false,
  onAddAddress,
  onEditAddress,
  onDeleteAddress,
}) => {
  return (
    <div className="bg-bg-surface border border-border-default rounded-lg p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-border-default pb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-brand-primary" />
          <h3 className="text-sm font-bold text-txt-primary">العناوين المحفوظة</h3>
          <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-bg-surface-elevated text-txt-muted border border-border-subtle">
            {addresses.length}
          </span>
        </div>
        <PermissionGate permission="customers.update">
          <Button
            size="sm"
            variant="outline"
            icon={Plus}
            onClick={onAddAddress}
            className="text-xs h-7 px-2.5"
          >
            إضافة عنوان
          </Button>
        </PermissionGate>
      </div>

      {isLoading ? (
        <LoadingSkeleton height={80} className="w-full" />
      ) : addresses.length === 0 ? (
        <div className="py-6 text-center space-y-1 bg-bg-base/40 rounded-lg border border-border-subtle">
          <MapPin className="w-5 h-5 text-txt-muted mx-auto" />
          <p className="text-xs font-semibold text-txt-primary">لا توجد عناوين مسجلة</p>
          <p className="text-[11px] text-txt-muted">أضف عنوان للتوصيل السريع مع الطلبات.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {addresses.map((addr) => {
            const fullAddress = [
              addr.street,
              addr.building && `عمارة ${addr.building}`,
              addr.floor && `دور ${addr.floor}`,
              addr.apartment && `شقة ${addr.apartment}`,
              addr.city,
            ]
              .filter(Boolean)
              .join('، ');

            return (
              <div
                key={addr.id}
                className={`p-3 rounded-lg border text-xs space-y-1.5 relative transition-all ${
                  addr.isDefault
                    ? 'border-brand-primary/40 bg-brand-primary/5'
                    : 'border-border-subtle bg-bg-base/60'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-txt-primary">
                      {ADDRESS_LABELS[addr.type] || addr.type || 'عنوان'}
                    </span>
                    {addr.isDefault && (
                      <span className="px-1.5 py-0.5 text-[10px] rounded bg-brand-primary text-white font-bold">
                        افتراضي
                      </span>
                    )}
                  </div>

                  <PermissionGate permission="customers.update">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEditAddress(addr)}
                        className="p-1 rounded text-txt-muted hover:text-txt-primary hover:bg-white/10 transition-colors cursor-pointer"
                        title="تعديل العنوان"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteAddress(addr)}
                        className="p-1 rounded text-txt-muted hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="حذف العنوان"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </PermissionGate>
                </div>

                <p className="text-txt-muted leading-relaxed">{fullAddress || 'تفاصيل العنوان غير محددة'}</p>

                {addr.notes && (
                  <p className="text-[11px] text-txt-muted/80 italic pt-0.5">
                    علامة مميزة: {addr.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
