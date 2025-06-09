import React from 'react';
import StarRating from './StarRating';

/**
 * Review List Component - Displays a list of product reviews
 * @param {Object} props - Component props
 * @param {Array} props.reviews - Array of review objects
 * @param {Function} props.onEdit - Callback for editing a review
 * @param {Function} props.onDelete - Callback for deleting a review
 * @param {Number} props.currentUserId - Current user ID to show edit/delete buttons
 * @returns {JSX.Element} - Rendered component
 */
const ReviewList = ({ reviews = [], onEdit, onDelete, currentUserId }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        No reviews yet. Be the first to review this product!
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">Customer Reviews ({reviews.length})</h3>
      
      {reviews.map((review) => (
        <div key={review.id} className="border-b pb-4 mb-4 last:border-b-0">
          <div className="flex justify-between items-start">
            <div>
              {review.title && (
                <h4 className="font-medium text-lg">{review.title}</h4>
              )}
              
              <div className="flex items-center gap-2 mb-2">
                <StarRating rating={review.rating} size={16} />
                <span className="text-sm text-gray-600">
                  by {review.username || 'Anonymous'}
                </span>
              </div>
            </div>
            
            {/* Show edit/delete buttons if this is the user's review */}
            {currentUserId && currentUserId === review.userId && (
              <div className="flex gap-2">
                <button 
                  onClick={() => onEdit(review)} 
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded"
                >
                  Edit
                </button>
                <button 
                  onClick={() => onDelete(review.id)} 
                  className="text-xs bg-red-50 hover:bg-red-100 text-red-700 px-2 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
          
          <div className="text-sm text-gray-500 mb-2">
            {formatDate(review.createdAt)}
            {review.createdAt !== review.updatedAt && ' (edited)'}
          </div>
          
          {review.reviewText && (
            <div className="text-gray-700 whitespace-pre-line">
              {review.reviewText}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReviewList;