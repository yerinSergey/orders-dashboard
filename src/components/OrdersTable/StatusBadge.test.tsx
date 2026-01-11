import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { lightTheme } from '@/theme/theme';
import { StatusBadge } from './StatusBadge';
import { ORDER_STATUSES, STATUS_LABELS, STATUS_COLORS } from '@/features/orders/constants';
import type { OrderStatus } from '@/features/orders/types';

function TestWrapper({ children }: { children: React.ReactNode }) {
  return <MuiThemeProvider theme={lightTheme}>{children}</MuiThemeProvider>;
}

describe('StatusBadge', () => {
  // TEST-08: Status badge colors
  describe('status rendering', () => {
    it.each(ORDER_STATUSES)('renders %s status with correct label', (status) => {
      render(<StatusBadge status={status} />, { wrapper: TestWrapper });

      expect(screen.getByText(STATUS_LABELS[status])).toBeInTheDocument();
    });

    it.each(ORDER_STATUSES)('renders %s status with correct aria-label', (status) => {
      render(<StatusBadge status={status} />, { wrapper: TestWrapper });

      expect(
        screen.getByLabelText(`Order status: ${STATUS_LABELS[status]}`)
      ).toBeInTheDocument();
    });
  });

  describe('color mapping', () => {
    const statusColorMapping: Array<{ status: OrderStatus; expectedColor: string }> = [
      { status: 'pending', expectedColor: 'warning' },
      { status: 'processing', expectedColor: 'info' },
      { status: 'shipped', expectedColor: 'primary' },
      { status: 'delivered', expectedColor: 'success' },
      { status: 'cancelled', expectedColor: 'error' },
    ];

    it.each(statusColorMapping)(
      'applies $expectedColor color for $status status',
      ({ status, expectedColor }) => {
        render(<StatusBadge status={status} />, { wrapper: TestWrapper });

        const chip = screen.getByText(STATUS_LABELS[status]);
        // MUI Chip adds color class like "MuiChip-colorWarning"
        expect(chip.closest('.MuiChip-root')).toHaveClass(
          `MuiChip-color${expectedColor.charAt(0).toUpperCase()}${expectedColor.slice(1)}`
        );
      }
    );

    it('has consistent color mapping with constants', () => {
      // Verify STATUS_COLORS matches expected values
      expect(STATUS_COLORS.pending).toBe('warning');
      expect(STATUS_COLORS.processing).toBe('info');
      expect(STATUS_COLORS.shipped).toBe('primary');
      expect(STATUS_COLORS.delivered).toBe('success');
      expect(STATUS_COLORS.cancelled).toBe('error');
    });
  });

  describe('size variants', () => {
    it('renders small size by default', () => {
      render(<StatusBadge status="pending" />, { wrapper: TestWrapper });

      const chip = screen.getByText(STATUS_LABELS.pending).closest('.MuiChip-root');
      expect(chip).toHaveClass('MuiChip-sizeSmall');
    });

    it('renders medium size when specified', () => {
      render(<StatusBadge status="pending" size="medium" />, { wrapper: TestWrapper });

      const chip = screen.getByText(STATUS_LABELS.pending).closest('.MuiChip-root');
      expect(chip).toHaveClass('MuiChip-sizeMedium');
    });
  });

  describe('accessibility', () => {
    it('provides descriptive aria-label for screen readers', () => {
      render(<StatusBadge status="shipped" />, { wrapper: TestWrapper });

      const badge = screen.getByLabelText('Order status: Shipped');
      expect(badge).toBeInTheDocument();
    });
  });
});
