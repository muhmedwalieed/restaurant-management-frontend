import { useState } from 'react';
import { Button } from '../../../shared/components/Button.jsx';
import { Modal } from '../../../shared/components/Modal.jsx';
import { StatusPill } from '../../../shared/components/StatusPill.jsx';
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton.jsx';
import { PermissionGate } from '../../../shared/components/PermissionGate.jsx';
import {
  useStartTableSession,
  useActiveTableSessionQuery,
  useConfirmTableSession,
  useCloseTableSession,
  useUpdateSessionItem,
  useRemoveSessionItem,
} from '../hooks/useTableSessions.js';
import { KeyRound, Users, CheckCircle2, XCircle, Plus, Minus, Trash2 } from 'lucide-react';

const SESSION_STATUS = {
  ACTIVE: { pill: 'warning', label: 'جلسة نشطة' },
  AWAITING_CONFIRMATION: { pill: 'info', label: 'بانتظار تأكيد الويتر' },
  CONFIRMED: { pill: 'success', label: 'تم تأكيد الطلب' },
  CLOSED: { pill: 'neutral', label: 'مغلقة' },
};

export const TableSessionPanel = ({ tableId }) => {
  const [showPin, setShowPin] = useState(null);
  const [startError, setStartError] = useState(null);
  const [startLoading, setStartLoading] = useState(false);

  const startMutation = useStartTableSession();
  const { data: session, isLoading } = useActiveTableSessionQuery(tableId, true);
  const confirmMutation = useConfirmTableSession(session?.id);
  const closeMutation = useCloseTableSession(session?.id);
  const updateMutation = useUpdateSessionItem(session?.id);
  const removeMutation = useRemoveSessionItem(session?.id);

  const status = SESSION_STATUS[session?.status] || SESSION_STATUS.ACTIVE;

  const handleStart = async () => {
    setStartError(null);
    setStartLoading(true);
    try {
      const res = await startMutation.mutateAsync(tableId);
      setShowPin(res.pin);
    } catch (err) {
      setStartError(err?.message || 'تعذر بدء الجلسة.');
    } finally {
      setStartLoading(false);
    }
  };

  return (
    <div className="bg-bg-surface border border-border-default rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-brand-primary" />
          <h3 className="text-xs font-bold text-txt-primary">جلسة الطلب الذاتي</h3>
        </div>
        {session && (
          <StatusPill status={status.pill}>{status.label}</StatusPill>
        )}
      </div>

      {isLoading ? (
        <LoadingSkeleton height={80} className="w-full" />
      ) : !session ? (
        <div className="space-y-3">
          <p className="text-xs text-txt-muted">
            ابدأ جلسة للعملاء يجلسوا على الطاولة ويطلبوا بأنفسهم عن طريق الـ QR. هتاخد PIN من 4 أرقام تعطيه للعميل.
          </p>
          {startError && <p className="text-xs text-status-danger">{startError}</p>}
          <PermissionGate permission="orders.create">
            <Button size="sm" icon={KeyRound} isLoading={startLoading} onClick={handleStart}>
              بدء جلسة الطاولة
            </Button>
          </PermissionGate>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-txt-muted">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              الأعضاء: {(session.members || []).map((m) => m.name).join('، ') || '—'}
            </span>
            <span className="font-mono font-bold text-txt-primary">
              {(session.items || []).length} صنف • {Number(session.total || 0).toFixed(2)}
            </span>
          </div>

          {(session.items || []).length > 0 && (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {session.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-2 bg-bg-base/60 border border-border-subtle rounded-lg p-2 text-xs">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-txt-primary truncate">{item.productName}</p>
                    <p className="text-[11px] text-txt-muted">
                      {item.quantity} × {Number(item.unitPrice).toFixed(2)} = {Number(item.total).toFixed(2)}
                    </p>
                    {item.addedByName && (
                      <p className="text-[11px] text-brand-primary">{item.addedByName} أضافها</p>
                    )}
                  </div>
                  {session.status === 'AWAITING_CONFIRMATION' && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => updateMutation.mutate({ itemId: item.id, quantity: Math.max(1, item.quantity - 1) })} className="w-5 h-5 rounded border border-white/10 flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                      <button onClick={() => updateMutation.mutate({ itemId: item.id, quantity: item.quantity + 1 })} className="w-5 h-5 rounded border border-white/10 flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                      <button onClick={() => removeMutation.mutate(item.id)} className="w-5 h-5 rounded hover:text-red-400 flex items-center justify-center"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/[0.06]">
            <PermissionGate permission="orders.create">
              <Button
                size="sm"
                variant="primary"
                icon={CheckCircle2}
                isLoading={confirmMutation.isPending}
                disabled={session.status === 'CONFIRMED' || session.status === 'CLOSED' || (session.items || []).length === 0}
                onClick={() => confirmMutation.mutate()}
                title="مراجعة وتأكيد الطلب (بيتحول لأوردر حقيقي)"
              >
                تأكيد الطلب
              </Button>
              <Button
                size="sm"
                variant="outline"
                icon={XCircle}
                isLoading={closeMutation.isPending}
                onClick={() => closeMutation.mutate()}
              >
                إغلاق الجلسة
              </Button>
            </PermissionGate>
            {session.confirmedOrderId && (
              <span className="text-[11px] text-status-success">أوردر #{session.confirmedOrderId.slice(-4)}</span>
            )}
          </div>
        </div>
      )}

      {/* PIN modal */}
      <Modal isOpen={Boolean(showPin)} onClose={() => setShowPin(null)} title="PIN جلسة الطاولة" size="sm">
        <div className="text-center space-y-4 py-2">
          <p className="text-xs text-txt-muted">أعطِ هذا الرمز للعميل عشان يدخل الجلسة من الـ QR:</p>
          <div className="text-4xl font-bold tracking-[0.4em] text-brand-primary font-mono" dir="ltr">
            {showPin}
          </div>
          <Button variant="primary" onClick={() => setShowPin(null)}>تمام</Button>
        </div>
      </Modal>
    </div>
  );
};

export default TableSessionPanel;