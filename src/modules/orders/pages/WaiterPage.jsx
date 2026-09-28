import React from 'react';
import { useBranch } from '../../auth/context/BranchContext.jsx';
import { useAuth } from '../../auth/context/AuthContext.jsx';
import { WaiterHeader } from '../components/waiter/WaiterHeader.jsx';
import { WaiterTableGrid } from '../components/waiter/WaiterTableGrid.jsx';
import { WaiterTableDetailPanel } from '../components/waiter/WaiterTableDetailPanel.jsx';
import { WaiterReviewOrdersModal } from '../components/waiter/WaiterReviewOrdersModal.jsx';
import { WaiterAddItemDrawer } from '../components/waiter/WaiterAddItemDrawer.jsx';
import { WaiterBillModal } from '../components/waiter/WaiterBillModal.jsx';
import { useWaiterPage } from '../hooks/useWaiterPage.js';

export const WaiterPage = () => {
  const { activeBranchId, activeBranch } = useBranch();
  const { user, logout } = useAuth();

  const {
    tables,
    selectedTable,
    selectedTableId,
    setSelectedTableId,
    statusFilter,
    setStatusFilter,
    selectedSection,
    setSelectedSection,
    totalOccupied,
    totalAlerts,
    reviewTable,
    setReviewTable,
    addItemTable,
    setAddItemTable,
    billTable,
    setBillTable,
    products,
    categories,
    isStartingSession,
    isClosingSession,
    refetchAll,
    confirmSessionMutation,
    createPosOrderMutation,
    handlePrintPin,
    handlePrintBill,
    handleOpenSession,
    handleDismissCall,
    handleConfirmReviewOrder,
    handleRejectReviewOrder,
    handleUpdateReviewItemQty,
    handleRemoveReviewItem,
    handleAddReviewItem,
    handleAddItemsToSession,
    handleSettleAndClose,
    rejectOrderMutation,
  } = useWaiterPage({ activeBranchId, activeBranch, user });

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden select-none" dir="rtl" style={{ background: 'var(--bg)' }}>
      {/* Top Header */}
      <WaiterHeader
        user={user}
        activeBranch={activeBranch}
        totalTables={tables.length}
        occupiedCount={totalOccupied}
        alertsCount={totalAlerts}
        onRefresh={refetchAll}
        onLogout={logout}
      />

      {/* Main Workspace (Table Grid + Detail Panel) */}
      <div className="flex-1 flex overflow-hidden">
        <WaiterTableGrid
          tables={tables}
          selectedTableId={selectedTableId}
          onSelectTable={(t) => setSelectedTableId(t.id)}
          filter={statusFilter}
          onChangeFilter={setStatusFilter}
          selectedSection={selectedSection}
          onChangeSection={setSelectedSection}
        />

        {selectedTable && (
          <WaiterTableDetailPanel
            table={selectedTable}
            onClose={() => setSelectedTableId(null)}
            onOpenSession={handleOpenSession}
            isStartingSession={isStartingSession}
            onDismissCall={handleDismissCall}
            onOpenReviewModal={(t) => setReviewTable(t)}
            onOpenAddItemDrawer={(t) => setAddItemTable(t)}
            onOpenBillModal={(t) => setBillTable(t)}
            onCloseSession={(t) => setBillTable(t)}
            onPrintPin={handlePrintPin}
            isClosingSession={isClosingSession}
          />
        )}
      </div>

      {/* Review Customer QR Order Modal */}
      <WaiterReviewOrdersModal
        isOpen={Boolean(reviewTable)}
        table={reviewTable}
        products={products}
        onClose={() => setReviewTable(null)}
        onConfirmOrder={handleConfirmReviewOrder}
        onRejectOrder={handleRejectReviewOrder}
        onUpdateItemQty={handleUpdateReviewItemQty}
        onRemoveItem={handleRemoveReviewItem}
        onAddItem={handleAddReviewItem}
        isLoading={confirmSessionMutation.isPending}
        isRejecting={rejectOrderMutation?.isPending}
      />

      {/* Quick Add Product Drawer / Modal */}
      <WaiterAddItemDrawer
        isOpen={Boolean(addItemTable)}
        table={addItemTable}
        products={products}
        categories={categories}
        onClose={() => setAddItemTable(null)}
        onAddItemsToSession={handleAddItemsToSession}
        isLoading={createPosOrderMutation.isPending}
      />

      {/* Bill & Settlement Modal */}
      <WaiterBillModal
        isOpen={Boolean(billTable)}
        table={billTable}
        onClose={() => setBillTable(null)}
        onPrintBill={handlePrintBill}
        onSettleBill={handleSettleAndClose}
        isSettling={isClosingSession}
      />
    </div>
  );
};

export default WaiterPage;
