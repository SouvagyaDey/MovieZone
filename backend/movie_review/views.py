from rest_framework import viewsets, permissions, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Avg, Count, Q
from datetime import datetime, timedelta

from .models import Movie, Wishlist, Comment, Review
from .serializers import MovieSerializer, WishlistSerializer, CommentSerializer, ReviewSerializer


class MovieViewSet(viewsets.ModelViewSet):
    queryset = Movie.objects.all()
    serializer_class = MovieSerializer
    permission_classes = [AllowAny]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsAdminUser]
        return super().get_permissions()

    def get_queryset(self):
        queryset = Movie.objects.all()
        filter_type = self.request.query_params.get('filter', None)
        search = self.request.query_params.get('search', None)

        # Apply search filter
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )

        # Apply category filters
        if filter_type == 'trending':
            # Trending: Movies with most reviews and wishlists in the last 30 days
            thirty_days_ago = datetime.now() - timedelta(days=30)
            queryset = queryset.annotate(
                recent_reviews=Count('reviews', filter=Q(reviews__created_at__gte=thirty_days_ago)),
                total_wishlists=Count('wishlist')
            ).filter(
                Q(recent_reviews__gt=0) | Q(total_wishlists__gt=0)
            ).order_by('-recent_reviews', '-total_wishlists')
            
        elif filter_type == 'top-rated':
            # Top-rated: Movies with highest average rating (minimum 3 reviews)
            queryset = queryset.annotate(
                avg_rating=Avg('reviews__rating'),
                review_count=Count('reviews')
            ).filter(
                review_count__gte=3
            ).order_by('-avg_rating', '-review_count')
            
        elif filter_type == 'latest':
            # Latest: Most recently added movies
            queryset = queryset.order_by('-created_at')
        else:
            # Default: Order by release date (newest first)
            queryset = queryset.order_by('-release_date')

        return queryset

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def categories(self, request):
        """Get movie counts for each category"""
        thirty_days_ago = datetime.now() - timedelta(days=30)
        
        trending_count = Movie.objects.annotate(
            recent_reviews=Count('reviews', filter=Q(reviews__created_at__gte=thirty_days_ago)),
            total_wishlists=Count('wishlist')
        ).filter(
            Q(recent_reviews__gt=0) | Q(total_wishlists__gt=0)
        ).count()
        
        top_rated_count = Movie.objects.annotate(
            review_count=Count('reviews')
        ).filter(review_count__gte=3).count()
        
        latest_count = Movie.objects.count()
        
        return Response({
            'trending': trending_count,
            'top-rated': top_rated_count,
            'latest': latest_count,
            'all': latest_count
        })


class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Check if the movie is already in the user's wishlist
        movie = serializer.validated_data['movie']
        if Wishlist.objects.filter(user=self.request.user, movie=movie).exists():
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'error': 'Movie is already in your wishlist'})
        
        serializer.save(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        # Override destroy to handle deletion by movie ID
        movie_id = kwargs.get('pk')
        try:
            # Try to find wishlist item by movie ID
            wishlist_item = Wishlist.objects.get(user=request.user, movie_id=movie_id)
            wishlist_item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Wishlist.DoesNotExist:
            return Response(
                {'error': 'Movie not found in wishlist'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class CommentViewSet(viewsets.ModelViewSet):

    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        movie_id = self.request.query_params.get("movie_id")
        if movie_id:
            return Comment.objects.filter(movie_id=movie_id)
        return Comment.objects.all()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ReviewViewSet(viewsets.ModelViewSet):

    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        movie_id = self.request.query_params.get("movie_id")
        if movie_id:
            return Review.objects.filter(movie_id=movie_id)
        return Review.objects.all()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["get"], permission_classes=[AllowAny])
    def movie_reviews(self, request, pk=None):
        """Custom action: get all reviews for a given movie"""
        reviews = Review.objects.filter(movie_id=pk)
        serializer = self.get_serializer(reviews, many=True)
        return Response(serializer.data)
