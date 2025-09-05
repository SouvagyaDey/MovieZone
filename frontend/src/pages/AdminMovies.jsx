import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  IconButton,
  Alert,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Fab,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext.jsx';
import { movieAPI } from '../services/api.jsx';

const AdminMovies = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dialog states
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentMovie, setCurrentMovie] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    release_date: '',
    image: null
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Check if user is admin
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Note: In a real app, you'd check if user.is_staff or user.is_superuser
    // For demo purposes, we'll assume authenticated users can access
    
    fetchMovies();
  }, [isAuthenticated, navigate]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await movieAPI.getMovies();
      setMovies(response.data);
    } catch (error) {
      setError('Failed to fetch movies');
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (movie = null) => {
    if (movie) {
      // Edit mode
      setEditMode(true);
      setCurrentMovie(movie);
      setFormData({
        title: movie.title,
        description: movie.description,
        release_date: movie.release_date,
        image: null // We don't pre-fill file inputs
      });
      setImagePreview(movie.image);
    } else {
      // Create mode
      setEditMode(false);
      setCurrentMovie(null);
      setFormData({
        title: '',
        description: '',
        release_date: '',
        image: null
      });
      setImagePreview(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setCurrentMovie(null);
    setFormData({
      title: '',
      description: '',
      release_date: '',
      image: null
    });
    setImagePreview(null);
    setError('');
    setSuccess('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const movieData = new FormData();
      movieData.append('title', formData.title);
      movieData.append('description', formData.description);
      movieData.append('release_date', formData.release_date);
      
      if (formData.image) {
        movieData.append('image', formData.image);
      }

      if (editMode && currentMovie) {
        await movieAPI.updateMovie(currentMovie.id, movieData);
        setSuccess('Movie updated successfully!');
      } else {
        await movieAPI.createMovie(movieData);
        setSuccess('Movie created successfully!');
      }

      await fetchMovies();
      handleClose();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);

    } catch (error) {
      console.error('Error saving movie:', error);
      setError(error.response?.data?.detail || 'Failed to save movie');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (movieId, movieTitle) => {
    if (window.confirm(`Are you sure you want to delete "${movieTitle}"?`)) {
      try {
        await movieAPI.deleteMovie(movieId);
        setSuccess('Movie deleted successfully!');
        await fetchMovies();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Error deleting movie:', error);
        setError(error.response?.data?.detail || 'Failed to delete movie');
      }
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" component="h1" sx={{ color: '#f5c518', fontWeight: 'bold' }}>
            🎬 Movie Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
            sx={{
              background: 'linear-gradient(45deg, #f5c518 0%, #daa520 100%)',
              color: '#000000',
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(45deg, #daa520 0%, #b8860b 100%)',
              }
            }}
          >
            Add New Movie
          </Button>
        </Box>

        {/* Success/Error Messages */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Movies Table */}
        <Paper elevation={10} sx={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#2a2a2a' }}>
                  <TableCell sx={{ color: '#f5c518', fontWeight: 'bold' }}>Image</TableCell>
                  <TableCell sx={{ color: '#f5c518', fontWeight: 'bold' }}>Title</TableCell>
                  <TableCell sx={{ color: '#f5c518', fontWeight: 'bold' }}>Release Date</TableCell>
                  <TableCell sx={{ color: '#f5c518', fontWeight: 'bold' }}>Description</TableCell>
                  <TableCell sx={{ color: '#f5c518', fontWeight: 'bold' }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {movies.map((movie, index) => (
                  <motion.tr
                    key={movie.id}
                    component="tr"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <TableCell>
                      <img
                        src={movie.image || '/api/placeholder/80/120'}
                        alt={movie.title}
                        style={{
                          width: '60px',
                          height: '90px',
                          objectFit: 'cover',
                          borderRadius: '8px'
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                      {movie.title}
                    </TableCell>
                    <TableCell sx={{ color: '#b0b0b0' }}>
                      {new Date(movie.release_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell sx={{ color: '#e0e0e0', maxWidth: 300 }}>
                      {movie.description.length > 100
                        ? `${movie.description.substring(0, 100)}...`
                        : movie.description}
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" gap={1} justifyContent="center">
                        <IconButton
                          onClick={() => handleOpen(movie)}
                          sx={{ color: '#f5c518', '&:hover': { backgroundColor: 'rgba(245, 197, 24, 0.1)' } }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(movie.id, movie.title)}
                          sx={{ color: '#ff4757', '&:hover': { backgroundColor: 'rgba(255, 71, 87, 0.1)' } }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Create/Edit Dialog */}
        <Dialog
          open={open}
          onClose={handleClose}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: '#1a1a1a',
              border: '1px solid #333333'
            }
          }}
        >
          <DialogTitle sx={{ color: '#f5c518', fontWeight: 'bold', fontSize: '1.5rem' }}>
            {editMode ? '✏️ Edit Movie' : '➕ Create New Movie'}
            <IconButton
              onClick={handleClose}
              sx={{ position: 'absolute', right: 8, top: 8, color: '#ffffff' }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="title"
                    label="Movie Title"
                    fullWidth
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    sx={{
                      '& .MuiInputLabel-root': {
                        color: '#b0b0b0',
                        '&.Mui-focused': { color: '#f5c518' }
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    name="release_date"
                    label="Release Date"
                    type="date"
                    fullWidth
                    required
                    value={formData.release_date}
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiInputLabel-root': {
                        color: '#b0b0b0',
                        '&.Mui-focused': { color: '#f5c518' }
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    name="description"
                    label="Description"
                    fullWidth
                    multiline
                    rows={4}
                    required
                    value={formData.description}
                    onChange={handleInputChange}
                    sx={{
                      '& .MuiInputLabel-root': {
                        color: '#b0b0b0',
                        '&.Mui-focused': { color: '#f5c518' }
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<UploadIcon />}
                    fullWidth
                    sx={{
                      borderColor: '#f5c518',
                      color: '#f5c518',
                      '&:hover': { borderColor: '#daa520', backgroundColor: 'rgba(245, 197, 24, 0.1)' }
                    }}
                  >
                    Upload Image
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </Button>
                </Grid>

                {imagePreview && (
                  <Grid item xs={12} sm={6}>
                    <Box textAlign="center">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{
                          maxWidth: '200px',
                          maxHeight: '200px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '2px solid #f5c518'
                        }}
                      />
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={handleClose}
              sx={{ color: '#b0b0b0' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={20} /> : <SaveIcon />}
              sx={{
                background: 'linear-gradient(45deg, #f5c518 0%, #daa520 100%)',
                color: '#000000',
                fontWeight: 'bold',
                '&:hover': {
                  background: 'linear-gradient(45deg, #daa520 0%, #b8860b 100%)',
                }
              }}
            >
              {submitting ? 'Saving...' : (editMode ? 'Update Movie' : 'Create Movie')}
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Container>
  );
};

export default AdminMovies;
