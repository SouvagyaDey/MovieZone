# MovieZone Frontend

A modern React frontend for the MovieZone movie review platform with Material-UI components and comprehensive features.

## Features

### 🎬 Movie Discovery
- **Advanced Filtering**: Trending, Top Rated, Latest, and search functionality
- **Modern UI**: Dark theme with gradient accents and smooth animations
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Movie Cards**: Rich cards with ratings, wishlist functionality, and previews

### ⭐ Reviews & Ratings
- **10-Point Rating System**: Detailed rating system matching backend
- **Sentiment Analysis Display**: Visual sentiment indicators using DistilBERT analysis
- **Rich Reviews**: Full CRUD operations for authenticated users
- **Comments System**: Interactive commenting on movies

### 👤 User Features
- **Authentication**: Login/Register with form validation and password strength
- **User Profiles**: Comprehensive profile pages with activity tracking
- **Wishlist Management**: Save and organize favorite movies
- **Rating Analytics**: Personal rating distribution and statistics

### 🔧 Admin Features
- **Movie Management**: Full CRUD operations for movies
- **Image Upload**: Movie poster upload and management
- **Admin Dashboard**: Statistics and overview of platform activity
- **Bulk Operations**: Efficient management tools

### 🎨 Modern UI/UX
- **Material-UI Components**: Consistent design system
- **Dark Theme**: Eye-friendly dark theme with custom color palette
- **Smooth Animations**: Micro-interactions and transitions
- **Loading States**: Comprehensive loading and error handling

## Tech Stack

- **React 18** - Modern React with hooks
- **Material-UI v5** - Component library and theming
- **React Router v6** - Client-side routing
- **Axios** - HTTP client with interceptors
- **Date-fns** - Date formatting and manipulation
- **Context API** - State management for authentication

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Running Django backend on port 8000

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm start
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

The app will be available at `http://localhost:3000` and will proxy API requests to `http://localhost:8000`.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── MovieCard.js    # Movie display card
│   ├── MovieFilters.js # Filtering and search
│   └── Navbar.js       # Navigation header
├── contexts/           # React Context providers
│   └── AuthContext.js  # Authentication state
├── pages/              # Page components
│   ├── MovieList.js    # Movie browsing page
│   ├── MovieDetail.js  # Individual movie page
│   ├── Login.js        # Authentication
│   ├── Register.js     # User registration
│   ├── Wishlist.js     # User wishlist
│   ├── AdminMovies.js  # Admin dashboard
│   └── Profile.js      # User profile
├── services/           # API communication
│   └── api.js          # Axios configuration and endpoints
├── App.js              # Main app component
└── index.js            # App entry point
```

## Key Features Detail

### Movie Filtering
- **Trending**: Movies with recent reviews and wishlists (last 30 days)
- **Top Rated**: Movies with highest average rating (minimum 3 reviews)  
- **Latest**: Recently added movies
- **Search**: Full-text search across titles and descriptions

### Authentication
- **JWT Token Management**: Automatic token handling and refresh
- **Protected Routes**: Route protection based on authentication status
- **Role-based Access**: Admin-only features and pages
- **Form Validation**: Client-side validation with helpful feedback

### Responsive Design
- **Mobile-first**: Optimized for mobile devices
- **Flexible Layouts**: Grid system adapts to screen sizes
- **Touch-friendly**: Large touch targets and gestures
- **Performance**: Optimized images and lazy loading

### Error Handling
- **Network Errors**: Graceful handling of API failures
- **Loading States**: Skeleton screens and spinners
- **User Feedback**: Toast notifications and error messages
- **Retry Logic**: Automatic retry for failed requests

## API Integration

The frontend integrates with the Django REST API:

- **Movies API**: CRUD operations, filtering, and search
- **Reviews API**: Review management with sentiment analysis
- **Comments API**: Movie commenting system
- **Wishlist API**: Personal movie wishlist
- **Auth API**: User authentication and profile management

## Customization

### Theme Customization
The app uses Material-UI's theming system. Modify `src/index.js` to customize:
- Color palette
- Typography
- Component styling
- Breakpoints

### Adding Features
1. Create new components in `src/components/`
2. Add API endpoints to `src/services/api.js`
3. Create pages in `src/pages/`
4. Update routing in `src/App.js`

## Performance Optimizations

- **Code Splitting**: Lazy loading for routes
- **Image Optimization**: WebP support and fallbacks  
- **Bundle Optimization**: Tree shaking and minification
- **Caching**: Intelligent API response caching
- **Pagination**: Efficient data loading

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Follow the existing code style
2. Add PropTypes for components
3. Include responsive design
4. Test on multiple screen sizes
5. Follow accessibility guidelines

## License

This project is part of the MovieZone application.