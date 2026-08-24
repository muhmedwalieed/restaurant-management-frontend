import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicMenuApi } from '../../../lib/api/menu.api.js';
import { createPublicOrderApi, trackOrderApi } from '../../../lib/api/orders.api.js';
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { Input } from '../../../shared/components/Input.jsx';
import { Select } from '../../../shared/components/Select.jsx';
import { StatusPill } from '../../../shared/components/StatusPill.jsx';
import { ORDER_STATUS_LABELS, orderStatusPill } from '../../orders/schemas/order.schema.js';
import { Store, Tag, Plus, Minus, ShoppingCart, PackageSearch, AlertCircle, CheckCircle2, Send } from 'lucide-react';

export const WebsiteOrderingPage = () => {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [selectedCatId, setSelectedCatId] = useState('ALL');
  const [tab, setTab] = useState('order');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [orderType, setOrderType] = useState('DELIVERY');
  const [address, setAddress] = useState('');
  const [placing, setPlacing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [submitError, setSubmitError] = useState(null);
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
    return () => { active = false; };
  }, [slug]);

  const categories = data?.categories || [];
  const restaurant = data?.restaurant || {};
  const filtered = selectedCatId === 'ALL' ? categories : categories.filter((c) => c.id === selectedCatId);
  const totalProducts = categories.reduce((a, c) => a + (c.products?.length || 0), 0);

  const addToCart = (p) => setCart((prev) => {
    const ex = prev.find((i) => i.productId === p.id);
    return ex ? prev.map((i) => (i.productId === p.id ? { ...i, quantity: i.quantity + 1 } : i)) : [...prev, { productId: p.id, name: p.name, unitPrice: Number(p.price), quantity: 1 }];
  });
  const changeQty = (id, d) => setCart((prev) => prev.map((i) => (i.productId === id ? { ...i, quantity: i.quantity + d } : i)).filter((i) => i.quantity > 0));
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
      const res = await createPublicOrderApi({
        restaurantId: restaurant.id,
        type: orderType,
        source: 'WEBSITE',
        customerPhone: phone,
        customerName: name || undefined,
        address: orderType === 'DELIVERY' ? address : undefined,
        items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      }, `web-${Date.now()}`);
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

  if (isLoading) return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-md space-y-4">
        <LoadingSkeleton height={90} className="w-full rounded-lg" />
        <LoadingSkeleton height={120} className="w-full rounded-lg" />
        <LoadingSkeleton height={120} className="w-full rounded-lg" />
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center px-4">
      <div className="bg-bg-surface border border-status-danger/30 rounded-lg p-8 text-center space-y-4 max-w-sm">
        <AlertCircle className="w-6 h-6 text-status-danger mx-auto" />
        <h1 className="text-lg font-bold text-txt-primary">المطعم غير متاح</h1>
        <p className="text-sm text-txt-muted">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Header */}
      <div className="border-b border-border-default">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            {restaurant.logoUrl ? (
              <img src={restaurant.logoUrl} alt={restaurant.name} className="w-16 h-16 object-cover rounded-lg border border-border-default" />
            ) : (
              <Store className="w-8 h-8 text-brand-primary" />
            )}
            <div>
              <h1 className="text-2xl font-bold text-txt-primary">{restaurant.name || 'مطعمنا'}</h1>
              {restaurant.description && <p className="text-sm text-txt-muted">{restaurant.description}</p>}
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <button onClick={() => setTab('order')} className={`px-4 py-2 rounded-full text-sm font-bold ${tab === 'order' ? 'bg-brand-primary text-white' : 'bg-bg-surface border border-border-default text-txt-muted'}`}>
              الطلب الآن
            </button>
            <button onClick={() => setTab('track')} className={`px-4 py-2 rounded-full text-sm font-bold ${tab === 'track' ? 'bg-brand-primary text-white' : 'bg-bg-surface border border-border-default text-txt-muted'}`}>
              تتبع الطلب
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {tab === 'track' ? (
          <div className="max-w-md mx-auto bg-bg-surface border border-border-default rounded-lg p-6 space-y-4">
            <h2 className="text-base font-bold text-txt-primary flex items-center gap-2"><PackageSearch className="w-5 h-5 text-brand-primary" /> تتبع الطلب</h2>
            <Input label="رقم الطلب" type="number" dir="ltr" value={trackNumber} onChange={(e) => setTrackNumber(e.target.value)} />
            <Input label="رقم الهاتف" dir="ltr" value={trackPhone} onChange={(e) => setTrackPhone(e.target.value)} />
            {trackError && <div className="p-3 rounded-md text-xs font-medium bg-status-danger-bg text-status-danger border border-status-danger/30 flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" /><span>{trackError}</span></div>}
            {trackResult && (
              <div className="bg-bg-base border border-border-default rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-txt-primary">#{trackResult.orderNumber}</span>
                  <StatusPill status={orderStatusPill(trackResult.status)}>{ORDER_STATUS_LABELS[trackResult.status] || trackResult.status}</StatusPill>
                </div>
                <p className="text-xs text-txt-muted">الإجمالي: <strong className="text-txt-primary">{Number(trackResult.total || 0).toFixed(2)} EGP</strong></p>
                <p className="text-xs text-txt-muted">{new Date(trackResult.createdAt).toLocaleString('ar-EG')}</p>
              </div>
            )}
            <div className="flex justify-center pt-2">
              <Button variant="primary" isLoading={tracking} onClick={handleTrack}>تتبع</Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Menu */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
                <button onClick={() => setSelectedCatId('ALL')} className={`px-3 py-2 rounded-full font-bold whitespace-nowrap ${selectedCatId === 'ALL' ? 'bg-brand-primary text-white' : 'bg-bg-surface border border-border-default text-txt-muted'}`}>الكل ({totalProducts})</button>
                {categories.map((c) => (
                  <button key={c.id} onClick={() => setSelectedCatId(c.id)} className={`px-3 py-2 rounded-full font-bold whitespace-nowrap ${selectedCatId === c.id ? 'bg-brand-primary text-white' : 'bg-bg-surface border border-border-default text-txt-muted'}`}>{c.name} ({c.products?.length || 0})</button>
                ))}
              </div>
              {filtered.map((cat) => (
                <div key={cat.id} className="space-y-2">
                  <h3 className="text-sm font-bold text-txt-primary flex items-center gap-2"><Tag className="w-4 h-4 text-brand-primary" />{cat.name}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {cat.products?.map((p) => (
                      <div key={p.id} className="bg-bg-surface border border-border-default rounded-lg p-3 flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0 space-y-1">
                          <h4 className="text-sm font-bold text-txt-primary">{p.name}</h4>
                          {p.description && <p className="text-xs text-txt-muted line-clamp-2">{p.description}</p>}
                          <span className="text-sm font-bold text-brand-primary">{Number(p.price).toFixed(2)} {restaurant.currency || 'EGP'}</span>
                        </div>
                        <Button variant="outline" size="sm" icon={Plus} onClick={() => addToCart(p)} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Cart + Checkout */}
            <div className="space-y-4">
              <div className="bg-bg-surface border border-border-default rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-bold text-txt-primary flex items-center gap-2"><ShoppingCart className="w-4 h-4 text-brand-primary" /> السلة ({cartCount})</h3>
                {cart.length === 0 ? <p className="text-xs text-txt-muted text-center py-4">السلة فارغة.</p> : (
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {cart.map((i) => (
                      <div key={i.productId} className="flex items-center justify-between gap-2 bg-bg-base border border-border-default rounded-md px-3 py-2">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-txt-primary truncate">{i.name}</p>
                          <p className="text-xs text-txt-muted">{(i.unitPrice * i.quantity).toFixed(2)} EGP</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button variant="outline" size="sm" icon={Minus} onClick={() => changeQty(i.productId, -1)} />
                          <span className="w-7 text-center text-xs font-bold text-txt-primary">{i.quantity}</span>
                          <Button variant="outline" size="sm" icon={Plus} onClick={() => changeQty(i.productId, 1)} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="pt-2 border-t border-border-default flex items-center justify-between">
                  <span className="text-sm font-semibold text-txt-primary">الإجمالي</span>
                  <span className="text-lg font-bold text-brand-primary">{cartTotal.toFixed(2)} EGP</span>
                </div>
              </div>

              <div className="bg-bg-surface border border-border-default rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-bold text-txt-primary">إتمام الطلب</h3>
                <Select label="نوع الطلب" options={[{ value: 'DELIVERY', label: 'توصيل' }, { value: 'PICKUP', label: 'استلام' }]} value={orderType} onChange={(e) => setOrderType(e.target.value)} />
                <Input label="اسم العميل" value={name} onChange={(e) => setName(e.target.value)} />
                <Input label="رقم الهاتف" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} />
                {orderType === 'DELIVERY' && <Input label="العنوان" value={address} onChange={(e) => setAddress(e.target.value)} />}
                {submitError && <div className="p-3 rounded-md text-xs font-medium bg-status-danger-bg text-status-danger border border-status-danger/30 flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" /><span>{submitError}</span></div>}
                {placedOrder && (
                  <div className="p-3 rounded-md text-xs font-medium bg-status-success-bg text-status-success border border-status-success/30 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 shrink-0" /><span>تم استلام طلبك #{placedOrder.orderNumber} بنجاح!</span></div>
                )}
                <Button variant="primary" className="w-full" icon={Send} isLoading={placing} onClick={placeOrder}>إرسال الطلب</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};