import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { useCardsStore } from '../../store/useCardsStore';
import type { Card } from '../../types/card.types';

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Card;
}

interface FormState {
  question: string;
  answer: string;
  tags: string[];
}

interface FormErrors {
  question?: string;
  answer?: string;
}

const SUGGESTED_TAGS = ['React', 'TypeScript', 'System Design', 'Next.js', 'CSS', 'JavaScript', 'Behavioral'];

const EMPTY_FORM: FormState = { question: '', answer: '', tags: [] };

export default function CardModal({ isOpen, onClose, initialData }: CardModalProps) {
  const addCard = useCardsStore((s) => s.addCard);
  const updateCard = useCardsStore((s) => s.updateCard);

  const isEditing = Boolean(initialData);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [customTag, setCustomTag] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        question: initialData.question,
        answer: initialData.answer,
        tags: initialData.tags,
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
    if (!values.question.trim()) nextErrors.question = 'Question is required';
    if (!values.answer.trim()) nextErrors.answer = 'Answer is required';
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
      question: form.question.trim(),
      answer: form.answer.trim(),
      tags: form.tags,
    };

    if (isEditing && initialData) {
      // Editing content only — box/nextReviewDate are left untouched,
      // since updateCard merges partial fields without resetting them.
      updateCard(initialData.id, payload);
    } else {
      // addCard() in the store sets box=1 and nextReviewDate=today
      // automatically for brand-new cards.
      addCard(payload);
    }

    onClose();
  }

  const isFormValid = form.question.trim().length > 0 && form.answer.trim().length > 0;

  const textareaCls = (hasError: boolean) =>
    `w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition resize-none placeholder:text-neutral/70 dark:text-white ${
      hasError
        ? 'bg-danger/5 border-danger focus:ring-4 focus:ring-danger/15'
        : 'bg-neutral/10 border-transparent focus:border-primary focus:bg-surface focus:ring-4 focus:ring-primary/10'
    }`;

  const labelCls = 'block text-sm font-medium text-[#151C24] dark:text-white mb-1.5';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Flashcard' : 'New Flashcard'}>
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Question */}
        <div>
          <label htmlFor="question" className={labelCls}>
            Question <span className="text-danger">*</span>
          </label>
          <textarea
            id="question"
            rows={3}
            style={{ minHeight: '80px' }}
            placeholder="What is the difference between useMemo and useCallback?"
            value={form.question}
            onChange={(e) => updateField('question', e.target.value)}
            className={textareaCls(Boolean(errors.question))}
          />
          {errors.question && (
            <p className="mt-1 text-xs font-medium text-danger">{errors.question}</p>
          )}
        </div>

        {/* Answer */}
        <div>
          <label htmlFor="answer" className={labelCls}>
            Answer <span className="text-danger">*</span>
          </label>
          <textarea
            id="answer"
            rows={5}
            style={{ minHeight: '120px' }}
            placeholder="Write a clear, concise answer you can verify against..."
            value={form.answer}
            onChange={(e) => updateField('answer', e.target.value)}
            className={textareaCls(Boolean(errors.answer))}
          />
          {errors.answer && (
            <p className="mt-1 text-xs font-medium text-danger">{errors.answer}</p>
          )}
        </div>

        {/* Tags */}
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
              className="flex-1 rounded-xl border border-transparent bg-neutral/10 px-3 py-2 text-sm outline-none transition placeholder:text-neutral/70 focus:border-primary focus:bg-surface focus:ring-4 focus:ring-primary/10 dark:text-white"
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

        {/* Footer buttons */}
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
            {isEditing ? 'Update Card' : 'Save Card'}
          </button>
        </div>
      </form>
    </Modal>
  );
}