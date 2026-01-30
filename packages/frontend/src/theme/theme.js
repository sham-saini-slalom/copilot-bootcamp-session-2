import { createTheme } from '@mui/material/styles';

// Pastel color palette for the TODO app
const theme = createTheme({
  palette: {
    primary: {
      main: '#B4A7D6',
      light: '#D6CEEB',
      dark: '#9585B8',
    },
    secondary: {
      main: '#A8D8EA',
      light: '#C7E8F3',
      dark: '#7EBFD4',
    },
    success: {
      main: '#B8E6D5',
      light: '#D4F2E7',
      dark: '#8FD4B8',
    },
    warning: {
      main: '#FFD6A5',
      light: '#FFE6C8',
      dark: '#FFBC6F',
    },
    error: {
      main: '#FFADAD',
      light: '#FFD1D1',
      dark: '#FF7B7B',
    },
    info: {
      main: '#D4C5F9',
      light: '#E8E0FC',
      dark: '#B8A3F5',
    },
    background: {
      default: '#F8F9FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#4A5568',
      secondary: '#718096',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    body1: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
});

export default theme;
