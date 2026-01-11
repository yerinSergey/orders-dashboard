import { useCallback } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import CloseIcon from '@mui/icons-material/Close';
import type { Order } from '@/features/orders/types';
import type { UpdateOrderStatusInput } from '@/features/orders/schemas';
import { formatCurrency, formatDateTime, formatOrderId } from '@/utils/formatters';
import { OrderItemsList } from './OrderItemsList';
import { StatusEditForm } from './StatusEditForm';

interface OrderDetailsModalProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
  onSave: (orderId: string, status: UpdateOrderStatusInput['status']) => void;
  isSaving: boolean;
}

const FORM_ID = 'status-edit-form';

export function OrderDetailsModal({
  order,
  open,
  onClose,
  onSave,
  isSaving,
}: OrderDetailsModalProps) {
  const handleSubmit = useCallback(
    (data: UpdateOrderStatusInput) => {
      if (order) {
        onSave(order.id, data.status);
      }
    },
    [order, onSave]
  );

  const handleClose = useCallback(() => {
    if (!isSaving) {
      onClose();
    }
  }, [isSaving, onClose]);

  if (!order) return null;

  const { shippingAddress } = order;
  const addressLine = `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.country} ${shippingAddress.postalCode}`;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="order-details-title"
    >
      <DialogTitle id="order-details-title" sx={{ pr: 6 }}>
        Order Details
        <IconButton
          aria-label="Close dialog"
          onClick={handleClose}
          disabled={isSaving}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Order ID
            </Typography>
            <Typography variant="h6">{formatOrderId(order.id)}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Customer
            </Typography>
            <Typography variant="body1">{order.customerName}</Typography>
            <Typography variant="body2" color="text.secondary">
              {order.customerEmail}
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Status
            </Typography>
            <StatusEditForm
              currentStatus={order.status}
              onSubmit={handleSubmit}
              isSubmitting={isSaving}
              formId={FORM_ID}
            />
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Items ({String(order.items.length)})
            </Typography>
            <OrderItemsList items={order.items} currency={order.currency} />
          </Box>

          <Divider />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Total
            </Typography>
            <Typography variant="h6" color="primary">
              {formatCurrency(order.totalAmount, order.currency)}
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Shipping Address
            </Typography>
            <Typography variant="body2">{addressLine}</Typography>
          </Box>

          <Box>
            <Stack direction="row" spacing={4}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Created
                </Typography>
                <Typography variant="body2">{formatDateTime(order.createdAt)}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Updated
                </Typography>
                <Typography variant="body2">{formatDateTime(order.updatedAt)}</Typography>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button
          type="submit"
          form={FORM_ID}
          variant="contained"
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
