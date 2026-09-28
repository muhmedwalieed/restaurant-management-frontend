import React from 'react';
import { useBranch } from '../../../auth/context/BranchContext.jsx';
import { useAuth } from '../../../auth/context/AuthContext.jsx';
import { ProductModifierModal } from '../ProductModifierModal.jsx';
import { PosCategoryTabs } from './PosCategoryTabs.jsx';
import { PosProductGrid } from './PosProductGrid.jsx';
import { PosCartPanel } from './PosCartPanel.jsx';
import { PosCustomerModal } from './PosCustomerModal.jsx';
import { PosCheckoutModal } from './PosCheckoutModal.jsx';
import { usePosSalesRegister } from '../../hooks/usePosSalesRegister.js';

export const PosSalesView = ({
  products = [],
  categories = [],
  tables = [],
}) => {
  const { activeBranchId } = useBranch();
  const { hasPermission } = useAuth();

  const {
    cat,
    setCat,
    q,
    setQ,
    cart,
    orderType,
    setOrderType,
    source,
    setSource,
    availableSources,
    info,
    setInfo,
    selectedTableLabel,
    caller,
    modifierProduct,
    setModifierProduct,
    isCustomerModalOpen,
    setIsCustomerModalOpen,
    isCheckoutModalOpen,
    setIsCheckoutModalOpen,
    filteredProducts,
    cartTotal,
    handleSelectProduct,
    addToCart,
    handleChangeCartQty,
    handleRemoveCartItem,
    handleClearCart,
    handleConfirmCheckout,
    createPosMutation,
    paymentMutation,
  } = usePosSalesRegister({
    products,
    tables,
    activeBranchId,
    hasPermission,
  });

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Products Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden" style={{ background: 'var(--bg)' }}>
        <PosCategoryTabs
          categories={categories}
          activeCategory={cat}
          onSelectCategory={setCat}
        />

        <PosProductGrid
          products={filteredProducts}
          searchQuery={q}
          onChangeSearch={setQ}
          onSelectProduct={handleSelectProduct}
        />
      </div>

      {/* Cart Sidebar */}
      <PosCartPanel
        cart={cart}
        orderType={orderType}
        customerInfo={info}
        selectedTableLabel={selectedTableLabel}
        onOpenCustomerModal={() => setIsCustomerModalOpen(true)}
        onChangeQty={handleChangeCartQty}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onProceedCheckout={() => setIsCheckoutModalOpen(true)}
      />

      {/* Customer & Order Type Modal */}
      <PosCustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        orderType={orderType}
        onChangeOrderType={setOrderType}
        source={source}
        onChangeSource={setSource}
        availableSources={availableSources}
        customerInfo={info}
        onChangeCustomerInfo={setInfo}
        tables={tables}
        callerData={caller}
      />

      {/* Checkout & Payment Modal */}
      <PosCheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        total={cartTotal}
        cart={cart}
        customerInfo={info}
        orderType={orderType}
        onConfirmCheckout={handleConfirmCheckout}
        isLoading={createPosMutation.isPending || paymentMutation.isPending}
      />

      {/* Product Modifiers Modal */}
      {modifierProduct && (
        <ProductModifierModal
          product={modifierProduct}
          isOpen={Boolean(modifierProduct)}
          onClose={() => setModifierProduct(null)}
          onConfirm={(selectedModifiers) => {
            addToCart(modifierProduct, selectedModifiers);
            setModifierProduct(null);
          }}
        />
      )}
    </div>
  );
};

export default PosSalesView;
