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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={twMerge(
          clsx(
            'relative w-full bg-bg-surface border border-border-default rounded-lg shadow-2xl z-10 flex flex-col max-h-[90vh] my-auto overflow-hidden',
            sizeMap[size] || sizeMap.md,
            className
          )
        )}
      >
        {/* Header */}
        {(title || onClose) && (
          <div className="px-6 py-4 border-b border-border-default flex items-center justify-between gap-4 shrink-0">
            <div>
              {title && (
                <h3 id={titleId} className="text-base font-bold text-txt-primary">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-txt-muted mt-0.5">{subtitle}</p>
              )}
            </div>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="p-1.5 rounded-md text-txt-muted hover:text-txt-primary hover:bg-bg-surface-elevated transition-colors focus-visible:outline-none"
              aria-label="إغلاق النافذة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};
