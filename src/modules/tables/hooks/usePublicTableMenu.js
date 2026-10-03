import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getTableMenuApi } from '../../../lib/api/tables.api.js';
import {
  useJoinTableSession,
  useTableSessionQuery,
  useAddSessionItem,
  useUpdateSessionItem,
  useRemoveSessionItem,
  useCallWaiter,
  useSubmitDraft,
} from './useTableSessions.js';

const SESSION_KEY_PREFIX = 'ts_session_';
const MEMBER_KEY_PREFIX = 'ts_member_';
const WAITER_COOLDOWN_SECONDS = 120;

export const consolidateItems = (items) => {
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

export const usePublicTableMenu = (qrToken) => {
  const qc = useQueryClient();
  const [menu, setMenu] = useState(null);
  const [isMenuLoading, setIsMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState(null);
  const [menuErrorCode, setMenuErrorCode] = useState(null);
  const [selectedCatId, setSelectedCatId] = useState('ALL');

  const nameStorageKey = `ts_name_${qrToken}`;
  const [myName, setMyName] = useState(() => localStorage.getItem(nameStorageKey) || '');
  const [pin, setPin] = useState('');
  const [joinError, setJoinError] = useState(null);
  const [joinLoading, setJoinLoading] = useState(false);
  const [waiterSent, setWaiterSent] = useState(false);
  const [localFlash, setLocalFlash] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [confirmWaiter, setConfirmWaiter] = useState(false);
  const [waiterCallType, setWaiterCallType] = useState('HELP');
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [waiterCooldownActive, setWaiterCooldownActive] = useState(false);
  const [waiterCooldownLeft, setWaiterCooldownLeft] = useState(0);

  useEffect(() => {
    if (!waiterCooldownActive) return;
    const t = setInterval(() => {
      setWaiterCooldownLeft((c) => {
        if (c <= 1) {
          setWaiterCooldownActive(false);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [waiterCooldownActive]);

  const sessionStorageKey = `${SESSION_KEY_PREFIX}${qrToken}`;
  const memberStorageKey = `${MEMBER_KEY_PREFIX}${qrToken}`;
  const [sessionId, setSessionId] = useState(() => localStorage.getItem(sessionStorageKey) || null);
  const [memberToken, setMemberToken] = useState(() => localStorage.getItem(memberStorageKey) || null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await getTableMenuApi(qrToken);
        if (active) setMenu(res);
      } catch (err) {
        if (active) {
          setMenuError(err?.message || 'تعذر تحميل قائمة الطعام.');
          setMenuErrorCode(err?.code || null);
        }
      } finally {
        if (active) setIsMenuLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [qrToken]);

  const { data: session, isLoading: isSessionLoading, error: sessionError } = useTableSessionQuery(
    sessionId,
    memberToken,
    { poll: true }
  );

  const joinMutation = useJoinTableSession(qrToken);
  const addMutation = useAddSessionItem(sessionId, memberToken);
  const updateMutation = useUpdateSessionItem(sessionId, memberToken);
  const removeMutation = useRemoveSessionItem(sessionId, memberToken);
  const callWaiterMutation = useCallWaiter(sessionId, memberToken);
  const submitMutation = useSubmitDraft(sessionId, memberToken);

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
  const isClosed = session?.status === 'CLOSED';
  const locked = isClosed;

  useEffect(() => {
    if (!sessionId) return;
    if (sessionError?.status === 404 || sessionError?.status === 401) {
      localStorage.removeItem(sessionStorageKey);
      localStorage.removeItem(memberStorageKey);
      localStorage.removeItem(nameStorageKey);
      setSessionId(null);
      setMemberToken(null);
      if (sessionError?.status === 401) {
        setJoinError('انتهت صلاحية الجلسة، يرجى إدخال اسمك ورمز PIN للانضمام مجدداً.');
      }
    }
  }, [sessionId, sessionError?.status, sessionStorageKey, memberStorageKey, nameStorageKey]);

  const handleLeaveSession = () => {
    localStorage.removeItem(sessionStorageKey);
    localStorage.removeItem(memberStorageKey);
    localStorage.removeItem(nameStorageKey);
    setSessionId(null);
    setMemberToken(null);
    setMyName('');
    setPin('');
  };

  const handleMemberExpired = () => {
    localStorage.removeItem(sessionStorageKey);
    localStorage.removeItem(memberStorageKey);
    localStorage.removeItem(nameStorageKey);
    setSessionId(null);
    setMemberToken(null);
    setJoinError('انتهت صلاحية الجلسة الحالية، يرجى تسجيل الدخول مجدداً بالاسم والرمز السري.');
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setJoinError(null);
    if (!myName.trim()) return setJoinError('يرجى إدخال اسمك أولاً.');
    if (!/^\d{4}$/.test(pin)) return setJoinError('يرجى إدخال الرمز السري (PIN) المكون من 4 أرقام.');
    setJoinLoading(true);
    try {
      const res = await joinMutation.mutateAsync({ name: myName.trim(), pin });
      const token = res.memberToken || null;
      setSessionId(res.id);
      localStorage.setItem(sessionStorageKey, res.id);
      setMemberToken(token);
      localStorage.setItem(memberStorageKey, token || '');
      localStorage.setItem(nameStorageKey, myName.trim());
      qc.setQueryData(['table-session', res.id, token], res);
    } catch (err) {
      setJoinError(err?.message || 'تعذر الانضمام للجلسة، يرجى التحقق من صحة البيانات.');
    } finally {
      setJoinLoading(false);
    }
  };

  const handleAdd = async (p) => {
    if (locked) {
      setLocalFlash('الجلسة مغلقة، لا يمكن إضافة أصناف جديدة.');
      setTimeout(() => setLocalFlash(null), 3000);
      return;
    }
    try {
      await addMutation.mutateAsync({ productId: p.id, quantity: 1, addedByName: myName });
      setLocalFlash(`تمت إضافة ${p.name} إلى السلة`);
      setTimeout(() => setLocalFlash(null), 2500);
    } catch (err) {
      if (err?.status === 401) {
        handleMemberExpired();
        return;
      }
      setLocalFlash(err?.message || 'تعذر إضافة الصنف، يرجى المحاولة مرة أخرى.');
      setTimeout(() => setLocalFlash(null), 4000);
    }
  };

  const handleConfirmWaiter = async () => {
    const isBill = waiterCallType === 'BILL';
    const isConfirm = waiterCallType === 'CONFIRM_ORDER';
    setConfirmWaiter(false);
    setWaiterSent(false);
    try {
      await callWaiterMutation.mutateAsync({
        requesterName: myName || 'عميل',
        note: isBill ? 'طلب الفاتورة والحساب' : isConfirm ? 'طلب تأكيد الأوردر مع الويتر' : 'يحتاج مساعدة',
        type: waiterCallType,
      });
      setWaiterSent(true);
      setWaiterCooldownLeft(WAITER_COOLDOWN_SECONDS);
      setWaiterCooldownActive(true);
      setTimeout(() => setWaiterSent(false), 8000);
      setLocalFlash(
        isBill
          ? 'تم طلب الفاتورة والحساب بنجاح، الويتر في الطريق لطاولتكم.'
          : isConfirm
          ? 'تم طلب تأكيد الأوردر، الويتر قادم لمراجعة الطلب معكم.'
          : 'تم استدعاء الويتر لطاولتكم بنجاح، سيصل إليكم قريباً.'
      );
      setTimeout(() => setLocalFlash(null), 4000);
    } catch (err) {
      if (err?.status === 401) {
        handleMemberExpired();
        return;
      }
      const message =
        err?.code === 'BUSINESS_RULE_ERROR' || err?.message?.includes('already active')
          ? 'يوجد بالفعل طلب نشط لطاولتكم، الويتر في الطريق إليكم.'
          : err?.message || 'تعذر استدعاء الويتر، يرجى المحاولة مرة أخرى.';
      setLocalFlash(message);
      setTimeout(() => setLocalFlash(null), 4000);
    }
  };

  const handleConfirmSubmit = async () => {
    setConfirmSubmit(false);
    try {
      await submitMutation.mutateAsync();
      setIsCartOpen(false);
      try {
        await callWaiterMutation.mutateAsync({
          requesterName: myName || 'عميل',
          note: 'طلب تأكيد الأوردر مع الويتر وإرساله للمطبخ',
          type: 'CONFIRM_ORDER',
        });
      } catch (_) {
        // Non-blocking
      }
    } catch (err) {
      if (err?.status === 401) {
        handleMemberExpired();
        return;
      }
      setLocalFlash(err?.message || 'تعذر إرسال الطلب، يرجى المحاولة مرة أخرى.');
      setTimeout(() => setLocalFlash(null), 4000);
    }
  };

  const requestWaiter = () => {
    if (locked || waiterCooldownLeft > 0) return;
    setWaiterCallType('HELP');
    setConfirmWaiter(true);
  };

  const requestBill = () => {
    if (locked || waiterCooldownLeft > 0) return;
    setWaiterCallType('BILL');
    setConfirmWaiter(true);
  };

  const requestSubmit = () => {
    if (totalCartItems === 0 || locked) return;
    setConfirmSubmit(true);
  };

  const currency = restaurant.currency || 'EGP';

  return {
    menu,
    isMenuLoading,
    menuError,
    menuErrorCode,
    categories,
    restaurant,
    table,
    branch,
    filteredCategories,
    totalProducts,
    selectedCatId,
    setSelectedCatId,
    myName,
    setMyName,
    pin,
    setPin,
    joinError,
    joinLoading,
    handleJoin,
    sessionId,
    session,
    isSessionLoading,
    cartRows,
    totalCartItems,
    cartTotalPrice,
    currency,
    isAwaiting,
    isClosed,
    locked,
    localFlash,
    setLocalFlash,
    waiterSent,
    waiterCooldownLeft,
    isCartOpen,
    setIsCartOpen,
    confirmWaiter,
    setConfirmWaiter,
    waiterCallType,
    confirmSubmit,
    setConfirmSubmit,
    callWaiterMutation,
    updateMutation,
    removeMutation,
    submitMutation,
    handleAdd,
    handleLeaveSession,
    handleMemberExpired,
    handleConfirmWaiter,
    handleConfirmSubmit,
    requestWaiter,
    requestBill,
    requestSubmit,
  };
};
