import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductsQuery, useCategoriesQuery } from '../../menu/hooks/useMenu.js';
import { useTablesQuery } from '../../tables/hooks/useTables.js';
import { useBranch } from '../../auth/context/BranchContext.jsx';
import { useCreatePosOrderMutation } from '../hooks/useOrders.js';
import { lookupCallerApi } from '../../../lib/api/phone-order.api.js';
import { resolveAssetUrl } from '../../../lib/asset-url.js';
import { Button } from '../../../shared/components/Button.jsx';
import { PermissionGate } from '../../../shared/components/PermissionGate.jsx';
import { Input } from '../../../shared/components/Input.jsx';
import { EmptyState } from '../../../shared/components/EmptyState.jsx';
import { OrderSourcePicker } from '../components/OrderSourcePicker.jsx';
import { TableQuickPicker } from '../components/TableQuickPicker.jsx';
import { ProductModifierModal } from '../components/ProductModifierModal.jsx';
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
  Store,
  MessageSquarePlus,
  ChevronUp,
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
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState('DINE_IN');
  const [source, setSource] = useState('CASHIER');
  const [tableId, setTableId] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [caller, setCaller] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [modifierProduct, setModifierProduct] = useState(null);

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
      } catch (err) {
        void err;
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [customerPhone, customerName, address]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = selectedCategory === 'ALL' || p.categoryId === selectedCategory;
      const matchesSearch = !searchTerm.trim() || p.name?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [products, selectedCategory, searchTerm]);

  const addCartLine = (product, modifierIds, modifierNames, unitPrice) => {
    const lineKey = `${product.id}|${[...(modifierIds || [])].sort().join(',')}`;
    setCart((prev) => {
      const existing = prev.find((i) => i.lineKey === lineKey);
      if (existing) {
        return prev.map((i) => (i.lineKey === lineKey ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [
        ...prev,
        {
          lineKey,
          productId: product.id,
          name: product.name,
          unitPrice,
          quantity: 1,
          modifierIds: modifierIds || [],
          modifierNames: modifierNames || [],
        },
      ];
    });
  };

  const addToCart = (product) => {
    setSuccessMsg(null);
    setErrorMsg(null);
    if (product.modifiers && product.modifiers.length > 0) {
      setModifierProduct(product);
      return;
    }
    addCartLine(product, [], [], Number(product.price));
  };

  const changeQty = (lineKey, delta) => {
    setCart((prev) =>
      prev
        .map((i) => (i.lineKey === lineKey ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const total = cart.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const handleClearCart = () => {
    setCart([]);
    setShowClearConfirm(false);
  };

  const handleModifierConfirm = (selection) => {
    if (modifierProduct) {
      addCartLine(modifierProduct, selection.modifierIds, selection.modifierNames, selection.unitPrice);
    }
    setModifierProduct(null);
  };

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
        source,
        tableId: orderType === 'DINE_IN' ? tableId : undefined,
        customerPhone: customerPhone || undefined,
        customerName: customerName || undefined,
        address: orderType === 'DELIVERY' ? address : undefined,
        notes: notes || undefined,
        items: cart.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          ...(i.modifierIds && i.modifierIds.length > 0 ? { modifierIds: i.modifierIds } : {}),
        })),
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
      setShowNotes(false);
      setCaller(null);
    } catch (err) {
      setErrorMsg(err?.message || 'حدث خطأ أثناء إنشاء الطلب.');
    }
  };

  return (
    <div className="h-[calc(100vh-5.5rem)] flex flex-col min-h-0 overflow-hidden space-y-3">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-border-default/60 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary shrink-0">
            <Utensils className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-txt-primary leading-tight">
              نقطة البيع وإدارة الطلبات
            </h1>
            <div className="flex items-center gap-2 text-[11px] text-txt-muted">
              <span className="flex items-center gap-1 font-medium text-slate-300">
                <Store className="w-3 h-3 text-brand-primary" />
                {activeBranch?.name || 'الفرع الحالي'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={ReceiptText}
            onClick={() => navigate('/orders')}
            className="text-xs h-7 py-0"
          >
            عرض سجل الطلبات
          </Button>
        </div>
      </div>

      {}
      {successMsg && (
        <div className="p-2 rounded-lg text-xs font-medium bg-status-success-bg text-status-success border border-status-success/30 flex items-center gap-2 shrink-0">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-2 rounded-lg text-xs font-medium bg-status-danger-bg text-status-danger border border-status-danger/30 flex items-center gap-2 shrink-0">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 flex-1 min-h-0 overflow-hidden">
        {}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col h-full min-h-0 overflow-hidden space-y-2">
          {}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-bg-surface p-2 rounded-xl border border-border-default shrink-0">
            {}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 max-w-full custom-scrollbar">
              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
                  selectedCategory === 'ALL'
                    ? 'bg-brand-primary text-slate-950 shadow-sm'
                    : 'bg-bg-base/60 text-txt-muted border border-border-subtle hover:text-txt-primary hover:border-white/10'
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
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                      isSelected
                        ? 'bg-brand-primary text-slate-950 font-semibold shadow-sm'
                        : 'bg-bg-base/60 text-txt-muted border border-border-subtle hover:text-txt-primary hover:border-white/10'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] opacity-70 mr-1 font-mono">({count})</span>
                  </button>
                );
              })}
            </div>

            {}
            <div className="w-full sm:w-44 shrink-0">
              <Input
                placeholder="بحث صنف..."
                icon={Search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-xs h-7 min-h-[28px] bg-bg-base/80"
              />
            </div>
          </div>

          {}
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1">
            {isProductsLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-32 bg-bg-surface/50 border border-border-default rounded-xl animate-pulse" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <EmptyState
                title="لا توجد منتجات مطابقة"
                description="جرب البحث بكلمة أخرى أو اختر تصنيفاً مختلفاً."
                icon={Utensils}
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-2.5 pb-2">
                {filteredProducts.map((p) => {
                  const inCartItem = cart.find((i) => i.productId === p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => addToCart(p)}
                      className={`relative group bg-bg-surface rounded-xl p-2.5 text-right flex flex-col justify-between transition-all duration-150 active:scale-[0.98] border ${
                        inCartItem
                          ? 'border-brand-primary bg-brand-primary/[0.05] shadow-md ring-1 ring-brand-primary/40'
                          : 'border-border-default hover:border-white/20 hover:bg-white/[0.02]'
                      }`}
                    >
                      {}
                      {inCartItem && (
                        <span className="absolute top-2 left-2 z-10 px-2 py-0.5 text-xs font-mono font-bold bg-brand-primary text-slate-950 rounded-full shadow-md">
                          {inCartItem.quantity}×
                        </span>
                      )}

                      {}
                      <div className="flex items-center justify-between w-full mb-1.5">
                        <span className="text-[10px] font-medium text-txt-muted bg-white/[0.06] px-1.5 py-0.5 rounded truncate max-w-[85%]">
                          {p.category?.name || 'صنف'}
                        </span>
                      </div>

                      {}
                      {p.imageUrl ? (
                        <img
                          src={resolveAssetUrl(p.imageUrl)}
                          alt={p.name}
                          className="w-full h-16 object-cover rounded-lg mb-2 group-hover:opacity-95 transition-opacity"
                        />
                      ) : (
                        <div className="w-full h-14 rounded-lg bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.04] p-2 flex items-center justify-center mb-2">
                          <p className="text-xs font-semibold text-slate-100 line-clamp-2 text-center leading-snug">
                            {p.name}
                          </p>
                        </div>
                      )}

                      {}
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
                            {p.modifiers?.length ? `+ إضافات (${p.modifiers.length})` : '+ إضافة'}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col h-full min-h-0 bg-bg-surface border border-border-default rounded-xl overflow-hidden shadow-xl">
          {}
          <div className="p-2.5 border-b border-border-default bg-bg-base/60 space-y-2 shrink-0">
            {}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ShoppingCart className="w-4 h-4 text-brand-primary" />
                <h3 className="text-xs font-bold text-txt-primary">
                  تذكرة الطلب ({itemCount})
                </h3>
              </div>
              {cart.length > 0 && (
                <div>
                  {showClearConfirm ? (
                    <div className="flex items-center gap-1 animate-fadeIn">
                      <button
                        type="button"
                        onClick={handleClearCart}
                        className="px-2 py-0.5 text-[10px] font-bold bg-status-danger text-white rounded hover:bg-red-600 transition-colors"
                      >
                        تأكيد
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowClearConfirm(false)}
                        className="px-2 py-0.5 text-[10px] font-medium bg-white/10 text-txt-muted rounded hover:bg-white/20 transition-colors"
                      >
                        إلغاء
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowClearConfirm(true)}
                      className="text-[11px] font-medium text-txt-muted hover:text-red-400 flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded hover:bg-red-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>تفريغ</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {}
            <OrderSourcePicker value={source} onChange={setSource} />

            {}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-txt-primary block">نوع الطلب</label>
              <div className="grid grid-cols-3 gap-1 p-0.5 bg-bg-base/80 border border-border-default rounded-lg">
                <button
                  type="button"
                  onClick={() => setOrderType('DINE_IN')}
                  className={`py-1 px-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                    orderType === 'DINE_IN'
                      ? 'bg-brand-primary text-slate-950 shadow-sm'
                      : 'text-txt-muted hover:text-txt-primary hover:bg-white/[0.04]'
                  }`}
                >
                  <Utensils className="w-3.5 h-3.5" />
                  <span>صالة</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('PICKUP')}
                  className={`py-1 px-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                    orderType === 'PICKUP'
                      ? 'bg-brand-primary text-slate-950 shadow-sm'
                      : 'text-txt-muted hover:text-txt-primary hover:bg-white/[0.04]'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>استلام</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('DELIVERY')}
                  className={`py-1 px-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                    orderType === 'DELIVERY'
                      ? 'bg-brand-primary text-slate-950 shadow-sm'
                      : 'text-txt-muted hover:text-txt-primary hover:bg-white/[0.04]'
                  }`}
                >
                  <Bike className="w-3.5 h-3.5" />
                  <span>توصيل</span>
                </button>
              </div>
            </div>

            {}
            {orderType === 'DINE_IN' ? (
              <TableQuickPicker
                tables={tables}
                value={tableId}
                onChange={setTableId}
                required
              />
            ) : (
              <div className="space-y-1.5 pt-0.5">
                <Input
                  label="رقم هاتف العميل"
                  dir="ltr"
                  icon={Phone}
                  placeholder="01x xxxx xxxx"
                  required={orderType === 'DELIVERY' || orderType === 'PICKUP'}
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="text-xs h-7 min-h-[28px]"
                />
                <Input
                  label="اسم العميل"
                  icon={Users}
                  placeholder="أحمد علي"
                  required={orderType === 'DELIVERY'}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="text-xs h-7 min-h-[28px]"
                />
                {orderType === 'DELIVERY' && (
                  <Input
                    label="عنوان التوصيل"
                    icon={MapPin}
                    placeholder="عنوان الشارع / المبنى..."
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="text-xs h-7 min-h-[28px]"
                  />
                )}
              </div>
            )}

            {}
            {caller?.recentOrders && caller.recentOrders.length > 0 && (
              <div className="p-1.5 bg-bg-surface-elevated/60 border border-border-default rounded space-y-1 text-xs">
                <div className="flex items-center justify-between font-bold text-txt-primary">
                  <span className="flex items-center gap-1 text-brand-primary text-[10px]">
                    <History className="w-3 h-3" />
                    <span>آخر طلبات العميل ({caller.recentOrders.length})</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {}
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-2 space-y-1.5 bg-bg-base/10">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-6 text-center text-txt-muted">
                <ShoppingCart className="w-8 h-8 opacity-20 mb-1.5" />
                <p className="text-xs font-medium">السلة فارغة</p>
                <p className="text-[10px] opacity-70">اضغط على الأصناف من القائمة لإضافتها</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between gap-2.5 bg-bg-base/70 border border-border-subtle rounded-lg p-2.5 hover:border-white/10 transition-colors"
                >
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-txt-primary truncate leading-normal">{item.name}</p>
                      <span className="text-xs font-mono font-bold text-brand-primary shrink-0 tabular-nums">
                        {(item.unitPrice * item.quantity).toFixed(2)} EGP
                      </span>
                    </div>
{item.quantity > 1 && (
                        <div className="text-xs text-txt-muted font-mono leading-normal">
                          <span dir="ltr" className="inline-block">
                            {item.unitPrice.toFixed(2)} EGP × {item.quantity}
                          </span>
                        </div>
                      )}
                      {item.modifierNames && item.modifierNames.length > 0 && (
                        <p className="text-[10px] text-brand-primary leading-tight truncate">
                          {item.modifierNames.join(' + ')}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0 bg-bg-surface px-1.5 py-1 rounded border border-border-default">
                      <button
                        type="button"
                        onClick={() => changeQty(item.lineKey, -1)}
                        className="w-5 h-5 rounded bg-white/[0.05] hover:bg-white/[0.15] flex items-center justify-center text-txt-primary text-xs transition-colors"
                        title="إنقاص"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center text-xs font-mono font-bold text-txt-primary">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => changeQty(item.lineKey, 1)}
                        className="w-5 h-5 rounded bg-white/[0.05] hover:bg-white/[0.15] flex items-center justify-center text-txt-primary text-xs transition-colors"
                        title="زيادة"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                </div>
              ))
            )}
          </div>

          {}
          <div className="p-3 border-t border-border-default bg-bg-base/90 space-y-2.5 shrink-0 shadow-inner mt-auto">
            {}
            <div>
              {showNotes ? (
                <div className="space-y-1 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-semibold text-txt-muted">ملاحظات الطلب</label>
                    <button
                      type="button"
                      onClick={() => setShowNotes(false)}
                      className="text-[10px] text-txt-muted hover:text-txt-primary flex items-center gap-0.5"
                    >
                      <span>إخفاء</span>
                      <ChevronUp className="w-3 h-3" />
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    placeholder="أي طلبات خاصة..."
                    className="w-full bg-bg-surface text-txt-primary placeholder:text-txt-muted border border-border-default rounded text-xs p-1.5 focus-visible:outline-none focus-visible:border-brand-primary resize-none"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowNotes(true)}
                  className="text-[11px] font-medium text-txt-muted hover:text-brand-primary flex items-center gap-1 transition-colors py-0.5"
                >
                  <MessageSquarePlus className="w-3.5 h-3.5" />
                  <span>{notes.trim() ? 'تعديل ملاحظات الطلب' : '+ إضافة ملاحظات الطلب'}</span>
                  {notes.trim() && <span className="w-1.5 h-1.5 rounded-full bg-brand-primary inline-block" />}
                </button>
              )}
            </div>

            {}
            <div className="flex items-center justify-between pt-1 border-t border-white/[0.06]">
              <span className="text-xs font-semibold text-txt-muted">الإجمالي النهائي:</span>
              <span className="text-base font-bold text-white font-mono tabular-nums">
                {total.toFixed(2)} EGP
              </span>
            </div>

            {}
            <PermissionGate permission="orders.create">
              <Button
                size="md"
                className="w-full bg-brand-primary text-slate-950 font-bold hover:bg-amber-400 disabled:bg-white/10 disabled:text-txt-muted disabled:cursor-not-allowed border-none shadow-md transition-all h-9 text-xs"
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

      <ProductModifierModal
        isOpen={Boolean(modifierProduct)}
        product={modifierProduct}
        onClose={() => setModifierProduct(null)}
        onConfirm={handleModifierConfirm}
      />
    </div>
  );
};
