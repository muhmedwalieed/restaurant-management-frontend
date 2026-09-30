import React from 'react';
import { UtensilsCrossed } from 'lucide-react';

export const WaiterAvailableTableState = ({ table, onOpenSession, isStartingSession }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-5 p-6 text-center">
      <div>
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
          style={{ background: 'var(--ok-bg)', border: '1px solid rgba(22,163,74,.15)' }}
        >
          <UtensilsCrossed size={22} style={{ color: 'var(--ok)' }} />
        </div>
        <p className="text-sm font-semibold">طاولة {table.displayNum} متاحة</p>
        <p className="text-xs mt-1" style={{ color: 'var(--t3)' }}>
          اضغط فتح جلسة لإنشاء جلسة جديدة وطباعة رمز الـ PIN للعميل
        </p>
      </div>

      <button
        type="button"
        disabled={isStartingSession}
        onClick={() => onOpenSession(table.id)}
        className="w-full py-2.5 rounded-xl font-bold text-xs transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
        style={{ background: 'var(--ac)', color: 'var(--ti, #ffffff)' }}
      >
        {isStartingSession ? 'جاري فتح الجلسة...' : 'فتح جلسة الآن'}
      </button>
    </div>
  );
};
