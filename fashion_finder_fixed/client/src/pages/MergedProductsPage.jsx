import { useState, useEffect } from 'react';
import { apiRequest } from '../lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import ProductCard from '../components/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';

const MergedProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        // Use fetch directly to have more control over the request and request all products
        const response = await fetch('/api/merged-products?all=true');
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        setProducts(data.products || []);
        
        // Log the number of products loaded
        console.log(`Loaded ${data.products?.length || 0} products from CSV data`);
      } catch (err) {
        console.error('Error fetching merged products:', err);
        setError('Failed to load products: ' + err.message);
        
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
  }, [toast]);

  const LoadingSkeleton = () => (
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

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 font-poppins">All Products</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Browse our complete collection of fashion products from various brands, styles, and categories.
        </p>
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : error ? (
        <div className="text-center py-10">
          <h3 className="text-xl font-medium text-red-500 mb-2">Error Loading Products</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      ) : !products || products.length === 0 ? (
        <div className="text-center py-10">
          <h3 className="text-xl font-medium mb-2">No Products Found</h3>
          <p className="text-gray-600">There are no products available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MergedProductsPage;