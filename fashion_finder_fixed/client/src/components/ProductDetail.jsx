import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../context/AuthContext';
import { getProductById, toggleProductLike } from '../services/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const ProductDetail = ({ productId }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [selectedSize, setSelectedSize] = useState('M');
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await getProductById(productId);
        setProduct(data);
        setIsLiked(data.isLiked || false);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  const handleToggleLike = async () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to like products",
        variant: "destructive"
      });
      return;
    }

    try {
      const newLikeStatus = !isLiked;
      setIsLiked(newLikeStatus);
      
      await toggleProductLike(productId, newLikeStatus ? 'like' : 'dislike');
    } catch (error) {
      console.error('Error toggling like:', error);
      setIsLiked(!isLiked); // Revert on error
      
      toast({
        title: "Error",
        description: "Failed to update like status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAddToCart = () => {
    toast({
      title: "Added to Cart",
      description: `${product.productDisplayName} (Size: ${selectedSize}) has been added to your cart.`
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/2 p-4 md:p-0">
          <Skeleton className="w-full h-[500px]" />
        </div>
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col">
          <Skeleton className="h-4 w-1/3 mb-2" />
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-6 w-1/4 mb-6" />
          
          <Skeleton className="h-px w-full my-4" />
          
          <Skeleton className="h-5 w-1/4 mb-2" />
          <Skeleton className="h-16 w-full mb-6" />
          
          <Skeleton className="h-5 w-1/4 mb-3" />
          <div className="flex gap-2 mb-6">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
          </div>
          
          <div className="mt-auto">
            <Skeleton className="h-12 w-full mb-4" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-10">
        <h3 className="text-xl font-bold text-red-500 mb-3">Error Loading Product</h3>
        <p className="text-gray-600 mb-6">{error || "Product not found"}</p>
        <Button 
          className="bg-primary hover:bg-opacity-90 text-white font-medium py-2 px-6 rounded-lg"
          onClick={() => setLocation('/products')}
        >
          Browse All Products
        </Button>
      </div>
    );
  }

  // Format price from product id (since we don't have actual prices in data)
  const formatPrice = (id) => {
    const basePrice = parseFloat(id) % 100;
    return `$${(basePrice + 29.99).toFixed(2)}`;
  };

  return (
    <div className="flex flex-col md:flex-row">
      <div className="md:w-1/2 p-4 md:p-0">
        <div className="relative">
          <img 
            src={product.imageUrl} 
            alt={product.productDisplayName} 
            className="w-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/600x800?text=Image+Not+Available';
            }}
          />
          <button 
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-400 hover:text-primary transition-colors md:hidden"
            onClick={handleToggleLike}
          >
            <i className={isLiked ? "fas fa-heart text-primary" : "far fa-heart text-xl"}></i>
          </button>
        </div>
      </div>
      
      <div className="md:w-1/2 p-6 md:p-8 flex flex-col">
        <div className="mb-4">
          <div className="text-sm text-gray-500">
            {product.gender} • {product.articleType} • {product.usage}
          </div>
          <h2 className="text-2xl font-bold mt-2">{product.productDisplayName}</h2>
          <div className="text-xl font-semibold text-primary mt-2">{formatPrice(product.id)}</div>
        </div>
        
        <div className="py-4 border-t border-b border-gray-200 mb-4">
          <h3 className="font-medium mb-2">Description</h3>
          <p className="text-gray-600 text-sm">
            {product.productDisplayName}. This {product.baseColour} {product.articleType.toLowerCase()} is perfect for {product.usage.toLowerCase()} occasions. 
            Made with premium quality materials to ensure comfort and style. This item is from the {product.season} {product.year} collection.
          </p>
        </div>
        
        <div className="mb-4">
          <h3 className="font-medium mb-3">Select Size</h3>
          <div className="flex flex-wrap gap-2">
            {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
              <button 
                key={size}
                className={`border ${
                  selectedSize === size 
                    ? 'border-primary bg-primary bg-opacity-5' 
                    : 'border-gray-300 hover:border-primary'
                } py-2 px-4 rounded-md text-sm ${
                  size === 'XXL' ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => size !== 'XXL' && handleSizeSelect(size)}
                disabled={size === 'XXL'}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
        
        <div className="mt-auto pt-4">
          <div className="flex space-x-4">
            <button 
              className="flex-1 bg-primary hover:bg-opacity-90 text-white py-3 px-6 rounded-lg text-sm font-medium"
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>
            <button 
              className="w-12 h-12 flex items-center justify-center border border-gray-300 rounded-lg hover:border-primary hover:text-primary"
              onClick={handleToggleLike}
            >
              <i className={isLiked ? "fas fa-heart text-primary" : "far fa-heart"}></i>
            </button>
          </div>
          
          {product.isRecommended && (
            <div className="mt-6 text-sm text-accent">
              <div className="flex items-start mb-2">
                <i className="fas fa-check-circle mt-0.5 mr-2"></i>
                <span>Recommended for you based on your style preferences</span>
              </div>
              <div className="flex items-start">
                <i className="fas fa-info-circle mt-0.5 mr-2"></i>
                <span>This item matches the "{product.usage}" style you selected in your quiz</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
