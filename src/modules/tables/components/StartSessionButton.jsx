import { useState } from 'react';
import { Button } from '../../../shared/components/Button.jsx';
import { Modal } from '../../../shared/components/Modal.jsx';
import { PermissionGate } from '../../../shared/components/PermissionGate.jsx';
import { useStartTableSession } from '../hooks/useTableSessions.js';
import { KeyRound, Copy, Check } from 'lucide-react';

/**
 * One-click "start table session" that reveals the 4-digit PIN in a modal.
 * Uses the table id (or its QR token).
 */
export const StartSessionButton = ({ tableId, tableLabel, compact = false }) => {
  const [pin, setPin] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const mutation = useStartTableSession();

  const handleStart = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await mutation.mutateAsync(tableId);
      setPin(res.pin);
    } catch (err) {
      setError(err?.message || 'تعذر بدء الجلسة.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pin || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* ignore */ }
  };

  return (
    <>
      <PermissionGate permission="orders.create">
        <Button
          size="sm"
          variant="outline"
          icon={KeyRound}
          isLoading={loading}
          onClick={handleStart}
          className="border-white/10 hover:bg-white/[0.06] text-xs"
          title="بدء جلسة طلب ذاتي وتوليد PIN"
        >
          {compact ? 'بدء جلسة' : 'بدء جلسة'}
        </Button>
      </PermissionGate>

      {error && <p className="text-[11px] text-status-danger mt-1">{error}</p>}

      <Modal isOpen={Boolean(pin)} onClose={() => setPin(null)} title={`PIN جلسة الطاولة ${tableLabel || ''}`} size="sm">
        <div className="text-center space-y-4 py-2">
          <p className="text-xs text-txt-muted">
            أعطِ هذا الرمز للعميل ليدخل الجلسة من الـ QR ويبدأ الطلب الذاتي.
          </p>
          <div className="text-4xl font-bold tracking-[0.4em] text-brand-primary font-mono" dir="ltr">
            {pin}
          </div>
          <div className="flex items-center justify-center gap-2">
            <Button size="sm" variant="outline" icon={copied ? Check : Copy} onClick={handleCopy}>
              {copied ? 'تم النسخ' : 'نسخ الرمز'}
            </Button>
            <Button size="sm" variant="primary" onClick={() => setPin(null)}>
              تمام
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default StartSessionButton;