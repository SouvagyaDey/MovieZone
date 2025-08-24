from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MovieViewSet, ReviewViewSet, CommentViewSet, WishlistViewSet

router = DefaultRouter()
router.register(r'movies', MovieViewSet)
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'comments', CommentViewSet, basename='comment')
router.register(r'wishlist', WishlistViewSet, basename='wishlist')

urlpatterns = [
    path('api/', include(router.urls)),
]