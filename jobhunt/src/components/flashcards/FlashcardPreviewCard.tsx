import type { Card } from '../../types/card.types';
import ProgressDots from './ProgressDots';

interface FlashcardPreviewCardProps {
  card: Card;
  isDue: boolean;
  onClick?: () => void;
}

const formatShortDate = (isoDate: string): string =>
  new Date(isoDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export default function FlashcardPreviewCard({ card, isDue, onClick }: FlashcardPreviewCardProps) {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick?.();
      }}
      className={`bg-surface dark:bg-surface-dark rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
        isDue ? 'border-t-4 border-accent' : ''
      }`}
    >
      <p className="font-bold text-[#151C24] dark:text-white line-clamp-2">{card.question}</p>
      <p className="text-sm text-neutral mt-2 line-clamp-2">{card.answer}</p>

      {card.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {card.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-neutral/15 text-neutral"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral/15">
        <div className="flex items-center gap-2">
          <ProgressDots currentBox={card.box} />
          <span className="text-xs text-neutral">Box {card.box}</span>
        </div>

        {isDue ? (
          <span className="text-xs font-bold text-accent">Due today</span>
        ) : (
          <span className="text-xs text-neutral">{formatShortDate(card.nextReviewDate)}</span>
        )}
      </div>
    </div>
  );
}