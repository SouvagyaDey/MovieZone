import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Card,
  CardMedia,
  CardContent,
  IconButton
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Delete, Visibility } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { movieAPI } from '../services/api.jsx';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

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
      const response = await movieAPI.getWishlist();
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      setWishlist(data);
    } catch (error) {
      setError('Failed to load wishlist');
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (movieId) => {
    try {
      await movieAPI.removeFromWishlist(movieId);
      setWishlist(prev => prev.filter(item => item.movie.id !== movieId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      setError('Failed to remove from wishlist');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box textAlign="center" mb={4}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              background: 'linear-gradient(45deg, #ff6b6b 0%, #ee5a24 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold',
              mb: 2
            }}
          >
            My Wishlist
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Your favorite movies collection
          </Typography>
        </Box>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        </motion.div>
      )}

      {wishlist.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Paper
            elevation={5}
            sx={{
              p: 8,
              textAlign: 'center',
              borderRadius: 4,
              background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)'
            }}
          >
            <Typography variant="h4" color="text.secondary" gutterBottom>
              Your wishlist is empty
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Start exploring movies and add them to your wishlist!
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/movies')}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 3,
                background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)',
                }
              }}
            >
              Browse Movies
            </Button>
          </Paper>
        </motion.div>
      ) : (
        <Grid container spacing={3}>
          <AnimatePresence>
            {wishlist.map((item, index) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -50 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  transition={{ 
                    delay: index * 0.1, 
                    duration: 0.5,
                    type: "spring",
                    stiffness: 100
                  }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      overflow: 'hidden',
                      background: 'linear-gradient(145deg, #ffffff 0%, #f5f7fa 100%)',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                      '&:hover': {
                        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                      },
                      transition: 'all 0.3s ease-in-out',
                      position: 'relative'
                    }}
                  >
                    <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                      <CardMedia
                        component="img"
                        height="300"
                        image={item.movie.image || '/api/placeholder/400/300'}
                        alt={item.movie.title}
                        sx={{
                          transition: 'transform 0.3s ease-in-out',
                          '&:hover': {
                            transform: 'scale(1.1)'
                          }
                        }}
                      />
                      
                      {/* Overlay with actions */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'rgba(0,0,0,0.7)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0,
                          transition: 'opacity 0.3s ease-in-out',
                          '&:hover': {
                            opacity: 1
                          }
                        }}
                        className="card-overlay"
                      >
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <IconButton
                            onClick={() => navigate(`/movies/${item.movie.id}`)}
                            sx={{ 
                              color: 'white', 
                              backgroundColor: 'rgba(255,255,255,0.2)',
                              mr: 1,
                              '&:hover': {
                                backgroundColor: 'rgba(255,255,255,0.3)'
                              }
                            }}
                          >
                            <Visibility />
                          </IconButton>
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <IconButton
                            onClick={() => handleRemoveFromWishlist(item.movie.id)}
                            sx={{ 
                              color: '#ff4757', 
                              backgroundColor: 'rgba(255,255,255,0.2)',
                              '&:hover': {
                                backgroundColor: 'rgba(255,255,255,0.3)'
                              }
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </motion.div>
                      </Box>
                    </Box>

                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Typography 
                        gutterBottom 
                        variant="h6" 
                        component="h2"
                        sx={{
                          fontWeight: 'bold',
                          color: '#2c3e50',
                          mb: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {item.movie.title}
                      </Typography>

                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: 1.4
                        }}
                      >
                        {item.movie.description}
                      </Typography>

                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ mt: 1, display: 'block' }}
                      >
                        Release: {new Date(item.movie.release_date).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </AnimatePresence>
        </Grid>
      )}

      <style jsx>{`
        .card-overlay {
          opacity: 0;
        }
        .MuiCard-root:hover .card-overlay {
          opacity: 1;
        }
      `}</style>
    </Container>
  );
};

export default Wishlist;
