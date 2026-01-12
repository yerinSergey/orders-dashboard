import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { lightTheme } from '@/theme/theme';
import { OrdersTableBody } from './OrdersTableBody';
import type { Order } from '@/features/orders/types';
import { Virtualizer } from '@tanstack/react-virtual';

function TestWrapper({ children }: { children: React.ReactNode }) {
  return <MuiThemeProvider theme={lightTheme}>{children}</MuiThemeProvider>;
}

function createMockOrder(id: string, customerName: string): Order {
  return {
    id,
    customerName,
    customerEmail: `${customerName.toLowerCase().replace(' ', '.')}@example.com`,
    status: 'pending',
    items: [{ id: 'item-1', productName: 'Widget', quantity: 1, price: 100 }],
    totalAmount: 100,
    currency: 'USD',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    shippingAddress: {
      street: '123 Main St',
      city: 'New York',
      country: 'USA',
      postalCode: '10001',
    },
  };
}

// Mock virtualizer
function createMockVirtualizer(itemCount: number): Virtualizer<HTMLDivElement, Element> {
  return {
    getVirtualItems: vi.fn(() =>
      Array.from({ length: Math.min(itemCount, 10) }, (_, i) => ({
        key: `virtual-${String(i)}`,
        index: i,
        start: i * 53,
        end: (i + 1) * 53,
        size: 53,
        lane: 0,
      }))
    ),
    getTotalSize: vi.fn(() => itemCount * 53),
  } as unknown as Virtualizer<HTMLDivElement, Element>;
}

describe('OrdersTableBody', () => {
  const mockOnClick = vi.fn();

  describe('empty state', () => {
    it('renders empty state when no orders and no filters', () => {
      const virtualizer = createMockVirtualizer(0);

      render(
        <table>
          <OrdersTableBody
            orders={[]}
            statusFilter="all"
            searchQuery=""
            useVirtualization={false}
            virtualizer={virtualizer}
            onOrderClick={mockOnClick}
          />
        </table>,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText('No orders yet')).toBeInTheDocument();
    });

    it('renders filtered empty state when filters applied', () => {
      const virtualizer = createMockVirtualizer(0);

      render(
        <table>
          <OrdersTableBody
            orders={[]}
            statusFilter="shipped"
            searchQuery=""
            useVirtualization={false}
            virtualizer={virtualizer}
            onOrderClick={mockOnClick}
          />
        </table>,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText('No orders found')).toBeInTheDocument();
    });

    it('renders filtered empty state when search query applied', () => {
      const virtualizer = createMockVirtualizer(0);

      render(
        <table>
          <OrdersTableBody
            orders={[]}
            statusFilter="all"
            searchQuery="test search"
            useVirtualization={false}
            virtualizer={virtualizer}
            onOrderClick={mockOnClick}
          />
        </table>,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText('No orders found')).toBeInTheDocument();
    });
  });

  describe('regular rendering', () => {
    it('renders all orders in regular mode', () => {
      const orders = [
        createMockOrder('ORD-001', 'Alice Smith'),
        createMockOrder('ORD-002', 'Bob Johnson'),
        createMockOrder('ORD-003', 'Charlie Brown'),
      ];
      const virtualizer = createMockVirtualizer(orders.length);

      render(
        <table>
          <OrdersTableBody
            orders={orders}
            statusFilter="all"
            searchQuery=""
            useVirtualization={false}
            virtualizer={virtualizer}
            onOrderClick={mockOnClick}
          />
        </table>,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
      expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
    });
  });

  describe('virtualized rendering', () => {
    it('renders virtualized rows with spacers', () => {
      const orders = Array.from({ length: 150 }, (_, i) =>
        createMockOrder(`ORD-${String(i).padStart(3, '0')}`, `Customer ${String(i)}`)
      );
      const virtualizer = createMockVirtualizer(orders.length);

      render(
        <table>
          <OrdersTableBody
            orders={orders}
            statusFilter="all"
            searchQuery=""
            useVirtualization={true}
            virtualizer={virtualizer}
            onOrderClick={mockOnClick}
          />
        </table>,
        { wrapper: TestWrapper }
      );

      // Should render only virtual items, not all 150
      const allRows = screen.getAllByRole('row');
      // 10 visible items + 2 spacers (top/bottom)
      expect(allRows.length).toBeLessThan(15);

      // Virtualizer should be called
      expect(virtualizer.getVirtualItems).toHaveBeenCalled();
      expect(virtualizer.getTotalSize).toHaveBeenCalled();
    });

    it('handles empty virtual items array', () => {
      const orders = Array.from({ length: 150 }, (_, i) =>
        createMockOrder(`ORD-${String(i).padStart(3, '0')}`, `Customer ${String(i)}`)
      );
      
      // Mock virtualizer with no virtual items
      const virtualizer = {
        getVirtualItems: vi.fn(() => []),
        getTotalSize: vi.fn(() => 0),
      } as unknown as Virtualizer<HTMLDivElement, Element>;

      render(
        <table>
          <OrdersTableBody
            orders={orders}
            statusFilter="all"
            searchQuery=""
            useVirtualization={true}
            virtualizer={virtualizer}
            onOrderClick={mockOnClick}
          />
        </table>,
        { wrapper: TestWrapper }
      );

      // Should only have tbody, no spacers or items
      const allRows = screen.queryAllByRole('row');
      expect(allRows).toHaveLength(0);
    });
  });
});
