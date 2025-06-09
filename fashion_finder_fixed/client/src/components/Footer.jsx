import { Link } from 'wouter';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">FashionFinder</h3>
            <p className="text-gray-600 text-sm mb-4">Discover your unique style with personalized fashion recommendations.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary">
                <i className="fab fa-pinterest-p"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products?sort=newest" className="text-gray-600 hover:text-primary">New Arrivals</Link></li>
              <li><Link href="/products?gender=Women" className="text-gray-600 hover:text-primary">Women</Link></li>
              <li><Link href="/products?gender=Men" className="text-gray-600 hover:text-primary">Men</Link></li>
              <li><Link href="/products?category=Accessories" className="text-gray-600 hover:text-primary">Accessories</Link></li>
              <li><Link href="/products?sale=true" className="text-gray-600 hover:text-primary">Sale</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Help</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-gray-600 hover:text-primary">Customer Service</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-primary">My Account</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-primary">Find a Store</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-primary">Legal & Privacy</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-primary">Contact Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Stay Updated</h3>
            <p className="text-sm text-gray-600 mb-4">Subscribe to get special offers, free giveaways, and style updates.</p>
            <form className="flex" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Your email" 
                className="flex-1 px-3 py-2 text-sm border border-r-0 border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button 
                type="submit" 
                className="bg-primary text-white px-4 py-2 text-sm rounded-r-lg hover:bg-opacity-90 transition"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        <div className="pt-8 mt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500 mb-4 md:mb-0">© 2023 FashionFinder. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link href="#" className="text-sm text-gray-500 hover:text-primary">Privacy Policy</Link>
            <Link href="#" className="text-sm text-gray-500 hover:text-primary">Terms of Service</Link>
            <Link href="#" className="text-sm text-gray-500 hover:text-primary">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
