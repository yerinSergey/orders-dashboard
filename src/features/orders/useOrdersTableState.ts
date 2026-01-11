import { useState, useMemo, useCallback } from 'react';
import type { Order, OrderStatus, TableState, SortableColumn, SortDirection, PageSize } from './types';
import { DEFAULT_PAGE_SIZE } from './constants';

const initialState: TableState = {
  page: 0,
  pageSize: DEFAULT_PAGE_SIZE,
  sortColumn: 'createdAt',
  sortDirection: 'desc',
  statusFilter: 'all',
  searchQuery: '',
};

interface UseOrdersTableStateReturn {
  tableState: TableState;
  setPage: (page: number) => void;
  setPageSize: (pageSize: PageSize) => void;
  setSort: (column: SortableColumn) => void;
  setStatusFilter: (status: OrderStatus | 'all') => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
  // Processed data
  filteredOrders: Order[];
  paginatedOrders: Order[];
  totalCount: number;
  totalPages: number;
}

export function useOrdersTableState(orders: Order[]): UseOrdersTableStateReturn {
  const [tableState, setTableState] = useState<TableState>(initialState);

  // BONUS: useMemo for filtered/sorted data
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // Apply status filter
    if (tableState.statusFilter !== 'all') {
      result = result.filter((order) => order.status === tableState.statusFilter);
    }

    // Apply search filter (case-insensitive)
    if (tableState.searchQuery.trim()) {
      const query = tableState.searchQuery.toLowerCase().trim();
      result = result.filter(
        (order) =>
          order.customerName.toLowerCase().includes(query) ||
          order.id.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    if (tableState.sortColumn) {
      result.sort((a, b) => {
        const column = tableState.sortColumn;
        if (!column) return 0;

        let aValue: string | number;
        let bValue: string | number;

        // Handle different column types
        switch (column) {
          case 'totalAmount':
            aValue = a.totalAmount;
            bValue = b.totalAmount;
            break;
          case 'createdAt':
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
            break;
          case 'id':
          case 'customerName':
          case 'status':
            aValue = a[column].toLowerCase();
            bValue = b[column].toLowerCase();
            break;
        }

        if (aValue < bValue) return tableState.sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return tableState.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [orders, tableState.statusFilter, tableState.searchQuery, tableState.sortColumn, tableState.sortDirection]);

  // BONUS: useMemo for paginated data
  const paginatedOrders = useMemo(() => {
    const start = tableState.page * tableState.pageSize;
    const end = start + tableState.pageSize;
    return filteredOrders.slice(start, end);
  }, [filteredOrders, tableState.page, tableState.pageSize]);

  const totalCount = filteredOrders.length;
  const totalPages = Math.ceil(totalCount / tableState.pageSize);

  // BONUS: useCallback for handlers
  const setPage = useCallback((page: number) => {
    setTableState((prev) => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((pageSize: PageSize) => {
    setTableState((prev) => ({ ...prev, pageSize, page: 0 }));
  }, []);

  const setSort = useCallback((column: SortableColumn) => {
    setTableState((prev) => {
      // Toggle direction if same column, otherwise default to ascending
      const newDirection: SortDirection =
        prev.sortColumn === column && prev.sortDirection === 'asc' ? 'desc' : 'asc';
      return { ...prev, sortColumn: column, sortDirection: newDirection };
    });
  }, []);

  const setStatusFilter = useCallback((status: OrderStatus | 'all') => {
    setTableState((prev) => ({ ...prev, statusFilter: status, page: 0 }));
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setTableState((prev) => ({ ...prev, searchQuery: query, page: 0 }));
  }, []);

  const resetFilters = useCallback(() => {
    setTableState(initialState);
  }, []);

  return {
    tableState,
    setPage,
    setPageSize,
    setSort,
    setStatusFilter,
    setSearchQuery,
    resetFilters,
    filteredOrders,
    paginatedOrders,
    totalCount,
    totalPages,
  };
}
