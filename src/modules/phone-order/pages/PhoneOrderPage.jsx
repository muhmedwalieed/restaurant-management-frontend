import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBranch } from '../../auth/context/BranchContext.jsx';
import { useProductsQuery, useCategoriesQuery } from '../../menu/hooks/useMenu.js';
import { useLookupCallerMutation, useCreatePhoneOrderMutation } from '../hooks/usePhoneOrder.js';
import { Button } from '../../../shared/components/Button.jsx';
import { Input } from '../../../shared/components/Input.jsx';
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
  AlertCircle,
  CheckCircle2,
  History,
  Search,
  Trash2,
  Layers,
  Bike,
  ShoppingBag,
} from 'lucide-react';

export const PhoneOrderPage = () => {
  const navigate = useNavigate();
  const { activeBranchId } = useBranch();
  const { data: productsResponse, isLoading: isProductsLoading } = useProductsQuery({ page: 1, limit: 100, status: 'ACTIVE' });
  const { data: categoriesResponse } = useCategoriesQuery({ page: 1, limit: 100, status: 'ACTIVE' });
  const products = useMemo(() => productsResponse?.items || [], [productsResponse]);
  const categories = categoriesResponse?.items || [];

  const lookupMutation = useLookupCallerMutation();
  const createMutation = useCreatePhoneOrderMutation();

  const [phone, setPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [caller, setCaller] = useState(null);
  const [lookupError, setLookupError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState('DELIVERY');
  const [notes, setNotes] = useState('');
  const [successMsg, setSuccessMsg] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  // Live lookup debounce when typing a valid phone number (>= 8 chars)
  useEffect(() => {
    const cleanPhone = phone.trim();
    if (cleanPhone.length >= 8) {
      const timer = setTimeout(async () => {
        try {
          setLookupError(null);
          const data = await lookupMutation.mutateAsync(cleanPhone);
          if (data) {
            setCaller(data);
            if (data.customer?.name && !data.customer.name.startsWith('عميل هاتف')) {
              setCustomerName(data.customer.name);
            }
            if (data.defaultAddress) {
              const addr = [data.defaultAddress.street, data.defaultAddress.city].filter(Boolean).join(' - ');
              if (addr) setDeliveryAddress(addr);
            }
          }
        } catch {
          // Silent catch for live lookup typing
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setCaller(null);
    }
  }, [phone, lookupMutation]);

  // Filter products by category and search
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = selectedCategory === 'ALL' || p.categoryId === selectedCategory;
      const matchesSearch = !searchTerm.trim() || p.name?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [products, selectedCategory, searchTerm]);

  const addToCart = (p) => {
    setSuccessMsg(null);
    setSubmitError(null);
    setCart((prev) => {
      const ex = prev.find((i) => i.productId === p.id);
      return ex
        ? prev.map((i) => (i.productId === p.id ? { ...i, quantity: i.quantity + 1 } : i))
        : [...prev, { productId: p.id, name: p.name, unitPrice: Number(p.price), quantity: 1 }];
    });
  };

  const changeQty = (id, d) =>
    setCart((prev) =>
      prev.map((i) => (i.productId === id ? { ...i, quantity: i.quantity + d } : i)).filter((i) => i.quantity > 0)
    );

  const cartTotal = cart.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const placeOrder = async () => {
    setSubmitError(null);
    setSuccessMsg(null);
    if (!phone.trim()) return setSubmitError('أدخل رقم هاتف العميل أولًا.');
    if (orderType === 'DELIVERY' && !customerName.trim()) return setSubmitError('اسم العميل مطلوب للتوصيل.');
    if (cart.length === 0) return setSubmitError('أضف صنفاً واحداً على الأقل للطلب.');

    let fullNotes = notes.trim();
    if (orderType === 'DELIVERY' && deliveryAddress.trim()) {
      fullNotes = [fullNotes, `العنوان: ${deliveryAddress.trim()}`].filter(Boolean).join(' | ');
    }

    try {
      const res = await createMutation.mutateAsync({
        branchId: activeBranchId,
        payload: {
          type: orderType,
          customerPhone: phone.trim(),
          customerName: customerName.trim() || undefined,
          notes: fullNotes || undefined,
          items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        },
      });
      setSuccessMsg(`تم إنشاء طلب الهاتف #${res.orderNumber} بنجاح.`);
      setCart([]);
      setNotes('');
      setCaller(null);
      setPhone('');
      setCustomerName('');
      setDeliveryAddress('');
    } catch (err) {
      setSubmitError(err?.message || 'حدث خطأ أثناء إنشاء الطلب.');
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. Header: Aligned Title & Secondary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-xl font-bold text-txt-primary flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-brand-primary" />
            <span>طلبات الهاتف والتوصيل</span>
          </h1>
          <p className="text-xs text-txt-muted mt-1">
            استقبال المكالمات، تسجيل العملاء، وإنشاء طلبات الدليفري والاستلام.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={ReceiptText}
            onClick={() => navigate('/orders')}
            className="text-xs"
          >
            العودة للطلبات
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3 rounded-lg text-xs font-medium bg-status-success-bg text-status-success border border-status-success/30 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {submitError && (
        <div className="p-3 rounded-lg text-xs font-medium bg-status-danger-bg text-status-danger border border-status-danger/30 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* 2. 3-Step Natural Ergonomic Workflow Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ================= STEP 1: Caller & Customer Info (Right Column ~ 28% / lg:col-span-3) ================= */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-bg-surface border border-border-default rounded-xl p-4 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
              <User className="w-4 h-4 text-brand-primary shrink-0" />
              <h3 className="text-xs font-bold text-txt-primary">الخطوة 1: بيانات المتصل</h3>
            </div>

            {/* Phone Input with Live Search */}
            <div className="space-y-2">
              <Input
                label="رقم الهاتف"
                required
                dir="ltr"
                icon={PhoneCall}
                placeholder="01xxxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={lookupError}
              />
            </div>

            {/* Customer Name */}
            <div className="space-y-2">
              <Input
                label="اسم العميل"
                icon={User}
                placeholder="اسم المتصل"
                required={orderType === 'DELIVERY'}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            {/* Order Type Toggle */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-txt-primary block">نوع الطلب</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOrderType('DELIVERY')}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                    orderType === 'DELIVERY'
                      ? 'bg-white text-slate-950 border-white shadow-sm'
                      : 'bg-bg-base/60 text-txt-muted border-border-default hover:text-txt-primary'
                  }`}
                >
                  <Bike className="w-3.5 h-3.5" />
                  <span>توصيل</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('PICKUP')}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                    orderType === 'PICKUP'
                      ? 'bg-white text-slate-950 border-white shadow-sm'
                      : 'bg-bg-base/60 text-txt-muted border-border-default hover:text-txt-primary'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>استلام</span>
                </button>
              </div>
            </div>

            {/* Delivery Address Field */}
            {orderType === 'DELIVERY' && (
              <div className="space-y-2">
                <Input
                  label="عنوان التوصيل"
                  required
                  icon={MapPin}
                  placeholder="الشارع، المنطقة، رقم العقار..."
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                />
              </div>
            )}

            {/* Existing Caller Insights (Recent orders & saved address) */}
            {caller && (
              <div className="pt-3 border-t border-white/[0.06] space-y-3">
                <div className="bg-bg-base/60 border border-border-subtle rounded-lg p-2.5 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-txt-muted">
                    <span>حالة العميل:</span>
                    <span className="font-semibold text-status-success">عميل مسجل سابقاً</span>
                  </div>
                  {caller.defaultAddress && (
                    <div className="text-[11px] text-txt-muted leading-relaxed">
                      العنوان المسجل: {[caller.defaultAddress.street, caller.defaultAddress.city].filter(Boolean).join('، ')}
                    </div>
                  )}
                </div>

                {caller.recentOrders && caller.recentOrders.length > 0 && (
                  <div className="space-y-1.5">
                    <h4 className="text-[11px] font-bold text-txt-primary flex items-center gap-1">
                      <History className="w-3.5 h-3.5 text-brand-primary" />
                      <span>آخر الطلبات ({caller.recentOrders.length}):</span>
                    </h4>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                      {caller.recentOrders.slice(0, 3).map((o) => (
                        <div
                          key={o.id}
                          className="flex items-center justify-between bg-bg-base/40 border border-border-subtle rounded-md p-2 text-[11px]"
                        >
                          <span className="font-mono font-bold text-txt-primary">#{o.orderNumber}</span>
                          <StatusPill status={orderStatusPill(o.status)} className="px-2 py-0.5 text-[10px]">
                            {ORDER_STATUS_LABELS[o.status] || o.status}
                          </StatusPill>
                          <span className="font-mono font-bold text-brand-primary">
                            {Number(o.total || 0).toFixed(2)} EGP
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ================= STEP 2: Main Product Catalog (Center Column ~ 44% / lg:col-span-5) ================= */}
        <div className="lg:col-span-5 space-y-4">
          {/* Quick Filters Bar (Categories & Search) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Horizontal Scrollable Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full custom-scrollbar">
              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  selectedCategory === 'ALL'
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'bg-bg-surface text-txt-muted border border-border-default hover:text-txt-primary hover:border-white/10'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>الكل ({products.length})</span>
              </button>

              {categories.map((cat) => {
                const count = products.filter((p) => p.categoryId === cat.id).length;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      isSelected
                        ? 'bg-white text-slate-950 font-semibold shadow-sm'
                        : 'bg-bg-surface text-txt-muted border border-border-default hover:text-txt-primary hover:border-white/10'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] opacity-70 mr-1 font-mono">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="w-full sm:w-44 shrink-0">
              <Input
                placeholder="بحث..."
                icon={Search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-xs h-9 min-h-[36px]"
              />
            </div>
          </div>

          {/* Product Grid with Generous Card Width & Multi-line Titles */}
          {isProductsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-36 bg-bg-surface/50 border border-border-default rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <EmptyState
              title="لا توجد منتجات مطابقة"
              description="جرب البحث باسم صنف آخر."
              icon={ReceiptText}
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {filteredProducts.map((p) => {
                const inCartItem = cart.find((i) => i.productId === p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => addToCart(p)}
                    className={`relative group bg-bg-surface rounded-xl p-3 text-right flex flex-col justify-between transition-all duration-150 active:scale-[0.98] border min-w-[130px] ${
                      inCartItem
                        ? 'border-brand-primary/60 bg-brand-primary/[0.03] shadow-sm'
                        : 'border-border-default hover:border-white/20 hover:bg-white/[0.02]'
                    }`}
                  >
                    {/* Add to cart quantity Badge */}
                    {inCartItem && (
                      <span className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 text-xs font-mono font-bold bg-brand-primary text-slate-950 rounded-full shadow-md">
                        {inCartItem.quantity}×
                      </span>
                    )}

                    {/* Top Row: Category Badge */}
                    <div className="flex items-center justify-between w-full mb-2">
                      <span className="text-[10px] font-medium text-txt-muted bg-white/[0.06] px-2 py-0.5 rounded truncate max-w-[85%]">
                        {p.category?.name || 'صنف'}
                      </span>
                    </div>

                    {/* Center: Image OR Clean Centered Typography Box */}
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-20 object-cover rounded-lg mb-2 group-hover:opacity-95 transition-opacity"
                      />
                    ) : (
                      <div className="w-full h-16 rounded-lg bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.04] p-2 flex items-center justify-center mb-2">
                        <p className="text-sm font-semibold text-slate-100 line-clamp-2 text-center leading-snug">
                          {p.name}
                        </p>
                      </div>
                    )}

                    {/* Bottom Row: Name (only if image exists) + Price and Add Action */}
                    <div className="space-y-1 w-full mt-auto">
                      {p.imageUrl && (
                        <p className="text-xs font-bold text-txt-primary line-clamp-1 group-hover:text-brand-primary transition-colors">
                          {p.name}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-0.5">
                        <span className="text-xs font-bold text-brand-primary font-mono tabular-nums">
                          {Number(p.price).toFixed(2)} EGP
                        </span>
                        <span className="text-[10px] font-semibold text-txt-muted group-hover:text-white transition-colors">
                          + إضافة
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ================= STEP 3: Unified Cart & Checkout (Left Column ~ 28% / lg:col-span-4) ================= */}
        <div className="lg:col-span-4 lg:sticky lg:top-4">
          <div className="bg-bg-surface border border-border-default rounded-xl overflow-hidden shadow-sm flex flex-col">
            {/* Cart Header */}
            <div className="p-4 border-b border-border-default flex items-center justify-between bg-bg-base/40">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-brand-primary" />
                <h3 className="text-xs font-bold text-txt-primary">
                  الخطوة 3: سلة الطلب ({cartCount})
                </h3>
              </div>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCart([])}
                  className="text-[11px] font-medium text-txt-muted hover:text-red-400 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>تفريغ</span>
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="p-3 max-h-60 overflow-y-auto space-y-2 custom-scrollbar">
              {cart.length === 0 ? (
                <div className="py-8 text-center space-y-1">
                  <p className="text-xs font-medium text-txt-muted">السلة فارغة • اضغط على الأصناف لإضافتها</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between gap-2 bg-bg-base/60 border border-border-subtle rounded-lg p-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-txt-primary truncate">{item.name}</p>
                      <p className="text-[11px] text-txt-muted font-mono" dir="ltr">
                        {item.unitPrice.toFixed(2)} × {item.quantity} = {(item.unitPrice * item.quantity).toFixed(2)} EGP
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => changeQty(item.productId, -1)}
                        className="w-6 h-6 rounded bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.06] flex items-center justify-center text-txt-primary text-xs transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-mono font-bold text-txt-primary">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => changeQty(item.productId, 1)}
                        className="w-6 h-6 rounded bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.06] flex items-center justify-center text-txt-primary text-xs transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Notes & Order Summary Footer */}
            <div className="p-4 border-t border-border-default bg-bg-base/30 space-y-3">
              <div>
                <label className="text-xs font-medium text-txt-primary block mb-1">
                  ملاحظات وتوجيهات الطلب
                </label>
                <textarea
                  rows={2}
                  placeholder="مثال: بدون بصل، صوص زيادة..."
                  className="w-full bg-bg-surface text-txt-primary placeholder:text-txt-muted border border-border-default rounded-md text-xs px-3 py-2 focus-visible:outline-none focus-visible:border-brand-primary resize-none"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Total & Submit Action */}
              <div className="pt-2 border-t border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-txt-muted">الإجمالي النهائي:</span>
                  <span className="text-base font-bold text-white font-mono tabular-nums">
                    {cartTotal.toFixed(2)} EGP
                  </span>
                </div>

                <PermissionGate permission="orders.create">
                  <Button
                    size="md"
                    className="w-full bg-white text-slate-950 font-bold hover:bg-slate-200 disabled:bg-white/10 disabled:text-txt-muted disabled:cursor-not-allowed border-none shadow-sm transition-all"
                    disabled={!phone.trim() || (orderType === 'DELIVERY' && !customerName.trim()) || cart.length === 0 || createMutation.isPending}
                    isLoading={createMutation.isPending}
                    onClick={placeOrder}
                  >
                    إنشاء طلب الهاتف ({cartTotal.toFixed(2)} EGP)
                  </Button>
                </PermissionGate>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};