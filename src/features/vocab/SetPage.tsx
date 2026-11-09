import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Cards, ChevronLeft, Layers, Repeat } from '../../components/icons';
import { useSyncVersion } from '../practice/useSessionSync';
import { setCounts } from './scheduler';
import { getSet, loadSrs } from './storage';

const SHOWN = 50;

export function SetPage() {
  useSyncVersion();
  const { setId = '' } = useParams();
  const [all, setAll] = useState(false);
  const set = getSet(setId);
  if (!set) return <Navigate to="/practice/vocab" replace />;

  const counts = setCounts(set, loadSrs(), new Date());
  const n = set.cards.length;
  const both = set.directions.length > 1;
  const directions = both ? 'Both directions' : set.directions[0] === 'e2l' ? 'English to Latin' : 'Latin to English';
  const base = `/practice/vocab/${set.id}`;
  const cards = all ? set.cards : set.cards.slice(0, SHOWN);

  return (
    <>
      <Link className="btn-back" to="/practice/vocab"><ChevronLeft size={18} />All sets</Link>
      <div className="page-head">
        <div>
          <h1>{set.name}</h1>
          <p>{n} {n === 1 ? 'card' : 'cards'} · {directions}</p>
        </div>
        <Link className="btn-secondary" to={`${base}/edit`}>Edit set</Link>
      </div>

      {/* QuizletExport (Task 11) */}

      <div className="stats">
        <div className="stat"><div className="stat-val">{counts.new}</div><div className="stat-label">New</div></div>
        <div className="stat"><div className="stat-val">{counts.due}</div><div className="stat-label">Due today</div></div>
        <div className="stat"><div className="stat-val">{counts.learned}</div><div className="stat-label">Learned</div></div>
      </div>

      {n === 0 ? (
        <section className="section">
          <div className="panel">
            <p className="empty">This set has no cards yet.</p>
            <Link className="btn-primary" to={`${base}/edit`}>Add cards</Link>
          </div>
        </section>
      ) : (
        <section className="section">
          <h2>Study</h2>
          <p className="muted">Review and Flashcards decide when each word comes back. Learn is extra practice and changes nothing.</p>
          <div className="subjects">
            <Link className="subject" to={`${base}/review`}>
              <span className="subject-icon"><Repeat /></span>
              <span className="subject-title">Review</span>
              <span className="subject-sub">
                {counts.due || counts.newToday ? `${counts.due} due · ${counts.newToday} new` : 'All caught up for today'}
              </span>
            </Link>
            <Link className="subject" to={`${base}/learn`}>
              <span className="subject-icon"><Layers /></span>
              <span className="subject-title">Learn</span>
              <span className="subject-sub">Multiple choice practice</span>
            </Link>
            <Link className="subject" to={`${base}/flashcards`}>
              <span className="subject-icon"><Cards /></span>
              <span className="subject-title">Flashcards</span>
              <span className="subject-sub">Flip each card and rate yourself</span>
            </Link>
          </div>
        </section>
      )}

      {n > 0 && (
        <section className="section">
          <h2>Cards</h2>
          <div className="panel">
            <ul className="rows">
              {cards.map(c => (
                <li key={c.id}>
                  <div className="row-item">
                    <span className="row-main">
                      <span className="row-title" style={{ display: 'block' }}>{c.latin}</span>
                      <span className="row-sub">{c.english}</span>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {!all && n > SHOWN && <button className="btn-ghost" onClick={() => setAll(true)}>Show all {n} cards</button>}
        </section>
      )}
    </>
  );
}
