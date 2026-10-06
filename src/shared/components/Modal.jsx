import { useEffect, useRef, useId } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-4xl',
};

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
  className = '',
}) => {
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      closeButtonRef.current?.focus();
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto print:hidden">
      {}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={twMerge(
          clsx(
            'relative w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl shadow-2xl z-10 flex flex-col max-h-[90vh] my-auto overflow-hidden animate-fadeUp',
            sizeMap[size] || sizeMap.md,
            className
          )
        )}
      >
        {/* Modal Header */}
        {(title || onClose) && (
          <div className="px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/50 flex items-center justify-between gap-4 shrink-0">
            <div>
              {title && (
                <h3 id={titleId} className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{subtitle}</p>
              )}
            </div>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:border-red-200 dark:hover:border-red-800/80 transition-all focus-visible:outline-none cursor-pointer"
              aria-label="إغلاق النافذة"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto custom-scrollbar flex-1">{children}</div>
      </div>
    </div>
  );
};
