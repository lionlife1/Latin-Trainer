import { useEffect, useRef, useState } from 'react';

interface Props {
  disabled: boolean;
  verdict?: boolean;
  onSubmit: (given: string) => void;
}

export function TypeInAnswer({ disabled, verdict, onSubmit }: Props) {
  const [value, setValue] = useState('');
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled) ref.current?.focus();
  }, [disabled]);

  const submit = () => {
    if (disabled || !value.trim()) return;
    onSubmit(value);
    ref.current?.blur();
  };

  return (
    <div className="answer-area">
      <div className="input-wrap">
        <input
          ref={ref}
          type="text"
          className={`answer-input ${verdict === true ? 'correct' : verdict === false ? 'wrong' : ''}`}
          placeholder="Type your answer…"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          value={value}
          disabled={disabled}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.stopPropagation();
              submit();
            }
          }}
        />
        <button className="btn-submit" onClick={submit} disabled={disabled}>⏎ Check</button>
      </div>
      <div className="macron-toolbar">
        <span className="macron-hint">Macrons optional — type without them:</span>
        <span className="macron-note">ā=a ē=e ī=i ō=o ū=u</span>
      </div>
    </div>
  );
}
