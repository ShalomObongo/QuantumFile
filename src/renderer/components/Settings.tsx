import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  IconButton,
  InputAdornment,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import ThemeToggle from './ThemeToggle';
import { useSettings } from '../contexts/SettingsContext';
import { useTheme } from '../contexts/ThemeContext';

const Settings: React.FC = () => {
  const { apiKey, setApiKey, isApiKeyValid } = useSettings();
  const { mode, toggleTheme } = useTheme();
  const [showApiKey, setShowApiKey] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempApiKey(e.target.value);
  };

  const handleSaveApiKey = async () => {
    if (!tempApiKey) {
      setError('API key cannot be empty');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await setApiKey(tempApiKey);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save API key');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSaving) {
      handleSaveApiKey();
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  const handleCloseSuccess = () => {
    setSuccess(false);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Settings
        </Typography>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Gemini API Key
          </Typography>
          <TextField
            fullWidth
            type={showApiKey ? 'text' : 'password'}
            value={tempApiKey}
            onChange={handleApiKeyChange}
            onKeyPress={handleKeyPress}
            placeholder="Enter your API key"
            variant="outlined"
            disabled={isSaving}
            error={!!error}
            helperText={error}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {isSaving ? (
                    <CircularProgress size={24} />
                  ) : (
                    <>
                      <IconButton
                        aria-label="toggle api key visibility"
                        onClick={() => setShowApiKey(!showApiKey)}
                        edge="end"
                      >
                        {showApiKey ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </>
                  )}
                </InputAdornment>
              ),
            }}
          />
          {isApiKeyValid && !error && (
            <Alert severity="success" sx={{ mt: 1 }}>
              API key is valid
            </Alert>
          )}
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Theme
          </Typography>
          <ThemeToggle currentTheme={mode} onThemeChange={toggleTheme} />
        </Box>
      </Paper>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={handleCloseError}
      >
        <Alert severity="error" onClose={handleCloseError}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar 
        open={success} 
        autoHideDuration={1500} 
        onClose={handleCloseSuccess}
      >
        <Alert severity="success">
          Settings saved successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Settings;
