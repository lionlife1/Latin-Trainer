import { useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft } from '../../components/icons';
import { lessonFor } from '../../content/lessons';
import type { LessonBlock } from '../../content/lessons/types';
import { MODULES } from '../../content/modules';
import { renderInline } from '../../lib/inline';
import { markLessonRead } from './lessonStore';

function Block({ block }: { block: LessonBlock }) {
  switch (block.kind) {
    case 'p':
      return <p className="lesson-p">{renderInline(block.text)}</p>;
    case 'table':
      return (
        <div className="lesson-table-wrap">
          <table className="lesson-table">
            {block.caption && <caption>{renderInline(block.caption)}</caption>}
            <thead>
              <tr>{block.head.map((h, i) => <th key={i}>{renderInline(h)}</th>)}</tr>
            </thead>
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={r}>{row.map((c, i) => <td key={i}>{renderInline(c)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'examples':
      return (
        <ul className="lesson-examples">
          {block.items.map((it, i) => (
            <li key={i}>
              <div className="lesson-la" lang="la">{renderInline(it.la)}</div>
              <div className="lesson-en">{renderInline(it.en)}</div>
              {it.note && <div className="lesson-note">{renderInline(it.note)}</div>}
            </li>
          ))}
        </ul>
      );
    case 'tip':
      return (
        <aside className="lesson-tip">
          {block.title && <strong>{renderInline(block.title)}</strong>}
          <div>{renderInline(block.text)}</div>
        </aside>
      );
  }
}

/** The short reading lesson for one grammar module. Rendered without the shell (focus mode). */
export function LessonRoute() {
  const { moduleId = '' } = useParams();
  const navigate = useNavigate();
  const mod = MODULES.find(m => m.id === moduleId);
  const lesson = mod ? lessonFor(mod.id) : undefined;

  useEffect(() => {
    if (lesson) markLessonRead(moduleId);
  }, [lesson, moduleId]);

  const modulePath = `/practice/grammar/${moduleId}`;
  if (!mod || !lesson) return <Navigate to={modulePath} replace />;

  return (
    <div className="screen active" style={{ padding: '0 16px' }}>
      <div className="intro-card lesson">
        <button className="btn-back" onClick={() => navigate(modulePath)}><ChevronLeft size={18} />{mod.title}</button>
        <div className="intro-module-badge">{mod.badge}</div>
        <h1 className="intro-title">{lesson.title}</h1>
        <p className="intro-desc">{renderInline(lesson.summary)}</p>
        {lesson.sections.map((s, i) => (
          <section key={i}>
            <h2 className="lesson-heading">{s.heading}</h2>
            {s.blocks.map((b, j) => <Block key={j} block={b} />)}
          </section>
        ))}
        <button className="btn-primary" onClick={() => navigate(modulePath)}>Practise this module</button>
      </div>
    </div>
  );
}
