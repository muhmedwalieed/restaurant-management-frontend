import { forwardRef, useId } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChevronDown } from 'lucide-react';

export const Select = forwardRef(
  (
    {
      label,
      error,
      helperText,
      id,
      name,
      options = [],
      placeholder = 'اختر من القائمة...',
      className = '',
      required = false,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const selectId = id || name || generatedId;

    return (
      <div className="flex flex-col gap-1.5 w-full text-right">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-medium text-txt-primary flex items-center gap-1"
          >
            <span>{label}</span>
            {required && <span className="text-status-danger">*</span>}
          </label>
        )}
        <div className="relative flex items-center w-full">
          <select
            ref={ref}
            id={selectId}
            name={name}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
            className={twMerge(
              clsx(
                'w-full bg-bg-surface text-txt-primary border rounded-md text-sm px-3 py-2 pl-9 min-h-[40px] appearance-none transition-colors cursor-pointer focus-visible:outline-none focus-visible:border-brand-primary',
                error
                  ? 'border-status-danger focus-visible:border-status-danger'
                  : 'border-border-default hover:border-text-muted',
                className
              )
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-bg-surface text-txt-primary py-1">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute left-3 text-txt-muted pointer-events-none">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error && (
          <p id={`${selectId}-error`} className="text-xs text-status-danger font-medium mt-0.5">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${selectId}-helper`} className="text-xs text-txt-muted mt-0.5">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
