import { memo, useCallback } from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import type { Order } from '@/features/orders/types';
import { StatusBadge } from './StatusBadge';
import { formatCurrency, formatDate, formatOrderId } from '@/utils/formatters';

interface OrderRowProps {
  order: Order;
  onClick: (order: Order) => void;
}

export const OrderRow = memo(function OrderRow({ order, onClick }: OrderRowProps) {
  const handleClick = useCallback(() => {
    onClick(order);
  }, [order, onClick]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick(order);
      }
    },
    [order, onClick]
  );

  return (
    <TableRow
      hover
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View order ${order.id} details`}
      sx={{ cursor: 'pointer' }}
    >
      <TableCell component="th" scope="row">
        {formatOrderId(order.id)}
      </TableCell>
      <TableCell>{order.customerName}</TableCell>
      <TableCell>
        <StatusBadge status={order.status} />
      </TableCell>
      <TableCell align="right">
        {formatCurrency(order.totalAmount, order.currency)}
      </TableCell>
      <TableCell>{formatDate(order.createdAt)}</TableCell>
    </TableRow>
  );
});
