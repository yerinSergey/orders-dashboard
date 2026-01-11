import { z } from 'zod';
import { ORDER_STATUSES } from './constants';

export const orderStatusSchema = z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']);

export const updateOrderStatusSchema = z.object({
  status: orderStatusSchema,
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

export function isValidOrderStatus(status: string): status is z.infer<typeof orderStatusSchema> {
  return ORDER_STATUSES.includes(status as typeof ORDER_STATUSES[number]);
}
