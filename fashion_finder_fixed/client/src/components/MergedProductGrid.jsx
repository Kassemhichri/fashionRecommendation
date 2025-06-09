import { useState, useEffect } from 'react';
import { apiRequest } from '../lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import ProductCard from './ProductCard';
import { Skeleton } from '@/components/ui/skeleton';

const MergedProductGrid = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await apiRequest('/api/merged-products');
        setProducts(response.products || []);
      } catch (err) {
        console.error('Error fetching merged products:', err);
        setError('Failed to load products');
        
        toast({
          title: "Error",
          description: "Failed to load products. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
            <Skeleton className="w-full h-64" />
            <div className="p-4">
              <Skeleton className="h-4 w-1/3 mb-2" />
              <Skeleton className="h-5 w-3/4 mb-2" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <h3 className="text-xl font-medium text-red-500 mb-2">Error Loading Products</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-xl font-medium mb-2">No Products Found</h3>
        <p className="text-gray-600">There are no products available at the moment.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Products from Merged Dataset</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => {
          // Convert the merged data format to match what ProductCard expects
          const adaptedProduct = {
            id: product.id.toString(),
            gender: product.gender,
            articleType: product.articleType,
            baseColour: product.baseColour,
            usage: product.usage,
            productDisplayName: product.productDisplayName,
            // If we want to use the imageUrl from our merged data:
            // imageUrl: product.imageUrl
          };
          
          return (
            <ProductCard 
              key={product.id} 
              product={adaptedProduct} 
              // Override the image source if needed:
              // customImageUrl={product.imageUrl}
            />
          );
        })}
      </div>
    </div>
  );
};

export default MergedProductGrid;