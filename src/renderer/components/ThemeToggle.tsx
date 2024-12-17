import React from 'react';
import { Box, Typography, Switch } from '@mui/material';
import { DarkMode as DarkModeIcon } from '@mui/icons-material';

interface ThemeToggleProps {
  currentTheme: 'light' | 'dark';
  onThemeChange: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ currentTheme, onThemeChange }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <DarkModeIcon sx={{ mr: 1 }} />
      <Typography>Dark Mode</Typography>
      <Switch
        checked={currentTheme === 'dark'}
        onChange={onThemeChange}
        sx={{ ml: 'auto' }}
      />
    </Box>
  );
};

export default ThemeToggle;
