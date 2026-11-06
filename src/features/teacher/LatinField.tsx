import { useLayoutEffect, useRef, type InputHTMLAttributes, type KeyboardEvent, type TextareaHTMLAttributes } from 'react';
import { MACRON_VOWELS, insertAt, macronShortcut, type Edit } from '../../lib/macrons';

type Common = {
  value: string;
  onValueChange: (value: string) => void;
  /** Typing "=" right after a vowel gives the long vowel (a= -> ā). Off where "=" is a separator. */
  shortcut?: boolean;
  /** Stretch to the container width. */
  block?: boolean;
};
type Props =
  | (Common & { multiline?: false } & Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>)
  | (Common & { multiline: true } & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'>);

/**
 * A text field for Latin, with a row of macron buttons that insert at the caret. Chromebooks and
 * most keyboards have no easy macron input (research.md §8).
 */
export function LatinField(props: Props) {
  const { value, onValueChange, shortcut = true, block, multiline, className, ...rest } = props;
  const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const caret = useRef<number | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (el && caret.current !== null) {
      el.setSelectionRange(caret.current, caret.current);
      caret.current = null;
    }
  }, [value]);

  const apply = (e: Edit) => {
    caret.current = e.caret;
    onValueChange(e.value);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement & HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    if (shortcut && e.key === '=' && !e.ctrlKey && !e.metaKey && !e.altKey && el.selectionStart === el.selectionEnd) {
      const edit = macronShortcut(el.value, el.selectionStart ?? el.value.length);
      if (edit) {
        e.preventDefault();
        apply(edit);
      }
    }
    (rest.onKeyDown as ((ev: typeof e) => void) | undefined)?.(e);
  };
  const field = {
    ...rest,
    className: className ?? 'input',
    value,
    onKeyDown,
    onChange: (e: { target: { value: string } }) => onValueChange(e.target.value),
  };

  return (
    <span className={`latin-field${block ? ' block' : ''}`}>
      {multiline ? <textarea {...(field as TextareaHTMLAttributes<HTMLTextAreaElement>)} ref={ref} /> : <input {...(field as InputHTMLAttributes<HTMLInputElement>)} ref={ref} />}
      <span className="macron-bar" role="group" aria-label="Insert a long vowel">
        {MACRON_VOWELS.map(v => (
          <button
            key={v}
            type="button"
            aria-label={`Insert ${v}`}
            // Keep focus (and the caret) in the field.
            onMouseDown={e => e.preventDefault()}
            onClick={() => {
              const el = ref.current;
              apply(insertAt(value, el?.selectionStart ?? null, el?.selectionEnd ?? null, v));
              el?.focus();
            }}
          >
            {v}
          </button>
        ))}
        {shortcut && <span className="muted small">or type a= for ā</span>}
      </span>
    </span>
  );
}
