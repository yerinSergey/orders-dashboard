import { memo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import InboxIcon from '@mui/icons-material/Inbox';
import SearchOffIcon from '@mui/icons-material/SearchOff';

interface EmptyStateProps {
  hasFilters: boolean;
}

export const EmptyState = memo(function EmptyState({ hasFilters }: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        color: 'text.secondary',
      }}
    >
      {hasFilters ? (
        <>
          <SearchOffIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" gutterBottom>
            No orders found
          </Typography>
          <Typography variant="body2">
            Try adjusting your search or filter criteria
          </Typography>
        </>
      ) : (
        <>
          <InboxIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" gutterBottom>
            No orders yet
          </Typography>
          <Typography variant="body2">
            Orders will appear here once they are created
          </Typography>
        </>
      )}
    </Box>
  );
});
