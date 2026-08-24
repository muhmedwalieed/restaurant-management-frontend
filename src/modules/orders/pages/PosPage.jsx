import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductsQuery, useCategoriesQuery } from '../../menu/hooks/useMenu.js';
import { useTablesQuery } from '../../tables/hooks/useTables.js';
import { useBranch } from '../../auth/context/BranchContext.jsx';
import { useCreatePosOrderMutation } from '../hooks/useOrders.js';
import { lookupCallerApi } from '../../../lib/api/phone-order.api.js';
import { Select } from '../../../shared/components/Select.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { PermissionGate } from '../../../shared/components/PermissionGate.jsx';
import { Input } from '../../../shared/components/Input.jsx';
import { EmptyState } from '../../../shared/components/EmptyState.jsx';
import {
  Utensils,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  CheckCircle2,
  AlertCircle,
  Users,
  Phone,
  Search,
  ReceiptText,
  Layers,
  MapPin,
  Bike,
  ShoppingBag,
  History,
} from 'lucide-react';

export const PosPage = () => {
  const navigate = useNavigate();
  const { activeBranchId, activeBranch } = useBranch();
  const { data: productsResponse, isLoading: isProductsLoading } = useProductsQuery({ page: 1, limit: 100, status: 'ACTIVE' });
  const { data: categoriesResponse } = useCategoriesQuery({ page: 1, limit: 100, status: 'ACTIVE' });
  const { data: tablesResponse } = useTablesQuery(activeBranchId, { page: 1, limit: 100, status: 'AVAILABLE' });
  const createPosMutation = useCreatePosOrderMutation();

  const products = useMemo(() => productsResponse?.items || [], [productsResponse]);
  const categories = categoriesResponse?.items || [];
  const tables = tablesResponse?.items || [];

  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]); // [{ productId, name, unitPrice, quantity }]
  const [orderType, setOrderType] = useState('DINE_IN');
  const [tableId, setTableId] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [caller, setCaller] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Phone lookup auto-fill: typing a valid number fetches customer name + default address + recent orders
  useEffect(() => {
    const cleanPhone = customerPhone.trim();
    if (cleanPhone.length < 8) {
      setCaller(null);
      return undefined;
    }
    const timer = setTimeout(async () => {
      try {
        const data = await lookupCallerApi(cleanPhone);
        if (!data) return;
        setCaller(data);
        if (data.customer?.name && !data.customer.name.startsWith('عميل هاتف') && !customerName.trim()) {
          setCustomerName(data.customer.name);
        }
        if (data.defaultAddress && !address.trim()) {
          const addr = [data.defaultAddress.street, data.defaultAddress.city].filter(Boolean).join('، ');
          if (addr) setAddress(addr);
        }
      } catch {
        // Silent catch while typing
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [customerPhone, customerName, address]);

  // Filter products by category and search
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = selectedCategory === 'ALL' || p.categoryId === selectedCategory;
      const matchesSearch = !searchTerm.trim() || p.name?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [products, selectedCategory, searchTerm]);

  const addToCart = (product) => {
    setSuccessMsg(null);
    setErrorMsg(null);
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) => (i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { productId: product.id, name: product.name, unitPrice: Number(product.price), quantity: 1 }];
    });
  };

  const changeQty = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((i) => (i.productId === productId ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const total = cart.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const handleSubmit = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (cart.length === 0) {
      setErrorMsg('أضف منتجات للسلة قبل الإرسال.');
      return;
    }
    if (orderType === 'DINE_IN' && !tableId) {
      setErrorMsg('اختر الطاولة للطلبات الداخلية.');
      return;
    }
    if (orderType === 'DELIVERY') {
      if (!customerName.trim()) {
        setErrorMsg('اسم العميل مطلوب للتوصيل.');
        return;
      }
      if (!customerPhone.trim()) {
        setErrorMsg('رقم هاتف العميل مطلوب للتوصيل.');
        return;
      }
      if (!address.trim()) {
        setErrorMsg('عنوان التوصيل مطلوب.');
        return;
      }
    } else if (orderType === 'PICKUP' && !customerPhone.trim()) {
      setErrorMsg('رقم هاتف العميل مطلوب للاستلام.');
      return;
    }
    try {
      const payload = {
        type: orderType,
        tableId: orderType === 'DINE_IN' ? tableId : undefined,
        customerPhone: customerPhone || undefined,
        customerName: customerName || undefined,
        address: orderType === 'DELIVERY' ? address : undefined,
        notes: notes || undefined,
        items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      };
      const res = await createPosMutation.mutateAsync({
        branchId: activeBranchId,
        payload,
        idempotencyKey: `pos-${Date.now()}`,
      });
      setSuccessMsg(`تم إنشاء الطلب #${res.orderNumber} بنجاح.`);
      setCart([]);
      setTableId('');
      setCustomerPhone('');
      setCustomerName('');
      setAddress('');
      setNotes('');
      setCaller(null);
    } catch (err) {
      setErrorMsg(err?.message || 'حدث خطأ أثناء إنشاء الطلب.');
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. Header: Aligned Title, Branch info, and Secondary Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-xl font-bold text-txt-primary flex items-center gap-2">
            <Utensils className="w-5 h-5 text-brand-primary" />
            <span>نقطة البيع وإداراة الطلبات (POS)</span>
          </h1>
          <p className="text-xs text-txt-muted mt-1">
            منصة موحدة لإنشاء كافة أنواع الطلبات (صالة، استلام، توصيل)، {activeBranch?.name || 'الفرع الحالي'}.
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
            عرض سجل الطلبات
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
      {errorMsg && (
        <div className="p-3 rounded-lg text-xs font-medium bg-status-danger-bg text-status-danger border border-status-danger/30 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2. Main POS Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left/Right Main Column: Categories, Search, and Product Grid (Spans 8 cols on large) */}
        <div className="lg:col-span-8 space-y-4">
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

            {/* Quick Search Field */}
            <div className="w-full sm:w-52 shrink-0">
              <Input
                placeholder="بحث عن صنف..."
                icon={Search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-xs h-9 min-h-[36px]"
              />
            </div>
          </div>

          {/* Products Grid */}
          {isProductsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-36 bg-bg-surface/50 border border-border-default rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <EmptyState
              title="لا توجد منتجات مطابقة"
              description="جرب البحث بكلمة أخرى أو اختر تصنيفاً مختلفاً."
              icon={Utensils}
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
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

        {/* 3. Unified Sticky Cart Panel (Spans 4 cols on large) */}
        <div className="lg:col-span-4 lg:sticky lg:top-4">
          <div className="bg-bg-surface border border-border-default rounded-xl overflow-hidden shadow-sm flex flex-col">
            {/* Cart Header */}
            <div className="p-4 border-b border-border-default flex items-center justify-between bg-bg-base/40">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-brand-primary" />
                <h3 className="text-xs font-bold text-txt-primary">
                  السلة الحالية ({itemCount})
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
            <div className="p-3 max-h-56 overflow-y-auto space-y-2 custom-scrollbar">
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

            {/* Embedded Order Settings Section */}
            <div className="p-4 border-t border-border-default bg-bg-base/30 space-y-3">
              {/* Segmented Control for Order Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-txt-primary block">نوع الطلب</label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-bg-base/80 border border-border-default rounded-lg">
                  <button
                    type="button"
                    onClick={() => setOrderType('DINE_IN')}
                    className={`py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                      orderType === 'DINE_IN'
                        ? 'bg-white text-slate-950 shadow-sm'
                        : 'text-txt-muted hover:text-txt-primary'
                    }`}
                  >
                    <Utensils className="w-4 h-4" />
                    <span>صالة</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('PICKUP')}
                    className={`py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                      orderType === 'PICKUP'
                        ? 'bg-white text-slate-950 shadow-sm'
                        : 'text-txt-muted hover:text-txt-primary'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>استلام</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('DELIVERY')}
                    className={`py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                      orderType === 'DELIVERY'
                        ? 'bg-white text-slate-950 shadow-sm'
                        : 'text-txt-muted hover:text-txt-primary'
                    }`}
                  >
                    <Bike className="w-4 h-4" />
                    <span>توصيل</span>
                  </button>
                </div>
              </div>

              {orderType === 'DINE_IN' ? (
                <Select
                  label="رقم الطاولة"
                  required
                  placeholder="اختر الطاولة..."
                  options={tables.map((t) => ({ value: t.id, label: `طاولة ${t.label}` }))}
                  value={tableId}
                  onChange={(e) => setTableId(e.target.value)}
                />
              ) : (
                <div className="space-y-2.5">
                  <Input
                    label="رقم هاتف العميل"
                    dir="ltr"
                    icon={Phone}
                    placeholder="01xxxxxxxxx"
                    required={orderType === 'DELIVERY'}
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                  <Input
                    label="اسم العميل"
                    icon={Users}
                    placeholder="اسم العميل"
                    required={orderType === 'DELIVERY'}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                  {orderType === 'DELIVERY' && (
                    <Input
                      label="عنوان التوصيل"
                      icon={MapPin}
                      placeholder="عنوان الشارع/المنطقة..."
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  )}
                </div>
              )}

              {/* Caller History Badge / Quick Info if found */}
              {caller?.recentOrders && caller.recentOrders.length > 0 && (
                <div className="p-2.5 bg-bg-surface-elevated/60 border border-border-default rounded-lg space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-bold text-txt-primary">
                    <span className="flex items-center gap-1.5 text-brand-primary">
                      <History className="w-3.5 h-3.5" />
                      <span>سجل آخر طلبات العميل ({caller.recentOrders.length})</span>
                    </span>
                  </div>
                  <div className="space-y-1">
                    {caller.recentOrders.slice(0, 2).map((ro) => (
                      <div key={ro.id} className="flex items-center justify-between text-[11px] text-txt-muted bg-bg-base/40 p-1.5 rounded">
                        <span>طلب #{ro.orderNumber || ro.id.slice(0, 6)}</span>
                        <span className="font-mono font-bold text-txt-primary">{Number(ro.totalAmount || 0).toFixed(2)} EGP</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-txt-primary block mb-1">
                  ملاحظات الطلب
                </label>
                <textarea
                  rows={2}
                  placeholder="أي طلبات خاصة أو تعديلات..."
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
                    {total.toFixed(2)} EGP
                  </span>
                </div>

                <PermissionGate permission="orders.create">
                  <Button
                    size="md"
                    className="w-full bg-white text-slate-950 font-bold hover:bg-slate-200 disabled:bg-white/10 disabled:text-txt-muted disabled:cursor-not-allowed border-none shadow-sm transition-all"
                    disabled={cart.length === 0 || createPosMutation.isPending}
                    isLoading={createPosMutation.isPending}
                    onClick={handleSubmit}
                  >
                    إرسال الطلب ({total.toFixed(2)} EGP)
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