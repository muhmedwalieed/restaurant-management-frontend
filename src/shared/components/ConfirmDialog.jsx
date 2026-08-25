import { Modal } from './Modal.jsx';
import { Button } from './Button.jsx';
import { AlertTriangle } from 'lucide-react';

/**
 * Reusable confirmation dialog — replaces window.confirm/alert across the app.
 * Only use this for destructive/important actions that need explicit user consent.
 */
export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmLabel = 'تأكيد',
  cancelLabel = 'إلغاء',
  variant = 'primary',
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title || 'تأكيد العملية'} size="sm">
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          <span className="p-2.5 rounded-full bg-bg-surface-elevated shrink-0">
            <AlertTriangle className="w-5 h-5 text-brand-primary" />
          </span>
          <p className="text-sm text-txt-muted leading-relaxed pt-1">{message}</p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            size="sm"
            isLoading={isLoading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;