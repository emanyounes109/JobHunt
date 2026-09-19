import { Calendar } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Job } from '../../types/job.types';

interface JobCardProps {
  job: Job;
  onClick?: () => void;
  /** True only for the static copy rendered inside <DragOverlay>. */
  isOverlay?: boolean;
}

const AVATAR_PALETTE = ['bg-primary', 'bg-accent', 'bg-success', 'bg-danger', 'bg-[#7C6FAE]'];

const hashToIndex = (text: string, mod: number): number => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) % mod;
  }
  return Math.abs(hash);
};

const relativeTimeFrom = (isoDate: string): string => {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return '1d ago';
  return `${diffDays}d ago`;
};

const formatShortDate = (isoDate: string): string =>
  new Date(isoDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const tagStyles = ['bg-primary/10 text-primary', 'bg-neutral/15 text-neutral'];

function CardBody({ job }: { job: Job }) {
  const avatarColor = AVATAR_PALETTE[hashToIndex(job.company, AVATAR_PALETTE.length)];
  const initial = job.company.charAt(0).toUpperCase();

  return (
    <>
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center ${avatarColor}`}>
          <span className="text-white font-bold text-sm">{initial}</span>
        </div>
        <div className="min-w-0">
          <p className="font-bold text-[#151C24] dark:text-white truncate">{job.company}</p>
          <p className="text-sm text-neutral truncate">{job.role}</p>
        </div>
      </div>

      {job.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {job.tags.map((tag, i) => (
            <span
              key={tag}
              className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${tagStyles[i === 0 ? 0 : 1]}`}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="border-t border-neutral/15 my-3" />

      <div className="flex items-center justify-between">
        <span className="text-xs text-neutral">{relativeTimeFrom(job.appliedDate)}</span>
        {job.interviewDate && (
          <span className="flex items-center gap-1 text-xs font-semibold text-accent">
            <Calendar size={12} />
            {formatShortDate(job.interviewDate)}
          </span>
        )}
      </div>
    </>
  );
}

export default function JobCard({ job, onClick, isOverlay = false }: JobCardProps) {
  // The DragOverlay renders a completely separate, presentational copy of
  // this card — it must NOT call useSortable (that would register a second
  // sortable node under the same job.id and confuse dnd-kit's registry).
  if (isOverlay) {
    return (
      <div className="bg-surface dark:bg-surface-dark rounded-2xl p-4 shadow-xl rotate-2 scale-105 cursor-grabbing">
        <CardBody job={job} />
      </div>
    );
  }

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: job.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
        <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick?.();
      }}
      className={`bg-surface dark:bg-surface-dark rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer touch-none ${
        isDragging ? 'scale-[1.02] rotate-1' : ''
      }`}
      {...attributes}
      {...listeners}
    >
      <CardBody job={job} />
    </div>
  );
}