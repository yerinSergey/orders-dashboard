import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Order, OrderStatus, WebSocketMessage } from './types';
import { fetchOrders, updateOrderStatus, addOrderToStore, updateOrderInStore } from './api';
import { useCallback } from 'react';

const ORDERS_QUERY_KEY = ['orders'] as const;

export function useOrders() {
  return useQuery({
    queryKey: ORDERS_QUERY_KEY,
    queryFn: fetchOrders,
    staleTime: Infinity, // Data is managed via WebSocket updates
  });
}

interface UpdateOrderStatusVariables {
  id: string;
  status: OrderStatus;
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: UpdateOrderStatusVariables) =>
      updateOrderStatus(id, status),

    // BONUS: Optimistic update
    onMutate: async ({ id, status }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ORDERS_QUERY_KEY });

      // Snapshot previous value
      const previousOrders = queryClient.getQueryData<Order[]>(ORDERS_QUERY_KEY);

      // Optimistically update
      if (previousOrders) {
        const updatedOrders = previousOrders.map((order) =>
          order.id === id
            ? { ...order, status, updatedAt: new Date().toISOString() }
            : order
        );
        queryClient.setQueryData<Order[]>(ORDERS_QUERY_KEY, updatedOrders);
      }

      return { previousOrders };
    },

    // On error, rollback
    onError: (_err, _variables, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData<Order[]>(ORDERS_QUERY_KEY, context.previousOrders);
      }
    },

    // On success, update with server response
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData<Order[]>(ORDERS_QUERY_KEY, (old) => {
        if (!old) return [updatedOrder];
        return old.map((order) =>
          order.id === updatedOrder.id ? updatedOrder : order
        );
      });
    },
  });
}

export function useWebSocketOrderUpdates() {
  const queryClient = useQueryClient();

  const handleWebSocketMessage = useCallback(
    (message: WebSocketMessage) => {
      switch (message.type) {
        case 'NEW_ORDER': {
          const newOrder = message.payload as Order;

          // Add to the mock store
          addOrderToStore(newOrder);

          // Update query cache - add to existing data without changing sort/pagination
          queryClient.setQueryData<Order[]>(ORDERS_QUERY_KEY, (old) => {
            if (!old) return [newOrder];
            // Check if order already exists (prevent duplicates)
            if (old.some((o) => o.id === newOrder.id)) return old;
            return [newOrder, ...old];
          });
          break;
        }
        case 'ORDER_UPDATE': {
          const update = message.payload as { id: string; status: OrderStatus; updatedAt: string };

          // Update the mock store
          updateOrderInStore(update.id, update.status, update.updatedAt);

          // Update query cache
          queryClient.setQueryData<Order[]>(ORDERS_QUERY_KEY, (old) => {
            if (!old) return old;
            return old.map((order) =>
              order.id === update.id
                ? { ...order, status: update.status, updatedAt: update.updatedAt }
                : order
            );
          });
          break;
        }
      }
    },
    [queryClient]
  );

  return handleWebSocketMessage;
}

// Helper to get current orders from cache (for WebSocket initialization)
export function useOrdersFromCache(): Order[] {
  const queryClient = useQueryClient();
  return queryClient.getQueryData<Order[]>(ORDERS_QUERY_KEY) ?? [];
}
