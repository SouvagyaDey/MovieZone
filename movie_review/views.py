from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django.db.models import Q, Avg, Count
from django.shortcuts import get_object_or_404
from .models import Movie, Review, Comment, Wishlist
from .serializers import (
    MovieSerializer, MovieDetailSerializer, ReviewSerializer, 
    CommentSerializer, WishlistSerializer
)
from .utils import analyze_sentiment, get_sentiment_label


class MovieViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing movies
    """
    queryset = Movie.objects.all()
    serializer_class = MovieSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['release_date', 'title']
    ordering = ['-release_date']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return MovieDetailSerializer
        return MovieSerializer

    def get_queryset(self):
        queryset = Movie.objects.all()
        search_query = self.request.query_params.get('search', None)
        
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) |
                Q(description__icontains=search_query)
            ).distinct()
        
        return queryset

    @action(detail=True, methods=['get'])
    def sentiment(self, request, pk=None):
        """Get sentiment analysis for a movie's reviews"""
        movie = self.get_object()
        reviews = Review.objects.filter(movie=movie)
        review_texts = " ".join([review.review_text for review in reviews if review.review_text])
        
        sentiment_label = "No Sentiment"
        sentiment_score = 0
        
        if review_texts.strip():
            try:
                sentiment_score = analyze_sentiment(review_texts)
                sentiment_label = get_sentiment_label(sentiment_score)
            except:
                sentiment_label = "No Sentiment"
        
        return Response({
            'movie_id': movie.id,
            'sentiment_label': sentiment_label,
            'sentiment_score': sentiment_score,
            'review_count': reviews.count()
        })

    @action(detail=False, methods=['get'])
    def recommendations(self, request):
        """Get movie recommendations based on highest average ratings"""
        recommended_movies = Movie.objects.annotate(
            avg_rating=Avg('reviews__rating'),
            review_count=Count('reviews')
        ).filter(
            review_count__gte=1
        ).order_by('-avg_rating')[:12]
        
        serializer = self.get_serializer(recommended_movies, many=True)
        return Response(serializer.data)


class ReviewViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing reviews
    """
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Users can only see and modify their own reviews, but can view all reviews for a movie
        if self.action in ['update', 'partial_update', 'destroy']:
            return Review.objects.filter(user=self.request.user)
        elif self.action == 'list':
            # Filter by movie if movie_id is provided
            movie_id = self.request.query_params.get('movie_id')
            if movie_id:
                return Review.objects.filter(movie_id=movie_id).select_related('user', 'movie')
            return Review.objects.all().select_related('user', 'movie')
        return Review.objects.all()

    def perform_create(self, serializer):
        # Check if user already has a review for this movie
        movie = serializer.validated_data['movie']
        existing_review = Review.objects.filter(user=self.request.user, movie=movie).first()
        
        if existing_review:
            # Update existing review
            existing_review.review_text = serializer.validated_data['review_text']
            existing_review.rating = serializer.validated_data['rating']
            existing_review.save()
            # Return the updated review data
            serializer.instance = existing_review
        else:
            # Create new review
            serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        # Ensure user can only update their own reviews
        if serializer.instance.user != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only update your own reviews")
        serializer.save()

    def perform_destroy(self, instance):
        # Ensure user can only delete their own reviews
        if instance.user != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only delete your own reviews")
        instance.delete()


class CommentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing comments
    """
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Users can only modify their own comments, but can view all comments for a movie
        if self.action in ['update', 'partial_update', 'destroy']:
            return Comment.objects.filter(user=self.request.user)
        elif self.action == 'list':
            # Filter by movie if movie_id is provided
            movie_id = self.request.query_params.get('movie_id')
            if movie_id:
                return Comment.objects.filter(movie_id=movie_id).select_related('user', 'movie').order_by('-created_at')
            return Comment.objects.all().select_related('user', 'movie').order_by('-created_at')
        return Comment.objects.all()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        # Ensure user can only update their own comments
        if serializer.instance.user != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only update your own comments")
        serializer.save()

    def perform_destroy(self, instance):
        # Ensure user can only delete their own comments
        if instance.user != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only delete your own comments")
        instance.delete()


class WishlistViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing wishlist
    """
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user).select_related('movie')

    def create(self, request, *args, **kwargs):
        # Check if movie is already in wishlist
        movie_id = request.data.get('movie')
        if not movie_id:
            return Response(
                {'error': 'movie is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        existing_wishlist = Wishlist.objects.filter(user=request.user, movie_id=movie_id).first()
        
        if existing_wishlist:
            return Response(
                {'message': 'Movie is already in your wishlist'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'])
    def toggle(self, request):
        """Toggle movie in/out of wishlist"""
        movie_id = request.data.get('movie_id')
        if not movie_id:
            return Response(
                {'error': 'movie_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        movie = get_object_or_404(Movie, id=movie_id)
        wishlist_item = Wishlist.objects.filter(user=request.user, movie=movie).first()
        
        if wishlist_item:
            # Remove from wishlist
            wishlist_item.delete()
            return Response({'message': 'Movie removed from wishlist', 'in_wishlist': False})
        else:
            # Add to wishlist
            Wishlist.objects.create(user=request.user, movie=movie)
            return Response({'message': 'Movie added to wishlist', 'in_wishlist': True})

