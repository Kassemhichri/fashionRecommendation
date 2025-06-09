import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import ProductGrid from '../components/ProductGrid';
import { getRecommendedProducts } from '../services/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const RecommendationsPage = () => {
  const [location, setLocation] = useLocation();
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationInfo, setRecommendationInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useEmbeddings, setUseEmbeddings] = useState(false);
  const { toast } = useToast();

  // Create a refresh function that can be called both in useEffect and by user actions
  const refreshRecommendations = async () => {
    try {
      setIsLoading(true);
      // Pass the useEmbeddings flag to determine which recommendation system to use
      const result = await getRecommendedProducts(useEmbeddings);
      
      console.log('Recommendations page received:', result);
      
      if (!result || !result.recommendations || result.recommendations.length === 0) {
        setError({ message: "No recommendations found. Like some products to get personalized recommendations." });
      } else {
        // Make sure we have an array of recommendations
        const recArray = Array.isArray(result.recommendations) 
          ? result.recommendations 
          : (Array.isArray(result) ? result : []);
          
        // CRITICAL FIX: Make absolutely sure we filter out any disliked products
        // that might have slipped through the server-side filters
        const dislikedProductsStore = window.dislikedProductsStore || new Set();
        const filteredRecs = recArray.filter(product => {
          if (dislikedProductsStore.has(product.id)) {
            console.warn(`Client-side removing disliked product ${product.id} from recommendations`);
            return false;
          }
          return true;
        });
        
        console.log(`Filtered recommendations: ${recArray.length} -> ${filteredRecs.length}`);
        setRecommendations(filteredRecs);
        
        // Store additional recommendation metadata if available
        if (result.recommendationType || result.message || result.basedOn) {
          setRecommendationInfo({
            type: result.recommendationType,
            message: result.message,
            basedOn: result.basedOn || {}
          });
        }
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError({ message: "Failed to load recommendations. Please try again later." });
      
      toast({
        title: "Error",
        description: "Failed to load recommendations. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Register the refresh function globally so ProductCard can trigger refreshes
  // when user likes/dislikes a product
  window.refreshRecommendations = () => {
    console.log('Global refresh recommendations function called');
    
    // Use a timeout to let the database update before fetching recommendations
    setTimeout(() => {
      console.log(`Executing delayed refresh with ${useEmbeddings ? 'embedding-based' : 'classic'} recommendations`);
      refreshRecommendations();
    }, 300);
  };
  
  // Also register the current embeddings mode so it's accessible to other components
  window.useEmbeddingRecommendations = useEmbeddings;

  // Component did mount - initial load
  useEffect(() => {
    refreshRecommendations();
  }, []);

  // Render recommendation metadata badges if available
  const renderRecommendationBadges = () => {
    if (!recommendationInfo || !recommendationInfo.basedOn) return null;
    
    // Collect all badge items 
    const badges = [];
    
    if (recommendationInfo.basedOn.categories) {
      recommendationInfo.basedOn.categories.forEach(cat => {
        if (cat) badges.push({ type: 'Category', value: cat });
      });
    }
    
    if (recommendationInfo.basedOn.colors) {
      recommendationInfo.basedOn.colors.forEach(color => {
        if (color) badges.push({ type: 'Color', value: color });
      });
    }
    
    if (recommendationInfo.basedOn.keywords && recommendationInfo.basedOn.keywords.length > 0) {
      recommendationInfo.basedOn.keywords.slice(0, 5).forEach(keyword => {
        if (keyword) badges.push({ type: 'Style', value: keyword });
      });
    }
    
    if (badges.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-2 justify-center mt-4 mb-8">
        {badges.map((badge, index) => (
          <Badge key={index} variant="outline" className="px-3 py-1">
            <span className="text-xs font-semibold text-gray-500 mr-1">{badge.type}:</span> 
            <span className="text-sm">{badge.value}</span>
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-6">
        <div className="flex flex-col md:flex-row justify-center items-center gap-3 mb-4">
          <h2 className="text-3xl md:text-4xl font-bold font-poppins">Your Personal Recommendations</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="use-embeddings"
                checked={useEmbeddings}
                onCheckedChange={(checked) => {
                  setUseEmbeddings(checked);
                  setTimeout(() => refreshRecommendations(), 100);
                }}
              />
              <Label htmlFor="use-embeddings" className="text-sm">
                {useEmbeddings ? "Visual AI" : "Classic"} Recommendations
              </Label>
            </div>
            <Button 
              variant="outline"
              size="sm"
              onClick={refreshRecommendations}
              disabled={isLoading}
            >
              {isLoading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {!isLoading && recommendationInfo && recommendationInfo.message ? 
            recommendationInfo.message : 
            "Based on your style preferences and interactions, we've curated these items just for you."
          }
        </p>
        
        {/* Display recommendation badges */}
        {!isLoading && renderRecommendationBadges()}
      </div>

      <ProductGrid 
        products={recommendations} 
        isLoading={isLoading}
        error={error}
        isRecommendations={true}
        emptyMessage="Try liking some products to get personalized recommendations!"
      />

      {!isLoading && recommendations.length > 0 && (
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Not seeing what you like? Explore more products to improve your recommendations.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              className="bg-primary hover:bg-opacity-90 text-white font-medium py-2 px-6 rounded-lg"
              onClick={() => setLocation('/merged-products')}
            >
              Browse All Products
            </Button>
            <Button 
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-white font-medium py-2 px-6 rounded-lg"
              onClick={() => setLocation('/quiz')}
            >
              Take Style Quiz
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationsPage;
