import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

const Header = () => {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const [, navigate] = useLocation();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Use wouter navigation instead of directly setting window.location
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      
      // Close the mobile menu after search (if open)
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-primary font-poppins">FashionFinder</Link>
            </div>
            
            <div className="hidden md:block mx-auto max-w-md w-full px-4">
              <form onSubmit={handleSearch} className="relative">
                <input 
                  type="text" 
                  placeholder="Search for items, brands, and more..." 
                  className="w-full py-2 pl-10 pr-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <i className="fas fa-search"></i>
                </div>
              </form>
            </div>
            
            <nav className="flex items-center space-x-6">
              {user ? (
                <>
                  <Link href="/recommendations" className="hidden md:block hover:text-primary">
                    <i className="fas fa-heart text-xl"></i>
                  </Link>
                  <div className="hidden md:block relative group">
                    <button className="hover:text-primary">
                      <i className="fas fa-user text-xl"></i>
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md overflow-hidden z-50 hidden group-hover:block">
                      <div className="py-2 px-4 bg-gray-100 font-medium">{user.username}</div>
                      <Link href="/recommendations" className="block py-2 px-4 hover:bg-gray-100">My Recommendations</Link>
                      <button onClick={logout} className="w-full text-left py-2 px-4 hover:bg-gray-100 text-red-500">Logout</button>
                    </div>
                  </div>
                </>
              ) : (
                <button onClick={() => openAuthModal('login')} className="hidden md:block hover:text-primary">
                  <i className="fas fa-user text-xl"></i>
                </button>
              )}
              <button 
                className="md:hidden text-gray-500 hover:text-primary focus:outline-none" 
                onClick={toggleMobileMenu}
              >
                <i className="fas fa-bars text-xl"></i>
              </button>
            </nav>
          </div>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex py-2 border-t border-gray-200 justify-center space-x-8 text-sm font-medium">
            <Link href="/merged-products" className={`py-2 hover:text-primary ${location === '/merged-products' ? 'text-primary' : ''}`}>All Products</Link>
            <Link href="/quiz" className={`py-2 ${location === '/quiz' ? 'text-primary font-semibold' : 'hover:text-primary'}`}>Style Quiz</Link>
            <Link href="/recommendations" className={`py-2 ${location === '/recommendations' ? 'text-primary font-semibold' : 'hover:text-primary'}`}>My Recommendations</Link>
          </nav>
        </div>
        
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-2">
            <div className="container mx-auto px-4">
              <nav className="flex flex-col space-y-3 text-sm font-medium">
                <Link href="/merged-products" className="py-2 hover:text-primary">All Products</Link>
                <Link href="/quiz" className="py-2 text-primary font-semibold">Style Quiz</Link>
                <Link href="/recommendations" className="py-2 hover:text-primary">My Recommendations</Link>
                {user ? (
                  <>
                    <div className="py-2 border-t border-gray-200">{user.username}</div>
                    <button onClick={logout} className="py-2 text-left text-red-500">Logout</button>
                  </>
                ) : (
                  <button onClick={() => openAuthModal('login')} className="py-2 text-left hover:text-primary">Login / Register</button>
                )}
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Mobile search (displayed only on mobile) */}
      <div className="md:hidden container mx-auto px-4 mt-2 mb-3">
        <form onSubmit={handleSearch} className="relative">
          <input 
            type="text" 
            placeholder="Search for items, brands, and more..." 
            className="w-full py-2 pl-10 pr-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            <i className="fas fa-search"></i>
          </div>
        </form>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={closeAuthModal} 
          initialMode={authMode}
        />
      )}
    </>
  );
};

export default Header;
