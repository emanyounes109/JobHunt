type DotsVariant = 'dots' | 'bar';

interface ProgressDotsProps {
  currentBox: number; // 1-5
  variant?: DotsVariant;
}

const TOTAL_BOXES = 5;

export default function ProgressDots({ currentBox, variant = 'dots' }: ProgressDotsProps) {
  const segments = Array.from({ length: TOTAL_BOXES }, (_, i) => i + 1);

  if (variant === 'bar') {
    return (
      <div className="flex gap-1.5 w-full">
        {segments.map((segment) => (
          <div
            key={segment}
            className={`h-2 flex-1 rounded-full transition-colors ${
              segment <= currentBox ? 'bg-accent' : 'bg-neutral/20'
            }`}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-1 items-center">
      {segments.map((segment) => (
        <span
          key={segment}
          className={`w-2 h-2 rounded-full transition-colors ${
            segment <= currentBox
              ? 'bg-accent'
              : 'bg-transparent border border-neutral/40'
          }`}
        />
      ))}
    </div>
  );
}