import { Link } from 'react-router-dom';
import { Check, Repeat } from '../../components/icons';
import { MODULES } from '../../content/modules';
import type { ModuleMeta } from '../../lib/types';
import { loadProgress, type Progress } from '../solo/progressStore';
import { bestScores, loadSessions } from './sessionLog';
import { useSyncVersion } from './useSessionSync';

export type NodeState = 'complete' | 'practiced' | 'new';

export function nodeState(mod: ModuleMeta, progress: Progress, best: Record<string, number>): NodeState {
  if (progress[mod.id]?.completed) return 'complete';
  return best[mod.id] !== undefined ? 'practiced' : 'new';
}

export function GrammarPath() {
  useSyncVersion(); // re-render after a sync rebuilds progress
  const progress = loadProgress();
  const best = bestScores(loadSessions());
  const states = MODULES.map(m => nodeState(m, progress, best));
  const nextIdx = states.findIndex(s => s !== 'complete');
  const done = states.filter(s => s === 'complete').length;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Grammar</h1>
          <p>The subjunctive, from forms to clauses. {done} of {MODULES.length} complete.</p>
        </div>
        <Link className="btn-secondary" to="/practice/endless"><Repeat size={18} />Endless Train</Link>
      </div>

      <ol className="path">
        {MODULES.map((mod, i) => {
          const state = states[i];
          const status =
            state === 'complete' ? `Complete${best[mod.id] !== undefined ? ` · best ${best[mod.id]}%` : ''}`
            : state === 'practiced' ? `Best ${best[mod.id]}%`
            : 'Not started';
          return (
            <li key={mod.id} className={`path-step${i === nextIdx ? ' next' : ''}`} data-state={state}>
              <Link className="path-link" to={`/practice/grammar/${mod.id}`}>
                <span className={`node ${state}`} aria-hidden="true">
                  {state === 'complete' ? <Check size={20} /> : mod.badge}
                </span>
                <span className="path-text">
                  <span className="path-title">{mod.title}</span>
                  {i === nextIdx && <> <span className="tag info">Up next</span></>}
                  <span className="path-sub" style={{ display: 'block' }}>{mod.tagline}</span>
                </span>
                <span className={`path-status${state !== 'new' ? ' always' : ''}`}>{status}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </>
  );
}
