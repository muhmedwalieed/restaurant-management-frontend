import React from 'react';
import { Toggle } from '../../../shared/components/Toggle.jsx';
import { Clock } from 'lucide-react';

const timeInputClass =
  'w-24 bg-bg-base border border-border-default rounded-md py-2 pl-2 pr-8 text-center text-xs text-txt-primary font-mono focus-visible:outline-none focus-visible:border-brand-primary disabled:opacity-40 disabled:cursor-not-allowed';

export const WorkingHourDayRow = ({
  dayKey,
  labelAr,
  item,
  is247,
  onFieldChange,
}) => {
  return (
    <tr key={dayKey} className="hover:bg-bg-surface-elevated/30 transition-colors">
      <td className="px-4 py-3 text-center">
        <Toggle
          checked={item.isOpen}
          onChange={(v) => onFieldChange(dayKey, 'isOpen', v)}
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
            onChange={(e) => onFieldChange(dayKey, 'openTime', e.target.value)}
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
            onChange={(e) => onFieldChange(dayKey, 'closeTime', e.target.value)}
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
};
