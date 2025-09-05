import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? 'https://your-backend-url.com' : 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post('/api/users/token/refresh/', {
            refresh: refreshToken
          });

          const { access } = response.data;
          localStorage.setItem('accessToken', access);
          api.defaults.headers.common['Authorization'] = `Bearer ${access}`;

          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// API methods
export const movieAPI = {
  // Movies
  getMovies: async (filter = null, search = null) => {
    let url = '/api/movies/movies/';
    const params = new URLSearchParams();
    
    if (filter) params.append('filter', filter);
    if (search) params.append('search', search);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await api.get(url);
    return response;
  },

  getMovie: async (id) => {
    const response = await api.get(`/api/movies/movies/${id}/`);
    return response;
  },

  getMovieCategories: async () => {
    const response = await api.get('/api/movies/movies/categories/');
    return response;
  },

  // Admin-only movie operations
  createMovie: async (movieData) => {
    const response = await api.post('/api/movies/movies/', movieData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  updateMovie: async (id, movieData) => {
    const response = await api.put(`/api/movies/movies/${id}/`, movieData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  deleteMovie: async (id) => {
    const response = await api.delete(`/api/movies/movies/${id}/`);
    return response;
  },

  // Reviews
  getMovieReviews: async (movieId) => {
    const response = await api.get(`/api/movies/reviews/?movie=${movieId}`);
    return response;
  },

  createReview: async (reviewData) => {
    const response = await api.post('/api/movies/reviews/', reviewData);
    return response;
  },

  updateReview: async (reviewId, reviewData) => {
    const response = await api.put(`/api/movies/reviews/${reviewId}/`, reviewData);
    return response;
  },

  deleteReview: async (reviewId) => {
    const response = await api.delete(`/api/movies/reviews/${reviewId}/`);
    return response;
  },

  // Comments
  getReviewComments: async (reviewId) => {
    const response = await api.get(`/api/movies/comments/?review=${reviewId}`);
    return response;
  },

  getMovieComments: async (movieId) => {
    const response = await api.get(`/api/movies/comments/?movie_id=${movieId}`);
    return response;
  },

  createComment: async (commentData) => {
    const response = await api.post('/api/movies/comments/', commentData);
    return response;
  },

  deleteComment: async (commentId) => {
    const response = await api.delete(`/api/movies/comments/${commentId}/`);
    return response;
  },

  // Wishlist
  getWishlist: async () => {
    const response = await api.get('/api/movies/wishlist/');
    return response;
  },

  addToWishlist: async (movieId) => {
    const response = await api.post('/api/movies/wishlist/', { movie_id: movieId });
    return response;
  },

  removeFromWishlist: async (movieId) => {
    const response = await api.delete(`/api/movies/wishlist/${movieId}/`);
    return response;
  },

  // Authentication
  login: async (credentials) => {
    const response = await api.post('/api/users/login/', credentials);
    return response;
  },

  register: async (userData) => {
    const response = await api.post('/api/users/register/', userData);
    return response;
  },

  refreshToken: async (refreshToken) => {
    const response = await api.post('/api/users/token/refresh/', { refresh: refreshToken });
    return response;
  }
};

export default api;
