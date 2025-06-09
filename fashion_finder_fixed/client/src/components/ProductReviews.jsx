import React, { useState, useEffect } from 'react';
import ReviewList from './ReviewList';
import ReviewForm from './ReviewForm';
import RatingSummary from './RatingSummary';
import { 
  getProductReviews, 
  getProductRating, 
  submitReview, 
  updateReview, 
  deleteReview 
} from '../services/reviewService';

/**
 * Product Reviews Component - Main container for all review functionality
 * @param {Object} props - Component props
 * @param {string} props.productId - ID of the product
 * @param {Object} props.currentUser - Current user object
 * @returns {JSX.Element} - Rendered component
 */
const ProductReviews = ({ productId, currentUser }) => {
  // State
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [userHasReviewed, setUserHasReviewed] = useState(false);

  // Fetch reviews and rating on component mount or when productId changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Fetch reviews and rating in parallel
        const [reviewsData, ratingData] = await Promise.all([
          getProductReviews(productId),
          getProductRating(productId)
        ]);
        
        setReviews(reviewsData);
        setRating(ratingData);
        
        // Check if current user has already reviewed this product
        if (currentUser && currentUser.id) {
          const userReview = reviewsData.find(review => 
            review.userId === currentUser.id
          );
          
          if (userReview) {
            setUserHasReviewed(true);
            setEditingReview(userReview);
          } else {
            setUserHasReviewed(false);
            setEditingReview(null);
          }
        }
      } catch (err) {
        console.error('Error fetching review data:', err);
        setError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };
    
    if (productId) {
      fetchData();
    }
  }, [productId, currentUser]);

  // Handle review submission
  const handleSubmitReview = async (formData) => {
    try {
      let newReview;
      
      if (editingReview && editingReview.id) {
        // Update existing review
        newReview = await updateReview(
          editingReview.id,
          formData.rating,
          formData.reviewText,
          formData.title
        );
        
        // Update reviews list
        setReviews(reviews.map(review => 
          review.id === editingReview.id ? newReview : review
        ));
      } else {
        // Submit new review
        newReview = await submitReview(
          productId,
          formData.rating,
          formData.reviewText,
          formData.title
        );
        
        // Add new review to list
        setReviews([newReview, ...reviews]);
        setUserHasReviewed(true);
        setEditingReview(newReview);
      }
      
      // Refresh rating summary
      const updatedRating = await getProductRating(productId);
      setRating(updatedRating);
      
      // Hide form
      setShowForm(false);
    } catch (err) {
      console.error('Error submitting review:', err);
      throw new Error('Failed to submit review. Please try again.');
    }
  };

  // Handle review edit button click
  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowForm(true);
  };

  // Handle review delete
  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await deleteReview(reviewId);
        
        // Remove from reviews list
        setReviews(reviews.filter(review => review.id !== reviewId));
        
        // Reset user review state
        setUserHasReviewed(false);
        setEditingReview(null);
        
        // Refresh rating summary
        const updatedRating = await getProductRating(productId);
        setRating(updatedRating);
      } catch (err) {
        console.error('Error deleting review:', err);
        alert('Failed to delete review. Please try again.');
      }
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="py-6 text-center text-gray-500">
        Loading reviews...
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="py-6 text-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="my-8">
      <h2 className="text-2xl font-bold mb-6">Reviews</h2>
      
      {/* Rating summary */}
      <RatingSummary rating={rating} />
      
      {/* Review form - only show if user is logged in and hasn't reviewed yet or is editing */}
      {currentUser ? (
        showForm ? (
          <ReviewForm
            initialValues={editingReview || {}}
            onSubmit={handleSubmitReview}
            onCancel={() => setShowForm(false)}
            isEditing={!!editingReview}
          />
        ) : (
          <div className="mb-6">
            {userHasReviewed ? (
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none"
              >
                Edit Your Review
              </button>
            ) : (
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none"
              >
                Write a Review
              </button>
            )}
          </div>
        )
      ) : (
        <div className="mb-6 p-4 bg-blue-50 text-blue-700 rounded">
          Please <a href="/login" className="underline">log in</a> to write a review.
        </div>
      )}
      
      {/* Reviews list */}
      <ReviewList
        reviews={reviews}
        onEdit={handleEditReview}
        onDelete={handleDeleteReview}
        currentUserId={currentUser?.id}
      />
    </div>
  );
};

export default ProductReviews;