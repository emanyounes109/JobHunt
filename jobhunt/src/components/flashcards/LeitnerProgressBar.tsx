import type { LeitnerBox } from '../../types/card.types';

interface LeitnerProgressBarProps {
  boxDistribution: Record<LeitnerBox, number>;
  totalCards: number;
}

const BOX_COLORS: Record<LeitnerBox, string> = {
  1: 'bg-danger',
  2: 'bg-accent',
  3: 'bg-neutral',
  4: 'bg-success',
  5: 'bg-primary',
};

const BOXES: LeitnerBox[] = [1, 2, 3, 4, 5];

export default function LeitnerProgressBar({ boxDistribution, totalCards }: LeitnerProgressBarProps) {
  return (
    <div>
      <div className="flex w-full h-2.5 rounded-full overflow-hidden bg-neutral/10">
        {BOXES.map((box) => {
          const count = boxDistribution[box] ?? 0;
          // Guard against divide-by-zero when there are no cards yet, and
          // give empty boxes a hairline width so the segment boundary is
          // still visible without breaking the flex layout.
          const widthPercent = totalCards > 0 ? (count / totalCards) * 100 : 20;
          return (
            <div
              key={box}
              style={{ width: `${Math.max(widthPercent, count > 0 ? 1 : 0)}%` }}
              className={`h-full ${BOX_COLORS[box]} transition-all`}
              title={`Box ${box}: ${count} card${count === 1 ? '' : 's'}`}
            />
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-1.5">
        <span className="text-xs text-neutral">Box 1 · Needs work</span>
        <span className="text-xs text-neutral">Box 5 · Mastered</span>
      </div>
    </div>
  );
}