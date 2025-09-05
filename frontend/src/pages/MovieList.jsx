import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Chip,
  Paper,
  Tab,
  Tabs,
  Button
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  TrendingUp, 
  Star,
  Whatshot,
  NewReleases,
  ViewModule,
  ViewList
} from '@mui/icons-material';
import MovieCard from '../components/MovieCard.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { movieAPI } from '../services/api.jsx';

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  const [currentFilter, setCurrentFilter] = useState('all');
  const [categoryCounts, setCategoryCounts] = useState({});

  const { isAuthenticated } = useAuth();

  const filterOptions = [
    { label: 'All Movies', value: 'all', icon: <ViewModule /> },
    { label: 'Trending', value: 'trending', icon: <TrendingUp /> },
    { label: 'Top Rated', value: 'top-rated', icon: <Star /> },
    { label: 'Latest', value: 'latest', icon: <NewReleases /> }
  ];

  useEffect(() => {
    fetchMovies();
    fetchCategoryCounts();
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated, currentFilter]);

  useEffect(() => {
    if (searchQuery) {
      handleSearch();
    } else {
      fetchMovies();
    }
  }, [searchQuery, currentFilter]);

  const fetchMovies = async (filter = currentFilter, search = searchQuery) => {
    try {
      setLoading(true);
      const filterParam = filter === 'all' ? null : filter;
      const response = await movieAPI.getMovies(filterParam, search || null);
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      setMovies(data);
    } catch (error) {
      setError('Failed to load movies');
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryCounts = async () => {
    try {
      const response = await movieAPI.getMovieCategories();
      setCategoryCounts(response.data);
    } catch (error) {
      console.error('Error fetching category counts:', error);
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      await fetchMovies(currentFilter, searchQuery.trim());
    }
  };

  const handleFilterChange = (filterValue) => {
    setCurrentFilter(filterValue);
    setTabValue(filterOptions.findIndex(opt => opt.value === filterValue));
  };

  const fetchWishlist = async () => {
    try {
      const response = await movieAPI.getWishlist();
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      setWishlist(data.map(item => item.movie.id));
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const handleWishlistToggle = (movieId, isAdded) => {
    if (isAdded) {
      setWishlist(prev => [...prev, movieId]);
    } else {
      setWishlist(prev => prev.filter(id => id !== movieId));
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    const selectedFilter = filterOptions[newValue];
    handleFilterChange(selectedFilter.value);
  };

  if (loading) {
    return (
      <Box sx={{ 
        backgroundColor: '#0f1419', 
        minHeight: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={80} sx={{ color: '#f5c518', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#f5c518' }}>
            Loading Movies...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#0f1419', minHeight: '100vh' }}>
      {/* Hero Banner */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, rgba(245, 197, 24, 0.1) 0%, rgba(15, 20, 25, 0.9) 100%)',
          borderBottom: '1px solid #333333',
          py: 4
        }}
      >
        <Container maxWidth="xl">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  color: '#f5c518',
                  fontWeight: 'bold',
                  mb: 2,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  textShadow: '2px 2px 4px rgba(0,0,0,0.7)'
                }}
              >
                IMDb Movie Collection
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#b0b0b0', 
                  maxWidth: 800, 
                  mx: 'auto',
                  lineHeight: 1.6,
                  mb: 3
                }}
              >
                Discover, rate, and review the world's most captivating films. 
                Your ultimate destination for cinematic excellence.
              </Typography>
            </Box>

            {/* Search Bar */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search for movies, genres, directors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                sx={{ 
                  maxWidth: 700,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(26, 26, 26, 0.8)',
                    borderRadius: 4,
                    fontSize: '1.1rem',
                    '& fieldset': {
                      borderColor: '#333333',
                      borderWidth: 2
                    },
                    '&:hover fieldset': {
                      borderColor: '#f5c518'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#f5c518',
                      boxShadow: '0 0 0 3px rgba(245, 197, 24, 0.1)'
                    }
                  },
                  '& .MuiOutlinedInput-input': {
                    color: '#ffffff',
                    py: 2
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: '#f5c518', fontSize: '1.8rem' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Category Tabs */}
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Paper 
                sx={{ 
                  backgroundColor: 'rgba(26, 26, 26, 0.8)', 
                  borderRadius: 3,
                  border: '1px solid #333333'
                }}
              >
                <Tabs 
                  value={tabValue} 
                  onChange={handleTabChange}
                  sx={{
                    '& .MuiTab-root': {
                      color: '#b0b0b0',
                      fontWeight: 600,
                      '&.Mui-selected': {
                        color: '#f5c518'
                      }
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: '#f5c518',
                      height: 3
                    }
                  }}
                >
                  {filterOptions.map((option, index) => (
                    <Tab 
                      key={option.value}
                      icon={option.icon} 
                      label={`${option.label} ${categoryCounts[option.value] ? `(${categoryCounts[option.value]})` : ''}`}
                      iconPosition="start"
                    />
                  ))}
                </Tabs>
              </Paper>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Movies Grid */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
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

        {/* Results Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h5" sx={{ color: '#ffffff', mb: 1 }}>
                {searchQuery ? `Search Results for "${searchQuery}"` : 
                 filterOptions.find(f => f.value === currentFilter)?.label || 'Featured Movies'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                {movies.length} movie{movies.length !== 1 ? 's' : ''} found
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant={viewMode === 'grid' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('grid')}
                sx={{
                  color: viewMode === 'grid' ? '#000000' : '#f5c518',
                  backgroundColor: viewMode === 'grid' ? '#f5c518' : 'transparent',
                  borderColor: '#f5c518',
                  '&:hover': {
                    backgroundColor: viewMode === 'grid' ? '#daa520' : 'rgba(245, 197, 24, 0.1)'
                  }
                }}
              >
                <ViewModule />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('list')}
                sx={{
                  color: viewMode === 'list' ? '#000000' : '#f5c518',
                  backgroundColor: viewMode === 'list' ? '#f5c518' : 'transparent',
                  borderColor: '#f5c518',
                  '&:hover': {
                    backgroundColor: viewMode === 'list' ? '#daa520' : 'rgba(245, 197, 24, 0.1)'
                  }
                }}
              >
                <ViewList />
              </Button>
            </Box>
          </Box>
        </motion.div>

        {/* Movies Grid */}
        {movies.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 8,
                textAlign: 'center',
                backgroundColor: 'rgba(26, 26, 26, 0.5)',
                border: '1px solid #333333',
                borderRadius: 4
              }}
            >
              <Typography variant="h4" sx={{ color: '#f5c518', mb: 2 }}>
                {searchQuery ? 'No movies found' : 'No movies available'}
              </Typography>
              <Typography variant="body1" sx={{ color: '#b0b0b0', mb: 4 }}>
                {searchQuery 
                  ? `Try adjusting your search terms for "${searchQuery}"`
                  : 'Check back soon for new movie additions!'
                }
              </Typography>
              {searchQuery && (
                <Button
                  variant="contained"
                  onClick={() => setSearchQuery('')}
                  sx={{
                    background: 'linear-gradient(45deg, #f5c518 0%, #daa520 100%)',
                    color: '#000000',
                    fontWeight: 'bold',
                    px: 4,
                    py: 1.5
                  }}
                >
                  Clear Search
                </Button>
              )}
            </Paper>
          </motion.div>
        ) : (
          <Grid container spacing={3}>
            <AnimatePresence mode="popLayout">
              {movies.map((movie, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={movie.id}>
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ 
                      delay: index * 0.05, 
                      duration: 0.5,
                      type: "spring",
                      stiffness: 100
                    }}
                  >
                    <MovieCard
                      movie={movie}
                      onWishlistToggle={handleWishlistToggle}
                      isInWishlist={wishlist.includes(movie.id)}
                    />
                  </motion.div>
                </Grid>
              ))}
            </AnimatePresence>
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default MovieList;
