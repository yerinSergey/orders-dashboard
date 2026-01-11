import { useState, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export const SearchInput = ({
  value,
  onChange,
  placeholder = 'Search by customer name or order ID...',
  debounceMs = 300,
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);

  // Sync local value when external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounced onChange callback
  const debouncedOnChange = useDebouncedCallback((newValue: string) => {
    onChange(newValue);
  }, debounceMs);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    debouncedOnChange(newValue);
  };

  const handleClear = () => {
    setLocalValue('');
    debouncedOnChange.cancel(); // Cancel pending debounced calls
    onChange(''); // Immediate update on clear
  };

  return (
    <TextField
      value={localValue}
      onChange={handleChange}
      placeholder={placeholder}
      size="small"
      fullWidth
      aria-label="Search orders"
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: localValue ? (
            <InputAdornment position="end">
              <IconButton
                onClick={handleClear}
                edge="end"
                size="small"
                aria-label="Clear search"
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : null,
        },
      }}
      sx={{ maxWidth: 400 }}
    />
  );
}
