import { Link, useNavigate } from 'react-router-dom';
import { Sunrise, Play, PartyPopper } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import InterviewListItem from '../components/dashboard/InterviewListItem';
import DueCardListItem from '../components/flashcards/DueCardListItem';
import { useJobsStore } from '../store/useJobsStore';
import { useLeitner } from '../hooks/useLeitner';

const today = new Date();
const formattedDate = today.toLocaleDateString('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});

const daysUntil = (isoDate: string): number => {
  const diffMs = new Date(isoDate).getTime() - Date.now();
  return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
};

const formatShortDate = (isoDate: string): string =>
  new Date(isoDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export default function DashboardPage() {
  const navigate = useNavigate();
  const jobs = useJobsStore((s) => s.jobs);
  const { dueCards, totalCards, masteredCount, needsWorkCount } = useLeitner();

  const activeJobs = jobs.filter((job) => job.status === 'applied' || job.status === 'interview');
  const appliedCount = jobs.filter((job) => job.status === 'applied').length;
  const interviewingCount = jobs.filter((job) => job.status === 'interview').length;

  const interviewJobs = jobs
    .filter((job) => job.status === 'interview' && job.interviewDate)
    .sort((a, b) => new Date(a.interviewDate!).getTime() - new Date(b.interviewDate!).getTime());

  const nextInterview = interviewJobs[0];

  return (
    <div className="px-4 md:px-8 py-6 max-w-5xl mx-auto">
      {/* Greeting */}
      <header className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
          <Sunrise size={20} className="text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#151C24] dark:text-white">Good morning</h1>
          <p className="text-sm text-neutral">{formattedDate}</p>
        </div>
      </header>

      {/* Stat cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Active Applications"
          value={activeJobs.length}
          subtext={`${appliedCount} applied · ${interviewingCount} interviewing`}
          color="primary"
        />
        <StatCard
          label="Upcoming Interviews"
          value={interviewJobs.length}
          subtext={nextInterview ? `Next: ${formatShortDate(nextInterview.interviewDate!)}` : 'None scheduled'}
          color="accent"
        />
        <StatCard
          label="Cards Due Today"
          value={dueCards.length}
          subtext={dueCards.length > 0 ? "Time to review — you're building momentum" : 'All caught up for today'}
          color="danger"
        />
      </section>

      {/* Upcoming interviews */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#151C24] dark:text-white">Upcoming Interviews</h2>
          <Link to="/jobs" className="text-sm font-medium text-primary hover:underline">
            View board &gt;
          </Link>
        </div>

        {interviewJobs.length === 0 ? (
          <p className="text-sm text-neutral">No interviews scheduled yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {interviewJobs.map((job) => (
              <InterviewListItem
                key={job.id}
                interview={{
                  company: job.company,
                  role: job.role,
                  interviewDate: formatShortDate(job.interviewDate!),
                  daysUntil: daysUntil(job.interviewDate!),
                  tags: job.tags,
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* Due Today — flashcards */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#151C24] dark:text-white">Due Today</h2>
          <Link to="/flashcards" className="text-sm font-medium text-primary hover:underline">
            All cards &gt;
          </Link>
        </div>

        {dueCards.length === 0 ? (
          <div className="bg-surface dark:bg-surface-dark rounded-2xl p-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-success/15 flex items-center justify-center shrink-0">
              <PartyPopper size={20} className="text-success" />
            </div>
            <div>
              <p className="font-bold text-[#151C24] dark:text-white">All caught up!</p>
              <p className="text-sm text-neutral">No cards due for review right now.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-r from-primary to-primary-active rounded-2xl p-6 mb-4 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-white text-xl font-bold">{dueCards.length} cards ready</p>
                <p className="text-white/70 text-sm mt-1">Keep your knowledge fresh</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/study')}
                className="flex items-center gap-2 bg-white text-primary font-semibold px-5 py-2.5 rounded-xl hover:bg-white/90 transition-colors"
              >
                <Play size={16} />
                Start session
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {dueCards.slice(0, 4).map((card) => (
                <DueCardListItem key={card.id} card={card} />
              ))}
            </div>

            {dueCards.length > 4 && (
              <button
                type="button"
                onClick={() => navigate('/study')}
                className="text-sm font-medium text-primary hover:underline mt-4 block"
              >
                +{dueCards.length - 4} more cards due
              </button>
            )}
          </>
        )}

        <div className="bg-background-light dark:bg-surface-dark rounded-2xl mt-6 p-6 grid grid-cols-3 divide-x divide-neutral/20">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#151C24] dark:text-white">{totalCards}</p>
            <p className="text-xs text-neutral mt-1">Total Cards</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-success">{masteredCount}</p>
            <p className="text-xs text-neutral mt-1">Mastered</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-danger">{needsWorkCount}</p>
            <p className="text-xs text-neutral mt-1">Needs Work</p>
          </div>
        </div>
      </section>
    </div>
  );
}