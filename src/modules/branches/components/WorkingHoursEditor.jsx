/* eslint-disable react-refresh/only-export-components */
import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { Button } from '../../../shared/components/Button.jsx';
import { StatusPill } from '../../../shared/components/StatusPill.jsx';
import { Clock, Copy, Save, CheckCircle2, AlertCircle } from 'lucide-react';

const TIME_REGEX = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

export const singleWorkingHourSchema = z.object({
  day: z.enum(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']),
  openTime: z.string().regex(TIME_REGEX, 'صيغة الوقت يجب أن تكون HH:mm (مثال 09:00)'),
  closeTime: z.string().regex(TIME_REGEX, 'صيغة الوقت يجب أن تكون HH:mm (مثال 23:00)'),
  isOpen: z.boolean().default(true),
});

export const workingHoursSchema = z.array(singleWorkingHourSchema).length(7);

// Egyptian Order (Saturday -> Friday) mapped to backend Enum ('SAT', 'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI')
export const EGYPTIAN_WEEK_DAYS = [
  { dayKey: 'SAT', labelAr: 'السبت' },
  { dayKey: 'SUN', labelAr: 'الأحد' },
  { dayKey: 'MON', labelAr: 'الإثنين' },
  { dayKey: 'TUE', labelAr: 'الثلاثاء' },
  { dayKey: 'WED', labelAr: 'الأربعاء' },
  { dayKey: 'THU', labelAr: 'الخميس' },
  { dayKey: 'FRI', labelAr: 'الجمعة' },
];

const DEFAULT_SCHEDULE = EGYPTIAN_WEEK_DAYS.map(({ dayKey }) => ({
  day: dayKey,
  openTime: '09:00',
  closeTime: '23:00',
  isOpen: true,
}));

export const WorkingHoursEditor = ({ initialData = [], onSave, isLoading = false }) => {
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);
  const [validationError, setValidationError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (Array.isArray(initialData) && initialData.length > 0) {
      // Map initialData into Egyptian Order
      const mapped = EGYPTIAN_WEEK_DAYS.map(({ dayKey }) => {
        const found = initialData.find((item) => item.day === dayKey);
        return (
          found || {
            day: dayKey,
            openTime: '09:00',
            closeTime: '23:00',
            isOpen: true,
          }
        );
      });
      setSchedule(mapped);
    }
  }, [initialData]);

  const handleFieldChange = (dayKey, field, value) => {
    setValidationError(null);
    setSuccessMessage(null);
    setSchedule((prev) =>
      prev.map((item) => (item.day === dayKey ? { ...item, [field]: value } : item))
    );
  };

  const handleCopyScheduleToAll = (sourceDayKey) => {
    const sourceDay = schedule.find((item) => item.day === sourceDayKey);
    if (!sourceDay) return;

    setSchedule((prev) =>
      prev.map((item) => ({
        ...item,
        openTime: sourceDay.openTime,
        closeTime: sourceDay.closeTime,
        isOpen: sourceDay.isOpen,
      }))
    );
    setSuccessMessage(`تم نسخ مواعيد يوم (${EGYPTIAN_WEEK_DAYS.find(d => d.dayKey === sourceDayKey)?.labelAr}) لجميع أسبوع العمل.`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError(null);
    setSuccessMessage(null);

    const validation = workingHoursSchema.safeParse(schedule);
    if (!validation.success) {
      const msg = validation.error.errors[0]?.message || 'برجاء التأكد من صيغة الأوقات HH:mm';
      setValidationError(msg);
      return;
    }

    try {
      await onSave(schedule);
      setSuccessMessage('تم حفظ مواعيد العمل الأسبوعية بنجاح.');
    } catch (err) {
      setValidationError(err?.message || 'حدث خطأ أثناء حفظ مواعيد العمل.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-txt-primary flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-primary" />
            <span>جدول مواعيد عمل الفرع الأسبوعي</span>
          </h3>
          <p className="text-xs text-txt-muted mt-0.5">
            تحديد مواعيد الفتح والإغلاق لكل يوم في الأسبوع (صيغة HH:mm)
          </p>
        </div>

        <Button type="submit" variant="primary" size="sm" isLoading={isLoading} icon={Save}>
          حفظ الجدول
        </Button>
      </div>

      {validationError && (
        <div className="p-3 rounded-md text-xs font-medium bg-status-danger-bg text-status-danger border border-status-danger/30 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3 rounded-md text-xs font-medium bg-status-success-bg text-status-success border border-status-success/30 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="divide-y divide-border-subtle bg-bg-surface border border-border-default rounded-lg overflow-hidden">
        {EGYPTIAN_WEEK_DAYS.map(({ dayKey, labelAr }) => {
          const item = schedule.find((s) => s.day === dayKey) || {
            day: dayKey,
            openTime: '09:00',
            closeTime: '23:00',
            isOpen: true,
          };

          return (
            <div
              key={dayKey}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-bg-surface-elevated/30 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-[120px]">
                <input
                  type="checkbox"
                  id={`day-toggle-${dayKey}`}
                  checked={item.isOpen}
                  onChange={(e) => handleFieldChange(dayKey, 'isOpen', e.target.checked)}
                  className="w-4 h-4 rounded border-border-default text-brand-primary focus:ring-brand-primary cursor-pointer"
                />
                <label
                  htmlFor={`day-toggle-${dayKey}`}
                  className="text-xs font-bold text-txt-primary cursor-pointer select-none"
                >
                  {labelAr}
                </label>
                <StatusPill status={item.isOpen ? 'success' : 'neutral'} className="text-[10px]">
                  {item.isOpen ? 'مفتوح' : 'مغلق'}
                </StatusPill>
              </div>

              {item.isOpen ? (
                <div className="flex items-center gap-2 flex-1 justify-center max-w-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-txt-muted">من:</span>
                    <input
                      type="text"
                      value={item.openTime}
                      onChange={(e) => handleFieldChange(dayKey, 'openTime', e.target.value)}
                      placeholder="09:00"
                      maxLength={5}
                      className="w-20 bg-bg-base border border-border-default rounded px-2 py-1 text-center text-xs text-txt-primary font-mono focus-visible:outline-none focus-visible:border-brand-primary"
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-txt-muted">إلى:</span>
                    <input
                      type="text"
                      value={item.closeTime}
                      onChange={(e) => handleFieldChange(dayKey, 'closeTime', e.target.value)}
                      placeholder="23:00"
                      maxLength={5}
                      className="w-20 bg-bg-base border border-border-default rounded px-2 py-1 text-center text-xs text-txt-primary font-mono focus-visible:outline-none focus-visible:border-brand-primary"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-xs text-txt-muted italic flex-1 text-center">
                  عطلة أسبوعية / مغلق طوال اليوم
                </div>
              )}

              <div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopyScheduleToAll(dayKey)}
                  title="نسخ مواعيد هذا اليوم لباقي أيام الأسبوع"
                  icon={Copy}
                  className="text-[11px]"
                >
                  نسخ لباقي الأيام
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </form>
  );
};
