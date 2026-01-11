import { useCallback } from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import TableSortLabel from '@mui/material/TableSortLabel';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import type { Order, SortableColumn, PageSize, OrderStatus } from '@/features/orders/types';
import { COLUMN_LABELS, PAGE_SIZES, SORTABLE_COLUMNS } from '@/features/orders/constants';
import { SearchInput } from './SearchInput';
import { StatusFilter } from './StatusFilter';
import { OrderRow } from './OrderRow';
import { EmptyState } from './EmptyState';

interface OrdersTableProps {
  orders: Order[];
  totalCount: number;
  page: number;
  pageSize: PageSize;
  sortColumn: SortableColumn | null;
  sortDirection: 'asc' | 'desc';
  statusFilter: OrderStatus | 'all';
  searchQuery: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: PageSize) => void;
  onSortChange: (column: SortableColumn) => void;
  onStatusFilterChange: (status: OrderStatus | 'all') => void;
  onSearchChange: (query: string) => void;
  onOrderClick: (order: Order) => void;
  isLoading?: boolean;
}

export function OrdersTable({
  orders,
  totalCount,
  page,
  pageSize,
  sortColumn,
  sortDirection,
  statusFilter,
  searchQuery,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onStatusFilterChange,
  onSearchChange,
  onOrderClick,
}: OrdersTableProps) {
  const handlePageChange = useCallback(
    (_event: unknown, newPage: number) => {
      onPageChange(newPage);
    },
    [onPageChange]
  );

  const handleRowsPerPageChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newPageSize = parseInt(event.target.value, 10) as PageSize;
      onPageSizeChange(newPageSize);
    },
    [onPageSizeChange]
  );

  const createSortHandler = useCallback(
    (column: SortableColumn) => () => {
      onSortChange(column);
    },
    [onSortChange]
  );

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Box sx={{ p: 2 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', sm: 'center' }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <SearchInput value={searchQuery} onChange={onSearchChange} />
          </Box>
          <StatusFilter value={statusFilter} onChange={onStatusFilterChange} />
        </Stack>
      </Box>

      <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
        <Table stickyHeader aria-label="Orders table">
          <TableHead>
            <TableRow>
              {SORTABLE_COLUMNS.map((column) => (
                <TableCell
                  key={column}
                  align={column === 'totalAmount' ? 'right' : 'left'}
                  sortDirection={sortColumn === column ? sortDirection : false}
                >
                  <TableSortLabel
                    active={sortColumn === column}
                    direction={sortColumn === column ? sortDirection : 'asc'}
                    onClick={createSortHandler(column)}
                    aria-label={`Sort by ${COLUMN_LABELS[column]}`}
                  >
                    {COLUMN_LABELS[column]}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <EmptyState
                    hasFilters={statusFilter !== 'all' || searchQuery.trim() !== ''}
                  />
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <OrderRow key={order.id} order={order} onClick={onOrderClick} />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={handlePageChange}
        rowsPerPage={pageSize}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={PAGE_SIZES}
        labelRowsPerPage="Rows per page:"
        aria-label="Table pagination"
      />
    </Paper>
  );
}
