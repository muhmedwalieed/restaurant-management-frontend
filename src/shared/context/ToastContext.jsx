import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  X, 
  ShieldAlert,
  HelpCircle
} from 'lucide-react';

const ToastContext = createContext(null);

// Global event bus for non-React context callers (singleton `toast` export)
const toastListeners = new Set();
const modalListeners = new Set();

export const toast = {
  success: (message, title = 'تمت العملية بنجاح', options = {}) => {
    toastListeners.forEach((fn) => fn({ type: 'success', title, message, ...options }));
  },
  error: (message, title = 'حدث خطأ', options = {}) => {
    toastListeners.forEach((fn) => fn({ type: 'error', title, message, ...options }));
  },
  warning: (message, title = 'تنبيه', options = {}) => {
    toastListeners.forEach((fn) => fn({ type: 'warning', title, message, ...options }));
  },
  info: (message, title = 'معلومة', options = {}) => {
    toastListeners.forEach((fn) => fn({ type: 'info', title, message, ...options }));
  },
  alert: (message, title = 'تنبيه', options = {}) => {
    return new Promise((resolve) => {
      modalListeners.forEach((fn) =>
        fn({
          isOpen: true,
          mode: 'alert',
          title: title || 'تنبيه',
          message: typeof message === 'string' ? message : JSON.stringify(message),
          type: options.type || 'info',
          confirmText: options.confirmText || 'حسناً',
          resolve,
        })
      );
    });
  },
  confirm: (message, title = 'تأكيد الإجراء', options = {}) => {
    return new Promise((resolve) => {
      modalListeners.forEach((fn) =>
        fn({
          isOpen: true,
          mode: 'confirm',
          title: title || 'تأكيد الإجراء',
          message: typeof message === 'string' ? message : JSON.stringify(message),
          type: options.type || 'danger',
          confirmText: options.confirmText || 'تأكيد',
          cancelText: options.cancelText || 'إلغاء',
          resolve,
        })
      );
    });
  },
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      toast,
      showToast: toast.info,
      success: toast.success,
      error: toast.error,
      warning: toast.warning,
      info: toast.info,
      confirm: toast.confirm,
      alert: toast.alert,
    };
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: 'alert',
    title: '',
    message: '',
    type: 'info',
    confirmText: 'حسناً',
    cancelText: 'إلغاء',
    resolve: null,
  });

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toastData) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 7);
    const newToast = {
      id,
      duration: toastData.duration || 4500,
      type: toastData.type || 'info',
      title: toastData.title,
      message: toastData.message,
      createdAt: Date.now(),
    };

    setToasts((prev) => [newToast, ...prev.slice(0, 4)]);
  }, []);

  useEffect(() => {
    const handleToastEvent = (data) => addToast(data);
    const handleModalEvent = (data) => setModalState(data);

    toastListeners.add(handleToastEvent);
    modalListeners.add(handleModalEvent);

    return () => {
      toastListeners.delete(handleToastEvent);
      modalListeners.delete(handleModalEvent);
    };
  }, [addToast]);

  const confirm = useCallback((message, title = 'تأكيد الإجراء', options = {}) => {
    return toast.confirm(message, title, options);
  }, []);

  const alertModal = useCallback((message, title = 'تنبيه', options = {}) => {
    return toast.alert(message, title, options);
  }, []);

  const handleModalClose = (result) => {
    if (modalState.resolve) {
      modalState.resolve(result);
    }
    setModalState((prev) => ({ ...prev, isOpen: false, resolve: null }));
  };

  return (
    <ToastContext.Provider
      value={{
        toast,
        showToast: addToast,
        success: toast.success,
        error: toast.error,
        warning: toast.warning,
        info: toast.info,
        confirm,
        alert: alertModal,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <CustomAlertConfirmModal state={modalState} onClose={handleModalClose} />
    </ToastContext.Provider>
  );
};

/* --- Toast Container & Card Component --- */

const TOAST_ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const TOAST_STYLES = {
  success: {
    border: 'border-emerald-500/30 dark:border-emerald-500/40',
    bg: 'bg-white/95 dark:bg-slate-900/95 shadow-emerald-500/10',
    iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    glow: 'from-emerald-500/20 to-transparent',
    progressBar: 'bg-emerald-500',
    titleColor: 'text-slate-900 dark:text-slate-100',
  },
  error: {
    border: 'border-rose-500/30 dark:border-rose-500/40',
    bg: 'bg-white/95 dark:bg-slate-900/95 shadow-rose-500/10',
    iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    glow: 'from-rose-500/20 to-transparent',
    progressBar: 'bg-rose-500',
    titleColor: 'text-slate-900 dark:text-slate-100',
  },
  warning: {
    border: 'border-amber-500/30 dark:border-amber-500/40',
    bg: 'bg-white/95 dark:bg-slate-900/95 shadow-amber-500/10',
    iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    glow: 'from-amber-500/20 to-transparent',
    progressBar: 'bg-amber-500',
    titleColor: 'text-slate-900 dark:text-slate-100',
  },
  info: {
    border: 'border-blue-500/30 dark:border-blue-500/40',
    bg: 'bg-white/95 dark:bg-slate-900/95 shadow-blue-500/10',
    iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    glow: 'from-blue-500/20 to-transparent',
    progressBar: 'bg-blue-500',
    titleColor: 'text-slate-900 dark:text-slate-100',
  },
};

const ToastCard = ({ toast: item, onRemove }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const style = TOAST_STYLES[item.type] || TOAST_STYLES.info;
  const Icon = TOAST_ICONS[item.type] || Info;

  useEffect(() => {
    if (isPaused) return;

    const intervalTime = 20;
    const step = (intervalTime / item.duration) * 100;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev - step;
        if (next <= 0) {
          clearInterval(interval);
          setTimeout(() => onRemove(item.id), 0);
          return 0;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isPaused, item.duration, item.id, onRemove]);

  return (
    <div
      dir="rtl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`relative group overflow-hidden w-full max-w-sm rounded-2xl border ${style.border} ${style.bg} backdrop-blur-xl shadow-2xl transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-top-4`}
      style={{
        boxShadow: '0 12px 36px -4px rgba(0, 0, 0, 0.18), 0 4px 12px -2px rgba(0, 0, 0, 0.08)',
      }}
    >
      {/* Top subtle glow line */}
      <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${style.glow}`} />

      <div className="p-4 flex items-start gap-3.5">
        <div className={`p-2.5 rounded-xl ${style.iconBg} shrink-0 mt-0.5 ring-1 ring-black/5 dark:ring-white/10`}>
          <Icon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0 pr-0.5">
          {item.title && (
            <h4 className={`text-sm font-bold tracking-tight ${style.titleColor}`}>
              {item.title}
            </h4>
          )}
          {item.message && (
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed break-words font-medium">
              {item.message}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 -mr-1 -mt-1"
          aria-label="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-slate-100 dark:bg-slate-800/80">
        <div
          className={`h-full ${style.progressBar} transition-all duration-75 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

const ToastContainer = ({ toasts, onRemove }) => {
  if (!toasts.length) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-[9999] flex flex-col-reverse gap-3 pointer-events-auto max-w-[92vw] w-[380px]"
      style={{ direction: 'rtl' }}
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
};

/* --- Custom Alert & Confirm Modal --- */

const CustomAlertConfirmModal = ({ state, onClose }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!state.isOpen) return;
      if (e.key === 'Escape') {
        onClose(false);
      } else if (e.key === 'Enter') {
        onClose(true);
      }
    };

    if (state.isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [state.isOpen, onClose]);

  if (!state.isOpen) return null;

  const isDanger = state.type === 'danger' || state.type === 'error';
  const isWarning = state.type === 'warning';

  const ModalIcon = isDanger ? ShieldAlert : isWarning ? AlertTriangle : HelpCircle;

  const iconClasses = isDanger
    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-rose-500/20'
    : isWarning
    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20'
    : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-blue-500/20';

  const confirmBtnClasses = isDanger
    ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-rose-500/20 shadow-lg'
    : isWarning
    ? 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white shadow-amber-500/20 shadow-lg'
    : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-blue-500/20 shadow-lg';

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 overflow-y-auto print:hidden"
      dir="rtl"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={() => onClose(false)}
      />

      {/* Modal Box */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 fade-in duration-200"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        }}
      >
        {/* Top Header decoration */}
        <div
          className={`h-2 w-full bg-gradient-to-r ${
            isDanger
              ? 'from-rose-500 via-red-500 to-rose-600'
              : isWarning
              ? 'from-amber-400 via-amber-500 to-yellow-500'
              : 'from-blue-500 via-indigo-500 to-blue-600'
          }`}
        />

        <div className="p-6 sm:p-7">
          <div className="flex items-start gap-4">
            <div
              className={`p-3.5 rounded-2xl shrink-0 ring-1 ${iconClasses} shadow-inner`}
            >
              <ModalIcon className="w-6 h-6" />
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {state.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed whitespace-pre-line font-medium">
                {state.message}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-7 flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            {state.mode === 'confirm' && (
              <button
                type="button"
                onClick={() => onClose(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all focus:outline-none"
              >
                {state.cancelText || 'إلغاء'}
              </button>
            )}

            <button
              type="button"
              autoFocus
              onClick={() => onClose(true)}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold active:scale-95 transition-all focus:outline-none ${confirmBtnClasses}`}
            >
              {state.confirmText || 'حسناً'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToastProvider;
