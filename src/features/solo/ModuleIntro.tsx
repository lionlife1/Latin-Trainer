import { useState } from 'react';
import { ChevronLeft } from '../../components/icons';
import { lessonFor } from '../../content/lessons';
import type { ModuleContent } from '../../lib/types';
import { hasReadLesson } from '../practice/lessonStore';
import type { ModuleProgress } from './progressStore';

interface Props {
  mod: ModuleContent;
  progress?: ModuleProgress;
  onBack: () => void;
  onStart: (count: number | 'all') => void;
  onLesson?: () => void;
}

export function sessionLengthOptions(totalQ: number): { value: number | 'all'; label: string }[] {
  const opts: { value: number | 'all'; label: string }[] = [5, 10, 20, 40]
    .filter(n => n < totalQ)
    .map(n => ({ value: n, label: `${n} questions` }));
  opts.push({ value: 'all', label: `All ${totalQ} questions` });
  return opts;
}

export function ModuleIntro({ mod, progress, onBack, onStart, onLesson }: Props) {
  const totalQ = mod.questions.length;
  const options = sessionLengthOptions(totalQ);
  const recommended = totalQ > 20 ? 20 : totalQ > 10 ? 10 : 'all';
  const [count, setCount] = useState<number | 'all'>(recommended);
  const wrongCount = progress?.wrong_ids?.length ?? 0;

  return (
    <div className="screen active">
      <div className="intro-card">
        <button className="btn-back" onClick={onBack}><ChevronLeft size={18} />Grammar</button>
        <div className="intro-module-badge">{mod.badge}</div>
        <h1 className="intro-title">{mod.title}</h1>
        <p className="intro-desc">{mod.description}</p>
        <div className="intro-stats">
          <div className="intro-stat"><div className="intro-stat-val">{totalQ}</div><div className="intro-stat-label">Questions</div></div>
          <div className="intro-stat"><div className="intro-stat-val">+{mod.xp_reward}</div><div className="intro-stat-label">XP</div></div>
          {progress?.completed && (
            <div className="intro-stat"><div className="intro-stat-val" style={{ color: 'var(--success)' }}>Done</div><div className="intro-stat-label">Status</div></div>
          )}
          {wrongCount > 0 && (
            <div className="intro-stat"><div className="intro-stat-val" style={{ color: 'var(--red)' }}>{wrongCount}</div><div className="intro-stat-label">To review</div></div>
          )}
        </div>
        <div className="intro-concepts">
          <div className="intro-concepts-title">Concepts</div>
          {mod.concepts.map(c => <span key={c} className="concept-tag">{c}</span>)}
        </div>
        <div className="intro-config">
          <label htmlFor="cfg-q-count">Session length</label>
          <select
            id="cfg-q-count"
            className="select"
            value={String(count)}
            onChange={e => setCount(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          >
            {options.map(o => (
              <option key={String(o.value)} value={String(o.value)}>
                {o.label}{o.value === recommended ? ' (recommended)' : ''}
              </option>
            ))}
          </select>
        </div>
        {onLesson && lessonFor(mod.id) && (
          <button className="btn-secondary" onClick={onLesson}>
            {hasReadLesson(mod.id) ? 'Review the lesson' : 'Read the lesson'}
          </button>
        )}
        <button className="btn-primary" onClick={() => onStart(count)}>Start session</button>
      </div>
    </div>
  );
}
