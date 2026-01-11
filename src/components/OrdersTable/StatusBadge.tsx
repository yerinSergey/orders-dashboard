import { memo } from 'react';
import Chip from '@mui/material/Chip';
import type { OrderStatus } from '@/features/orders/types';
import { STATUS_LABELS, STATUS_COLORS } from '@/features/orders/constants';

interface StatusBadgeProps {
  status: OrderStatus;
  size?: 'small' | 'medium';
}

export const StatusBadge = memo(function StatusBadge({ status, size = 'small' }: StatusBadgeProps) {
  return (
    <Chip
      label={STATUS_LABELS[status]}
      color={STATUS_COLORS[status]}
      size={size}
      aria-label={`Order status: ${STATUS_LABELS[status]}`}
    />
  );
});
