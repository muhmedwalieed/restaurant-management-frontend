import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const statusVariants = {
  success: 'bg-status-success-bg text-status-success border-status-success/30',
  warning: 'bg-status-warning-bg text-status-warning border-status-warning/30',
  danger: 'bg-status-danger-bg text-status-danger border-status-danger/30',
  info: 'bg-status-info-bg text-status-info border-status-info/30',
  neutral: 'bg-bg-surface-elevated text-txt-muted border-border-default',
  brand: 'bg-bg-surface-elevated text-txt-primary border-border-default',

  // Channel & Source specific pills (Clean, calm, monochrome)
  whatsapp: 'bg-bg-surface-elevated text-txt-primary border-border-default',
  qr: 'bg-bg-surface-elevated text-txt-primary border-border-default',
  tables: 'bg-bg-surface-elevated text-txt-primary border-border-default',
  website: 'bg-bg-surface-elevated text-txt-primary border-border-default',
  phone: 'bg-bg-surface-elevated text-txt-primary border-border-default',
  cashier: 'bg-bg-surface-elevated text-txt-primary border-border-default',
};

export const StatusPill = ({
  status = 'neutral',
  label,
  children,
  icon: Icon,
  className = '',
}) => {
  const variantClass = statusVariants[status] || statusVariants.neutral;
  const content = label || children;

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-pill border select-none leading-normal transition-colors',
          variantClass,
          className
        )
      )}
    >
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span>{content}</span>
    </span>
  );
};
