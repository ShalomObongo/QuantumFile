import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  ListItemButton,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
  Avatar,
  Badge,
  Divider,
  useMediaQuery,
} from '@mui/material';
import {
  Folder as FolderIcon,
  Settings as SettingsIcon,
  Preview as PreviewIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';

import FileList from './components/FileList';
import PreviewChanges from './components/PreviewChanges';
import Settings from './components/Settings';
import { GeminiService } from './services/geminiService';
import { useSettings } from './contexts/SettingsContext';
import { useTheme as useThemeContext } from './contexts/ThemeContext';

interface FileDetails {
  name: string;
  path: string;
  size: number;
  type: string;
  lastModified: Date;
}

interface FileChange {
  originalPath: string;
  newPath: string;
  reason: string;
}

const DRAWER_WIDTH = 280;
const TOOLBAR_HEIGHT = 72;

const App: React.FC = () => {
  const theme = useTheme();
  const { apiKey, isApiKeyValid } = useSettings();
  const { mode, toggleTheme } = useThemeContext();
  const [view, setView] = useState<'files' | 'preview' | 'settings'>('files');
  const [selectedFolder, setSelectedFolder] = useState('');
  const [folderContents, setFolderContents] = useState<FileDetails[]>([]);
  const [proposedChanges, setProposedChanges] = useState<FileChange[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleFolderSelect = async (contents: { folderPath: string; files: FileDetails[] }) => {
    setProcessing(true);
    setSelectedFolder(contents.folderPath);
    setFolderContents(contents.files);
    setError(null);

    try {
      const gemini = new GeminiService(apiKey);
      const changes = await gemini.analyzeFiles(contents.files);
      setProposedChanges(changes);
      setProcessing(false);
      setView('preview');
    } catch (error) {
      console.error('Error processing files:', error);
      setProcessing(false);
      setError(error instanceof Error ? error.message : 'Error analyzing files');
    }
  };

  const getViewTitle = () => {
    switch (view) {
      case 'files':
        return 'File Organization';
      case 'preview':
        return 'Preview Changes';
      case 'settings':
        return 'Settings';
    }
  };

  const renderContent = () => {
    switch (view) {
      case 'files':
        return (
          <FileList
            apiKey={apiKey}
            onFolderSelect={handleFolderSelect}
            processing={processing}
          />
        );

      case 'preview':
        return (
          <PreviewChanges
            changes={proposedChanges}
            onCancel={() => setView('files')}
            onApply={() => {
              setView('files');
              setProposedChanges([]);
            }}
          />
        );

      case 'settings':
        return <Settings />;
    }
  };

  const navigationItems = [
    { id: 'files', icon: <FolderIcon />, label: 'Files', disabled: false },
    { id: 'preview', icon: <PreviewIcon />, label: 'Preview', disabled: proposedChanges.length === 0 },
    { id: 'settings', icon: <SettingsIcon />, label: 'Settings', disabled: false },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerOpen ? DRAWER_WIDTH : 0}px)` },
          ml: { sm: `${drawerOpen ? DRAWER_WIDTH : 0}px` },
          backgroundColor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
          height: TOOLBAR_HEIGHT,
        }}
      >
        <Toolbar 
          sx={{ 
            height: TOOLBAR_HEIGHT,
            minHeight: TOOLBAR_HEIGHT,
            px: { xs: 2, sm: 3 },
            display: 'grid',
            gridTemplateColumns: 'auto 1fr auto',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setDrawerOpen(!drawerOpen)}
              sx={{ 
                display: { sm: 'none' },
              }}
            >
              <MenuIcon />
            </IconButton>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Typography
              variant="h6"
              component="div"
              sx={{
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(45deg, #90caf9 30%, #64b5f6 90%)'
                  : 'linear-gradient(45deg, #2196f3 30%, #1976d2 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 700,
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                letterSpacing: '-0.04em',
                fontFamily: 'var(--font-display)',
                textTransform: 'uppercase',
              }}
            >
              QuantumFile
            </Typography>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: { xs: 1, sm: 2 },
            justifyContent: 'flex-end',
          }}>
            <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}>
              <IconButton 
                onClick={toggleTheme} 
                sx={{ 
                  width: 40, 
                  height: 40,
                  transition: 'all 0.2s ease',
                  color: mode === 'dark' ? '#fff' : '#000',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    color: mode === 'dark' ? '#90caf9' : '#1976d2',
                  },
                }}
              >
                {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Settings">
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                variant="dot"
                color={isApiKeyValid ? "success" : "error"}
              >
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: theme.palette.primary.main,
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.1)',
                    },
                  }}
                  onClick={() => setView('settings')}
                >
                  {isApiKeyValid ? 'AI' : '?'}
                </Avatar>
              </Badge>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            backgroundColor: theme.palette.background.paper,
            borderRight: `1px solid ${theme.palette.divider}`,
            pt: `${TOOLBAR_HEIGHT}px`,
            '& .MuiTypography-root': {
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.02em',
              fontWeight: 500,
            },
          },
        }}
      >
        <Box sx={{ overflow: 'auto', mt: 2 }}>
          <List>
            {navigationItems.map((item) => (
              <React.Fragment key={item.id}>
                <ListItem disablePadding>
                  <ListItemButton
                    selected={view === item.id}
                    onClick={() => setView(item.id as typeof view)}
                    disabled={item.disabled}
                    sx={{
                      mx: 1,
                      borderRadius: 1,
                      '&.Mui-selected': {
                        backgroundColor: theme.palette.primary.main + '20',
                        '&:hover': {
                          backgroundColor: theme.palette.primary.main + '30',
                        },
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: view === item.id ? theme.palette.primary.main : 'inherit',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.label}
                      primaryTypographyProps={{
                        fontWeight: view === item.id ? 600 : 400,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
                {item.id === 'preview' && <Divider sx={{ my: 1 }} />}
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          pt: `${TOOLBAR_HEIGHT + 24}px`,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          backgroundColor: theme.palette.mode === 'dark'
            ? 'rgba(0, 0, 0, 0.2)'
            : 'rgba(0, 0, 0, 0.01)',
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              fontSize: { xs: '1.75rem', sm: '2rem' },
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
            }}
          >
            {getViewTitle()}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ 
              mb: 3,
              fontFamily: 'var(--font-primary)',
              letterSpacing: '-0.02em',
              fontSize: '0.95rem',
              fontWeight: 400,
            }}
          >
            {selectedFolder && view === 'files' && `Selected folder: ${selectedFolder}`}
          </Typography>
        </Box>
        {renderContent()}
      </Box>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity="error" 
          onClose={() => setError(null)}
          sx={{ 
            width: '100%',
            boxShadow: theme.shadows[3],
            '& .MuiAlert-message': {
              fontFamily: 'var(--font-primary)',
              letterSpacing: '-0.02em',
              fontWeight: 500,
            },
          }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default App; 