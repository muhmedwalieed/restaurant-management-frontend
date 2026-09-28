import { useState, useMemo, useEffect } from 'react';
import { useCreatePosOrderMutation, usePaymentMutation } from './useOrders.js';
import { lookupCallerApi } from '../../../lib/api/phone-order.api.js';

export const usePosSalesRegister = ({
  products = [],
  tables = [],
  activeBranchId,
  hasPermission,
}) => {
  const createPosMutation = useCreatePosOrderMutation();
  const paymentMutation = usePaymentMutation();

  const [cat, setCat] = useState('ALL');
  const [q, setQ] = useState('');
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState('DINE_IN');
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [info, setInfo] = useState({ name: '', phone: '', address: '', table: null });
  const [lastCreatedOrder, setLastCreatedOrder] = useState(null);
  const [caller, setCaller] = useState(null);
  const [modifierProduct, setModifierProduct] = useState(null);

  const selectedTableObj = useMemo(
    () => tables.find((t) => t.id === info.table),
    [tables, info.table]
  );
  const selectedTableLabel = selectedTableObj
    ? selectedTableObj.label || selectedTableObj.name || selectedTableObj.tableNumber || selectedTableObj.number
    : null;

  const SOURCE_PERMISSIONS = [
    { value: 'CASHIER', key: 'orders.source_cashier', label: 'كاشير' },
    { value: 'PHONE', key: 'orders.source_phone', label: 'هاتف' },
    { value: 'WHATSAPP', key: 'orders.source_whatsapp', label: 'واتساب' },
    { value: 'WEBSITE', key: 'orders.source_website', label: 'موقع' },
  ];
  const availableSources = SOURCE_PERMISSIONS.filter((s) => hasPermission(s.key));
  const [source, setSource] = useState(() =>
    availableSources.some((s) => s.value === 'CASHIER') ? 'CASHIER' : availableSources[0]?.value || 'CASHIER'
  );

  // Phone lookup
  useEffect(() => {
    const clean = info.phone?.trim() || '';
    if (clean.length < 8) {
      setCaller(null);
      return undefined;
    }
    const timer = setTimeout(async () => {
      try {
        const data = await lookupCallerApi(clean);
        if (data) {
          setCaller(data);
          if (data.customer?.name && !info.name.trim()) {
            setInfo((prev) => ({ ...prev, name: data.customer.name }));
          }
          if (data.defaultAddress && !info.address.trim()) {
            const addr = [data.defaultAddress.street, data.defaultAddress.city].filter(Boolean).join('، ');
            if (addr) setInfo((prev) => ({ ...prev, address: addr }));
          }
        }
      } catch (err) {
        void err;
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [info.phone, info.name, info.address]);

  // Filter products by category and search
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = cat === 'ALL' || p.categoryId === cat;
      const matchQuery =
        !q.trim() ||
        p.name?.toLowerCase().includes(q.toLowerCase()) ||
        p.sku?.toLowerCase().includes(q.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [products, cat, q]);

  // Cart operations
  const addToCart = (product, selectedModifiers = []) => {
    setCart((prev) => {
      const pId = product.id || product.productId;
      const modKey = (selectedModifiers || [])
        .map((m) => m.optionId || m.id)
        .sort()
        .join(',');
      const itemKey = `${pId}__${modKey}`;

      const existingIndex = prev.findIndex((i) => i.itemKey === itemKey);
      if (existingIndex > -1) {
        return prev.map((it, idx) =>
          idx === existingIndex ? { ...it, qty: it.qty + 1 } : it
        );
      }

      const modPrice = (selectedModifiers || []).reduce(
        (sum, m) => sum + (Number(m.price) || 0) * (m.quantity || 1),
        0
      );

      return [
        ...prev,
        {
          itemKey,
          productId: pId,
          name: product.name,
          price: Number(product.price || 0) + modPrice,
          basePrice: Number(product.price || 0),
          qty: 1,
          modifiers: selectedModifiers || [],
        },
      ];
    });
  };

  const handleSelectProduct = (product) => {
    const hasMod = product.hasModifiers || (product.modifierGroups && product.modifierGroups.length > 0);
    if (hasMod) {
      setModifierProduct(product);
      return;
    }
    addToCart(product, []);
  };

  const handleChangeCartQty = (index, delta) => {
    setCart((prev) => {
      return prev
        .map((it, idx) => (idx === index ? { ...it, qty: it.qty + delta } : it))
        .filter((it) => it.qty > 0);
    });
  };

  const handleRemoveCartItem = (index) => {
    setCart((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((s, it) => s + (Number(it.price) || 0) * (it.qty || 1), 0);
  }, [cart]);

  // Checkout submission
  const handleConfirmCheckout = async ({ payMethod, amountReceived: _amountReceived, autoPrint: _autoPrint }) => {
    try {
      const payload = {
        type: orderType,
        source,
        tableId: orderType === 'DINE_IN' ? info.table : undefined,
        customerName: info.name || undefined,
        customerPhone: info.phone || undefined,
        deliveryAddress: orderType === 'DELIVERY' ? info.address : undefined,
        items: cart.map((it) => ({
          productId: it.productId,
          quantity: it.qty,
          modifiers: it.modifiers,
        })),
      };

      const createdOrder = await createPosMutation.mutateAsync({
        branchId: activeBranchId,
        payload,
      });

      const orderData = createdOrder?.data || createdOrder;
      const orderId = orderData?.id;

      if (orderId) {
        try {
          await paymentMutation.mutateAsync({
            branchId: activeBranchId,
            orderId,
            payload: {
              amount: cartTotal,
              paymentMethod: payMethod.toUpperCase(),
            },
          });
        } catch (payErr) {
          console.warn('Payment recording error:', payErr);
        }
      }

      setLastCreatedOrder(orderData);
      setCart([]);
      setIsCheckoutModalOpen(false);
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || 'حدث خطأ أثناء حفظ الطلب');
    }
  };

  return {
    cat,
    setCat,
    q,
    setQ,
    cart,
    setCart,
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
    lastCreatedOrder,
    setLastCreatedOrder,
    createPosMutation,
    paymentMutation,
  };
};
