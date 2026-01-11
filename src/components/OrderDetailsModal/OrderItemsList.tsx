import { memo } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import type { OrderItem } from '@/features/orders/types';
import { formatCurrency } from '@/utils/formatters';

interface OrderItemsListProps {
  items: OrderItem[];
  currency: string;
}

export const OrderItemsList = memo(function OrderItemsList({ items, currency }: OrderItemsListProps) {
  return (
    <List disablePadding>
      {items.map((item, index) => (
        <div key={item.id}>
          <ListItem sx={{ px: 0 }}>
            <ListItemText
              primary={item.productName}
              secondary={`Quantity: ${String(item.quantity)}`}
            />
            <Typography variant="body2" color="text.secondary">
              {formatCurrency(item.price * item.quantity, currency)}
            </Typography>
          </ListItem>
          {index < items.length - 1 && <Divider />}
        </div>
      ))}
    </List>
  );
});
