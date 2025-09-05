from faker import Faker
import random
import requests
from datetime import datetime
from urllib.parse import urlsplit
from django.core.files.base import ContentFile
from movie_review.models import Movie  # Replace with your actual app name

fake = Faker()

def run():
    print("🎬 Adding 100 fake movies with random images...")

    for _ in range(100):
        title = fake.sentence(nb_words=3).rstrip(".")
        description = fake.paragraph(nb_sentences=5)
        release_year = random.randint(1980, 2024)
        release_date = datetime.strptime(f"{release_year}-01-01", "%Y-%m-%d").date()

        movie = Movie(
            title=title,
            description=description,
            release_date=release_date
        )


        try:
            image_url = "https://picsum.photos/300/400"
            response = requests.get(image_url)
            if response.status_code == 200:
                filename = f"{title[:10].replace(' ', '_')}.jpg"
                movie.image.save(filename, ContentFile(response.content), save=False)
        except Exception as e:
            print(f"⚠️ Image fetch failed for {title}: {e}")

        movie.save()
        print(f"✅ Added: {title}")
