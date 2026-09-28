import { useState, useEffect } from 'react';
import { getPublicMenuApi } from '../../../lib/api/menu.api.js';
import { createPublicOrderApi, trackOrderApi } from '../../../lib/api/orders.api.js';

export const useWebsiteOrdering = (slug) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [selectedCatId, setSelectedCatId] = useState('ALL');
  const [tab, setTab] = useState('order');

  // Checkout form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [orderType, setOrderType] = useState('DELIVERY');
  const [address, setAddress] = useState('');
  const [placing, setPlacing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  // Tracking
  const [trackNumber, setTrackNumber] = useState('');
  const [trackPhone, setTrackPhone] = useState('');
  const [trackResult, setTrackResult] = useState(null);
  const [trackError, setTrackError] = useState(null);
  const [tracking, setTracking] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await getPublicMenuApi({ slug });
        if (active) setData(res);
      } catch (err) {
        if (active) setError(err?.message || 'تعذر تحميل قائمة الطعام.');
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [slug]);

  const addToCart = (p) =>
    setCart((prev) => {
      const ex = prev.find((i) => i.productId === p.id);
      return ex
        ? prev.map((i) => (i.productId === p.id ? { ...i, quantity: i.quantity + 1 } : i))
        : [...prev, { productId: p.id, name: p.name, unitPrice: Number(p.price), quantity: 1 }];
    });

  const changeQty = (id, delta) =>
    setCart((prev) =>
      prev
        .map((i) => (i.productId === id ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    );

  const cartTotal = cart.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const placeOrder = async () => {
    setSubmitError(null);
    setPlacedOrder(null);
    if (cart.length === 0) return setSubmitError('أضف منتجات للسلة أولًا.');
    if (!name.trim()) return setSubmitError('اسم العميل مطلوب.');
    if (!phone.trim()) return setSubmitError('رقم الهاتف مطلوب.');
    if (orderType === 'DELIVERY' && !address.trim()) return setSubmitError('العنوان مطلوب للتوصيل.');

    setPlacing(true);
    try {
      const res = await createPublicOrderApi(
        {
          restaurantId: data?.restaurant?.id,
          type: orderType,
          source: 'WEBSITE',
          customerPhone: phone,
          customerName: name || undefined,
          address: orderType === 'DELIVERY' ? address : undefined,
          items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        },
        `web-${Date.now()}`
      );
      setPlacedOrder(res);
      setCart([]);
      setAddress('');
    } catch (err) {
      setSubmitError(err?.message || 'حدث خطأ أثناء إرسال الطلب.');
    } finally {
      setPlacing(false);
    }
  };

  const handleTrack = async () => {
    setTrackError(null);
    setTrackResult(null);
    if (!trackNumber.trim() || !trackPhone.trim()) return setTrackError('أدخل رقم الطلب والهاتف.');
    setTracking(true);
    try {
      setTrackResult(await trackOrderApi({ slug, orderNumber: Number(trackNumber), phone: trackPhone }));
    } catch (err) {
      setTrackError(err?.message || 'لم نجد الطلب بهذه البيانات.');
    } finally {
      setTracking(false);
    }
  };

  return {
    data,
    isLoading,
    error,
    tab,
    setTab,
    selectedCatId,
    setSelectedCatId,
    cart,
    addToCart,
    changeQty,
    cartTotal,
    cartCount,
    // Checkout Form
    name,
    setName,
    phone,
    setPhone,
    orderType,
    setOrderType,
    address,
    setAddress,
    placing,
    placedOrder,
    submitError,
    placeOrder,
    // Tracking
    trackNumber,
    setTrackNumber,
    trackPhone,
    setTrackPhone,
    trackResult,
    trackError,
    tracking,
    handleTrack,
  };
};
