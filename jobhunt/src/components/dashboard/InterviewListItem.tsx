import type { Job, TagCategory } from '../../types/job.types';

interface InterviewListItemProps {
  job: Job;
  onClick?: () => void;
}

const tagCategoryFor = (index: number): TagCategory => {
  const cycle: TagCategory[] = ['neutral', 'primary', 'accent'];
  return cycle[index % cycle.length];
};

const tagStyles: Record<TagCategory, string> = {
  neutral: 'bg-neutral/15 text-neutral',
  primary: 'bg-primary/10 text-primary',
  accent: 'bg-accent/15 text-accent',
};

const formatShortDate = (isoDate: string): string =>
  new Date(isoDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const daysUntil = (isoDate: string): number => {
  const diffMs = new Date(isoDate).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
};

export default function InterviewListItem({ job, onClick }: InterviewListItemProps) {
  const initial = job.company.charAt(0).toUpperCase();
  const days = job.interviewDate ? daysUntil(job.interviewDate) : 0;

  const relativeLabel =
    days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : days > 1 ? `In ${days} days` : `${Math.abs(days)}d ago`;

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick?.();
      }}
      className="flex items-center gap-4 bg-surface dark:bg-surface-dark rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="w-11 h-11 shrink-0 rounded-full bg-primary flex items-center justify-center">
        <span className="text-white font-bold text-sm">{initial}</span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-bold text-[#151C24] dark:text-white truncate">{job.company}</p>
        <p className="text-sm text-neutral truncate">{job.role}</p>

        <div className="flex flex-wrap gap-1.5 mt-2">
          {job.tags.map((tag, i) => (
            <span key={tag} className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${tagStyles[tagCategoryFor(i)]}`}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {job.interviewDate && (
        <div className="text-right shrink-0">
          <p className="text-sm font-semibold text-[#151C24] dark:text-white">{formatShortDate(job.interviewDate)}</p>
          <p className="text-xs font-bold text-accent mt-1">{relativeLabel}</p>
        </div>
      )}
    </div>
  );
}