import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Card, LeitnerBox } from '../types/card.types';

const STORAGE_KEY = 'jhc-cards-by-user';

interface CardsState {
  cards: Card[];
  currentUserId: string | null;
}

interface CardsActions {
  loadForUser: (userId: string | null) => void;
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

function readAllUsersCards(): Record<string, Card[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeAllUsersCards(map: Record<string, Card[]>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // fail silently
  }
}

function persistCurrentUserCards(userId: string | null, cards: Card[]): void {
  if (!userId) return;
  const all = readAllUsersCards();
  all[userId] = cards;
  writeAllUsersCards(all);
}

export const useCardsStore = create<CardsStore>((set, get) => ({
  cards: [],
  currentUserId: null,

  loadForUser: (userId) => {
    if (!userId) {
      set({ cards: [], currentUserId: null });
      return;
    }
    const all = readAllUsersCards();
    set({ cards: all[userId] ?? [], currentUserId: userId });
  },

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
    set((state) => {
      const cards = [...state.cards, newCard];
      persistCurrentUserCards(state.currentUserId, cards);
      return { cards };
    });
  },

  updateCard: (id, updates) => {
    set((state) => {
      const cards = state.cards.map((card) =>
        card.id === id ? { ...card, ...updates, updatedAt: nowIso() } : card,
      );
      persistCurrentUserCards(state.currentUserId, cards);
      return { cards };
    });
  },

  deleteCard: (id) => {
    set((state) => {
      const cards = state.cards.filter((card) => card.id !== id);
      persistCurrentUserCards(state.currentUserId, cards);
      return { cards };
    });
  },

  moveCardToBox: (id, newBox, nextReviewDate) => {
    set((state) => {
      const cards = state.cards.map((card) => {
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
      });
      persistCurrentUserCards(state.currentUserId, cards);
      return { cards };
    });
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
}));