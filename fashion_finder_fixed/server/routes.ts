import type { Express, Request as ExpressRequest, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";
import { getMergedProducts } from "./utils/csvParser";
import { insertInteractionSchema, insertReviewSchema } from "@shared/schema";

// Extend the Express Request interface to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

// We'll implement the merged products functionality directly in routes.ts for now
// to avoid ES modules/CommonJS issues

// Authentication middleware
const isAuthenticated = (req: ExpressRequest, res: Response, next: Function) => {
  const userId = req.headers['user-id'];
  
  if (!userId) {
    return res.status(401).json({ 
      message: 'Authentication required. Please login first.'
    });
  }
  
  // Set userId in request for use in route handlers
  req.userId = parseInt(userId as string);
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize and start Flask server
  const flaskServer = startFlaskServer();
  
  // API endpoint for user interactions (likes, dislikes, views)
  app.post('/api/interactions', async (req, res) => {
    try {
      const { productId, interactionType, userId: bodyUserId } = req.body;
      const headerUserId = req.headers['user-id'];
      
      console.log('Recording interaction:', { productId, interactionType, headerUserId, bodyUserId });
      
      // Validate required fields
      if (!productId || !interactionType) {
        return res.status(400).json({ 
          message: 'Missing required fields: productId and interactionType are required' 
        });
      }
      
      // Validate interaction type
      if (!['like', 'dislike', 'view'].includes(interactionType)) {
        return res.status(400).json({ 
          message: 'Invalid interactionType. Must be "like", "dislike", or "view"'
        });
      }
      
      // First check if we have this user in the DB, if not create them for demo purposes
      let user = await storage.getUserByUsername('demo');
      if (!user) {
        // Create a demo user for testing
        user = await storage.createUser({
          username: 'demo',
          email: 'demo@example.com',
          password: 'password123'
        });
        console.log('Created demo user:', user);
      }
      
      // Handle case when changing from like to dislike or vice versa
      if (interactionType === 'like' || interactionType === 'dislike') {
        // If changing from like to dislike or vice versa, remove the opposite interaction
        const oppositeType = interactionType === 'like' ? 'dislike' : 'like';
        
        const existingOpposite = await storage.getInteractionByUserAndProduct(
          user.id,
          productId,
          oppositeType
        );
        
        if (existingOpposite) {
          await storage.deleteInteraction(user.id, productId, oppositeType);
        }
      }
      
      // Create the interaction object validated with Zod schema
      const interactionData = insertInteractionSchema.parse({
        userId: user.id,
        productId,
        interactionType
      });
      
      // Save to database
      const interaction = await storage.createInteraction(interactionData);
      
      res.status(201).json({
        success: true,
        interaction
      });
    } catch (error) {
      console.error('Error creating interaction:', error);
      res.status(500).json({ 
        message: 'Failed to record interaction',
        error: String(error)
      });
    }
  });
  
  // API endpoint to get personalized recommendations based on user's interactions
  app.get('/api/recommendations', async (req, res) => {
    try {
      console.log('Generating recommendations...');
      
      // Check for cache busting and forced refresh flags
      const forceRefresh = req.query.forceRefresh === 'true';
      const timestamp = req.query._ || new Date().getTime();
      console.log(`Recommendation request with timestamp=${timestamp}, forceRefresh=${forceRefresh}`);
      
      // First check if we have this user in the DB, if not create them for demo purposes
      let user = await storage.getUserByUsername('demo');
      if (!user) {
        // Create a demo user for testing
        user = await storage.createUser({
          username: 'demo',
          email: 'demo@example.com',
          password: 'password123'
        });
        console.log('Created demo user for recommendations:', user);
      }
      
      const userId = user.id;
      
      // Get user's likes
      const likedInteractions = await storage.getInteractionsByUserAndType(userId, 'like');
      const likedProductIds = likedInteractions.map(interaction => interaction.productId);
      console.log(`Found ${likedInteractions.length} liked products for user ${userId}:`, likedProductIds);
      
      // Get user's dislikes
      const dislikedInteractions = await storage.getInteractionsByUserAndType(userId, 'dislike');
      const dislikedProductIds = dislikedInteractions.map(interaction => interaction.productId);
      console.log(`Found ${dislikedInteractions.length} disliked products for user ${userId}:`, dislikedProductIds);
      
      // Get user's views
      const viewedInteractions = await storage.getInteractionsByUserAndType(userId, 'view');
      const viewedProductIds = viewedInteractions.map(interaction => interaction.productId);
      console.log(`Found ${viewedInteractions.length} viewed products for user ${userId}`);
      
      // Immediately return popular products if no interactions found
      if (likedInteractions.length === 0 && dislikedInteractions.length === 0 && viewedInteractions.length === 0) {
        console.log('No interactions found, returning popular products');
        // Get all products
        const allProducts = getMergedProducts();
        // Return random sampling
        const randomProducts = allProducts
          .sort(() => 0.5 - Math.random())
          .slice(0, 8);
        
        return res.json({
          success: true,
          recommendations: randomProducts,
          recommendationType: 'popular',
          message: 'Based on popular items',
          basedOn: {
            categories: [],
            colors: [],
            keywords: []
          }
        });
      }
      
      // Get all products
      const allProducts = getMergedProducts();
      
      // If user has no likes, return popular products excluding dislikes
      if (likedProductIds.length === 0) {
        // Filter out disliked products and add some randomness
        const randomProducts = allProducts
          .filter(product => !dislikedProductIds.includes(product.id))
          .sort(() => 0.5 - Math.random())
          .slice(0, 8);
        
        return res.json({
          success: true,
          recommendations: randomProducts,
          recommendationType: 'popular',
          message: 'Based on popular items'
        });
      }
      
      // Find the liked products with their full details
      const likedProducts = allProducts.filter(product => 
        likedProductIds.includes(product.id)
      );
      
      // Extract detailed product information from liked products
      const likedCategories = new Set();
      const likedSubCategories = new Set();
      const likedColors = new Set();
      const likedUsages = new Set();
      const likedGenders = new Set();
      const likedSeasons = new Set();
      const likedKeywords = new Set();
      
      // Track specific footwear preferences
      let footwearCount = 0;
      let totalLikedCount = likedProducts.length;
      
      // Extract keywords from product names and descriptions
      likedProducts.forEach(product => {
        // Add categorical attributes
        likedCategories.add(product.articleType);
        likedSubCategories.add(product.subCategory);
        likedColors.add(product.baseColour);
        likedUsages.add(product.usage);
        likedGenders.add(product.gender);
        likedSeasons.add(product.season);
        
        // Count footwear items specifically
        if (product.masterCategory === 'Footwear' || 
            product.subCategory === 'Shoes' || 
            product.articleType.includes('Shoe')) {
          footwearCount++;
        }
        
        // Extract keywords from product name
        if (product.productDisplayName) {
          const words = product.productDisplayName.toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 3) // Only meaningful words
            .map(word => word.replace(/[^a-z]/g, '')); // Clean up words
          
          words.forEach(word => likedKeywords.add(word));
        }
      });
      
      // Check if user primarily likes footwear (more than 50% of likes are shoes)
      const focusOnFootwear = footwearCount > 0 && (footwearCount / totalLikedCount >= 0.5);
      console.log(`User footwear preference: ${footwearCount}/${totalLikedCount} liked items are footwear. Focus on footwear: ${focusOnFootwear}`);
      
      // Find similar products with enhanced relevance scoring
      const recommendationCandidates = allProducts
        .filter(product => {
          // CRITICAL: FIRST FILTER - Don't include products user already liked
          if (likedProductIds.includes(product.id)) {
            console.log(`Excluding already liked product ${product.id} from recommendations`);
            return false;
          }
          
          // CRITICAL: SECOND FILTER - Strictly exclude disliked products
          if (dislikedProductIds.includes(product.id)) {
            console.log(`Excluding disliked product ${product.id} from recommendations`);
            return false;
          }
          
          // SPECIAL FOOTWEAR FILTER - When user predominantly likes shoes,
          // only show other footwear items in recommendations
          if (focusOnFootwear) {
            const isFootwear = product.masterCategory === 'Footwear' || 
                               product.subCategory === 'Shoes' || 
                               product.articleType.includes('Shoe');
            if (!isFootwear) {
              // Skip non-footwear items
              return false;
            }
          }
          
          // If passes all filters, include in candidate pool
          return true;
        })
        // Enhanced dynamic scoring system with randomness factor
        .map(product => {
          let score = 0;
          let matchExplanation: string[] = [];
          
          // EXACT MATCH BOOST - Highest priority is matching article type (like shirts with shirts)
          const exactArticleTypeMatch = likedCategories.has(product.articleType);
          if (exactArticleTypeMatch) {
            // Increased score for exact matching - prioritize showing same types
            score += 15;  // Dramatically increase the score for matching article types
            matchExplanation.push(`Same type: ${product.articleType}`);
          }
          
          // COMPLEMENTARY ITEMS - If not exact match, boost items that go well together
          // For example, if user likes tops, recommend matching bottoms
          if (!exactArticleTypeMatch) {
            const isTopwear = likedCategories.has('Tshirts') || 
                            likedCategories.has('Shirts') || 
                            likedCategories.has('Jackets');
            const isBottomwear = product.subCategory === 'Bottomwear' || 
                              product.articleType === 'Jeans' || 
                              product.articleType === 'Trousers';
            
            if (isTopwear && isBottomwear) {
              score += 3;
              matchExplanation.push('Complementary item');
            }
          }
          
          // COLOR PREFERENCE - People often have color preferences
          if (likedColors.has(product.baseColour)) {
            score += 3;
            matchExplanation.push(`Preferred color: ${product.baseColour}`);
          }
          
          // MASTER CATEGORY - If user liked footwear, recommend other footwear
          const sameMasterCategory = likedProducts.some(
            liked => liked.masterCategory === product.masterCategory
          );
          if (sameMasterCategory) {
            // Increased score for master category matching
            score += 8; // Give strong weight to matching the same master category (e.g., Footwear)
            matchExplanation.push(`Same category: ${product.masterCategory}`);
          }
          
          // SUBCATEGORY MATCH
          if (likedSubCategories.has(product.subCategory)) {
            // Increased scoring for subcategory match
            score += 6; // Increase weight for matching subcategories (e.g., Shoes)
            matchExplanation.push(`Same subcategory: ${product.subCategory}`);
          }
          
          // GENDER PREFERENCE
          if (likedGenders.has(product.gender)) {
            score += 2;
            matchExplanation.push(`Same gender: ${product.gender}`);
          }
          
          // USAGE CONTEXT - Sports, Casual, etc.
          if (likedUsages.has(product.usage)) {
            score += 2;
            matchExplanation.push(`Same usage: ${product.usage}`);
          }
          
          // SEASON MATCH
          if (likedSeasons.has(product.season)) {
            score += 1;
            matchExplanation.push(`Same season: ${product.season}`);
          }
          
          // TEXT-BASED MATCHING from product name
          if (product.productDisplayName) {
            const words = product.productDisplayName.toLowerCase()
              .split(/\s+/)
              .filter(word => word.length > 3)
              .map(word => word.replace(/[^a-z]/g, ''));
            
            // Count keyword matches from the product name
            const keywordMatches = words.filter(word => likedKeywords.has(word));
            if (keywordMatches.length > 0) {
              score += keywordMatches.length * 2; // Each keyword match adds 2 points
              matchExplanation.push(`Style keywords: ${keywordMatches.join(', ')}`);
            }
          }
          
          // PREVIOUSLY VIEWED ITEMS - boost slightly
          if (viewedProductIds.includes(product.id)) {
            score += 0.5;
          }
          
          // DISLIKES PENALTY - strongly penalize disliked characteristics
          const dislikedProducts = allProducts.filter(p => dislikedProductIds.includes(p.id));
          dislikedProducts.forEach(dislikedProduct => {
            // Strongly penalize same article type if disliked
            if (dislikedProduct.articleType === product.articleType) {
              score -= 3;
              matchExplanation = matchExplanation.filter(
                m => !m.includes(`Same type: ${product.articleType}`)
              );
            }
            
            // Moderately penalize same color if disliked
            if (dislikedProduct.baseColour === product.baseColour) {
              score -= 2;
              matchExplanation = matchExplanation.filter(
                m => !m.includes(`Preferred color: ${product.baseColour}`)
              );
            }
            
            // Lightly penalize same usage context if disliked
            if (dislikedProduct.usage === product.usage) {
              score -= 1;
            }
          });
          
          // ADD RANDOMNESS - to ensure some variety, but reduce it significantly
          // Reduced randomness to favor consistent category matching
          const randomFactor = (Math.random() * 0.1) - 0.05;  // -0.05 to +0.05 (only 5% randomness)
          const randomizedScore = score * (1 + randomFactor);
          
          return { 
            ...product, 
            score: randomizedScore,
            matchExplanation
          };
        })
        // Sort by relevance score (descending)
        .sort((a, b) => b.score - a.score);
      
      // Log the top recommendations with their scores and match explanations 
      console.log('Top recommendation candidates:');
      recommendationCandidates.slice(0, 3).forEach((product, index) => {
        console.log(`${index + 1}. ${product.productDisplayName} (Score: ${product.score.toFixed(2)})`,
          `Reasons: ${product.matchExplanation.join(', ')}`);
      });
      
      // Take top N recommendations
      const recommendations = recommendationCandidates
        .slice(0, 8)
        // Keep explanation but remove score
        .map(({ score, matchExplanation, ...product }) => ({
          ...product,
          // Add a recommendation reason for UI display
          recommendationReason: matchExplanation.length > 0 
            ? matchExplanation[0] 
            : 'You might like this'
        }));
      
      // Extract unique reasons from all explanations
      const allReasons = recommendationCandidates
        .slice(0, 8)
        .flatMap(product => product.matchExplanation);
        
      // Count occurrences of each reason type
      const reasonCounts: {[key: string]: number} = {};
      allReasons.forEach(reason => {
        const reasonType = reason.split(':')[0].trim();
        reasonCounts[reasonType] = (reasonCounts[reasonType] || 0) + 1;
      });
      
      // Sort reasons by frequency for the message
      const sortedReasons = Object.entries(reasonCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([reason]) => reason);
      
      // Create a natural language message
      let message = 'Recommendations based on ';
      let recommendationType = 'personalized';
      
      // Check if we should focus on footwear
      if (focusOnFootwear) {
        message = 'Footwear recommendations based on your shoe preferences';
        recommendationType = 'footwear';
      } else if (sortedReasons.length > 0) {
        message += sortedReasons.slice(0, 3).join(', ');
        if (sortedReasons.length > 3) {
          message += ' and more';
        }
      } else {
        message = 'Personalized recommendations for you';
      }
      
      // Add more clarity for the user
      if (likedProducts.length > 0 && !focusOnFootwear) {
        message += ` from your ${likedProducts.length} liked items`;
      }
      
      res.json({
        success: true,
        recommendations,
        recommendationType,
        message,
        // Include the detailed data for UI display
        basedOn: {
          categories: Array.from(likedCategories),
          subCategories: Array.from(likedSubCategories),
          colors: Array.from(likedColors),
          usages: Array.from(likedUsages),
          genders: Array.from(likedGenders),
          seasons: Array.from(likedSeasons),
          keywords: Array.from(likedKeywords),
          reasons: sortedReasons,
          footwearFocus: focusOnFootwear
        }
      });
    } catch (error) {
      console.error('Error generating recommendations:', error);
      res.status(500).json({ 
        message: 'Failed to generate recommendations',
        error: String(error)
      });
    }
  });
  
  // API endpoint to get user's liked products
  app.get('/api/interactions/liked', async (req, res) => {
    try {
      // First check if we have this user in the DB, if not create them for demo purposes
      let user = await storage.getUserByUsername('demo');
      if (!user) {
        // Create a demo user for testing
        user = await storage.createUser({
          username: 'demo',
          email: 'demo@example.com',
          password: 'password123'
        });
      }
      
      const userId = user.id;
      
      // Get all liked products for this user
      const likedInteractions = await storage.getInteractionsByUserAndType(userId, 'like');
      
      // Extract product IDs from interactions
      const likedProductIds = likedInteractions.map(interaction => interaction.productId);
      
      // Get the full product data for these IDs
      const allProducts = getMergedProducts();
      const likedProducts = allProducts.filter(product => 
        likedProductIds.includes(product.id)
      );
      
      res.json({
        success: true,
        likedProducts
      });
    } catch (error) {
      console.error('Error fetching liked products:', error);
      res.status(500).json({ 
        message: 'Failed to fetch liked products',
        error: String(error)
      });
    }
  });
  
  // ===== PRODUCT REVIEWS ENDPOINTS =====
  
  // Get reviews for a product
  app.get('/api/products/:productId/reviews', async (req, res) => {
    try {
      const { productId } = req.params;
      
      if (!productId) {
        return res.status(400).json({ 
          message: 'Product ID is required' 
        });
      }
      
      // Get all reviews for this product
      const reviews = await storage.getReviewsByProductId(productId);
      
      // Get user data for each review
      const reviewsWithUserData = await Promise.all(
        reviews.map(async (review) => {
          const user = await storage.getUser(review.userId);
          return {
            ...review,
            username: user?.username || 'Anonymous',
          };
        })
      );
      
      res.json({
        success: true,
        reviews: reviewsWithUserData
      });
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      res.status(500).json({ 
        message: 'Failed to fetch reviews',
        error: String(error)
      });
    }
  });
  
  // Get rating summary for a product
  app.get('/api/products/:productId/rating', async (req, res) => {
    try {
      const { productId } = req.params;
      
      if (!productId) {
        return res.status(400).json({ 
          message: 'Product ID is required' 
        });
      }
      
      // Get the rating summary for this product
      const rating = await storage.getProductRating(productId);
      
      // If no rating exists, return default values
      if (!rating) {
        return res.json({
          success: true,
          rating: {
            productId,
            averageRating: 0,
            totalRatings: 0,
            fiveStarCount: 0,
            fourStarCount: 0,
            threeStarCount: 0,
            twoStarCount: 0,
            oneStarCount: 0
          }
        });
      }
      
      res.json({
        success: true,
        rating
      });
    } catch (error) {
      console.error('Error fetching product rating:', error);
      res.status(500).json({ 
        message: 'Failed to fetch rating',
        error: String(error)
      });
    }
  });
  
  // Create or update a review
  app.post('/api/products/:productId/reviews', async (req, res) => {
    try {
      const { productId } = req.params;
      const { rating, reviewText, title } = req.body;
      
      if (!productId) {
        return res.status(400).json({ 
          message: 'Product ID is required' 
        });
      }
      
      // Validate rating
      if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        return res.status(400).json({ 
          message: 'Rating must be a number between 1 and 5' 
        });
      }
      
      // Check if the product exists in our dataset
      const allProducts = getMergedProducts();
      const productExists = allProducts.some(product => product.id === productId);
      
      if (!productExists) {
        return res.status(404).json({ 
          message: 'Product not found' 
        });
      }
      
      // First check if we have this user in the DB, if not create them for demo purposes
      let user = await storage.getUserByUsername('demo');
      if (!user) {
        // Create a demo user for testing
        user = await storage.createUser({
          username: 'demo',
          email: 'demo@example.com',
          password: 'password123'
        });
      }
      
      // Validate the review data with our Zod schema
      const reviewData = insertReviewSchema.parse({
        userId: user.id,
        productId,
        rating,
        reviewText,
        title
      });
      
      // Create or update the review
      const review = await storage.createReview(reviewData);
      
      res.status(201).json({
        success: true,
        review: {
          ...review,
          username: user.username
        }
      });
    } catch (error) {
      console.error('Error creating review:', error);
      res.status(500).json({ 
        message: 'Failed to create review',
        error: String(error)
      });
    }
  });
  
  // Update a review
  app.put('/api/reviews/:reviewId', async (req, res) => {
    try {
      const { reviewId } = req.params;
      const { rating, reviewText, title } = req.body;
      
      if (!reviewId) {
        return res.status(400).json({ 
          message: 'Review ID is required' 
        });
      }
      
      // Get the existing review
      const existingReview = await storage.getReviewById(parseInt(reviewId));
      
      if (!existingReview) {
        return res.status(404).json({ 
          message: 'Review not found' 
        });
      }
      
      // First check if we have this user in the DB, if not create them for demo purposes
      let user = await storage.getUserByUsername('demo');
      if (!user) {
        // Create a demo user for testing
        user = await storage.createUser({
          username: 'demo',
          email: 'demo@example.com',
          password: 'password123'
        });
      }
      
      // For demo purposes, we'll allow updating any review
      // In a real app, we'd check ownership

      // Validate the updated review data
      let updateData: any = {};
      
      if (rating !== undefined) {
        if (typeof rating !== 'number' || rating < 1 || rating > 5) {
          return res.status(400).json({ 
            message: 'Rating must be a number between 1 and 5' 
          });
        }
        updateData.rating = rating;
      }
      
      if (reviewText !== undefined) {
        updateData.reviewText = reviewText;
      }
      
      if (title !== undefined) {
        updateData.title = title;
      }
      
      // Update the review
      const updatedReview = await storage.updateReview(parseInt(reviewId), updateData);
      
      res.json({
        success: true,
        review: {
          ...updatedReview,
          username: user.username
        }
      });
    } catch (error) {
      console.error('Error updating review:', error);
      res.status(500).json({ 
        message: 'Failed to update review',
        error: String(error)
      });
    }
  });
  
  // Delete a review
  app.delete('/api/reviews/:reviewId', async (req, res) => {
    try {
      const { reviewId } = req.params;
      
      if (!reviewId) {
        return res.status(400).json({ 
          message: 'Review ID is required' 
        });
      }
      
      // Get the existing review
      const existingReview = await storage.getReviewById(parseInt(reviewId));
      
      if (!existingReview) {
        return res.status(404).json({ 
          message: 'Review not found' 
        });
      }
      
      // For demo purposes, we'll allow deleting any review
      // In a real app, we'd check ownership
      
      // Delete the review
      const success = await storage.deleteReview(parseInt(reviewId));
      
      if (!success) {
        return res.status(500).json({ 
          message: 'Failed to delete review' 
        });
      }
      
      res.json({
        success: true,
        message: 'Review deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting review:', error);
      res.status(500).json({ 
        message: 'Failed to delete review',
        error: String(error)
      });
    }
  });
  
  // Search API endpoint
  app.get('/api/search', (req, res) => {
    try {
      console.log('Handling /api/search request');
      const query = req.query.q as string || '';
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 12;
      
      if (!query.trim()) {
        return res.status(400).json({ 
          message: 'Search query is required' 
        });
      }
      
      console.log(`Searching for: "${query}" (Page ${page}, Limit ${limit})`);
      
      // Get all products
      const allProducts = getMergedProducts();
      
      // Perform the search
      const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 1);
      
      // Score products based on search terms
      const scoredProducts = allProducts.map(product => {
        let score = 0;
        const productName = product.productDisplayName?.toLowerCase() || '';
        const productType = product.articleType?.toLowerCase() || '';
        const productCategory = product.masterCategory?.toLowerCase() || '';
        const productSubCategory = product.subCategory?.toLowerCase() || '';
        const productColor = product.baseColour?.toLowerCase() || '';
        
        // Check each search term against product attributes
        searchTerms.forEach(term => {
          // Exact matches in name get highest score
          if (productName.includes(term)) {
            score += 5;
            // Bonus if it's an exact match for a word
            if (productName.split(/\s+/).includes(term)) {
              score += 3;
            }
          }
          
          // Matches in article type get high score
          if (productType.includes(term)) {
            score += 4;
          }
          
          // Matches in category/subcategory get medium score
          if (productCategory.includes(term)) {
            score += 3;
          }
          if (productSubCategory.includes(term)) {
            score += 3;
          }
          
          // Matches in color get lower score
          if (productColor.includes(term)) {
            score += 2;
          }
        });
        
        return { ...product, score };
      });
      
      // Filter to only products with a positive score and sort by score
      const matchingProducts = scoredProducts
        .filter(product => product.score > 0)
        .sort((a, b) => b.score - a.score);
      
      const totalCount = matchingProducts.length;
      const totalPages = Math.ceil(totalCount / limit);
      
      // Paginate the results
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedProducts = matchingProducts
        .slice(startIndex, endIndex)
        .map(({ score, ...product }) => product); // Remove score before sending
      
      res.json({
        products: paginatedProducts,
        totalCount,
        totalPages,
        currentPage: page,
        query
      });
      
      console.log(`Found ${totalCount} matches for "${query}"`);
    } catch (error) {
      console.error('Error performing search:', error);
      res.status(500).json({ 
        message: 'Failed to perform search',
        error: String(error)
      });
    }
  });

  // Merged products API using the CSV parser
  app.get('/api/merged-products', (req, res) => {
    try {
      console.log('Handling /api/merged-products request');
      
      // Check if search query is present
      const searchQuery = req.query.search as string;
      if (searchQuery && searchQuery.trim()) {
        // If there's a search query, redirect to the search endpoint
        const page = req.query.page || '1';
        const limit = req.query.limit || '12';
        return res.redirect(`/api/search?q=${encodeURIComponent(searchQuery)}&page=${page}&limit=${limit}`);
      }
      
      // Check if all products are requested
      const showAll = req.query.all === 'true';
      
      // Get page and limit from query params (only used if not showing all)
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 12;
      
      if (showAll) {
        console.log('Returning ALL products (no pagination)');
      } else {
        console.log(`Page: ${page}, Limit: ${limit}`);
      }
      
      // Get merged products from CSV data
      console.log('Calling getMergedProducts()...');
      const allProducts = getMergedProducts();
      const totalCount = allProducts.length;
      console.log(`Total products: ${totalCount}`);
      
      // Determine which products to return
      let productsToReturn;
      let responseMetadata;
      
      if (showAll) {
        // Return all products without pagination
        productsToReturn = allProducts;
        responseMetadata = {
          totalCount,
          showingAll: true
        };
        console.log(`Returning all ${totalCount} products`);
      } else {
        // Calculate pagination
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const totalPages = Math.ceil(totalCount / limit);
        console.log(`Pagination: startIndex=${startIndex}, endIndex=${endIndex}, totalPages=${totalPages}`);
        
        // Get the products for the current page
        productsToReturn = allProducts.slice(startIndex, endIndex);
        console.log(`Returning ${productsToReturn.length} products for this page`);
        
        responseMetadata = {
          totalCount,
          totalPages,
          currentPage: page,
          showingAll: false
        };
      }
      
      const response = {
        products: productsToReturn,
        ...responseMetadata
      };
      
      res.json(response);
      console.log('Successfully sent response');
    } catch (error) {
      console.error('Error serving merged products:', error);
      res.status(500).json({ message: 'Failed to retrieve products', error: String(error) });
    }
  });

  // API routes proxying to Flask backend (catch-all for other API routes)
  app.use("/api/*", async (req, res) => {
    try {
      // Proxy the request to the Flask backend
      const url = `http://localhost:8000${req.originalUrl}`;
      
      // Forward the request to the Flask backend
      const fetchOptions: RequestInit = {
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
          'Cookie': req.headers.cookie || ''
        },
        credentials: 'include'
      };
      
      // Add body for POST/PUT/PATCH requests
      if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        fetchOptions.body = JSON.stringify(req.body);
      }
      
      const flaskResponse = await fetch(url, fetchOptions);
      
      // Copy status and headers from Flask response
      res.status(flaskResponse.status);
      
      flaskResponse.headers.forEach((value, key) => {
        // Skip setting the content-encoding header which might cause issues
        if (key.toLowerCase() !== 'content-encoding') {
          res.setHeader(key, value);
        }
      });
      
      // Forward the response body
      const responseData = await flaskResponse.text();
      res.send(responseData);
    } catch (error) {
      console.error('Proxy error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  // Static image serving endpoint for backend data images
  app.use('/images', (req, res) => {
    // Extract filename from the path - remove leading slash and get just the filename
    const filename = req.path.replace(/^\//, '');
    console.log(`Image requested: ${filename}`);
    
    // First try to find the image in attached_assets/images (primary location)
    const attachedImagePath = path.resolve(process.cwd(), 'attached_assets/images', filename);
    console.log(`Looking for image at: ${attachedImagePath}`);
    
    if (fs.existsSync(attachedImagePath)) {
      console.log(`Image found in attached_assets: ${attachedImagePath}`);
      return res.sendFile(attachedImagePath);
    }
    
    // If not found in attached_assets, try backend/data/images (fallback location)
    const backendImagePath = path.resolve(process.cwd(), 'backend/data/images', filename);
    console.log(`Looking for image at fallback location: ${backendImagePath}`);
    
    if (fs.existsSync(backendImagePath)) {
      console.log(`Image found in backend directory: ${backendImagePath}`);
      return res.sendFile(backendImagePath);
    }
    
    // If we have some sample images, let's use 1163.jpg as a fallback
    const sampleImagePath = path.resolve(process.cwd(), 'attached_assets/images', '1163.jpg');
    if (fs.existsSync(sampleImagePath)) {
      console.log(`Using sample image as fallback: ${sampleImagePath}`);
      return res.sendFile(sampleImagePath);
    }
    
    // If image not found in any location, return a 404
    console.log(`Image not found: ${filename}`);
    return res.status(404).send('Image not found');
  });

  const httpServer = createServer(app);
  return httpServer;
}

function startFlaskServer() {
  // Make sure attached_assets directory exists
  const assetsDir = path.resolve(process.cwd(), 'attached_assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }
  
  // Create images directory if it doesn't exist
  const imagesDir = path.resolve(assetsDir, 'images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
  
  // Start Flask server as a child process
  console.log('Starting Flask server...');
  const flaskProcess = spawn('python', [path.resolve(process.cwd(), 'server/app.py')], {
    stdio: 'pipe'
  });
  
  flaskProcess.stdout.on('data', (data) => {
    console.log(`Flask: ${data}`);
  });
  
  flaskProcess.stderr.on('data', (data) => {
    console.error(`Flask error: ${data}`);
  });
  
  flaskProcess.on('close', (code) => {
    console.log(`Flask process exited with code ${code}`);
  });
  
  return flaskProcess;
}
