from rest_framework import serializers
from .models import Movie, Wishlist, Comment, Review
from django.contrib.auth.models import User

class MovieSerializer(serializers.ModelSerializer):
    average_rating = serializers.ReadOnlyField()
    review_count = serializers.ReadOnlyField()
    wishlist_count = serializers.ReadOnlyField()
    
    class Meta:
        model = Movie
        fields = ['id', 'title', 'description', 'release_date', 'image', 'created_at', 'average_rating', 'review_count', 'wishlist_count']

class WishlistSerializer(serializers.ModelSerializer):
    movie_id = serializers.PrimaryKeyRelatedField(source='movie', queryset=Movie.objects.all(),
    write_only=True)
    movie = MovieSerializer(read_only=True)
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    class Meta:
        model = Wishlist
        fields = ['id', 'user', 'movie_id', 'movie']

class CommentSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'user', 'username', 'movie', 'comment_text', 'created_at']

class ReviewSerializer(serializers.ModelSerializer):
    movie_id = serializers.PrimaryKeyRelatedField(source='movie', queryset=Movie.objects.all(),
    write_only=True)
    movie = MovieSerializer(read_only=True)
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'movie_id','movie', 'user', 'username', 'review_text', 'rating', 'created_at']
