import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { LatinField } from './LatinField';

function Harness({ shortcut, multiline }: { shortcut?: boolean; multiline?: boolean }) {
  const [v, setV] = useState('');
  return multiline
    ? <LatinField multiline aria-label="Latin" value={v} onValueChange={setV} shortcut={shortcut} />
    : <LatinField aria-label="Latin" value={v} onValueChange={setV} shortcut={shortcut} />;
}

describe('LatinField', () => {
  it('inserts a long vowel at the caret from the button row', async () => {
    render(<Harness />);
    const field = screen.getByLabelText('Latin') as HTMLInputElement;
    await userEvent.type(field, 'amo');
    field.setSelectionRange(2, 2);
    await userEvent.click(screen.getByRole('button', { name: 'Insert ā' }));
    expect(field).toHaveValue('amāo');
    expect(field.selectionStart).toBe(3);
    expect(field).toHaveFocus();
  });

  it('replaces a selected vowel', async () => {
    render(<Harness />);
    const field = screen.getByLabelText('Latin') as HTMLInputElement;
    await userEvent.type(field, 'amo');
    field.setSelectionRange(2, 3);
    await userEvent.click(screen.getByRole('button', { name: 'Insert ō' }));
    expect(field).toHaveValue('amō');
  });

  it('turns a= into ā and leaves other = alone', async () => {
    render(<Harness />);
    const field = screen.getByLabelText('Latin');
    await userEvent.type(field, 'ro=ma= x=');
    expect(field).toHaveValue('rōmā x=');
  });

  it('has no shortcut where = is a separator', async () => {
    render(<Harness shortcut={false} multiline />);
    const field = screen.getByLabelText('Latin');
    await userEvent.type(field, 'puella=girl');
    expect(field).toHaveValue('puella=girl');
    expect(screen.queryByText(/a= for ā/)).not.toBeInTheDocument();
    expect(screen.getByRole('group', { name: /long vowel/i })).toBeInTheDocument();
  });
});
