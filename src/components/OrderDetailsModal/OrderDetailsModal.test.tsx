import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { lightTheme } from '@/theme/theme';
import { OrderDetailsModal } from './OrderDetailsModal';
import type { Order, OrderStatus } from '@/features/orders/types';

function TestWrapper({ children }: { children: React.ReactNode }) {
  return <MuiThemeProvider theme={lightTheme}>{children}</MuiThemeProvider>;
}

function createMockOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'ORD-00001',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    status: 'pending',
    items: [
      { id: 'item-1', productName: 'Widget A', quantity: 2, price: 25 },
      { id: 'item-2', productName: 'Widget B', quantity: 1, price: 50 },
    ],
    totalAmount: 100,
    currency: 'USD',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
    shippingAddress: {
      street: '123 Main St',
      city: 'New York',
      country: 'USA',
      postalCode: '10001',
    },
    ...overrides,
  };
}

function createDefaultProps(overrides: Partial<React.ComponentProps<typeof OrderDetailsModal>> = {}) {
  return {
    order: createMockOrder(),
    open: true,
    onClose: vi.fn(),
    onSave: vi.fn(),
    isSaving: false,
    ...overrides,
  };
}

describe('OrderDetailsModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders nothing when order is null', () => {
      const props = createDefaultProps({ order: null });

      const { container } = render(<OrderDetailsModal {...props} />, { wrapper: TestWrapper });

      expect(container).toBeEmptyDOMElement();
    });

    it('renders dialog when open with order', () => {
      const props = createDefaultProps();

      render(<OrderDetailsModal {...props} />, { wrapper: TestWrapper });

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Order Details')).toBeInTheDocument();
    });

    it('displays order ID correctly', () => {
      const props = createDefaultProps({ order: createMockOrder({ id: 'ORD-12345' }) });

      render(<OrderDetailsModal {...props} />, { wrapper: TestWrapper });

      expect(screen.getByText('#12345')).toBeInTheDocument();
    });

    it('displays customer information', () => {
      const props = createDefaultProps();

      render(<OrderDetailsModal {...props} />, { wrapper: TestWrapper });

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    it('displays order items', () => {
      const props = createDefaultProps();

      render(<OrderDetailsModal {...props} />, { wrapper: TestWrapper });

      expect(screen.getByText('Widget A')).toBeInTheDocument();
      expect(screen.getByText('Widget B')).toBeInTheDocument();
    });

    it('displays total amount', () => {
      const props = createDefaultProps({ order: createMockOrder({ totalAmount: 150.5, currency: 'USD' }) });

      render(<OrderDetailsModal {...props} />, { wrapper: TestWrapper });

      expect(screen.getByText('$150.50')).toBeInTheDocument();
    });

    it('displays shipping address', () => {
      const props = createDefaultProps();

      render(<OrderDetailsModal {...props} />, { wrapper: TestWrapper });

      expect(screen.getByText(/123 Main St.*New York.*USA.*10001/)).toBeInTheDocument();
    });
  });

  describe('status editing', () => {
    it('displays current status in dropdown', () => {
      const props = createDefaultProps({ order: createMockOrder({ status: 'shipped' }) });

      render(<OrderDetailsModal {...props} />, { wrapper: TestWrapper });

      expect(screen.getByRole('combobox', { name: /status/i })).toHaveTextContent('Shipped');
    });

    it('allows changing status', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps({ order: createMockOrder({ status: 'pending' }) });

      render(<OrderDetailsModal {...props} />, { wrapper: TestWrapper });

      const statusSelect = screen.getByRole('combobox', { name: /status/i });
      await user.click(statusSelect);

      const shippedOption = await screen.findByRole('option', { name: 'Shipped' });
      await user.click(shippedOption);

      expect(statusSelect).toHaveTextContent('Shipped');
    });
  });

  // TEST-04: Modal save functionality
  describe('save functionality', () => {
    it('calls onSave with order ID and new status when Save clicked', async () => {
      const user = userEvent.setup();
      const onSave = vi.fn();
      const props = createDefaultProps({
        order: createMockOrder({ id: 'ORD-99999', status: 'pending' }),
        onSave,
      });

      render(<OrderDetailsModal {...props} />, { wrapper: TestWrapper });

      // Change status
      const statusSelect = screen.getByRole('combobox', { name: /status/i });
      await user.click(statusSelect);
      const deliveredOption = await screen.findByRole('option', { name: 'Delivered' });
      await user.click(deliveredOption);

      // Click Save
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith('ORD-99999', 'delivered');
      });
    });

    it('displays saving state on button', () => {
      const props = createDefaultProps({ isSaving: true });

      render(<OrderDetailsModal {...props} />, { wrapper: TestWrapper });

      expect(screen.getByRole('button', { name: /saving/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
    });

    it('disables buttons while saving', () => {
      const props = createDefaultProps({ isSaving: true });

      render(<OrderDetailsModal {...props} />, { wrapper: TestWrapper });

      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
      expect(screen.getByLabelText('Close dialog')).toBeDisabled();
    });
  });

  describe('close functionality', () => {
    it('calls onClose when Cancel clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const props = createDefaultProps({ onClose });

      render(<OrderDetailsModal {...props} />, { wrapper: TestWrapper });

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(onClose).toHaveBeenCalled();
    });

    it('calls onClose when close icon clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const props = createDefaultProps({ onClose });

      render(<OrderDetailsModal {...props} />, { wrapper: TestWrapper });

      await user.click(screen.getByLabelText('Close dialog'));

      expect(onClose).toHaveBeenCalled();
    });

    it('does not close while saving', () => {
      const onClose = vi.fn();
      const props = createDefaultProps({ onClose, isSaving: true });

      render(<OrderDetailsModal {...props} />, { wrapper: TestWrapper });

      // Try clicking cancel - should be disabled
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      expect(cancelButton).toBeDisabled();

      // Close button should also be disabled
      expect(screen.getByLabelText('Close dialog')).toBeDisabled();
    });
  });

  describe('accessibility', () => {
    it('has accessible dialog title', () => {
      const props = createDefaultProps();

      render(<OrderDetailsModal {...props} />, { wrapper: TestWrapper });

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby', 'order-details-title');
    });

    it('provides close button with aria-label', () => {
      const props = createDefaultProps();

      render(<OrderDetailsModal {...props} />, { wrapper: TestWrapper });

      expect(screen.getByLabelText('Close dialog')).toBeInTheDocument();
    });
  });

  describe('different statuses', () => {
    const statuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    it.each(statuses)('correctly displays %s status', (status) => {
      const props = createDefaultProps({ order: createMockOrder({ status }) });

      render(<OrderDetailsModal {...props} />, { wrapper: TestWrapper });

      const statusSelect = screen.getByRole('combobox', { name: /status/i });
      expect(statusSelect).toBeInTheDocument();
    });
  });
});
