import React, { useState, useEffect } from 'react';
import StarRating from './StarRating';

/**
 * Review Form Component for submitting or editing product reviews
 * @param {Object} props - Component props
 * @param {Object} props.initialValues - Initial values for the form (used for editing)
 * @param {Function} props.onSubmit - Callback function when form is submitted
 * @param {Function} props.onCancel - Callback function when form is canceled
 * @param {boolean} props.isEditing - Whether we're editing an existing review
 * @returns {JSX.Element} - Rendered component
 */
const ReviewForm = ({ 
  initialValues = {}, 
  onSubmit, 
  onCancel,
  isEditing = false
}) => {
  // Form state
  const [rating, setRating] = useState(initialValues.rating || 0);
  const [title, setTitle] = useState(initialValues.title || '');
  const [reviewText, setReviewText] = useState(initialValues.reviewText || '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle new initialValues (when switching to edit mode)
  useEffect(() => {
    if (initialValues) {
      setRating(initialValues.rating || 0);
      setTitle(initialValues.title || '');
      setReviewText(initialValues.reviewText || '');
    }
  }, [initialValues]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!rating) {
      setError('Please select a rating');
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    
    try {
      // Call the onSubmit callback with form data
      await onSubmit({
        rating,
        title,
        reviewText
      });
      
      // Reset form if not editing
      if (!isEditing) {
        setRating(0);
        setTitle('');
        setReviewText('');
      }
    } catch (err) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg border mb-6">
      <h3 className="text-xl font-semibold mb-4">
        {isEditing ? 'Edit Your Review' : 'Write a Review'}
      </h3>
      
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 p-2 bg-red-50 text-red-600 rounded">
            {error}
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Rating <span className="text-red-500">*</span>
          </label>
          <StarRating 
            rating={rating} 
            size={24} 
            interactive={true} 
            onChange={setRating} 
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="review-title" className="block text-sm font-medium mb-1">
            Title
          </label>
          <input
            id="review-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
            placeholder="Summarize your review"
            maxLength={100}
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="review-text" className="block text-sm font-medium mb-1">
            Review
          </label>
          <textarea
            id="review-text"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
            placeholder="Share your experience with this product"
            rows={4}
            maxLength={1000}
          />
        </div>
        
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting 
              ? 'Submitting...' 
              : isEditing 
                ? 'Update Review' 
                : 'Submit Review'
            }
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;