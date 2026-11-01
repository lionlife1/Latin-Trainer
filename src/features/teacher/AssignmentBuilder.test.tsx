import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { MODULES } from '../../content/modules';

const publishAssignment = vi.fn();
vi.mock('./api', () => ({
  listVocabLists: () => Promise.resolve([]),
  loadVocabItems: () => Promise.resolve([]),
  loadFallbackLexicon: () => Promise.resolve([]),
  publishAssignment: (...a: unknown[]) => publishAssignment(...a),
}));

import { AssignmentBuilder } from './AssignmentBuilder';

const renderBuilder = () =>
  render(
    <MemoryRouter>
      <AssignmentBuilder classId="c1" onPublished={() => {}} />
    </MemoryRouter>,
  );

describe('AssignmentBuilder', () => {
  beforeEach(() => publishAssignment.mockReset().mockResolvedValue({ ok: true, id: 'a1' }));

  it('shows the pool size of the selected modules and filters by badge', async () => {
    renderBuilder();
    await userEvent.click(screen.getByLabelText(new RegExp(MODULES[0].title)));
    await userEvent.click(screen.getByLabelText(new RegExp(MODULES[1].title)));
    const total = MODULES[0].questions.length + MODULES[1].questions.length;
    expect(screen.getByTestId('pool-size')).toHaveTextContent(`${total} questions`);
    await userEvent.click(screen.getByLabelText('CONJUGATE'));
    const conj = [...MODULES[0].questions, ...MODULES[1].questions].filter(q => q.badge === 'CONJUGATE').length;
    expect(screen.getByTestId('pool-size')).toHaveTextContent(`${conj} questions`);
  });

  it('disables publish when the pool is empty', async () => {
    renderBuilder();
    await userEvent.type(screen.getByLabelText(/title/i), 'Homework');
    expect(screen.getByRole('button', { name: /publish/i })).toBeDisabled();
  });

  it('shows the time limit only in test mode', async () => {
    renderBuilder();
    expect(screen.queryByLabelText(/time limit/i)).not.toBeInTheDocument();
    await userEvent.click(screen.getByLabelText(/^test/i));
    expect(screen.getByLabelText(/time limit/i)).toBeInTheDocument();
  });

  it('defaults tests to one attempt and warns that module answers are public', async () => {
    renderBuilder();
    expect(screen.queryByText(/students can look these answers up/i)).not.toBeInTheDocument();
    await userEvent.click(screen.getByLabelText(/^test/i));
    expect(screen.getByLabelText(/max attempts/i)).toHaveValue(1);
    expect(screen.getByText(/students can look these answers up/i)).toBeInTheDocument();
    expect(screen.getByText(/after the due date or once a student has used all attempts/i)).toBeInTheDocument();
  });

  it('publishes a pool snapshot with answers', async () => {
    renderBuilder();
    await userEvent.type(screen.getByLabelText(/title/i), 'Forms quiz');
    await userEvent.click(screen.getByLabelText(new RegExp(MODULES[0].title)));
    await userEvent.click(screen.getByRole('button', { name: /publish/i }));
    const [input, pool] = publishAssignment.mock.calls[0];
    expect(input).toMatchObject({ classId: 'c1', title: 'Forms quiz', mode: 'practice', questionCount: 20 });
    expect(input.source).toEqual({ kind: 'modules', moduleIds: [MODULES[0].id] });
    expect(pool).toHaveLength(MODULES[0].questions.length);
    expect(pool[0]).toEqual({ item_key: MODULES[0].questions[0].id, question: MODULES[0].questions[0] });
  });
});
