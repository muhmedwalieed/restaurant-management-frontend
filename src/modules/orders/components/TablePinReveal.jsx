import React, { useEffect, useState, useCallback } from 'react';
import { Eye, EyeOff, Printer, Loader2, Lock, Unlock } from 'lucide-react';
import { getTableSessionPinApi } from '../../../lib/api/table-sessions.api.js';
import { useResetTablePinLockout } from '../../tables/hooks/useTableSessions.js';
import { toast } from '../../../shared/context/ToastContext.jsx';
import { printTablePinReceipt } from '../../tables/utils/tableThermalPrinting.js';
import { useBranch } from '../../auth/context/BranchContext.jsx';

/**
 * Shows the table's entry PIN when staff already has it (a session just opened or
 * the PIN was regenerated), lets them reveal it on demand otherwise, and surfaces
 * the wrong-PIN lockout with a one-tap reset for waiters and cashiers.
 *
 * The PIN comes from a staff-only endpoint; it is never part of the public
 * session payload the guest app receives.
 */
export const TablePinReveal = ({ table, session, onPrintPin }) => {
  const { activeBranch } = useBranch();
  const [revealedPin, setRevealedPin] = useState(null);
  const [isPinVisible, setIsPinVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const resetLockout = useResetTablePinLockout();

  useEffect(() => {
    setRevealedPin(null);
    setIsPinVisible(false);
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
    try {
      const res = await getTableSessionPinApi(table.id);
      setRevealedPin(res?.pin || null);
      setIsPinVisible(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'تعذر جلب رمز الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  const defaultPrint = useCallback((targetTable, pin) => {
    printTablePinReceipt({
      branchName: activeBranch?.name || '',
      displayNum: targetTable.displayNum,
      pin,
    });
  }, [activeBranch]);

  const printHandler = onPrintPin || defaultPrint;

  const handlePrint = async () => {
    if (!table?.id) return;

    if (activePin) {
      printHandler(table, activePin);
      return;
    }

    setIsPrinting(true);
    try {
      const res = await getTableSessionPinApi(table.id);
      if (res?.pin) {
        setRevealedPin(res.pin);
        printHandler(table, res.pin);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'تعذر جلب رمز الدخول للطباعة');
    } finally {
      setIsPrinting(false);
    }
  };

  const handleReset = async () => {
    if (!table?.id) return;
    try {
      await resetLockout.mutateAsync(table.id);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'تعذر إعادة تعيين المحاولات');
    }
  };

  // LTR so the group reads PIN: 1548 👁 from the left
  return (
    <span
      dir="ltr"
      className="flex items-center justify-end gap-1.5 min-w-0 whitespace-nowrap"
    >
      <span className="text-[10px] shrink-0 leading-none text-zinc-400 dark:text-zinc-500 font-bold">
        PIN:
      </span>

      {isPinVisible && activePin ? (
        <span className="font-mono font-bold text-xs leading-none tracking-wider text-zinc-900 dark:text-zinc-100">
          {activePin}
        </span>
      ) : (
        <span
          className="font-mono font-bold text-xs leading-none tracking-wider translate-y-[1px] text-zinc-400 dark:text-zinc-500"
        >
          ****
        </span>
      )}

      {/* Toggles the PIN in and out of view */}
      <button
        type="button"
        onClick={handleReveal}
        disabled={isLoading || isPrinting}
        aria-label={isPinVisible ? 'إخفاء رمز الدخول' : 'إظهار رمز الدخول'}
        title={isPinVisible ? 'إخفاء رمز الدخول' : 'إظهار رمز الدخول'}
        className="w-6 h-6 rounded-md inline-flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 size={12} className="animate-spin" />
        ) : isPinVisible ? (
          <EyeOff size={13} />
        ) : (
          <Eye size={13} />
        )}
      </button>

      {/* Print PIN ticket button — always visible */}
      <button
        type="button"
        onClick={handlePrint}
        disabled={isLoading || isPrinting}
        className="w-6 h-6 rounded-md inline-flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
        title="طباعة تذكرة رمز الدخول"
        aria-label="طباعة تذكرة رمز الدخول"
      >
        {isPrinting ? <Loader2 size={12} className="animate-spin" /> : <Printer size={13} />}
      </button>

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
    </span>
  );
};

export default TablePinReveal;
