import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Job, JobStatus } from '../../types/job.types';
import JobCard from './JobCard';

interface KanbanColumnProps {
  status: JobStatus;
  label: string;
  jobs: Job[];
  onJobClick: (job: Job) => void;
}

const statusDotColor: Record<JobStatus, string> = {
  applied: 'bg-primary',
  interview: 'bg-accent',
  offer: 'bg-success',
  rejected: 'bg-danger',
};

export default function KanbanColumn({ status, label, jobs, onJobClick }: KanbanColumnProps) {
  // The droppable id IS the status string. JobBoardPage's onDragEnd reads
  // `over.id` directly off this and passes it straight into updateStatus() —
  // no separate lookup table needed to map drop target -> JobStatus.
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex flex-col min-w-[280px] w-[300px] shrink-0">
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className={`w-2.5 h-2.5 rounded-full ${statusDotColor[status]}`} />
        <span className="font-bold text-[#151C24] dark:text-white">{label}</span>
        <span className="ml-auto text-xs font-semibold bg-neutral/15 text-neutral rounded-full px-2 py-0.5">
          {jobs.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex flex-col gap-3 max-h-[calc(100vh-260px)] overflow-y-auto pr-1 rounded-2xl transition-colors p-1 ${
          isOver ? 'bg-accent/10 ring-2 ring-accent' : ''
        }`}
      >
        <SortableContext items={jobs.map((j) => j.id)} strategy={verticalListSortingStrategy}>
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} onClick={() => onJobClick(job)} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}