import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import MovieList from './pages/MovieList.jsx';
import MovieDetail from './pages/MovieDetail.jsx';
import Wishlist from './pages/Wishlist.jsx';
import AdminMovies from './pages/AdminMovies.jsx';
// IMDB-like theme with dark colors and gold accents
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#f5c518', // IMDB Gold
      light: '#f9d71c',
      dark: '#daa520',
      contrastText: '#000000'
    },
    secondary: {
      main: '#ffffff',
      light: '#ffffff',
      dark: '#cccccc'
    },
    background: {
      default: '#0f1419', // Dark blue-black like IMDB
      paper: '#1a1a1a'
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0'
    },
    divider: '#333333',
    success: {
      main: '#5cb85c'
    },
    warning: {
      main: '#f5c518'
    },
    error: {
      main: '#d9534f'
    }
  },
  typography: {
    fontFamily: '"Roboto", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      color: '#f5c518'
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      color: '#ffffff'
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      color: '#ffffff'
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      color: '#ffffff'
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      color: '#ffffff'
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      color: '#ffffff'
    },
    body1: {
      color: '#ffffff'
    },
    body2: {
      color: '#b0b0b0'
    }
  },
  shape: {
    borderRadius: 8
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 6,
          padding: '10px 24px'
        },
        contained: {
          background: 'linear-gradient(45deg, #f5c518 0%, #daa520 100%)',
          color: '#000000',
          boxShadow: '0 4px 14px 0 rgba(245, 197, 24, 0.3)',
          '&:hover': {
            background: 'linear-gradient(45deg, #daa520 0%, #b8860b 100%)',
            boxShadow: '0 6px 20px 0 rgba(245, 197, 24, 0.4)'
          }
        },
        outlined: {
          borderColor: '#f5c518',
          color: '#f5c518',
          '&:hover': {
            borderColor: '#daa520',
            backgroundColor: 'rgba(245, 197, 24, 0.1)'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          backgroundImage: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
          border: '1px solid #333333',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
          '&:hover': {
            border: '1px solid #f5c518',
            boxShadow: '0 12px 40px 0 rgba(245, 197, 24, 0.2)',
            transform: 'translateY(-4px)'
          },
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#1a1a1a',
            '& fieldset': {
              borderColor: '#333333'
            },
            '&:hover fieldset': {
              borderColor: '#f5c518'
            },
            '&.Mui-focused fieldset': {
              borderColor: '#f5c518'
            }
          },
          '& .MuiInputLabel-root': {
            color: '#b0b0b0',
            '&.Mui-focused': {
              color: '#f5c518'
            }
          },
          '& .MuiOutlinedInput-input': {
            color: '#ffffff'
          }
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          backgroundImage: 'linear-gradient(135deg, #1a1a1a 0%, #0f1419 100%)',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
        }
      }
    },
    MuiRating: {
      styleOverrides: {
        root: {
          color: '#f5c518'
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: '#f5c518',
          color: '#000000',
          fontWeight: 600,
          '&.MuiChip-outlined': {
            borderColor: '#f5c518',
            color: '#f5c518'
          }
        }
      }
    }
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Box 
            sx={{ 
              minHeight: '100vh',
              background: 'linear-gradient(135deg, #0f1419 0%, #1a1a1a 50%, #0f1419 100%)',
              backgroundAttachment: 'fixed'
            }}
          >
            <Navbar />
            <Box 
              component="main" 
              sx={{ 
                minHeight: 'calc(100vh - 64px)',
                pt: 0
              }}
            >
              <Routes>
                <Route path="/" element={<Navigate to="/movies" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/movies" element={<MovieList />} />
                <Route path="/movies/:id" element={<MovieDetail />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/admin/movies" element={<AdminMovies />} />
                <Route path="*" element={<Navigate to="/movies" replace />} />
              </Routes>
            </Box>
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
