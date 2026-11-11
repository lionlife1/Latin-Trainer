import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { MODULES } from '../../content/modules';
import type { Lesson } from '../../content/lessons/types';
import { ModuleIntro } from '../solo/ModuleIntro';
import { LessonRoute } from './LessonRoute';
import { hasReadLesson, markLessonRead } from './lessonStore';

const mod = MODULES[0];
const fixture: Lesson = {
  moduleId: mod.id,
  title: 'Fixture Lesson Title',
  summary: 'A *short* summary.',
  sections: [
    { heading: 'First section', blocks: [
      { kind: 'p', text: 'Plain with **bold** and *italic* words.' },
      { kind: 'table', caption: 'Endings', head: ['Case', 'Ending'], rows: [['Nom.', '*-us*'], ['Acc.', '-um']] },
    ] },
    { heading: 'Second section', blocks: [
      { kind: 'examples', items: [{ la: 'Puella *canit*.', en: 'The girl sings.', note: 'Present tense.' }] },
      { kind: 'tip', title: 'Remember', text: 'Watch the mood.' },
    ] },
  ],
  check: [],
};

vi.mock('../../content/lessons', () => ({
  lessonFor: (id: string) => (id === MODULES[0].id ? fixture : undefined),
  LESSONS: {},
}));

function Where() {
  const loc = useLocation();
  return <div data-testid="where">{loc.pathname}</div>;
}

const lessonAt = (id: string) => render(
  <MemoryRouter initialEntries={[`/practice/grammar/${id}/lesson`]}>
    <Routes>
      <Route path="/practice/grammar/:moduleId/lesson" element={<LessonRoute />} />
      <Route path="/practice/grammar/:moduleId" element={<Where />} />
      <Route path="/practice/grammar" element={<Where />} />
    </Routes>
  </MemoryRouter>,
);

beforeEach(() => localStorage.clear());

describe('LessonRoute', () => {
  it('renders title, sections, table, examples with lang="la" and a tip', () => {
    const { container } = lessonAt(mod.id);
    expect(screen.getByRole('heading', { level: 1, name: 'Fixture Lesson Title' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'First section' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Second section' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Case' })).toBeInTheDocument();
    expect(screen.getByText('Endings')).toBeInTheDocument();
    expect(container.querySelector('.lesson-table-wrap table.lesson-table')).not.toBeNull();
    const la = container.querySelector('.lesson-la');
    expect(la).toHaveAttribute('lang', 'la');
    expect(screen.getByText('The girl sings.')).toBeInTheDocument();
    expect(screen.getByText('Present tense.')).toBeInTheDocument();
    const tip = container.querySelector('aside.lesson-tip') as HTMLElement;
    expect(within(tip).getByText('Remember')).toBeInTheDocument();
    expect(within(tip).getByText('Watch the mood.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: mod.title })).toBeInTheDocument();
  });

  it('renders *x* as emphasis and **x** as strong, in prose and table cells', () => {
    const { container } = lessonAt(mod.id);
    expect(screen.getByText('italic').tagName).toBe('EM');
    expect(screen.getByText('bold').tagName).toBe('STRONG');
    expect(container.querySelector('.lesson-table td em')?.textContent).toBe('-us');
    expect(screen.getByText('canit').tagName).toBe('EM');
  });

  it('marks the lesson read', () => {
    expect(hasReadLesson(mod.id)).toBe(false);
    lessonAt(mod.id);
    expect(hasReadLesson(mod.id)).toBe(true);
  });

  it('"Practise this module" and the back button go to the module route', async () => {
    const user = userEvent.setup();
    const { unmount } = lessonAt(mod.id);
    await user.click(screen.getByRole('button', { name: 'Practise this module' }));
    expect(screen.getByTestId('where')).toHaveTextContent(`/practice/grammar/${mod.id}`);
    unmount();
    lessonAt(mod.id);
    await user.click(screen.getByRole('button', { name: mod.title }));
    expect(screen.getByTestId('where')).toHaveTextContent(`/practice/grammar/${mod.id}`);
  });

  it('redirects to the module route when the module has no lesson', () => {
    lessonAt(MODULES[1].id);
    expect(screen.getByTestId('where')).toHaveTextContent(`/practice/grammar/${MODULES[1].id}`);
    expect(hasReadLesson(MODULES[1].id)).toBe(false);
  });

  it('redirects an unknown module id to its module route', () => {
    lessonAt('no_such_module');
    expect(screen.getByTestId('where')).toHaveTextContent('/practice/grammar/no_such_module');
  });
});

describe('ModuleIntro lesson button', () => {
  const intro = (m: typeof mod, onLesson?: () => void) =>
    render(<ModuleIntro mod={m} onBack={() => {}} onStart={() => {}} onLesson={onLesson} />);

  it('shows "Read the lesson" only when a lesson exists and onLesson is passed', async () => {
    const onLesson = vi.fn();
    const { unmount } = intro(mod, onLesson);
    await userEvent.click(screen.getByRole('button', { name: 'Read the lesson' }));
    expect(onLesson).toHaveBeenCalledOnce();
    unmount();
    const second = intro(MODULES[1], onLesson);
    expect(screen.queryByRole('button', { name: /the lesson/ })).toBeNull();
    second.unmount();
    intro(mod);
    expect(screen.queryByRole('button', { name: /the lesson/ })).toBeNull();
  });

  it('says "Review the lesson" after it has been read', () => {
    markLessonRead(mod.id);
    intro(mod, () => {});
    expect(screen.getByRole('button', { name: 'Review the lesson' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Read the lesson' })).toBeNull();
  });
});
