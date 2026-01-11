import { memo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import type { OrderStatus } from '@/features/orders/types';
import { ORDER_STATUSES, STATUS_LABELS } from '@/features/orders/constants';
import { updateOrderStatusSchema, type UpdateOrderStatusInput } from '@/features/orders/schemas';

interface StatusEditFormProps {
  currentStatus: OrderStatus;
  onSubmit: (data: UpdateOrderStatusInput) => void;
  isSubmitting: boolean;
  formId: string;
}

export const StatusEditForm = memo(function StatusEditForm({
  currentStatus,
  onSubmit,
  isSubmitting,
  formId,
}: StatusEditFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateOrderStatusInput>({
    resolver: zodResolver(updateOrderStatusSchema),
    defaultValues: {
      status: currentStatus,
    },
  });

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    void handleSubmit(onSubmit)(e);
  };

  return (
    <form id={formId} onSubmit={onFormSubmit}>
      <Controller
        name="status"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth error={!!errors.status} disabled={isSubmitting}>
            <InputLabel id="status-edit-label">Status</InputLabel>
            <Select
              {...field}
              labelId="status-edit-label"
              label="Status"
              aria-label="Order status"
            >
              {ORDER_STATUSES.map((status) => (
                <MenuItem key={status} value={status}>
                  {STATUS_LABELS[status]}
                </MenuItem>
              ))}
            </Select>
            {errors.status && (
              <FormHelperText>{errors.status.message}</FormHelperText>
            )}
          </FormControl>
        )}
      />
    </form>
  );
});
