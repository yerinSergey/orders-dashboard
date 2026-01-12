import type { OrderStatus, PageSize, SortableColumn } from './types';

export const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const STATUS_COLORS: Record<OrderStatus, 'warning' | 'info' | 'primary' | 'success' | 'error'> = {
  pending: 'warning',
  processing: 'info',
  shipped: 'primary',
  delivered: 'success',
  cancelled: 'error',
};

// Homogeneous arrays for V8 optimization
export const PAGE_SIZE_NUMBERS = [10, 25, 50] as const;

export const PAGE_SIZE_ALL = 'all' as const;

export const DEFAULT_PAGE_SIZE: PageSize = 10;

export const PAGE_SIZE_LABELS: Record<PageSize, string> = {
  10: '10',
  25: '25',
  50: '50',
  all: 'All',
};

export const VIRTUALIZATION_THRESHOLD = 100;

export const SORTABLE_COLUMNS: SortableColumn[] = [
  'id',
  'customerName',
  'status',
  'totalAmount',
  'createdAt',
];

export const COLUMN_LABELS: Record<SortableColumn, string> = {
  id: 'Order ID',
  customerName: 'Customer Name',
  status: 'Status',
  totalAmount: 'Total Amount',
  createdAt: 'Created Date',
};

export const WEBSOCKET_CONFIG = {
  MIN_MESSAGE_INTERVAL: 3000,
  MAX_MESSAGE_INTERVAL: 5000,
  INITIAL_RECONNECT_DELAY: 1000,
  MAX_RECONNECT_DELAY: 30000,
  BACKOFF_MULTIPLIER: 2,
} as const;

export const MOCK_DATA_CONFIG = {
  MIN_ORDERS: 50,
  MAX_ORDERS: 100,
  MIN_ITEMS_PER_ORDER: 1,
  MAX_ITEMS_PER_ORDER: 5,
} as const;
