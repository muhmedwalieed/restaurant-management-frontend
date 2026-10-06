import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useCreatePosOrderMutation, usePaymentMutation } from './useOrders.js';
import { lookupCallerApi } from '../../../lib/api/phone-order.api.js';
import { toast } from '../../../shared/context/ToastContext.jsx';
import { SOURCE_PERMISSIONS, hasProductModifiers } from '../constants.js';

export const usePosSalesRegister = ({
  products = [],
  tables = [],
  activeBranchId,
  hasPermission,
  pendingTable = null,
  onClearPendingTable,
  defaultOrderType = null,
  allowedOrderTypes = null,
  defaultSource = null,
}) => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const isSalesRoute = location.pathname === '/pos';

  const createPosMutation = useCreatePosOrderMutation();
  const paymentMutation = usePaymentMutation();

  const urlType = isSalesRoute ? (searchParams.get('type') || searchParams.get('orderType')) : null;
  const urlTableParam = isSalesRoute ? (searchParams.get('table') || searchParams.get('tableId')) : null;

  // Helper to resolve table param (label, number, or ID) to table.id
  const resolveTableId = useCallback((paramVal) => {
    if (!paramVal) return null;
    const clean = String(paramVal).trim();
    const found = tables.find(
      (t) =>
        String(t.id) === clean ||
        String(t._id) === clean ||
        String(t.label || '').toLowerCase() === clean.toLowerCase() ||
        String(t.name || '').toLowerCase() === clean.toLowerCase() ||
        (t.number != null && String(t.number) === clean)
    );
    return found ? found.id : clean;
  }, [tables]);

  const initialTableId = resolveTableId(urlTableParam) || pendingTable?.id || pendingTable?.tableId || pendingTable?._id || null;
  const fallbackOrderType = defaultOrderType || (initialTableId ? 'DINE_IN' : 'PICKUP');
  const initialOrderType = urlType || fallbackOrderType;

  const [cat, setCat] = useState('ALL');
  const [q, setQ] = useState('');
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState(() => initialOrderType);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [info, setInfo] = useState(() => ({
    name: '',
    phone: '',
    address: '',
    table: initialTableId,
  }));
  const [lastCreatedOrder, setLastCreatedOrder] = useState(null);
  const [caller, setCaller] = useState(null);
  const [modifierProduct, setModifierProduct] = useState(null);

  // Handle incoming pendingTable
  useEffect(() => {
    if (pendingTable) {
      const tableId = pendingTable.id || pendingTable.tableId || pendingTable._id;
      if (tableId) {
        setOrderType('DINE_IN');
        setInfo((prev) => ({ ...prev, table: tableId }));
      }
      onClearPendingTable?.();
    }
  }, [pendingTable, onClearPendingTable]);

  // Initial resolve when tables load from urlTableParam if any
  useEffect(() => {
    if (!tables || tables.length === 0) return;
    if (urlTableParam && !info.table) {
      const resolved = resolveTableId(urlTableParam);
      if (resolved) {
        setInfo((prev) => ({ ...prev, table: resolved }));
        setOrderType('DINE_IN');
      }
    }
  }, [tables, urlTableParam, resolveTableId, info.table]);

  const selectedTableObj = useMemo(
    () => tables.find((t) => String(t.id) === String(info.table) || String(t._id) === String(info.table)),
    [tables, info.table]
  );
  const selectedTableLabel = selectedTableObj
    ? selectedTableObj.label || selectedTableObj.name || (selectedTableObj.number != null ? selectedTableObj.number : selectedTableObj.tableNumber)
    : null;

  const availableSources = useMemo(
    () => SOURCE_PERMISSIONS.filter((s) => hasPermission?.(s.key)),
    [hasPermission]
  );

  const [source, setSource] = useState(() => {
    if (defaultSource) return defaultSource;
    return availableSources.some((s) => s.value === 'CASHIER') ? 'CASHIER' : availableSources[0]?.value || 'CASHIER';
  });
  const [couponCode, setCouponCode] = useState('');
  const [couponState, setCouponState] = useState({ id: null, code: null, discountAmount: 0, loading: false, error: null });
  const [discountAmount, setDiscountAmount] = useState(0);

  useEffect(() => {
    if (defaultSource) return;
    if (availableSources.length > 0 && !availableSources.some((s) => s.value === source)) {
      setSource(availableSources[0].value);
    }
  }, [availableSources, source, defaultSource]);

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
      const normalizedModifiers = (selectedModifiers || []).map((m) => ({
        modifierId: m.modifierId || m.id || m.optionId,
        name: m.name || m.optionName,
        quantity: Number(m.quantity) || 1,
        priceDelta: Number(m.priceDelta ?? m.price ?? 0),
      }));

      const modKey = normalizedModifiers
        .map((m) => `${m.modifierId}:${m.quantity}`)
        .sort()
        .join(',');
      const itemKey = `${pId}__${modKey}`;

      const existingIndex = prev.findIndex((i) => i.itemKey === itemKey);
      if (existingIndex > -1) {
        return prev.map((it, idx) =>
          idx === existingIndex ? { ...it, qty: it.qty + 1 } : it
        );
      }

      const modPrice = normalizedModifiers.reduce(
        (sum, m) => sum + m.priceDelta * m.quantity,
        0
      );
      const basePrice = Number(product.price ?? product.basePrice ?? 0);
      const unitPrice = product.unitPrice ?? (basePrice + modPrice);

      return [
        ...prev,
        {
          itemKey,
          productId: pId,
          name: product.name,
          price: unitPrice,
          basePrice,
          qty: 1,
          modifiers: normalizedModifiers.map((m) => ({
            modifierId: m.modifierId,
            quantity: m.quantity,
          })),
          modifierNames: product.modifierNames || normalizedModifiers.map((m) => (m.quantity > 1 ? `${m.name} ×${m.quantity}` : m.name)).filter(Boolean),
        },
      ];
    });
  };

  const handleSelectProduct = (product) => {
    if (hasProductModifiers(product)) {
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

  const cartTotal = useMemo(() => cart.reduce((s, it) => s + (Number(it.price) || 0) * (it.qty || 1), 0), [cart]);

  const validateCoupon = useCallback(async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) { setCouponState({ id: null, code: null, discountAmount: 0, loading: false, error: null }); setDiscountAmount(0); return; }
    if (cart.length === 0) { setCouponState((p) => ({ ...p, error: 'أضف أصناف أولاً' })); return; }
    setCouponState((p) => ({ ...p, loading: true, error: null }));
    try {
      const { validateCouponApi } = await import('../../../lib/api/coupons.api.js');
      const res = await validateCouponApi({ code, subtotal: cartTotal, items: cart.map((it) => ({ productId: it.productId, subtotal: Math.round(Number(it.price) * it.qty * 100) / 100 })) });
      const data = res?.data || res;
      setCouponState({ id: data.id, code: data.code, discountAmount: Number(data.discountAmount || 0), loading: false, error: null });
      setDiscountAmount(Number(data.discountAmount || 0));
      toast.success(`تم تطبيق الكوبون ${data.code} — خصم ${Number(data.discountAmount || 0).toFixed(0)}`);
    } catch (err) {
      const msg = err?.message || err?.response?.data?.message || 'كود غير صالح';
      setCouponState((p) => ({ ...p, loading: false, error: msg }));
      setDiscountAmount(0);
      toast.error(msg);
    }
  }, [couponCode, cart, cartTotal]);

  const clearCoupon = useCallback(() => {
    setCouponCode('');
    setCouponState({ id: null, code: null, discountAmount: 0, loading: false, error: null });
    setDiscountAmount(0);
  }, []);

  useEffect(() => { if (cart.length === 0 && couponState.id) clearCoupon(); }, [cart.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const cartTotalAfterDiscount = useMemo(() => Math.max(0, cartTotal - discountAmount), [cartTotal, discountAmount]);

  // Checkout submission
  const handleConfirmCheckout = async ({
    paymentType = 'FULL', // 'FULL' | 'PARTIAL' | 'LATER'
    paidAmount,
    payMethod = 'CASH',
    payments = [],
    autoPrint: _autoPrint,
  }) => {
    if (!activeBranchId) {
      toast.error('لم يتم تحديد الفرع. يرجى اختيار فرع ثم المحاولة مرة أخرى');
      return;
    }

    try {
      const payload = {
        type: orderType,
        source,
        tableId: orderType === 'DINE_IN' ? info.table : undefined,
        customerName: info.name?.trim() || undefined,
        customerPhone: info.phone?.trim() || undefined,
        address: orderType === 'DELIVERY' ? info.address?.trim() || undefined : undefined,
        couponId: couponState.id || undefined,
        discountAmount: !couponState.id && discountAmount > 0 ? discountAmount : undefined,
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

      // Only call payment endpoint if paymentType is FULL or PARTIAL and amount > 0 — use discounted total
      const effectiveTotal = cartTotalAfterDiscount;
      const actualPaid =
        paymentType === 'FULL'
          ? effectiveTotal
          : paymentType === 'PARTIAL'
          ? Math.min(effectiveTotal, Math.max(0, Number(paidAmount) || 0))
          : 0;

      if (orderId && Array.isArray(payments) && payments.length > 0) {
        let anySuccess = false;
        for (const p of payments) {
          const pAmt = Number(p.amount) || 0;
          if (pAmt > 0 && p.payMethod) {
            const payIdempotencyKey =
              typeof crypto !== 'undefined' && crypto.randomUUID
                ? crypto.randomUUID()
                : `pay-${Date.now()}-${Math.random()}`;
            try {
              await paymentMutation.mutateAsync({
                branchId: activeBranchId,
                orderId,
                idempotencyKey: payIdempotencyKey,
                payload: {
                  amount: pAmt,
                  paymentMethod: p.payMethod.toUpperCase(),
                  idempotencyKey: payIdempotencyKey,
                },
              });
              anySuccess = true;
            } catch (err) {
              console.warn('Split payment recording error:', err);
            }
          }
        }
        if (anySuccess) {
          toast.success('تم إنشاء الطلب وتسجيل الدفعات بنجاح');
        } else {
          toast.success('تم إنشاء وحفظ الطلب بنجاح');
        }
      } else if (orderId && actualPaid > 0 && paymentType !== 'LATER' && payMethod) {
        try {
          const payIdempotencyKey =
            typeof crypto !== 'undefined' && crypto.randomUUID
              ? crypto.randomUUID()
              : `pay-${Date.now()}-${Math.random()}`;

          await paymentMutation.mutateAsync({
            branchId: activeBranchId,
            orderId,
            idempotencyKey: payIdempotencyKey,
            payload: {
              amount: actualPaid,
              paymentMethod: payMethod.toUpperCase(),
              idempotencyKey: payIdempotencyKey,
            },
          });
          toast.success('تم إنشاء الطلب وتسجيل الدفع بنجاح');
        } catch (payErr) {
          console.warn('Payment recording error:', payErr);
          toast.warning('تم إنشاء الطلب بنجاح ولكن تعذر تسجيل الدفع. يمكنك تسجيل الدفعة من قائمة الطلبات');
        }
      } else {
        toast.success(paymentType === 'LATER' ? 'تم حفظ الطلب (الدفع لاحقاً)' : 'تم إنشاء وحفظ الطلب بنجاح');
      }

      setLastCreatedOrder(orderData);
      setCart([]);
      clearCoupon();
      setIsCheckoutModalOpen(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'حدث خطأ أثناء حفظ الطلب');
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
    cartTotalAfterDiscount,
    couponCode,
    setCouponCode,
    couponState,
    discountAmount,
    validateCoupon,
    clearCoupon,
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
