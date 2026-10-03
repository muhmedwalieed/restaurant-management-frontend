import { useState, useMemo, useCallback } from 'react';

import { useBranch } from '../../auth/context/BranchContext.jsx';
import { useTableGridState } from '../../tables/hooks/useTableGridState.js';
import { printTablePinReceipt, printTableBillReceipt } from '../../tables/utils/tableThermalPrinting.js';
import { toast } from '../../../shared/context/ToastContext.jsx';
import { WaiterTableGrid } from './waiter/WaiterTableGrid.jsx';
import { WaiterBillModal } from './waiter/WaiterBillModal.jsx';
import { PosTableSidebarDrawer } from './pos-tables/PosTableSidebarDrawer.jsx';
import { PosTableQrModal } from './pos-tables/PosTableQrModal.jsx';

export const PosTablesView = ({ onSelectTableForOrder }) => {
  const { activeBranchId, activeBranch } = useBranch();
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [billTable, setBillTable] = useState(null);
  const [qrTable, setQrTable] = useState(null);
  const [isClosingSession, setIsClosingSession] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedSection, setSelectedSection] = useState('ALL');

  const {
    tables,
    refetchAll,
    dismissCallMutation,
    settleTable,
  } = useTableGridState(activeBranchId);

  const selectedTable = useMemo(
    () => tables.find((t) => t.id === selectedTableId) || null,
    [tables, selectedTableId]
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

  const handleSettleAndClose = async (table, paymentMethod = 'CASH') => {
    if (!table) return;
    setIsClosingSession(true);
    try {
      await settleTable({ table, branchId: activeBranchId, paymentMethod: paymentMethod || 'CASH' });
      setBillTable(null);
      setSelectedTableId(null);
      await refetchAll();
      toast.success('تم تأكيد السداد وإغلاق الطاولة بنجاح');
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'تعذر إغلاق الجلسة');
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
      toast.success('تم تأكيد الحضور بنجاح');
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'تعذر تأكيد الحضور');
    }
  };

  return (
    <div className="h-full w-full flex overflow-hidden" dir="rtl" style={{ background: 'var(--bg)' }}>
      {/* Tables Grid — identical to the Waiter table management view */}
      <WaiterTableGrid
        tables={tables}
        selectedTableId={selectedTableId}
        onSelectTable={(t) => setSelectedTableId(t.id)}
        filter={statusFilter}
        onChangeFilter={setStatusFilter}
        selectedSection={selectedSection}
        onChangeSection={setSelectedSection}
        onShowQr={(t) => setQrTable(t)}
      />

      {/* Selected Table Drawer */}
      <PosTableSidebarDrawer
        table={selectedTable}
        onClose={() => setSelectedTableId(null)}
        onPrintPin={handlePrintPin}
        onPrintBill={handlePrintBill}
        onSelectTableForOrder={onSelectTableForOrder}
        onDismissCall={handleDismissCall}
        onOpenBillModal={(t) => setBillTable(t)}
        onCloseSession={(t) => setBillTable(t)}
        onShowQr={(t) => setQrTable(t)}
        isClosingSession={isClosingSession}
        currency={activeBranch?.settings?.currency || 'ج.م'}
      />

      {/* Bill & Settlement Modal */}
      <WaiterBillModal
        isOpen={Boolean(billTable)}
        table={billTable}
        onClose={() => setBillTable(null)}
        onSettleBill={handleSettleAndClose}
        isSettling={isClosingSession}
      />

      {/* Table Self-Ordering QR Modal */}
      <PosTableQrModal
        isOpen={Boolean(qrTable)}
        table={qrTable}
        onClose={() => setQrTable(null)}
      />
    </div>
  );
};

export default PosTablesView;
