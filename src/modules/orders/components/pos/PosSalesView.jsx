import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useBranch } from '../../../auth/context/BranchContext.jsx';
import { useAuth } from '../../../auth/context/AuthContext.jsx';
import { useCurrency } from '../../../../shared/hooks/useCurrency.js';
import { hasProductModifiers } from '../../constants.js';
import { ProductModifierModal } from '../ProductModifierModal.jsx';
import { PosSalesToolbar } from './PosSalesToolbar.jsx';
import { PosProductCard } from './PosProductCard.jsx';
import { PosCheckoutModal } from './PosCheckoutModal.jsx';
import { usePosSalesRegister } from '../../hooks/usePosSalesRegister.js';
import { lookupCallerApi } from '../../../../lib/api/phone-order.api.js';
import { toast } from '../../../../shared/context/ToastContext.jsx';
import {
  Phone,
  User,
  ShoppingBag,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  RotateCcw,
  FileText,
  Smartphone,
  Wallet,
  UtensilsCrossed,
  Bike,
  Store,
  ChevronDown,
  ChevronLeft,
  Sparkles,
  X,
  CheckCircle2,
  Banknote,
  Tag,
  UserPlus,
  MapPin,
  Split,
} from 'lucide-react';

export const PosSalesView = ({
  products = [],
  categories = [],
  tables = [],
  pendingTable = null,
  onClearPendingTable,
  defaultOrderType = 'PICKUP',
  allowedOrderTypes = ['PICKUP', 'DELIVERY', 'DINE_IN'],
  defaultSource = 'CASHIER',
}) => {
  const { activeBranchId } = useBranch();
  const { hasPermission } = useAuth();
  const { currency } = useCurrency();

  const {
    cat,
    setCat,
    q,
    setQ,
    cart,
    setCart,
    orderType,
    setOrderType,
    source,
    info,
    setInfo,
    selectedTableLabel,
    modifierProduct,
    setModifierProduct,
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
    defaultOrderType,
    allowedOrderTypes,
    defaultSource,
  });

  // ── Local States ──
  const [orderNotes, setOrderNotes] = useState('');
  const [openNotesIdxs, setOpenNotesIdxs] = useState({});
  const [isCustomerFormExpanded, setIsCustomerFormExpanded] = useState(false);

  // Auto-validate coupon code on typing with debounce (500ms)
  useEffect(() => {
    const trimmed = (couponCode || '').trim();
    if (!trimmed || trimmed.length < 2 || couponState?.id || cart.length === 0) {
      return undefined;
    }
    const timer = setTimeout(() => {
      validateCoupon();
    }, 500);
    return () => clearTimeout(timer);
  }, [couponCode, couponState?.id, cart.length, validateCoupon]);

  // Customer lookup states
  const [isLookupLoading, setIsLookupLoading] = useState(false);
  const [callerProfile, setCallerProfile] = useState(null);
  const [customerAddresses, setCustomerAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('__CUSTOM__');
  const [isAddressDropdownOpen, setIsAddressDropdownOpen] = useState(false);
  const addressDropdownRef = useRef(null);
  const customerFormRef = useRef(null);

  // Close address dropdown on outside click
  useEffect(() => {
    if (!isAddressDropdownOpen) return undefined;
    const handleClickOutside = (event) => {
      if (addressDropdownRef.current && !addressDropdownRef.current.contains(event.target)) {
        setIsAddressDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAddressDropdownOpen]);

  // Auto-collapse customer form on outside click or touch
  useEffect(() => {
    if (!isCustomerFormExpanded) return undefined;
    const handleOutsideCustomerForm = (event) => {
      if (customerFormRef.current && !customerFormRef.current.contains(event.target)) {
        setIsCustomerFormExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideCustomerForm);
    document.addEventListener('touchstart', handleOutsideCustomerForm);
    return () => {
      document.removeEventListener('mousedown', handleOutsideCustomerForm);
      document.removeEventListener('touchstart', handleOutsideCustomerForm);
    };
  }, [isCustomerFormExpanded]);

  // ── Resizable Layout Width for Unified Right Sidebar ──
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    try {
      const saved = localStorage.getItem('pos_unified_sidebar_width');
      return saved ? Math.max(280, Math.min(600, Number(saved))) : 380;
    } catch {
      return 380;
    }
  });

  const [isResizingActive, setIsResizingActive] = useState(false);

  const handleSplitterPointerDown = useCallback((e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = sidebarWidth;
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);
    setIsResizingActive(true);

    const onPointerMove = (moveEvent) => {
      // In RTL, moving left (clientX decreasing) expands the right-docked sidebar
      const deltaX = startX - moveEvent.clientX;
      const newWidth = Math.max(280, Math.min(600, Math.round(startWidth + deltaX)));
      setSidebarWidth(newWidth);
      try {
        localStorage.setItem('pos_unified_sidebar_width', String(newWidth));
      } catch {}
    };

    const onPointerUp = (upEvent) => {
      try {
        target.releasePointerCapture(upEvent.pointerId);
      } catch {}
      target.removeEventListener('pointermove', onPointerMove);
      target.removeEventListener('pointerup', onPointerUp);
      target.removeEventListener('pointercancel', onPointerUp);
      setIsResizingActive(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    target.addEventListener('pointermove', onPointerMove);
    target.addEventListener('pointerup', onPointerUp);
    target.addEventListener('pointercancel', onPointerUp);
  }, [sidebarWidth]);

  // ── Auto Customer Lookup upon typing 11 digits ──
  useEffect(() => {
    const cleanPhone = (info.phone || '').trim().replace(/\D/g, '');
    if (cleanPhone.length < 11) {
      setCallerProfile(null);
      setCustomerAddresses([]);
      setSelectedAddressId('__CUSTOM__');
      return undefined;
    }

    const timer = setTimeout(async () => {
      setIsLookupLoading(true);
      try {
        const data = await lookupCallerApi(cleanPhone);
        if (data && data.customer) {
          setCallerProfile(data);
          if (data.customer.name && !info.name) {
            setInfo((prev) => ({ ...prev, name: data.customer.name }));
          }
          if (data.addresses && Array.isArray(data.addresses) && data.addresses.length > 0) {
            setCustomerAddresses(data.addresses);
            const defAddr = data.addresses.find((a) => a.isDefault) || data.addresses[0];
            setSelectedAddressId(defAddr.id);
            setInfo((prev) => ({ ...prev, address: defAddr.formatted || defAddr.street || '' }));
          } else {
            setCustomerAddresses([]);
            setSelectedAddressId('__CUSTOM__');
            const resolvedAddr = data.address || (data.defaultAddress
              ? [data.defaultAddress.street, data.defaultAddress.city, data.defaultAddress.state].filter(Boolean).join('، ') || data.defaultAddress.street
              : null);
            if (resolvedAddr) {
              setInfo((prev) => ({ ...prev, address: resolvedAddr }));
            }
          }
        } else {
          setCallerProfile(null);
          setCustomerAddresses([]);
          setSelectedAddressId('__CUSTOM__');
        }
      } catch (_) {
        setCallerProfile(null);
        setCustomerAddresses([]);
        setSelectedAddressId('__CUSTOM__');
      } finally {
        setIsLookupLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [info.phone]);

  // ── Repeat recent order ──
  const handleRepeatRecentOrder = (recentOrder) => {
    if (!recentOrder || !recentOrder.items || recentOrder.items.length === 0) return;
    const newItems = recentOrder.items.map((it) => {
      const prod = products.find((p) => p.id === it.productId);
      return {
        itemKey: `${it.productId}__`,
        productId: it.productId,
        name: it.productName || prod?.name || 'صنف',
        price: Number(it.unitPrice || prod?.price || 0),
        qty: it.quantity || 1,
        notes: it.notes || '',
      };
    });
    setCart(newItems);
    toast.success('تم تكرار أصناف الطلب السابق في السلة بنجاح 🛒');
  };

  const handleClearCustomerFields = () => {
    setInfo((prev) => ({ ...prev, name: '', phone: '', address: '' }));
    setCallerProfile(null);
    setCustomerAddresses([]);
    setSelectedAddressId('__CUSTOM__');
    setIsCustomerFormExpanded(false);
  };

  const handleClearTable = () => {
    setInfo((prev) => ({ ...prev, table: null }));
  };

  // ── Cart item map for badges and steppers ──
  const cartItemMap = useMemo(() => {
    const map = {};
    const modKeyOf = (it) =>
      (it.modifiers || [])
        .map((m) => `${m.modifierId}:${m.quantity}`)
        .sort()
        .join(',');
    cart.forEach((it) => {
      const pId = it.productId || it.id;
      const k = `${pId}__${modKeyOf(it)}`;
      map[k] = (map[k] || 0) + (it.qty || 1);
      map[pId] = (map[pId] || 0) + (it.qty || 1);
    });
    map.__modKeyOf = modKeyOf;
    return map;
  }, [cart]);

  // ── Card increment/decrement ──
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

  const handleDecrementProduct = useCallback((product) => {
    const idx = cart.findLastIndex(
      (it) => (it.productId || it.id) === product.id && (!it.modifiers || it.modifiers.length === 0)
    );
    const fallback = idx >= 0 ? idx : cart.findLastIndex((it) => (it.productId || it.id) === product.id);
    if (fallback >= 0) handleChangeCartQty(fallback, -1);
  }, [cart, handleChangeCartQty]);

  const handleUpdateItemNotes = (index, notes) => {
    setCart((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], notes };
      return updated;
    });
  };

  // Open checkout and payment split modal with validations
  const handleOpenCheckoutModal = () => {
    if (cart.length === 0) {
      toast.error('يرجى إضافة أصناف إلى السلة أولاً');
      return;
    }
    if (orderType === 'DINE_IN' && !info.table) {
      toast.error('يرجى اختيار الطاولة للطلب الصالة');
      return;
    }
    if (orderType === 'DELIVERY' && !info.address?.trim()) {
      toast.error('عنوان التوصيل مطلوب للطلبات الدليفري');
      return;
    }
    setIsCheckoutModalOpen(true);
  };

  const hasCustomer = Boolean(info.name || info.phone || info.address);

  return (
    <div className="flex-1 flex flex-col overflow-hidden w-full h-full bg-zinc-100 dark:bg-black text-zinc-900 dark:text-zinc-100" dir="rtl">
      {/* Main Unified Layout: Always Side-by-Side (Cart on Right | Menu on Left) */}
      <div className="flex-1 flex flex-row overflow-hidden relative w-full h-full min-h-0">
        {/* ── UNIFIED RIGHT SIDEBAR: Customer Details + Active Cart + Payment ── */}
        <aside
          style={{ width: `${sidebarWidth}px`, minWidth: '280px', maxWidth: '550px' }}
          className="border-l border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 flex flex-col h-full overflow-hidden shrink-0 z-10 relative"
        >
          {/* Touch & Mouse Draggable Resize Handle on left edge (Matching Orders Detail Drawer 100%) */}
          <div
            onPointerDown={handleSplitterPointerDown}
            className="hidden sm:flex absolute left-0 top-0 bottom-0 w-6 -ml-3 cursor-col-resize z-50 group items-center justify-center select-none hover:bg-zinc-500/10 active:bg-zinc-500/20 transition-colors touch-none"
            title="اسحب لتعديل عرض السلة والطلب"
          >
            <div className="w-1.5 h-10 rounded-full bg-zinc-300 dark:bg-zinc-700 group-hover:bg-zinc-900 dark:group-hover:bg-zinc-100 group-active:bg-primary-500 transition-colors" />
          </div>

          {/* Top Header Bar: Order Type Switcher (h-14 aligned horizontally with Search & Categories toolbar) */}
          <div className="h-14 px-3 flex items-center shrink-0 border-b border-zinc-200 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xs">
            <div className={`grid ${allowedOrderTypes.length === 2 ? 'grid-cols-2' : allowedOrderTypes.length === 1 ? 'grid-cols-1' : 'grid-cols-3'} gap-1.5 w-full`}>
              {allowedOrderTypes.includes('DELIVERY') && (
                <button
                  type="button"
                  onClick={() => setOrderType('DELIVERY')}
                  className={`h-9 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    orderType === 'DELIVERY'
                      ? 'bg-zinc-900 dark:bg-zinc-800 text-white shadow-xs border border-zinc-900 dark:border-zinc-700/80 font-bold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-medium'
                  }`}
                >
                  <Bike size={14} className={orderType === 'DELIVERY' ? 'text-white' : 'text-zinc-400'} />
                  <span>توصيل</span>
                </button>
              )}
              {allowedOrderTypes.includes('PICKUP') && (
                <button
                  type="button"
                  onClick={() => setOrderType('PICKUP')}
                  className={`h-9 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    orderType === 'PICKUP'
                      ? 'bg-zinc-900 dark:bg-zinc-800 text-white shadow-xs border border-zinc-900 dark:border-zinc-700/80 font-bold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-medium'
                  }`}
                >
                  <Store size={14} className={orderType === 'PICKUP' ? 'text-white' : 'text-zinc-400'} />
                  <span>استلام</span>
                </button>
              )}
              {allowedOrderTypes.includes('DINE_IN') && (
                <button
                  type="button"
                  onClick={() => setOrderType('DINE_IN')}
                  className={`h-9 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    orderType === 'DINE_IN'
                      ? 'bg-zinc-900 dark:bg-zinc-800 text-white shadow-xs border border-zinc-900 dark:border-zinc-700/80 font-bold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-medium'
                  }`}
                >
                  <UtensilsCrossed size={14} className={orderType === 'DINE_IN' ? 'text-white' : 'text-zinc-400'} />
                  <span>صالة</span>
                </button>
              )}
            </div>
          </div>

          {/* Sub Header Section: Customer Info & Table Selection (Separated by border line) */}
          <div className="p-2.5 border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-900/20 shrink-0 space-y-2 relative z-20">

            {/* If DINE_IN: Table Selector */}
            {orderType === 'DINE_IN' && (
              <div className="relative animate-fadeIn">
                <select
                  value={info.table || ''}
                  onChange={(e) => setInfo((prev) => ({ ...prev, table: e.target.value || null }))}
                  className="w-full h-8 px-2.5 pl-8 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-xs font-semibold focus:outline-none focus:border-primary-500 cursor-pointer appearance-none shadow-2xs"
                >
                  <option value="">-- اختر الطاولة (مطلوب للصالة) * --</option>
                  {tables.map((t) => {
                    const label = t.label || t.name || (t.number != null ? `طاولة ${t.number}` : `طاولة ${t.id}`);
                    return (
                      <option key={t.id} value={t.id}>
                        {label} {t.capacity ? `(سعة ${t.capacity})` : ''}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              </div>
            )}

            {/* Dynamic Customer Section */}
            {orderType === 'DELIVERY' ? (
              /* For DELIVERY: Space-saving Customer & Address Form */
              <div className="space-y-1.5 pt-0.5 animate-fadeIn">
                <div className="grid grid-cols-2 gap-1.5" dir="rtl">
                  {/* Customer Name (First) */}
                  <input
                    type="text"
                    dir="rtl"
                    value={info.name || ''}
                    onChange={(e) => setInfo((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="اسم العميل *"
                    style={{ direction: 'rtl', textAlign: 'right' }}
                    className="w-full h-8 px-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-primary-500 text-right placeholder:text-right placeholder:text-zinc-400"
                  />

                  {/* Phone Input with lookup spinner (Second) */}
                  <div className="relative" dir="rtl">
                    <Phone size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                    <input
                      type="tel"
                      dir="rtl"
                      value={info.phone || ''}
                      onChange={(e) => setInfo((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="رقم الهاتف *"
                      style={{ direction: 'rtl', textAlign: 'right' }}
                      className="w-full h-8 pr-7 pl-6 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-primary-500 text-right placeholder:text-right placeholder:text-zinc-400"
                    />
                    {isLookupLoading && (
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-primary-500">
                        <RotateCcw size={10} className="animate-spin" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Delivery Address - Inline Editable Combobox with Floating Suggestions */}
                <div ref={addressDropdownRef} className="relative z-30" dir="rtl">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      dir="rtl"
                      value={info.address || ''}
                      onChange={(e) => {
                        setInfo((prev) => ({ ...prev, address: e.target.value }));
                        if (isAddressDropdownOpen) setIsAddressDropdownOpen(false);
                      }}
                      placeholder="اكتب عنوان جديد أو اختر من السابق..."
                      style={{ direction: 'rtl', textAlign: 'right' }}
                      className="h-10 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pr-9 pl-16 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 shadow-2xs transition-colors text-right placeholder:text-right"
                    />
                    <MapPin size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />

                    {/* Action buttons embedded on left edge of input (RTL) */}
                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      {info.address && (
                        <button
                          type="button"
                          onClick={() => {
                            setInfo((prev) => ({ ...prev, address: '' }));
                            setSelectedAddressId('__CUSTOM__');
                          }}
                          className="w-5 h-5 rounded-md flex items-center justify-center text-zinc-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                          title="مسح العنوان لكتابة عنوان جديد"
                        >
                          <X size={12} />
                        </button>
                      )}

                      {customerAddresses.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setIsAddressDropdownOpen((prev) => !prev)}
                          className="w-5 h-5 rounded-md flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                          title="عرض العناوين المسجلة"
                        >
                          <ChevronDown size={13} className={`transition-transform duration-200 ${isAddressDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Floating Dropdown List (Overlay, does not push or break cart list) */}
                  {isAddressDropdownOpen && customerAddresses.length > 0 && (
                    <div className="absolute top-full mt-1.5 right-0 left-0 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-750 shadow-2xl rounded-xl p-1.5 max-h-48 overflow-y-auto custom-scrollbar text-xs animate-fadeIn">
                      <div className="px-2 py-1 text-[10px] font-bold text-zinc-400">
                        عناوين العميل السابقة:
                      </div>
                      {customerAddresses.map((addrItem) => {
                        const formatted = addrItem.formatted || addrItem.street || '';
                        const isSelected = info.address === formatted;
                        return (
                          <button
                            key={addrItem.id || formatted}
                            type="button"
                            onClick={() => {
                              setInfo((prev) => ({ ...prev, address: formatted }));
                              setSelectedAddressId(addrItem.id || '__CUSTOM__');
                              setIsAddressDropdownOpen(false);
                            }}
                            className={`w-full p-2 rounded-lg text-right flex items-center justify-between gap-2 transition-colors cursor-pointer ${isSelected
                              ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold'
                              : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-750 dark:text-zinc-300'
                              }`}
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <MapPin size={12} className={isSelected ? 'text-zinc-700 dark:text-zinc-200 shrink-0' : 'text-zinc-400 shrink-0'} />
                              <span className="truncate">{formatted}</span>
                            </div>
                            {addrItem.isDefault && (
                              <span className="text-[9px] font-semibold bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-1.5 py-0.5 rounded-md shrink-0">
                                افتراضي
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : isCustomerFormExpanded ? (
              /* Expanded customer input row with Click-Outside Auto Collapse */
              <div ref={customerFormRef} className="flex items-center gap-1.5 pt-0.5 animate-fadeIn" dir="rtl">
                {/* 1. Customer Name (First from right) */}
                <input
                  type="text"
                  dir="rtl"
                  value={info.name || ''}
                  onChange={(e) => setInfo((prev) => ({ ...prev, name: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setIsCustomerFormExpanded(false);
                    }
                  }}
                  placeholder="اسم العميل"
                  style={{ direction: 'rtl', textAlign: 'right' }}
                  className="w-32 sm:w-36 h-8 px-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-primary-500 text-right placeholder:text-right placeholder:text-zinc-400"
                />

                {/* 2. Phone Input (Second) */}
                <div className="relative flex-1" dir="rtl">
                  <Phone size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  <input
                    type="tel"
                    dir="rtl"
                    value={info.phone || ''}
                    onChange={(e) => setInfo((prev) => ({ ...prev, phone: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setIsCustomerFormExpanded(false);
                      }
                    }}
                    placeholder="رقم الهاتف"
                    style={{ direction: 'rtl', textAlign: 'right' }}
                    className="w-full h-8 pr-7 pl-6 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-primary-500 text-right placeholder:text-right placeholder:text-zinc-400"
                  />
                  {isLookupLoading && (
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-primary-500">
                      <RotateCcw size={10} className="animate-spin" />
                    </span>
                  )}
                </div>

                {/* 3. Close button */}
                <button
                  type="button"
                  onClick={() => setIsCustomerFormExpanded(false)}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer shrink-0"
                  title="إغلاق وحفظ"
                >
                  <X size={13} />
                </button>
              </div>
            ) : hasCustomer ? (
              /* If Customer is linked (for PICKUP / DINE_IN): Compact Single-line Badge */
              <div className="bg-zinc-100/90 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2.5 py-1.5 rounded-xl flex items-center justify-between gap-2 text-xs animate-fadeIn">
                <div
                  className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer"
                  onClick={() => setIsCustomerFormExpanded(true)}
                  title="اضغط لتعديل بيانات العميل"
                >
                  <div className="w-5 h-5 rounded-md bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
                    <User size={12} />
                  </div>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 truncate">
                    {info.name || info.phone || 'عميل محدد'}
                  </span>
                  {info.phone && info.name && (
                    <span className="text-[11px] font-mono text-zinc-400 truncate" dir="ltr">
                      {info.phone}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsCustomerFormExpanded(true)}
                    className="h-6 px-1.5 text-[10px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    تعديل
                  </button>
                  <button
                    type="button"
                    onClick={handleClearCustomerFields}
                    className="w-5 h-5 text-zinc-400 hover:text-red-400 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
                    title="إلغاء ربط العميل"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            ) : (
              /* Minimal Customer Trigger Button (+ ربط عميل) */
              <div className="flex items-center justify-between px-0.5">
                <button
                  type="button"
                  onClick={() => setIsCustomerFormExpanded(true)}
                  className="text-[11px] font-semibold text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <UserPlus size={13} className="text-zinc-400" />
                  <span>+ ربط عميل بالطلب (اختياري)</span>
                </button>
              </div>
            )}
          </div>

          {/* Clean Cart Header with Counter Badge and Trash Icon */}
          <div className="flex items-center justify-between text-xs font-bold text-zinc-500 dark:text-zinc-400 pr-3.5 pl-1 py-2 bg-zinc-50/70 dark:bg-zinc-900/40 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
            <div className="flex items-center gap-2">
              <ShoppingBag size={14} className="text-zinc-400" />
              <span className="text-zinc-800 dark:text-zinc-200 font-bold">الأصناف المطلوبة</span>
              {cart.length > 0 && (
                <span className="bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded-full text-[10px] font-bold">
                  {cart.reduce((s, it) => s + it.qty, 0)} {(() => {
                    const q = cart.reduce((s, it) => s + it.qty, 0);
                    if (q === 1) return 'صنف';
                    if (q === 2) return 'صنفان';
                    if (q >= 3 && q <= 10) return 'أصناف';
                    return 'صنف';
                  })()}
                </span>
              )}
            </div>
            <div className="w-6 text-center">
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearCart}
                  className="p-1 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer inline-flex items-center justify-center"
                  title="إفراغ السلة"
                  aria-label="إفراغ السلة"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Middle Scrollable Section: Items Table */}
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar bg-white dark:bg-zinc-950">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-400 shadow-2xs">
                  <ShoppingCart size={20} />
                </div>
                <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">السلة فارغة</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">اضغط على أي صنف من القائمة لإضافته</p>
              </div>
            ) : (
              <table className="w-full text-right text-xs border-collapse">
                <thead className="sticky top-0 z-10 text-[11px] font-bold text-zinc-400 dark:text-zinc-500 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xs">
                  <tr>
                    <th className="py-2.5 px-3 font-bold">الصنف</th>
                    <th className="py-2.5 px-1 text-center font-bold w-20">الكمية</th>
                    <th className="py-2.5 px-1 text-center font-bold w-16">السعر</th>
                    <th className="py-2.5 px-3 text-left font-bold w-16">الإجمالي</th>
                    <th className="w-6 py-2.5 px-1" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
                  {cart.map((item, idx) => (
                    <tr key={`${item.productId || item.id}_${idx}`} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors group">
                      {/* Product Name & Modifiers & Notes */}
                      <td className="py-2.5 px-3 align-middle">
                        <div className="space-y-0.5">
                          <p className="font-bold text-xs text-zinc-900 dark:text-zinc-100 leading-snug break-normal" title={item.name}>
                            {item.name}
                          </p>
                          {item.modifierNames && item.modifierNames.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-0.5">
                              {item.modifierNames.map((m, i) => (
                                <span key={i} className="text-[9px] px-1 py-0.2 rounded font-medium bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400">
                                  + {m}
                                </span>
                              ))}
                            </div>
                          )}
                          {openNotesIdxs[idx] ? (
                            <div className="flex items-center gap-1.5 pt-1 animate-fadeIn">
                              <input
                                type="text"
                                autoFocus
                                value={item.notes || ''}
                                onChange={(e) => handleUpdateItemNotes(idx, e.target.value)}
                                placeholder="ملاحظة للصنف..."
                                className="flex-1 h-6 px-1.5 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-[10px] focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => setOpenNotesIdxs((prev) => ({ ...prev, [idx]: false }))}
                                className="h-6 px-2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-[10px] border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                              >
                                حفظ
                              </button>
                            </div>
                          ) : item.notes ? (
                            <div className="flex items-center justify-between text-[10px] text-amber-600 dark:text-amber-400 pt-0.5">
                              <span className="truncate">📝 {item.notes}</span>
                              <button
                                type="button"
                                onClick={() => setOpenNotesIdxs((prev) => ({ ...prev, [idx]: true }))}
                                className="text-[9px] underline hover:text-amber-700 dark:hover:text-amber-300 mr-2 shrink-0 cursor-pointer"
                              >
                                تعديل
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-start pt-0.5">
                              <button
                                type="button"
                                onClick={() => setOpenNotesIdxs((prev) => ({ ...prev, [idx]: true }))}
                                className="text-[10px] text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <FileText size={10} />
                                <span>ملاحظة</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Quantity Stepper (Clean without enclosing capsule) */}
                      <td className="py-2.5 px-1 text-center align-middle whitespace-nowrap">
                        <div dir="ltr" className="inline-flex items-center gap-1.5 select-none">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.currentTarget.blur();
                              handleChangeCartQty(idx, -1);
                            }}
                            className="w-6 h-6 rounded flex items-center justify-center text-zinc-400 dark:text-zinc-500 active:scale-75 active:opacity-60 focus:outline-none transition-transform cursor-pointer select-none"
                            title="تقليل الكمية"
                            aria-label="تقليل الكمية"
                          >
                            <Minus size={13} strokeWidth={2.5} />
                          </button>
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 min-w-[18px] text-center font-mono select-none">
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.currentTarget.blur();
                              handleChangeCartQty(idx, 1);
                            }}
                            className="w-6 h-6 rounded flex items-center justify-center text-zinc-400 dark:text-zinc-500 active:scale-75 active:opacity-60 focus:outline-none transition-transform cursor-pointer select-none"
                            title="زيادة الكمية"
                            aria-label="زيادة الكمية"
                          >
                            <Plus size={13} strokeWidth={2.5} />
                          </button>
                        </div>
                      </td>

                      {/* Unit Price */}
                      <td className="py-2.5 px-1 text-center align-middle whitespace-nowrap">
                        <span className="font-mono text-xs text-zinc-600 dark:text-zinc-300">
                          {Number(item.price).toFixed(2)}
                        </span>
                      </td>

                      {/* Total */}
                      <td className="py-2.5 px-3 text-left align-middle whitespace-nowrap" dir="rtl">
                        <span className="font-mono font-black text-xs text-zinc-900 dark:text-zinc-100">
                          {(Number(item.price) * item.qty).toFixed(2)}
                        </span>
                      </td>

                      {/* Delete */}
                      <td className="py-2.5 px-1 text-center align-middle whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleRemoveCartItem(idx)}
                          className="p-1 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                          title="حذف الصنف"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Bottom Section: Order Summary & Primary Action */}
          <div className="p-3 shrink-0 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 space-y-2.5">
            {/* Bill Summary Breakdown Box */}
            <div className="bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 space-y-1.5 text-xs text-zinc-900 dark:text-zinc-100">
              {/* Subtotal */}
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                <span>إجمالي الأصناف ({cart.reduce((s, it) => s + it.qty, 0)})</span>
                <div className="flex items-baseline gap-1" dir="rtl">
                  <span className="font-mono text-zinc-800 dark:text-zinc-200">{cartTotal.toFixed(2)}</span>
                  <span className="text-[10px] font-bold text-zinc-400 font-sans">{currency}</span>
                </div>
              </div>

              {/* Discount if applicable */}
              {cartTotal - cartTotalAfterDiscount > 0 && (
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                  <span>الخصم</span>
                  <div className="flex items-baseline gap-1" dir="rtl">
                    <span className="font-mono font-bold">-{(cartTotal - cartTotalAfterDiscount).toFixed(2)}</span>
                    <span className="text-[10px] font-bold font-sans">{currency}</span>
                  </div>
                </div>
              )}

              {/* Delivery Fee placeholder for future expansion */}
              {orderType === 'DELIVERY' && (
                <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                  <span>رسوم التوصيل</span>
                  <div className="flex items-baseline gap-1" dir="rtl">
                    <span className="font-mono text-zinc-700 dark:text-zinc-300">0.00</span>
                    <span className="text-[10px] font-bold text-zinc-400 font-sans">{currency}</span>
                  </div>
                </div>
              )}

              {/* Total Row */}
              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-1.5 flex items-center justify-between">
                <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">المبلغ الإجمالي</span>
                <div className="flex items-baseline gap-1.5" dir="rtl">
                  <span className="font-mono font-black text-base text-zinc-900 dark:text-zinc-100">
                    {cartTotalAfterDiscount.toFixed(2)}
                  </span>
                  <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 font-sans">{currency}</span>
                </div>
              </div>
            </div>

            {/* Clean Primary Action Button */}
            <button
              type="button"
              onClick={handleOpenCheckoutModal}
              disabled={cart.length === 0 || createPosMutation.isPending || paymentMutation.isPending}
              className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 active:scale-[0.99] font-black rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed border border-zinc-900 dark:border-white/20"
            >
              <CheckCircle2 size={18} className="shrink-0 text-white dark:text-zinc-950" />
              <span className="text-sm font-bold text-white dark:text-zinc-950 tracking-tight">متابعة الطلب والدفع</span>
            </button>
          </div>
        </aside>

        {/* ── LEFT AREA: Product Catalog ── */}
        <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden bg-transparent">
          {/* Top Bar: Search Bar (w-72) + High Contrast Category Filter Pills */}
          <PosSalesToolbar
            categories={categories}
            activeCategory={cat}
            onSelectCategory={setCat}
            allProducts={products}
            searchQuery={q}
            onChangeSearch={setQ}
          />

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-transparent">
            {filteredProducts.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 shadow-xs">
                  <UtensilsCrossed size={22} />
                </div>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">لا توجد أصناف مطابقة</p>
                <p className="text-xs mt-1 text-zinc-500 dark:text-zinc-400">جرب البحث بكلمة أخرى أو اختر تصنيفاً مختلفاً</p>
              </div>
            ) : (
              <div
                className="grid gap-3.5 sm:gap-4"
                style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(185px, 1fr))' }}
              >
                {filteredProducts.map((p) => (
                  <PosProductCard
                    key={p.id}
                    product={p}
                    onSelect={handleSelectProduct}
                    onIncrement={handleIncrementProduct}
                    onDecrement={handleDecrementProduct}
                    cartQty={cartItemMap[`${p.id}__`] ?? cartItemMap[p.id] ?? 0}
                    currency={currency}
                  />
                ))}
              </div>
            )}
          </div>

        </main>
      </div>

      {/* Advanced Checkout & Payment Modal */}
      <PosCheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        cart={cart}
        total={cartTotalAfterDiscount}
        rawTotal={cartTotal}
        couponCode={couponCode}
        setCouponCode={setCouponCode}
        couponState={couponState}
        clearCoupon={clearCoupon}
        onChangeQty={handleChangeCartQty}
        onRemoveItem={handleRemoveCartItem}
        orderType={orderType}
        onChangeOrderType={setOrderType}
        customerInfo={info}
        onChangeCustomerInfo={setInfo}
        tables={tables}
        selectedTableLabel={selectedTableLabel}
        source={source}
        orderNotes={orderNotes}
        onChangeOrderNotes={setOrderNotes}
        onConfirm={handleConfirmCheckout}
        isSubmitting={createPosMutation.isPending || paymentMutation.isPending}
        currency={currency}
      />

      {/* Product Modifiers Modal */}
      <ProductModifierModal
        isOpen={!!modifierProduct}
        product={modifierProduct}
        onClose={() => setModifierProduct(null)}
        onAddToCart={addToCart}
      />
    </div>
  );
};

export default PosSalesView;
