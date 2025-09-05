from textblob import TextBlob

def analyze_sentiment(text):

    blob = TextBlob(text)
    polarity = blob.sentiment.polarity 

    score = int(round(((polarity + 1) / 2) * 9 + 1))
    return score

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