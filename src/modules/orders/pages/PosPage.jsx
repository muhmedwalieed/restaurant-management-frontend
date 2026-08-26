import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductsQuery, useCategoriesQuery } from '../../menu/hooks/useMenu.js';
import { useTablesQuery } from '../../tables/hooks/useTables.js';
import { useBranch } from '../../auth/context/BranchContext.jsx';
import { useAuth } from '../../auth/context/AuthContext.jsx';
import { useCreatePosOrderMutation } from '../hooks/useOrders.js';
import { lookupCallerApi } from '../../../lib/api/phone-order.api.js';
import { resolveAssetUrl } from '../../../lib/asset-url.js';
import { Button } from '../../../shared/components/Button.jsx';
import { Input } from '../../../shared/components/Input.jsx';
import { EmptyState } from '../../../shared/components/EmptyState.jsx';
import { ProductModifierModal } from '../components/ProductModifierModal.jsx';
import { PosOrderTicket } from '../components/PosOrderTicket.jsx';
import {
  Utensils,
  ShoppingCart,
  CheckCircle2,
  AlertCircle,
  Search,
  ReceiptText,
  Layers,
  Store,
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
  const [isTicketOpen, setIsTicketOpen] = useState(false);

  const { hasPermission } = useAuth();
  const SOURCE_PERMISSIONS = [
    { value: 'CASHIER', key: 'orders.source_cashier' },
    { value: 'PHONE', key: 'orders.source_phone' },
    { value: 'WHATSAPP', key: 'orders.source_whatsapp' },
    { value: 'WEBSITE', key: 'orders.source_website' },
  ];
  const availableSources = SOURCE_PERMISSIONS.filter((s) => hasPermission(s.key)).map((s) => s.value);
  const [source, setSource] = useState(() =>
    availableSources.includes('CASHIER') ? 'CASHIER' : availableSources[0] || 'CASHIER'
  );

  useEffect(() => {
    if (availableSources.length > 0 && !availableSources.includes(source)) {
      setSource(availableSources.includes('CASHIER') ? 'CASHIER' : availableSources[0]);
    }
  }, [availableSources, source]);

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

  const addCartLine = (product, modifiers, modifierNames, unitPrice) => {
    const modKey = (modifiers || []).map((m) => `${m.modifierId}:${m.quantity}`).sort().join(',');
    const lineKey = `${product.id}|${modKey}`;
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
          modifiers: modifiers || [],
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
      addCartLine(modifierProduct, selection.modifiers, selection.modifierNames, selection.unitPrice);
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
          ...(i.modifiers && i.modifiers.length > 0 ? { modifiers: i.modifiers } : {}),
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

  const ticketProps = {
    cart,
    itemCount,
    total,
    source,
    setSource,
    sources: availableSources,
    orderType,
    setOrderType,
    tables,
    tableId,
    setTableId,
    customerPhone,
    setCustomerPhone,
    customerName,
    setCustomerName,
    address,
    setAddress,
    caller,
    showNotes,
    setShowNotes,
    notes,
    setNotes,
    showClearConfirm,
    setShowClearConfirm,
    handleClearCart,
    changeQty,
    handleSubmit,
    isPending: createPosMutation.isPending,
  };

  if (availableSources.length === 0) {
    return (
      <div className="h-[calc(100dvh-7rem)] flex items-center justify-center">
        <div className="text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-status-danger mx-auto" />
          <p className="text-sm font-bold text-txt-primary">ليس لديك صلاحية لأي مصدر طلب</p>
          <p className="text-xs text-txt-muted">تواصل مع صاحب المطعم لتفعيل مصدر طلب لحسابك.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100dvh-7rem)] flex flex-col min-h-0 overflow-hidden gap-3">
      {}
      <div className="flex items-center justify-between gap-2 pb-1 border-b border-border-default/60 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary shrink-0">
            <Utensils className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-txt-primary leading-tight truncate">
              نقطة البيع
            </h1>
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-txt-muted">
              <span className="flex items-center gap-1 font-medium text-slate-300">
                <Store className="w-3 h-3 text-brand-primary" />
                {activeBranch?.name || 'الفرع الحالي'}
              </span>
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
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
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-3.5 overflow-hidden">
        {}
        <div className="flex-1 min-w-0 flex flex-col h-full min-h-0 overflow-hidden space-y-2">
          {}
          <div className="flex items-center gap-2 bg-bg-surface p-1.5 rounded-xl border border-border-default shrink-0">
            <div className="flex items-center gap-1 overflow-x-auto min-w-0 flex-1 custom-scrollbar">
              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
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
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
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

            <div className="w-32 sm:w-44 shrink-0">
              <Input
                placeholder="بحث عن صنف..."
                icon={Search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-xs h-8 min-h-[32px] bg-slate-800 text-slate-100 placeholder:text-slate-400 border-slate-700/80 focus-visible:border-sky-500"
              />
            </div>
          </div>

          {}
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1">
            {isProductsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5">
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
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2.5 pb-2">
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
                          className="w-full aspect-[4/3] object-cover rounded-lg mb-2 group-hover:opacity-95 transition-opacity"
                        />
                      ) : (
                        <div className="w-full aspect-[4/3] rounded-lg bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.04] p-2 flex items-center justify-center mb-2">
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

        {/* Side ticket (lg+) */}
        <div className="hidden lg:flex lg:w-[360px] xl:w-[400px] 2xl:w-[440px] shrink-0 flex-col min-h-0 bg-bg-surface border border-border-default rounded-xl overflow-hidden shadow-xl">
          <PosOrderTicket {...ticketProps} />
        </div>
      </div>

      {/* Bottom ticket bar + drawer (< lg) */}
      <div className="lg:hidden shrink-0">
        <button
          type="button"
          onClick={() => setIsTicketOpen(true)}
          className="w-full bg-brand-primary text-slate-950 font-bold rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs shadow-md active:scale-[0.99]">
          <span className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            تذكرة الطلب ({itemCount})
          </span>
          <span className="font-mono">{total.toFixed(2)} EGP</span>
        </button>
      </div>

{isTicketOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsTicketOpen(false)} />
          <div className="relative z-10 w-full sm:mx-auto sm:max-w-md bg-bg-surface border-t border-border-default rounded-t-2xl shadow-2xl flex flex-col max-h-[90dvh]">
            <div className="w-full pt-3 pb-1 flex justify-center shrink-0">
              <div className="w-12 h-1.5 rounded-full bg-border-default/80" />
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              <PosOrderTicket {...ticketProps} />
            </div>
            <button
              type="button"
              onClick={() => setIsTicketOpen(false)}
              className="shrink-0 py-2 text-xs font-semibold text-txt-muted hover:text-txt-primary">
              إغلاق التذكرة
            </button>
          </div>
        </div>
      )}

      <ProductModifierModal
        isOpen={Boolean(modifierProduct)}
        product={modifierProduct}
        onClose={() => setModifierProduct(null)}
        onConfirm={handleModifierConfirm}
      />
    </div>
  );
};
