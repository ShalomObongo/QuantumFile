import React, { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';

interface FileChange {
  originalPath: string;
  newPath: string;
  reason: string;
}

interface PreviewChangesProps {
  changes: FileChange[];
  onCancel: () => void;
  onApply: () => void;
}

// Browser-compatible path utilities
const getDirectoryPath = (filePath: string): string => {
  return filePath.substring(0, filePath.lastIndexOf('/'));
};

const joinPaths = (...paths: string[]): string => {
  return paths.join('/').replace(/\/+/g, '/');
};

const PreviewChanges: React.FC<PreviewChangesProps> = ({ changes, onCancel, onApply }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleApplyChanges = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // Convert changes to operations with proper paths
      const operations = changes.map(change => {
        const originalDir = getDirectoryPath(change.originalPath);
        // Create new path in the same directory as the original file
        const newPath = joinPaths(originalDir, change.newPath);
        
        return {
          sourcePath: change.originalPath,
          destinationPath: newPath
        };
      });

      // Apply changes through electron IPC
      const result = await window.electron.applyChanges(operations);
      
      if (result.success) {
        setSuccess(true);
        // Wait a bit before calling onApply to show success state
        setTimeout(() => {
          onApply();
        }, 1500);
      } else {
        throw new Error('Failed to apply changes');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply changes');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  const handleCloseSuccess = () => {
    setSuccess(false);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Proposed Changes {changes.length > 0 && `(${changes.length} files)`}
      </Typography>
      <Grid container spacing={2}>
        {changes.map((change, index) => (
          <Grid 
            item 
            xs={12} 
            key={index}
            sx={{
              opacity: 0,
              animation: 'fadeIn 0.3s ease forwards',
              animationDelay: `${index * 0.1}s`,
              '@keyframes fadeIn': {
                from: { opacity: 0, transform: 'translateY(10px)' },
                to: { opacity: 1, transform: 'translateY(0)' }
              }
            }}
          >
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Original: {change.originalPath}
                </Typography>
                <Typography variant="subtitle2" color="primary">
                  New: {joinPaths(getDirectoryPath(change.originalPath), change.newPath)}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Reason: {change.reason}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button 
          variant="outlined" 
          onClick={onCancel}
          disabled={isProcessing}
        >
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleApplyChanges}
          disabled={isProcessing}
          startIcon={isProcessing ? <CircularProgress size={20} /> : null}
        >
          {isProcessing ? 'Applying Changes...' : 'Apply Changes'}
        </Button>
      </Box>

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
          Changes applied successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PreviewChanges;
