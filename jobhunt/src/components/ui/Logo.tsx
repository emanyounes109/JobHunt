export interface LogoProps {
  /** Rendered size of the rounded tile. */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const TILE: Record<NonNullable<LogoProps['size']>, string> = {
  sm: 'h-9 w-9 rounded-xl',
  md: 'h-12 w-12 rounded-2xl',
  lg: 'h-16 w-16 rounded-2xl',
};

const GLYPH: Record<NonNullable<LogoProps['size']>, string> = {
  sm: 'h-4.5 w-4.5',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

/** Job Hunt Companion brand mark: primary tile + accent briefcase. */
export default function Logo({ size = 'md', className = '' }: LogoProps) {
  return (
    <div
      aria-hidden="true"
      className={`flex items-center justify-center bg-primary shadow-lg shadow-primary/25 ${TILE[size]} ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`text-accent ${GLYPH[size]}`}
      >
        <path d="M20.25 14.15v4.25a2.2 2.2 0 0 1-1.87 2.18 48.4 48.4 0 0 1-12.76 0 2.2 2.2 0 0 1-1.87-2.18v-4.25" />
        <path d="M21 13.5A24 24 0 0 1 12 15.75 24 24 0 0 1 3 13.5V8.7c0-1.08.77-2.01 1.84-2.17a48 48 0 0 1 14.32 0A2.2 2.2 0 0 1 21 8.7v4.8Z" />
        <path d="M15.75 6.14V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.89" />
        <path d="M12 12.75h.01" />
      </svg>
    </div>
  );
}