export interface DividerProps {
  /** Optional centred label, e.g. "or". Omit for a plain rule. */
  label?: string;
  className?: string;
}

/** Thin rule, optionally broken by a centred uppercase label. */
export default function Divider({ label, className = '' }: DividerProps) {
  if (!label) {
    return <hr className={`border-neutral/30 dark:border-white/10 ${className}`} />;
  }

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={`flex items-center gap-4 ${className}`}
    >
      <span className="h-px flex-1 bg-neutral/30 dark:bg-white/10" />
      <span className="text-xs font-medium uppercase tracking-widest text-neutral">{label}</span>
      <span className="h-px flex-1 bg-neutral/30 dark:bg-white/10" />
    </div>
  );
}