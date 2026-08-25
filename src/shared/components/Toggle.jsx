import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Toggle = ({
  checked = false,
  onChange,
  disabled = false,
  label,
  className = '',
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      dir="ltr"
      className={twMerge(
        clsx(
          'relative inline-flex items-center h-5 w-9 rounded-full p-0.5 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-surface',
          checked ? 'bg-status-success' : 'bg-border-default',
          disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
        ),
        className
      )}
    >
      <span
        className={twMerge(
          clsx(
            'inline-block w-4 h-4 transform rounded-full bg-white transition-transform',
            checked ? 'translate-x-4' : 'translate-x-0'
          )
        )}
      />
    </button>
  );
};
