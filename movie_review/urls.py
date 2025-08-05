from django.urls import path
from .views import home,movie_detail, add_review ,add_to_wishlist,wishlist  ,add_comment, recommendations

urlpatterns = [
    path('movie/<int:movie_id>/', movie_detail, name='movie_detail'),
    path('movie/<int:movie_id>/add_review/', add_review, name='add_review'),
    path('movie/<int:movie_id>/add_to_wishlist/', add_to_wishlist, name='add_to_wishlist'),
    path('movie/<int:movie_id>/comment/', add_comment, name='add_comment'),
    path('wishlist/',wishlist,name='wishlist'),
    path('recommendations/', recommendations, name='recommendations'),
    path('', home, name='home'),
    path('search/', home, name='search'),
]