import { useEffect, useState } from 'react';
import ProductDetail from '../components/ProductDetail';
import ProductGrid from '../components/ProductGrid';
import ProductReviews from '../components/ProductReviews';
import { useParams } from 'wouter';
import { useAuth } from '../context/AuthContext';
import { getSimilarProducts, recordProductView } from '../services/api';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [similarProducts, setSimilarProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [useEmbeddings, setUseEmbeddings] = useState(false);
  const [similarityInfo, setSimilarityInfo] = useState(null);

  // Function to fetch similar products
  const fetchSimilarProducts = async () => {
    try {
      setIsLoading(true);
      
      // Record that user viewed this product
      await recordProductView(id);
      
      console.log(`Getting ${useEmbeddings ? 'visual AI' : 'category-based'} similar products for ${id}`);
      
      // Get similar products using either embeddings or regular method
      const response = await getSimilarProducts(id, useEmbeddings);
      
      console.log('Similar products response:', response);
      
      // Extract products array depending on response format
      let productsArray = [];
      if (response.similarProducts) {
        productsArray = response.similarProducts;
        // Store additional similarity info
        setSimilarityInfo({
          technology: response.technology || 'embedding-based similarity',
          count: response.similarProducts.length
        });
      } else if (Array.isArray(response)) {
        productsArray = response;
        setSimilarityInfo(null);
      } else {
        console.warn('Unexpected similar products response format', response);
      }
      
      setSimilarProducts(productsArray);
    } catch (err) {
      console.error('Error fetching similar products:', err);
      setSimilarProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch similar products when id changes or embedding mode changes
  useEffect(() => {
    if (id) {
      fetchSimilarProducts();
    }
  }, [id, useEmbeddings]);

  return (
    <div className="bg-white py-10">
      <div className="container mx-auto px-4">
        {/* Product Details */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-10">
          <ProductDetail productId={id} />
        </div>
        
        {/* Product Reviews */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 mb-10">
          <ProductReviews productId={id} currentUser={user} />
        </div>
        
        {/* Similar Products */}
        <div className="mt-16">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-2xl font-bold font-poppins">You May Also Like</h2>
            
            <div className="flex items-center space-x-2 mt-2 sm:mt-0">
              <Switch 
                id="use-visual-ai"
                checked={useEmbeddings}
                onCheckedChange={(checked) => {
                  setUseEmbeddings(checked);
                  // fetchSimilarProducts will be called by useEffect
                }}
              />
              <Label htmlFor="use-visual-ai" className="text-sm">
                {useEmbeddings ? "Visual AI" : "Category-based"} Similarity
              </Label>
            </div>
          </div>
          
          {similarityInfo && useEmbeddings && (
            <div className="mb-4">
              <Badge variant="outline" className="bg-primary/10 hover:bg-primary/20 text-primary">
                {similarityInfo.technology}
              </Badge>
            </div>
          )}
          
          <ProductGrid 
            products={similarProducts} 
            isLoading={isLoading}
            emptyMessage="No similar products found. Try a different similarity method."
          />
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
