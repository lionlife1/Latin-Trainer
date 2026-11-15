import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { MODULES } from '../../content/modules';
import type { DrillResult } from '../drill/useDrill';
import { ModuleRoute } from './ModuleRoute';

const mod = MODULES[0];
let answers: boolean[] = [];

// Finishes immediately with the scripted answers, so the test covers only the summary note.
vi.mock('../drill/DrillSession', async () => {
  const React = await import('react');
  return {
    DrillSession: ({ questions, onFinish }: { questions: { id: string }[]; onFinish: (r: DrillResult[]) => void }) => {
      React.useEffect(() => {
        onFinish(answers.map((correct, i) => ({ q: questions[i] as never, given: 'x', correct })));
      }, []); // eslint-disable-line react-hooks/exhaustive-deps
      return null;
    },
  };
});

async function runSession(correct: boolean[]) {
  answers = correct;
  render(
    <MemoryRouter initialEntries={[`/practice/grammar/${mod.id}`]}>
      <Routes><Route path="/practice/grammar/:moduleId" element={<ModuleRoute />} /></Routes>
    </MemoryRouter>,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Start session' }));
}

beforeEach(() => localStorage.clear());

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
