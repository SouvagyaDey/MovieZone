import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardMedia,
  CardContent,
  Grid,
  Button,
  Paper,
  TextField,
  Rating,
  Avatar,
  IconButton,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Fab,
  Tooltip
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  ArrowBack,
  Edit,
  Delete,
  Send,
  Comment as CommentIcon,
  AccessTime,
  Person
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext.jsx';
import { movieAPI } from '../services/api.jsx';
import { getSentimentLabel, getSentimentColor, getRatingDescription } from '../utils/sentimentAnalysis.js';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isInWishlist, setIsInWishlist] = useState(false);

  const [reviewForm, setReviewForm] = useState({
    review_text: '',
    rating: 5
  });
  const [commentForm, setCommentForm] = useState({
    comment_text: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMovieDetails();
    fetchReviews();
    fetchComments();
    if (isAuthenticated) {
      checkWishlist();
    }
  }, [id, isAuthenticated]);

  const fetchMovieDetails = async () => {
    try {
      const response = await movieAPI.getMovie(id);
      setMovie(response.data);
    } catch (error) {
      setError('Failed to load movie details');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await movieAPI.getMovieReviews(id);
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await movieAPI.getMovieComments(id);
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const checkWishlist = async () => {
    try {
      const response = await movieAPI.getWishlist();
      const wishlistData = Array.isArray(response.data) ? response.data : response.data.results || [];
      console.log('Wishlist data:', wishlistData);
      console.log('Current movie ID:', parseInt(id));
      
      // Check both item.movie.id and item.movie_id for compatibility
      const isInList = wishlistData.some(item => {
        const movieId = item.movie?.id || item.movie_id || item.movie;
        return movieId === parseInt(id);
      });
      
      setIsInWishlist(isInList);
    } catch (error) {
      console.error('Error checking wishlist:', error);
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      if (isInWishlist) {
        await movieAPI.removeFromWishlist(id);
        setSuccessMessage('Movie removed from wishlist!');
      } else {
        await movieAPI.addToWishlist(id);
        setSuccessMessage('Movie added to wishlist!');
      }
      setIsInWishlist(!isInWishlist);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
      // Clear any previous errors
      setError('');
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Failed to update wishlist';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      // Clear error after 5 seconds
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      console.log('Submitting review:', {
        ...reviewForm,
        movie_id: id
      });
      
      await movieAPI.createReview({
        ...reviewForm,
        movie_id: id
      });
      setReviewForm({ review_text: '', rating: 5 });
      fetchReviews();
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error('Review submission error:', error);
      console.error('Error response:', error.response?.data);
      setError(error.response?.data?.detail || error.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      console.log('Submitting comment:', {
        comment_text: commentForm.comment_text,
        movie: parseInt(id)
      });
      
      await movieAPI.createComment({
        comment_text: commentForm.comment_text,
        movie: parseInt(id)
      });
      
      setCommentForm({ comment_text: '' });
      fetchComments();
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error('Comment submission error:', error);
      console.error('Error response:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to submit comment');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  if (error || !movie) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Movie not found'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/movies')}
          sx={{ 
            mb: 3,
            color: '#f5c518',
            '&:hover': {
              backgroundColor: 'rgba(245, 197, 24, 0.1)',
              color: '#daa520'
            }
          }}
        >
          Back to Movies
        </Button>

        {/* Success Message */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Alert 
              severity="success" 
              sx={{ 
                mb: 3,
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                border: '1px solid rgba(76, 175, 80, 0.3)',
                color: '#ffffff'
              }}
            >
              {successMessage}
            </Alert>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                backgroundColor: 'rgba(211, 47, 47, 0.1)',
                border: '1px solid rgba(211, 47, 47, 0.3)',
                color: '#ffffff'
              }}
            >
              {error}
            </Alert>
          </motion.div>
        )}

        <Paper
          elevation={10}
          sx={{
            p: 4,
            borderRadius: 4,
            background: '#1a1a1a',
            border: '1px solid #333333',
            mb: 4
          }}
        >
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Box
                  component="img"
                  src={movie.image || '/api/placeholder/400/600'}
                  alt={movie.title}
                  sx={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: 3,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                  }}
                />
              </motion.div>
            </Grid>

            <Grid item xs={12} md={8}>
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Typography
                    variant="h3"
                    component="h1"
                    gutterBottom
                    sx={{
                      fontWeight: 'bold',
                      color: '#f5c518'
                    }}
                  >
                    {movie.title}
                  </Typography>

                  {isAuthenticated && (
                    <Tooltip title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"} arrow>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Button
                          variant={isInWishlist ? "contained" : "outlined"}
                          startIcon={isInWishlist ? <Favorite /> : <FavoriteBorder />}
                          onClick={handleWishlistToggle}
                          sx={{
                            backgroundColor: isInWishlist ? '#ff4757' : 'transparent',
                            color: isInWishlist ? '#ffffff' : '#ff4757',
                            borderColor: '#ff4757',
                            '&:hover': {
                              backgroundColor: isInWishlist ? '#e63946' : 'rgba(255, 71, 87, 0.1)',
                              borderColor: '#ff4757',
                            },
                            fontWeight: 'bold',
                            px: 3,
                            py: 1
                          }}
                        >
                          {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
                        </Button>
                      </motion.div>
                    </Tooltip>
                  )}
                </Box>

                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <Chip
                    label={new Date(movie.release_date).toLocaleDateString()}
                    color="primary"
                    icon={<AccessTime />}
                  />
                  
                  {averageRating > 0 ? (
                    <Box display="flex" alignItems="center" flexWrap="wrap" gap={2}>
                      <Box display="flex" alignItems="center">
                        <Rating value={averageRating} readOnly precision={0.1} />
                        <Typography variant="body1" sx={{ ml: 1, color: '#ffffff', fontWeight: 'bold' }}>
                          {averageRating.toFixed(1)}
                        </Typography>
                      </Box>
                      
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip
                          label={getSentimentLabel(averageRating)}
                          sx={{
                            backgroundColor: getSentimentColor(averageRating),
                            color: '#ffffff',
                            fontWeight: 'bold',
                            fontSize: '0.75rem'
                          }}
                        />
                        <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                          {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Box display="flex" alignItems="center">
                      <Chip
                        label="No Reviews Yet"
                        sx={{
                          backgroundColor: '#666666',
                          color: '#ffffff',
                          fontWeight: 'bold',
                          fontSize: '0.75rem'
                        }}
                      />
                    </Box>
                  )}
                </Box>

                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, color: '#e0e0e0' }}>
                  {movie.description}
                </Typography>

                {/* Sentiment Analysis Summary */}
                {averageRating > 0 && reviews.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    <Paper
                      sx={{
                        p: 3,
                        backgroundColor: '#2a2a2a',
                        border: '1px solid #444444',
                        borderRadius: 3,
                        mb: 3
                      }}
                    >
                      <Typography variant="h6" sx={{ color: '#f5c518', fontWeight: 'bold', mb: 2 }}>
                        📊 Audience Reception
                      </Typography>
                      
                      <Box display="flex" alignItems="center" flexWrap="wrap" gap={3}>
                        <Box textAlign="center">
                          <Typography variant="h4" sx={{ color: getSentimentColor(averageRating), fontWeight: 'bold' }}>
                            {averageRating.toFixed(1)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#b0b0b0' }}>
                            Average Rating
                          </Typography>
                        </Box>
                        
                        <Box flex={1}>
                          <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 'bold', mb: 1 }}>
                            {getSentimentLabel(averageRating)} Reception
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#e0e0e0', lineHeight: 1.6 }}>
                            Based on {reviews.length} user {reviews.length === 1 ? 'review' : 'reviews'}, 
                            this movie has received a <strong style={{ color: getSentimentColor(averageRating) }}>
                            {getSentimentLabel(averageRating).toLowerCase()}</strong> response from viewers.
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </motion.div>
                )}
              </motion.div>
            </Grid>
          </Grid>
        </Paper>

        {/* Reviews Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Paper elevation={5} sx={{ p: 4, borderRadius: 3, mb: 4, backgroundColor: '#1a1a1a', border: '1px solid #333333' }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3, color: '#f5c518' }}>
              Reviews ({reviews.length})
            </Typography>

            {isAuthenticated && (
              <Card sx={{ mb: 4, borderRadius: 2, backgroundColor: '#2a2a2a', border: '1px solid #444444' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: '#ffffff' }}>
                    Write a Review
                  </Typography>
                  <form onSubmit={handleReviewSubmit}>
                    <Box mb={2}>
                      <Typography component="legend" gutterBottom sx={{ color: '#e0e0e0' }}>
                        Rating
                      </Typography>
                      <Rating
                        value={reviewForm.rating}
                        onChange={(e, newValue) => 
                          setReviewForm(prev => ({ ...prev, rating: newValue || 1 }))
                        }
                        size="large"
                      />
                    </Box>
                    
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      placeholder="Share your thoughts about this movie..."
                      value={reviewForm.review_text}
                      onChange={(e) => 
                        setReviewForm(prev => ({ ...prev, review_text: e.target.value }))
                      }
                      required
                      sx={{ mb: 2 }}
                    />

                    <Button
                      type="submit"
                      variant="contained"
                      disabled={submitting}
                      endIcon={<Send />}
                      sx={{
                        background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)',
                        }
                      }}
                    >
                      Submit Review
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            <AnimatePresence>
              {reviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <Card sx={{ mb: 2, borderRadius: 2 }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          <Person />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {review.username || 'Anonymous'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#b0b0b0' }}>
                            {formatDate(review.created_at)}
                          </Typography>
                        </Box>
                        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={getSentimentLabel(review.rating)}
                            size="small"
                            sx={{
                              backgroundColor: getSentimentColor(review.rating),
                              color: '#ffffff',
                              fontSize: '0.7rem',
                              height: '24px'
                            }}
                          />
                          <Rating value={review.rating} readOnly size="small" />
                        </Box>
                      </Box>
                      <Typography variant="body1" sx={{ color: '#e0e0e0' }}>
                        {review.review_text}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </Paper>
        </motion.div>

        {/* Comments Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Paper elevation={5} sx={{ p: 4, borderRadius: 3, backgroundColor: '#1a1a1a', border: '1px solid #333333' }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3, color: '#f5c518' }}>
              Comments ({comments.length})
            </Typography>

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  backgroundColor: 'rgba(211, 47, 47, 0.1)',
                  border: '1px solid rgba(211, 47, 47, 0.3)',
                  color: '#ffffff'
                }}
              >
                {error}
              </Alert>
            )}

            {isAuthenticated && (
              <Card sx={{ mb: 4, borderRadius: 2, backgroundColor: '#2a2a2a', border: '1px solid #444444' }}>
                <CardContent>
                  <form onSubmit={handleCommentSubmit}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Add a comment..."
                      value={commentForm.comment_text}
                      onChange={(e) => 
                        setCommentForm(prev => ({ ...prev, comment_text: e.target.value }))
                      }
                      required
                      sx={{ mb: 2 }}
                    />

                    <Button
                      type="submit"
                      variant="outlined"
                      disabled={submitting}
                      endIcon={<Send />}
                    >
                      Post Comment
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            <AnimatePresence>
              {comments.map((comment, index) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <Card sx={{ mb: 2, borderRadius: 2 }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={1}>
                        <Avatar sx={{ mr: 2, bgcolor: 'secondary.main', width: 32, height: 32 }}>
                          <Person fontSize="small" />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {comment.username || 'Anonymous'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#b0b0b0' }}>
                            {formatDate(comment.created_at)}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" sx={{ ml: 5 }}>
                        {comment.comment_text}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </Paper>
        </motion.div>
      </motion.div>
    </Container>
  );
};

export default MovieDetail;
