import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, register } = useAuth();
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (mode === 'register' && !formData.username) {
      newErrors.username = 'Username is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (mode === 'login') {
        await login(formData.email, formData.password);
        toast({
          title: "Login Successful",
          description: "Welcome back to FashionFinder!"
        });
      } else {
        await register(formData.username, formData.email, formData.password);
        toast({
          title: "Registration Successful",
          description: "Your account has been created. Welcome to FashionFinder!"
        });
      }
      
      onClose();
      setLocation('/');
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        title: mode === 'login' ? "Login Failed" : "Registration Failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setErrors({});
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold font-poppins text-center">
            Welcome to FashionFinder
          </DialogTitle>
          <DialogDescription className="text-center">
            {mode === 'login' 
              ? 'Sign in to get personalized fashion recommendations' 
              : 'Create an account to start your fashion journey'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex border-b border-gray-200 mb-6">
          <button 
            className={`flex-1 py-2 text-center font-medium ${mode === 'login' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button 
            className={`flex-1 py-2 text-center font-medium ${mode === 'register' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setMode('register')}
          >
            Register
          </button>
        </div>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input 
                type="text" 
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.username ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`} 
                placeholder="Choose a username"
              />
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`} 
              placeholder="your@email.com" 
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`} 
              placeholder="••••••••" 
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>
          
          {mode === 'login' && (
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="form-checkbox h-4 w-4 text-primary rounded focus:ring-primary focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              
              <button type="button" className="text-sm text-primary hover:underline">
                Forgot password?
              </button>
            </div>
          )}
          
          <button 
            type="submit" 
            className="w-full bg-primary hover:bg-opacity-90 text-white py-2 px-4 rounded-lg transition disabled:opacity-70"
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? 'Processing...' 
              : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
          
          <div className="relative flex items-center justify-center">
            <div className="border-t border-gray-200 flex-grow"></div>
            <span className="px-2 text-sm text-gray-500 bg-white">or continue with</span>
            <div className="border-t border-gray-200 flex-grow"></div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <button 
              type="button" 
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              onClick={() => toast({
                title: "Not Implemented",
                description: "Social login is currently not available.",
                variant: "default"
              })}
            >
              <i className="fab fa-google mr-2"></i>
              Google
            </button>
            <button 
              type="button" 
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              onClick={() => toast({
                title: "Not Implemented",
                description: "Social login is currently not available.",
                variant: "default"
              })}
            >
              <i className="fab fa-facebook-f mr-2"></i>
              Facebook
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
