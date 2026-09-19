import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Plus, LayoutGrid, List, Inbox } from 'lucide-react';
import { useCardsStore } from '../store/useCardsStore';
import { useLeitner } from '../hooks/useLeitner';
import LeitnerProgressBar from '../components/flashcards/LeitnerProgressBar';
import FlashcardPreviewCard from '../components/flashcards/FlashcardPreviewCard';
import CardModal from '../components/flashcards/CardModal';
import type { Card } from '../types/card.types';

type ViewMode = 'grid' | 'list';

export default function FlashcardsLibraryPage() {
  const navigate = useNavigate();
  const cards = useCardsStore((s) => s.cards);
  const getAllTags = useCardsStore((s) => s.getAllTags);

  const { dueCards, totalCards, masteredCount, boxDistribution } = useLeitner();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTag, setActiveTag] = useState<string>('All');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [editingCard, setEditingCard] = useState<Card | undefined>(undefined);

  const allTags = getAllTags();
  const dueCardIds = new Set(dueCards.map((c) => c.id));

  const filteredCards =
    activeTag === 'All' ? cards : cards.filter((card) => card.tags.includes(activeTag));

  const tagCounts = allTags.map((tag) => ({
    tag,
    count: cards.filter((card) => card.tags.includes(tag)).length,
  }));

  const handleAddClick = () => {
    setEditingCard(undefined);
    setIsAddModalOpen(true);
  };

  const handleCardClick = (card: Card) => {
    setEditingCard(card);
    setIsAddModalOpen(true);
  };

  const handleModalClose = () => {
    setIsAddModalOpen(false);
    setEditingCard(undefined);
  };

  return (
    <div className="px-4 md:px-8 py-6 max-w-6xl mx-auto">
      {/* Header row */}
      <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#151C24] dark:text-white">Flashcard Library</h1>
          <p className="text-sm text-neutral mt-1">
            {totalCards} cards · {dueCards.length} due today
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/study')}
            className="flex items-center gap-2 border border-primary/30 text-primary font-semibold px-4 py-2.5 rounded-xl hover:bg-primary/5 transition-colors"
          >
            <Play size={16} />
            Study {dueCards.length} due
          </button>

          <button
            type="button"
            onClick={handleAddClick}
            className="flex items-center gap-2 bg-primary text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-primary-hover active:bg-primary-active transition-colors"
          >
            <Plus size={18} />
            Add Card
          </button>
        </div>
      </div>

      {/* Leitner progress */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-[#151C24] dark:text-white mb-2">
          Leitner Progress · mastered: {masteredCount}/{totalCards}
        </p>
        <LeitnerProgressBar boxDistribution={boxDistribution} totalCards={totalCards} />
      </div>

      {/* Tag filter row */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTag('All')}
          className={`shrink-0 text-sm font-medium px-3.5 py-1.5 rounded-full transition-colors ${
            activeTag === 'All'
              ? 'bg-primary text-white'
              : 'bg-neutral/10 text-[#151C24] dark:text-white hover:bg-neutral/20'
          }`}
        >
          All ({totalCards})
        </button>

        {tagCounts.map(({ tag, count }) => (
          <button
            key={tag}
            type="button"
            onClick={() => setActiveTag(tag)}
            className={`shrink-0 text-sm font-medium px-3.5 py-1.5 rounded-full transition-colors ${
              activeTag === tag
                ? 'bg-primary text-white'
                : 'bg-neutral/10 text-[#151C24] dark:text-white hover:bg-neutral/20'
            }`}
          >
            {tag} ({count})
          </button>
        ))}

        {/* View toggle — visual only for now */}
        <div className="flex items-center gap-1 ml-auto shrink-0 pl-2">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            aria-label="Grid view"
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid' ? 'bg-primary text-white' : 'text-neutral hover:bg-neutral/10'
            }`}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            aria-label="List view"
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list' ? 'bg-primary text-white' : 'text-neutral hover:bg-neutral/10'
            }`}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Cards grid/list */}
      {filteredCards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Inbox size={32} className="text-neutral/50 mb-3" />
          <p className="text-sm text-neutral">No flashcards found for this filter.</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'flex flex-col gap-3'}>
          {filteredCards.map((card) => (
            <FlashcardPreviewCard
              key={card.id}
              card={card}
              isDue={dueCardIds.has(card.id)}
              onClick={() => handleCardClick(card)}
            />
          ))}
        </div>
      )}

      <CardModal isOpen={isAddModalOpen} onClose={handleModalClose} initialData={editingCard} />
    </div>
  );
}