import { useEffect, useMemo, useState } from 'react';
import { MODULES } from '../../content/modules';
import { buildFormsPool, type FormsAssignmentConfig } from '../../lib/formsItems';
import type { AssignmentMode } from '../../lib/types';
import { shuffle } from '../../lib/shuffle';
import { errorMessage } from '../../lib/useAsync';
import { buildVocabQuestions, type PoolItem, type VocabDirection, type VocabItem } from '../../lib/vocab';
import {
  listVocabLists, loadFallbackLexicon, loadVocabItems, publishAssignment,
  type AssignmentSource, type VocabListRow,
} from './api';
import { DEFAULT_FORMS_ASSIGNMENT, FormsSource, toStoredFormsConfig } from './FormsSource';

interface Props {
  classId: string;
  onPublished: (assignmentId: string) => void;
}

type QType = 'typein' | 'mc';

function toggle<T>(xs: T[], x: T): T[] {
  return xs.includes(x) ? xs.filter(y => y !== x) : [...xs, x];
}

export function modulePool(moduleIds: string[], badges: string[], types: QType[]): PoolItem[] {
  return MODULES.filter(m => moduleIds.includes(m.id))
    .flatMap(m => m.questions)
    .filter(q => (badges.length === 0 || badges.includes(q.badge)) && (types.length === 0 || types.includes(q.type as QType)))
    .map(q => ({ item_key: q.id, question: q }));
}

/** Module choices are stored with the answer in a fixed place; shuffle them so the snapshot does not give it away. `correct` is the choice text, so it stays valid. */
export function shuffleModuleChoices(pool: PoolItem[], rng: () => number = Math.random): PoolItem[] {
  return pool.map(it => (it.question.type === 'mc' ? { ...it, question: { ...it.question, choices: shuffle(it.question.choices, rng) } } : it));
}

export function AssignmentBuilder({ classId, onPublished }: Props) {
  const [title, setTitle] = useState('');
  const [mode, setMode] = useState<AssignmentMode>('practice');
  const [kind, setKind] = useState<'modules' | 'vocab' | 'forms'>('modules');
  const [formsConfig, setFormsConfig] = useState<FormsAssignmentConfig>(DEFAULT_FORMS_ASSIGNMENT);
  const [moduleIds, setModuleIds] = useState<string[]>([]);
  const [badges, setBadges] = useState<string[]>([]);
  const [types, setTypes] = useState<QType[]>([]);
  const [lists, setLists] = useState<VocabListRow[]>([]);
  const [listId, setListId] = useState('');
  const [vocabItems, setVocabItems] = useState<VocabItem[]>([]);
  const [directions, setDirections] = useState<VocabDirection[]>(['l2e', 'e2l']);
  const [count, setCount] = useState<string>('');
  const [dueAt, setDueAt] = useState('');
  const [timeLimitMin, setTimeLimitMin] = useState('');
  const [maxAttempts, setMaxAttempts] = useState('');
  const [reveal, setReveal] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listVocabLists().then(setLists, () => setLists([]));
  }, []);
  useEffect(() => {
    if (!listId) return setVocabItems([]);
    loadVocabItems(listId).then(setVocabItems, e => setError(String(e)));
  }, [listId]);

  const availableBadges = useMemo(
    () => [...new Set(MODULES.filter(m => moduleIds.includes(m.id)).flatMap(m => m.questions.map(q => q.badge)))].sort(),
    [moduleIds],
  );
  const activeBadges = badges.filter(b => availableBadges.includes(b));
  const formsPool = useMemo(() => (kind === 'forms' ? buildFormsPool(formsConfig, Math.random) : []), [kind, formsConfig]);
  const poolSize =
    kind === 'modules' ? modulePool(moduleIds, activeBadges, types).length
      : kind === 'forms' ? formsPool.length
        : vocabItems.length * directions.length;
  const formsDefault = formsConfig.kind === 'parse' || formsConfig.kind === 'make' ? formsConfig.count : 20;
  const defaultCount = Math.min(kind === 'forms' ? formsDefault : 20, poolSize);
  const questionCount = count === '' ? defaultCount : Math.max(1, Math.min(poolSize, Number(count) || 1));
  const pointValues = formsPool.map(p => p.points ?? 1);
  const minPoints = pointValues.length ? Math.min(...pointValues) : 0;
  const maxPoints = pointValues.length ? Math.max(...pointValues) : 0;
  const pointsLabel = minPoints === maxPoints
    ? String(minPoints * questionCount)
    : `${minPoints * questionCount} to ${maxPoints * questionCount}`;
  const canPublish = title.trim() !== '' && poolSize > 0 && !busy;

  const publish = async () => {
    setBusy(true);
    setError(null);
    try {
      let pool: PoolItem[];
      let source: AssignmentSource;
      if (kind === 'modules') {
        pool = shuffleModuleChoices(modulePool(moduleIds, activeBadges, types));
        source = { kind: 'modules', moduleIds };
        if (activeBadges.length) source.badges = activeBadges;
        if (types.length) source.types = types;
      } else if (kind === 'forms') {
        pool = formsPool;
        source = { kind: 'forms', config: toStoredFormsConfig(formsConfig) };
      } else {
        pool = buildVocabQuestions(vocabItems, directions, await loadFallbackLexicon());
        source = { kind: 'vocab', listId, directions };
      }
      const res = await publishAssignment(
        {
          classId,
          title: title.trim(),
          mode,
          source,
          questionCount,
          dueAt: dueAt ? new Date(dueAt).toISOString() : null,
          timeLimitSec: mode === 'test' && timeLimitMin ? Math.round(Number(timeLimitMin) * 60) : null,
          maxAttempts: maxAttempts ? Number(maxAttempts) : null,
          revealAnswers: mode === 'practice' || reveal,
        },
        pool,
      );
      if (res.ok) onPublished(res.id);
      else setError(res.error);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card">
      <label className="field">
        <span>Title</span>
        <input className="input" value={title} onChange={e => setTitle(e.target.value)} maxLength={120} />
      </label>

      <div className="field">
        <span>Mode</span>
        <div className="row">
          <label><input type="radio" name="mode" checked={mode === 'practice'} onChange={() => setMode('practice')} /> Practice (instant feedback)</label>
          <label>
            <input
              type="radio"
              name="mode"
              checked={mode === 'test'}
              onChange={() => {
                setMode('test');
                if (maxAttempts === '') setMaxAttempts('1');
              }}
            />{' '}
            Test (graded on submit)
          </label>
        </div>
      </div>

      <div className="field">
        <span>Content</span>
        <div className="row">
          <label><input type="radio" name="kind" checked={kind === 'modules'} onChange={() => setKind('modules')} /> Grammar modules</label>
          <label><input type="radio" name="kind" checked={kind === 'vocab'} onChange={() => setKind('vocab')} /> Vocab list</label>
          <label><input type="radio" name="kind" checked={kind === 'forms'} onChange={() => setKind('forms')} /> Forms</label>
        </div>
      </div>

      {kind === 'modules' ? (
        <>
          <div className="checkbox-list">
            {MODULES.map(m => (
              <label key={m.id}>
                <input type="checkbox" checked={moduleIds.includes(m.id)} onChange={() => setModuleIds(toggle(moduleIds, m.id))} />
                {m.badge} · {m.title} <span className="muted small">({m.questions.length})</span>
              </label>
            ))}
          </div>
          {availableBadges.length > 0 && (
            <div className="field">
              <span>Only these question kinds (optional)</span>
              <div className="row">
                {availableBadges.map(b => (
                  <label key={b} className="small">
                    <input type="checkbox" checked={activeBadges.includes(b)} onChange={() => setBadges(toggle(badges, b))} />
                    {b}
                  </label>
                ))}
              </div>
              <div className="row">
                <label className="small"><input type="checkbox" checked={types.includes('typein')} onChange={() => setTypes(toggle(types, 'typein'))} /> Type-in only</label>
                <label className="small"><input type="checkbox" checked={types.includes('mc')} onChange={() => setTypes(toggle(types, 'mc'))} /> Multiple choice only</label>
              </div>
            </div>
          )}
        </>
      ) : kind === 'forms' ? (
        <FormsSource value={formsConfig} onChange={setFormsConfig} />
      ) : (
        <>
          <label className="field">
            <span>Vocab list</span>
            <select className="select" value={listId} onChange={e => setListId(e.target.value)}>
              <option value="">Choose a list…</option>
              {lists.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </label>
          <div className="row">
            <label><input type="checkbox" checked={directions.includes('l2e')} onChange={() => setDirections(toggle(directions, 'l2e'))} /> Latin → English (multiple choice)</label>
            <label><input type="checkbox" checked={directions.includes('e2l')} onChange={() => setDirections(toggle(directions, 'e2l'))} /> English → Latin (type-in)</label>
          </div>
        </>
      )}

      {mode === 'test' && kind === 'modules' && (
        <p className="pill warn" role="note">
          Built-in module questions also appear in solo practice, so students can look these answers up. Use them for
          low-stakes quizzes; for a secure test, use your own vocab list.
        </p>
      )}

      <p className="muted" data-testid="pool-size">Pool: {poolSize} questions</p>
      {kind === 'forms' && poolSize > 0 && (
        <p className="muted" data-testid="points-per-attempt">
          Points per attempt: {pointsLabel}
        </p>
      )}

      <div className="row">
        <label className="field">
          <span>Questions per attempt</span>
          <input className="input" type="number" min={1} max={poolSize || 1} value={count === '' ? defaultCount : count} onChange={e => setCount(e.target.value)} />
        </label>
        <label className="field">
          <span>Due (optional)</span>
          <input className="input" type="datetime-local" value={dueAt} onChange={e => setDueAt(e.target.value)} />
        </label>
        <label className="field">
          <span>Max attempts (blank = unlimited)</span>
          <input className="input" type="number" min={1} value={maxAttempts} onChange={e => setMaxAttempts(e.target.value)} />
        </label>
        {mode === 'test' && (
          <label className="field">
            <span>Time limit in minutes (optional)</span>
            <input className="input" type="number" min={1} value={timeLimitMin} onChange={e => setTimeLimitMin(e.target.value)} />
          </label>
        )}
      </div>
      {mode === 'test' && (
        <label className="small">
          <input type="checkbox" checked={reveal} onChange={e => setReveal(e.target.checked)} /> Show students the correct
          answers after the due date or once a student has used all attempts
        </label>
      )}

      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="row-end">
        <button className="btn-primary" disabled={!canPublish} onClick={publish}>{busy ? 'Publishing…' : 'Publish assignment'}</button>
      </div>
    </div>
  );
}
