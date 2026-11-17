import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { MODULES } from '../../content/modules';
import { prevDay, todayISO } from '../solo/progressStore';
import type { DrillResult } from '../drill/useDrill';
import { ModuleRoute } from './ModuleRoute';

const mod = MODULES[0];
let answers: boolean[] = [];
let autoFinish = true;

// Finishes immediately with the scripted answers, so the test covers only the summary note.
vi.mock('../drill/DrillSession', async () => {
  const React = await import('react');
  return {
    DrillSession: ({ questions, onFinish }: { questions: { id: string }[]; onFinish: (r: DrillResult[]) => void }) => {
      React.useEffect(() => {
        if (autoFinish) onFinish(answers.map((correct, i) => ({ q: questions[i] as never, given: 'x', correct })));
      }, []); // eslint-disable-line react-hooks/exhaustive-deps
      return autoFinish ? null : React.createElement('div', null, `drill of ${questions.length}`);
    },
  };
});

function renderRoute() {
  render(
    <MemoryRouter initialEntries={[`/practice/grammar/${mod.id}`]}>
      <Routes><Route path="/practice/grammar/:moduleId" element={<ModuleRoute />} /></Routes>
    </MemoryRouter>,
  );
}

async function runSession(correct: boolean[]) {
  answers = correct;
  renderRoute();
  await userEvent.click(screen.getByRole('button', { name: 'Start session' }));
}

beforeEach(() => {
  localStorage.clear();
  autoFinish = true;
});

describe('ModuleRoute status line', () => {
  it('says the module is complete when this session completes it', async () => {
    await runSession(Array(10).fill(true));
    expect(screen.getByText(/Module complete\. You earned \d+ XP\./)).toBeInTheDocument();
  });

  it('gives the 70% hint when a first session does not complete the module', async () => {
    await runSession([false, false]);
    expect(screen.getByText(/Score 70% or more on \d+\+ questions to complete this module\./)).toBeInTheDocument();
  });

  it('says the module is already complete after a short session on a finished module', async () => {
    localStorage.setItem('latiniq_progress', JSON.stringify({ [mod.id]: { completed: true, xp: 10 } }));
    await runSession([false]);
    expect(screen.getByText('This module is already complete.')).toBeInTheDocument();
    expect(screen.queryByText(/Score 70% or more/)).not.toBeInTheDocument();
  });
});

describe('ModuleRoute review of stored mistakes', () => {
  it('offers a review button that drills exactly the stored mistakes', async () => {
    autoFinish = false;
    const ids = [mod.questions[0].id, mod.questions[1].id, 'not-in-module'];
    localStorage.setItem('latiniq_progress', JSON.stringify({ [mod.id]: { wrong_ids: ids } }));
    renderRoute();
    await userEvent.click(screen.getByRole('button', { name: 'Review 2 mistakes' }));
    expect(screen.getByText('drill of 2')).toBeInTheDocument();
  });

  it('says "1 mistake" for a single one and hides the button with none', async () => {
    localStorage.setItem('latiniq_progress', JSON.stringify({ [mod.id]: { wrong_ids: [mod.questions[0].id] } }));
    renderRoute();
    expect(screen.getByRole('button', { name: 'Review 1 mistake' })).toBeInTheDocument();
  });

  it('shows no review button without stored mistakes', () => {
    renderRoute();
    expect(screen.queryByRole('button', { name: /^Review \d+ mistake/ })).not.toBeInTheDocument();
  });
});

describe('ModuleRoute streak line', () => {
  it('shows the streak day when the session extends a streak', async () => {
    localStorage.setItem('latiniq_streak', JSON.stringify({ lastDate: prevDay(todayISO()), count: 4 }));
    await runSession([true, false]);
    expect(screen.getByText('Day 5 of your streak.')).toBeInTheDocument();
  });

  it('shows no streak line without a stored streak', async () => {
    await runSession([true, false]);
    expect(screen.queryByText(/of your streak/)).not.toBeInTheDocument();
  });
});
