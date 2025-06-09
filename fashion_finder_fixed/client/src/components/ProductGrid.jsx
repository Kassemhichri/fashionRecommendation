import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const ProductGrid = ({ products, isLoading, error, isRecommendations = false }) => {
  const generateRecommendationReason = (index) => {
    const reasons = [
      "Recommended for you",
      "Matches your style",
      "Based on your quiz",
      "People with similar taste liked this"
    ];
    return reasons[index % reasons.length];
  };

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
        <p className="text-gray-600">{error.message || "Failed to load products. Please try again later."}</p>
      </div>
    );
  }

  // Ensure products is always an array
  const productArray = Array.isArray(products) ? products : [];
  
  // Filter out disliked products (additional safety measure)
  const dislikedProductsStore = window.dislikedProductsStore || new Set();
  const filteredProducts = productArray.filter(product => !dislikedProductsStore.has(product.id));
  
  // Use the filtered products array instead of the original
  if (!filteredProducts || filteredProducts.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-xl font-medium mb-2">No Products Found</h3>
        <p className="text-gray-600 mb-6">
          {productArray.length > 0 && filteredProducts.length === 0 
            ? "All available products have been disliked. Try exploring new categories!"
            : "Try adjusting your filters or search criteria."}
        </p>
        <Button 
          className="bg-primary hover:bg-opacity-90 text-white font-medium py-2 px-6 rounded-lg"
          onClick={() => window.location.href = '/products'}
        >
          Browse All Products
        </Button>
      </div>
    );
  }

  // Log difference between original and filtered arrays
  if (productArray.length !== filteredProducts.length) {
    console.log(`ProductGrid filtered out ${productArray.length - filteredProducts.length} disliked products`);
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {filteredProducts.map((product, index) => (
        <ProductCard 
          key={product.id || index} 
          product={product} 
          isRecommended={isRecommendations} 
          reason={isRecommendations ? generateRecommendationReason(index) : ''}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
