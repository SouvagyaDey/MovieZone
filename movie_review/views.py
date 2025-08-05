from django.shortcuts import render, redirect
from .models import Movie,Review,Wishlist,Comment
from django.shortcuts import get_object_or_404
from .forms import ReviewForm
from django.db.models import Avg, Count
from django.shortcuts import redirect
from django.contrib.auth.decorators import login_required
from .utils import analyze_sentiment, get_sentiment_label

from django.db.models import Q 

def home(request):
    query = request.GET.get('query', '')
    movies = Movie.objects.all()
    
    if query:
        movies = movies.filter(
            Q(title__icontains=query) |
            Q(description__icontains=query) 
        ).distinct()
    
    # Get top 4 recommended movies for display on homepage
    top_recommendations = Movie.objects.annotate(
        avg_rating=Avg('reviews__rating'),
        review_count=Count('reviews')
    ).filter(
        review_count__gte=1
    ).order_by('-avg_rating')[:4]

    return render(request, 'base.html', {
        'movies': movies,
        'search_query': query,
        'top_recommendations': top_recommendations
    })

def movie_detail(request, movie_id):
    movie = get_object_or_404(Movie, id=movie_id)
    reviews = Review.objects.filter(movie=movie)
    comments = Comment.objects.filter(movie=movie).order_by('-created_at')
    user_review = reviews.filter(user=request.user)

    review_texts = " ".join([review.review_text for review in reviews if review.review_text])

    # Initialize sentiment_label with default value
    sentiment_label = "No Sentiment"
    
    if review_texts.strip():
        try:
            sentiment_score = analyze_sentiment(review_texts)
            sentiment_label = get_sentiment_label(sentiment_score) 
        except:
            sentiment_label = "No Sentiment"

    avg_rating = reviews.aggregate(Avg('rating'))['rating__avg'] or 0

    in_wishlist = Wishlist.objects.filter(user=request.user, movie=movie).exists()
    
    # Get similar movies (other highly rated movies, excluding current movie)
    similar_movies = Movie.objects.annotate(
        avg_rating=Avg('reviews__rating'),
        review_count=Count('reviews')
    ).filter(
        review_count__gte=1
    ).exclude(
        id=movie_id
    ).order_by('-avg_rating')[:4]

    return render(request, 'movie_detail.html', {
        'movie': movie,
        'reviews': reviews,
        'user_review': user_review,
        'comments': comments,
        'in_wishlist': in_wishlist,
        'avg_rating': avg_rating,
        'sentiment_label': sentiment_label,
        'similar_movies': similar_movies,
    })

def add_comment(request, movie_id):
    movie = get_object_or_404(Movie, id=movie_id)

    if request.method == 'POST':
        comment_text = request.POST.get('comment_text')

        if comment_text:
            Comment.objects.create(user=request.user, movie=movie, comment_text=comment_text)

        return redirect('movie_detail', movie_id=movie.id)



@login_required
def add_review(request, movie_id):
    movie = get_object_or_404(Movie, id=movie_id)
    review = movie.reviews.filter(user=request.user)
    if request.method == 'POST':
        form = ReviewForm(request.POST)
        if form.is_valid():
            if review:
                review.update(rating=form.cleaned_data['rating'], review_text=form.cleaned_data['review_text'])   
            else:
                review = form.save(commit=False)
                review.movie = movie
                review.user = request.user
                review.save()

            return redirect('movie_detail', movie_id=movie.id)
        
    else:
        form = ReviewForm()
    return render(request, 'movie_review.html', {'form': form, 'movie': movie, 'review': review,'rating_range':range(1,11)})


def add_to_wishlist(request, movie_id):
    movie = get_object_or_404(Movie, id=movie_id)

    wishlist, created = Wishlist.objects.get_or_create(user=request.user, movie=movie)
    if not created:
        wishlist.delete()
        return redirect('movie_detail', movie_id
        =movie.id)

    return redirect('movie_detail', movie_id=movie.id)


def wishlist(request):
    wishlists = Wishlist.objects.filter(user=request.user)
    return render (request,'wishlist.html',{'wishlists':wishlists})


def recommendations(request):
    """
    Display movie recommendations based on highest average ratings.
    Only includes movies with at least 1 review to ensure meaningful recommendations.
    """
    # Get movies with their average ratings, ordered by highest average rating
    recommended_movies = Movie.objects.annotate(
        avg_rating=Avg('reviews__rating'),
        review_count=Count('reviews')
    ).filter(
        review_count__gte=1  # Only include movies with at least 1 review
    ).order_by('-avg_rating')[:12]  # Get top 12 recommended movies
    
    return render(request, 'recommendations.html', {
        'recommended_movies': recommended_movies,
        'page_title': 'Recommended Movies'
    })

