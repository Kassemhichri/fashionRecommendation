import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Slider } from '@/components/ui/slider';

const Filters = ({ onApplyFilters, initialFilters = {} }) => {
  const [, setLocation] = useLocation();
  const [filters, setFilters] = useState({
    categories: initialFilters.categories || [],
    gender: initialFilters.gender || [],
    colors: initialFilters.colors || [],
    priceRange: initialFilters.priceRange || [0, 200],
    usage: initialFilters.usage || [],
  });

  // Available options for filters
  const categoryOptions = [
    { id: 'Topwear', label: 'Tops & T-shirts' },
    { id: 'Shirts', label: 'Shirts' },
    { id: 'Jeans', label: 'Jeans' },
    { id: 'Dresses', label: 'Dresses' },
    { id: 'Shoes', label: 'Shoes' },
    { id: 'Watches', label: 'Watches' },
    { id: 'Bags', label: 'Bags' }
  ];
  
  const genderOptions = [
    { id: 'Men', label: 'Men' },
    { id: 'Women', label: 'Women' },
    { id: 'Unisex', label: 'Unisex' }
  ];
  
  const colorOptions = [
    { id: 'Black', label: 'Black', color: 'bg-black' },
    { id: 'White', label: 'White', color: 'bg-white' },
    { id: 'Blue', label: 'Blue', color: 'bg-blue-600' },
    { id: 'Red', label: 'Red', color: 'bg-red-600' },
    { id: 'Green', label: 'Green', color: 'bg-green-600' },
    { id: 'Yellow', label: 'Yellow', color: 'bg-yellow-400' },
    { id: 'Purple', label: 'Purple', color: 'bg-purple-600' },
    { id: 'Pink', label: 'Pink', color: 'bg-pink-400' }
  ];
  
  const usageOptions = [
    { id: 'Casual', label: 'Casual' },
    { id: 'Formal', label: 'Formal' },
    { id: 'Sports', label: 'Sports' },
    { id: 'Ethnic', label: 'Ethnic' }
  ];

  const handleCategoryChange = (categoryId) => {
    setFilters(prev => {
      const updatedCategories = prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId];
      
      return { ...prev, categories: updatedCategories };
    });
  };

  const handleGenderChange = (genderId) => {
    setFilters(prev => {
      const updatedGenders = prev.gender.includes(genderId)
        ? prev.gender.filter(id => id !== genderId)
        : [...prev.gender, genderId];
      
      return { ...prev, gender: updatedGenders };
    });
  };

  const handleColorChange = (colorId) => {
    setFilters(prev => {
      const updatedColors = prev.colors.includes(colorId)
        ? prev.colors.filter(id => id !== colorId)
        : [...prev.colors, colorId];
      
      return { ...prev, colors: updatedColors };
    });
  };

  const handleUsageChange = (usageId) => {
    setFilters(prev => {
      const updatedUsage = prev.usage.includes(usageId)
        ? prev.usage.filter(id => id !== usageId)
        : [...prev.usage, usageId];
      
      return { ...prev, usage: updatedUsage };
    });
  };

  const handlePriceChange = (value) => {
    setFilters(prev => ({ ...prev, priceRange: value }));
  };

  const handleReset = () => {
    setFilters({
      categories: [],
      gender: [],
      colors: [],
      priceRange: [0, 200],
      usage: [],
    });
  };

  const handleApply = () => {
    onApplyFilters(filters);
    
    // Update URL with filter parameters
    const params = new URLSearchParams();
    
    if (filters.categories.length) {
      params.set('categories', filters.categories.join(','));
    }
    
    if (filters.gender.length) {
      params.set('gender', filters.gender.join(','));
    }
    
    if (filters.colors.length) {
      params.set('colors', filters.colors.join(','));
    }
    
    if (filters.usage.length) {
      params.set('usage', filters.usage.join(','));
    }
    
    params.set('minPrice', filters.priceRange[0]);
    params.set('maxPrice', filters.priceRange[1]);
    
    const queryString = params.toString();
    setLocation(`/products${queryString ? `?${queryString}` : ''}`);
  };

  return (
    <div className="bg-neutral-100 rounded-xl p-5">
      <h3 className="font-bold text-lg mb-4">Filters</h3>
      
      {/* Category Filter */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Category</h4>
        <div className="space-y-2">
          {categoryOptions.map(category => (
            <label key={category.id} className="flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="form-checkbox h-4 w-4 text-primary rounded focus:ring-primary focus:ring-opacity-50"
                checked={filters.categories.includes(category.id)}
                onChange={() => handleCategoryChange(category.id)}
              />
              <span className="ml-2 text-sm">{category.label}</span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Gender Filter */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Gender</h4>
        <div className="space-y-2">
          {genderOptions.map(gender => (
            <label key={gender.id} className="flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="form-checkbox h-4 w-4 text-primary rounded focus:ring-primary focus:ring-opacity-50"
                checked={filters.gender.includes(gender.id)}
                onChange={() => handleGenderChange(gender.id)}
              />
              <span className="ml-2 text-sm">{gender.label}</span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Color Filter */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Color</h4>
        <div className="flex flex-wrap gap-2">
          {colorOptions.map(color => (
            <div 
              key={color.id} 
              className={`w-6 h-6 rounded-full ${color.color} cursor-pointer border ${filters.colors.includes(color.id) ? 'ring-2 ring-offset-2 ring-primary' : 'border-gray-300'}`}
              onClick={() => handleColorChange(color.id)}
              title={color.label}
            ></div>
          ))}
        </div>
      </div>
      
      {/* Price Range Filter */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Price Range</h4>
        <div className="px-2">
          <Slider
            defaultValue={filters.priceRange}
            min={0}
            max={200}
            step={1}
            onValueChange={handlePriceChange}
            className="my-4"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>${filters.priceRange[0]}</span>
            <span>${filters.priceRange[1]}</span>
          </div>
        </div>
      </div>
      
      {/* Usage Filter */}
      <div>
        <h4 className="font-medium mb-3">Usage</h4>
        <div className="space-y-2">
          {usageOptions.map(usage => (
            <label key={usage.id} className="flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="form-checkbox h-4 w-4 text-primary rounded focus:ring-primary focus:ring-opacity-50"
                checked={filters.usage.includes(usage.id)}
                onChange={() => handleUsageChange(usage.id)}
              />
              <span className="ml-2 text-sm">{usage.label}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div className="mt-8 flex space-x-3">
        <button 
          className="flex-1 bg-white hover:bg-gray-100 text-gray-800 py-2 px-4 border border-gray-300 rounded-lg transition"
          onClick={handleReset}
        >
          Reset
        </button>
        <button 
          className="flex-1 bg-primary hover:bg-opacity-90 text-white py-2 px-4 rounded-lg transition"
          onClick={handleApply}
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default Filters;
