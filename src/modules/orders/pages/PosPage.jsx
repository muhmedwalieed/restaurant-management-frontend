import { useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProductsQuery, useCategoriesQuery } from '../../menu/hooks/useMenu.js';
import { useTablesQuery } from '../../tables/hooks/useTables.js';
import { useBranch } from '../../auth/context/BranchContext.jsx';
import { useAuth } from '../../auth/context/AuthContext.jsx';

import { PosNavHeader } from '../components/pos/PosNavHeader.jsx';
import { PosSalesView } from '../components/pos/PosSalesView.jsx';
import { PosOrdersView } from '../components/PosOrdersView.jsx';
import { PosTablesView } from '../components/PosTablesView.jsx';
import { WaiterPage } from './WaiterPage.jsx';

export const PosPage = () => {
  const navigate = useNavigate();
  const { tab } = useParams();
  const { activeBranchId, activeBranch } = useBranch();
  const { user, logout } = useAuth();

  const roleName = (user?.role?.name || user?.role || '').toLowerCase();
  const isWaiter = roleName === 'ويتر' || roleName === 'waiter';

  useEffect(() => {
    if (isWaiter && tab !== 'waiter') {
      navigate('/pos/waiter', { replace: true });
    }
  }, [isWaiter, tab, navigate]);

  const currentTab = useMemo(() => {
    if (isWaiter) return 'waiter';
    if (tab === 'orders') return 'orders';
    if (tab === 'tables') return 'tables';
    if (tab === 'waiter') return 'waiter';
    return 'sales';
  }, [tab, isWaiter]);

  const handleSelectTab = (nextTab) => {
    if (isWaiter) {
      navigate('/pos/waiter');
      return;
    }
    if (nextTab === 'sales') {
      navigate('/pos');
    } else {
      navigate(`/pos/${nextTab}`);
    }
  };

  // Queries for sales and tables
  const { data: productsResponse } = useProductsQuery({ page: 1, limit: 100 });
  const { data: categoriesResponse } = useCategoriesQuery({ page: 1, limit: 100 });
  const { data: tablesResponse } = useTablesQuery(activeBranchId, { page: 1, limit: 100 });

  const products = useMemo(() => productsResponse?.items || [], [productsResponse]);
  const categories = useMemo(() => categoriesResponse?.items || [], [categoriesResponse]);
  const tables = useMemo(() => tablesResponse?.items || [], [tablesResponse]);

  // If on waiter tab, render WaiterPage directly
  if (currentTab === 'waiter') {
    return <WaiterPage />;
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden select-none" dir="rtl" style={{ background: 'var(--bg)' }}>
      {/* Top Header */}
      <PosNavHeader
        activeTab={currentTab}
        onSelectTab={handleSelectTab}
        activeBranch={activeBranch}
        user={user}
        onLogout={logout}
        onNavigateDashboard={() => navigate('/dashboard')}
      />

      {/* Main Tab Views */}
      {currentTab === 'sales' && (
        <PosSalesView
          products={products}
          categories={categories}
          tables={tables}
        />
      )}

      {currentTab === 'orders' && <PosOrdersView />}

      {currentTab === 'tables' && (
        <PosTablesView onSelectTableForOrder={() => handleSelectTab('sales')} />
      )}
    </div>
  );
};

export default PosPage;
