import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTableMenuApi } from '../../../lib/api/tables.api.js';
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { Input } from '../../../shared/components/Input.jsx';
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
} from 'lucide-react';

const SESSION_KEY_PREFIX = 'ts_session_';

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
    return () => { active = false; };
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
    try {
      await addMutation.mutateAsync({ productId: p.id, quantity: 1, addedByName: myName });
      setLocalFlash(`${myName} أضاف: ${p.name}`);
      setTimeout(() => setLocalFlash(null), 2500);
    } catch { /* silent */ }
  };

  const handleCallWaiter = async () => {
    setWaiterSent(false);
    try {
      await callWaiterMutation.mutateAsync({ requesterName: myName || 'عميل', note: 'يحتاج مساعدة' });
      setWaiterSent(true);
    } catch { /* silent */ }
  };

  const handleSubmitOrder = async () => {
    try {
      await submitMutation.mutateAsync();
    } catch { /* silent */ }
  };

  const isAwaiting = session?.status === 'AWAITING_CONFIRMATION';
  const isConfirmed = session?.status === 'CONFIRMED';
  const isClosed = session?.status === 'CLOSED';

  if (isMenuLoading) {
    return (
      <div className="min-h-screen bg-bg-base flex flex-col items-center py-10 px-4">
        <div className="w-full max-w-md space-y-4">
          <LoadingSkeleton height={90} className="w-full rounded-lg" />
          <LoadingSkeleton height={40} className="w-40 rounded-full mx-auto" />
          <LoadingSkeleton height={120} className="w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (menuError) {
    return (
      <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center px-4">
        <div className="bg-bg-surface border border-status-danger/30 rounded-lg p-8 text-center space-y-4 max-w-sm">
          <AlertCircle className="w-6 h-6 text-status-danger mx-auto" />
          <h1 className="text-lg font-bold text-txt-primary">قائمة الطعام غير متاحة</h1>
          <p className="text-sm text-txt-muted">{menuError}</p>
        </div>
      </div>
    );
  }

  // Not joined yet → show the name + PIN screen.
  if (!sessionId || (!session && !isSessionLoading)) {
    return (
      <div className="min-h-screen bg-bg-base">
        <div className="border-b border-border-default">
          <div className="max-w-md mx-auto px-4 py-6 text-center">
            {restaurant.logoUrl ? (
              <img src={resolveAssetUrl(restaurant.logoUrl)} alt={restaurant.name} className="w-20 h-20 object-cover rounded-lg border border-border-default mx-auto" />
            ) : (
              <Store className="w-10 h-10 text-brand-primary mx-auto" />
            )}
            <h1 className="mt-4 text-2xl font-bold text-txt-primary">{restaurant.name || 'مطعمنا'}</h1>
            <p className="mt-1 text-sm text-txt-muted">{table.label ? `طاولة ${table.label}` : branch.name}</p>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 py-8">
          <div className="bg-bg-surface border border-border-default rounded-lg p-6 space-y-4">
            <div className="text-center space-y-1">
              <Lock className="w-6 h-6 text-brand-primary mx-auto" />
              <h2 className="text-base font-bold text-txt-primary">ادخل اسمك و الـ PIN</h2>
              <p className="text-xs text-txt-muted">اسأل الموظف عن رمز الـ PIN الخاص بطاولتك</p>
            </div>

            <form onSubmit={handleJoin} className="space-y-4">
              <Input label="اسمك" value={myName} onChange={(e) => setMyName(e.target.value)} placeholder="مثال: أحمد" icon={Users} />
              <Input label="الـ PIN" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="••••" dir="ltr" icon={Lock} maxLength={4} inputMode="numeric" />

              {joinError && (
                <div className="p-3 rounded-md text-xs font-medium bg-status-danger-bg text-status-danger border border-status-danger/30 flex items-center gap-2">
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

  // In session → menu + shared cart.
  return (
    <div className="min-h-screen bg-bg-base">
      <div className="border-b border-border-default">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          {restaurant.logoUrl ? (
            <img src={resolveAssetUrl(restaurant.logoUrl)} alt={restaurant.name} className="w-10 h-10 object-cover rounded-lg border border-border-default" />
          ) : (
            <Store className="w-6 h-6 text-brand-primary" />
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-txt-primary truncate">{restaurant.name || 'مطعمنا'}</h1>
            <p className="text-xs text-txt-muted truncate">{table.label ? `طاولة ${table.label}` : branch.name}</p>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] text-txt-muted">
            <Users className="w-4 h-4" />
            {session?.members?.length || 0}
          </span>
        </div>
      </div>

      {localFlash && (
        <div className="max-w-md mx-auto px-4 pt-3">
          <div className="p-3 rounded-md text-xs font-medium bg-status-success-bg text-status-success border border-status-success/30 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{localFlash}</span>
          </div>
        </div>
      )}

      {waiterSent && (
        <div className="max-w-md mx-auto px-4 pt-3">
          <div className="p-3 rounded-md text-xs font-medium bg-status-success-bg text-status-success border border-status-success/30 flex items-center gap-2">
            <Bell className="w-4 h-4 shrink-0" />
            <span>تم استدعاء الويتر إلى طاولتك.</span>
          </div>
        </div>
      )}

      {isAwaiting && (
        <div className="max-w-md mx-auto px-4 pt-3">
          <div className="p-3 rounded-md text-xs font-medium bg-status-warning-bg text-status-warning border border-status-warning/30 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>أوردرك أتقدم للويتر للمراجعة، هييجي عندكم قريباً.</span>
          </div>
        </div>
      )}

      {(isConfirmed || isClosed) && (
        <div className="max-w-md mx-auto px-4 pt-3">
          <div className="p-3 rounded-md text-xs font-medium bg-status-success-bg text-status-success border border-status-success/30 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>تم تأكيد أوردرك وهو في الطريق للمطبخ. شكراً لكم!</span>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto px-4 py-5 space-y-5">
        {/* Category pills */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
            <button
              onClick={() => setSelectedCatId('ALL')}
              className={`px-3 py-2 rounded-full font-bold whitespace-nowrap transition-colors ${selectedCatId === 'ALL' ? 'bg-brand-primary text-white' : 'bg-bg-surface border border-border-default text-txt-muted'}`}
            >
              الكل ({totalProducts})
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCatId(c.id)}
                className={`px-3 py-2 rounded-full font-bold whitespace-nowrap transition-colors ${selectedCatId === c.id ? 'bg-brand-primary text-white' : 'bg-bg-surface border border-border-default text-txt-muted'}`}
              >
                {c.name} ({c.products?.length || 0})
              </button>
            ))}
          </div>
        )}

        {/* Products */}
        {filteredCategories.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <Tag className="w-6 h-6 text-txt-muted mx-auto" />
            <p className="text-sm font-bold text-txt-primary">قائمة الطعام فارغة</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredCategories.map((cat) => (
              <div key={cat.id} className="space-y-3">
                <h3 className="text-sm font-bold text-txt-primary flex items-center gap-2">
                  <Tag className="w-4 h-4 text-brand-primary" />
                  {cat.name}
                </h3>
                <div className="space-y-3">
                  {cat.products.map((p) => (
                    <div key={p.id} className="bg-bg-surface border border-border-default rounded-lg p-3 flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-1 min-w-0">
                        <h4 className="text-sm font-bold text-txt-primary">{p.name}</h4>
                        {p.description && <p className="text-xs text-txt-muted line-clamp-2">{p.description}</p>}
                        <span className="text-sm font-bold text-brand-primary">
                          {Number(p.price).toFixed(2)} {restaurant.currency || 'EGP'}
                        </span>
                      </div>
                      {p.imageUrl ? (
                        <img src={resolveAssetUrl(p.imageUrl)} alt={p.name} className="w-16 h-16 object-cover rounded-lg border border-border-default shrink-0" />
                      ) : null}
                      <Button size="sm" variant="outline" icon={Plus} onClick={() => handleAdd(p)} disabled={isAwaiting || isConfirmed || isClosed}>
                        أضف
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Shared cart (bottom sheet) */}
        <div className="bg-bg-surface border border-border-default rounded-lg overflow-hidden">
          <div className="p-4 border-b border-border-default flex items-center justify-between bg-bg-base/40">
            <h3 className="text-xs font-bold text-txt-primary flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-primary" />
              الطلبات المشتركة ({session?.items?.length || 0})
            </h3>
            <span className="text-xs text-txt-muted">الأعضاء: {(session?.members || []).map((m) => m.name).join('، ') || '—'}</span>
          </div>

          <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
            {!session?.items || session.items.length === 0 ? (
              <p className="text-xs text-txt-muted text-center py-6">السلة فاضية، اضغط «أضف» على أي صنف.</p>
            ) : (
              session.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-2 bg-bg-base/60 border border-border-subtle rounded-lg p-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-txt-primary truncate">{item.productName}</p>
                    <p className="text-[11px] text-txt-muted">
                      {item.quantity} × {Number(item.unitPrice).toFixed(2)} = {Number(item.total).toFixed(2)} {restaurant.currency || 'EGP'}
                    </p>
                    {item.addedByName && (
                      <p className="text-[11px] text-brand-primary flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        أضافها {item.addedByName}
                      </p>
                    )}
                  </div>
                  {!isAwaiting && !isConfirmed && !isClosed && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => updateMutation.mutate({ itemId: item.id, quantity: Math.max(1, item.quantity - 1) })} className="w-6 h-6 rounded bg-white/[0.05] border border-white/[0.06] flex items-center justify-center text-xs">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-mono font-bold">{item.quantity}</span>
                      <button onClick={() => updateMutation.mutate({ itemId: item.id, quantity: item.quantity + 1 })} className="w-6 h-6 rounded bg-white/[0.05] border border-white/[0.06] flex items-center justify-center text-xs">
                        <Plus className="w-3 h-3" />
                      </button>
                      <button onClick={() => removeMutation.mutate(item.id)} className="w-6 h-6 rounded hover:text-red-400 flex items-center justify-center text-xs" aria-label="حذف">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-border-default bg-bg-base/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-txt-muted">الإجمالي</span>
              <span className="text-base font-bold text-txt-primary font-mono">{Number(session?.total || 0).toFixed(2)} {restaurant.currency || 'EGP'}</span>
            </div>

            {!isAwaiting && !isConfirmed && !isClosed ? (
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" icon={Bell} onClick={handleCallWaiter} disabled={callWaiterMutation.isPending}>
                  استدعاء الويتر
                </Button>
                <Button variant="primary" size="sm" icon={Send} onClick={handleSubmitOrder} disabled={(session?.items?.length || 0) === 0 || submitMutation.isPending}>
                  اطلب الآن
                </Button>
              </div>
            ) : (
              <p className="text-xs text-txt-muted text-center">
                {isAwaiting ? 'الويتر يراجع طلبك دلوقتي.' : 'شكراً لزيارتكم، نتمنى لكم وجبة شهية.'}
              </p>
            )}
          </div>
        </div>

        <div className="pt-2 pb-6 text-center">
          <Link to="/" className="text-xs text-txt-muted hover:text-txt-primary">
            الرجوع للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PublicTableMenuPage;