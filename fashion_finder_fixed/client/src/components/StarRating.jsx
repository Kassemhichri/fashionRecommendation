import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

/**
 * Star Rating Component
 * @param {Object} props - Component props
 * @param {number} props.rating - The rating value (0-5)
 * @param {number} props.size - Size of stars in pixels
 * @param {boolean} props.interactive - Whether the stars can be clicked
 * @param {Function} props.onChange - Callback for when stars are clicked (only used if interactive)
 * @returns {JSX.Element} - Rendered component
 */
const StarRating = ({ rating = 0, size = 20, interactive = false, onChange }) => {
  // Convert string rating to number if needed
  const numericRating = typeof rating === 'string' ? parseFloat(rating) : rating;
  
  // Create an array of 5 stars
  const stars = Array.from({ length: 5 }, (_, index) => {
    const value = index + 1;
    
    // For display-only stars
    if (!interactive) {
      // Full star
      if (value <= numericRating) {
        return <FaStar key={index} size={size} className="text-yellow-400" />;
      }
      // Half star
      else if (value - 0.5 <= numericRating) {
        return <FaStarHalfAlt key={index} size={size} className="text-yellow-400" />;
      }
      // Empty star
      else {
        return <FaRegStar key={index} size={size} className="text-gray-300" />;
      }
    }
    
    // For interactive stars
    return (
      <span 
        key={index} 
        className="cursor-pointer" 
        onClick={() => onChange && onChange(value)}
        onKeyDown={(e) => e.key === 'Enter' && onChange && onChange(value)}
        tabIndex={0}
        role="button"
        aria-label={`Rate ${value} out of 5 stars`}
      >
        {value <= numericRating ? (
          <FaStar size={size} className="text-yellow-400" />
        ) : (
          <FaRegStar size={size} className="text-gray-300 hover:text-yellow-200" />
        )}
      </span>
    );
  });

  return (
    <div className="flex">
      {stars}
      {!interactive && numericRating > 0 && (
        <span className="ml-2 text-sm text-gray-600">
          {numericRating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;