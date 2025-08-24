# MovieZone - Movie Review API

A Django REST Framework (DRF) based movie review platform that provides a comprehensive API for managing movies, reviews, comments, and user wishlists.

## 🚀 Features

- **RESTful API**: Full REST API built with Django REST Framework
- **User Authentication**: Token-based authentication system with registration and login
- **Movie Management**: Complete movie catalog with search functionality
- **Review & Rating System**: Users can rate movies (1-10 scale) and write detailed reviews
- **Comment System**: Interactive commenting on movies
- **Wishlist Functionality**: Personal movie wishlist management
- **Sentiment Analysis**: Automatic sentiment analysis of movie reviews using TextBlob
- **Movie Recommendations**: Smart recommendations based on average ratings
- **Search & Filtering**: Advanced search and filtering capabilities
- **Pagination**: Efficient pagination for large datasets
- **Permission System**: Secure permission handling (users can only modify their own content)

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/profile/` - Get user profile

### Movies
- `GET /api/movies/` - List all movies (with search and pagination)
- `GET /api/movies/{id}/` - Get movie details
- `GET /api/movies/recommendations/` - Get recommended movies
- `GET /api/movies/{id}/sentiment/` - Get sentiment analysis for a movie

### Reviews
- `GET /api/reviews/` - List reviews
- `POST /api/reviews/` - Create/update review
- `PUT /api/reviews/{id}/` - Update review
- `DELETE /api/reviews/{id}/` - Delete review

### Comments
- `GET /api/comments/` - List comments
- `POST /api/comments/` - Create comment
- `PUT /api/comments/{id}/` - Update comment
- `DELETE /api/comments/{id}/` - Delete comment

### Wishlist
- `GET /api/wishlist/` - Get user's wishlist
- `POST /api/wishlist/` - Add movie to wishlist
- `POST /api/wishlist/toggle/` - Toggle movie in wishlist
- `DELETE /api/wishlist/{id}/` - Remove from wishlist

## 🛠️ Installation

### Prerequisites
Ensure you have the following installed:
- Python (>=3.10)
- Django (>=5.1)
- Django REST Framework
- Virtual environment (optional but recommended)

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/SouvagyaDey/MovieZone.git
   cd MovieZone
   ```

2. Create and activate a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. Install dependencies:
   ```bash
   pip install django djangorestframework pillow textblob django-extensions
   ```

4. Apply migrations:
   ```bash
   python manage.py migrate
   ```

5. Create a superuser (for admin access):
   ```bash
   python manage.py createsuperuser
   ```

6. Run the server:
   ```bash
   python manage.py runserver
   ```

7. Access the API at `http://127.0.0.1:8000/api/`

## 🔧 Quick Start Guide

### 1. Register a new user
```bash
curl -X POST http://127.0.0.1:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "moviefan",
    "email": "fan@example.com", 
    "password": "securepass123",
    "password_confirm": "securepass123"
  }'
```

### 2. Login and get token
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "moviefan",
    "password": "securepass123"
  }'
```

### 3. Browse movies
```bash
# Get all movies
curl -X GET http://127.0.0.1:8000/api/movies/

# Search for specific movies
curl -X GET "http://127.0.0.1:8000/api/movies/?search=batman"
```

### 4. Add a review (requires authentication)
```bash
curl -X POST http://127.0.0.1:8000/api/reviews/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Token YOUR_TOKEN_HERE" \
  -d '{
    "movie": 1,
    "review_text": "Amazing movie with great cinematography!",
    "rating": 9
  }'
```

## 📖 API Documentation

For detailed API documentation including all endpoints, request/response formats, and examples, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md).

## 🔐 Authentication

The API uses Token-based authentication. After registration or login, include the token in your requests:

```bash
Authorization: Token <your-token-here>
```

## 🎯 Key Features in Detail

### Movie Reviews & Ratings
- Rate movies on a scale of 1-10
- Write detailed text reviews
- Users can update their existing reviews
- Automatic calculation of average ratings

### Sentiment Analysis
- Automatic sentiment analysis of movie reviews
- Uses TextBlob for natural language processing
- Provides sentiment labels: Very Positive, Positive, Neutral, Negative, Very Negative

### Smart Recommendations
- Recommends movies based on highest average ratings
- Only includes movies with actual reviews for quality recommendations
- Supports pagination for large result sets

### Search & Filtering
- Search movies by title or description
- Filter results by various criteria
- Supports case-insensitive search

## 🔄 Migration from Traditional Django

This project has been converted from a traditional Django application to a REST API using Django REST Framework while maintaining all original functionality:

- Traditional Django views → DRF ViewSets and APIViews
- HTML forms → JSON API endpoints
- Session authentication → Token authentication
- Template rendering → JSON responses
- Form validation → Serializer validation

## 📱 Frontend Integration

This API can be easily integrated with any frontend framework:
- React/Next.js
- Vue.js/Nuxt.js
- Angular
- Mobile apps (React Native, Flutter)
- Desktop applications

## 🧪 Testing

Test the API endpoints using tools like:
- curl (command line)
- Postman
- Insomnia
- HTTPie
- Django REST Framework's browsable API

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues and questions, please create an issue in the GitHub repository.
## Screenshots
### Homepage
![Homepage](homepage.jpg)

### Movie Detail Page
![Movie Detail](movie.jpg)

## Features
- User authentication (Signup/Login/Logout)
- Movie listing with descriptions and images
- Wishlist functionality
- Review and rating system for movies
- Admin panel for managing movies and reviews
- sentiment analysis for reviews
- Search functionality for movies

## Installation

### Prerequisites
Ensure you have the following installed:
- Python (>=3.10)
- Django
- Virtual environment (optional but recommended)

### Steps
1. Clone the repository:
   ```sh
   git clone https://github.com/SouvagyaCode/MovieReview.git
   cd movie-review-site
   ```
2. Create and activate a virtual environment (optional but recommended):
   ```sh
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```
3. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```
4. Apply migrations:
   ```sh
   python manage.py migrate
   ```
5. Create a superuser (for admin access):
   ```sh
   python manage.py createsuperuser
   ```
6. Run the server:
   ```sh
   python manage.py runserver
   ```
7. Open your browser and visit `http://127.0.0.1:8000/` to access the website.



## License
This project is licensed under the MIT License.

