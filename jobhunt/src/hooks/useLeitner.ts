import { useCardsStore } from '../store/useCardsStore';
import type { Card, LeitnerBox } from '../types/card.types';

/**
 * Leitner box → review interval (in days).
 * After a card lands in a box (whether by moving up or resetting to box 1),
 * it becomes due again this many days from today. Box 5 is the "mastered"
 * box with the longest interval.
 */
const BOX_INTERVALS: Record<LeitnerBox, number> = {
  1: 1,
  2: 3,
  3: 7,
  4: 14,
  5: 30,
};

/**
 * Returns the review interval, in days, for a given Leitner box.
 * Exported so UI can display copy like "reviews again in {n} days".
 */
export function getIntervalForBox(box: LeitnerBox): number {
  return BOX_INTERVALS[box];
}

/** Formats a Date as a local "YYYY-MM-DD" string, avoiding UTC-shift bugs
 * that `toISOString()` can introduce near midnight in non-UTC timezones. */
function formatIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Returns a new Date offset by `days` from `date`, using local date parts
 * only (no time-of-day component), so day-math never drifts across DST or
 * timezone boundaries. */
function addDays(date: Date, days: number): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * PURE function implementing the core Leitner Spaced Repetition rules.

 *
 * @param currentBox - the card's box before this review
 * @param wasCorrect - whether the user answered correctly
 * @param today - defaults to `new Date()`; pass explicitly in tests for
 *   deterministic output
 */
export function calculateNextBoxAndDate(
  currentBox: LeitnerBox,
  wasCorrect: boolean,
  today: Date = new Date(),
): { newBox: LeitnerBox; nextReviewDate: string } {
  const newBox: LeitnerBox = wasCorrect
    ? (Math.min(currentBox + 1, 5) as LeitnerBox)
    : 1;

  const interval = getIntervalForBox(newBox);
  const nextReviewDate = formatIsoDate(addDays(today, interval));

  return { newBox, nextReviewDate };
}

interface UseLeitnerResult {
  dueCards: Card[];
  totalCards: number;
  masteredCount: number;
  needsWorkCount: number;
  boxDistribution: Record<LeitnerBox, number>;
  /**
   * Records the outcome of reviewing a card: looks up its current box,
   * calculates the new box + nextReviewDate via calculateNextBoxAndDate,
   * and persists the move through the store's moveCardToBox action.
   */
  answerCard: (cardId: string, wasCorrect: boolean) => void;
  getIntervalForBox: (box: LeitnerBox) => number;
}

/**
 * Custom hook exposing the Leitner spaced-repetition system to components.
 * Reads live state from useCardsStore and derives due cards, mastery
 * stats, and per-box distribution; exposes `answerCard` as the single
 * entry point for recording a review outcome.
 */
export function useLeitner(): UseLeitnerResult {
  const cards = useCardsStore((s) => s.cards);
  const getDueCards = useCardsStore((s) => s.getDueCards);
  const getCardById = useCardsStore((s) => s.getCardById);
  const moveCardToBox = useCardsStore((s) => s.moveCardToBox);

  const dueCards = getDueCards();
  const totalCards = cards.length;
  const masteredCount = cards.filter((card) => card.box === 5).length;
  const needsWorkCount = cards.filter((card) => card.box === 1).length;

  const boxDistribution: Record<LeitnerBox, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  cards.forEach((card) => {
    boxDistribution[card.box] += 1;
  });

  /**
   * This function relies on getDueCards() in the store for "is this card
   * due" logic (nextReviewDate <= today) — it does not duplicate that
   * check here, per the store being the single source of truth for it.
   */
  function answerCard(cardId: string, wasCorrect: boolean): void {
    const card = getCardById(cardId);
    if (!card) return;

    const { newBox, nextReviewDate } = calculateNextBoxAndDate(card.box, wasCorrect);
    moveCardToBox(cardId, newBox, nextReviewDate);
  }

  return {
    dueCards,
    totalCards,
    masteredCount,
    needsWorkCount,
    boxDistribution,
    answerCard,
    getIntervalForBox,
  };
}