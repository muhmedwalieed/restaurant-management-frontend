import React from 'react';
import { Input } from '../../../../shared/components/Input.jsx';
import { StatusPill } from '../../../../shared/components/StatusPill.jsx';
import { Button } from '../../../../shared/components/Button.jsx';
import { SlidersHorizontal, Square, CheckSquare } from 'lucide-react';

export const RoleBasicInfoCard = ({
  name,
  setName,
  description,
  setDescription,
  nameError,
  setNameError,
  isSystem = false,
  selectedCount = 0,
  totalCount = 0,
  isAllSelected = false,
  onToggleAll,
}) => {
  return (
    <div className="space-y-5 lg:sticky lg:top-4 self-start">
      <div className="bg-bg-surface border border-border-default rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-border-subtle pb-2.5">
          <SlidersHorizontal className="w-4 h-4 text-brand-primary shrink-0" />
          <h3 className="text-xs font-bold text-txt-primary">بيانات الدور الأساسية</h3>
        </div>

        <div className="space-y-3.5">
          <Input
            label="اسم الدور الوظيفي"
            placeholder="مثال: كاشير، مشرف صالة..."
            required
            disabled={isSystem}
            error={nameError}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError && setNameError) setNameError(null);
            }}
          />

          <Input
            label="الوصف المختصر"
            placeholder="وصف مسؤوليات ونطاق هذا الدور..."
            disabled={isSystem}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-bg-surface border border-border-default rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-border-subtle pb-2.5">
          <h3 className="text-xs font-bold text-txt-primary">ملخص الصلاحيات الممنوحة</h3>
          {isSystem ? (
            <StatusPill status="info" className="text-xs py-0.5 px-2">
              دور نظام
            </StatusPill>
          ) : (
            <StatusPill status="success" className="text-xs py-0.5 px-2">
              دور مخصص
            </StatusPill>
          )}
        </div>

        <div className="bg-bg-base/60 border border-border-subtle rounded-xl p-4 text-center space-y-1">
          <div className="text-2xl font-bold font-mono text-brand-primary tabular-nums">
            {selectedCount} <span className="text-sm text-txt-muted font-sans font-normal">/ {totalCount}</span>
          </div>
          <p className="text-xs text-txt-muted">صلاحية مفعّلة لهذا المسمى الوظيفي</p>
        </div>

        {!isSystem && onToggleAll && (
          <div className="space-y-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onToggleAll}
              className="w-full text-xs font-medium justify-center border-white/10 hover:bg-white/[0.05]"
            >
              {isAllSelected ? (
                <>
                  <Square className="w-3.5 h-3.5 shrink-0" />
                  <span>إلغاء تحديد كل الصلاحيات</span>
                </>
              ) : (
                <>
                  <CheckSquare className="w-3.5 h-3.5 shrink-0" />
                  <span>منح كافة الصلاحيات ({totalCount})</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
