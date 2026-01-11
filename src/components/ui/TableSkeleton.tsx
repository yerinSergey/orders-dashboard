import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Stack from '@mui/material/Stack';
import { range } from '@/utils/arrayHelpers';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showFilters?: boolean;
  showPagination?: boolean;
}

// Column configuration for skeleton cells
const COLUMN_SKELETON_CONFIG = [
  { width: 80, variant: 'text' as const },                      // Order ID (header)
  { width: 120, variant: 'text' as const },                     // Generic column (header)
  { width: 100, variant: 'text' as const },                     // Generic column (header)
] as const;

const CELL_SKELETON_CONFIG = [
  { width: 70, variant: 'text' as const },                      // Order ID
  { width: 140, variant: 'text' as const },                     // Customer Name
  { width: 80, variant: 'rounded' as const, height: 24 },      // Status (chip)
  { width: 80, variant: 'text' as const },                      // Amount
  { width: 100, variant: 'text' as const },                     // Date
] as const;

export const TableSkeleton = ({
  rows = 10,
  columns = 5,
  showFilters = true,
  showPagination = true,
}: TableSkeletonProps) => {
  // Memoize arrays to prevent re-creation on every render
  const columnIndices = useMemo(() => range(columns), [columns]);
  const rowIndices = useMemo(() => range(rows), [rows]);

  // Pre-compute all configs to avoid function calls in render loop
  const headerConfigs = useMemo(
    () => columnIndices.map((index) => {
      if (index === 0) return COLUMN_SKELETON_CONFIG[0];
      if (index === columns - 1) return COLUMN_SKELETON_CONFIG[2];
      return COLUMN_SKELETON_CONFIG[1];
    }),
    [columnIndices, columns]
  );

  const cellConfigs = useMemo(
    () => columnIndices.map((index) =>
      CELL_SKELETON_CONFIG[index] || { width: 100, variant: 'text' as const }
    ),
    [columnIndices]
  );

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      {showFilters && (
        <Box sx={{ p: 2 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'stretch', sm: 'center' }}
          >
            <Box sx={{ flexGrow: 1, maxWidth: 400 }}>
              <Skeleton variant="rounded" height={40} />
            </Box>
            <Skeleton variant="rounded" width={150} height={40} />
          </Stack>
        </Box>
      )}

      <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
        <Table aria-label="Loading orders table">
          <TableHead>
            <TableRow>
              {headerConfigs.map((config, index) => (
                <TableCell key={index}>
                  <Skeleton variant={config.variant} width={config.width} />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rowIndices.map((rowIndex) => (
              <TableRow key={rowIndex}>
                {cellConfigs.map((config, colIndex) => (
                  <TableCell key={colIndex}>
                    <Skeleton {...config} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {showPagination && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', p: 2, gap: 2 }}>
          <Skeleton variant="text" width={100} />
          <Skeleton variant="rounded" width={52} height={32} />
          <Skeleton variant="text" width={80} />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="circular" width={32} height={32} />
          </Box>
        </Box>
      )}
    </Paper>
  );
};
