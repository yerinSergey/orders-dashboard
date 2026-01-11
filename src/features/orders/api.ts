import type { Order, OrderStatus } from './types';
import { generateMockOrders } from '@/utils/mockDataGenerator';

// Simulated network delay
const MOCK_DELAY = 500;

// In-memory store for orders (simulates a database)
let ordersStore: Order[] | null = null;

function getOrdersStore(): Order[] {
  if (!ordersStore) {
    ordersStore = generateMockOrders();
  }
  return ordersStore;
}

// Reset store (useful for testing)
export function resetOrdersStore(): void {
  ordersStore = null;
}

// Simulate async API call
function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(value);
    }, MOCK_DELAY);
  });
}

export async function fetchOrders(): Promise<Order[]> {
  const orders = getOrdersStore();
  return delay([...orders]);
}

export async function fetchOrderById(id: string): Promise<Order | null> {
  const orders = getOrdersStore();
  const order = orders.find((o) => o.id === id) ?? null;
  return delay(order);
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<Order> {
  const orders = getOrdersStore();
  const orderIndex = orders.findIndex((o) => o.id === id);

  if (orderIndex === -1) {
    throw new Error(`Order with id ${id} not found`);
  }

  const updatedOrder: Order = {
    ...orders[orderIndex],
    status,
    updatedAt: new Date().toISOString(),
  };

  orders[orderIndex] = updatedOrder;

  return delay(updatedOrder);
}

// Used by WebSocket to add new orders to the store
export function addOrderToStore(order: Order): void {
  const orders = getOrdersStore();
  orders.unshift(order);
}

// Used by WebSocket to update order status in the store
export function updateOrderInStore(id: string, status: OrderStatus, updatedAt: string): void {
  const orders = getOrdersStore();
  const orderIndex = orders.findIndex((o) => o.id === id);

  if (orderIndex !== -1) {
    orders[orderIndex] = {
      ...orders[orderIndex],
      status,
      updatedAt,
    };
  }
}
