import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import type { FormsAssignmentConfig } from '../../lib/formsItems';
import { DEFAULT_FORMS_ASSIGNMENT, FormsSource, toStoredFormsConfig } from './FormsSource';

let latest: FormsAssignmentConfig;
function Harness() {
  const [v, setV] = useState<FormsAssignmentConfig>(DEFAULT_FORMS_ASSIGNMENT);
  latest = v;
  return <FormsSource value={v} onChange={setV} />;
}

describe('FormsSource', () => {
  it('defaults to a synopsis with no words and "Different for each student"', () => {
    render(<Harness />);
    expect(latest).toMatchObject({ kind: 'synopsis', words: [], personNumber: 'all' });
    expect(screen.getByLabelText(/person and number/i)).toHaveValue('all');
  });

  it('searches verbs, adds a chip, removes it', async () => {
    render(<Harness />);
    await userEvent.type(screen.getByLabelText(/find a verb/i), 'moneo');
    await userEvent.click(screen.getAllByRole('button', { name: /^moneo, monere/ })[0]);
    expect(latest.kind === 'synopsis' && latest.words).toHaveLength(1);
    await userEvent.click(screen.getByRole('button', { name: /^remove moneo/i }));
    expect(latest.kind === 'synopsis' && latest.words).toHaveLength(0);
  });

  it('adds 5 random words', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: /add 5 random/i }));
    expect(latest.kind === 'synopsis' && latest.words).toHaveLength(5);
  });

  it('shows the parse filters and the question count', async () => {
    render(<Harness />);
    await userEvent.selectOptions(screen.getByLabelText(/kind of question/i), 'parse');
    expect(latest.kind).toBe('parse');
    expect(screen.getByLabelText(/number of questions/i)).toHaveValue(10);
    expect(screen.queryByText('Question style')).not.toBeInTheDocument();
    expect(screen.getByText('Mood')).toBeInTheDocument();
  });

  it('stores words as key and entry', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: /add 5 random/i }));
    const stored = toStoredFormsConfig(latest);
    expect(stored.words?.[0]).toEqual({ key: expect.stringMatching(/^verb:/), entry: expect.any(String) });
  });
});
