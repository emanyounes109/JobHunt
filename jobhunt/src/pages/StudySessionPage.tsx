import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, PartyPopper } from 'lucide-react';
import { useLeitner } from '../hooks/useLeitner';
import Flashcard from '../components/flashcards/Flashcard';
import ProgressDots from '../components/flashcards/ProgressDots';
import type { Card } from '../types/card.types';

export default function StudySessionPage() {
  const navigate = useNavigate();
  const { dueCards, answerCard } = useLeitner();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Snapshot of dueCards taken once, right when this page loads, rather
  // than reading the live dueCards array. answerCard() pushes a card's
  // nextReviewDate into the future the instant it's answered, which drops
  // it from the store's live dueCards on the next render — reading that
  // directly here would shift the list and the current index mid-review.
  const [sessionCards, setSessionCards] = useState<Card[] | null>(null);

  useEffect(() => {
    setSessionCards(dueCards);
    // Intentionally runs once on mount only — this is a snapshot, not a
    // live subscription to dueCards.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentCard = sessionCards?.[currentIndex];

  function handleAnswer(wasCorrect: boolean): void {
    if (!currentCard || !sessionCards) return;

    answerCard(currentCard.id, wasCorrect);

    if (wasCorrect) {
      setCorrectCount((c) => c + 1);
    } else {
      setWrongCount((c) => c + 1);
    }

    const isLastCard = currentIndex >= sessionCards.length - 1;
    setShowAnswer(false);

    if (isLastCard) {
      setIsComplete(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  // Still taking the snapshot
  if (sessionCards === null) {
    return null;
  }

  // Nothing was due when the session started
  if (sessionCards.length === 0) {
    return (
      <div className="px-4 md:px-8 py-10 max-w-2xl mx-auto">
        <div className="bg-surface dark:bg-surface-dark rounded-2xl p-10 text-center">
          <div className="w-12 h-12 rounded-xl bg-success/15 flex items-center justify-center mx-auto mb-4">
            <PartyPopper size={24} className="text-success" />
          </div>
          <p className="font-bold text-lg text-[#151C24] dark:text-white">All caught up!</p>
          <p className="text-sm text-neutral mt-1">No cards due for review right now.</p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-6 text-primary font-medium hover:underline"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Every card in the session has been answered
  if (isComplete) {
    return (
      <div className="px-4 md:px-8 py-10 max-w-2xl mx-auto">
        <div className="bg-surface dark:bg-surface-dark rounded-2xl p-10 text-center">
          <div className="w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center mx-auto mb-4">
            <PartyPopper size={24} className="text-accent" />
          </div>
          <p className="font-bold text-lg text-[#151C24] dark:text-white">Session complete!</p>
          <p className="text-sm text-neutral mt-2">
            <span className="text-success font-semibold">{correctCount} correct</span>
            {' · '}
            <span className="text-danger font-semibold">{wrongCount} wrong</span>
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-6 text-primary font-medium hover:underline"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!currentCard) return null;

  return (
    <div className="px-4 md:px-8 py-6 max-w-2xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-sm font-medium text-primary hover:underline"
        >
          ← Exit
        </button>
        <p className="text-sm font-medium text-[#151C24] dark:text-white">
          Card {currentIndex + 1} of {sessionCards.length}
        </p>
        <div className="flex items-center gap-3 text-sm font-bold">
          <span className="flex items-center gap-1 text-success">
            <CheckCircle2 size={14} />
            {correctCount}
          </span>
          <span className="flex items-center gap-1 text-danger">
            <XCircle size={14} />
            {wrongCount}
          </span>
        </div>
      </div>

      {/* Flip card */}
      <Flashcard
        question={currentCard.question}
        answer={currentCard.answer}
        isFlipped={showAnswer}
        onFlip={() => setShowAnswer((prev) => !prev)}
        minHeight="300px"
      />

      {/* Answer buttons */}
      <div className="mt-6">
        {!showAnswer ? (
          <p className="text-center text-sm text-neutral">Tap the card to reveal the answer</p>
        ) : (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleAnswer(false)}
              className="flex-1 flex items-center justify-center gap-2 border border-danger text-danger font-semibold py-3 rounded-xl hover:bg-danger/10 transition-colors"
            >
              <XCircle size={18} />
              Got it wrong
            </button>
            <button
              type="button"
              onClick={() => handleAnswer(true)}
              className="flex-1 flex items-center justify-center gap-2 bg-success text-white font-semibold py-3 rounded-xl hover:bg-success/90 transition-colors"
            >
              <CheckCircle2 size={18} />
              Got it right
            </button>
          </div>
        )}
      </div>

      {/* Box progress */}
      <div className="mt-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral mb-2">
          Currently in Box {currentCard.box}
        </p>
        <ProgressDots currentBox={currentCard.box} variant="bar" />
      </div>
    </div>
  );
}