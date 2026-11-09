import { useRef, useState } from 'react';
import { downloadText } from '../../lib/csv';
import { lemmaOf } from '../../lib/lexicon';
import { quizletText } from '../../lib/vocabExport';
import type { StudySet } from './storage';

export function setToQuizlet(set: StudySet): string {
  return quizletText(set.cards.map(c => ({
    itemId: c.id, headword: c.latin, lemma: lemmaOf(c.latin), definition: c.english, pos: '',
  })));
}

export function QuizletExport({ set }: { set: StudySet }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const area = useRef<HTMLTextAreaElement>(null);
  const text = setToQuizlet(set);
  const slug = set.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'vocab';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      area.current?.select();
    }
  };

  return (
    <section className="section">
      <button className="btn-secondary" onClick={() => setOpen(o => !o)}>Export to Quizlet</button>
      {open && (
        <div className="panel" style={{ marginTop: 12, padding: 16 }}>
          <p className="muted">In Quizlet, make a new set, choose Import, and paste this. Leave the settings on Tab and New line.</p>
          <label className="field">
            <span>Quizlet import text</span>
            <textarea ref={area} className="input" rows={6} style={{ width: '100%' }} readOnly value={text} />
          </label>
          <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
            <button className="btn-primary" onClick={copy}>Copy</button>
            <button className="btn-secondary" onClick={() => downloadText(`${slug}-quizlet.txt`, text)}>Download .txt</button>
            {copied && <span className="muted" role="status">Copied.</span>}
          </div>
        </div>
      )}
    </section>
  );
}
