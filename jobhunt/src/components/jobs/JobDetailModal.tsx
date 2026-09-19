import { useNavigate } from 'react-router-dom';
import { Calendar, Play } from 'lucide-react';
import Modal from '../ui/Modal';
import { useCardsStore } from '../../store/useCardsStore';
import type { Job, JobStatus } from '../../types/job.types';

interface JobDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
}

const statusLabels: Record<JobStatus, string> = {
  applied: 'Applied',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
};

const statusBadgeStyles: Record<JobStatus, string> = {
  applied: 'bg-primary/10 text-primary',
  interview: 'bg-accent/15 text-accent',
  offer: 'bg-success/15 text-success',
  rejected: 'bg-danger/15 text-danger',
};

function formatFullDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
  });
}

function relativeDaysLabel(isoDate: string): string {
  const diffMs = new Date(isoDate).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays > 0) return `in ${diffDays} day${diffDays === 1 ? '' : 's'}`;
  return `${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'} ago`;
}

export default function JobDetailModal({ isOpen, onClose, job }: JobDetailModalProps) {
  const navigate = useNavigate();
  const cards = useCardsStore((s) => s.cards);

  if (!job) return null;

  // Related flashcards: any card sharing at least one tag with this job —
  // e.g. a "React" + "System Design" job pulls in every card tagged React
  // or System Design, so the user can review exactly what's relevant.
  const relatedCards = cards.filter((card) => card.tags.some((tag) => job.tags.includes(tag)));
  const today = new Date().toISOString().slice(0, 10);
  const dueRelatedCount = relatedCards.filter((card) => card.nextReviewDate <= today).length;

  const initial = job.company.charAt(0).toUpperCase();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="-mt-2">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-lg">{initial}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-[#151C24] dark:text-white">{job.company}</h3>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusBadgeStyles[job.status]}`}>
                {statusLabels[job.status]}
              </span>
            </div>
            <p className="text-sm text-neutral">{job.role}</p>
          </div>
        </div>

        {/* Dates */}
        <div className="mt-4 space-y-1.5">
          <p className="flex items-center gap-2 text-sm text-neutral">
            <Calendar size={14} />
            Applied {formatFullDate(job.appliedDate)} · {relativeDaysLabel(job.appliedDate)}
          </p>
          {job.interviewDate && (
            <p className="flex items-center gap-2 text-sm font-medium text-accent">
              <Calendar size={14} />
              Interview {formatFullDate(job.interviewDate)} · {relativeDaysLabel(job.interviewDate)}
            </p>
          )}
        </div>

        {/* Tags */}
        {job.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {job.tags.map((tag) => (
              <span key={tag} className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-neutral/15 text-neutral">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Notes */}
        {job.notes && (
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral mb-1.5">Notes</p>
            <p className="text-sm text-[#151C24] dark:text-white">{job.notes}</p>
          </div>
        )}

        {/* Related flashcards */}
        <div className="mt-6 pt-5 border-t border-neutral/15">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral">Related Flashcards</p>
          {relatedCards.length > 0 && (
            <p className="text-xs text-neutral mt-0.5 mb-3">
              {dueRelatedCount} due today — review before your interview
            </p>
          )}

          {relatedCards.length === 0 ? (
            <p className="text-sm text-neutral mt-2">No flashcards match this job's tags yet.</p>
          ) : (
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1 mt-3">
              {relatedCards.map((card) => (
                <div
                  key={card.id}
                  className="flex items-center justify-between gap-3 bg-neutral/10 rounded-xl px-3 py-2.5"
                >
                  <p className="text-sm text-[#151C24] dark:text-white truncate">{card.question}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-surface dark:bg-surface-dark text-neutral shrink-0">
                    Box {card.box}
                  </span>
                </div>
              ))}
            </div>
          )}

          {relatedCards.length > 0 && (
            <button
              type="button"
              onClick={() => navigate('/study')}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary-hover transition-colors"
            >
              <Play size={16} />
              Start study session
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}