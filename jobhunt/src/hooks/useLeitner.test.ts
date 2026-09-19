import { describe, it, expect } from 'vitest';
import { calculateNextBoxAndDate } from './useLeitner';
import type { LeitnerBox } from '../types/card.types';

/** Helper: adds `days` to a fixed date and returns "YYYY-MM-DD", matching
 * the same local-date math the implementation uses — used to build
 * expected values without hardcoding date arithmetic by hand. */
function expectedDate(base: Date, days: number): string {
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

describe('calculateNextBoxAndDate', () => {
  describe('correct answers', () => {
    it('should move card from box 1 to box 2 on correct answer', () => {
      const today = new Date();
      const result = calculateNextBoxAndDate(1, true, today);

      expect(result.newBox).toBe(2);
      expect(result.nextReviewDate).toBe(expectedDate(today, 3));
    });

    it('should move card from box 4 to box 5 on correct answer', () => {
      const today = new Date();
      const result = calculateNextBoxAndDate(4, true, today);

      expect(result.newBox).toBe(5);
      expect(result.nextReviewDate).toBe(expectedDate(today, 30));
    });

    it('should stay at box 5 (not overflow to box 6) on correct answer when already mastered', () => {
      const today = new Date();
      const result = calculateNextBoxAndDate(5, true, today);

      expect(result.newBox).toBe(5);
      expect(result.nextReviewDate).toBe(expectedDate(today, 30));
    });
  });

  describe('incorrect answers', () => {
    it('should reset card from box 3 to box 1 on incorrect answer', () => {
      const today = new Date();
      const result = calculateNextBoxAndDate(3, false, today);

      expect(result.newBox).toBe(1);
      expect(result.nextReviewDate).toBe(expectedDate(today, 1));
    });

    it('should reset card from box 5 to box 1 on incorrect answer', () => {
      const today = new Date();
      const result = calculateNextBoxAndDate(5, false, today);

      expect(result.newBox).toBe(1);
      expect(result.nextReviewDate).toBe(expectedDate(today, 1));
    });

    it('should stay at box 1 on incorrect answer when already at box 1', () => {
      const today = new Date();
      const result = calculateNextBoxAndDate(1, false, today);

      expect(result.newBox).toBe(1);
      expect(result.nextReviewDate).toBe(expectedDate(today, 1));
    });
  });

  describe('deterministic date calculation with fixed "today"', () => {
    it('should produce the exact expected nextReviewDate for a correct answer from box 2 on a fixed date', () => {
      const fixedToday = new Date('2025-01-01T00:00:00');
      const result = calculateNextBoxAndDate(2, true, fixedToday);


      expect(result.newBox).toBe(3);
      expect(result.nextReviewDate).toBe('2025-01-08');
    });

    it('should produce the exact expected nextReviewDate for an incorrect answer on a fixed date', () => {
      const fixedToday = new Date('2025-01-01T00:00:00');
      const result = calculateNextBoxAndDate(4, false, fixedToday);

      
      expect(result.newBox).toBe(1);
      expect(result.nextReviewDate).toBe('2025-01-02');
    });
  });

  describe('return value format', () => {
    it('should return nextReviewDate as a valid ISO date string (YYYY-MM-DD)', () => {
      const result = calculateNextBoxAndDate(1, true, new Date());

      expect(result.nextReviewDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(new Date(result.nextReviewDate).toString()).not.toBe('Invalid Date');
    });

    it('should return newBox as one of the valid LeitnerBox values (1-5)', () => {
      const validBoxes: LeitnerBox[] = [1, 2, 3, 4, 5];
      const result = calculateNextBoxAndDate(3, true, new Date());

      expect(validBoxes).toContain(result.newBox);
    });
  });
});