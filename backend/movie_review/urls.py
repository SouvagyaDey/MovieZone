from rest_framework.routers import DefaultRouter
from .views import MovieViewSet, WishlistViewSet, CommentViewSet, ReviewViewSet

router = DefaultRouter()
router.register(r'movies', MovieViewSet,basename='movie')
router.register(r'wishlist', WishlistViewSet,basename='wishlist')
router.register(r'comments', CommentViewSet,basename='comment')
router.register(r'reviews', ReviewViewSet,basename='review')

urlpatterns = router.urls

