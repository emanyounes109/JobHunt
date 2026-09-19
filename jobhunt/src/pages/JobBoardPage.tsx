import { useState } from 'react';
import { Plus } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { useJobsStore } from '../store/useJobsStore';
import KanbanColumn from '../components/jobs/KanbanColumn';
import JobCard from '../components/jobs/JobCard';
import JobModal from '../components/jobs/JobModal';
import type { Job, JobStatus } from '../types/job.types';

const COLUMNS: { status: JobStatus; label: string }[] = [
  { status: 'applied', label: 'Applied' },
  { status: 'interview', label: 'Interview' },
  { status: 'offer', label: 'Offer' },
  { status: 'rejected', label: 'Rejected' },
];

const VALID_STATUSES: readonly JobStatus[] = ['applied', 'interview', 'offer', 'rejected'];

function isJobStatus(value: string): value is JobStatus {
  return (VALID_STATUSES as readonly string[]).includes(value);
}

export default function JobBoardPage() {
  const jobs = useJobsStore((s) => s.jobs);
  const getJobsByStatus = useJobsStore((s) => s.getJobsByStatus);
  const updateStatus = useJobsStore((s) => s.updateStatus);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | undefined>(undefined);
  const [activeJob, setActiveJob] = useState<Job | null>(null);

  // Small activation distance so a plain click still fires JobCard's onClick
  // (opens the edit modal) instead of being swallowed as a drag gesture.
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const job = jobs.find((j) => j.id === event.active.id);
    setActiveJob(job ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveJob(null);

    if (!over) return;

    // over.id is the droppable column's id, which KanbanColumn sets to its
    // own `status` value via useDroppable({ id: status }) — so we can read
    // the target status straight off it without any extra mapping.
    const targetStatus = String(over.id);
    if (!isJobStatus(targetStatus)) return;

    const jobId = String(active.id);
    const draggedJob = jobs.find((j) => j.id === jobId);
    if (draggedJob && draggedJob.status !== targetStatus) {
      updateStatus(jobId, targetStatus);
    }
  };

  const handleJobClick = (job: Job) => {
    // TODO: open full JobDetail view in Sprint 1 Issue 6 — using edit modal for now
    setEditingJob(job);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setEditingJob(undefined);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingJob(undefined);
  };

  return (
    <div className="px-4 md:px-8 py-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#151C24] dark:text-white">Job Board</h1>
          <p className="text-sm text-neutral mt-1">
            {jobs.length} applications — drag cards to update status
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddClick}
          className="flex items-center gap-2 bg-primary text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-primary-hover active:bg-primary-active transition-colors"
        >
          <Plus size={18} />
          Add Job
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-2">
          {COLUMNS.map(({ status, label }) => (
            <KanbanColumn
              key={status}
              status={status}
              label={label}
              jobs={getJobsByStatus(status)}
              onJobClick={handleJobClick}
            />
          ))}
        </div>

        <DragOverlay>
          {activeJob ? <JobCard job={activeJob} isOverlay /> : null}
        </DragOverlay>
      </DndContext>

      <JobModal isOpen={isModalOpen} onClose={handleClose} initialData={editingJob} />
    </div>
  );
}