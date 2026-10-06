import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProductsQuery, useCategoriesQuery } from '../../menu/hooks/useMenu.js';
import { useTableGridState } from '../../tables/hooks/useTableGridState.js';
import { useBranch } from '../../auth/context/BranchContext.jsx';
import { useAuth } from '../../auth/context/AuthContext.jsx';
import { useCurrentShiftQuery } from '../hooks/useShifts.js';
import { usePendingHandoversQuery } from '../hooks/useDelivery.js';
import { toast } from '../../../shared/context/ToastContext.jsx';

import { PosNavHeader } from '../components/pos/PosNavHeader.jsx';
import { PosSalesView } from '../components/pos/PosSalesView.jsx';
import { PosOrdersView } from '../components/PosOrdersView.jsx';
import { PosTablesView } from '../components/PosTablesView.jsx';
import { CashierDriverSettlementModal } from '../components/delivery/CashierDriverSettlementModal.jsx';
import { CashierDriverHandoverModal } from '../components/delivery/CashierDriverHandoverModal.jsx';
import { OpenShiftModal } from '../components/shifts/OpenShiftModal.jsx';
import { CloseShiftModal } from '../components/shifts/CloseShiftModal.jsx';
import { CashMovementModal } from '../components/shifts/CashMovementModal.jsx';
import { XReportModal } from '../components/shifts/XReportModal.jsx';
import { ShiftsHistoryModal } from '../components/shifts/ShiftsHistoryModal.jsx';
import { ShiftThermalReceipt } from '../components/shifts/ShiftThermalReceipt.jsx';
import { useCurrency } from '../../../shared/hooks/useCurrency.js';

export const PosPage = () => {
  const navigate = useNavigate();
  const { tab } = useParams();
  const { activeBranchId, activeBranch } = useBranch();
  const { user, logout } = useAuth();
  const { currency } = useCurrency();

  const [pendingTable, setPendingTable] = useState(null);
  const [isSettlementOpen, setIsSettlementOpen] = useState(false);
  const [isHandoverOpen, setIsHandoverOpen] = useState(false);
  const [selectedHandoverOrderId, setSelectedHandoverOrderId] = useState(null);

  // Track notified delivery handover requests
  const notifiedOrderIdsRef = useRef(new Set());
  const isInitialMountRef = useRef(true);

  // Delivery pending handovers query
  const { data: handoversResponse } = usePendingHandoversQuery(activeBranchId);
  const pendingHandovers = useMemo(() => {
    const raw = handoversResponse?.data || handoversResponse || [];
    return Array.isArray(raw) ? raw : [];
  }, [handoversResponse]);

  // Notify cashier gracefully when a new handover request arrives (without blocking modal popup)
  useEffect(() => {
    if (!pendingHandovers || pendingHandovers.length === 0) {
      isInitialMountRef.current = false;
      return;
    }

    if (isInitialMountRef.current) {
      // On initial load, record existing IDs without triggering noisy toasts
      pendingHandovers.forEach((o) => notifiedOrderIdsRef.current.add(o.id));
      isInitialMountRef.current = false;
      return;
    }

    // Check for any newly arrived handover orders
    pendingHandovers.forEach((order) => {
      if (!notifiedOrderIdsRef.current.has(order.id)) {
        notifiedOrderIdsRef.current.add(order.id);
        toast.info(
          `طلب استلام أوردر #${order.orderNumber} من الطيار ${order.driver?.name || 'المندوب'}`,
          'طلب استلام دليفري',
          {
            duration: 5000,
            onClick: () => setIsHandoverOpen(true),
            action: {
              label: 'استعراض وتسليم',
              onClick: () => setIsHandoverOpen(true),
            },
          }
        );
      }
    });
  }, [pendingHandovers]);

  // Shift States & Modals
  const [isOpenShiftModalOpen, setIsOpenShiftModalOpen] = useState(false);
  const [isCloseShiftModalOpen, setIsCloseShiftModalOpen] = useState(false);
  const [isCashMovementModalOpen, setIsCashMovementModalOpen] = useState(false);
  const [isXReportOpen, setIsXReportOpen] = useState(false);
  const [isShiftsHistoryOpen, setIsShiftsHistoryOpen] = useState(false);

  // Printable receipt state
  const [printableShift, setPrintableShift] = useState(null);
  const [printType, setPrintType] = useState('Z_REPORT');

  const { data: shiftResponse, refetch: refetchShift } = useCurrentShiftQuery(activeBranchId);
  const activeShift = shiftResponse?.activeShift ?? shiftResponse?.data?.activeShift ?? null;

  const currentTab = useMemo(() => {
    if (tab === 'orders') return 'orders';
    if (tab === 'tables') return 'tables';
    return 'sales';
  }, [tab]);

  const handleSelectTab = (nextTab) => {
    if (nextTab === 'sales') {
      navigate('/pos');
    } else {
      navigate(`/pos/${nextTab}`);
    }
  };

  const handleSelectTableForOrder = (tbl) => {
    const idVal = tbl?.id || tbl?.tableId || tbl?._id;
    const labelVal = tbl?.label || tbl?.number || tbl?.name || tbl?.displayNum || idVal || tbl;
    const tableParam = idVal || labelVal;
    setPendingTable(tbl);
    navigate(tableParam ? `/pos?type=DINE_IN&table=${encodeURIComponent(tableParam)}` : '/pos?type=DINE_IN');
  };

  const handlePrintReceipt = (shiftData, type = 'Z_REPORT') => {
    setPrintableShift(shiftData);
    setPrintType(type);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const { tables: gridTables } = useTableGridState(activeBranchId);
  const { data: productsResponse } = useProductsQuery({ page: 1, limit: 100 });
  const { data: categoriesResponse } = useCategoriesQuery({ page: 1, limit: 100 });

  const products = useMemo(() => productsResponse?.items || [], [productsResponse]);
  const categories = useMemo(() => categoriesResponse?.items || [], [categoriesResponse]);
  const tables = gridTables;

  return (
    <div className="h-screen w-full min-h-screen flex flex-col overflow-hidden bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 relative" dir="rtl">
      {/* Printable Thermal Receipt Component */}
      <ShiftThermalReceipt
        shift={printableShift}
        reportType={printType}
        restaurantName={activeBranch?.name || ''}
        currency={currency}
      />

      {/* Top Header */}
      <PosNavHeader
        activeTab={currentTab}
        onSelectTab={handleSelectTab}
        activeBranch={activeBranch}
        user={user}
        activeShift={activeShift}
        onOpenStartShift={() => setIsOpenShiftModalOpen(true)}
        onOpenDriverSettlement={() => setIsSettlementOpen(true)}
        onOpenHandoverModal={() => setIsHandoverOpen(true)}
        pendingHandoversCount={pendingHandovers.length}
        onOpenXReport={() => setIsXReportOpen(true)}
        onOpenCashMovement={() => setIsCashMovementModalOpen(true)}
        onOpenCloseShift={() => setIsCloseShiftModalOpen(true)}
        onNavigateShifts={() => setIsShiftsHistoryOpen(true)}
        onLogout={logout}
        currency={currency}
      />

      {/* Main Tab Views */}
      <div className={`flex-1 flex overflow-hidden ${currentTab === 'sales' ? '' : 'hidden'}`}>
        <PosSalesView
          products={products}
          categories={categories}
          tables={tables}
          pendingTable={pendingTable}
          onClearPendingTable={() => setPendingTable(null)}
        />
      </div>

      {currentTab === 'orders' && (
        <div className="flex-1 flex overflow-hidden">
          <PosOrdersView />
        </div>
      )}

      {currentTab === 'tables' && (
        <div className="flex-1 flex overflow-hidden">
          <PosTablesView onSelectTableForOrder={handleSelectTableForOrder} />
        </div>
      )}

      {/* Driver COD Cash Settlement & Delivery Pickup Modal */}
      <CashierDriverSettlementModal
        isOpen={isSettlementOpen}
        onClose={() => setIsSettlementOpen(false)}
        branchId={activeBranchId}
        onOpenHandoverModal={(orderId) => {
          setSelectedHandoverOrderId(orderId || null);
          setIsSettlementOpen(false);
          setIsHandoverOpen(true);
        }}
      />

      {/* Shift Modals */}
      <OpenShiftModal
        isOpen={isOpenShiftModalOpen}
        onClose={() => {
          setIsOpenShiftModalOpen(false);
          refetchShift();
        }}
        branchId={activeBranchId}
      />

      <CloseShiftModal
        isOpen={isCloseShiftModalOpen}
        onClose={() => {
          setIsCloseShiftModalOpen(false);
          refetchShift();
        }}
        branchId={activeBranchId}
        shift={activeShift}
        onPrintZReport={(finalShift) => handlePrintReceipt(finalShift, 'Z_REPORT')}
      />

      <CashMovementModal
        isOpen={isCashMovementModalOpen}
        onClose={() => {
          setIsCashMovementModalOpen(false);
          refetchShift();
        }}
        branchId={activeBranchId}
        shiftId={activeShift?.id}
      />

      <XReportModal
        isOpen={isXReportOpen}
        onClose={() => setIsXReportOpen(false)}
        branchId={activeBranchId}
        shiftId={activeShift?.id}
        onPrintXReport={(report) => handlePrintReceipt(report, 'X_REPORT')}
      />

      {/* Shifts Archive & History Modal */}
      <ShiftsHistoryModal
        isOpen={isShiftsHistoryOpen}
        onClose={() => setIsShiftsHistoryOpen(false)}
        branchId={activeBranchId}
        onPrintReceipt={handlePrintReceipt}
        restaurantName={activeBranch?.name}
      />

      {/* Real-time Driver Pickup & Handover Request Modal */}
      <CashierDriverHandoverModal
        isOpen={isHandoverOpen}
        onClose={() => {
          setIsHandoverOpen(false);
          setSelectedHandoverOrderId(null);
        }}
        branchId={activeBranchId}
        initialOrderId={selectedHandoverOrderId}
      />
    </div>
  );
};

export default PosPage;
