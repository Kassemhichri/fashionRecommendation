// Review and Rating API Service

/**
 * Fetches all reviews for a product
 * @param {string} productId - The product ID
 * @returns {Promise<Array>} - Array of reviews
 */
export const getProductReviews = async (productId) => {
  try {
    const response = await fetch(`/api/products/${productId}/reviews`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch reviews: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.reviews || [];
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    return [];
  }
};

/**
 * Fetches the rating summary for a product
 * @param {string} productId - The product ID
 * @returns {Promise<Object>} - Rating summary
 */
export const getProductRating = async (productId) => {
  try {
    const response = await fetch(`/api/products/${productId}/rating`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch rating: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.rating || {
      averageRating: 0,
      totalRatings: 0,
      fiveStarCount: 0,
      fourStarCount: 0,
      threeStarCount: 0,
      twoStarCount: 0,
      oneStarCount: 0
    };
  } catch (error) {
    console.error('Error fetching product rating:', error);
    return {
      averageRating: 0,
      totalRatings: 0,
      fiveStarCount: 0,
      fourStarCount: 0,
      threeStarCount: 0,
      twoStarCount: 0,
      oneStarCount: 0
    };
  }
};

/**
 * Submits a review for a product
 * @param {string} productId - The product ID
 * @param {number} rating - Rating from 1-5
 * @param {string} reviewText - Review text
 * @param {string} title - Review title
 * @returns {Promise<Object>} - Created review
 */
export const submitReview = async (productId, rating, reviewText, title) => {
  try {
    const response = await fetch(`/api/products/${productId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ rating, reviewText, title })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to submit review: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.review;
  } catch (error) {
    console.error('Error submitting review:', error);
    throw error;
  }
};

/**
 * Updates an existing review
 * @param {number} reviewId - The review ID
 * @param {number} rating - Updated rating (1-5)
 * @param {string} reviewText - Updated review text
 * @param {string} title - Updated review title
 * @returns {Promise<Object>} - Updated review
 */
export const updateReview = async (reviewId, rating, reviewText, title) => {
  try {
    const response = await fetch(`/api/reviews/${reviewId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ rating, reviewText, title })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update review: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.review;
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

/**
 * Deletes a review
 * @param {number} reviewId - The review ID
 * @returns {Promise<boolean>} - Success status
 */
export const deleteReview = async (reviewId) => {
  try {
    const response = await fetch(`/api/reviews/${reviewId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete review: ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};