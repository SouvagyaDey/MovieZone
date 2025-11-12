import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Pagination,
  Fab,
  Zoom,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import MovieFilters from '../components/MovieFilters';
import { moviesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const itemsPerPage = 12;

  // Get current filter parameters
  const currentFilter = searchParams.get('filter') || 'all';
  const currentSearch = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page')) || 1;

  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);

  useEffect(() => {
    fetchMovies();
    fetchCategories();
  }, [currentFilter, currentSearch, currentPage]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        page_size: itemsPerPage,
      };

      if (currentFilter && currentFilter !== 'all') {
        params.filter = currentFilter;
      }

      if (currentSearch) {
        params.search = currentSearch;
      }

      const response = await moviesAPI.getMovies(params);
      const moviesData = response.data.results || response.data || [];
      
      // Ensure moviesData is always an array
      setMovies(Array.isArray(moviesData) ? moviesData : []);
      
      // Calculate total pages if pagination is used
      if (response.data.count) {
        setTotalPages(Math.ceil(response.data.count / itemsPerPage));
      }
    } catch (err) {
      console.error('Failed to fetch movies:', err);
      setError(
        err.code === 'ERR_NETWORK' 
          ? 'Cannot connect to server. Please make sure the backend is running on port 8000.' 
          : 'Failed to load movies. Please try again.'
      );
      setMovies([]); // Ensure movies is always an array even on error
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await moviesAPI.getCategories();
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleFilterChange = (filter) => {
    const newParams = new URLSearchParams(searchParams);
    if (filter === 'all') {
      newParams.delete('filter');
    } else {
      newParams.set('filter', filter);
    }
    newParams.delete('page'); // Reset to first page
    setSearchParams(newParams);
  };

  const handleSearchChange = (search) => {
    const newParams = new URLSearchParams(searchParams);
    if (search) {
      newParams.set('search', search);
    } else {
      newParams.delete('search');
    }
    newParams.delete('page'); // Reset to first page
    setSearchParams(newParams);
  };

  const handlePageChange = (event, newPage) => {
    const newParams = new URLSearchParams(searchParams);
    if (newPage === 1) {
      newParams.delete('page');
    } else {
      newParams.set('page', newPage.toString());
    }
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageTitle = () => {
    if (currentSearch) {
      return `Search results for "${currentSearch}"`;
    }
    
    switch (currentFilter) {
      case 'trending':
        return 'Trending Movies';
      case 'top-rated':
        return 'Top Rated Movies';
      case 'latest':
        return 'Latest Movies';
      default:
        return 'All Movies';
    }
  };

  const getPageSubtitle = () => {
    const count = Array.isArray(movies) ? movies.length : 0;
    if (currentSearch) {
      return `Found ${count} movie${count !== 1 ? 's' : ''}`;
    }
    
    switch (currentFilter) {
      case 'trending':
        return 'Movies gaining popularity with recent reviews and wishlists';
      case 'top-rated':
        return 'Highest rated movies with at least 3 reviews';
      case 'latest':
        return 'Recently added to our collection';
      default:
        return 'Discover amazing movies from our collection';
    }
  };

  if (loading && (!Array.isArray(movies) || movies.length === 0)) {
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
      {/* Page Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(45deg, #ff4569, #ffd54f)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {getPageTitle()}
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          {getPageSubtitle()}
        </Typography>
      </Box>

      {/* Filters */}
      <MovieFilters
        currentFilter={currentFilter}
        currentSearch={currentSearch}
        categories={categories}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
      />

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Movies Grid */}
      {(!Array.isArray(movies) || movies.length === 0) && !loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No movies found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {currentSearch 
              ? 'Try adjusting your search terms or filters.'
              : 'Check back later for new additions to our collection.'
            }
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {Array.isArray(movies) && movies.map((movie) => (
              <Grid item key={movie.id} xs={12} sm={6} md={4} lg={3}>
                <MovieCard 
                  movie={movie} 
                  onWishlistChange={fetchMovies}
                />
              </Grid>
            ))}
          </Grid>

          {/* Loading indicator for pagination */}
          {loading && Array.isArray(movies) && movies.length > 0 && (
            <Box display="flex" justifyContent="center" my={2}>
              <CircularProgress />
            </Box>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}

      {/* Admin Add Movie FAB */}
      {user?.is_staff && (
        <Zoom in={true}>
          <Fab
            color="primary"
            aria-label="add movie"
            onClick={() => navigate('/admin/movies')}
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              background: 'linear-gradient(45deg, #ff4569, #ff7a96)',
              '&:hover': {
                background: 'linear-gradient(45deg, #cc1a3d, #ff4569)',
              },
            }}
          >
            <AddIcon />
          </Fab>
        </Zoom>
      )}
    </Container>
  );
};

export default MovieList;