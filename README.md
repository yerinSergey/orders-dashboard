# Orders Dashboard

A real-time orders management dashboard built with React, TypeScript, and Material UI. Features live WebSocket updates, sortable/filterable tables, and order status management.

## Features

- **Real-time Updates**: Mock WebSocket simulates live order updates every 3-5 seconds
- **Orders Table**: Sortable columns, status filtering, search by customer name or order ID
- **Pagination**: 10/25/50 items per page
- **Order Details Modal**: View full order details and update status
- **Connection Status**: Visual indicator with disconnect/reconnect controls
- **Dark Mode**: Toggle between light and dark themes (persisted in localStorage)
- **Responsive**: Works on desktop and tablet (768px+)

## Tech Stack

- **React 18** with functional components and hooks
- **TypeScript 5** with strict mode
- **Material UI 7** for all UI components
- **TanStack Query** for data fetching and cache management
- **React Hook Form + Zod** for form validation
- **Vite** for development and building
- **Vitest + React Testing Library** for testing

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Opens the app at http://localhost:5173

### Build

```bash
npm run build
```

### Testing

```bash
npm test          # Watch mode
npm run test:run  # Single run
npm run test:ui   # Vitest UI
```

### Linting

```bash
npm run lint
```

## Project Structure

```
src/
├── components/
│   ├── ConnectionStatus/    # WebSocket status indicator
│   ├── OrderDetailsModal/   # Order details + status editing
│   ├── OrdersTable/         # Main table with filters/sorting
│   ├── ui/                  # Shared UI components (TableSkeleton)
│   └── ErrorBoundary.tsx    # Error boundary wrapper
├── features/orders/
│   ├── api.ts               # Mock API functions
│   ├── constants.ts         # Status labels, colors, config
│   ├── schemas.ts           # Zod validation schemas
│   ├── types.ts             # TypeScript interfaces
│   ├── useOrders.ts         # TanStack Query hooks
│   └── useOrdersTableState.ts # Table state management
├── hooks/
│   ├── useOrdersWebSocket.ts # WebSocket integration hook
│   └── useThemeMode.ts       # Dark mode state hook
├── services/
│   └── mockWebSocket.ts      # Mock WebSocket class
├── theme/
│   ├── theme.ts              # MUI theme configuration
│   ├── ThemeContext.ts       # Theme context
│   └── ThemeProvider.tsx     # Theme provider wrapper
├── utils/
│   ├── arrayHelpers.ts       # Array utilities
│   ├── formatters.ts         # Currency/date formatting
│   └── mockDataGenerator.ts  # Mock order generation
└── test/
    └── setup.ts              # Vitest setup
```

## Architecture Decisions

### State Management

- **TanStack Query** manages server state (orders data, mutations)
- **Local state** (useState) for UI state (selected order, modal open/close)
- **Custom hooks** encapsulate complex state logic (useOrdersTableState, useOrdersWebSocket)

### WebSocket Simulation

- `MockWebSocket` class simulates real WebSocket behavior
- Emits new orders or status updates every 3-5 seconds
- Implements exponential backoff reconnection (1s → 2s → 4s → ... max 30s)
- Supports programmatic disconnect for testing

### Form Validation

- **Zod schemas** define validation rules
- **React Hook Form** handles form state
- **@hookform/resolvers** bridges Zod with React Hook Form

### Data Flow

1. `useOrders` fetches initial orders via mock API
2. `useOrdersWebSocket` connects to MockWebSocket
3. WebSocket messages update TanStack Query cache directly
4. Table re-renders with new data (sorting/filtering preserved)

### Performance Optimizations

- `React.memo` on table rows and status badges
- `useMemo` for filtered/sorted data calculations
- `useCallback` for stable handler references
- Debounced search input (300ms)
- Table skeleton loading state (reduces layout shift)

## Assumptions

1. **Currency**: Uses `Intl.NumberFormat` for locale-aware formatting
2. **Dates**: Uses `date-fns` for consistent date formatting
3. **Order IDs**: Format is `ORD-XXXXX` (5-digit padded)
4. **Search**: Case-insensitive, client-side filtering
5. **Initial Data**: 50-100 mock orders generated on app load
6. **WebSocket Backoff**: Caps at 30 seconds max delay
7. **Browser Support**: Modern browsers (ES2020+)

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:ui` | Open Vitest UI |
| `npm run test:coverage` | Run tests with coverage |

## Testing

The project includes comprehensive tests covering:

- **OrdersTable**: Rendering, sorting, filtering, pagination, search
- **OrderDetailsModal**: Display, status editing, save functionality
- **StatusBadge**: Color mapping, labels, accessibility
- **MockWebSocket**: Connection management, exponential backoff, message handling
