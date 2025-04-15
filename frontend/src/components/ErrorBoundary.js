import React, { Component } from 'react';
import { Typography, Box } from '@mui/material';

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ padding: 2, textAlign: 'center' }}>
          <Typography variant="h5" color="error">
            Произошла ошибка: {this.state.error?.message || 'Неизвестная ошибка'}
          </Typography>
          <Typography>
            Попробуйте перезагрузить страницу или обратиться в поддержку.
          </Typography>
        </Box>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;