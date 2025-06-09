import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import HeroSection from '../components/HeroSection';
import ProductGrid from '../components/ProductGrid';
import { getRecommendedProducts, getFeaturedProducts } from '../services/api';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoadingRecommended, setIsLoadingRecommended] = useState(false);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoadingFeatured(true);
        const featured = await getFeaturedProducts();
        setFeaturedProducts(featured);
      } catch (err) {
        console.error('Error fetching featured products:', err);
        setError(err.message);
      } finally {
        setIsLoadingFeatured(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchRecommendedProducts = async () => {
      if (user) {
        try {
          setIsLoadingRecommended(true);
          const recommended = await getRecommendedProducts();
          setRecommendedProducts(recommended);
        } catch (err) {
          console.error('Error fetching recommended products:', err);
        } finally {
          setIsLoadingRecommended(false);
        }
      }
    };

    fetchRecommendedProducts();
  }, [user]);

  return (
    <>
      <HeroSection />

      {/* Recommended Products Section - Only shown if user is logged in */}
      {user && (
        <section className="py-16 bg-neutral-100">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-poppins">Your Personal Recommendations</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Based on your style preferences and browsing history, we think you'll love these items.
              </p>
            </div>

            <ProductGrid 
              products={recommendedProducts} 
              isLoading={isLoadingRecommended}
              error={error}
              isRecommendations={true}
            />

            <div className="text-center mt-10">
              <Link href="/recommendations" className="inline-block bg-white hover:bg-gray-100 text-primary font-medium py-2 px-6 border border-primary rounded-lg transition">
                View All Recommendations
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      <section id="products" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-poppins">Featured Products</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our curated collection of trending and popular fashion items.
            </p>
          </div>

          <ProductGrid 
            products={featuredProducts} 
            isLoading={isLoadingFeatured}
            error={error}
          />

          <div className="text-center mt-10">
            <Link href="/products" className="inline-block bg-primary hover:bg-opacity-90 text-white font-medium py-2 px-6 rounded-lg transition">
              Browse All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Style Quiz Prompt - Only shown if user is not logged in */}
      {!user && (
        <section className="py-16 bg-neutral-100">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4 font-poppins">Discover Your Personal Style</h2>
              <p className="text-gray-600 mb-8">
                Take our quick style quiz to get personalized fashion recommendations tailored to your preferences.
              </p>
              <Link href="/quiz" className="inline-block bg-primary hover:bg-opacity-90 text-white font-bold py-3 px-8 rounded-full transition duration-300 shadow-lg">
                Take the Style Quiz
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default HomePage;
