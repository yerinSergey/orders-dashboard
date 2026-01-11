export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Address {
  street: string;
  city: string;
  country: string;
  postalCode: string;
}

export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  shippingAddress: Address;
}

export type SortDirection = 'asc' | 'desc';

export type SortableColumn = 'id' | 'customerName' | 'status' | 'totalAmount' | 'createdAt';

export type PageSize = 10 | 25 | 50 | 'all';

export interface TableState {
  page: number;
  pageSize: PageSize;
  sortColumn: SortableColumn | null;
  sortDirection: SortDirection;
  statusFilter: OrderStatus | 'all';
  searchQuery: string;
}

export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting';

export interface WebSocketMessage {
  type: 'NEW_ORDER' | 'ORDER_UPDATE';
  payload: Order | OrderStatusUpdate;
}

export interface OrderStatusUpdate {
  id: string;
  status: OrderStatus;
  updatedAt: string;
}
