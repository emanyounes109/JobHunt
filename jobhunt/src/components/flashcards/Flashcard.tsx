import { useState } from 'react';

interface FlashcardProps {
  question: string;
  answer: string;
  isFlipped?: boolean;
  onFlip?: () => void;
  minHeight?: string;
}

export default function Flashcard({
  question,
  answer,
  isFlipped: controlledFlipped,
  onFlip,
  minHeight = '300px',
}: FlashcardProps) {
  const [internalFlipped, setInternalFlipped] = useState(false);

  // Controlled vs uncontrolled: if the parent passes isFlipped, defer to it
  // and require onFlip to change it. Otherwise manage flip state internally.
  const isControlled = controlledFlipped !== undefined;
  const flipped = isControlled ? controlledFlipped : internalFlipped;

  const handleClick = () => {
    if (isControlled) {
      onFlip?.();
    } else {
      setInternalFlipped((prev) => !prev);
    }
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleClick();
      }}
      // [perspective:1000px] is an arbitrary Tailwind value — `perspective`
      // has no built-in Tailwind utility, so this is the cleanest way to
      // set the 3D viewing distance without a separate CSS file.
      className="[perspective:1000px] cursor-pointer select-none"
      style={{ minHeight }}
    >
      <div
        className="relative w-full h-full transition-transform duration-500 ease-in-out [transform-style:preserve-3d]"
        style={{
          minHeight,
          // rotateY is also not a native Tailwind utility (only rotate-*
          // around the Z axis exists), so the flip transform itself is set
          // via inline style rather than a class.
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front face: Question */}
        <div
          className="absolute inset-0 [backface-visibility:hidden] bg-surface dark:bg-surface-dark rounded-2xl shadow-sm p-8 flex flex-col items-center justify-center text-center"
          style={{ minHeight }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral mb-3">
            Question
          </p>
          <p className="text-xl font-bold text-[#151C24] dark:text-white">{question}</p>
          <p className="text-sm text-neutral mt-6">Tap to reveal answer</p>
        </div>

        {/* Back face: Answer.
            Pre-rotated 180deg so that once the PARENT (.preserve-3d wrapper)
            also rotates 180deg, this face's net rotation is 0deg — meaning
            it renders right-side-up rather than mirrored. Its own
            backface-visibility:hidden keeps it invisible until that
            combined rotation brings it to face the viewer. */}
        <div
          className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-primary/5 dark:bg-primary/10 rounded-2xl shadow-sm p-8 flex flex-col items-center justify-center text-center"
          style={{ minHeight }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral mb-3">
            Answer
          </p>
          <p className="text-xl font-bold text-[#151C24] dark:text-white">{answer}</p>
          <p className="text-sm text-neutral mt-6">Tap to see question again</p>
        </div>
      </div>
    </div>
  );
}