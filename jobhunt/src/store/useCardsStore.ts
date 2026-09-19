import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Card, LeitnerBox } from '../types/card.types';
import { perUserStorage } from './persistPerUser';

interface CardsState {
  cards: Card[];
}

interface CardsActions {
  addCard: (
    card: Omit<Card, 'id' | 'box' | 'nextReviewDate' | 'createdAt' | 'updatedAt' | 'reviewHistory'>,
  ) => void;
  updateCard: (id: string, updates: Partial<Card>) => void;
  deleteCard: (id: string) => void;
  moveCardToBox: (id: string, newBox: LeitnerBox, nextReviewDate: string) => void;
  getCardById: (id: string) => Card | undefined;
  getDueCards: () => Card[];
  getCardsByTag: (tag: string) => Card[];
  getAllTags: () => string[];
}

export type CardsStore = CardsState & CardsActions;

const nowIso = (): string => new Date().toISOString();
const todayIso = (): string => new Date().toISOString().slice(0, 10);

export const useCardsStore = create<CardsStore>()(
  persist(
    (set, get) => ({
      // Every new account starts with zero flashcards — nothing is seeded.
      cards: [],

      addCard: (card) => {
        const timestamp = nowIso();
        const newCard: Card = {
          ...card,
          id: uuidv4(),
          box: 1,
          nextReviewDate: todayIso(),
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        set((state) => ({ cards: [...state.cards, newCard] }));
      },

      updateCard: (id, updates) => {
        set((state) => ({
          cards: state.cards.map((card) =>
            card.id === id ? { ...card, ...updates, updatedAt: nowIso() } : card,
          ),
        }));
      },

      deleteCard: (id) => {
        set((state) => ({
          cards: state.cards.filter((card) => card.id !== id),
        }));
      },

      moveCardToBox: (id, newBox, nextReviewDate) => {
        set((state) => ({
          cards: state.cards.map((card) => {
            if (card.id !== id) return card;

            const wasCorrect = newBox >= card.box;
            const history = card.reviewHistory ?? [];

            return {
              ...card,
              box: newBox,
              nextReviewDate,
              reviewHistory: [...history, { date: nowIso(), wasCorrect }],
              updatedAt: nowIso(),
            };
          }),
        }));
      },

      getCardById: (id) => {
        return get().cards.find((card) => card.id === id);
      },

      getDueCards: () => {
        const today = todayIso();
        return get().cards.filter((card) => card.nextReviewDate <= today);
      },

      getCardsByTag: (tag) => {
        return get().cards.filter((card) => card.tags.includes(tag));
      },

      getAllTags: () => {
        const tagSet = new Set<string>();
        get().cards.forEach((card) => card.tags.forEach((tag) => tagSet.add(tag)));
        return Array.from(tagSet).sort();
      },
    }),
    {
      name: 'jhc-cards',
      storage: createJSONStorage(() => perUserStorage),
    },
  ),
);