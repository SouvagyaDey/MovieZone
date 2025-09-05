import React, { useState } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  Rating,
  Button,
  Backdrop
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Favorite, 
  FavoriteBorder, 
  Visibility, 
  Star,
  Add,
  Remove,
  StarBorder
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { movieAPI } from '../services/api.jsx';

const MovieCard = ({ movie, onWishlistToggle, isInWishlist }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [hover, setHover] = useState(false);

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      if (isInWishlist) {
        await movieAPI.removeFromWishlist(movie.id);
      } else {
        await movieAPI.addToWishlist(movie.id);
      }
      onWishlistToggle && onWishlistToggle(movie.id, !isInWishlist);
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).getFullYear();
  };

  // Use the average rating from backend, fallback to 0 if not available
  const averageRating = movie.average_rating || 0;
  const reviewCount = movie.review_count || 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
    >
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          overflow: 'hidden',
          backgroundColor: '#1a1a1a',
          border: hover ? '2px solid #f5c518' : '2px solid transparent',
          boxShadow: hover 
            ? '0 25px 50px rgba(245, 197, 24, 0.3)' 
            : '0 10px 30px rgba(0, 0, 0, 0.5)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          position: 'relative'
        }}
        onClick={() => navigate(`/movies/${movie.id}`)}
      >
        {/* Movie Poster */}
        <Box sx={{ position: 'relative', overflow: 'hidden' }}>
          <CardMedia
            component="img"
            height="400"
            image={movie.image || `https://via.placeholder.com/400x600/333333/f5c518?text=${encodeURIComponent(movie.title)}`}
            alt={movie.title}
            sx={{
              objectFit: 'cover',
              transition: 'transform 0.3s ease-in-out',
              transform: hover ? 'scale(1.1)' : 'scale(1)'
            }}
          />

          {/* IMDB Rating Badge */}
          {averageRating > 0 && (
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                left: 8,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                borderRadius: '4px',
                padding: '4px 8px',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}
            >
              <Star sx={{ color: '#f5c518', fontSize: '16px' }} />
              <Typography variant="caption" sx={{ color: '#f5c518', fontWeight: 'bold' }}>
                {averageRating}/10
              </Typography>
            </Box>
          )}

          {/* Wishlist Button */}
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 2
            }}
          >
            <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleWishlistToggle();
                }}
                disabled={loading}
                sx={{
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  color: isInWishlist ? '#f5c518' : '#ffffff',
                  '&:hover': {
                    backgroundColor: 'rgba(245, 197, 24, 0.2)'
                  }
                }}
              >
                {isInWishlist ? <Favorite /> : <FavoriteBorder />}
              </IconButton>
            </motion.div>
          </Box>

          {/* Hover Overlay - removed play button */}
          <AnimatePresence>
            {hover && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1
                }}
              >
                {/* Play button removed */}
              </motion.div>
            )}
          </AnimatePresence>
        </Box>

        {/* Movie Info */}
        <CardContent sx={{ flexGrow: 1, p: 2, backgroundColor: '#1a1a1a' }}>
          <Box sx={{ mb: 1 }}>
            <Typography 
              variant="h6" 
              component="h2"
              sx={{
                fontWeight: 'bold',
                color: '#ffffff',
                mb: 0.5,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                lineHeight: 1.3,
                minHeight: '2.6em'
              }}
            >
              {movie.title}
            </Typography>
            
            <Chip
              label={formatDate(movie.release_date)}
              size="small"
              sx={{
                backgroundColor: 'rgba(245, 197, 24, 0.1)',
                color: '#f5c518',
                border: '1px solid rgba(245, 197, 24, 0.3)',
                fontWeight: 'bold',
                mb: 1
              }}
            />
          </Box>

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
              mb: 2,
              color: '#b0b0b0'
            }}
          >
            {movie.description}
          </Typography>

          {/* Rating Stars */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Rating
              value={averageRating / 2} // Convert 10-point scale to 5-point scale
              precision={0.1}
              readOnly
              size="small"
              sx={{
                '& .MuiRating-iconFilled': {
                  color: '#f5c518'
                },
                '& .MuiRating-iconEmpty': {
                  color: '#333333'
                }
              }}
            />
            <Typography variant="caption" sx={{ color: '#b0b0b0' }}>
              ({averageRating > 0 ? `${averageRating}/10` : 'No ratings'})
              {reviewCount > 0 && ` • ${reviewCount} reviews`}
            </Typography>
          </Box>

          {/* Action Button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Visibility />}
              sx={{
                mt: 2,
                borderColor: '#f5c518',
                color: '#f5c518',
                '&:hover': {
                  borderColor: '#daa520',
                  backgroundColor: 'rgba(245, 197, 24, 0.1)',
                  color: '#daa520'
                }
              }}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/movies/${movie.id}`);
              }}
            >
              View Details
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MovieCard;
