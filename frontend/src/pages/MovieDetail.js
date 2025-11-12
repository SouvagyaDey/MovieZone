import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Rating,
  Chip,
  Divider,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  Card,
  CardContent,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  CalendarToday as CalendarIcon,
  Star as StarIcon,
  People as PeopleIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  SentimentVeryDissatisfied,
  SentimentDissatisfied,
  SentimentNeutral,
  SentimentSatisfied,
  SentimentVerySatisfied,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { moviesAPI, reviewsAPI, commentsAPI, wishlistAPI } from '../services/api';
import WatchOptions from '../components/WatchOptions';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistId, setWishlistId] = useState(null);
  
  // Review dialog state
  const [reviewDialog, setReviewDialog] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, review_text: '' });
  const [editingReview, setEditingReview] = useState(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  
  // Comment state
  const [commentText, setCommentText] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  useEffect(() => {
    fetchMovieDetails();
    fetchReviews();
    fetchComments();
    if (isAuthenticated) {
      checkWishlistStatus();
    }
  }, [id, isAuthenticated]);

  const fetchMovieDetails = async () => {
    try {
      const response = await moviesAPI.getMovie(id);
      setMovie(response.data);
    } catch (err) {
      console.error('Failed to fetch movie:', err);
      setError('Failed to load movie details.');
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await reviewsAPI.getReviews({ movie: id });
      setReviews(response.data.results || response.data);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await commentsAPI.getComments({ movie: id });
      setComments(response.data.results || response.data);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkWishlistStatus = async () => {
    try {
      const response = await wishlistAPI.getWishlist();
      const wishlistItem = response.data.find(item => item.movie.id === parseInt(id));
      if (wishlistItem) {
        setIsInWishlist(true);
        setWishlistId(wishlistItem.id);
      }
    } catch (err) {
      console.error('Failed to check wishlist:', err);
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      if (isInWishlist) {
        await wishlistAPI.removeFromWishlist(wishlistId);
        setIsInWishlist(false);
        setWishlistId(null);
      } else {
        const response = await wishlistAPI.addToWishlist(id);
        setIsInWishlist(true);
        setWishlistId(response.data.id);
      }
    } catch (err) {
      console.error('Wishlist error:', err);
    }
  };

  const handleReviewSubmit = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!reviewForm.review_text.trim() || !reviewForm.rating) {
      return;
    }

    setReviewSubmitting(true);
    try {
      const reviewData = {
        movie_id: parseInt(id),
        rating: reviewForm.rating,
        review_text: reviewForm.review_text.trim(),
      };

      if (editingReview) {
        await reviewsAPI.updateReview(editingReview.id, reviewData);
      } else {
        await reviewsAPI.createReview(reviewData);
      }

      setReviewDialog(false);
      setReviewForm({ rating: 5, review_text: '' });
      setEditingReview(null);
      fetchReviews();
      fetchMovieDetails(); // Refresh to update average rating
    } catch (err) {
      console.error('Review submission error:', err);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!isAuthenticated || !commentText.trim()) return;

    setCommentSubmitting(true);
    try {
      await commentsAPI.createComment({
        movie: parseInt(id),
        comment_text: commentText.trim(),
      });
      setCommentText('');
      fetchComments();
    } catch (err) {
      console.error('Comment submission error:', err);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await reviewsAPI.deleteReview(reviewId);
      fetchReviews();
      fetchMovieDetails();
    } catch (err) {
      console.error('Delete review error:', err);
    }
  };

  const getSentimentIcon = (score) => {
    if (score >= 9) return <SentimentVerySatisfied color="success" />;
    if (score >= 7) return <SentimentSatisfied color="primary" />;
    if (score >= 4) return <SentimentNeutral color="action" />;
    if (score >= 2) return <SentimentDissatisfied color="warning" />;
    return <SentimentVeryDissatisfied color="error" />;
  };

  const getSentimentLabel = (score) => {
    if (score >= 9) return "Very Positive";
    if (score >= 7) return "Positive";
    if (score >= 4) return "Neutral";
    if (score >= 2) return "Negative";
    return "Very Negative";
  };

  const getSentimentColor = (score) => {
    if (score >= 9) return "success";
    if (score >= 7) return "primary";
    if (score >= 4) return "default";
    if (score >= 2) return "warning";
    return "error";
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-movie.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:8000${imagePath}`;
  };

  const userReview = reviews.find(review => review.user === user?.id);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error || !movie) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Movie not found'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
      >
        Back to Movies
      </Button>

      {/* Movie Header */}
      <Paper elevation={2} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
        <Grid container spacing={4}>
          {/* Movie Poster */}
          <Grid item xs={12} md={4}>
            <Box
              component="img"
              src={getImageUrl(movie.image)}
              alt={movie.title}
              sx={{
                width: '100%',
                borderRadius: 2,
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              }}
              onError={(e) => {
                e.target.src = '/placeholder-movie.jpg';
              }}
            />
          </Grid>

          {/* Movie Info */}
          <Grid item xs={12} md={8}>
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
                {movie.title}
              </Typography>

              {/* Rating and Stats */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Rating
                    value={movie.average_rating / 2}
                    precision={0.1}
                    readOnly
                    icon={<StarIcon fontSize="inherit" />}
                  />
                  <Typography variant="h6" fontWeight={600}>
                    {movie.average_rating ? `${movie.average_rating}/10` : 'No ratings'}
                  </Typography>
                </Box>
                <Chip
                  icon={<PeopleIcon />}
                  label={`${movie.review_count} reviews`}
                  variant="outlined"
                />
                <Chip
                  icon={<FavoriteIcon />}
                  label={`${movie.wishlist_count} wishlisted`}
                  variant="outlined"
                />
              </Box>

              {/* Release Date */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <CalendarIcon color="action" />
                <Typography variant="body1" color="text.secondary">
                  Released on {format(new Date(movie.release_date), 'MMMM dd, yyyy')}
                </Typography>
              </Box>

              {/* Description */}
              <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7, flexGrow: 1 }}>
                {movie.description}
              </Typography>

              {/* Watch Options */}
              <WatchOptions movieId={movie.id} />

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={userReview ? <EditIcon /> : <AddIcon />}
                  onClick={() => {
                    if (userReview) {
                      setEditingReview(userReview);
                      setReviewForm({
                        rating: userReview.rating,
                        review_text: userReview.review_text,
                      });
                    }
                    setReviewDialog(true);
                  }}
                  disabled={!isAuthenticated}
                  sx={{ minWidth: 120 }}
                >
                  {userReview ? 'Edit Review' : 'Add Review'}
                </Button>

                <Button
                  variant={isInWishlist ? "contained" : "outlined"}
                  startIcon={isInWishlist ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  onClick={handleWishlistToggle}
                  disabled={!isAuthenticated}
                  color={isInWishlist ? "primary" : "inherit"}
                  sx={{ minWidth: 120 }}
                >
                  {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={4}>
        {/* Reviews Section */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              Reviews ({reviews.length})
            </Typography>

            {reviews.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  No reviews yet. Be the first to review this movie!
                </Typography>
              </Box>
            ) : (
              <Box sx={{ mt: 2 }}>
                {reviews.map((review) => (
                  <Card key={review.id} sx={{ mb: 2, bgcolor: 'background.default' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {review.username?.[0]?.toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {review.username}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Rating
                                value={review.rating / 2}
                                precision={0.5}
                                size="small"
                                readOnly
                              />
                              <Typography variant="body2" color="text.secondary">
                                {review.rating}/10
                              </Typography>
                              {review.sentiment_score && (
                                <Tooltip title={`Sentiment: ${getSentimentLabel(review.sentiment_score)}`}>
                                  <Chip
                                    icon={getSentimentIcon(review.sentiment_score)}
                                    label={getSentimentLabel(review.sentiment_score)}
                                    size="small"
                                    color={getSentimentColor(review.sentiment_score)}
                                    variant="outlined"
                                  />
                                </Tooltip>
                              )}
                            </Box>
                          </Box>
                        </Box>
                        
                        {review.user === user?.id && (
                          <Box>
                            <IconButton
                              onClick={() => {
                                setEditingReview(review);
                                setReviewForm({
                                  rating: review.rating,
                                  review_text: review.review_text,
                                });
                                setReviewDialog(true);
                              }}
                              size="small"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => handleDeleteReview(review.id)}
                              size="small"
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        )}
                      </Box>
                      
                      <Typography variant="body1">
                        {review.review_text}
                      </Typography>
                      
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {format(new Date(review.created_at), 'MMM dd, yyyy')}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Comments Section */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Comments ({comments.length})
            </Typography>

            {/* Add Comment */}
            {isAuthenticated && (
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="contained"
                  onClick={handleCommentSubmit}
                  disabled={!commentText.trim() || commentSubmitting}
                  fullWidth
                >
                  {commentSubmitting ? <CircularProgress size={20} /> : 'Post Comment'}
                </Button>
              </Box>
            )}

            <Divider sx={{ mb: 2 }} />

            {/* Comments List */}
            {comments.length === 0 ? (
              <Typography color="text.secondary" variant="body2">
                No comments yet.
              </Typography>
            ) : (
              <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                {comments.map((comment) => (
                  <Box key={comment.id} sx={{ mb: 2, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                        {comment.username?.[0]?.toUpperCase()}
                      </Avatar>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {comment.username}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {comment.comment_text}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(comment.created_at), 'MMM dd, yyyy')}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Review Dialog */}
      <Dialog 
        open={reviewDialog} 
        onClose={() => setReviewDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingReview ? 'Edit Review' : 'Add Review'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography gutterBottom>Rating</Typography>
            <Rating
              value={reviewForm.rating / 2}
              onChange={(_, value) => setReviewForm({ ...reviewForm, rating: value * 2 })}
              precision={0.5}
              size="large"
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Your Review"
              value={reviewForm.review_text}
              onChange={(e) => setReviewForm({ ...reviewForm, review_text: e.target.value })}
              placeholder="Share your thoughts about this movie..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleReviewSubmit}
            variant="contained"
            disabled={!reviewForm.review_text.trim() || reviewSubmitting}
          >
            {reviewSubmitting ? <CircularProgress size={20} /> : (editingReview ? 'Update' : 'Submit')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MovieDetail;