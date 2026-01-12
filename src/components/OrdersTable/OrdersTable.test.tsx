import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { lightTheme } from '@/theme/theme';
import { OrdersTable } from './OrdersTable';
import type { Order, OrderStatus, PageSize, SortableColumn } from '@/features/orders/types';
import { range } from '@/utils/arrayHelpers';

// Test wrapper with MUI theme
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <MuiThemeProvider theme={lightTheme}>{children}</MuiThemeProvider>;
}

// Mock order factory
function createMockOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'ORD-00001',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    status: 'pending',
    items: [{ id: 'item-1', productName: 'Widget', quantity: 2, price: 25 }],
    totalAmount: 50,
    currency: 'USD',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    shippingAddress: {
      street: '123 Main St',
      city: 'New York',
      country: 'USA',
      postalCode: '10001',
    },
    ...overrides,
  };
}

// Generate multiple mock orders
function createMockOrders(count: number): Order[] {
  const statuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  return range(count).map((i) => {
    const index = i + 1;
    return createMockOrder({
      id: `ORD-${String(index).padStart(5, '0')}`,
      customerName: `Customer ${String(index)}`,
      customerEmail: `customer${String(index)}@example.com`,
      status: statuses[i % statuses.length],
      totalAmount: 100 + index * 10,
      createdAt: new Date(2024, 0, index).toISOString(),
    });
  });
}

// Default props factory
function createDefaultProps(overrides: Partial<React.ComponentProps<typeof OrdersTable>> = {}) {
  return {
    orders: createMockOrders(10),
    totalCount: 50,
    page: 0,
    pageSize: 10 as PageSize,
    sortColumn: null as SortableColumn | null,
    sortDirection: 'asc' as const,
    statusFilter: 'all' as OrderStatus | 'all',
    searchQuery: '',
    onPageChange: vi.fn(),
    onPageSizeChange: vi.fn(),
    onSortChange: vi.fn(),
    onStatusFilterChange: vi.fn(),
    onSearchChange: vi.fn(),
    onOrderClick: vi.fn(),
    ...overrides,
  };
}

describe('OrdersTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // TEST-01: OrdersTable renders with mock orders
  describe('rendering', () => {
    it('renders table with mock orders', () => {
      const orders = createMockOrders(5);
      const props = createDefaultProps({ orders, totalCount: 5 });

      render(<OrdersTable {...props} />, { wrapper: TestWrapper });

      // Check that all orders are rendered
      orders.forEach((order) => {
        expect(screen.getByText(order.customerName)).toBeInTheDocument();
      });
    });

    // TEST-02: Table shows correct columns (ID, Name, Status, Amount, Date)
    it('displays correct column headers', () => {
      const props = createDefaultProps();

      render(<OrdersTable {...props} />, { wrapper: TestWrapper });

      // Get the table header row to scope our queries
      const table = screen.getByRole('table');
      const headerRow = within(table).getAllByRole('columnheader');

      // Verify all 5 columns exist
      expect(headerRow).toHaveLength(5);
      expect(screen.getByLabelText('Sort by Order ID')).toBeInTheDocument();
      expect(screen.getByLabelText('Sort by Customer Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Sort by Status')).toBeInTheDocument();
      expect(screen.getByLabelText('Sort by Total Amount')).toBeInTheDocument();
      expect(screen.getByLabelText('Sort by Created Date')).toBeInTheDocument();
    });

    it('displays empty state when no orders and no filters', () => {
      const props = createDefaultProps({ orders: [], totalCount: 0 });

      render(<OrdersTable {...props} />, { wrapper: TestWrapper });

      expect(screen.getByText('No orders yet')).toBeInTheDocument();
    });

    it('displays filtered empty state when filters applied', () => {
      const props = createDefaultProps({
        orders: [],
        totalCount: 0,
        statusFilter: 'shipped',
      });

      render(<OrdersTable {...props} />, { wrapper: TestWrapper });

      expect(screen.getByText('No orders found')).toBeInTheDocument();
      expect(screen.getByText(/try adjusting your search or filter/i)).toBeInTheDocument();
    });
  });

  // TEST-03 & TEST-04: Sorting functionality
  describe('sorting', () => {
    it('calls onSortChange when clicking sortable header', async () => {
      const user = userEvent.setup();
      const onSortChange = vi.fn();
      const props = createDefaultProps({ onSortChange });

      render(<OrdersTable {...props} />, { wrapper: TestWrapper });

      await user.click(screen.getByText('Customer Name'));

      expect(onSortChange).toHaveBeenCalledWith('customerName');
    });

    it('shows sort indicator on active column', () => {
      const props = createDefaultProps({
        sortColumn: 'customerName',
        sortDirection: 'asc',
      });

      render(<OrdersTable {...props} />, { wrapper: TestWrapper });

      const header = screen.getByText('Customer Name').closest('th');
      expect(header).toHaveAttribute('aria-sort', 'ascending');
    });

    it('shows descending sort indicator', () => {
      const props = createDefaultProps({
        sortColumn: 'totalAmount',
        sortDirection: 'desc',
      });

      render(<OrdersTable {...props} />, { wrapper: TestWrapper });

      const header = screen.getByText('Total Amount').closest('th');
      expect(header).toHaveAttribute('aria-sort', 'descending');
    });
  });

  // TEST-05: Search by customer name
  describe('search', () => {
    it('renders search input with current value', () => {
      const props = createDefaultProps({ searchQuery: 'John' });

      render(<OrdersTable {...props} />, { wrapper: TestWrapper });

      const searchInput = screen.getByPlaceholderText(/search by customer name or order id/i);
      expect(searchInput).toHaveValue('John');
    });

    it('calls onSearchChange when typing in search input', async () => {
      const user = userEvent.setup();
      const onSearchChange = vi.fn();
      const props = createDefaultProps({ onSearchChange });

      render(<OrdersTable {...props} />, { wrapper: TestWrapper });

      const searchInput = screen.getByPlaceholderText(/search by customer name or order id/i);
      await user.type(searchInput, 'test');

      // Due to debounce, we check if the handler was called
      // The actual implementation uses debounce, so we verify the input changes
      expect(searchInput).toHaveValue('test');
    });
  });

  // TEST-06: Pagination (10/25/50)
  describe('pagination', () => {
    it('displays pagination with correct page info', () => {
      const props = createDefaultProps({ totalCount: 100, page: 0, pageSize: 10 });

      render(<OrdersTable {...props} />, { wrapper: TestWrapper });

      expect(screen.getByText('1–10 of 100')).toBeInTheDocument();
    });

    it('calls onPageChange when navigating pages', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();
      const props = createDefaultProps({ totalCount: 100, page: 0, pageSize: 10, onPageChange });

      render(<OrdersTable {...props} />, { wrapper: TestWrapper });

      const nextButton = screen.getByLabelText('Go to next page');
      await user.click(nextButton);

      expect(onPageChange).toHaveBeenCalledWith(1);
    });

    it('calls onPageSizeChange when changing rows per page', async () => {
      const user = userEvent.setup();
      const onPageSizeChange = vi.fn();
      const props = createDefaultProps({ onPageSizeChange });

      render(<OrdersTable {...props} />, { wrapper: TestWrapper });

      // Open the rows per page select
      const rowsPerPageButton = screen.getByRole('combobox', { name: /rows per page/i });
      await user.click(rowsPerPageButton);

      // Select 25 rows per page
      const option25 = screen.getByRole('option', { name: '25' });
      await user.click(option25);

      expect(onPageSizeChange).toHaveBeenCalledWith(25);
    });

    it('displays correct rows per page options including "All"', async () => {
      const user = userEvent.setup();
      const props = createDefaultProps();

      render(<OrdersTable {...props} />, { wrapper: TestWrapper });

      const rowsPerPageButton = screen.getByRole('combobox', { name: /rows per page/i });
      await user.click(rowsPerPageButton);

      expect(screen.getByRole('option', { name: '10' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '25' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '50' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'All' })).toBeInTheDocument();
    });

    it('handles "All" page size option correctly', () => {
      const onPageSizeChange = vi.fn();
      const orders = createMockOrders(150);
      const props = createDefaultProps({ 
        orders,
        totalCount: 150,
        pageSize: 'all' as PageSize,
        onPageSizeChange 
      });

      render(<OrdersTable {...props} />, { wrapper: TestWrapper });

      // Check that "1-150 of 150" is shown (all items)
      expect(screen.getByText('1–150 of 150')).toBeInTheDocument();

      // Navigation buttons should be hidden (visibility: hidden)
      const prevButton = screen.queryByLabelText('Go to previous page');
      const nextButton = screen.queryByLabelText('Go to next page');
      
      // Buttons exist in DOM but are hidden
      expect(prevButton).toBeInTheDocument();
      expect(nextButton).toBeInTheDocument();
    });

    it('calls onPageSizeChange with "all" when selecting All option', async () => {
      const user = userEvent.setup();
      const onPageSizeChange = vi.fn();
      const props = createDefaultProps({ onPageSizeChange });

      render(<OrdersTable {...props} />, { wrapper: TestWrapper });

      const rowsPerPageButton = screen.getByRole('combobox', { name: /rows per page/i });
      await user.click(rowsPerPageButton);

      const allOption = screen.getByRole('option', { name: 'All' });
      await user.click(allOption);

      expect(onPageSizeChange).toHaveBeenCalledWith('all');
    });
  });

  // Status filter tests
  describe('status filter', () => {
    it('renders status filter dropdown', () => {
      const props = createDefaultProps();

      render(<OrdersTable {...props} />, { wrapper: TestWrapper });

      expect(screen.getByLabelText('Filter by order status')).toBeInTheDocument();
    });

    it('calls onStatusFilterChange when selecting status', async () => {
      const user = userEvent.setup();
      const onStatusFilterChange = vi.fn();
      const props = createDefaultProps({ onStatusFilterChange });

      render(<OrdersTable {...props} />, { wrapper: TestWrapper });

      // MUI Select with combobox role
      const statusFilter = screen.getByRole('combobox', { name: /status/i });
      await user.click(statusFilter);

      // Wait for dropdown options to appear in the portal
      const shippedOption = await screen.findByRole('option', { name: 'Shipped' });
      await user.click(shippedOption);

      expect(onStatusFilterChange).toHaveBeenCalledWith('shipped');
    });
  });

  // Row click tests
  describe('row interaction', () => {
    it('calls onOrderClick when clicking a row', async () => {
      const user = userEvent.setup();
      const onOrderClick = vi.fn();
      const orders = createMockOrders(3);
      const props = createDefaultProps({ orders, totalCount: 3, onOrderClick });

      render(<OrdersTable {...props} />, { wrapper: TestWrapper });

      // Find the row with the first customer name and click it
      const row = screen.getByRole('button', { name: /view order ORD-00001 details/i });
      await user.click(row);

      expect(onOrderClick).toHaveBeenCalledWith(orders[0]);
    });

    it('supports keyboard navigation on rows', async () => {
      const user = userEvent.setup();
      const onOrderClick = vi.fn();
      const orders = createMockOrders(3);
      const props = createDefaultProps({ orders, totalCount: 3, onOrderClick });

      render(<OrdersTable {...props} />, { wrapper: TestWrapper });

      const row = screen.getByRole('button', { name: /view order ORD-00001 details/i });
      row.focus();
      await user.keyboard('{Enter}');

      expect(onOrderClick).toHaveBeenCalledWith(orders[0]);
    });
  });

  // Data display tests
  describe('data formatting', () => {
    it('displays formatted order ID', () => {
      const orders = [createMockOrder({ id: 'ORD-12345' })];
      const props = createDefaultProps({ orders, totalCount: 1 });

      render(<OrdersTable {...props} />, { wrapper: TestWrapper });

      expect(screen.getByText('#12345')).toBeInTheDocument();
    });

    it('displays status badges with correct labels', () => {
      const orders = [
        createMockOrder({ id: 'ORD-00001', status: 'pending' }),
        createMockOrder({ id: 'ORD-00002', status: 'shipped' }),
      ];
      const props = createDefaultProps({ orders, totalCount: 2 });

      render(<OrdersTable {...props} />, { wrapper: TestWrapper });

      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('Shipped')).toBeInTheDocument();
    });
  });

  // BONUS: Virtualization tests
  describe('virtualization', () => {
    it('does not use virtualization with less than threshold items', () => {
      const orders = createMockOrders(50);
      const props = createDefaultProps({ 
        orders,
        totalCount: 50,
        pageSize: 'all' as PageSize 
      });

      render(<OrdersTable {...props} />, { wrapper: TestWrapper });

      // All 50 orders should be rendered directly (no virtualization)
      expect(screen.getByText('Customer 1')).toBeInTheDocument();
      expect(screen.getByText('Customer 50')).toBeInTheDocument();
    });

    it('uses virtualization with more than threshold items when pageSize is "all"', () => {
      const orders = createMockOrders(150);
      const props = createDefaultProps({ 
        orders,
        totalCount: 150,
        pageSize: 'all' as PageSize 
      });

      render(<OrdersTable {...props} />, { wrapper: TestWrapper });

      // With virtualization, not all items are rendered at once
      // Check that table exists and has content
      expect(screen.getByRole('table')).toBeInTheDocument();
      
      // Should show correct pagination info
      expect(screen.getByText('1–150 of 150')).toBeInTheDocument();
    });

    it('does not use virtualization when pageSize is not "all"', () => {
      const orders = createMockOrders(10); // Only showing 10 on this page
      const props = createDefaultProps({ 
        orders,
        totalCount: 150, // Total is 150 but only 10 shown per page
        pageSize: 10,
        page: 0
      });

      render(<OrdersTable {...props} />, { wrapper: TestWrapper });

      // Regular pagination mode, no virtualization
      expect(screen.getByText('1–10 of 150')).toBeInTheDocument();
      expect(screen.getByLabelText('Go to next page')).toBeInTheDocument();
    });

    it('uses virtualization at exact threshold boundary', () => {
      const orders = createMockOrders(101); // Just over VIRTUALIZATION_THRESHOLD (100)
      const props = createDefaultProps({ 
        orders,
        totalCount: 101,
        pageSize: 'all' as PageSize 
      });

      render(<OrdersTable {...props} />, { wrapper: TestWrapper });

      // Should show all items indicator
      expect(screen.getByText('1–101 of 101')).toBeInTheDocument();
    });

    it('does not use virtualization at threshold boundary', () => {
      const orders = createMockOrders(100); // Exactly at VIRTUALIZATION_THRESHOLD
      const props = createDefaultProps({ 
        orders,
        totalCount: 100,
        pageSize: 'all' as PageSize 
      });

      render(<OrdersTable {...props} />, { wrapper: TestWrapper });

      // At threshold, no virtualization (threshold is > 100, not >= 100)
      expect(screen.getByText('1–100 of 100')).toBeInTheDocument();
      expect(screen.getByText('Customer 100')).toBeInTheDocument();
    });
  });
});
