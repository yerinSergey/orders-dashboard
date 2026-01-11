import { Component, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Paper
          sx={{
            p: 4,
            textAlign: 'center',
            backgroundColor: 'error.light',
            color: 'error.contrastText',
          }}
        >
          <Box sx={{ mb: 2 }}>
            <ErrorOutlineIcon sx={{ fontSize: 48 }} />
          </Box>
          <Typography variant="h6" gutterBottom>
            Something went wrong
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
            {this.state.error?.message ?? 'An unexpected error occurred'}
          </Typography>
          <Button
            variant="contained"
            color="inherit"
            onClick={this.handleReset}
            sx={{ color: 'error.main' }}
          >
            Try Again
          </Button>
        </Paper>
      );
    }

    return this.props.children;
  }
}
