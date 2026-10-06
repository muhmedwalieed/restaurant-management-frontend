import { useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useProductsQuery, useCategoriesQuery } from '../../menu/hooks/useMenu.js';
import { useBranch } from '../../auth/context/BranchContext.jsx';
import { useAuth } from '../../auth/context/AuthContext.jsx';

import { CallCenterNavHeader } from '../components/callcenter/CallCenterNavHeader.jsx';
import { PosSalesView } from '../components/pos/PosSalesView.jsx';
import { PosOrdersView } from '../components/PosOrdersView.jsx';

export const PhoneOrdersPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { tab } = useParams();
  const { activeBranchId, activeBranch } = useBranch();
  const { user, logout } = useAuth();

  const isPhoneOrdersRoute = location.pathname.startsWith('/phone-orders');
  const basePath = isPhoneOrdersRoute ? '/phone-orders' : '/call-center';

  const currentTab = useMemo(() => {
    if (tab === 'orders') return 'orders';
    return 'sales';
  }, [tab]);

  const handleSelectTab = (nextTab) => {
    if (nextTab === 'sales') {
      navigate(basePath);
    } else {
      navigate(`${basePath}/${nextTab}`);
    }
  };

  const { data: productsResponse } = useProductsQuery({ page: 1, limit: 100 });
  const { data: categoriesResponse } = useCategoriesQuery({ page: 1, limit: 100 });

  const products = useMemo(() => productsResponse?.items || [], [productsResponse]);
  const categories = useMemo(() => categoriesResponse?.items || [], [categoriesResponse]);

  return (
    <div className="h-screen w-full min-h-screen flex flex-col overflow-hidden bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 relative" dir="rtl">
      {/* Call Center Header */}
      <CallCenterNavHeader
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
          tables={[]}
          defaultOrderType="DELIVERY"
          allowedOrderTypes={['DELIVERY', 'PICKUP']}
          defaultSource="PHONE"
        />
      </div>

      {currentTab === 'orders' && (
        <div className="flex-1 flex overflow-hidden">
          <PosOrdersView allowStatusChange={false} />
        </div>
      )}
    </div>
  );
};

export default PhoneOrdersPage;
