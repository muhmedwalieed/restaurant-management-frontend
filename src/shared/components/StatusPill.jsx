import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const statusVariants = {
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  danger: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  info: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
  neutral: 'bg-white/[0.05] text-slate-300 border-white/10',
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
          'inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-pill border select-none',
          variantClass,
          className
        )
      )}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      <span>{content}</span>
    </span>
  );
};
