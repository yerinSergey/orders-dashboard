import { useState, useCallback } from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import type { Order, OrderStatus } from '@/features/orders/types';
import { useOrders, useUpdateOrderStatus, useWebSocketOrderUpdates, useOrdersFromCache } from '@/features/orders/useOrders';
import { useOrdersTableState } from '@/features/orders/useOrdersTableState';
import { useOrdersWebSocket } from '@/hooks/useOrdersWebSocket';
import { useThemeContext } from '@/theme/ThemeContext';
import { OrdersTable } from '@/components/OrdersTable';
import { OrderDetailsModal } from '@/components/OrderDetailsModal';
import { ConnectionStatus } from '@/components/ConnectionStatus';

function App() {
  const { isDark, toggleMode } = useThemeContext();

  // Order data
  const { data: orders = [], isLoading, isError, error } = useOrders();
  const updateStatusMutation = useUpdateOrderStatus();

  // Table state
  const {
    tableState,
    setPage,
    setPageSize,
    setSort,
    setStatusFilter,
    setSearchQuery,
    paginatedOrders,
    totalCount,
  } = useOrdersTableState(orders);

  // WebSocket message handler
  const handleWebSocketMessage = useWebSocketOrderUpdates();

  // Get initial orders from cache for WebSocket
  const cachedOrders = useOrdersFromCache();

  // WebSocket connection
  const {
    status: connectionStatus,
    connect,
    disconnect,
    reconnectAttempts,
  } = useOrdersWebSocket(cachedOrders, {
    onMessage: handleWebSocketMessage,
    autoConnect: true,
    enableRandomDisconnect: false,
  });

  // Modal state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handlers
  const handleOrderClick = useCallback((order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  }, []);

  const handleSaveStatus = useCallback(
    (orderId: string, status: OrderStatus) => {
      updateStatusMutation.mutate(
        { id: orderId, status },
        {
          onSuccess: () => {
            handleCloseModal();
          },
        }
      );
    },
    [updateStatusMutation, handleCloseModal]
  );

  const handleDisconnect = useCallback(() => {
    disconnect();
  }, [disconnect]);

  const handleReconnect = useCallback(() => {
    connect();
  }, [connect]);

  // Loading state
  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Error state
  if (isError) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Alert severity="error">
            Failed to load orders: {error instanceof Error ? error.message : 'Unknown error'}
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          Orders Dashboard
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ConnectionStatus
            status={connectionStatus}
            reconnectAttempts={reconnectAttempts}
            onDisconnect={handleDisconnect}
            onReconnect={handleReconnect}
          />

          <Tooltip title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
            <IconButton onClick={toggleMode} aria-label="Toggle theme">
              {isDark ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Orders Table */}
      <OrdersTable
        orders={paginatedOrders}
        totalCount={totalCount}
        page={tableState.page}
        pageSize={tableState.pageSize}
        sortColumn={tableState.sortColumn}
        sortDirection={tableState.sortDirection}
        statusFilter={tableState.statusFilter}
        searchQuery={tableState.searchQuery}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onSortChange={setSort}
        onStatusFilterChange={setStatusFilter}
        onSearchChange={setSearchQuery}
        onOrderClick={handleOrderClick}
        isLoading={isLoading}
      />

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        open={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveStatus}
        isSaving={updateStatusMutation.isPending}
      />
    </Container>
  );
}

export default App;
