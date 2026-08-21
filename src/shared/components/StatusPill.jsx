import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const statusVariants = {
  success: 'bg-status-success-bg text-status-success border-status-success/20',
  warning: 'bg-status-warning-bg text-status-warning border-status-warning/20',
  danger: 'bg-status-danger-bg text-status-danger border-status-danger/20',
  info: 'bg-status-info-bg text-status-info border-status-info/20',
  neutral: 'bg-status-neutral-bg text-status-neutral border-status-neutral/20',
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
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-pill border select-none',
          variantClass,
          className
        )
      )}
    >
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      <span>{content}</span>
    </span>
  );
};
