"""Sentiment analysis using Google Generative AI (Gemini).

This module uses Google's Gemini API for advanced sentiment analysis
of movie reviews. Returns a score from 1-10 where 1 is very negative
and 10 is very positive.
"""

import os
import google.generativeai as genai
from django.conf import settings
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure Gemini API
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# Initialize the model
model = genai.GenerativeModel('gemini-pro')


def analyze_sentiment(text):
    """Analyze sentiment using Google Gemini AI.
    
    Args:
        text (str): The review text to analyze
        
    Returns:
        int: Sentiment score from 1-10
            1-2: Very Negative
            3-4: Negative
            5-6: Neutral
            7-8: Positive
            9-10: Very Positive
    """
    if not text or not str(text).strip():
        return 5
    
    try:
        # Create a prompt for sentiment analysis
        prompt = f"""
Analyze the sentiment of the following movie review and provide ONLY a numerical score from 1 to 10.

Rules:
- 1-2: Very Negative (hateful, extremely disappointed)
- 3-4: Negative (didn't like it, poor quality)
- 5-6: Neutral (mixed feelings, okay)
- 7-8: Positive (liked it, good quality)
- 9-10: Very Positive (loved it, masterpiece)

Review: "{text}"

Respond with ONLY the number (1-10), nothing else.
"""
        
        # Generate response
        response = model.generate_content(prompt)
        
        # Extract the score from response
        score_text = response.text.strip()
        
        # Try to extract just the number
        import re
        numbers = re.findall(r'\d+', score_text)
        if numbers:
            score = int(numbers[0])
            # Ensure score is within valid range
            score = max(1, min(10, score))
            return score
        else:
            # Fallback to neutral if parsing fails
            return 5
            
    except Exception as e:
        print(f"Gemini sentiment analysis error: {e}")
        # Fallback to basic sentiment analysis
        return _fallback_sentiment(text)


def _fallback_sentiment(text):
    """Simple fallback sentiment analysis if Gemini fails.
    
    Uses keyword-based analysis as a last resort.
    """
    text_lower = text.lower()
    
    # Positive keywords
    positive_words = ['excellent', 'amazing', 'great', 'wonderful', 'fantastic', 
                     'love', 'loved', 'perfect', 'best', 'brilliant', 'outstanding',
                     'masterpiece', 'incredible', 'superb', 'awesome']
    
    # Negative keywords
    negative_words = ['terrible', 'awful', 'horrible', 'worst', 'bad', 'poor',
                     'disappointing', 'waste', 'boring', 'dull', 'hate', 'hated']
    
    positive_count = sum(1 for word in positive_words if word in text_lower)
    negative_count = sum(1 for word in negative_words if word in text_lower)
    
    if positive_count > negative_count:
        return 7 + min(positive_count, 3)  # 7-10
    elif negative_count > positive_count:
        return 4 - min(negative_count, 3)  # 1-4
    else:
        return 5  # Neutral


def get_sentiment_label(score):
    """Return a sentiment label based on 1-10 score."""
    if score >= 9:
        return "Very Positive"
    elif score >= 7:
        return "Positive"
    elif score >= 4:
        return "Neutral"
    elif score >= 2:
        return "Negative"
    else:
        return "Very Negative"
