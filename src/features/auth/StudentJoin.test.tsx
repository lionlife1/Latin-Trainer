import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const joinClass = vi.fn();
vi.mock('./api', () => ({ joinClass: (...a: unknown[]) => joinClass(...a) }));

import { StudentJoin } from './StudentJoin';

async function fill(code: string, name: string, pin: string) {
  await userEvent.type(screen.getByLabelText(/class code/i), code);
  await userEvent.type(screen.getByLabelText(/your name/i), name);
  await userEvent.type(screen.getByLabelText(/pin/i), pin);
  await userEvent.click(screen.getByRole('button', { name: /join/i }));
}

describe('StudentJoin', () => {
  beforeEach(() => joinClass.mockReset());

  it('shows the server error when the name is taken', async () => {
    joinClass.mockResolvedValue({ ok: false, error: 'That name is taken in this class' });
    render(<MemoryRouter><StudentJoin /></MemoryRouter>);
    await fill('aaaaaa', 'Marcus', '123456');
    expect(await screen.findByText('That name is taken in this class')).toBeInTheDocument();
  });

  it('validates the PIN before calling the server', async () => {
    render(<MemoryRouter><StudentJoin /></MemoryRouter>);
    await fill('aaaaaa', 'Marcus', '12');
    expect(screen.getByText('PIN must be 6 digits')).toBeInTheDocument();
    expect(joinClass).not.toHaveBeenCalled();
  });
});
