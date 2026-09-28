import { useState, useMemo, useCallback } from 'react';
import { useBranch } from '../../auth/context/BranchContext.jsx';
import { useTableGridState } from '../../tables/hooks/useTableGridState.js';
import { printTablePinReceipt, printTableBillReceipt } from '../../tables/utils/tableThermalPrinting.js';
import { PosTableCard } from './pos-tables/PosTableCard.jsx';
import { PosTableQrModal } from './pos-tables/PosTableQrModal.jsx';
import { PosTableSidebarDrawer } from './pos-tables/PosTableSidebarDrawer.jsx';
import { PosTablesStatsBar } from './pos-tables/PosTablesStatsBar.jsx';

export const PosTablesView = ({ onSelectTableForOrder }) => {
  const { activeBranchId, activeBranch } = useBranch();
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [qrModalTable, setQrModalTable] = useState(null);
  const [isClosingSession, setIsClosingSession] = useState(false);

  const {
    tables,
    rawOrders,
    tableOrderMap,
    refetchAll,
    closeSessionMutation,
    dismissCallMutation,
    updateTableMutation,
    paymentMutation,
  } = useTableGridState(activeBranchId);

  const selectedTable = useMemo(
    () => tables.find((t) => t.id === selectedTableId) || null,
    [tables, selectedTableId]
  );

  const occupiedCount = useMemo(
    () => tables.filter((t) => t.status === 'occupied').length,
    [tables]
  );
  const availableCount = useMemo(
    () => tables.filter((t) => t.status === 'available').length,
    [tables]
  );

  // Print handlers using shared thermal print utility
  const handlePrintPin = useCallback((table, pin) => {
    printTablePinReceipt({
      branchName: activeBranch?.name || 'مطعمنا',
      displayNum: table.displayNum,
      pin,
    });
  }, [activeBranch]);

  const handlePrintBill = useCallback((table) => {
    printTableBillReceipt({
      branchName: activeBranch?.name || 'مطعمنا',
      displayNum: table.displayNum,
      items: table.session?.items || [],
      total: table.session?.total || 0,
      currency: activeBranch?.settings?.currency || 'ج.م',
    });
  }, [activeBranch]);

  // Settle and close
  const handleSettleAndClose = async (table) => {
    if (!table) return;
    setIsClosingSession(true);
    const session = table?.session;
    const tid = table?.id || table?.tableId || table?._id;
    const orderId = session?.activeOrder?.id || (tid ? tableOrderMap.get(tid)?.id : null);
    const total = session?.total || 0;

    try {
      if (orderId) {
        const matchedOrder = rawOrders.find((o) => o.id === orderId);
        const amountToPay = matchedOrder ? Number(matchedOrder.total) : total;

        if (matchedOrder?.paymentStatus !== 'PAID') {
          try {
            await paymentMutation.mutateAsync({
              branchId: activeBranchId,
              orderId,
              payload: {
                amount: amountToPay > 0 ? amountToPay : total,
                paymentMethod: 'CASH',
              },
            });
          } catch (payErr) {
            console.warn('Payment recording note:', payErr);
          }
        }
      }

      if (session?.dbSessionId) {
        await closeSessionMutation.mutateAsync({
          sessionId: session.dbSessionId,
          payload: { settlePayment: true, paymentMethod: 'CASH' },
        });
      }

      if (tid) {
        try {
          await updateTableMutation.mutateAsync({
            branchId: activeBranchId,
            id: tid,
            tableId: tid,
            payload: { status: 'AVAILABLE' },
          });
        } catch (_tableErr) {
          // backend closeSession may have already updated table status
        }
      }

      setSelectedTableId(null);
      await refetchAll();
      alert('تم تأكيد السداد وإغلاق الطاولة بنجاح');
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || 'تعذر إغلاق الجلسة');
    } finally {
      setIsClosingSession(false);
    }
  };

  const handleDismissCall = async (sessionId, callType) => {
    try {
      await dismissCallMutation.mutateAsync({
        sessionId,
        payload: { callType },
      });
      await refetchAll();
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || 'تعذر تأكيد الحضور');
    }
  };

  return (
    <div className="h-full w-full flex overflow-hidden select-none" dir="rtl" style={{ background: 'var(--bg)' }}>
      {/* Tables Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <PosTablesStatsBar
          occupiedCount={occupiedCount}
          availableCount={availableCount}
        />

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))' }}
          >
            {tables.map((t) => (
              <PosTableCard
                key={t.id}
                table={t}
                isSelected={selectedTableId === t.id}
                onSelect={(tbl) => setSelectedTableId(tbl.id)}
                onShowQr={(tbl) => setQrModalTable(tbl)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Selected Table Drawer */}
      <PosTableSidebarDrawer
        table={selectedTable}
        onClose={() => setSelectedTableId(null)}
        onPrintPin={handlePrintPin}
        onPrintBill={handlePrintBill}
        onSelectTableForOrder={onSelectTableForOrder}
        onDismissCall={handleDismissCall}
        onSettleAndClose={handleSettleAndClose}
        isClosingSession={isClosingSession}
        currency={activeBranch?.settings?.currency || 'ج.م'}
      />

      {/* QR Code Modal */}
      <PosTableQrModal
        isOpen={Boolean(qrModalTable)}
        onClose={() => setQrModalTable(null)}
        table={qrModalTable}
        activeBranch={activeBranch}
      />
    </div>
  );
};

export default PosTablesView;
