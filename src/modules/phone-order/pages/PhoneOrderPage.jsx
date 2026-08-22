import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBranch } from '../../auth/context/BranchContext.jsx';
import { useProductsQuery } from '../../menu/hooks/useMenu.js';
import { useLookupCallerMutation, useCreatePhoneOrderMutation } from '../hooks/usePhoneOrder.js';
import { Button } from '../../../shared/components/Button.jsx';
import { Input } from '../../../shared/components/Input.jsx';
import { Select } from '../../../shared/components/Select.jsx';
import { StatusPill } from '../../../shared/components/StatusPill.jsx';
import { PermissionGate } from '../../../shared/components/PermissionGate.jsx';
import { EmptyState } from '../../../shared/components/EmptyState.jsx';
import { ORDER_STATUS_LABELS, orderStatusPill } from '../../orders/schemas/order.schema.js';
import {
  PhoneCall,
  User,
  MapPin,
  ReceiptText,
  Plus,
  Minus,
  ShoppingCart,
  Send,
  AlertCircle,
  CheckCircle2,
  History,
} from 'lucide-react';

export const PhoneOrderPage = () => {
  const navigate = useNavigate();
  const { activeBranchId, activeBranch } = useBranch();
  const { data: productsResponse } = useProductsQuery({ page: 1, limit: 100, status: 'ACTIVE' });
  const products = productsResponse?.items || [];
  const lookupMutation = useLookupCallerMutation();
  const createMutation = useCreatePhoneOrderMutation();

  const [phone, setPhone] = useState('');
  const [caller, setCaller] = useState(null);
  const [lookupError, setLookupError] = useState(null);
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState('DELIVERY');
  const [notes, setNotes] = useState('');
  const [successMsg, setSuccessMsg] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const handleLookup = async () => {
    setLookupError(null);
    setCaller(null);
    if (!phone.trim()) return setLookupError('أدخل رقم الهاتف أولًا.');
    try {
      setCaller(await lookupMutation.mutateAsync(phone.trim()));
    } catch (err) {
      setLookupError(err?.message || 'تعذر البحث عن العميل.');
    }
  };

  const addToCart = (p) => setCart((prev) => {
    const ex = prev.find((i) => i.productId === p.id);
    return ex ? prev.map((i) => (i.productId === p.id ? { ...i, quantity: i.quantity + 1 } : i)) : [...prev, { productId: p.id, name: p.name, unitPrice: Number(p.price), quantity: 1 }];
  });
  const changeQty = (id, d) => setCart((prev) => prev.map((i) => (i.productId === id ? { ...i, quantity: i.quantity + d } : i)).filter((i) => i.quantity > 0));
  const cartTotal = cart.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const placeOrder = async () => {
    setSubmitError(null);
    setSuccessMsg(null);
    if (!caller) return setSubmitError('ابحث عن العميل أولًا.');
    if (cart.length === 0) return setSubmitError('أضف منتجات للطلب أولًا.');
    setSubmitError(null);
    try {
      const res = await createMutation.mutateAsync({
        branchId: activeBranchId,
        payload: {
          type: orderType,
          customerPhone: caller.customer.phone,
          customerName: caller.customer.name || undefined,
          notes: notes || undefined,
          items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        },
      });
      setSuccessMsg(`تم إنشاء طلب الهاتف #${res.orderNumber} بنجاح.`);
      setCart([]);
      setNotes('');
      setCaller(null);
      setPhone('');
    } catch (err) {
      setSubmitError(err?.message || 'حدث خطأ أثناء إنشاء الطلب.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-txt-primary flex items-center gap-2">
            <PhoneCall className="w-6 h-6 text-brand-primary" />
            <span>الطلب الهاتفي</span>
          </h1>
          <p className="text-xs text-txt-muted mt-1">بحث عن المتصل وإنشاء طلب هاتف — {activeBranch?.name || ''}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/orders')}>عرض الطلبات</Button>
      </div>

      {successMsg && (
        <div className="p-3 rounded-md text-xs font-medium bg-status-success-bg text-status-success border border-status-success/30 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {submitError && (
        <div className="p-3 rounded-md text-xs font-medium bg-status-danger-bg text-status-danger border border-status-danger/30 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Caller search + profile */}
        <div className="space-y-4">
          <div className="bg-bg-surface border border-border-default rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-bold text-txt-primary">بحث المتصل</h3>
            <Input label="رقم الهاتف" dir="ltr" icon={PhoneCall} value={phone} onChange={(e) => setPhone(e.target.value)} />
            {lookupError && <div className="p-3 rounded-md text-xs font-medium bg-status-danger-bg text-status-danger border border-status-danger/30 flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" /><span>{lookupError}</span></div>}
            <Button variant="primary" className="w-full" isLoading={lookupMutation.isPending} onClick={handleLookup}>بحث</Button>
          </div>

          {caller && (
            <div className="bg-bg-surface border border-border-default rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-brand-primary" />
                <h3 className="text-sm font-bold text-txt-primary">{caller.customer.name}</h3>
              </div>
              <p className="text-xs text-txt-muted dir-ltr flex items-center gap-1"><PhoneCall className="w-3 h-3" />{caller.customer.phone}</p>
              <p className="text-xs text-txt-muted flex items-center gap-1">
                <MapPin className="w-3 h-3 text-brand-primary" />
                {caller.defaultAddress ? `${caller.defaultAddress.street || ''} ${caller.defaultAddress.city || ''}`.trim() : 'لا يوجد عنوان افتراضي'}
              </p>

              <div className="pt-2 border-t border-border-default">
                <h4 className="text-xs font-bold text-txt-primary flex items-center gap-1.5 mb-2"><History className="w-3.5 h-3.5 text-brand-primary" /> آخر الطلبات</h4>
                {caller.recentOrders.length === 0 ? (
                  <p className="text-xs text-txt-muted">لا توجد طلبات سابقة.</p>
                ) : (
                  <div className="space-y-1.5">
                    {caller.recentOrders.map((o) => (
                      <div key={o.id} className="flex items-center justify-between bg-bg-base border border-border-default rounded-md px-2.5 py-1.5">
                        <span className="font-mono font-bold text-xs text-txt-primary">#{o.orderNumber}</span>
                        <StatusPill status={orderStatusPill(o.status)}>{ORDER_STATUS_LABELS[o.status] || o.status}</StatusPill>
                        <span className="text-[11px] font-bold text-txt-primary">{Number(o.total || 0).toFixed(2)} EGP</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Products */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-txt-primary">المنتجات</h3>
          {products.length === 0 ? (
            <EmptyState title="لا توجد منتجات" description="أضف منتجات للمنيو أولًا." icon={ReceiptText} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {products.map((p) => (
                <button key={p.id} type="button" onClick={() => addToCart(p)} className="bg-bg-surface border border-border-default rounded-xl p-3 text-right hover:border-brand-primary/50 transition-colors">
                  <p className="text-xs font-bold text-txt-primary truncate">{p.name}</p>
                  <p className="text-[11px] font-bold text-brand-primary">{Number(p.price).toFixed(2)} EGP</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Cart + submit */}
        <div className="space-y-4">
          <div className="bg-bg-surface border border-border-default rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-bold text-txt-primary flex items-center gap-2"><ShoppingCart className="w-4 h-4 text-brand-primary" /> السلة ({cartCount})</h3>
            {cart.length === 0 ? <p className="text-xs text-txt-muted text-center py-4">السلة فارغة.</p> : (
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {cart.map((i) => (
                  <div key={i.productId} className="flex items-center justify-between gap-2 bg-bg-base border border-border-default rounded-lg px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-txt-primary truncate">{i.name}</p>
                      <p className="text-[11px] text-txt-muted">{(i.unitPrice * i.quantity).toFixed(2)} EGP</p>
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

          <div className="bg-bg-surface border border-border-default rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-bold text-txt-primary">إتمام الطلب</h3>
            <Select label="نوع الطلب" options={[{ value: 'DELIVERY', label: 'توصيل' }, { value: 'PICKUP', label: 'استلام' }]} value={orderType} onChange={(e) => setOrderType(e.target.value)} />
            <textarea rows={2} placeholder="ملاحظات (اختياري)" className="w-full bg-bg-base text-txt-primary placeholder:text-txt-muted border border-border-default rounded-md text-xs px-3 py-2 focus-visible:outline-none focus-visible:border-brand-primary" value={notes} onChange={(e) => setNotes(e.target.value)} />
            <PermissionGate permission="orders.create">
              <Button variant="primary" className="w-full" icon={Send} isLoading={createMutation.isPending} onClick={placeOrder}>إنشاء طلب الهاتف</Button>
            </PermissionGate>
          </div>
        </div>
      </div>
    </div>
  );
};