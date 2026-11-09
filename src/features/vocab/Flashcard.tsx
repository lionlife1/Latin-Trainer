interface Props {
  /** HTML; prompts are escaped by the question builders. */
  front: string;
  /** Plain text. */
  back: string;
  flipped: boolean;
  onFlip: () => void;
}

export function Flashcard({ front, back, flipped, onFlip }: Props) {
  return (
    <button type="button" className="flashcard" aria-label="Flashcard. Tap to flip." aria-pressed={flipped} onClick={onFlip}>
      {flipped ? <span>{back}</span> : <span dangerouslySetInnerHTML={{ __html: front }} />}
    </button>
  );
}
