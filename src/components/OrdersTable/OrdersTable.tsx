import { useCallback, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import TableSortLabel from '@mui/material/TableSortLabel';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import type { Order, SortableColumn, PageSize, OrderStatus } from '@/features/orders/types';
import { COLUMN_LABELS, PAGE_SIZE_NUMBERS, PAGE_SIZE_LABELS, PAGE_SIZE_ALL, SORTABLE_COLUMNS, VIRTUALIZATION_THRESHOLD } from '@/features/orders/constants';
import { SearchInput } from './SearchInput';
import { StatusFilter } from './StatusFilter';
import { OrdersTableBody } from './OrdersTableBody';

const ROW_HEIGHT = 53; // MUI table row height

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
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Determine if virtualization should be used
  const useVirtualization = pageSize === PAGE_SIZE_ALL && orders.length > VIRTUALIZATION_THRESHOLD;

  // Virtualizer for large lists
  // When disabled (enabled: false), scroll observers are turned off and state is reset
  const virtualizer = useVirtualizer({
    count: orders.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
    enabled: useVirtualization,
  });

  const handlePageChange = useCallback(
    (_event: unknown, newPage: number) => {
      onPageChange(newPage);
    },
    [onPageChange]
  );

  const handleRowsPerPageChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(event.target.value, 10);
      // MUI uses -1 for "show all"
      const newPageSize: PageSize = value === -1 ? PAGE_SIZE_ALL : (value as PageSize);
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

  // Page size options with labels for TablePagination
  // MUI TablePagination uses -1 for "show all"
  const pageSizeOptions = [
    ...PAGE_SIZE_NUMBERS.map((size) => ({
      value: size,
      label: PAGE_SIZE_LABELS[size],
    })),
    { value: -1, label: PAGE_SIZE_LABELS[PAGE_SIZE_ALL] },
  ];

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

      <TableContainer
        ref={tableContainerRef}
        sx={{ maxHeight: 'calc(100vh - 300px)' }}
      >
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
          <OrdersTableBody
            orders={orders}
            statusFilter={statusFilter}
            searchQuery={searchQuery}
            useVirtualization={useVirtualization}
            virtualizer={virtualizer}
            onOrderClick={onOrderClick}
          />
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={totalCount}
        page={pageSize === PAGE_SIZE_ALL ? 0 : page}
        onPageChange={handlePageChange}
        rowsPerPage={pageSize === PAGE_SIZE_ALL ? -1 : pageSize}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={pageSizeOptions}
        labelRowsPerPage="Rows per page:"
        aria-label="Table pagination"
        sx={
          pageSize === PAGE_SIZE_ALL
            ? {
                '& .MuiTablePagination-actions': { 
                  visibility: 'hidden',
                },
              }
            : undefined
        }
      />
    </Paper>
  );
}
