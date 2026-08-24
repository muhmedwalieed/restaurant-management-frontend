/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect } from 'react';
import { z } from 'zod';
import { Button } from '../../../shared/components/Button.jsx';
import { Select } from '../../../shared/components/Select.jsx';
import { Toggle } from '../../../shared/components/Toggle.jsx';
import { useAutoDismiss } from '../../../shared/hooks/useAutoDismiss.js';
import {
  Clock,
  Save,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const TIME_REGEX = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

export const singleWorkingHourSchema = z.object({
  day: z.enum(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']),
  openTime: z.string().regex(TIME_REGEX, 'صيغة الوقت يجب أن تكون HH:mm (مثال 09:00)'),
  closeTime: z.string().regex(TIME_REGEX, 'صيغة الوقت يجب أن تكون HH:mm (مثال 23:00)'),
  isOpen: z.boolean().default(true),
});

export const workingHoursSchema = z.array(singleWorkingHourSchema).length(7);

const WEEK_DAYS = [
  { dayKey: 'SAT', labelAr: 'السبت' },
  { dayKey: 'SUN', labelAr: 'الأحد' },
  { dayKey: 'MON', labelAr: 'الإثنين' },
  { dayKey: 'TUE', labelAr: 'الثلاثاء' },
  { dayKey: 'WED', labelAr: 'الأربعاء' },
  { dayKey: 'THU', labelAr: 'الخميس' },
  { dayKey: 'FRI', labelAr: 'الجمعة' },
];

const DEFAULT_SCHEDULE = WEEK_DAYS.map(({ dayKey }) => ({
  day: dayKey,
  openTime: '09:00',
  closeTime: '23:00',
  isOpen: true,
}));

const TIMEZONE_OPTIONS = [
  { value: 'Africa/Cairo', label: 'القاهرة (Africa/Cairo - UTC+2/3)' },
  { value: 'Asia/Riyadh', label: 'الرياض (Asia/Riyadh - UTC+3)' },
  { value: 'Asia/Dubai', label: 'دبي (Asia/Dubai - UTC+4)' },
  { value: 'UTC', label: 'التوقيت العالمي (UTC)' },
];

const timeInputClass =
  'w-24 bg-bg-base border border-border-default rounded-md py-2 pl-2 pr-8 text-center text-xs text-txt-primary font-mono focus-visible:outline-none focus-visible:border-brand-primary disabled:opacity-40 disabled:cursor-not-allowed';

export const WorkingHoursEditor = ({
  initialData = [],
  onSave,
  isLoading = false,
  timezone = 'Africa/Cairo',
  onTimezoneChange,
}) => {
  const [mode, setMode] = useState('custom'); // '247' | 'custom'
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);
  const [validationError, setValidationError] = useState(null);
  const [successMessage, setSuccessMessage] = useAutoDismiss();

  const is247 = mode === '247';

  const timezoneOptions = TIMEZONE_OPTIONS.some((o) => o.value === timezone)
    ? TIMEZONE_OPTIONS
    : [{ value: timezone, label: timezone }, ...TIMEZONE_OPTIONS];

  useEffect(() => {
    if (Array.isArray(initialData) && initialData.length > 0) {
      const mapped = WEEK_DAYS.map(({ dayKey }) => {
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

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    if (nextMode === '247') {
      setSchedule(
        WEEK_DAYS.map(({ dayKey }) => ({
          day: dayKey,
          openTime: '00:00',
          closeTime: '23:59',
          isOpen: true,
        }))
      );
    }
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
      setSuccessMessage('تم حفظ ساعات العمل بنجاح.');
    } catch (err) {
      setValidationError(err?.message || 'حدث خطأ أثناء حفظ ساعات العمل.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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

      {/* Time zone & mode */}
          <div className="space-y-4">
            <div className="max-w-sm">
              <label className="block text-xs font-medium text-txt-primary mb-1.5">
                المنطقة الزمنية
              </label>
              <Select
                options={timezoneOptions}
                value={timezone}
                onChange={(e) => onTimezoneChange?.(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="radio"
                  name="hours-mode"
                  checked={is247}
                  onChange={() => handleModeChange('247')}
                  className="w-4 h-4 accent-[var(--color-primary)] cursor-pointer"
                />
                <span className="text-xs text-txt-primary">Operates 24/7</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="radio"
                  name="hours-mode"
                  checked={!is247}
                  onChange={() => handleModeChange('custom')}
                  className="w-4 h-4 accent-[var(--color-primary)] cursor-pointer"
                />
                <span className="text-xs text-txt-primary">مخصص (Custom)</span>
              </label>
            </div>
          </div>

          {/* Working days table */}
          <div
            className={`overflow-x-auto bg-bg-surface border border-border-default rounded-lg ${
              is247 ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            <table className="w-full min-w-[560px] text-right text-xs">
              <thead>
                <tr className="bg-bg-base text-txt-muted border-b border-border-default">
                  <th className="w-14 px-4 py-3 font-semibold text-center">تفعيل</th>
                  <th className="w-32 px-4 py-3 font-semibold">اليوم</th>
                  <th className="px-4 py-3 font-semibold text-center">ساعة البداية</th>
                  <th className="px-4 py-3 font-semibold text-center">ساعة النهاية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {WEEK_DAYS.map(({ dayKey, labelAr }) => {
                  const item = schedule.find((s) => s.day === dayKey) || {
                    day: dayKey,
                    openTime: '09:00',
                    closeTime: '23:00',
                    isOpen: true,
                  };

                  return (
                    <tr key={dayKey} className="hover:bg-bg-surface-elevated/30 transition-colors">
                      <td className="px-4 py-3 text-center">
                        <Toggle
                          checked={item.isOpen}
                          onChange={(v) => handleFieldChange(dayKey, 'isOpen', v)}
                          label={`تفعيل ${labelAr}`}
                          disabled={is247}
                        />
                      </td>

                      <td className="px-4 py-3 font-bold text-txt-primary whitespace-nowrap">
                        {labelAr}
                      </td>

                      <td className="px-4 py-3">
                        <div className="relative mx-auto w-fit">
                          <Clock className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-muted pointer-events-none" />
                          <input
                            type="text"
                            value={item.openTime}
                            onChange={(e) => handleFieldChange(dayKey, 'openTime', e.target.value)}
                            placeholder="09:00"
                            maxLength={5}
                            disabled={!item.isOpen || is247}
                            aria-label={`${labelAr}، ساعة البداية`}
                            className={timeInputClass}
                          />
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="relative mx-auto w-fit">
                          <Clock className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-muted pointer-events-none" />
                          <input
                            type="text"
                            value={item.closeTime}
                            onChange={(e) => handleFieldChange(dayKey, 'closeTime', e.target.value)}
                            placeholder="23:00"
                            maxLength={5}
                            disabled={!item.isOpen || is247}
                            aria-label={`${labelAr}، ساعة النهاية`}
                            className={timeInputClass}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

      <div className="flex items-center justify-end pt-4 border-t border-border-subtle">
        <Button type="submit" variant="primary" size="sm" isLoading={isLoading} icon={Save}>
          حفظ
        </Button>
      </div>
    </form>
  );
};