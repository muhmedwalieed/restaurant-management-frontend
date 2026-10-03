import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProductsQuery, useCategoriesQuery } from '../../menu/hooks/useMenu.js';
import { useTableGridState } from '../../tables/hooks/useTableGridState.js';
import { useBranch } from '../../auth/context/BranchContext.jsx';
import { useAuth } from '../../auth/context/AuthContext.jsx';
import { useCurrentShiftQuery } from '../hooks/useShifts.js';

import { PosNavHeader } from '../components/pos/PosNavHeader.jsx';
import { PosSalesView } from '../components/pos/PosSalesView.jsx';
import { PosOrdersView } from '../components/PosOrdersView.jsx';
import { PosTablesView } from '../components/PosTablesView.jsx';
import { CashierDriverSettlementModal } from '../components/delivery/CashierDriverSettlementModal.jsx';
import { OpenShiftModal } from '../components/shifts/OpenShiftModal.jsx';
import { CloseShiftModal } from '../components/shifts/CloseShiftModal.jsx';
import { CashMovementModal } from '../components/shifts/CashMovementModal.jsx';
import { XReportModal } from '../components/shifts/XReportModal.jsx';
import { ShiftThermalReceipt } from '../components/shifts/ShiftThermalReceipt.jsx';
import { useCurrency } from '../../../shared/hooks/useCurrency.js';
import { FileText, DollarSign, Lock, Layers } from 'lucide-react';

export const PosPage = () => {
  const navigate = useNavigate();
  const { tab } = useParams();
  const { activeBranchId, activeBranch } = useBranch();
  const { user, logout } = useAuth();
  const { currency } = useCurrency();

  const [pendingTable, setPendingTable] = useState(null);
  const [isSettlementOpen, setIsSettlementOpen] = useState(false);

  // Shift States & Modals
  const [isOpenShiftModalOpen, setIsOpenShiftModalOpen] = useState(false);
  const [isCloseShiftModalOpen, setIsCloseShiftModalOpen] = useState(false);
  const [isCashMovementModalOpen, setIsCashMovementModalOpen] = useState(false);
  const [isXReportModalOpen, setIsXReportModalOpen] = useState(false);
  const [isShiftDropdownOpen, setIsShiftDropdownOpen] = useState(false);

  // Printable receipt state
  const [printableShift, setPrintableShift] = useState(null);
  const [printType, setPrintType] = useState('Z_REPORT');

  const { data: shiftResponse, refetch: refetchShift } = useCurrentShiftQuery(activeBranchId);
  const activeShift = shiftResponse?.data?.activeShift;

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
    <div className="h-screen w-full min-h-screen flex flex-col overflow-hidden bg-zinc-100 dark:bg-black text-zinc-900 dark:text-zinc-100 relative" dir="rtl">
      {/* Printable Thermal Receipt Component */}
      <ShiftThermalReceipt
        shift={printableShift}
        reportType={printType}
        restaurantName={activeBranch?.name || 'مطعم برايم'}
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
        onToggleShiftMenu={() => setIsShiftDropdownOpen(!isShiftDropdownOpen)}
        onOpenDriverSettlement={() => setIsSettlementOpen(true)}
        onLogout={logout}
      />

      {/* Shift Quick Actions Dropdown Menu */}
      {isShiftDropdownOpen && activeShift && (
        <div
          className="absolute top-14 left-4 sm:left-24 z-50 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-1.5 space-y-1 text-right text-xs"
          onClick={() => setIsShiftDropdownOpen(false)}
        >
          <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-[11px] text-zinc-400 block">الوردية الحالية</span>
            <span className="font-bold text-zinc-800 dark:text-zinc-200">
              وردية #{activeShift.shiftNumber} ({activeShift.employee?.name})
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsXReportOpen(true)}
            className="w-full px-3 py-2 rounded-xl text-right flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold"
          >
            <FileText className="w-4 h-4 text-primary-500" />
            تقرير لحظي (X-Report)
          </button>

          <button
            type="button"
            onClick={() => setIsCashMovementModalOpen(true)}
            className="w-full px-3 py-2 rounded-xl text-right flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold"
          >
            <DollarSign className="w-4 h-4 text-amber-500" />
            حركة نقدية بالدرج (Pay In/Out)
          </button>

          <button
            type="button"
            onClick={() => navigate('/shifts')}
            className="w-full px-3 py-2 rounded-xl text-right flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold"
          >
            <Layers className="w-4 h-4 text-zinc-400" />
            سجل وأرشيف الورديات
          </button>

          <button
            type="button"
            onClick={() => setIsCloseShiftModalOpen(true)}
            className="w-full px-3 py-2 rounded-xl text-right flex items-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 font-bold border-t border-zinc-100 dark:border-zinc-800"
          >
            <Lock className="w-4 h-4" />
            إغلاق الوردية (Z-Report)
          </button>
        </div>
      )}

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

      {/* Driver COD Cash Settlement Modal */}
      <CashierDriverSettlementModal
        isOpen={isSettlementOpen}
        onClose={() => setIsSettlementOpen(false)}
        branchId={activeBranchId}
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
    </div>
  );
};

export default PosPage;
