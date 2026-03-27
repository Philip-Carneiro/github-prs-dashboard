import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CheckStatusIndicator } from '../components/CheckStatusIndicator';
import type { CheckStatus } from '../types';

describe('CheckStatusIndicator', () => {
  const cases: { status: CheckStatus; label: string; className: string }[] = [
    { status: 'passed', label: 'Passed', className: 'check-passed' },
    { status: 'failed', label: 'Failed', className: 'check-failed' },
    { status: 'pending', label: 'Pending', className: 'check-pending' },
    { status: 'none', label: 'No checks', className: 'check-none' },
  ];

  cases.forEach(({ status, label, className }) => {
    it(`renders "${label}" with class "${className}" for status "${status}"`, () => {
      render(<CheckStatusIndicator status={status} />);

      const element = screen.getByText(label);
      expect(element).toBeInTheDocument();
      expect(element).toHaveClass('check-status', className);
    });
  });
});
