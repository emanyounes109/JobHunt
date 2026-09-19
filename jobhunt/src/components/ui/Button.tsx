import React from 'react';

/** Visual variants available across the app. */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Stretches the button to the full width of its container. */
  fullWidth?: boolean;
  /** Shows a spinner and disables interaction. */
  isLoading?: boolean;
  /** Icon rendered before the label. */
  leftIcon?: React.ReactNode;
}

/** Shared focus ring so every interactive element looks consistent. */
const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ' +
  'focus-visible:ring-offset-2 focus-visible:ring-offset-background-light ' +
  'dark:focus-visible:ring-offset-background-dark';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white shadow-sm hover:bg-primary-hover active:bg-primary-active ' +
    'dark:hover:bg-primary-hover',
  secondary:
    'border border-neutral/40 bg-transparent text-background-dark hover:bg-neutral/10 ' +
    'dark:border-white/15 dark:text-background-light dark:hover:bg-white/5',
  ghost:
    'bg-transparent text-primary hover:bg-primary/10 dark:text-accent dark:hover:bg-accent/10',
  danger: 'bg-danger text-white hover:brightness-95 active:brightness-90',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-xs',
  md: 'px-4 py-3 text-sm',
  lg: 'px-5 py-3.5 text-base',
};

/** Small inline spinner (no icon library needed). */
function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
      <path
        d="M22 12a10 10 0 0 0-10-10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="opacity-90"
      />
    </svg>
  );
}

/**
 * App-wide button.
 * Uses design tokens only — never hardcode hex values at the call site.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    isLoading = false,
    leftIcon,
    className = '',
    disabled,
    children,
    type = 'button',
    ...rest
  },
  ref,
) {
  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold',
        'transition-colors duration-150',
        'disabled:cursor-not-allowed disabled:opacity-60',
        VARIANTS[variant],
        SIZES[size],
        fullWidth ? 'w-full' : '',
        FOCUS_RING,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {isLoading ? <Spinner /> : leftIcon}
      {children}
    </button>
  );
});

export default Button;