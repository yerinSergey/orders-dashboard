import { memo } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import CircleIcon from '@mui/icons-material/Circle';
import type { ConnectionStatus as ConnectionStatusType } from '@/features/orders/types';

interface ConnectionStatusProps {
  status: ConnectionStatusType;
  reconnectAttempts?: number;
  onDisconnect: () => void;
  onReconnect: () => void;
}

const STATUS_CONFIG = {
  connected: {
    label: 'Connected',
    color: 'success' as const,
    iconColor: '#4caf50',
  },
  disconnected: {
    label: 'Disconnected',
    color: 'error' as const,
    iconColor: '#f44336',
  },
  reconnecting: {
    label: 'Reconnecting',
    color: 'warning' as const,
    iconColor: '#ff9800',
  },
} satisfies Record<ConnectionStatusType, { label: string; color: 'success' | 'error' | 'warning'; iconColor: string }>;

export const ConnectionStatus = memo(function ConnectionStatus({
  status,
  reconnectAttempts = 0,
  onDisconnect,
  onReconnect,
}: ConnectionStatusProps) {
  const config = STATUS_CONFIG[status];
  const isConnected = status === 'connected';
  const isReconnecting = status === 'reconnecting';

  const tooltipContent = isReconnecting
    ? `Attempting to reconnect... (Attempt ${String(reconnectAttempts)})`
    : isConnected
      ? 'WebSocket connection is active'
      : 'WebSocket connection lost';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Tooltip title={tooltipContent} arrow>
        <Chip
          icon={
            <CircleIcon
              sx={{
                fontSize: 12,
                color: `${config.iconColor} !important`,
                animation: isReconnecting ? 'pulse 1.5s infinite' : 'none',
                '@keyframes pulse': {
                  '0%': { opacity: 1 },
                  '50%': { opacity: 0.4 },
                  '100%': { opacity: 1 },
                },
              }}
            />
          }
          label={config.label}
          color={config.color}
          variant="outlined"
          size="small"
          aria-label={`Connection status: ${config.label}`}
        />
      </Tooltip>

      {isConnected ? (
        <Button
          size="small"
          variant="outlined"
          color="error"
          onClick={onDisconnect}
          aria-label="Disconnect WebSocket"
        >
          Disconnect
        </Button>
      ) : (
        <Button
          size="small"
          variant="outlined"
          color="primary"
          onClick={onReconnect}
          disabled={isReconnecting}
          aria-label="Reconnect WebSocket"
        >
          Reconnect
        </Button>
      )}
    </Box>
  );
});
