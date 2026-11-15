import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuestionCard } from './QuestionCard';

describe('QuestionCard hint labels', () => {
  it('calls a plain hint a hint', async () => {
    render(<QuestionCard badge="B" prompt="p" hint="Starts with a" />);
    expect(screen.getByText('Tap the card for a hint')).toBeInTheDocument();
    await userEvent.click(screen.getByText('B'));
    expect(screen.getByText('Hint:')).toBeInTheDocument();
  });
  it('calls a definition a definition', async () => {
    render(<QuestionCard badge="B" prompt="p" hint="to love" hintKind="definition" />);
    expect(screen.getByText('Tap the card to see the definition')).toBeInTheDocument();
    await userEvent.click(screen.getByText('B'));
    expect(screen.getByText('Definition:')).toBeInTheDocument();
    expect(screen.getByText('to love')).toBeInTheDocument();
  });
});
