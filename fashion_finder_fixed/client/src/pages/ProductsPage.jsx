import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import ProductGrid from '../components/ProductGrid';
import Filters from '../components/Filters';
import { getProducts } from '../services/api';
import { useToast } from '@/hooks/use-toast';

const ProductsPage = () => {
  const [location, setLocation] = useLocation();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [sortOption, setSortOption] = useState('recommended');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(window.innerWidth >= 1024); // Show by default on large screens
  const { toast } = useToast();

  // Parse query parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.split('?')[1]);
    
    const initialFilters = {
      categories: searchParams.get('categories')?.split(',') || [],
      gender: searchParams.get('gender')?.split(',') || [],
      colors: searchParams.get('colors')?.split(',') || [],
      usage: searchParams.get('usage')?.split(',') || [],
      priceRange: [
        parseInt(searchParams.get('minPrice')) || 0,
        parseInt(searchParams.get('maxPrice')) || 200
      ],
      search: searchParams.get('search') || '',
    };
    
    setFilters(initialFilters);
    
    if (searchParams.get('sort')) {
      setSortOption(searchParams.get('sort'));
    }
    
    if (searchParams.get('page')) {
      setCurrentPage(parseInt(searchParams.get('page')));
    }
  }, [location]);

  // Fetch products when filters, sort, or page changes
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        
        const queryParams = {
          ...filters,
          sort: sortOption,
          page: currentPage,
          limit: 12
        };
        
        const result = await getProducts(queryParams);
        setProducts(result.products);
        setTotalPages(result.totalPages);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
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
  }, [filters, sortOption, currentPage]);

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    const newSortOption = e.target.value;
    setSortOption(newSortOption);
    setCurrentPage(1);
    
    // Update URL
    const params = new URLSearchParams(location.split('?')[1]);
    params.set('sort', newSortOption);
    params.set('page', '1');
    setLocation(`/products?${params.toString()}`);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    
    // Update URL
    const params = new URLSearchParams(location.split('?')[1]);
    params.set('page', page.toString());
    setLocation(`/products?${params.toString()}`);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <section id="products" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
          <h2 className="text-3xl font-bold mb-4 md:mb-0 font-poppins">Explore Products</h2>
          
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <select 
                className="appearance-none bg-neutral-100 border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={sortOption}
                onChange={handleSortChange}
              >
                <option value="recommended">Sort by: Recommended</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <i className="fas fa-chevron-down text-xs"></i>
              </div>
            </div>

            <button 
              className="bg-neutral-100 hover:bg-neutral-200 text-gray-700 py-2 px-4 rounded-lg flex items-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
              onClick={toggleFilters}
            >
              <i className="fas fa-sliders-h mr-2"></i>
              Filters
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="lg:w-1/4 pr-0 lg:pr-6 mb-6 lg:mb-0">
              <Filters onApplyFilters={handleApplyFilters} initialFilters={filters} />
            </div>
          )}
          
          {/* Products Grid */}
          <div className={showFilters ? "lg:w-3/4" : "w-full"}>
            <ProductGrid 
              products={products} 
              isLoading={isLoading}
              error={error}
            />
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex justify-center">
                <nav className="flex" aria-label="Pagination">
                  <button 
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <span className="sr-only">Previous</span>
                    <i className="fas fa-chevron-left text-xs"></i>
                  </button>
                  
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    
                    // Show first page, last page, current page, and pages around current
                    if (
                      pageNumber === 1 || 
                      pageNumber === totalPages || 
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <button 
                          key={pageNumber}
                          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                            currentPage === pageNumber 
                              ? 'bg-primary text-white hover:bg-primary' 
                              : 'bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                          onClick={() => handlePageChange(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      );
                    } else if (
                      (pageNumber === 2 && currentPage > 3) || 
                      (pageNumber === totalPages - 1 && currentPage < totalPages - 2)
                    ) {
                      return (
                        <span 
                          key={pageNumber}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                        >
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                  
                  <button 
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <span className="sr-only">Next</span>
                    <i className="fas fa-chevron-right text-xs"></i>
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductsPage;
