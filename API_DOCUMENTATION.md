# MovieZone API Documentation

A Django REST Framework (DRF) API for a movie review platform. This API provides endpoints for user authentication, movie management, reviews, comments, and wishlist functionality.

## API Base URL
```
http://127.0.0.1:8000/api/
```

## Authentication

The API uses Token-based authentication. Include the token in the `Authorization` header:
```
Authorization: Token <your-token-here>
```

### Authentication Endpoints

#### Register User
- **POST** `/api/auth/register/`
- **Body:**
```json
{
    "username": "string",
    "email": "string",
    "password": "string",
    "password_confirm": "string",
    "first_name": "string" (optional),
    "last_name": "string" (optional)
}
```
- **Response:** User data + authentication token

#### Login
- **POST** `/api/auth/login/`
- **Body:**
```json
{
    "username": "string",
    "password": "string"
}
```
- **Response:** User data + authentication token

#### Logout
- **POST** `/api/auth/logout/`
- **Requires:** Authentication
- **Response:** Success message

#### Get Profile
- **GET** `/api/auth/profile/`
- **Requires:** Authentication
- **Response:** Current user data

## Movie Endpoints

#### List Movies
- **GET** `/api/movies/`
- **Query Parameters:**
  - `search`: Search movies by title or description
  - `ordering`: Order by `release_date` or `title`
  - `page`: Page number for pagination
- **Response:** Paginated list of movies with basic info

#### Get Movie Details
- **GET** `/api/movies/{id}/`
- **Response:** Detailed movie info including reviews, comments, and user-specific flags (if authenticated)

#### Movie Recommendations
- **GET** `/api/movies/recommendations/`
- **Response:** List of recommended movies based on highest average ratings

#### Movie Sentiment Analysis
- **GET** `/api/movies/{id}/sentiment/`
- **Response:** Sentiment analysis of all reviews for the movie

## Review Endpoints

#### List Reviews
- **GET** `/api/reviews/`
- **Query Parameters:**
  - `movie_id`: Filter reviews by movie ID
- **Response:** List of reviews

#### Create/Update Review
- **POST** `/api/reviews/`
- **Requires:** Authentication
- **Body:**
```json
{
    "movie": integer,
    "review_text": "string",
    "rating": integer (1-10)
}
```
- **Note:** If user already has a review for the movie, it will be updated instead of creating a new one

#### Update Review
- **PUT** `/api/reviews/{id}/`
- **Requires:** Authentication (only own reviews)
- **Body:** Same as create

#### Delete Review
- **DELETE** `/api/reviews/{id}/`
- **Requires:** Authentication (only own reviews)

## Comment Endpoints

#### List Comments
- **GET** `/api/comments/`
- **Query Parameters:**
  - `movie_id`: Filter comments by movie ID
- **Response:** List of comments ordered by creation date (newest first)

#### Create Comment
- **POST** `/api/comments/`
- **Requires:** Authentication
- **Body:**
```json
{
    "movie": integer,
    "comment_text": "string"
}
```

#### Update Comment
- **PUT** `/api/comments/{id}/`
- **Requires:** Authentication (only own comments)

#### Delete Comment
- **DELETE** `/api/comments/{id}/`
- **Requires:** Authentication (only own comments)

## Wishlist Endpoints

#### Get User's Wishlist
- **GET** `/api/wishlist/`
- **Requires:** Authentication
- **Response:** List of movies in user's wishlist

#### Add to Wishlist
- **POST** `/api/wishlist/`
- **Requires:** Authentication
- **Body:**
```json
{
    "movie": integer
}
```

#### Toggle Movie in Wishlist
- **POST** `/api/wishlist/toggle/`
- **Requires:** Authentication
- **Body:**
```json
{
    "movie_id": integer
}
```
- **Response:** Message indicating if movie was added or removed

#### Remove from Wishlist
- **DELETE** `/api/wishlist/{id}/`
- **Requires:** Authentication

## Response Format

### Success Response
All successful responses return appropriate HTTP status codes (200, 201, 204) with JSON data.

### Error Response
```json
{
    "error": "Error message",
    "details": "Optional additional details"
}
```

### Pagination
List endpoints return paginated results:
```json
{
    "count": integer,
    "next": "url or null",
    "previous": "url or null",
    "results": [...]
}
```

## Example Usage

### 1. Register and Login
```bash
# Register
curl -X POST http://127.0.0.1:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "moviefan",
    "email": "fan@example.com",
    "password": "securepass123",
    "password_confirm": "securepass123"
  }'

# Login
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "moviefan",
    "password": "securepass123"
  }'
```

### 2. Browse Movies
```bash
# Get all movies
curl -X GET http://127.0.0.1:8000/api/movies/

# Search movies
curl -X GET "http://127.0.0.1:8000/api/movies/?search=batman"

# Get movie details
curl -X GET http://127.0.0.1:8000/api/movies/1/
```

### 3. Add Review and Comment
```bash
# Add a review (requires authentication)
curl -X POST http://127.0.0.1:8000/api/reviews/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Token YOUR_TOKEN" \
  -d '{
    "movie": 1,
    "review_text": "Amazing cinematography and storytelling!",
    "rating": 9
  }'

# Add a comment (requires authentication)
curl -X POST http://127.0.0.1:8000/api/comments/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Token YOUR_TOKEN" \
  -d '{
    "movie": 1,
    "comment_text": "I totally agree with the reviews!"
  }'
```

### 4. Manage Wishlist
```bash
# Add to wishlist
curl -X POST http://127.0.0.1:8000/api/wishlist/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Token YOUR_TOKEN" \
  -d '{"movie": 1}'

# Toggle wishlist
curl -X POST http://127.0.0.1:8000/api/wishlist/toggle/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Token YOUR_TOKEN" \
  -d '{"movie_id": 1}'
```

## Features

- **User Authentication**: Token-based authentication with registration and login
- **Movie Management**: Full CRUD operations for movies
- **Review System**: Users can rate (1-10) and review movies
- **Comment System**: Users can comment on movies
- **Wishlist**: Personal movie wishlist functionality
- **Search**: Search movies by title or description
- **Recommendations**: Get movie recommendations based on ratings
- **Sentiment Analysis**: Analyze sentiment of movie reviews
- **Permissions**: Proper permission handling (users can only modify their own content)
- **Pagination**: Paginated responses for list endpoints

## Error Handling

The API includes proper error handling for:
- Authentication errors (401 Unauthorized)
- Permission errors (403 Forbidden)
- Validation errors (400 Bad Request)
- Not found errors (404 Not Found)
- Duplicate entries (e.g., adding same movie to wishlist twice)

## Installation & Setup

1. Install dependencies:
```bash
pip install django djangorestframework pillow textblob django-extensions
```

2. Run migrations:
```bash
python manage.py migrate
```

3. Create superuser (optional):
```bash
python manage.py createsuperuser
```

4. Start development server:
```bash
python manage.py runserver
```

5. Access API at: http://127.0.0.1:8000/api/