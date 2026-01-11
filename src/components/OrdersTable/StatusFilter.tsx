import { memo, useCallback } from 'react';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import type { OrderStatus } from '@/features/orders/types';
import { ORDER_STATUSES, STATUS_LABELS } from '@/features/orders/constants';

interface StatusFilterProps {
  value: OrderStatus | 'all';
  onChange: (value: OrderStatus | 'all') => void;
}

export const StatusFilter = memo(function StatusFilter({ value, onChange }: StatusFilterProps) {
  const handleChange = useCallback(
    (event: SelectChangeEvent) => {
      onChange(event.target.value as OrderStatus | 'all');
    },
    [onChange]
  );

  return (
    <FormControl size="small" sx={{ minWidth: 150 }}>
      <InputLabel id="status-filter-label">Status</InputLabel>
      <Select
        labelId="status-filter-label"
        id="status-filter"
        value={value}
        label="Status"
        onChange={handleChange}
        aria-label="Filter by order status"
      >
        <MenuItem value="all">All Statuses</MenuItem>
        {ORDER_STATUSES.map((status) => (
          <MenuItem key={status} value={status}>
            {STATUS_LABELS[status]}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
});
