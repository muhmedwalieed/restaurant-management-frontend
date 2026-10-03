import React from 'react';
import { X, QrCode } from 'lucide-react';
import { WaiterAvailableTableState } from './WaiterAvailableTableState.jsx';
import { WaiterActiveSessionView } from './WaiterActiveSessionView.jsx';
import { formatTableLabel } from '../../../tables/utils/tableLabel.js';

export const WaiterTableDetailPanel = ({
  table,
  onClose,
  onOpenSession,
  isStartingSession,
  onDismissCall,
  onOpenReviewModal,
  onOpenAddItemDrawer,
  onOpenBillModal,
  onCloseSession,
  isClosingSession,
  onShowQr,
}) => {
  if (!table) return null;

  return (
    <>
      {/* Below `sm` the panel becomes a slide-over drawer with a scrim */}
      <div
        className="fixed inset-0 z-30 bg-black/50 sm:hidden"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className="fixed inset-y-0 left-0 z-40 w-full max-w-sm shrink-0 flex flex-col overflow-hidden border-r h-full sm:static sm:z-auto sm:w-80"
        style={{ background: 'var(--s1)', borderColor: 'var(--bd)' }}
      >
      {/* Panel Header */}
      <div
        className="flex items-center justify-between px-4 h-14 shrink-0 border-b"
        style={{ borderColor: 'var(--bd)' }}
      >
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--t1)' }}>
            {formatTableLabel(table.displayNum)}
          </p>
          <p className="text-xs" style={{ color: 'var(--t3)' }}>
            {table.capacity} كراسي {table.section ? `— قسم ${table.section}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {onShowQr && (
            <button
              type="button"
              onClick={() => onShowQr(table)}
              className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              style={{ color: 'var(--t3)' }}
              title="عرض رمز QR للطاولة"
            >
              <QrCode size={15} />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            style={{ color: 'var(--t3)' }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Body: Available vs Occupied */}
      {table.status === 'available' ? (
        <WaiterAvailableTableState
          table={table}
          onOpenSession={onOpenSession}
          isStartingSession={isStartingSession}
        />
      ) : (
        <WaiterActiveSessionView
          table={table}
          onDismissCall={onDismissCall}
          onOpenReviewModal={onOpenReviewModal}
          onOpenAddItemDrawer={onOpenAddItemDrawer}
          onOpenBillModal={onOpenBillModal}
          onCloseSession={onCloseSession}
          isClosingSession={isClosingSession}
        />
      )}
      </aside>
    </>
  );
};
