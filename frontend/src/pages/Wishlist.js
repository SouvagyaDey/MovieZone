import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Button,
  IconButton,
  Paper,
  Chip,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { wishlistAPI } from '../services/api';
import MovieCard from '../components/MovieCard';

const Wishlist = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchWishlist();
  }, [isAuthenticated, navigate]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await wishlistAPI.getWishlist();
      setWishlist(response.data);
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
      setError('Failed to load your wishlist.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (wishlistId) => {
    try {
      await wishlistAPI.removeFromWishlist(wishlistId);
      setWishlist(wishlist.filter(item => item.id !== wishlistId));
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
    }
  };

  const handleClearWishlist = async () => {
    try {
      await Promise.all(wishlist.map(item => wishlistAPI.removeFromWishlist(item.id)));
      setWishlist([]);
    } catch (err) {
      console.error('Failed to clear wishlist:', err);
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <FavoriteIcon sx={{ fontSize: 36, color: 'primary.main' }} />
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(45deg, #ff4569, #ffd54f)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            My Wishlist
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h6" color="text.secondary">
            {wishlist.length === 0 
              ? 'No movies in your wishlist yet'
              : `${wishlist.length} movie${wishlist.length !== 1 ? 's' : ''} saved for later`
            }
          </Typography>
          
          {wishlist.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              onClick={handleClearWishlist}
              startIcon={<DeleteIcon />}
            >
              Clear All
            </Button>
          )}
        </Box>
      </Box>

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Empty State */}
      {wishlist.length === 0 && !loading ? (
        <Paper 
          elevation={2} 
          sx={{ 
            p: 6, 
            textAlign: 'center', 
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
          }}
        >
          <FavoriteIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h5" gutterBottom color="text.secondary">
            Your wishlist is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Start adding movies you want to watch later by clicking the heart icon on any movie.
          </Typography>
          <Button
            component={Link}
            to="/movies"
            variant="contained"
            size="large"
            startIcon={<PlayIcon />}
            sx={{
              background: 'linear-gradient(45deg, #ff4569, #ff7a96)',
              '&:hover': {
                background: 'linear-gradient(45deg, #cc1a3d, #ff4569)',
              },
            }}
          >
            Discover Movies
          </Button>
        </Paper>
      ) : (
        <>
          {/* Wishlist Stats */}
          <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight={700} color="primary.main">
                    {wishlist.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Movies Saved
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight={700} color="secondary.main">
                    {wishlist.reduce((total, item) => total + (item.movie.average_rating || 0), 0).toFixed(1)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Rating Points
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight={700} color="success.main">
                    {(wishlist.reduce((total, item) => total + (item.movie.average_rating || 0), 0) / wishlist.length).toFixed(1)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Average Rating
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Wishlist Movies */}
          <Grid container spacing={3}>
            {wishlist.map((item) => (
              <Grid item key={item.id} xs={12} sm={6} md={4} lg={3}>
                <Card
                  sx={{
                    height: '100%',
                    position: 'relative',
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  {/* Remove from wishlist button */}
                  <IconButton
                    onClick={() => handleRemoveFromWishlist(item.id)}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      zIndex: 2,
                      bgcolor: 'rgba(0, 0, 0, 0.6)',
                      color: 'primary.main',
                      '&:hover': {
                        bgcolor: 'rgba(0, 0, 0, 0.8)',
                        transform: 'scale(1.1)',
                      },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>

                  {/* Use MovieCard but modify for wishlist context */}
                  <Box sx={{ height: '100%' }}>
                    <MovieCard 
                      movie={{
                        ...item.movie,
                        is_in_wishlist: true,
                        wishlist_id: item.id,
                      }} 
                      onWishlistChange={fetchWishlist}
                    />
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Action Buttons */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button
              component={Link}
              to="/movies"
              variant="outlined"
              size="large"
              sx={{ mr: 2 }}
            >
              Browse More Movies
            </Button>
            <Button
              component={Link}
              to="/movies?filter=trending"
              variant="contained"
              size="large"
              sx={{
                background: 'linear-gradient(45deg, #ff4569, #ff7a96)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #cc1a3d, #ff4569)',
                },
              }}
            >
              Discover Trending
            </Button>
          </Box>
        </>
      )}
    </Container>
  );
};

export default Wishlist;