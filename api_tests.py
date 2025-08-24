from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework.authtoken.models import Token
from movie_review.models import Movie, Review, Comment, Wishlist
import json


class MovieZoneAPITestCase(TestCase):
    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        
        # Create test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.token = Token.objects.create(user=self.user)
        
        # Create test movie
        self.movie = Movie.objects.create(
            title='Test Movie',
            description='A test movie for API testing',
            release_date='2023-01-01'
        )

    def test_user_registration(self):
        """Test user registration API"""
        data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'newpass123',
            'password_confirm': 'newpass123'
        }
        response = self.client.post('/api/auth/register/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)
        self.assertIn('user', response.data)

    def test_user_login(self):
        """Test user login API"""
        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        response = self.client.post('/api/auth/login/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['username'], 'testuser')

    def test_movie_list(self):
        """Test movie list API"""
        response = self.client.get('/api/movies/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['title'], 'Test Movie')

    def test_movie_detail(self):
        """Test movie detail API"""
        response = self.client.get(f'/api/movies/{self.movie.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Test Movie')
        self.assertIn('reviews', response.data)
        self.assertIn('comments', response.data)

    def test_movie_search(self):
        """Test movie search functionality"""
        response = self.client.get('/api/movies/?search=test')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_create_review_authenticated(self):
        """Test creating a review with authentication"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        data = {
            'movie': self.movie.id,
            'review_text': 'Great movie!',
            'rating': 8
        }
        response = self.client.post('/api/reviews/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['rating'], 8)
        self.assertEqual(response.data['user']['username'], 'testuser')

    def test_create_review_unauthenticated(self):
        """Test creating a review without authentication"""
        data = {
            'movie': self.movie.id,
            'review_text': 'Great movie!',
            'rating': 8
        }
        response = self.client.post('/api/reviews/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_comment(self):
        """Test creating a comment"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        data = {
            'movie': self.movie.id,
            'comment_text': 'Nice movie!'
        }
        response = self.client.post('/api/comments/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['comment_text'], 'Nice movie!')

    def test_wishlist_operations(self):
        """Test wishlist add and toggle operations"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        
        # Add to wishlist
        data = {'movie': self.movie.id}
        response = self.client.post('/api/wishlist/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['movie'], self.movie.id)
        
        # Toggle (remove from wishlist)
        toggle_data = {'movie_id': self.movie.id}
        response = self.client.post('/api/wishlist/toggle/', toggle_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['in_wishlist'], False)

    def test_recommendations(self):
        """Test movie recommendations API"""
        # Create a review to enable recommendations
        Review.objects.create(
            user=self.user,
            movie=self.movie,
            review_text='Good movie',
            rating=8
        )
        
        response = self.client.get('/api/movies/recommendations/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_sentiment_analysis(self):
        """Test sentiment analysis API"""
        # Create a review for sentiment analysis
        Review.objects.create(
            user=self.user,
            movie=self.movie,
            review_text='This is an excellent movie with amazing plot!',
            rating=9
        )
        
        response = self.client.get(f'/api/movies/{self.movie.id}/sentiment/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('sentiment_label', response.data)
        self.assertIn('sentiment_score', response.data)
        self.assertEqual(response.data['movie_id'], self.movie.id)

    def test_unauthorized_access_protection(self):
        """Test that protected endpoints require authentication"""
        protected_endpoints = [
            ('POST', '/api/reviews/'),
            ('POST', '/api/comments/'),
            ('POST', '/api/wishlist/'),
            ('GET', '/api/auth/profile/'),
        ]
        
        for method, endpoint in protected_endpoints:
            if method == 'POST':
                response = self.client.post(endpoint, {}, format='json')
            else:
                response = self.client.get(endpoint)
            self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_can_only_modify_own_content(self):
        """Test that users can only modify their own reviews and comments"""
        # Create another user
        other_user = User.objects.create_user(
            username='otheruser',
            password='otherpass123'
        )
        other_token = Token.objects.create(user=other_user)
        
        # Create review as first user
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        review_data = {
            'movie': self.movie.id,
            'review_text': 'My review',
            'rating': 7
        }
        review_response = self.client.post('/api/reviews/', review_data, format='json')
        review_id = review_response.data['id']
        
        # Try to modify review as other user (should get 404 because they can't see it)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {other_token.key}')
        update_data = {'review_text': 'Modified review', 'rating': 9}
        response = self.client.put(f'/api/reviews/{review_id}/', update_data, format='json')
        # 404 is acceptable because the queryset filters out reviews they don't own
        self.assertIn(response.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])