import type { Order, OrderItem, Address, OrderStatus } from '@/features/orders/types';
import { ORDER_STATUSES, MOCK_DATA_CONFIG } from '@/features/orders/constants';
import { range } from './arrayHelpers';

const FIRST_NAMES = [
  'John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'Chris', 'Amanda',
  'Robert', 'Jessica', 'William', 'Ashley', 'James', 'Melissa', 'Daniel',
  'Nicole', 'Matthew', 'Stephanie', 'Andrew', 'Jennifer', 'Joshua', 'Elizabeth',
  'Ryan', 'Lauren', 'Brandon', 'Samantha', 'Tyler', 'Megan', 'Kevin', 'Rachel',
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
];

const PRODUCT_NAMES = [
  'Wireless Headphones', 'USB-C Cable', 'Phone Case', 'Screen Protector',
  'Bluetooth Speaker', 'Power Bank', 'Laptop Stand', 'Mechanical Keyboard',
  'Gaming Mouse', 'Webcam HD', 'Monitor Arm', 'Desk Mat', 'LED Strip Lights',
  'Smart Watch', 'Fitness Tracker', 'Portable SSD', 'Memory Card', 'Tripod',
  'Ring Light', 'Microphone', 'Noise Canceling Earbuds', 'Tablet Stand',
  'Wireless Charger', 'HDMI Cable', 'USB Hub', 'External Hard Drive',
];

const STREETS = [
  'Main Street', 'Oak Avenue', 'Maple Drive', 'Cedar Lane', 'Pine Road',
  'Elm Street', 'Washington Boulevard', 'Park Avenue', 'Lake Drive', 'Hill Road',
  'River Street', 'Forest Lane', 'Sunset Boulevard', 'Broadway', 'Market Street',
];

const CITIES = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
  'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville',
  'Fort Worth', 'Columbus', 'Charlotte', 'Seattle', 'Denver', 'Boston',
  'Portland', 'Miami', 'Atlanta', 'Minneapolis', 'Detroit', 'San Francisco',
];

const COUNTRIES = ['USA', 'Canada', 'UK', 'Germany', 'France', 'Australia'];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(array: T[]): T {
  return array[randomInt(0, array.length - 1)];
}

function generateOrderId(index: number): string {
  return `ORD-${String(index + 1).padStart(5, '0')}`;
}

function generateEmail(firstName: string, lastName: string): string {
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'example.com', 'mail.com'];
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${randomElement(domains)}`;
}

function generateAddress(): Address {
  return {
    street: `${String(randomInt(1, 9999))} ${randomElement(STREETS)}`,
    city: randomElement(CITIES),
    country: randomElement(COUNTRIES),
    postalCode: String(randomInt(10000, 99999)),
  };
}

function generateOrderItem(index: number): OrderItem {
  const quantity = randomInt(1, 5);
  const price = parseFloat((Math.random() * 200 + 10).toFixed(2));

  return {
    id: `ITEM-${String(index + 1).padStart(4, '0')}`,
    productName: randomElement(PRODUCT_NAMES),
    quantity,
    price,
  };
}

function generateOrder(index: number): Order {
  const firstName = randomElement(FIRST_NAMES);
  const lastName = randomElement(LAST_NAMES);
  const customerName = `${firstName} ${lastName}`;

  const itemCount = randomInt(
    MOCK_DATA_CONFIG.MIN_ITEMS_PER_ORDER,
    MOCK_DATA_CONFIG.MAX_ITEMS_PER_ORDER
  );
  const items: OrderItem[] = range(itemCount).map((i) => generateOrderItem(i));

  const totalAmount = parseFloat(
    items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
  );

  const createdAt = new Date(
    Date.now() - randomInt(0, 30 * 24 * 60 * 60 * 1000) // Last 30 days
  ).toISOString();

  const updatedAt = new Date(
    new Date(createdAt).getTime() + randomInt(0, 5 * 24 * 60 * 60 * 1000) // Up to 5 days after creation
  ).toISOString();

  return {
    id: generateOrderId(index),
    customerName,
    customerEmail: generateEmail(firstName, lastName),
    status: randomElement(ORDER_STATUSES),
    items,
    totalAmount,
    currency: randomElement(CURRENCIES),
    createdAt,
    updatedAt,
    shippingAddress: generateAddress(),
  };
}

export function generateMockOrders(count?: number): Order[] {
  const orderCount = count ?? randomInt(MOCK_DATA_CONFIG.MIN_ORDERS, MOCK_DATA_CONFIG.MAX_ORDERS);
  return range(orderCount).map((i) => generateOrder(i));
}

export function generateNewOrder(existingOrders: Order[]): Order {
  const maxId = existingOrders.reduce((max, order) => {
    const num = parseInt(order.id.replace('ORD-', ''), 10);
    return num > max ? num : max;
  }, 0);

  const newOrder = generateOrder(maxId);
  newOrder.status = 'pending'; // New orders always start as pending
  newOrder.createdAt = new Date().toISOString();
  newOrder.updatedAt = newOrder.createdAt;

  return newOrder;
}

export function generateRandomStatusUpdate(orders: Order[]): { id: string; status: OrderStatus; updatedAt: string } | null {
  const updatableOrders = orders.filter(
    (order) => order.status !== 'delivered' && order.status !== 'cancelled'
  );

  if (updatableOrders.length === 0) return null;

  const order = randomElement(updatableOrders);
  const statusProgression: Record<OrderStatus, OrderStatus[]> = {
    pending: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: [],
  };

  const possibleStatuses = statusProgression[order.status];
  if (possibleStatuses.length === 0) return null;

  return {
    id: order.id,
    status: randomElement(possibleStatuses),
    updatedAt: new Date().toISOString(),
  };
}
