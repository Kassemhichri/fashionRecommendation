import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

// Create a global store to track liked and disliked products across page changes
// This will persist data between component unmounts/remounts
const likedProductsStore = window.likedProductsStore = window.likedProductsStore || new Set();
const dislikedProductsStore = window.dislikedProductsStore = window.dislikedProductsStore || new Set();

const ProductCard = ({ product, isRecommended = false, reason = '', customImageUrl = null }) => {
  // Initialize state from props or from our global store
  const [isLiked, setIsLiked] = useState(
    product.isLiked || likedProductsStore.has(product.id) || false
  );
  const [isDisliked, setIsDisliked] = useState(
    product.isDisliked || dislikedProductsStore.has(product.id) || false
  );
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();
  
  // Format price from product id (since we don't have actual prices in data)
  // This is just a placeholder approach
  const formatPrice = (id) => {
    const basePrice = parseFloat(id) % 100;
    return `$${(basePrice + 29.99).toFixed(2)}`;
  };

  // Utility function to refresh recommendations if we're on the recommendations page
  // or when we're interacting with a recommended product
  const refreshRecommendationsIfNeeded = () => {
    console.log('Attempting to refresh recommendations...');
    // If we're on the recommendations page or this is a recommended product
    if (location === '/recommendations' || isRecommended) {
      console.log('Refreshing recommendations due to interaction');
      if (typeof window.refreshRecommendations === 'function') {
        window.refreshRecommendations();
      } else {
        console.log('No global refresh function available');
      }
    }
  };
  
  const saveInteraction = async (productId, interactionType) => {
    try {
      // For demo purposes, allow interactions without login
      // if (!user) return null;
      
      // Use application/json content type
      const response = await fetch('/api/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId,
          interactionType,
          // Send a demo user ID for testing if no user is logged in
          userId: user?.id || 'demo-user-123'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save interaction');
      }
      
      const result = await response.json();
      console.log('Interaction saved:', result);
      return result;
    } catch (error) {
      console.error('Error saving interaction:', error);
      throw error;
    }
  };

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Demo mode: Allow interactions without login
    // if (!user) {
    //   toast({
    //     title: "Please log in",
    //     description: "You need to be logged in to like products",
    //     variant: "destructive"
    //   });
    //   return;
    // }

    try {
      // If already liked, do nothing (or could implement unlike in the future)
      if (isLiked) {
        return;
      }
      
      // Update UI state first for better UX
      setIsLiked(true);
      
      // Update global store to persist across page navigation
      likedProductsStore.add(product.id);
      
      // If product was previously disliked, clear that state
      if (isDisliked) {
        setIsDisliked(false);
        dislikedProductsStore.delete(product.id);
      }
      
      // Save the interaction to the database
      await saveInteraction(product.id, 'like');
      
      // Refresh recommendations after liking a product
      refreshRecommendationsIfNeeded();
      
      toast({
        title: "Success",
        description: "Product added to your liked items",
        variant: "default"
      });
    } catch (error) {
      console.error('Error saving like:', error);
      // Revert the like state on error
      setIsLiked(false);
      likedProductsStore.delete(product.id);
      
      if (isDisliked) {
        setIsDisliked(true);
        dislikedProductsStore.add(product.id);
      }
      
      toast({
        title: "Error",
        description: "Failed to save your preference. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDislike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Demo mode: Allow interactions without login
    // if (!user) {
    //   toast({
    //     title: "Please log in",
    //     description: "You need to be logged in to dislike products",
    //     variant: "destructive"
    //   });
    //   return;
    // }

    try {
      // If already disliked, do nothing (or could implement un-dislike in the future)
      if (isDisliked) {
        return;
      }
      
      // Update UI state first for better UX
      setIsDisliked(true);
      
      // Update global store to persist across page navigation
      dislikedProductsStore.add(product.id);
      
      // If product was previously liked, clear that state
      if (isLiked) {
        setIsLiked(false);
        likedProductsStore.delete(product.id);
      }
      
      // Save the interaction to the database
      await saveInteraction(product.id, 'dislike');
      
      // Refresh recommendations after disliking a product
      // This is especially important as disliked products should be removed
      refreshRecommendationsIfNeeded();
      
      toast({
        title: "Feedback Saved",
        description: "We'll use this to improve your recommendations",
        variant: "default"
      });
    } catch (error) {
      console.error('Error saving dislike:', error);
      // Revert the dislike state on error
      setIsDisliked(false);
      dislikedProductsStore.delete(product.id);
      
      if (isLiked) {
        setIsLiked(true);
        likedProductsStore.add(product.id);
      }
      
      toast({
        title: "Error",
        description: "Failed to save your preference. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <Skeleton className="w-full h-64" />
            </div>
          )}
          <img 
            src={customImageUrl || product.imageUrl} 
            alt={product.productDisplayName} 
            className={`w-full h-64 object-cover ${imageError ? 'hidden' : ''}`}
            onLoad={() => setImageLoading(false)}
            onError={(e) => {
              console.log(`Image failed to load: ${product.imageUrl}`);
              setImageLoading(false);
              setImageError(true);
              e.target.onerror = null;
            }}
          />
          {imageError && (
            <div className="w-full h-64 flex flex-col items-center justify-center bg-gray-100 p-4 text-center">
              <div className="text-gray-500 mb-2">
                <i className="fas fa-tshirt text-4xl"></i>
              </div>
              <div className="text-sm font-medium text-gray-700 px-2">{product.productDisplayName}</div>
              <div className="text-xs text-gray-500 mt-1">{product.gender} • {product.articleType}</div>
              <div className="text-xs text-gray-500 mt-1">{product.baseColour} • {product.usage}</div>
            </div>
          )}
          <div className="absolute top-3 right-3 flex space-x-2">
            <button 
              className={`w-8 h-8 rounded-full bg-white shadow flex items-center justify-center ${isLiked ? 'text-green-500' : 'text-gray-400 hover:text-green-500'} transition-colors`}
              onClick={handleLike}
            >
              <i className={isLiked ? "fas fa-thumbs-up" : "far fa-thumbs-up"}></i>
            </button>
            <button 
              className={`w-8 h-8 rounded-full bg-white shadow flex items-center justify-center ${isDisliked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'} transition-colors`}
              onClick={handleDislike}
            >
              <i className={isDisliked ? "fas fa-thumbs-down" : "far fa-thumbs-down"}></i>
            </button>
          </div>
        </div>
        <div className="p-4">
          <div className="text-xs text-gray-500 mb-1">
            {product.gender} • {product.articleType}
          </div>
          <h3 className="font-medium text-gray-900 mb-1 truncate">
            {product.productDisplayName}
          </h3>
          <div className="flex justify-between items-center">
            <div className="text-primary font-semibold">{formatPrice(product.id)}</div>
            <div className="text-xs text-gray-500">{product.usage}</div>
          </div>
          {isRecommended && (
            <div className="flex items-center mt-2">
              <div className="text-accent text-xs font-medium">
                <i className="fas fa-check-circle mr-1"></i> {reason || 'Recommended for you'}
              </div>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
