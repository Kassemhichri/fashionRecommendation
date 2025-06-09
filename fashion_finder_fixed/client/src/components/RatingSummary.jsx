import React from 'react';
import StarRating from './StarRating';

/**
 * Rating Summary Component - Shows breakdown of product ratings
 * @param {Object} props - Component props
 * @param {Object} props.rating - Rating summary object
 * @returns {JSX.Element} - Rendered component
 */
const RatingSummary = ({ rating }) => {
  if (!rating) {
    return null;
  }

  const {
    averageRating,
    totalRatings,
    fiveStarCount,
    fourStarCount,
    threeStarCount,
    twoStarCount,
    oneStarCount
  } = rating;

  // Convert to numbers if they're strings
  const avgRating = typeof averageRating === 'string' 
    ? parseFloat(averageRating) 
    : averageRating;
  
  // If no ratings, show empty state
  if (!totalRatings || totalRatings === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg mb-6">
        <h3 className="text-xl font-semibold mb-2">Customer Reviews</h3>
        <p className="text-gray-500">No ratings yet</p>
      </div>
    );
  }

  // Calculate percentage for each star count
  const getPercentage = (count) => {
    return (count / totalRatings) * 100;
  };

  // Render progress bar for each star level
  const renderProgressBar = (count, label) => {
    const percentage = getPercentage(count);
    
    return (
      <div className="flex items-center mb-1">
        <div className="w-24 text-sm text-gray-600">{label}</div>
        <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-yellow-400 h-full" 
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="w-16 text-right text-sm text-gray-600">
          {count} ({Math.round(percentage)}%)
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg mb-6">
      <h3 className="text-xl font-semibold mb-2">Customer Reviews</h3>
      
      <div className="flex items-center mb-4">
        <div className="mr-2">
          <span className="text-3xl font-bold">{avgRating.toFixed(1)}</span>
          <span className="text-gray-500 ml-1">/ 5</span>
        </div>
        <div>
          <StarRating rating={avgRating} size={20} />
          <div className="text-sm text-gray-500 mt-1">
            {totalRatings} {totalRatings === 1 ? 'review' : 'reviews'}
          </div>
        </div>
      </div>
      
      <div className="space-y-1">
        {renderProgressBar(fiveStarCount, '5 stars')}
        {renderProgressBar(fourStarCount, '4 stars')}
        {renderProgressBar(threeStarCount, '3 stars')}
        {renderProgressBar(twoStarCount, '2 stars')}
        {renderProgressBar(oneStarCount, '1 star')}
      </div>
    </div>
  );
};

export default RatingSummary;