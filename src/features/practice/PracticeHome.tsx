import { Link, useNavigate } from 'react-router-dom';
import { Cards, ChevronRight, Layers, Translate } from '../../components/icons';
import { MODULES } from '../../content/modules';
import { loadProgress, loadStreak, loadTotalXP, todayISO } from '../solo/progressStore';
import { relativeDay } from './relativeDay';
import { loadSessions, pct, type PracticeSession } from './sessionLog';
import { useSyncVersion } from './useSessionSync';

const titleOf = (s: PracticeSession) =>
  s.kind === 'endless' ? 'Endless Train' : MODULES.find(m => m.id === s.module_id)?.title ?? 'Grammar module';

const scoreClass = (p: number) => (p >= 80 ? 'good' : p >= 60 ? 'mid' : 'low');

/** A streak only counts if its last day is today or yesterday. */
function liveStreak() {
  const s = loadStreak();
  const y = new Date();
  y.setUTCDate(y.getUTCDate() - 1);
  return s.lastDate === todayISO() || s.lastDate === todayISO(y) ? s.count : 0;
}

export function PracticeHome() {
  useSyncVersion();
  const navigate = useNavigate();
  const progress = loadProgress();
  const done = MODULES.filter(m => progress[m.id]?.completed).length;
  const recents = loadSessions().filter(s => s.kind !== 'import').slice(0, 5);
  const streak = liveStreak();

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Practice</h1>
          <p>Work on your own, at your own pace.</p>
        </div>
      </div>

      <div className="stats">
        <div className="stat"><div className="stat-val">{streak}</div><div className="stat-label">Day streak</div></div>
        <div className="stat"><div className="stat-val">{loadTotalXP()}</div><div className="stat-label">XP</div></div>
        <div className="stat"><div className="stat-val">{done}/{MODULES.length}</div><div className="stat-label">Modules done</div></div>
      </div>

      <section className="section">
        <h2>Recent sessions</h2>
        <div className="panel">
          {recents.length === 0 ? (
            <p className="empty">Your practice sessions will show up here.</p>
          ) : (
            <ul className="rows">
              {recents.map(s => {
                const p = pct(s);
                const open = () => navigate(s.kind === 'endless' ? '/practice/endless' : `/practice/grammar/${s.module_id}`);
                return (
                  <li key={s.id}>
                    <button className="row-item" onClick={open}>
                      <span className="row-main">
                        <span className="row-title" style={{ display: 'block' }}>{titleOf(s)}</span>
                        <span className="row-sub">{relativeDay(s.finished_at)} · {s.correct}/{s.total} correct</span>
                      </span>
                      <span className="row-side">
                        <span className={`score ${scoreClass(p)}`}>{p}%</span>
                        <ChevronRight size={18} />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <section className="section">
        <h2>Subjects</h2>
        <div className="subjects">
          <Link className="subject" to="/practice/grammar">
            <span className="subject-icon"><Layers /></span>
            <span className="subject-title">Grammar</span>
            <span className="subject-sub">{done} of {MODULES.length} modules complete</span>
          </Link>
          <div className="subject soon" aria-disabled="true">
            <span className="subject-icon"><Cards /></span>
            <span className="subject-title">Vocab</span>
            <span className="subject-sub">Coming soon</span>
          </div>
          <div className="subject soon" aria-disabled="true">
            <span className="subject-icon"><Translate /></span>
            <span className="subject-title">Translation</span>
            <span className="subject-sub">Coming soon</span>
          </div>
        </div>
      </section>
    </>
  );
}
