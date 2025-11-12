import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post('users/login/', credentials),
  register: (userData) => api.post('users/register/', userData),
  logout: () => api.post('users/logout/'),
  getProfile: () => api.get('users/user/'),
  passwordResetRequest: (email) => api.post('users/password-reset/', { email }),
  passwordResetConfirm: (data) => api.post('users/password-reset-confirm/', data),
};

// Movies API calls
export const moviesAPI = {
  getMovies: (params = {}) => api.get('movies/movies/', { params }),
  getMovie: (id) => api.get(`movies/movies/${id}/`),
  createMovie: (movieData) => api.post('movies/movies/', movieData),
  updateMovie: (id, movieData) => api.patch(`movies/movies/${id}/`, movieData),
  deleteMovie: (id) => api.delete(`movies/movies/${id}/`),
  getCategories: () => api.get('movies/movies/categories/'),
  getWatchOptions: (id) => api.get(`movies/movies/${id}/watch_options/`),
};

// Reviews API calls
export const reviewsAPI = {
  getReviews: (params = {}) => api.get('movies/reviews/', { params }),
  createReview: (reviewData) => api.post('movies/reviews/', reviewData),
  updateReview: (id, reviewData) => api.patch(`movies/reviews/${id}/`, reviewData),
  deleteReview: (id) => api.delete(`movies/reviews/${id}/`),
};

// Comments API calls
export const commentsAPI = {
  getComments: (params = {}) => api.get('movies/comments/', { params }),
  createComment: (commentData) => api.post('movies/comments/', commentData),
  deleteComment: (id) => api.delete(`movies/comments/${id}/`),
};

// Wishlist API calls
export const wishlistAPI = {
  getWishlist: () => api.get('movies/wishlist/'),
  addToWishlist: (movieId) => api.post('movies/wishlist/', { movie_id: movieId }),
  removeFromWishlist: (id) => api.delete(`movies/wishlist/${id}/`),
};

export default api;