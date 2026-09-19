import React, { useId } from 'react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id'> {
  /** Visible label text — always required for accessibility. */
  label: string;
  /** Inline validation message, rendered in the danger colour. */
  error?: string;
  /** Helper copy shown under the field when there is no error. */
  hint?: string;
  /** Element rendered inside the field on the right (e.g. a show/hide toggle). */
  trailing?: React.ReactNode;
}

/**
 * Labelled text input with inline error state.
 * Wires up aria-invalid / aria-describedby so screen readers announce problems.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, trailing, className = '', ...rest },
  ref,
) {
  const reactId = useId();
  const inputId = `${reactId}-input`;
  const messageId = `${reactId}-message`;
  const hasError = Boolean(error);

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-background-dark dark:text-background-light"
      >
        {label}
      </label>

      <div className="relative">
        <input
          {...rest}
          id={inputId}
          ref={ref}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError || hint ? messageId : undefined}
          className={[
            'w-full rounded-xl border bg-white px-4 py-3 text-sm text-background-dark',
            'placeholder:text-neutral transition-colors',
            'focus:outline-none focus:ring-2',
            trailing ? 'pr-12' : '',
            hasError
              ? 'border-danger focus:border-danger focus:ring-danger/30'
              : 'border-neutral/40 focus:border-primary focus:ring-primary/25 dark:border-white/10',
            'dark:bg-background-dark dark:text-background-light dark:placeholder:text-neutral',
            'disabled:cursor-not-allowed disabled:opacity-60',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
        />

        {trailing && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">{trailing}</div>
        )}
      </div>

      {(hasError || hint) && (
        <p
          id={messageId}
          role={hasError ? 'alert' : undefined}
          className={
            hasError ? 'text-xs font-medium text-danger' : 'text-xs text-neutral'
          }
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
});

export default Input;