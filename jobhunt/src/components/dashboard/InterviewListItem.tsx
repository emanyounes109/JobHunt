import type { TagCategory } from '../../types/job.types';

interface InterviewData {
  company: string;
  role: string;
  interviewDate: string;
  daysUntil: number;
  tags: string[];
}

interface InterviewListItemProps {
  interview: InterviewData;
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

export default function InterviewListItem({ interview }: InterviewListItemProps) {
  const { company, role, interviewDate, daysUntil, tags } = interview;
  const initial = company.charAt(0).toUpperCase();

  const relativeLabel =
    daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`;

  return (
    <div className="flex items-center gap-4 bg-surface dark:bg-surface-dark rounded-2xl p-4 shadow-sm">
      <div className="w-11 h-11 shrink-0 rounded-full bg-primary flex items-center justify-center">
        <span className="text-white font-bold text-sm">{initial}</span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-bold text-[#151C24] dark:text-white truncate">{company}</p>
        <p className="text-sm text-neutral truncate">{role}</p>

        <div className="flex flex-wrap gap-1.5 mt-2">
          {tags.map((tag, i) => (
            <span
              key={tag}
              className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${tagStyles[tagCategoryFor(i)]}`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="text-right shrink-0">
        <p className="text-sm font-semibold text-[#151C24] dark:text-white">{interviewDate}</p>
        <p className="text-xs font-bold text-accent mt-1">{relativeLabel}</p>
      </div>
    </div>
  );
}