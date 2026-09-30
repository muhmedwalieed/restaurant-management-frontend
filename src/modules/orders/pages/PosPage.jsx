import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProductsQuery, useCategoriesQuery } from '../../menu/hooks/useMenu.js';
import { useTablesQuery } from '../../tables/hooks/useTables.js';
import { useBranch } from '../../auth/context/BranchContext.jsx';
import { useAuth } from '../../auth/context/AuthContext.jsx';

import { PosNavHeader } from '../components/pos/PosNavHeader.jsx';
import { PosSalesView } from '../components/pos/PosSalesView.jsx';
import { PosOrdersView } from '../components/PosOrdersView.jsx';
import { PosTablesView } from '../components/PosTablesView.jsx';

export const PosPage = () => {
  const navigate = useNavigate();
  const { tab } = useParams();
  const { activeBranchId, activeBranch } = useBranch();
  const { user, logout } = useAuth();
  const [pendingTable, setPendingTable] = useState(null);

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
    const tableVal = tbl?.label || tbl?.number || tbl?.name || tbl?.displayNum || tbl?.id || tbl;
    setPendingTable(tbl);
    navigate(tableVal ? `/pos?type=DINE_IN&table=${encodeURIComponent(tableVal)}` : '/pos?type=DINE_IN');
  };

  // Queries for sales and tables
  const { data: productsResponse } = useProductsQuery({ page: 1, limit: 100 });
  const { data: categoriesResponse } = useCategoriesQuery({ page: 1, limit: 100 });
  const { data: tablesResponse } = useTablesQuery(activeBranchId, { page: 1, limit: 100 });

  const products = useMemo(() => productsResponse?.items || [], [productsResponse]);
  const categories = useMemo(() => categoriesResponse?.items || [], [categoriesResponse]);
  const tables = useMemo(() => tablesResponse?.items || [], [tablesResponse]);

  return (
    <div className="h-screen w-screen min-h-screen flex flex-col overflow-hidden bg-zinc-100 dark:bg-black text-zinc-900 dark:text-zinc-100" dir="rtl">
      {/* Top Header */}
      <PosNavHeader
        activeTab={currentTab}
        onSelectTab={handleSelectTab}
        activeBranch={activeBranch}
        user={user}
        onLogout={logout}
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
    </div>
  );
};

export default PosPage;
