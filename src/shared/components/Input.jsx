import { forwardRef, useId } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      id,
      name,
      type = 'text',
      className = '',
      icon: Icon,
      prefix,
      suffix,
      required = false,
      readOnly = false,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || name || generatedId;

    return (
      <div className="flex flex-col gap-1.5 w-full text-right">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-txt-primary flex items-center gap-1"
          >
            <span>{label}</span>
            {required && <span className="text-status-danger">*</span>}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {Icon && (
            <div className="absolute right-3 text-txt-muted pointer-events-none">
              <Icon className="w-4 h-4" />
            </div>
          )}
          {prefix && (
            <span className="absolute right-3 text-xs font-medium text-txt-muted pointer-events-none">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            name={name}
            type={type}
            readOnly={readOnly}
            aria-invalid={Boolean(error)}
            aria-readonly={readOnly}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            className={twMerge(
              clsx(
                'w-full bg-bg-surface text-txt-primary placeholder:text-txt-muted border rounded-md text-sm px-3 py-2 min-h-[40px] transition-colors focus-visible:outline-none',
                readOnly
                  ? 'bg-bg-base/60 text-txt-muted border-dashed border-border-default cursor-not-allowed'
                  : 'focus-visible:border-brand-primary',
                Icon ? 'pr-9' : prefix ? 'pr-9' : 'pr-3',
                suffix ? 'pl-14 font-mono' : 'pl-3',
                error
                  ? 'border-status-danger focus-visible:border-status-danger'
                  : 'border-border-default hover:border-text-muted',
                className
              )
            )}
            {...props}
          />
          {suffix && (
            <span className="absolute left-3 text-xs font-mono font-medium text-txt-muted pointer-events-none select-none">
              {suffix}
            </span>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-status-danger font-medium mt-1">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${inputId}-helper`} className="text-xs text-txt-muted mt-1">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
