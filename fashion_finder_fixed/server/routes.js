import { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage.js";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";
import { getMergedProducts } from "./utils/csvParser.js";
import { insertInteractionSchema, insertReviewSchema } from "../shared/schema.js";

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  const userId = req.headers['user-id'];
  
  if (!userId) {
    return res.status(401).json({ 
      message: 'Authentication required. Please login first.'
    });
  }
  
  // Set userId in request for use in route handlers
  req.userId = parseInt(userId);
  next();
};

export async function registerRoutes(app) {
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
          let matchExplanation = [];
          
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
        .sort((a, b) => b.score - a.score) // Sort by score descending
        .slice(0, 12); // Get top 12 candidates
      
      // Extract the top matching reasons to explain recommendations
      const topCategories = Array.from(likedCategories).slice(0, 3);
      const topColors = Array.from(likedColors).slice(0, 3);
      const topKeywords = Array.from(likedKeywords).slice(0, 5);
      
      // Return the top 8 recommendations with explanation
      const recommendations = recommendationCandidates.slice(0, 8);
      
      return res.json({
        success: true,
        recommendations,
        recommendationType: 'personalized',
        message: 'Based on your style preferences',
        basedOn: {
          categories: topCategories,
          colors: topColors,
          keywords: topKeywords
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
  
  // API endpoint to get all products
  app.get('/api/products', (req, res) => {
    try {
      const products = getMergedProducts();
      res.json({ success: true, products });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ 
        message: 'Failed to fetch products',
        error: String(error)
      });
    }
  });
  
  // API endpoint to get a single product by ID
  app.get('/api/products/:id', (req, res) => {
    try {
      const productId = req.params.id;
      const products = getMergedProducts();
      const product = products.find(p => p.id === productId);
      
      if (!product) {
        return res.status(404).json({ 
          message: `Product with ID ${productId} not found`
        });
      }
      
      res.json({ success: true, product });
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ 
        message: 'Failed to fetch product',
        error: String(error)
      });
    }
  });
  
  // API endpoint to get quiz questions
  app.get('/api/quiz', (req, res) => {
    try {
      // Forward request to Flask server
      res.redirect('http://localhost:5001/api/quiz');
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
      res.status(500).json({ 
        message: 'Failed to fetch quiz questions',
        error: String(error)
      });
    }
  });
  
  // API endpoint to submit quiz answers and get recommendations
  app.post('/api/quiz', (req, res) => {
    try {
      // Forward request to Flask server
      // This is a simplification - in a real app we'd use a proper proxy
      const { answers } = req.body;
      
      if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({ 
          message: 'Invalid quiz answers format. Expected an array of answers.'
        });
      }
      
      // Forward to Flask server
      res.redirect(307, 'http://localhost:5001/api/quiz');
    } catch (error) {
      console.error('Error processing quiz answers:', error);
      res.status(500).json({ 
        message: 'Failed to process quiz answers',
        error: String(error)
      });
    }
  });
  
  // API endpoint for chatbot
  app.post('/api/chat', (req, res) => {
    try {
      // Forward request to Flask server
      res.redirect(307, 'http://localhost:5001/api/chat');
    } catch (error) {
      console.error('Error processing chat message:', error);
      res.status(500).json({ 
        message: 'Failed to process chat message',
        error: String(error)
      });
    }
  });
  
  // Create HTTP server
  const server = createServer(app);
  
  // Helper function to start Flask server
  function startFlaskServer() {
    console.log('Starting Flask server...');
    
    // Check if Python is available
    try {
      const pythonProcess = spawn('python3', ['--version']);
      pythonProcess.on('error', (err) => {
        console.error('Failed to start Python:', err);
      });
    } catch (error) {
      console.error('Error checking Python:', error);
    }
    
    // Start Flask server
    const flaskProcess = spawn('python3', ['-m', 'flask', 'run', '--port=5001'], {
      cwd: path.join(process.cwd(), 'server'),
      env: { ...process.env, FLASK_APP: 'app.py', FLASK_ENV: 'development' }
    });
    
    flaskProcess.stdout.on('data', (data) => {
      console.log(`Flask stdout: ${data}`);
    });
    
    flaskProcess.stderr.on('data', (data) => {
      console.error(`Flask stderr: ${data}`);
    });
    
    flaskProcess.on('close', (code) => {
      console.log(`Flask server exited with code ${code}`);
    });
    
    return flaskProcess;
  }
  
  return server;
}
