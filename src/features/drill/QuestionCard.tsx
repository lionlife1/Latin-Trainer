import { useState } from 'react';

interface Props {
  badge: string;
  prompt: string;
  hint?: string;
  hintKind?: 'definition';
}

/** Prompt HTML comes from built-in content or teacher-published pools (escaped at generation). */
export function QuestionCard({ badge, prompt, hint, hintKind }: Props) {
  const [showHint, setShowHint] = useState(false);
  return (
    <div className="question-card" onClick={() => setShowHint(true)}>
      <div className="q-type-badge">{badge}</div>
      <div className="q-prompt" dangerouslySetInnerHTML={{ __html: prompt }} />
      <div className="q-hint">
        {hint &&
          (showHint ? (
            <>
              <strong>{hintKind === 'definition' ? 'Definition:' : 'Hint:'}</strong> <span dangerouslySetInnerHTML={{ __html: hint }} />
            </>
          ) : (
            <span>{hintKind === 'definition' ? 'Tap the card to see the definition' : 'Tap the card for a hint'}</span>
          ))}
      </div>
    </div>
  );
}
