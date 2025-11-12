import React, { useState } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Rating,
  Chip,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Star as StarIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { wishlistAPI } from '../services/api';
import WatchOptions from './WatchOptions';

const MovieCard = ({ movie, onWishlistChange }) => {
  const { isAuthenticated } = useAuth();
  const [isInWishlist, setIsInWishlist] = useState(movie.is_in_wishlist || false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      setSnackbar({ open: true, message: 'Please login to add to wishlist', severity: 'warning' });
      return;
    }

    setLoading(true);
    try {
      if (isInWishlist) {
        await wishlistAPI.removeFromWishlist(movie.wishlist_id);
        setIsInWishlist(false);
        setSnackbar({ open: true, message: 'Removed from wishlist', severity: 'info' });
      } else {
        await wishlistAPI.addToWishlist(movie.id);
        setIsInWishlist(true);
        setSnackbar({ open: true, message: 'Added to wishlist', severity: 'success' });
      }
      onWishlistChange?.();
    } catch (error) {
      console.error('Wishlist error:', error);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.error || 'Failed to update wishlist', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-movie.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:8000${imagePath}`;
  };

  return (
    <>
      <Card
        component={Link}
        to={`/movies/${movie.id}`}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          textDecoration: 'none',
          position: 'relative',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 12px 40px rgba(255, 69, 105, 0.3)',
          },
          background: 'linear-gradient(145deg, #1e1e1e 0%, #2d2d2d 100%)',
          overflow: 'hidden',
        }}
      >
        {/* Wishlist Button */}
        <IconButton
          onClick={handleWishlistToggle}
          disabled={loading}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 2,
            bgcolor: 'rgba(0, 0, 0, 0.6)',
            color: isInWishlist ? 'primary.main' : 'white',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.8)',
              transform: 'scale(1.1)',
            },
          }}
        >
          {isInWishlist ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        </IconButton>

        {/* Movie Poster */}
        <CardMedia
          component="img"
          height="300"
          image={getImageUrl(movie.image)}
          alt={movie.title}
          sx={{
            objectFit: 'cover',
            background: 'linear-gradient(45deg, #1e3c72, #2a5298)',
          }}
          onError={(e) => {
            e.target.src = '/placeholder-movie.jpg';
          }}
        />

        <CardContent sx={{ flexGrow: 1, p: 2 }}>
          {/* Title */}
          <Typography 
            variant="h6" 
            component="h3"
            sx={{ 
              fontWeight: 600,
              mb: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.3,
            }}
          >
            {movie.title}
          </Typography>

          {/* Rating and Reviews */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Rating
              value={movie.average_rating / 2} // Convert 10-point to 5-point scale
              precision={0.1}
              readOnly
              size="small"
              icon={<StarIcon fontSize="inherit" />}
              emptyIcon={<StarIcon fontSize="inherit" />}
            />
            <Typography variant="body2" color="text.secondary">
              {movie.average_rating ? `${movie.average_rating}/10` : 'No ratings'}
            </Typography>
            <Chip
              icon={<PeopleIcon />}
              label={`${movie.review_count} reviews`}
              size="small"
              variant="outlined"
              sx={{ ml: 'auto' }}
            />
          </Box>

          {/* Release Date */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
            <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {format(new Date(movie.release_date), 'MMM dd, yyyy')}
            </Typography>
          </Box>

          {/* Description Preview */}
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.4,
            }}
          >
            {movie.description}
          </Typography>

          {/* Watch Options */}
          <WatchOptions movieId={movie.id} compact />
        </CardContent>

        <CardActions sx={{ p: 2, pt: 0 }}>
          <Button 
            component={Link}
            to={`/movies/${movie.id}`}
            variant="contained"
            fullWidth
            sx={{ 
              borderRadius: 2,
              background: 'linear-gradient(45deg, #ff4569, #ff7a96)',
              '&:hover': {
                background: 'linear-gradient(45deg, #cc1a3d, #ff4569)',
              },
            }}
          >
            View Details
          </Button>
        </CardActions>

        {/* Wishlist Count Badge */}
        {movie.wishlist_count > 0 && (
          <Chip
            label={`${movie.wishlist_count} wishlisted`}
            size="small"
            sx={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              bgcolor: 'secondary.main',
              color: 'black',
              fontWeight: 500,
            }}
          />
        )}
      </Card>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default MovieCard;