import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfigPage } from '../components/ConfigPage';
import type { AppConfig } from '../types';

const emptyConfig: AppConfig = {
  repositories: [],
  authors: [],
  githubToken: '',
};

const populatedConfig: AppConfig = {
  repositories: ['https://github.com/org/repo'],
  authors: ['alice', 'bob'],
  githubToken: 'ghp_test123',
};

describe('ConfigPage', () => {
  it('renders textarea fields and token input', () => {
    render(<ConfigPage config={emptyConfig} onSave={vi.fn()} />);
    expect(screen.getByLabelText(/repositories/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/authors/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/github token/i)).toBeInTheDocument();
  });

  it('renders save button', () => {
    render(<ConfigPage config={emptyConfig} onSave={vi.fn()} />);
    expect(
      screen.getByRole('button', { name: /save/i }),
    ).toBeInTheDocument();
  });

  it('populates fields from config', () => {
    render(<ConfigPage config={populatedConfig} onSave={vi.fn()} />);
    const reposTextarea = screen.getByLabelText(
      /repositories/i,
    ) as HTMLTextAreaElement;
    const authorsTextarea = screen.getByLabelText(
      /authors/i,
    ) as HTMLTextAreaElement;
    const tokenInput = screen.getByLabelText(
      /github token/i,
    ) as HTMLInputElement;

    expect(reposTextarea.value).toBe('https://github.com/org/repo');
    expect(authorsTextarea.value).toBe('@alice\n@bob');
    expect(tokenInput.value).toBe('ghp_test123');
  });

  it('renders token input as password type', () => {
    render(<ConfigPage config={populatedConfig} onSave={vi.fn()} />);
    const tokenInput = screen.getByLabelText(/github token/i) as HTMLInputElement;
    expect(tokenInput.type).toBe('password');
  });

  it('calls onSave with parsed config including token', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();

    render(<ConfigPage config={emptyConfig} onSave={onSave} />);

    const reposTextarea = screen.getByLabelText(/repositories/i);
    const authorsTextarea = screen.getByLabelText(/authors/i);
    const tokenInput = screen.getByLabelText(/github token/i);

    await user.type(reposTextarea, 'https://github.com/org/repo');
    await user.type(authorsTextarea, '@alice');
    await user.type(tokenInput, 'ghp_mytoken');

    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(onSave).toHaveBeenCalledWith({
      repositories: ['https://github.com/org/repo'],
      authors: ['alice'],
      githubToken: 'ghp_mytoken',
    });
  });

  it('shows saved confirmation temporarily', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
    });

    render(<ConfigPage config={emptyConfig} onSave={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(screen.getByText('Saved!')).toBeInTheDocument();

    await act(() => {
      vi.advanceTimersByTime(2500);
    });

    expect(
      screen.getByRole('button', { name: /save configuration/i }),
    ).toBeInTheDocument();

    vi.useRealTimers();
  });
});
