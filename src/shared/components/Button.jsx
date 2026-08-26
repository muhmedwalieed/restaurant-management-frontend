import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const variants = {
  primary: 'bg-brand-primary text-txt-inverted hover:bg-brand-primary-hover active:opacity-90',
  secondary: 'bg-bg-surface-elevated text-txt-primary hover:bg-border-default active:bg-border-subtle',
  outline: 'border border-border-default bg-transparent text-txt-primary hover:bg-bg-surface active:bg-bg-surface-elevated',
  danger: 'bg-status-danger text-white hover:opacity-90 active:opacity-80',
  ghost: 'bg-transparent text-txt-primary hover:bg-bg-surface active:bg-bg-surface-elevated',
};

const sizes = {
  sm: 'text-xs px-3 py-1 min-h-[32px]',
  md: 'text-sm px-4 py-2 min-h-[40px]',
  lg: 'text-base px-5 py-2 min-h-[44px]',
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
          'inline-flex items-center justify-center gap-2 font-medium transition-colors cursor-pointer select-none focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
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
      <span>{children}</span>
    </button>
  );
};
