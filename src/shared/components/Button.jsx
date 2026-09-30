import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const variants = {
  primary:
    'bg-brand-primary text-txt-inverted hover:bg-brand-primary-hover active:scale-[0.98] border border-transparent shadow-xs',
  secondary:
    'bg-bg-surface-elevated text-txt-primary hover:bg-border-default active:scale-[0.98] border border-border-default',
  outline:
    'border border-border-default bg-bg-surface text-txt-primary hover:bg-bg-surface-elevated active:scale-[0.98]',
  danger:
    'bg-status-danger text-white hover:bg-status-danger/90 active:scale-[0.98] border border-transparent shadow-xs',
  success:
    'bg-status-success text-white hover:bg-status-success/90 active:scale-[0.98] border border-transparent shadow-xs',
  ghost:
    'bg-transparent text-txt-muted hover:text-txt-primary hover:bg-bg-surface-elevated active:scale-[0.98] border border-transparent',
};

const sizes = {
  sm: 'text-xs px-2.5 py-1 min-h-[32px]',
  md: 'text-xs sm:text-sm px-3.5 py-1.5 min-h-[38px]',
  lg: 'text-sm sm:text-base px-4 py-2 min-h-[44px]',
};

const radiuses = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  pill: 'rounded-pill',
};

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  radius = 'md',
  isLoading = false,
  isDisabled = false,
  className = '',
  icon: Icon,
  type = 'button',
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={isDisabled || isLoading}
      className={twMerge(
        clsx(
          'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none disabled:active:scale-100',
          variants[variant],
          sizes[size],
          radiuses[radius],
          className
        )
      )}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      {children ? <span>{children}</span> : null}
    </button>
  );
};
