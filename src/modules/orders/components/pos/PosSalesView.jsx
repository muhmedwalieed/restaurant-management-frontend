import React, { useCallback, useMemo } from 'react';
import { useBranch } from '../../../auth/context/BranchContext.jsx';
import { useAuth } from '../../../auth/context/AuthContext.jsx';
import { hasProductModifiers } from '../../constants.js';
import { ProductModifierModal } from '../ProductModifierModal.jsx';
import { PosSalesToolbar } from './PosSalesToolbar.jsx';
import { PosProductGrid } from './PosProductGrid.jsx';
import { PosCartPanel } from './PosCartPanel.jsx';
import { PosCustomerModal } from './PosCustomerModal.jsx';
import { PosCheckoutModal } from './PosCheckoutModal.jsx';
import { usePosSalesRegister } from '../../hooks/usePosSalesRegister.js';

export const PosSalesView = ({
  products = [],
  categories = [],
  tables = [],
  pendingTable = null,
  onClearPendingTable,
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
    cartTotalAfterDiscount,
    couponCode,
    setCouponCode,
    couponState,
    validateCoupon,
    clearCoupon,
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
    pendingTable,
    onClearPendingTable,
  });

  // Map product IDs to their current cart count
  const cartItemMap = useMemo(() => {
    const map = {};
    cart.forEach((it) => {
      const pId = it.productId || it.id;
      map[pId] = (map[pId] || 0) + (it.qty || 1);
    });
    return map;
  }, [cart]);

  // Card increment handler
  const handleIncrementProduct = useCallback((product) => {
    const hasModifiers = hasProductModifiers(product);
    if (hasModifiers) {
      setModifierProduct(product);
      return;
    }
    const idx = cart.findIndex((it) => (it.productId || it.id) === product.id && (!it.modifiers || it.modifiers.length === 0));
    if (idx >= 0) {
      handleChangeCartQty(idx, 1);
    } else {
      addToCart(product);
    }
  }, [cart, handleChangeCartQty, addToCart, setModifierProduct]);

  // Card decrement handler
  const handleDecrementProduct = useCallback((product) => {
    const idx = cart.findLastIndex((it) => (it.productId || it.id) === product.id);
    if (idx >= 0) {
      handleChangeCartQty(idx, -1);
    }
  }, [cart, handleChangeCartQty]);

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Products & Navigation Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-transparent">
        {/* Unified Horizontal Toolbar (Categories + Search + Count) */}
        <PosSalesToolbar
          categories={categories}
          activeCategory={cat}
          onSelectCategory={setCat}
          allProducts={products}
          filteredCount={filteredProducts.length}
          searchQuery={q}
          onChangeSearch={setQ}
        />

        {/* Products Grid */}
        <PosProductGrid
          products={filteredProducts}
          onSelectProduct={handleSelectProduct}
          onIncrementProduct={handleIncrementProduct}
          onDecrementProduct={handleDecrementProduct}
          cartItemMap={cartItemMap}
        />
      </div>

      {/* Cart Sidebar — single source of truth for table/customer (no duplicate state in modal) */}
      <PosCartPanel
        cart={cart}
        orderType={orderType}
        onChangeOrderType={setOrderType}
        onChangeQty={handleChangeCartQty}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        tables={tables}
        customerInfo={info}
        onChangeCustomerInfo={setInfo}
        couponCode={couponCode}
        onChangeCouponCode={setCouponCode}
        couponState={couponState}
        onValidateCoupon={validateCoupon}
        onClearCoupon={clearCoupon}
        cartTotalAfterDiscount={cartTotalAfterDiscount}
        onProceedCheckout={() => setIsCheckoutModalOpen(true)}
      />

      {/* Customer & Order Type Modal (Secondary/Optional standalone) */}
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
      />

      {/* Checkout & Payment Flow Modal — uses same customerInfo/table source as cart */}
      <PosCheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        cart={cart}
        total={cartTotalAfterDiscount}
        rawTotal={cartTotal}
        couponState={couponState}
        onChangeQty={handleChangeCartQty}
        onRemoveItem={handleRemoveCartItem}
        orderType={orderType}
        onChangeOrderType={setOrderType}
        customerInfo={info}
        onChangeCustomerInfo={setInfo}
        tables={tables}
        selectedTableLabel={selectedTableLabel}
        onConfirmCheckout={handleConfirmCheckout}
        isLoading={createPosMutation.isPending || paymentMutation.isPending}
      />

      {/* Product Modifiers Modal */}
      {modifierProduct && (
        <ProductModifierModal
          product={modifierProduct}
          isOpen={Boolean(modifierProduct)}
          onClose={() => setModifierProduct(null)}
          onConfirm={(customized) => {
            addToCart({
              ...modifierProduct,
              unitPrice: customized.unitPrice,
              modifierNames: customized.modifierNames,
            }, customized.modifiers);
            setModifierProduct(null);
          }}
        />
      )}
    </div>
  );
};
