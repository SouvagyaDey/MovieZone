// Utility functions for movie ratings and sentiment analysis

export const getSentimentLabel = (rating) => {
  /**
   * Return a sentiment label based on 1-10 rating scale
   * @param {number} rating - Rating from 1-10
   * @returns {string} - Sentiment label
   */
  if (!rating || rating < 1) return "No Rating";
  
  if (rating >= 9) {
    return "Exceptional";
  } else if (rating >= 8) {
    return "Excellent";
  } else if (rating >= 7) {
    return "Very Good";
  } else if (rating >= 6) {
    return "Good";
  } else if (rating >= 5) {
    return "Average";
  } else if (rating >= 4) {
    return "Below Average";
  } else if (rating >= 3) {
    return "Poor";
  } else if (rating >= 2) {
    return "Very Poor";
  } else {
    return "Terrible";
  }
};

export const getSentimentColor = (rating) => {
  /**
   * Return a color based on rating sentiment
   * @param {number} rating - Rating from 1-10
   * @returns {string} - Color hex code
   */
  if (!rating || rating < 1) return "#666666"; // Gray for no rating
  
  if (rating >= 8) {
    return "#4CAF50"; // Green for excellent
  } else if (rating >= 7) {
    return "#8BC34A"; // Light green for very good
  } else if (rating >= 6) {
    return "#FFC107"; // Yellow for good
  } else if (rating >= 5) {
    return "#FF9800"; // Orange for average
  } else if (rating >= 4) {
    return "#FF5722"; // Red-orange for below average
  } else {
    return "#F44336"; // Red for poor
  }
};

export const getRatingDescription = (rating, reviewCount) => {
  /**
   * Return a descriptive text about the rating
   * @param {number} rating - Average rating
   * @param {number} reviewCount - Number of reviews
   * @returns {string} - Description text
   */
  if (!rating || reviewCount === 0) {
    return "No reviews yet";
  }
  
  const sentiment = getSentimentLabel(rating);
  const reviewText = reviewCount === 1 ? "review" : "reviews";
  
  return `${sentiment} (${reviewCount} ${reviewText})`;
};
