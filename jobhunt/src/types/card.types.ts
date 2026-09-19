export type LeitnerBox = 1 | 2 | 3 | 4 | 5;

export interface ReviewRecord {
  date: string; // ISO date string
  wasCorrect: boolean;
}

export interface Card {
  id: string;
  question: string;
  answer: string;
  tags: string[]; // a card can carry multiple tags
  box: LeitnerBox;
  nextReviewDate: string; // ISO date string — card is "due" once this passes
  createdAt: string;
  updatedAt: string;
  reviewHistory?: ReviewRecord[];
}