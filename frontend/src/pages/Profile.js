import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Avatar,
  Button,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Person as PersonIcon,
  Movie as MovieIcon,
  Star as StarIcon,
  Favorite as FavoriteIcon,
  Comment as CommentIcon,
  TrendingUp as TrendingIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { reviewsAPI, wishlistAPI, commentsAPI } from '../services/api';

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [userStats, setUserStats] = useState({
    reviews: [],
    wishlist: [],
    comments: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchUserData();
  }, [isAuthenticated, navigate]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [reviewsRes, wishlistRes, commentsRes] = await Promise.all([
        reviewsAPI.getReviews({ user: user.id }),
        wishlistAPI.getWishlist(),
        commentsAPI.getComments({ user: user.id }),
      ]);

      setUserStats({
        reviews: reviewsRes.data.results || reviewsRes.data || [],
        wishlist: wishlistRes.data || [],
        comments: commentsRes.data.results || commentsRes.data || [],
      });
    } catch (err) {
      console.error('Failed to fetch user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAverageRating = () => {
    if (userStats.reviews.length === 0) return 0;
    const sum = userStats.reviews.reduce((total, review) => total + review.rating, 0);
    return (sum / userStats.reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    userStats.reviews.forEach(review => {
      const starRating = Math.ceil(review.rating / 2); // Convert 10-point to 5-point
      distribution[starRating]++;
    });
    return distribution;
  };

  const getMostRecentActivity = () => {
    const activities = [
      ...userStats.reviews.map(r => ({ type: 'review', date: r.created_at, data: r })),
      ...userStats.comments.map(c => ({ type: 'comment', date: c.created_at, data: c })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return activities.slice(0, 5);
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ width: '100%' }}>
          <LinearProgress />
        </Box>
      </Container>
    );
  }

  const ratingDistribution = getRatingDistribution();
  const recentActivity = getMostRecentActivity();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Profile Header */}
      <Paper elevation={2} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: 'primary.main',
                fontSize: '2rem',
                fontWeight: 700,
              }}
            >
              {user?.username?.[0]?.toUpperCase()}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h4" gutterBottom fontWeight={700}>
              {user?.first_name} {user?.last_name}
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              @{user?.username}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {user?.email}
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {user?.is_staff && (
                <Chip 
                  label="Admin" 
                  color="primary" 
                  icon={<PersonIcon />} 
                  variant="filled"
                />
              )}
              <Chip 
                label={`Member since ${format(new Date(user?.date_joined), 'MMM yyyy')}`} 
                variant="outlined" 
              />
            </Box>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              disabled
            >
              Edit Profile
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={4}>
        {/* Stats Overview */}
        <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <StarIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h4" fontWeight={700}>
                    {userStats.reviews.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Reviews Written
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <FavoriteIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                  <Typography variant="h4" fontWeight={700}>
                    {userStats.wishlist.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Movies Wishlisted
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <CommentIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                  <Typography variant="h4" fontWeight={700}>
                    {userStats.comments.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Comments Posted
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <TrendingIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                  <Typography variant="h4" fontWeight={700}>
                    {getAverageRating()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Rating Given
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Rating Distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Your Rating Distribution
              </Typography>
              <Box sx={{ mt: 2 }}>
                {[5, 4, 3, 2, 1].map((stars) => (
                  <Box key={stars} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 60 }}>
                      <Typography variant="body2" sx={{ mr: 1 }}>{stars}</Typography>
                      <StarIcon sx={{ fontSize: 16, color: 'secondary.main' }} />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(ratingDistribution[stars] / Math.max(userStats.reviews.length, 1)) * 100}
                      sx={{ flexGrow: 1, mx: 2, height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="body2" sx={{ minWidth: 30 }}>
                      {ratingDistribution[stars]}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Recent Activity
              </Typography>
              <List>
                {recentActivity.length === 0 ? (
                  <ListItem>
                    <ListItemText
                      primary="No recent activity"
                      secondary="Start reviewing and commenting on movies!"
                    />
                  </ListItem>
                ) : (
                  recentActivity.map((activity, index) => (
                    <ListItem key={index} divider={index < recentActivity.length - 1}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: activity.type === 'review' ? 'primary.main' : 'success.main' }}>
                          {activity.type === 'review' ? <StarIcon /> : <CommentIcon />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          activity.type === 'review' 
                            ? `Reviewed "${activity.data.movie?.title || 'a movie'}"`
                            : `Commented on "${activity.data.movie?.title || 'a movie'}"`
                        }
                        secondary={format(new Date(activity.date), 'MMM dd, yyyy \'at\' h:mm a')}
                      />
                    </ListItem>
                  ))
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Reviews */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Your Recent Reviews
              </Typography>
              {userStats.reviews.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <MovieIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                  <Typography color="text.secondary">
                    You haven't written any reviews yet.
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/movies')}
                    sx={{ mt: 2 }}
                  >
                    Browse Movies
                  </Button>
                </Box>
              ) : (
                <Box sx={{ mt: 2 }}>
                  {userStats.reviews.slice(0, 3).map((review) => (
                    <Card key={review.id} variant="outlined" sx={{ mb: 2 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {review.movie?.title}
                          </Typography>
                          <Chip 
                            label={`${review.rating}/10`} 
                            color="primary" 
                            size="small" 
                          />
                        </Box>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {review.review_text}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(review.created_at), 'MMM dd, yyyy')}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                  {userStats.reviews.length > 3 && (
                    <Button variant="outlined" fullWidth>
                      View All Reviews ({userStats.reviews.length})
                    </Button>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;