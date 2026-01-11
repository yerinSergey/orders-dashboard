import { format } from 'date-fns';

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return format(new Date(dateString), 'MMM dd, yyyy');
}

export function formatDateTime(dateString: string): string {
  return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
}

export function formatOrderId(id: string): string {
  return `#${id.replace('ORD-', '')}`;
}
