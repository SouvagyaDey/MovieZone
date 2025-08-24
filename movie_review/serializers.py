from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Movie, Review, Comment, Wishlist


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Password and password confirmation do not match.")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class MovieSerializer(serializers.ModelSerializer):
    """Serializer for Movie model"""
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Movie
        fields = ['id', 'title', 'description', 'release_date', 'image', 
                 'average_rating', 'review_count']
        read_only_fields = ['id', 'average_rating', 'review_count']
    
    def get_average_rating(self, obj):
        return obj.get_average_rating()
    
    def get_review_count(self, obj):
        return obj.get_review_count()


class CommentSerializer(serializers.ModelSerializer):
    """Serializer for Comment model"""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'user', 'movie', 'comment_text', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']


class ReviewSerializer(serializers.ModelSerializer):
    """Serializer for Review model"""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Review
        fields = ['id', 'user', 'movie', 'review_text', 'rating', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']

    def validate_rating(self, value):
        if value < 1 or value > 10:
            raise serializers.ValidationError("Rating must be between 1 and 10.")
        return value


class WishlistSerializer(serializers.ModelSerializer):
    """Serializer for Wishlist model"""
    user = UserSerializer(read_only=True)
    movie_detail = MovieSerializer(source='movie', read_only=True)
    
    class Meta:
        model = Wishlist
        fields = ['id', 'user', 'movie', 'movie_detail']
        read_only_fields = ['id', 'user']


class MovieDetailSerializer(MovieSerializer):
    """Detailed serializer for Movie with reviews and comments"""
    reviews = ReviewSerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    user_has_reviewed = serializers.SerializerMethodField()
    is_in_wishlist = serializers.SerializerMethodField()
    
    class Meta(MovieSerializer.Meta):
        fields = MovieSerializer.Meta.fields + ['reviews', 'comments', 
                                               'user_has_reviewed', 'is_in_wishlist']
    
    def get_user_has_reviewed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.reviews.filter(user=request.user).exists()
        return False
    
    def get_is_in_wishlist(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Wishlist.objects.filter(user=request.user, movie=obj).exists()
        return False