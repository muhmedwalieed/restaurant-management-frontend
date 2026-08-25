import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getTableMenuApi } from '../../../lib/api/tables.api.js';
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { Input } from '../../../shared/components/Input.jsx';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog.jsx';
import { resolveAssetUrl } from '../../../lib/asset-url.js';
import {
  useJoinTableSession,
  useTableSessionQuery,
  useAddSessionItem,
  useUpdateSessionItem,
  useRemoveSessionItem,
  useCallWaiter,
  useSubmitDraft,
} from '../hooks/useTableSessions.js';
import {
  Store,
  Tag,
  AlertCircle,
  Plus,
  Minus,
  Trash2,
  Bell,
  Send,
  Users,
  CheckCircle2,
  Lock,
  ShoppingCart,
  Utensils,
  ShieldCheck,
} from 'lucide-react';
import { CartDrawer } from '../components/CartDrawer.jsx';
import { FloatingCartBar } from '../components/FloatingCartBar.jsx';

const SESSION_KEY_PREFIX = 'ts_session_';

const consolidateItems = (items) => {
  const map = new Map();
  for (const item of items || []) {
    const key = `${item.productId || item.productName}_${item.addedByName || ''}`;
    if (map.has(key)) {
      const existing = map.get(key);
      existing.quantity += item.quantity || 1;
      existing.total =
        (existing.total || 0) +
        (Number(item.total) || Number(item.unitPrice) * (item.quantity || 1));
      existing.itemIds.push(item.id);
    } else {
      map.set(key, {
        ...item,
        quantity: item.quantity || 1,
        total: Number(item.total) || Number(item.unitPrice) * (item.quantity || 1),
        itemIds: [item.id],
      });
    }
  }
  return Array.from(map.values());
};

const StatusBanner = ({ tone = 'success', icon: Icon, children }) => {
  const tones = {
    success: 'bg-status-success/10 text-status-success border-status-success/30',
    warning: 'bg-status-warning/10 text-status-warning border-status-warning/30',
    info: 'bg-brand-primary/10 text-brand-primary border-brand-primary/30',
  };
  return (
    <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-xs font-medium ${tones[tone]}`}>
      <Icon className="w-4 h-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
};

export const PublicTableMenuPage = () => {
  const { qrToken } = useParams();
  const [menu, setMenu] = useState(null);
  const [isMenuLoading, setIsMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState(null);
  const [selectedCatId, setSelectedCatId] = useState('ALL');
  const [myName, setMyName] = useState('');
  const [pin, setPin] = useState('');
  const [joinError, setJoinError] = useState(null);
  const [joinLoading, setJoinLoading] = useState(false);
  const [waiterSent, setWaiterSent] = useState(false);
  const [localFlash, setLocalFlash] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [confirmWaiter, setConfirmWaiter] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  const sessionStorageKey = `${SESSION_KEY_PREFIX}${qrToken}`;
  const [sessionId, setSessionId] = useState(() => localStorage.getItem(sessionStorageKey) || null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await getTableMenuApi(qrToken);
        if (active) setMenu(res);
      } catch (err) {
        if (active) setMenuError(err?.message || 'تعذر تحميل قائمة الطعام.');
      } finally {
        if (active) setIsMenuLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [qrToken]);

  const { data: session, isLoading: isSessionLoading } = useTableSessionQuery(sessionId, { poll: true });

  const joinMutation = useJoinTableSession(qrToken);
  const addMutation = useAddSessionItem(sessionId);
  const updateMutation = useUpdateSessionItem(sessionId);
  const removeMutation = useRemoveSessionItem(sessionId);
  const callWaiterMutation = useCallWaiter(sessionId);
  const submitMutation = useSubmitDraft(sessionId);

  const categories = menu?.categories || [];
  const restaurant = menu?.restaurant || {};
  const table = menu?.table || {};
  const branch = menu?.branch || {};

  const filteredCategories =
    selectedCatId === 'ALL' ? categories : categories.filter((c) => c.id === selectedCatId);
  const totalProducts = categories.reduce((acc, c) => acc + (c.products?.length || 0), 0);

  const cartRows = consolidateItems(session?.items);
  const totalCartItems = cartRows.reduce((sum, row) => sum + (row.quantity || 1), 0);
  const cartTotalPrice = Number(session?.total || 0).toFixed(2);

  const isAwaiting = session?.status === 'AWAITING_CONFIRMATION';
  const isConfirmed = session?.status === 'CONFIRMED';
  const isClosed = session?.status === 'CLOSED';
  const locked = isAwaiting || isConfirmed || isClosed;

  const handleJoin = async (e) => {
    e.preventDefault();
    setJoinError(null);
    if (!myName.trim()) return setJoinError('أدخل اسمك أولاً.');
    if (!/^\d{4}$/.test(pin)) return setJoinError('أدخل الـ PIN المكون من 4 أرقام.');
    setJoinLoading(true);
    try {
      const res = await joinMutation.mutateAsync({ name: myName.trim(), pin });
      setSessionId(res.id);
      localStorage.setItem(sessionStorageKey, res.id);
    } catch (err) {
      setJoinError(err?.message || 'تعذر الانضمام للجلسة.');
    } finally {
      setJoinLoading(false);
    }
  };

  const handleAdd = async (p) => {
    if (locked) return;
    try {
      await addMutation.mutateAsync({ productId: p.id, quantity: 1, addedByName: myName });
      setLocalFlash(`${myName || 'أنت'} أضفت: ${p.name}`);
      setTimeout(() => setLocalFlash(null), 2500);
    } catch {
      /* silent */
    }
  };

  const handleConfirmWaiter = async () => {
    setConfirmWaiter(false);
    setWaiterSent(false);
    try {
      await callWaiterMutation.mutateAsync({ requesterName: myName || 'عميل', note: 'يحتاج مساعدة' });
      setWaiterSent(true);
    } catch {
      /* silent */
    }
  };

  const handleConfirmSubmit = async () => {
    setConfirmSubmit(false);
    try {
      await submitMutation.mutateAsync();
      setIsCartOpen(false);
    } catch {
      /* silent */
    }
  };

  const requestWaiter = () => {
    if (locked) return;
    setConfirmWaiter(true);
  };

  const requestSubmit = () => {
    if (totalCartItems === 0 || locked) return;
    setConfirmSubmit(true);
  };

  const currency = restaurant.currency || 'EGP';

  if (isMenuLoading) {
    return (
      <div className="min-h-screen bg-bg-base flex flex-col items-center py-12 px-4">
        <div className="w-full max-w-2xl space-y-4">
          <LoadingSkeleton height={96} className="w-full rounded-2xl" />
          <LoadingSkeleton height={40} className="w-44 rounded-full mx-auto" />
          <div className="grid sm:grid-cols-2 gap-3">
            <LoadingSkeleton height={180} className="rounded-2xl" />
            <LoadingSkeleton height={180} className="rounded-2xl" />
            <LoadingSkeleton height={180} className="rounded-2xl" />
            <LoadingSkeleton height={180} className="rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (menuError) {
    return (
      <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center px-4">
        <div className="bg-bg-surface border border-status-danger/30 rounded-2xl p-8 text-center space-y-4 max-w-sm shadow-lg">
          <span className="inline-flex p-3.5 rounded-full bg-status-danger/10">
            <AlertCircle className="w-6 h-6 text-status-danger" />
          </span>
          <h1 className="text-lg font-bold text-txt-primary">قائمة الطعام غير متاحة</h1>
          <p className="text-sm text-txt-muted leading-relaxed">{menuError}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            إعادة المحاولة
          </Button>
        </div>
      </div>
    );
  }

  // Not joined yet → show the name + PIN screen.
  if (!sessionId || (!session && !isSessionLoading)) {
    return (
      <div className="min-h-screen bg-bg-base">
        {/* Hero */}
        <div className="relative overflow-hidden bg-gradient-to-b from-brand-primary/15 via-transparent to-transparent">
          <div className="max-w-md mx-auto px-6 pt-12 pb-8 text-center">
            {restaurant.logoUrl ? (
              <img
                src={resolveAssetUrl(restaurant.logoUrl)}
                alt={restaurant.name}
                className="w-24 h-24 object-cover rounded-2xl border border-border-default shadow-lg mx-auto"
              />
            ) : (
              <span className="inline-flex w-24 h-24 rounded-2xl bg-bg-surface border border-border-default items-center justify-center shadow-lg">
                <Store className="w-10 h-10 text-brand-primary" />
              </span>
            )}
            <h1 className="mt-5 text-2xl font-bold text-txt-primary">{restaurant.name || 'مطعمنا'}</h1>
            <p className="mt-2 text-sm text-txt-muted">
              {table.label ? `طاولة ${table.label}` : branch.name}
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-txt-muted bg-bg-surface border border-border-subtle px-3 py-1.5 rounded-full">
              <Utensils className="w-3.5 h-3.5 text-brand-primary" />
              اطلب بنفسك من الطاولة
            </span>
          </div>
        </div>

        {/* Join card */}
        <div className="max-w-md mx-auto px-6 pb-12 -mt-2">
          <div className="bg-bg-surface border border-border-default rounded-2xl p-6 shadow-lg space-y-5">
            <div className="text-center space-y-1.5">
              <span className="inline-flex p-3 rounded-full bg-brand-primary/10">
                <Lock className="w-5 h-5 text-brand-primary" />
              </span>
              <h2 className="text-base font-bold text-txt-primary">ادخل اسمك و الـ PIN</h2>
              <p className="text-xs text-txt-muted">اسأل الموظف عن رمز الـ PIN الخاص بطاولتك</p>
            </div>

            <form onSubmit={handleJoin} className="space-y-4">
              <Input
                label="اسمك"
                value={myName}
                onChange={(e) => setMyName(e.target.value)}
                placeholder="مثال: أحمد"
                icon={Users}
              />
              <Input
                label="الـ PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="••••"
                dir="ltr"
                icon={Lock}
                maxLength={4}
                inputMode="numeric"
              />

              {joinError && (
                <div className="p-3 rounded-xl text-xs font-medium bg-status-danger/10 text-status-danger border border-status-danger/30 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{joinError}</span>
                </div>
              )}

              <Button type="submit" className="w-full" isLoading={joinLoading} icon={Send}>
                دخول الجلسة
              </Button>
            </form>

            {!table.label && (
              <p className="text-[11px] text-txt-muted text-center">
                لو مفيش جلسة نشطة، اطلب من الموظف يبدأها عن طريق نقطة البيع.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // In session → menu + cart.
  return (
    <div className="min-h-screen bg-bg-base">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border-default bg-bg-surface/85 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          {restaurant.logoUrl ? (
            <img
              src={resolveAssetUrl(restaurant.logoUrl)}
              alt={restaurant.name}
              className="w-10 h-10 object-cover rounded-lg border border-border-default shrink-0"
            />
          ) : (
            <span className="w-10 h-10 rounded-lg bg-bg-surface-elevated border border-border-default shrink-0 flex items-center justify-center">
              <Store className="w-5 h-5 text-brand-primary" />
            </span>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-txt-primary truncate">{restaurant.name || 'مطعمنا'}</h1>
            <p className="text-xs text-txt-muted truncate">{table.label ? `طاولة ${table.label}` : branch.name}</p>
          </div>
          <span
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-txt-muted bg-bg-base px-2.5 py-1 rounded-full border border-border-subtle"
            title={session?.members?.map((m) => m.name).join('، ') || ''}
          >
            <Users className="w-3.5 h-3.5 text-brand-primary" />
            <span>{session?.members?.length || 0}</span>
          </span>
          <Button
            size="sm"
            variant="outline"
            icon={Bell}
            onClick={requestWaiter}
            disabled={locked || callWaiterMutation.isPending}
            className="hidden md:inline-flex text-xs border-brand-primary/30 text-brand-primary hover:bg-brand-primary/10"
          >
            استدعاء الويتر
          </Button>
        </div>
      </header>

      {/* Notifications */}
      <div className="max-w-6xl mx-auto px-4 pt-3 space-y-2">
        {localFlash && (
          <StatusBanner tone="success" icon={CheckCircle2}>
            {localFlash}
          </StatusBanner>
        )}
        {waiterSent && (
          <StatusBanner tone="success" icon={Bell}>
            تم استدعاء الويتر إلى طاولتك، هيوصلك حالاً.
          </StatusBanner>
        )}
        {isAwaiting && (
          <StatusBanner tone="warning" icon={CheckCircle2}>
            أوردرك اتبعت للويتر للمراجعة، هييجي عندكم قريباً.
          </StatusBanner>
        )}
        {isConfirmed && (
          <StatusBanner tone="success" icon={CheckCircle2}>
            تم تأكيد أوردرك وهو في الطريق للمطبخ. شكراً لكم!
          </StatusBanner>
        )}
        {isClosed && (
          <StatusBanner tone="info" icon={ShieldCheck}>
            الجلسة انتهت، شكراً لزيارتكم.
          </StatusBanner>
        )}
      </div>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-5 pb-32 lg:pb-10">
        <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-6 lg:items-start">
          {/* Menu column */}
          <div className="min-w-0">
            {/* Category pills */}
            {categories.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs custom-scrollbar sticky top-[68px] z-20 bg-bg-base/95 backdrop-blur py-1 -mx-1 px-1 rounded-xl">
                <button
                  onClick={() => setSelectedCatId('ALL')}
                  className={`px-4 py-2 rounded-full font-bold whitespace-nowrap transition-all shadow-sm ${
                    selectedCatId === 'ALL'
                      ? 'bg-brand-primary text-slate-950'
                      : 'bg-bg-surface border border-border-default text-txt-muted hover:text-txt-primary'
                  }`}
                >
                  الكل ({totalProducts})
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCatId(c.id)}
                    className={`px-4 py-2 rounded-full font-bold whitespace-nowrap transition-all shadow-sm ${
                      selectedCatId === c.id
                        ? 'bg-brand-primary text-slate-950'
                        : 'bg-bg-surface border border-border-default text-txt-muted hover:text-txt-primary'
                    }`}
                  >
                    {c.name} ({c.products?.length || 0})
                  </button>
                ))}
              </div>
            )}

            {/* Products */}
            {filteredCategories.length === 0 ? (
              <div className="text-center py-16 space-y-2">
                <Tag className="w-6 h-6 text-txt-muted mx-auto" />
                <p className="text-sm font-bold text-txt-primary">قائمة الطعام فارغة</p>
              </div>
            ) : (
              <div className="space-y-7 pt-2">
                {filteredCategories.map((cat) => (
                  <section key={cat.id} className="space-y-3">
                    <h3 className="text-sm font-bold text-txt-primary flex items-center gap-2">
                      <Tag className="w-4 h-4 text-brand-primary" />
                      <span>{cat.name}</span>
                      <span className="text-xs font-semibold text-txt-muted">({cat.products?.length || 0})</span>
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {cat.products.map((p) => (
                        <div
                          key={p.id}
                          className="bg-bg-surface border border-border-default rounded-2xl overflow-hidden flex flex-col hover:border-brand-primary/40 hover:shadow-md transition-all"
                        >
                          {p.imageUrl ? (
                            <img
                              src={resolveAssetUrl(p.imageUrl)}
                              alt={p.name}
                              className="w-full h-36 object-cover"
                            />
                          ) : (
                            <div className="w-full h-36 bg-bg-surface-elevated flex items-center justify-center">
                              <Utensils className="w-8 h-8 text-txt-muted/40" />
                            </div>
                          )}
                          <div className="p-3.5 flex flex-col gap-1.5 flex-1">
                            <h4 className="text-sm font-bold text-txt-primary">{p.name}</h4>
                            {p.description && (
                              <p className="text-xs text-txt-muted line-clamp-2">{p.description}</p>
                            )}
                            <div className="mt-auto flex items-center justify-between pt-2.5">
                              <span className="text-sm font-bold text-brand-primary font-mono" dir="ltr">
                                {Number(p.price).toFixed(2)} {currency}
                              </span>
                              <Button
                                size="sm"
                                icon={Plus}
                                onClick={() => handleAdd(p)}
                                disabled={locked}
                                className="text-xs py-1.5 px-3.5 rounded-lg bg-brand-primary text-slate-950 hover:bg-brand-primary-hover font-bold"
                              >
                                أضف
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>

          {/* Desktop cart column */}
          <aside className="hidden lg:block lg:sticky lg:top-20">
            <div className="bg-bg-surface border border-border-default rounded-2xl shadow-md overflow-hidden">
              <div className="px-4 py-3.5 border-b border-border-default flex items-center justify-between">
                <h3 className="text-sm font-bold text-txt-primary flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-brand-primary" />
                  سلة الطلب
                </h3>
                <span className="text-xs text-txt-muted">{totalCartItems} صنف</span>
              </div>

              <div className="p-4 space-y-3 max-h-[45vh] overflow-y-auto custom-scrollbar">
                {cartRows.length === 0 ? (
                  <div className="text-center py-10 space-y-2">
                    <ShoppingCart className="w-6 h-6 text-txt-muted/40 mx-auto" />
                    <p className="text-xs text-txt-muted">سلتك فاضية، اختار من القائمة.</p>
                  </div>
                ) : (
                  cartRows.map((row, idx) => (
                    <div key={idx} className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-txt-primary truncate">{row.productName || row.productId}</p>
                        <p className="text-[11px] text-txt-muted mt-0.5">أضافها: {row.addedByName || 'عميل'}</p>
                        <p className="text-xs font-semibold text-txt-muted mt-0.5" dir="ltr">
                          {(row.unitPrice || row.total / row.quantity || 0).toFixed(2)} {currency}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => updateMutation.mutate({ itemId: row.itemIds[0], quantity: (row.quantity || 1) - 1 })}
                          disabled={locked || updateMutation.isPending}
                          className="p-1.5 rounded-lg bg-bg-surface-elevated text-txt-muted hover:text-txt-primary disabled:opacity-40 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold text-txt-primary w-5 text-center">{row.quantity}</span>
                        <button
                          onClick={() => updateMutation.mutate({ itemId: row.itemIds[0], quantity: (row.quantity || 1) + 1 })}
                          disabled={locked || updateMutation.isPending}
                          className="p-1.5 rounded-lg bg-bg-surface-elevated text-txt-muted hover:text-txt-primary disabled:opacity-40 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => removeMutation.mutate(row.itemIds[0])}
                          disabled={locked || removeMutation.isPending}
                          className="p-1.5 rounded-lg text-txt-muted hover:text-status-danger disabled:opacity-40 transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="px-4 py-3.5 border-t border-border-default bg-bg-surface/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-txt-muted">الإجمالي النهائي:</span>
                  <span className="text-base font-bold text-txt-primary font-mono" dir="ltr">
                    {cartTotalPrice} {currency}
                  </span>
                </div>
                {!locked ? (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Bell}
                      onClick={requestWaiter}
                      disabled={callWaiterMutation.isPending}
                      className="px-3 text-xs rounded-lg"
                    >
                      استدعاء الويتر
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Send}
                      onClick={requestSubmit}
                      disabled={totalCartItems === 0 || submitMutation.isPending}
                      className="flex-1 text-xs rounded-lg bg-brand-primary text-slate-950 hover:bg-brand-primary-hover font-bold"
                    >
                      اطلب الآن
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-txt-muted text-center py-1">
                    {isAwaiting ? 'أوردرك قيد المراجعة مع الويتر.' : 'شكراً لزيارتكم، نتمنى لكم وجبة شهية.'}
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Mobile bottom sheet cart + floating bar */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        session={session}
        restaurant={restaurant}
        onUpdateQuantity={(itemId, quantity) => updateMutation.mutate({ itemId, quantity })}
        onRemoveItem={(itemId) => removeMutation.mutate(itemId)}
        onCallWaiter={requestWaiter}
        onSubmitOrder={requestSubmit}
        isCallWaiterPending={callWaiterMutation.isPending}
        isSubmitPending={submitMutation.isPending}
      />

      <div className="lg:hidden">
        <FloatingCartBar
          totalCartItems={totalCartItems}
          cartTotalPrice={cartTotalPrice}
          currency={currency}
          isCartOpen={isCartOpen}
          onToggleCart={() => setIsCartOpen(!isCartOpen)}
          onCallWaiter={requestWaiter}
          isCallWaiterPending={callWaiterMutation.isPending}
        />
      </div>

      {/* Confirmation dialogs */}
      <ConfirmDialog
        isOpen={confirmWaiter}
        onClose={() => setConfirmWaiter(false)}
        title="استدعاء الويتر"
        message="هل تريد فعلاً استدعاء الويتر إلى طاولتك؟"
        confirmLabel="نعم، استدعِ الويتر"
        isLoading={callWaiterMutation.isPending}
        onConfirm={handleConfirmWaiter}
      />

      <ConfirmDialog
        isOpen={confirmSubmit}
        onClose={() => setConfirmSubmit(false)}
        title="إرسال الطلب"
        message={`هل تريد إرسال أوردرك الحالي (${totalCartItems} صنف بقيمة ${cartTotalPrice} ${currency}) للمراجعة؟`}
        confirmLabel="إرسال الطلب"
        isLoading={submitMutation.isPending}
        onConfirm={handleConfirmSubmit}
      />
    </div>
  );
};

export default PublicTableMenuPage;