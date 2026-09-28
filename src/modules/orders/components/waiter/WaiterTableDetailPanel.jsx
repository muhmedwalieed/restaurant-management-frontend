import React from 'react';
import { X } from 'lucide-react';
import { WaiterAvailableTableState } from './WaiterAvailableTableState.jsx';
import { WaiterActiveSessionView } from './WaiterActiveSessionView.jsx';

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
  onPrintPin,
  isClosingSession,
}) => {
  if (!table) return null;

  return (
    <aside
      className="w-full sm:w-80 shrink-0 flex flex-col overflow-hidden border-r select-none h-full"
      style={{ background: 'var(--s1)', borderColor: 'var(--bd)' }}
    >
      {/* Panel Header */}
      <div
        className="flex items-center justify-between px-4 h-14 shrink-0 border-b"
        style={{ borderColor: 'var(--bd)' }}
      >
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--t1)' }}>
            طاولة {table.displayNum}
          </p>
          <p className="text-xs" style={{ color: 'var(--t3)' }}>
            {table.capacity} كراسي {table.section ? `— قسم ${table.section}` : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          style={{ color: 'var(--t3)' }}
        >
          <X size={16} />
        </button>
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
          onPrintPin={onPrintPin}
          isClosingSession={isClosingSession}
        />
      )}
    </aside>
  );
};
