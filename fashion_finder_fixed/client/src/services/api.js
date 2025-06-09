import { apiRequest } from '../lib/queryClient.js';

// Authentication endpoints
export const login = async (email, password) => {
  const res = await apiRequest('POST', '/api/auth/login', { email, password });
  return res.json();
};

export const register = async (username, email, password) => {
  const res = await apiRequest('POST', '/api/auth/register', { username, email, password });
  return res.json();
};

export const logout = async () => {
  const res = await apiRequest('POST', '/api/auth/logout');
  return res.json();
};

export const getCurrentUser = async () => {
  try {
    const res = await apiRequest('GET', '/api/auth/user');
    return res.json();
  } catch (error) {
    // If 401 Unauthorized, we just return null (user is not logged in)
    if (error.message.includes('401')) {
      return null;
    }
    throw error;
  }
};

// Quiz endpoints
export const getQuizQuestions = async () => {
  const res = await apiRequest('GET', '/api/quiz/questions');
  return res.json();
};

export const submitQuizResponses = async (responses) => {
  const res = await apiRequest('POST', '/api/quiz/responses', { responses });
  return res.json();
};

export const getQuizResponses = async () => {
  const res = await apiRequest('GET', '/api/quiz/responses');
  return res.json();
};

// Product endpoints
export const getProducts = async (params = {}) => {
  // Build query string from params object
  const queryParams = new URLSearchParams();
  
  // Handle search query differently - if search is present, use the search endpoint
  const isSearchQuery = params.search && params.search.trim() !== '';
  const baseUrl = isSearchQuery ? '/api/search' : '/api/products';
  
  // For search endpoint, use 'q' parameter instead of 'search'
  if (isSearchQuery) {
    queryParams.set('q', params.search.trim());
    
    // Copy other params except 'search'
    Object.entries(params).forEach(([key, value]) => {
      if (key !== 'search' && value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value) && value.length > 0) {
          queryParams.set(key, value.join(','));
        } else {
          queryParams.set(key, value);
        }
      }
    });
  } else {
    // Normal parameter handling for product listing
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        queryParams.set(key, value.join(','));
      } else if (value !== undefined && value !== null && value !== '') {
        queryParams.set(key, value);
      }
    });
  }
  
  const queryString = queryParams.toString();
  const url = `${baseUrl}${queryString ? `?${queryString}` : ''}`;
  
  console.log(`API Request to: ${url}`);
  const res = await apiRequest('GET', url);
  return res.json();
};

export const getProductById = async (productId) => {
  const res = await apiRequest('GET', `/api/products/${productId}`);
  return res.json();
};

export const getFeaturedProducts = async () => {
  try {
    const res = await apiRequest('GET', '/api/products/featured');
    const data = await res.json();
    
    // Make sure we return an array of products
    if (Array.isArray(data)) {
      return data;
    } else if (data && typeof data === 'object') {
      // If the response is an object (not an array), it might be a response wrapper
      // Try to extract products array from it
      if (Array.isArray(data.products)) {
        return data.products;
      } else if (Array.isArray(data.featuredProducts)) {
        return data.featuredProducts;
      } else if (Array.isArray(data.data)) {
        return data.data;
      }
      // If we can't find an array in common properties, log and return empty array
      console.warn('Featured products response is not in expected format:', data);
      return [];
    } else {
      console.warn('Unexpected featured products response:', data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
};

export const getSimilarProducts = async (productId, useEmbeddings = false) => {
  try {
    // Choose between regular and embedding-based similar products
    const endpoint = useEmbeddings 
      ? `/api/embedding-similar/${productId}`
      : `/api/products/${productId}/similar`;
    
    const res = await apiRequest('GET', endpoint);
    return res.json();
  } catch (error) {
    console.error(`Error getting similar products for ${productId}:`, error);
    return { similarProducts: [] };
  }
};

// Recommendation endpoints
export const getRecommendedProducts = async (useEmbeddings = false) => {
  try {
    // Add a cache busting parameter to force a fresh request and prevent caching
    const timestamp = new Date().getTime();
    
    // Choose between regular and embedding-based recommendations
    const endpoint = useEmbeddings ? '/api/embedding-recommendations' : '/api/recommendations';
    const url = `${endpoint}?_=${timestamp}&forceRefresh=true`;
    
    // Use our simplified no-auth approach
    const res = await apiRequest('GET', url);
    
    // Extract the JSON data
    const data = await res.json();
    console.log(`${useEmbeddings ? 'Embedding-based' : 'Standard'} recommendation response:`, data);
    
    // If we received an empty object, undefined, or null
    if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
      console.log('Empty recommendation data, falling back to featured products');
      const featured = await getFeaturedProducts();
      return {
        success: true,
        recommendations: featured,
        recommendationType: 'popular',
        message: 'Popular products you might like',
        basedOn: {
          categories: [],
          colors: [],
          keywords: []
        }
      };
    }
    
    // If we received a raw array, convert it to our expected format
    if (Array.isArray(data)) {
      console.log('Received array of recommendations', data.length);
      return {
        success: true,
        recommendations: data,
        recommendationType: 'popular',
        message: 'Based on popular items',
        basedOn: {
          categories: [],
          colors: [],
          keywords: []
        }
      };
    }
    
    // Check if the response has the recommendations property
    if (data && data.recommendations) {
      console.log('Received properly formatted recommendations', data.recommendations.length);
      return data;
    }
    
    // If we received an object without recommendations property
    if (data && !data.recommendations) {
      console.log('Received object without recommendations property', data);
      return {
        success: true,
        recommendations: [data], // Wrap it in an array
        recommendationType: 'popular',
        message: 'Based on your preferences',
        basedOn: data.basedOn || {
          categories: [],
          colors: [],
          keywords: []
        }
      };
    }
    
    // Otherwise return the formatted response
    return data;
  } catch (error) {
    console.error('Error getting recommendations:', error);
    // Fall back to featured products on error
    const featured = await getFeaturedProducts();
    return {
      success: true,
      recommendations: featured,
      recommendationType: 'popular',
      message: 'Featured products',
      basedOn: {
        categories: [],
        colors: [],
        keywords: []
      }
    };
  }
};

// Interaction endpoints
export const toggleProductLike = async (productId, interactionType) => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;
    
    // First, create or verify that a user exists in the database
    // Try a simpler approach without user authentication for demo purposes
    const res = await apiRequest('POST', '/api/interactions', {
      productId, 
      interactionType: interactionType === 'like' ? 'like' : 'dislike'
    });
    
    return res;
  } catch (error) {
    console.error('Error toggling product like:', error);
    throw error; // Re-throw so the UI can show an error message
  }
};

export const recordProductView = async (productId) => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;
    
    // Simplified approach for demo purposes
    const res = await apiRequest('POST', '/api/interactions', {
      productId, 
      interactionType: 'view'
    });
    
    return res;
  } catch (error) {
    console.error('Error recording product view:', error);
    // Don't throw for view interactions since they're non-critical
    return null;
  }
};
