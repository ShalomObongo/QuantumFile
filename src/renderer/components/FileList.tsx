import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Box,
  LinearProgress,
} from '@mui/material';
import { Folder as FolderIcon } from '@mui/icons-material';

declare global {
  interface Window {
    electron: {
      selectFolder: () => Promise<any>;
      applyChanges: (operations: any) => Promise<any>;
      restoreBackup: (backupPath: string) => Promise<any>;
      saveApiKey: (apiKey: string) => Promise<any>;
      getApiKey: () => Promise<any>;
    };
  }
}

interface FileDetails {
  name: string;
  path: string;
  size: number;
  type: string;
  lastModified: Date;
}

interface FolderContents {
  folderPath: string;
  files: FileDetails[];
}

interface FileListProps {
  apiKey: string;
  onFolderSelect: (contents: FolderContents) => void;
  processing: boolean;
  progress: number;
}

const FileList: React.FC<FileListProps> = ({ apiKey, onFolderSelect, processing, progress }) => {
  const handleClick = async () => {
    try {
      const result = await window.electron.selectFolder();
      if (result) {
        onFolderSelect(result);
      }
    } catch (error) {
      console.error('Error selecting folder:', error);
      // TODO: Add error handling UI
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Select Folder to Organize
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Choose a folder containing files you want to organize using AI
        </Typography>
        <Box sx={{ position: 'relative' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleClick}
            disabled={!apiKey || processing}
            startIcon={processing ? undefined : <FolderIcon />}
          >
            {processing ? 'Processing...' : 'Select Folder'}
          </Button>
          {processing && (
            <CircularProgress
              size={24}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                marginTop: '-12px',
                marginLeft: '-12px',
              }}
            />
          )}
        </Box>
        {!apiKey && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Please add your Gemini API key in settings first
          </Alert>
        )}
        {processing && (
          <Box sx={{ mt: 3, width: '100%' }}>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ 
                height: 8,
                borderRadius: 4,
                mb: 1
              }}
            />
            <Typography variant="body2" color="text.secondary">
              Analyzing files: {Math.round(progress)}%
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default FileList;
