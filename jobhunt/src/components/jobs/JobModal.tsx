import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import Modal from '../ui/Modal';
import { useJobsStore } from '../../store/useJobsStore';
import type { Job, JobStatus } from '../../types/job.types';

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Job;
}

interface FormState {
  company: string;
  role: string;
  status: JobStatus;
  appliedDate: string;
  interviewDate: string;
  tags: string[];
  notes: string;
}

interface FormErrors {
  company?: string;
  role?: string;
}

const SUGGESTED_TAGS = ['React', 'TypeScript', 'System Design', 'Next.js', 'CSS', 'JavaScript', 'Behavioral'];

const STATUS_OPTIONS: { value: JobStatus; label: string }[] = [
  { value: 'applied', label: 'Applied' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer', label: 'Offer' },
  { value: 'rejected', label: 'Rejected' },
];

const todayIso = (): string => new Date().toISOString().slice(0, 10);

const EMPTY_FORM: FormState = {
  company: '',
  role: '',
  status: 'applied',
  appliedDate: todayIso(),
  interviewDate: '',
  tags: [],
  notes: '',
};

export default function JobModal({ isOpen, onClose, initialData }: JobModalProps) {
  const addJob = useJobsStore((s) => s.addJob);
  const updateJob = useJobsStore((s) => s.updateJob);

  const isEditing = Boolean(initialData);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [customTag, setCustomTag] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        company: initialData.company,
        role: initialData.role,
        status: initialData.status,
        appliedDate: initialData.appliedDate.slice(0, 10),
        interviewDate: initialData.interviewDate?.slice(0, 10) ?? '',
        tags: initialData.tags,
        notes: initialData.notes ?? '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setCustomTag('');
    setErrors({});
    setSubmitted(false);
  }, [initialData, isOpen]);

  function validate(values: FormState): FormErrors {
    const nextErrors: FormErrors = {};
    if (!values.company.trim()) nextErrors.company = 'Company is required';
    if (!values.role.trim()) nextErrors.role = 'Role is required';
    return nextErrors;
  }

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    const next = { ...form, [field]: value };
    setForm(next);
    if (submitted) setErrors(validate(next));
  }

  function toggleTag(tag: string) {
    const next = form.tags.includes(tag)
      ? form.tags.filter((t) => t !== tag)
      : [...form.tags, tag];
    updateField('tags', next);
  }

  function addCustomTag() {
    const trimmed = customTag.trim();
    if (!trimmed || form.tags.includes(trimmed)) {
      setCustomTag('');
      return;
    }
    updateField('tags', [...form.tags, trimmed]);
    setCustomTag('');
  }

  function handleCustomTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomTag();
    }
  }

  function removeTag(tag: string) {
    updateField('tags', form.tags.filter((t) => t !== tag));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);

    const fieldErrors = validate(form);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    const payload = {
      company: form.company.trim(),
      role: form.role.trim(),
      status: form.status,
      appliedDate: form.appliedDate,
      // Only persisted when the user actually set a date — an empty string
      // becomes undefined so Dashboard's "Upcoming Interviews" filter,
      // which requires job.interviewDate to be truthy, works correctly.
      interviewDate: form.interviewDate || undefined,
      tags: form.tags,
      notes: form.notes.trim() || undefined,
    };

    if (isEditing && initialData) {
      updateJob(initialData.id, payload);
    } else {
      addJob(payload);
    }

    onClose();
  }

  const isFormValid = form.company.trim().length > 0 && form.role.trim().length > 0;

  const inputCls =
    'w-full rounded-xl border px-3 py-2.5 text-sm bg-neutral/10 border-transparent outline-none transition placeholder:text-neutral/70 focus:border-primary focus:bg-surface focus:ring-4 focus:ring-primary/10 dark:text-white';

  const errorInputCls =
    'w-full rounded-xl border px-3 py-2.5 text-sm bg-danger/5 border-danger outline-none transition placeholder:text-neutral/70 focus:ring-4 focus:ring-danger/15 dark:text-white';

  const labelCls = 'block text-sm font-medium text-[#151C24] dark:text-white mb-1.5';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Job' : 'Add New Job'}>
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="company" className={labelCls}>
              Company <span className="text-danger">*</span>
            </label>
            <input
              id="company"
              type="text"
              placeholder="Stripe"
              value={form.company}
              onChange={(e) => updateField('company', e.target.value)}
              className={errors.company ? errorInputCls : inputCls}
            />
            {errors.company && <p className="mt-1 text-xs font-medium text-danger">{errors.company}</p>}
          </div>

          <div>
            <label htmlFor="role" className={labelCls}>
              Role <span className="text-danger">*</span>
            </label>
            <input
              id="role"
              type="text"
              placeholder="Frontend Engineer"
              value={form.role}
              onChange={(e) => updateField('role', e.target.value)}
              className={errors.role ? errorInputCls : inputCls}
            />
            {errors.role && <p className="mt-1 text-xs font-medium text-danger">{errors.role}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="status" className={labelCls}>
              Status
            </label>
            <select
              id="status"
              value={form.status}
              onChange={(e) => updateField('status', e.target.value as JobStatus)}
              className={inputCls}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="appliedDate" className={labelCls}>
              Applied Date
            </label>
            <div className="relative">
              <input
                id="appliedDate"
                type="date"
                value={form.appliedDate}
                onChange={(e) => updateField('appliedDate', e.target.value)}
                className={`${inputCls} pr-9`}
              />
              <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Interview Date — only relevant once the job has reached the
            Interview stage. This is what feeds Dashboard's "Upcoming
            Interviews" section; without it, interview-status jobs never
            appear there. */}
        {form.status === 'interview' && (
          <div>
            <label htmlFor="interviewDate" className={labelCls}>
              Interview Date
            </label>
            <div className="relative">
              <input
                id="interviewDate"
                type="date"
                value={form.interviewDate}
                onChange={(e) => updateField('interviewDate', e.target.value)}
                className={`${inputCls} pr-9`}
              />
              <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral pointer-events-none" />
            </div>
          </div>
        )}

        <div>
          <label className={labelCls}>Tags</label>

          <div className="flex flex-wrap gap-2">
            {SUGGESTED_TAGS.map((tag) => {
              const isSelected = form.tags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                    isSelected
                      ? 'bg-primary text-white'
                      : 'bg-neutral/10 text-[#151C24] dark:text-white hover:bg-neutral/20'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          {form.tags.filter((t) => !SUGGESTED_TAGS.includes(t)).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {form.tags
                .filter((t) => !SUGGESTED_TAGS.includes(t))
                .map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-primary text-white"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      aria-label={`Remove ${tag}`}
                      className="hover:opacity-70"
                    >
                      ×
                    </button>
                  </span>
                ))}
            </div>
          )}

          <div className="flex gap-2 mt-3">
            <input
              type="text"
              placeholder="Custom tag..."
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyDown={handleCustomTagKeyDown}
              className={`${inputCls} flex-1`}
            />
            <button
              type="button"
              onClick={addCustomTag}
              className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="notes" className={labelCls}>
            Notes
          </label>
          <textarea
            id="notes"
            rows={3}
            placeholder="Any context, recruiter name, referrals..."
            value={form.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            className={`${inputCls} resize-none`}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-neutral/40 text-sm font-semibold text-[#151C24] dark:text-white hover:bg-neutral/10 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isFormValid}
            className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover active:bg-primary-active transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
          >
            {isEditing ? 'Update Job' : 'Save Job'}
          </button>
        </div>
      </form>
    </Modal>
  );
}