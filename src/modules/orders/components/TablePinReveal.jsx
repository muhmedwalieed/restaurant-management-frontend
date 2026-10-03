import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, Printer, Loader2, Lock, Unlock } from 'lucide-react';
import { getTableSessionPinApi } from '../../../lib/api/table-sessions.api.js';
import { useResetTablePinLockout } from '../../tables/hooks/useTableSessions.js';

/**
 * Shows the table's entry PIN when staff already has it (a session just opened or
 * the PIN was regenerated), lets them reveal it on demand otherwise, and surfaces
 * the wrong-PIN lockout with a one-tap reset for waiters and cashiers.
 *
 * The PIN comes from a staff-only endpoint; it is never part of the public
 * session payload the guest app receives.
 */
export const TablePinReveal = ({ table, session, onPrintPin }) => {
  const [revealedPin, setRevealedPin] = useState(null);
  const [isPinVisible, setIsPinVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const resetLockout = useResetTablePinLockout();

  useEffect(() => {
    setRevealedPin(null);
    setIsPinVisible(false);
    setError(null);
  }, [table?.id]);

  const isLocked = Boolean(session?.isPinLocked);
  const activePin = session?.pin || revealedPin;
  const lockoutUntil = session?.pinLockoutUntil ? new Date(session.pinLockoutUntil) : null;

  const handleReveal = async () => {
    if (!table?.id) return;

    // Already know the value: just toggle it in and out of view.
    if (activePin) {
      setIsPinVisible((visible) => !visible);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await getTableSessionPinApi(table.id);
      setRevealedPin(res?.pin || null);
      setIsPinVisible(true);
    } catch (err) {
      setError(err?.message || 'تعذر جلب رمز الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    if (!table?.id) return;
    setError(null);
    try {
      await resetLockout.mutateAsync(table.id);
    } catch (err) {
      setError(err?.message || 'تعذر إعادة تعيين المحاولات');
    }
  };

  // LTR so the group reads PIN: 1548 👁 from the left
  return (
    <span
      dir="ltr"
      className="flex items-center justify-end gap-1.5 min-w-0 whitespace-nowrap"
    >
      <span className="text-[10px] shrink-0 leading-none" style={{ color: 'var(--t3)' }}>
        PIN:
      </span>

      {isPinVisible && activePin ? (
        <span className="mono font-bold text-xs leading-none tracking-wider" style={{ color: 'var(--ac)' }}>
          {activePin}
        </span>
      ) : (
        <span
          className="mono font-bold text-xs leading-none tracking-wider translate-y-[1px]"
          style={{ color: 'var(--t3)' }}
        >
          ****
        </span>
      )}

      {/* Toggles the PIN in and out of view */}
      <button
        type="button"
        onClick={handleReveal}
        disabled={isLoading}
        aria-label={isPinVisible ? 'إخفاء رمز الدخول' : 'إظهار رمز الدخول'}
        title={isPinVisible ? 'إخفاء رمز الدخول' : 'إظهار رمز الدخول'}
        className="w-6 h-6 rounded-md inline-flex items-center justify-center transition-opacity hover:opacity-80 cursor-pointer disabled:opacity-50"
        style={{ background: 'var(--s3)', border: '1px solid var(--bd)', color: 'var(--ac)' }}
      >
        {isLoading ? (
          <Loader2 size={12} className="animate-spin" />
        ) : isPinVisible ? (
          <EyeOff size={12} />
        ) : (
          <Eye size={12} />
        )}
      </button>

      {onPrintPin && activePin && (
        <button
          type="button"
          onClick={() => onPrintPin(table, activePin)}
          className="p-1 rounded transition-opacity hover:opacity-70 cursor-pointer"
          style={{ color: 'var(--t3)' }}
          title="طباعة تذكرة رمز الدخول"
        >
          <Printer size={12} />
        </button>
      )}

      {isLocked && (
        <>
          <span
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[10px] font-bold shrink-0"
            style={{ background: 'var(--err-bg)', color: 'var(--err)' }}
            title={
              lockoutUntil
                ? `مقفولة لحد ${lockoutUntil.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}`
                : 'الطاولة مقفولة مؤقتًا بسبب محاولات غلط'
            }
          >
            <Lock size={10} />
            مقفولة
          </span>
          <button
            type="button"
            onClick={handleReset}
            disabled={resetLockout.isPending}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer disabled:opacity-50"
            style={{ borderColor: 'var(--bd)', color: 'var(--ac)' }}
            title="إعادة تعيين محاولات رمز الدخول لهذه الطاولة"
          >
            {resetLockout.isPending ? <Loader2 size={10} className="animate-spin" /> : <Unlock size={10} />}
            <span>فتح القفل</span>
          </button>
        </>
      )}

      {error && (
        <span className="text-[10px] truncate min-w-0" style={{ color: 'var(--err)' }}>
          {error}
        </span>
      )}
    </span>
  );
};

export default TablePinReveal;
