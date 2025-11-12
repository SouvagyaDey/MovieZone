import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Avatar,
  Tooltip,
  Fab,
  Grid,
  Card,
  CardContent,
  CardMedia,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AdminPanelSettings as AdminIcon,
  Movie as MovieIcon,
  Star as StarIcon,
  Visibility as ViewIcon,
  CloudUpload as UploadIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { moviesAPI } from '../services/api';

const AdminMovies = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialog, setDialog] = useState({ open: false, mode: 'add', movie: null });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    release_date: new Date(),
    image: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, movieId: null });

  useEffect(() => {
    if (!isAuthenticated || !user?.is_staff) {
      navigate('/');
      return;
    }
    fetchMovies();
  }, [isAuthenticated, user, navigate]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await moviesAPI.getMovies();
      setMovies(response.data.results || response.data);
    } catch (err) {
      console.error('Failed to fetch movies:', err);
      setError('Failed to load movies.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (mode, movie = null) => {
    setDialog({ open: true, mode, movie });
    if (movie) {
      setFormData({
        title: movie.title,
        description: movie.description,
        release_date: new Date(movie.release_date),
        image: null, // Don't prefill image
      });
    } else {
      setFormData({
        title: '',
        description: '',
        release_date: new Date(),
        image: null,
      });
    }
  };

  const handleCloseDialog = () => {
    setDialog({ open: false, mode: 'add', movie: null });
    setFormData({
      title: '',
      description: '',
      release_date: new Date(),
      image: null,
    });
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      return;
    }

    setSubmitting(true);
    try {
      const movieData = new FormData();
      movieData.append('title', formData.title.trim());
      movieData.append('description', formData.description.trim());
      movieData.append('release_date', format(formData.release_date, 'yyyy-MM-dd'));
      
      if (formData.image) {
        movieData.append('image', formData.image);
      }

      if (dialog.mode === 'edit') {
        await moviesAPI.updateMovie(dialog.movie.id, movieData);
      } else {
        await moviesAPI.createMovie(movieData);
      }

      handleCloseDialog();
      fetchMovies();
    } catch (err) {
      console.error('Movie submission error:', err);
      setError('Failed to save movie. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (movieId) => {
    try {
      await moviesAPI.deleteMovie(movieId);
      setDeleteConfirm({ open: false, movieId: null });
      fetchMovies();
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete movie.');
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-movie.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:8000${imagePath}`;
  };

  if (!isAuthenticated || !user?.is_staff) {
    return null; // Will redirect
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
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <AdminIcon sx={{ fontSize: 36, color: 'primary.main' }} />
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
              Movie Management
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h6" color="text.secondary">
              Manage your movie collection
            </Typography>
            
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog('add')}
              sx={{
                background: 'linear-gradient(45deg, #ff4569, #ff7a96)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #cc1a3d, #ff4569)',
                },
              }}
            >
              Add Movie
            </Button>
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Movies Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <MovieIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" fontWeight={700}>
                  {movies.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Movies
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <StarIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                <Typography variant="h4" fontWeight={700}>
                  {(movies.reduce((sum, movie) => sum + (movie.average_rating || 0), 0) / movies.length || 0).toFixed(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Avg Rating
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={700} color="success.main">
                  {movies.reduce((sum, movie) => sum + movie.review_count, 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Reviews
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={700} color="info.main">
                  {movies.reduce((sum, movie) => sum + movie.wishlist_count, 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Wishlists
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Movies Table */}
        <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Movie</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Release Date</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Rating</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Reviews</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Wishlists</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {movies.map((movie) => (
                  <TableRow key={movie.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          src={getImageUrl(movie.image)}
                          variant="rounded"
                          sx={{ width: 60, height: 90 }}
                        >
                          <MovieIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {movie.title}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              maxWidth: 200,
                            }}
                          >
                            {movie.description}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {format(new Date(movie.release_date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StarIcon sx={{ fontSize: 16, color: 'secondary.main' }} />
                        <Typography variant="body2">
                          {movie.average_rating ? `${movie.average_rating}/10` : 'No ratings'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={movie.review_count} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={movie.wishlist_count} 
                        size="small" 
                        color="secondary" 
                        variant="outlined" 
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Tooltip title="View Movie">
                          <IconButton
                            onClick={() => navigate(`/movies/${movie.id}`)}
                            color="info"
                            size="small"
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Movie">
                          <IconButton
                            onClick={() => handleOpenDialog('edit', movie)}
                            color="primary"
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Movie">
                          <IconButton
                            onClick={() => setDeleteConfirm({ open: true, movieId: movie.id })}
                            color="error"
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Add/Edit Movie Dialog */}
        <Dialog 
          open={dialog.open} 
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {dialog.mode === 'edit' ? 'Edit Movie' : 'Add New Movie'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                label="Movie Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />

              <DatePicker
                label="Release Date"
                value={formData.release_date}
                onChange={(date) => setFormData({ ...formData, release_date: date })}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />

              <Box>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadIcon />}
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  Upload Movie Poster
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                  />
                </Button>
                {formData.image && (
                  <Typography variant="body2" color="text.secondary">
                    Selected: {formData.image.name}
                  </Typography>
                )}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              onClick={handleSubmit}
              variant="contained"
              disabled={!formData.title.trim() || !formData.description.trim() || submitting}
            >
              {submitting ? <CircularProgress size={20} /> : (dialog.mode === 'edit' ? 'Update' : 'Add')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteConfirm.open}
          onClose={() => setDeleteConfirm({ open: false, movieId: null })}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this movie? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirm({ open: false, movieId: null })}>
              Cancel
            </Button>
            <Button 
              onClick={() => handleDelete(deleteConfirm.movieId)}
              color="error"
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
};

export default AdminMovies;