import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import type { Virtualizer } from '@tanstack/react-virtual';
import type { Order, OrderStatus } from '@/features/orders/types';
import { OrderRow } from './OrderRow';
import { EmptyState } from './EmptyState';

interface OrdersTableBodyProps {
  orders: Order[];
  statusFilter: OrderStatus | 'all';
  searchQuery: string;
  useVirtualization: boolean;
  virtualizer: Virtualizer<HTMLDivElement, Element>;
  onOrderClick: (order: Order) => void;
}

export function OrdersTableBody({
  orders,
  statusFilter,
  searchQuery,
  useVirtualization,
  virtualizer,
  onOrderClick,
}: OrdersTableBodyProps) {
  // Empty state
  if (orders.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={5}>
            <EmptyState hasFilters={statusFilter !== 'all' || searchQuery.trim() !== ''} />
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  // Virtualized rendering for large lists
  if (useVirtualization) {
    const virtualItems = virtualizer.getVirtualItems();
    const totalSize = virtualizer.getTotalSize();

    return (
      <TableBody>
        {/* Top spacer */}
        {virtualItems.length > 0 && (
          <TableRow style={{ height: virtualItems[0].start }} />
        )}

        {/* Visible rows */}
        {virtualItems.map((virtualRow) => {
          const order = orders[virtualRow.index];
          return <OrderRow key={order.id} order={order} onClick={onOrderClick} />;
        })}

        {/* Bottom spacer */}
        {virtualItems.length > 0 && (
          <TableRow
            style={{
              height: Math.max(0, totalSize - virtualItems[virtualItems.length - 1].end),
            }}
          />
        )}
      </TableBody>
    );
  }

  // Regular rendering
  return (
    <TableBody>
      {orders.map((order) => (
        <OrderRow key={order.id} order={order} onClick={onOrderClick} />
      ))}
    </TableBody>
  );
}
