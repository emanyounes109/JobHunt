import type { Card } from '../../types/card.types';
import ProgressDots from './ProgressDots';

interface DueCardListItemProps {
  card: Card;
}

const tagStyles: Record<string, string> = {
  React: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  TypeScript: 'bg-primary/10 text-primary',
  default: 'bg-neutral/15 text-neutral',
};

export default function DueCardListItem({ card }: DueCardListItemProps) {
  // card.tags is an array — show the first tag as the pill (or nothing if empty)
  const primaryTag = card.tags[0];
  const tagStyle = primaryTag ? (tagStyles[primaryTag] ?? tagStyles.default) : tagStyles.default;

  return (
    <div className="bg-surface dark:bg-surface-dark rounded-2xl p-4 shadow-sm">
      <p className="font-bold text-[#151C24] dark:text-white truncate">{card.question}</p>

      <div className="flex items-center gap-3 mt-3">
        <ProgressDots currentBox={card.box} />
        <span className="text-xs text-neutral">Box {card.box}</span>
        {primaryTag && (
          <span className={`ml-auto text-xs px-2.5 py-0.5 rounded-full font-medium ${tagStyle}`}>
            {primaryTag}
          </span>
        )}
      </div>
    </div>
  );
}