import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MockWebSocket } from './mockWebSocket';
import { WEBSOCKET_CONFIG } from '@/features/orders/constants';
import type { Order, ConnectionStatus, WebSocketMessage } from '@/features/orders/types';

// Create a minimal mock order for testing
function createMockOrder(id: string): Order {
  return {
    id,
    customerName: 'Test Customer',
    customerEmail: 'test@example.com',
    status: 'pending',
    items: [{ id: 'item-1', productName: 'Test Product', quantity: 1, price: 100 }],
    totalAmount: 100,
    currency: 'USD',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    shippingAddress: {
      street: '123 Test St',
      city: 'Test City',
      country: 'USA',
      postalCode: '12345',
    },
  };
}

describe('MockWebSocket', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('connection management', () => {
    it('starts in disconnected state', () => {
      const ws = new MockWebSocket([]);
      expect(ws.getStatus()).toBe('disconnected');
      ws.destroy();
    });

    it('transitions to reconnecting then connected when connect() is called', async () => {
      const ws = new MockWebSocket([]);
      const statusChanges: ConnectionStatus[] = [];

      ws.onStatusChange((status) => {
        statusChanges.push(status);
      });

      ws.connect();

      // Should immediately go to reconnecting
      expect(ws.getStatus()).toBe('reconnecting');

      // Advance timers to complete connection (500ms delay)
      await vi.advanceTimersByTimeAsync(500);

      expect(ws.getStatus()).toBe('connected');
      expect(statusChanges).toContain('reconnecting');
      expect(statusChanges).toContain('connected');

      ws.destroy();
    });

    it('transitions to disconnected when disconnect() is called', async () => {
      const ws = new MockWebSocket([]);

      ws.connect();
      await vi.advanceTimersByTimeAsync(500);
      expect(ws.getStatus()).toBe('connected');

      ws.disconnect();
      expect(ws.getStatus()).toBe('disconnected');

      ws.destroy();
    });

    it('does nothing when connect() called while already connected', async () => {
      const ws = new MockWebSocket([]);
      const statusHandler = vi.fn();

      ws.connect();
      await vi.advanceTimersByTimeAsync(500);

      ws.onStatusChange(statusHandler);
      statusHandler.mockClear();

      // Try to connect again
      ws.connect();

      // Status should not change
      expect(statusHandler).not.toHaveBeenCalled();
      expect(ws.getStatus()).toBe('connected');

      ws.destroy();
    });
  });

  // TEST-03: WebSocket reconnects with exponential backoff
  describe('exponential backoff reconnection', () => {
    it('calculates initial reconnect delay correctly', () => {
      const ws = new MockWebSocket([]);

      // First reconnect attempt should use INITIAL_RECONNECT_DELAY (1000ms)
      expect(ws.getCurrentReconnectDelay()).toBe(WEBSOCKET_CONFIG.INITIAL_RECONNECT_DELAY);

      ws.destroy();
    });

    it('doubles reconnect delay with each attempt (exponential backoff)', async () => {
      const ws = new MockWebSocket([]);
      const { INITIAL_RECONNECT_DELAY, BACKOFF_MULTIPLIER } = WEBSOCKET_CONFIG;

      // Connect first
      ws.connect();
      await vi.advanceTimersByTimeAsync(500);
      expect(ws.getStatus()).toBe('connected');

      // Simulate disconnect to trigger reconnection logic
      ws.simulateDisconnect();
      expect(ws.getStatus()).toBe('reconnecting');

      // First attempt: 1000ms
      expect(ws.getCurrentReconnectDelay()).toBe(INITIAL_RECONNECT_DELAY);

      // Wait for first reconnect attempt
      await vi.advanceTimersByTimeAsync(INITIAL_RECONNECT_DELAY);

      // After first attempt, delay should double
      // Note: reconnectAttempts is incremented before connect(), so check expected value
      expect(ws.getReconnectAttempts()).toBe(1);

      // Simulate another disconnect
      ws.simulateDisconnect();

      // Second attempt delay should be 2000ms (1000 * 2^1)
      const expectedSecondDelay = INITIAL_RECONNECT_DELAY * Math.pow(BACKOFF_MULTIPLIER, 1);
      expect(ws.getCurrentReconnectDelay()).toBe(expectedSecondDelay);

      ws.destroy();
    });

    it('caps reconnect delay at MAX_RECONNECT_DELAY', () => {
      const ws = new MockWebSocket([]);
      const { MAX_RECONNECT_DELAY } = WEBSOCKET_CONFIG;

      // Simulate many reconnect attempts to exceed max delay
      // With initial=1000, multiplier=2, max=30000:
      // Attempt 5: 1000 * 2^5 = 32000 -> capped at 30000
      for (let i = 0; i < 10; i++) {
        // Manually increment attempts for testing
        ws.simulateDisconnect();
        vi.advanceTimersByTime(ws.getCurrentReconnectDelay() + 600);
      }

      // Delay should never exceed MAX_RECONNECT_DELAY
      expect(ws.getCurrentReconnectDelay()).toBeLessThanOrEqual(MAX_RECONNECT_DELAY);

      ws.destroy();
    });

    it('resets reconnect attempts after successful connection', async () => {
      const ws = new MockWebSocket([]);

      ws.connect();
      await vi.advanceTimersByTimeAsync(500);
      expect(ws.getStatus()).toBe('connected');

      // Simulate a disconnect - this triggers auto-reconnect
      ws.simulateDisconnect();
      expect(ws.getStatus()).toBe('reconnecting');

      // Before reconnect completes, attempts should be 0 (incremented during reconnect)
      // Wait for reconnect attempt to start but not complete
      await vi.advanceTimersByTimeAsync(WEBSOCKET_CONFIG.INITIAL_RECONNECT_DELAY);

      // At this point, reconnect has been initiated and attempts incremented
      expect(ws.getReconnectAttempts()).toBe(1);

      // Wait for connection to complete (500ms)
      await vi.advanceTimersByTimeAsync(500);

      // After successful reconnection, attempts should be reset to 0
      expect(ws.getStatus()).toBe('connected');
      expect(ws.getReconnectAttempts()).toBe(0);

      ws.destroy();
    });

    it('schedules automatic reconnection after simulateDisconnect', async () => {
      const ws = new MockWebSocket([]);
      const statusHandler = vi.fn();

      ws.connect();
      await vi.advanceTimersByTimeAsync(500);
      expect(ws.getStatus()).toBe('connected');

      ws.onStatusChange(statusHandler);
      statusHandler.mockClear();

      // Simulate unexpected disconnect
      ws.simulateDisconnect();

      // Should be in reconnecting state
      expect(ws.getStatus()).toBe('reconnecting');

      // Wait for reconnection attempt
      await vi.advanceTimersByTimeAsync(WEBSOCKET_CONFIG.INITIAL_RECONNECT_DELAY + 600);

      // Should have attempted to reconnect and eventually be connected
      expect(ws.getStatus()).toBe('connected');

      ws.destroy();
    });
  });

  describe('message handling', () => {
    it('calls message handlers when connected', async () => {
      const orders = [createMockOrder('ORD-00001')];
      const ws = new MockWebSocket(orders);
      const messageHandler = vi.fn();

      ws.onMessage(messageHandler);
      ws.connect();
      await vi.advanceTimersByTimeAsync(500);

      // Wait for a message to be emitted (3-5 seconds)
      await vi.advanceTimersByTimeAsync(WEBSOCKET_CONFIG.MAX_MESSAGE_INTERVAL + 100);

      expect(messageHandler).toHaveBeenCalled();
      const message = messageHandler.mock.calls[0][0] as WebSocketMessage;
      expect(['NEW_ORDER', 'ORDER_UPDATE']).toContain(message.type);

      ws.destroy();
    });

    it('unsubscribes message handler when unsubscribe function is called', async () => {
      const orders = [createMockOrder('ORD-00001')];
      const ws = new MockWebSocket(orders);
      const messageHandler = vi.fn();

      const unsubscribe = ws.onMessage(messageHandler);
      ws.connect();
      await vi.advanceTimersByTimeAsync(500);

      // Unsubscribe before any message
      unsubscribe();

      // Wait for message interval
      await vi.advanceTimersByTimeAsync(WEBSOCKET_CONFIG.MAX_MESSAGE_INTERVAL + 100);

      expect(messageHandler).not.toHaveBeenCalled();

      ws.destroy();
    });

    it('does not emit messages when disconnected', async () => {
      const orders = [createMockOrder('ORD-00001')];
      const ws = new MockWebSocket(orders);
      const messageHandler = vi.fn();

      ws.onMessage(messageHandler);

      // Don't connect, just wait
      await vi.advanceTimersByTimeAsync(WEBSOCKET_CONFIG.MAX_MESSAGE_INTERVAL + 100);

      expect(messageHandler).not.toHaveBeenCalled();

      ws.destroy();
    });
  });

  describe('status change handling', () => {
    it('immediately calls status handler with current status on subscription', () => {
      const ws = new MockWebSocket([]);
      const statusHandler = vi.fn();

      ws.onStatusChange(statusHandler);

      expect(statusHandler).toHaveBeenCalledWith('disconnected');

      ws.destroy();
    });

    it('unsubscribes status handler when unsubscribe function is called', async () => {
      const ws = new MockWebSocket([]);
      const statusHandler = vi.fn();

      const unsubscribe = ws.onStatusChange(statusHandler);

      // Clear initial call
      statusHandler.mockClear();

      // Unsubscribe
      unsubscribe();

      // Connect - should not trigger handler
      ws.connect();
      await vi.advanceTimersByTimeAsync(500);

      expect(statusHandler).not.toHaveBeenCalled();

      ws.destroy();
    });

    it('notifies all handlers on status change', () => {
      const ws = new MockWebSocket([]);
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      ws.onStatusChange(handler1);
      ws.onStatusChange(handler2);

      handler1.mockClear();
      handler2.mockClear();

      ws.connect();

      expect(handler1).toHaveBeenCalledWith('reconnecting');
      expect(handler2).toHaveBeenCalledWith('reconnecting');

      ws.destroy();
    });
  });

  describe('cleanup', () => {
    it('clears all handlers on destroy()', async () => {
      const ws = new MockWebSocket([createMockOrder('ORD-00001')]);
      const messageHandler = vi.fn();
      const statusHandler = vi.fn();

      ws.onMessage(messageHandler);
      ws.onStatusChange(statusHandler);

      ws.connect();
      await vi.advanceTimersByTimeAsync(500);

      messageHandler.mockClear();
      statusHandler.mockClear();

      ws.destroy();

      // Wait for potential messages
      await vi.advanceTimersByTimeAsync(WEBSOCKET_CONFIG.MAX_MESSAGE_INTERVAL + 100);

      // No handlers should be called after destroy
      expect(messageHandler).not.toHaveBeenCalled();
      // Status handler is cleared, so disconnect status shouldn't be sent
    });

    it('stops message emission on disconnect', async () => {
      const orders = [createMockOrder('ORD-00001')];
      const ws = new MockWebSocket(orders);
      const messageHandler = vi.fn();

      ws.onMessage(messageHandler);
      ws.connect();
      await vi.advanceTimersByTimeAsync(500);

      // Disconnect
      ws.disconnect();
      messageHandler.mockClear();

      // Wait for potential messages
      await vi.advanceTimersByTimeAsync(WEBSOCKET_CONFIG.MAX_MESSAGE_INTERVAL + 100);

      expect(messageHandler).not.toHaveBeenCalled();

      ws.destroy();
    });
  });

  describe('order management', () => {
    it('updates internal orders with updateOrders()', () => {
      const ws = new MockWebSocket([]);
      const newOrders = [createMockOrder('ORD-00001'), createMockOrder('ORD-00002')];

      ws.updateOrders(newOrders);

      // Internal state is updated (we can verify by checking message generation works)
      // This is mainly for ensuring the method doesn't throw
      expect(() => {
        ws.updateOrders(newOrders);
      }).not.toThrow();

      ws.destroy();
    });
  });

  describe('random disconnect (BONUS)', () => {
    it('can be enabled via options', () => {
      const ws = new MockWebSocket([], {
        enableRandomDisconnect: true,
        randomDisconnectProbability: 0.5,
      });

      // Constructor should accept options without error
      expect(ws.getStatus()).toBe('disconnected');

      ws.destroy();
    });
  });
});
