import { useState } from 'react';

interface Props {
  badge: string;
  prompt: string;
  hint?: string;
}

/** Prompt HTML comes from built-in content or teacher-published pools (escaped at generation). */
export function QuestionCard({ badge, prompt, hint }: Props) {
  const [showHint, setShowHint] = useState(false);
  return (
    <div className="question-card" onClick={() => setShowHint(true)}>
      <div className="q-type-badge">{badge}</div>
      <div className="q-prompt" dangerouslySetInnerHTML={{ __html: prompt }} />
      <div className="q-hint">
        {hint &&
          (showHint ? (
            <>
              <strong>Hint:</strong> <span dangerouslySetInnerHTML={{ __html: hint }} />
            </>
          ) : (
            <span style={{ opacity: 0.6 }}>💡 Click card to reveal hint</span>
          ))}
      </div>
    </div>
  );
}
