import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { AssignmentRow } from './api';
import type { PoolItem } from '../../lib/vocab';

const assignment = { id: 'a1', class_id: 'c1', title: 'Ch. 3 quiz', question_count: 3 } as AssignmentRow;
const pool: PoolItem[] = [
  {
    item_key: 'vocab:1:l2e',
    question: {
      id: 'vocab:1:l2e', type: 'mc', badge: 'VOCAB · MEANING',
      prompt: "What does <span class='latin-word'>videō</span> mean?",
      choices: ['to see', 'to lead', 'to send', 'war &amp; peace'], correct: 'to see',
    },
  },
  {
    item_key: 'vocab:2:e2l',
    question: { id: 'vocab:2:e2l', type: 'typein', badge: 'VOCAB · LATIN', prompt: 'Give the Latin word for: <strong>girl</strong>', answers: ['puella'] },
  },
  {
    item_key: 'vocab:3:e2l',
    question: { id: 'vocab:3:e2l', type: 'typein', badge: 'VOCAB · LATIN', prompt: 'Give the Latin word for: <strong>king</strong>', answers: ['rēx'] },
  },
  {
    item_key: 'vocab:4:e2l',
    question: { id: 'vocab:4:e2l', type: 'typein', badge: 'VOCAB · LATIN', prompt: 'Give the Latin word for: <strong>road</strong>', answers: ['via'] },
  },
];

vi.mock('./api', () => ({
  getAssignment: () => Promise.resolve(assignment),
  getAssignmentPool: () => Promise.resolve(pool),
}));

import { PrintAssignment } from './PrintAssignment';

const renderPrint = () =>
  render(
    <MemoryRouter initialEntries={['/t/a/a1/print']}>
      <Routes><Route path="/t/a/:assignmentId/print" element={<PrintAssignment />} /></Routes>
    </MemoryRouter>,
  );

describe('PrintAssignment', () => {
  beforeEach(() => { assignment.question_count = 3; });

  it('prints a student copy and a key with the assignment question count', async () => {
    renderPrint();
    const copy = await screen.findByRole('region', { name: 'Student copy' });
    expect(within(copy).getAllByRole('listitem').filter(li => li.classList.contains('print-q'))).toHaveLength(3);
    expect(within(copy).getByText('Name')).toBeInTheDocument();
    const key = screen.getByRole('region', { name: 'Answer key' });
    expect(within(key).getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByText(/3 of 4 questions/)).toBeInTheDocument();
  });

  it('renders prompt and choice HTML the way the runner does', async () => {
    // Use the whole pool so the MC question is always drawn.
    assignment.question_count = 4;
    renderPrint();
    const copy = await screen.findByRole('region', { name: 'Student copy' });
    expect(copy.querySelector('.latin-word')).toHaveTextContent('videō');
    expect(within(copy).getByText('war & peace')).toBeInTheDocument();
    expect(copy).not.toHaveTextContent('&amp;');
    const key = screen.getByRole('region', { name: 'Answer key' });
    expect(within(key).getByText('to see')).toBeInTheDocument();
    expect(within(key).getByText('rēx')).toBeInTheDocument();
  });

  it('makes versions A and B, each with its own key', async () => {
    renderPrint();
    await screen.findByRole('region', { name: 'Student copy' });
    await userEvent.selectOptions(screen.getByLabelText(/versions/i), '2');
    for (const name of ['Student copy, version A', 'Student copy, version B', 'Answer key, version A', 'Answer key, version B']) {
      expect(screen.getByRole('region', { name })).toBeInTheDocument();
    }
    expect(screen.getAllByText('Version A')).toHaveLength(2);
  });

  it('hides the header lines and the keys on request', async () => {
    renderPrint();
    await screen.findByRole('region', { name: 'Student copy' });
    await userEvent.click(screen.getByLabelText(/name, date and class/i));
    await userEvent.click(screen.getByLabelText(/answer keys/i));
    expect(screen.queryByText('Name')).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Answer key' })).not.toBeInTheDocument();
  });

  it('opens the browser print dialog', async () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => {});
    renderPrint();
    await userEvent.click(await screen.findByRole('button', { name: 'Print' }));
    expect(print).toHaveBeenCalled();
  });
});
