var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { createServer } from "http";
import { storage } from "./storage.js";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";
import { getMergedProducts } from "./utils/csvParser.js";
import { insertInteractionSchema, insertReviewSchema } from "../shared/schema.js";
// We'll implement the merged products functionality directly in routes.ts for now
// to avoid ES modules/CommonJS issues
// Authentication middleware
var isAuthenticated = function (req, res, next) {
    var userId = req.headers['user-id'];
    if (!userId) {
        return res.status(401).json({
            message: 'Authentication required. Please login first.'
        });
    }
    // Set userId in request for use in route handlers
    req.userId = parseInt(userId);
    next();
};
export function registerRoutes(app) {
    return __awaiter(this, void 0, void 0, function () {
        var flaskServer, httpServer;
        var _this = this;
        return __generator(this, function (_a) {
            flaskServer = startFlaskServer();
            // API endpoint for user interactions (likes, dislikes, views)
            app.post('/api/interactions', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var _a, productId, interactionType, bodyUserId, headerUserId, user, oppositeType, existingOpposite, interactionData, interaction, error_1;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 8, , 9]);
                            _a = req.body, productId = _a.productId, interactionType = _a.interactionType, bodyUserId = _a.userId;
                            headerUserId = req.headers['user-id'];
                            console.log('Recording interaction:', { productId: productId, interactionType: interactionType, headerUserId: headerUserId, bodyUserId: bodyUserId });
                            // Validate required fields
                            if (!productId || !interactionType) {
                                return [2 /*return*/, res.status(400).json({
                                        message: 'Missing required fields: productId and interactionType are required'
                                    })];
                            }
                            // Validate interaction type
                            if (!['like', 'dislike', 'view'].includes(interactionType)) {
                                return [2 /*return*/, res.status(400).json({
                                        message: 'Invalid interactionType. Must be "like", "dislike", or "view"'
                                    })];
                            }
                            return [4 /*yield*/, storage.getUserByUsername('demo')];
                        case 1:
                            user = _b.sent();
                            if (!!user) return [3 /*break*/, 3];
                            return [4 /*yield*/, storage.createUser({
                                    username: 'demo',
                                    email: 'demo@example.com',
                                    password: 'password123'
                                })];
                        case 2:
                            // Create a demo user for testing
                            user = _b.sent();
                            console.log('Created demo user:', user);
                            _b.label = 3;
                        case 3:
                            if (!(interactionType === 'like' || interactionType === 'dislike')) return [3 /*break*/, 6];
                            oppositeType = interactionType === 'like' ? 'dislike' : 'like';
                            return [4 /*yield*/, storage.getInteractionByUserAndProduct(user.id, productId, oppositeType)];
                        case 4:
                            existingOpposite = _b.sent();
                            if (!existingOpposite) return [3 /*break*/, 6];
                            return [4 /*yield*/, storage.deleteInteraction(user.id, productId, oppositeType)];
                        case 5:
                            _b.sent();
                            _b.label = 6;
                        case 6:
                            interactionData = insertInteractionSchema.parse({
                                userId: user.id,
                                productId: productId,
                                interactionType: interactionType
                            });
                            return [4 /*yield*/, storage.createInteraction(interactionData)];
                        case 7:
                            interaction = _b.sent();
                            res.status(201).json({
                                success: true,
                                interaction: interaction
                            });
                            return [3 /*break*/, 9];
                        case 8:
                            error_1 = _b.sent();
                            console.error('Error creating interaction:', error_1);
                            res.status(500).json({
                                message: 'Failed to record interaction',
                                error: String(error_1)
                            });
                            return [3 /*break*/, 9];
                        case 9: return [2 /*return*/];
                    }
                });
            }); });
            // API endpoint to get personalized recommendations based on user's interactions
            app.get('/api/recommendations', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var forceRefresh, timestamp, user, userId, likedInteractions, likedProductIds_1, dislikedInteractions, dislikedProductIds_1, viewedInteractions, viewedProductIds_1, allProducts_1, randomProducts, allProducts_2, randomProducts, likedProducts_1, likedCategories_1, likedSubCategories_1, likedColors_1, likedUsages_1, likedGenders_1, likedSeasons_1, likedKeywords_1, footwearCount_1, totalLikedCount, focusOnFootwear_1, recommendationCandidates, recommendations, allReasons, reasonCounts_1, sortedReasons, message, recommendationType, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 7, , 8]);
                            console.log('Generating recommendations...');
                            forceRefresh = req.query.forceRefresh === 'true';
                            timestamp = req.query._ || new Date().getTime();
                            console.log("Recommendation request with timestamp=".concat(timestamp, ", forceRefresh=").concat(forceRefresh));
                            return [4 /*yield*/, storage.getUserByUsername('demo')];
                        case 1:
                            user = _a.sent();
                            if (!!user) return [3 /*break*/, 3];
                            return [4 /*yield*/, storage.createUser({
                                    username: 'demo',
                                    email: 'demo@example.com',
                                    password: 'password123'
                                })];
                        case 2:
                            // Create a demo user for testing
                            user = _a.sent();
                            console.log('Created demo user for recommendations:', user);
                            _a.label = 3;
                        case 3:
                            userId = user.id;
                            return [4 /*yield*/, storage.getInteractionsByUserAndType(userId, 'like')];
                        case 4:
                            likedInteractions = _a.sent();
                            likedProductIds_1 = likedInteractions.map(function (interaction) { return interaction.productId; });
                            console.log("Found ".concat(likedInteractions.length, " liked products for user ").concat(userId, ":"), likedProductIds_1);
                            return [4 /*yield*/, storage.getInteractionsByUserAndType(userId, 'dislike')];
                        case 5:
                            dislikedInteractions = _a.sent();
                            dislikedProductIds_1 = dislikedInteractions.map(function (interaction) { return interaction.productId; });
                            console.log("Found ".concat(dislikedInteractions.length, " disliked products for user ").concat(userId, ":"), dislikedProductIds_1);
                            return [4 /*yield*/, storage.getInteractionsByUserAndType(userId, 'view')];
                        case 6:
                            viewedInteractions = _a.sent();
                            viewedProductIds_1 = viewedInteractions.map(function (interaction) { return interaction.productId; });
                            console.log("Found ".concat(viewedInteractions.length, " viewed products for user ").concat(userId));
                            // Immediately return popular products if no interactions found
                            if (likedInteractions.length === 0 && dislikedInteractions.length === 0 && viewedInteractions.length === 0) {
                                console.log('No interactions found, returning popular products');
                                allProducts_1 = getMergedProducts();
                                randomProducts = allProducts_1
                                    .sort(function () { return 0.5 - Math.random(); })
                                    .slice(0, 8);
                                return [2 /*return*/, res.json({
                                        success: true,
                                        recommendations: randomProducts,
                                        recommendationType: 'popular',
                                        message: 'Based on popular items',
                                        basedOn: {
                                            categories: [],
                                            colors: [],
                                            keywords: []
                                        }
                                    })];
                            }
                            allProducts_2 = getMergedProducts();
                            // If user has no likes, return popular products excluding dislikes
                            if (likedProductIds_1.length === 0) {
                                randomProducts = allProducts_2
                                    .filter(function (product) { return !dislikedProductIds_1.includes(product.id); })
                                    .sort(function () { return 0.5 - Math.random(); })
                                    .slice(0, 8);
                                return [2 /*return*/, res.json({
                                        success: true,
                                        recommendations: randomProducts,
                                        recommendationType: 'popular',
                                        message: 'Based on popular items'
                                    })];
                            }
                            likedProducts_1 = allProducts_2.filter(function (product) {
                                return likedProductIds_1.includes(product.id);
                            });
                            likedCategories_1 = new Set();
                            likedSubCategories_1 = new Set();
                            likedColors_1 = new Set();
                            likedUsages_1 = new Set();
                            likedGenders_1 = new Set();
                            likedSeasons_1 = new Set();
                            likedKeywords_1 = new Set();
                            footwearCount_1 = 0;
                            totalLikedCount = likedProducts_1.length;
                            // Extract keywords from product names and descriptions
                            likedProducts_1.forEach(function (product) {
                                // Add categorical attributes
                                likedCategories_1.add(product.articleType);
                                likedSubCategories_1.add(product.subCategory);
                                likedColors_1.add(product.baseColour);
                                likedUsages_1.add(product.usage);
                                likedGenders_1.add(product.gender);
                                likedSeasons_1.add(product.season);
                                // Count footwear items specifically
                                if (product.masterCategory === 'Footwear' ||
                                    product.subCategory === 'Shoes' ||
                                    product.articleType.includes('Shoe')) {
                                    footwearCount_1++;
                                }
                                // Extract keywords from product name
                                if (product.productDisplayName) {
                                    var words = product.productDisplayName.toLowerCase()
                                        .split(/\s+/)
                                        .filter(function (word) { return word.length > 3; }) // Only meaningful words
                                        .map(function (word) { return word.replace(/[^a-z]/g, ''); }); // Clean up words
                                    words.forEach(function (word) { return likedKeywords_1.add(word); });
                                }
                            });
                            focusOnFootwear_1 = footwearCount_1 > 0 && (footwearCount_1 / totalLikedCount >= 0.5);
                            console.log("User footwear preference: ".concat(footwearCount_1, "/").concat(totalLikedCount, " liked items are footwear. Focus on footwear: ").concat(focusOnFootwear_1));
                            recommendationCandidates = allProducts_2
                                .filter(function (product) {
                                // CRITICAL: FIRST FILTER - Don't include products user already liked
                                if (likedProductIds_1.includes(product.id)) {
                                    console.log("Excluding already liked product ".concat(product.id, " from recommendations"));
                                    return false;
                                }
                                // CRITICAL: SECOND FILTER - Strictly exclude disliked products
                                if (dislikedProductIds_1.includes(product.id)) {
                                    console.log("Excluding disliked product ".concat(product.id, " from recommendations"));
                                    return false;
                                }
                                // SPECIAL FOOTWEAR FILTER - When user predominantly likes shoes,
                                // only show other footwear items in recommendations
                                if (focusOnFootwear_1) {
                                    var isFootwear = product.masterCategory === 'Footwear' ||
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
                                .map(function (product) {
                                var score = 0;
                                var matchExplanation = [];
                                // EXACT MATCH BOOST - Highest priority is matching article type (like shirts with shirts)
                                var exactArticleTypeMatch = likedCategories_1.has(product.articleType);
                                if (exactArticleTypeMatch) {
                                    // Increased score for exact matching - prioritize showing same types
                                    score += 15; // Dramatically increase the score for matching article types
                                    matchExplanation.push("Same type: ".concat(product.articleType));
                                }
                                // COMPLEMENTARY ITEMS - If not exact match, boost items that go well together
                                // For example, if user likes tops, recommend matching bottoms
                                if (!exactArticleTypeMatch) {
                                    var isTopwear = likedCategories_1.has('Tshirts') ||
                                        likedCategories_1.has('Shirts') ||
                                        likedCategories_1.has('Jackets');
                                    var isBottomwear = product.subCategory === 'Bottomwear' ||
                                        product.articleType === 'Jeans' ||
                                        product.articleType === 'Trousers';
                                    if (isTopwear && isBottomwear) {
                                        score += 3;
                                        matchExplanation.push('Complementary item');
                                    }
                                }
                                // COLOR PREFERENCE - People often have color preferences
                                if (likedColors_1.has(product.baseColour)) {
                                    score += 3;
                                    matchExplanation.push("Preferred color: ".concat(product.baseColour));
                                }
                                // MASTER CATEGORY - If user liked footwear, recommend other footwear
                                var sameMasterCategory = likedProducts_1.some(function (liked) { return liked.masterCategory === product.masterCategory; });
                                if (sameMasterCategory) {
                                    // Increased score for master category matching
                                    score += 8; // Give strong weight to matching the same master category (e.g., Footwear)
                                    matchExplanation.push("Same category: ".concat(product.masterCategory));
                                }
                                // SUBCATEGORY MATCH
                                if (likedSubCategories_1.has(product.subCategory)) {
                                    // Increased scoring for subcategory match
                                    score += 6; // Increase weight for matching subcategories (e.g., Shoes)
                                    matchExplanation.push("Same subcategory: ".concat(product.subCategory));
                                }
                                // GENDER PREFERENCE
                                if (likedGenders_1.has(product.gender)) {
                                    score += 2;
                                    matchExplanation.push("Same gender: ".concat(product.gender));
                                }
                                // USAGE CONTEXT - Sports, Casual, etc.
                                if (likedUsages_1.has(product.usage)) {
                                    score += 2;
                                    matchExplanation.push("Same usage: ".concat(product.usage));
                                }
                                // SEASON MATCH
                                if (likedSeasons_1.has(product.season)) {
                                    score += 1;
                                    matchExplanation.push("Same season: ".concat(product.season));
                                }
                                // TEXT-BASED MATCHING from product name
                                if (product.productDisplayName) {
                                    var words = product.productDisplayName.toLowerCase()
                                        .split(/\s+/)
                                        .filter(function (word) { return word.length > 3; })
                                        .map(function (word) { return word.replace(/[^a-z]/g, ''); });
                                    // Count keyword matches from the product name
                                    var keywordMatches = words.filter(function (word) { return likedKeywords_1.has(word); });
                                    if (keywordMatches.length > 0) {
                                        score += keywordMatches.length * 2; // Each keyword match adds 2 points
                                        matchExplanation.push("Style keywords: ".concat(keywordMatches.join(', ')));
                                    }
                                }
                                // PREVIOUSLY VIEWED ITEMS - boost slightly
                                if (viewedProductIds_1.includes(product.id)) {
                                    score += 0.5;
                                }
                                // DISLIKES PENALTY - strongly penalize disliked characteristics
                                var dislikedProducts = allProducts_2.filter(function (p) { return dislikedProductIds_1.includes(p.id); });
                                dislikedProducts.forEach(function (dislikedProduct) {
                                    // Strongly penalize same article type if disliked
                                    if (dislikedProduct.articleType === product.articleType) {
                                        score -= 3;
                                        matchExplanation = matchExplanation.filter(function (m) { return !m.includes("Same type: ".concat(product.articleType)); });
                                    }
                                    // Moderately penalize same color if disliked
                                    if (dislikedProduct.baseColour === product.baseColour) {
                                        score -= 2;
                                        matchExplanation = matchExplanation.filter(function (m) { return !m.includes("Preferred color: ".concat(product.baseColour)); });
                                    }
                                    // Lightly penalize same usage context if disliked
                                    if (dislikedProduct.usage === product.usage) {
                                        score -= 1;
                                    }
                                });
                                // ADD RANDOMNESS - to ensure some variety, but reduce it significantly
                                // Reduced randomness to favor consistent category matching
                                var randomFactor = (Math.random() * 0.1) - 0.05; // -0.05 to +0.05 (only 5% randomness)
                                var randomizedScore = score * (1 + randomFactor);
                                return __assign(__assign({}, product), { score: randomizedScore, matchExplanation: matchExplanation });
                            })
                                // Sort by relevance score (descending)
                                .sort(function (a, b) { return b.score - a.score; });
                            // Log the top recommendations with their scores and match explanations 
                            console.log('Top recommendation candidates:');
                            recommendationCandidates.slice(0, 3).forEach(function (product, index) {
                                console.log("".concat(index + 1, ". ").concat(product.productDisplayName, " (Score: ").concat(product.score.toFixed(2), ")"), "Reasons: ".concat(product.matchExplanation.join(', ')));
                            });
                            recommendations = recommendationCandidates
                                .slice(0, 8)
                                // Keep explanation but remove score
                                .map(function (_a) {
                                var score = _a.score, matchExplanation = _a.matchExplanation, product = __rest(_a, ["score", "matchExplanation"]);
                                return (__assign(__assign({}, product), { 
                                    // Add a recommendation reason for UI display
                                    recommendationReason: matchExplanation.length > 0
                                        ? matchExplanation[0]
                                        : 'You might like this' }));
                            });
                            allReasons = recommendationCandidates
                                .slice(0, 8)
                                .flatMap(function (product) { return product.matchExplanation; });
                            reasonCounts_1 = {};
                            allReasons.forEach(function (reason) {
                                var reasonType = reason.split(':')[0].trim();
                                reasonCounts_1[reasonType] = (reasonCounts_1[reasonType] || 0) + 1;
                            });
                            sortedReasons = Object.entries(reasonCounts_1)
                                .sort(function (a, b) { return b[1] - a[1]; })
                                .map(function (_a) {
                                var reason = _a[0];
                                return reason;
                            });
                            message = 'Recommendations based on ';
                            recommendationType = 'personalized';
                            // Check if we should focus on footwear
                            if (focusOnFootwear_1) {
                                message = 'Footwear recommendations based on your shoe preferences';
                                recommendationType = 'footwear';
                            }
                            else if (sortedReasons.length > 0) {
                                message += sortedReasons.slice(0, 3).join(', ');
                                if (sortedReasons.length > 3) {
                                    message += ' and more';
                                }
                            }
                            else {
                                message = 'Personalized recommendations for you';
                            }
                            // Add more clarity for the user
                            if (likedProducts_1.length > 0 && !focusOnFootwear_1) {
                                message += " from your ".concat(likedProducts_1.length, " liked items");
                            }
                            res.json({
                                success: true,
                                recommendations: recommendations,
                                recommendationType: recommendationType,
                                message: message,
                                // Include the detailed data for UI display
                                basedOn: {
                                    categories: Array.from(likedCategories_1),
                                    subCategories: Array.from(likedSubCategories_1),
                                    colors: Array.from(likedColors_1),
                                    usages: Array.from(likedUsages_1),
                                    genders: Array.from(likedGenders_1),
                                    seasons: Array.from(likedSeasons_1),
                                    keywords: Array.from(likedKeywords_1),
                                    reasons: sortedReasons,
                                    footwearFocus: focusOnFootwear_1
                                }
                            });
                            return [3 /*break*/, 8];
                        case 7:
                            error_2 = _a.sent();
                            console.error('Error generating recommendations:', error_2);
                            res.status(500).json({
                                message: 'Failed to generate recommendations',
                                error: String(error_2)
                            });
                            return [3 /*break*/, 8];
                        case 8: return [2 /*return*/];
                    }
                });
            }); });
            // API endpoint to get user's liked products
            app.get('/api/interactions/liked', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var user, userId, likedInteractions, likedProductIds_2, allProducts, likedProducts, error_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 5, , 6]);
                            return [4 /*yield*/, storage.getUserByUsername('demo')];
                        case 1:
                            user = _a.sent();
                            if (!!user) return [3 /*break*/, 3];
                            return [4 /*yield*/, storage.createUser({
                                    username: 'demo',
                                    email: 'demo@example.com',
                                    password: 'password123'
                                })];
                        case 2:
                            // Create a demo user for testing
                            user = _a.sent();
                            _a.label = 3;
                        case 3:
                            userId = user.id;
                            return [4 /*yield*/, storage.getInteractionsByUserAndType(userId, 'like')];
                        case 4:
                            likedInteractions = _a.sent();
                            likedProductIds_2 = likedInteractions.map(function (interaction) { return interaction.productId; });
                            allProducts = getMergedProducts();
                            likedProducts = allProducts.filter(function (product) {
                                return likedProductIds_2.includes(product.id);
                            });
                            res.json({
                                success: true,
                                likedProducts: likedProducts
                            });
                            return [3 /*break*/, 6];
                        case 5:
                            error_3 = _a.sent();
                            console.error('Error fetching liked products:', error_3);
                            res.status(500).json({
                                message: 'Failed to fetch liked products',
                                error: String(error_3)
                            });
                            return [3 /*break*/, 6];
                        case 6: return [2 /*return*/];
                    }
                });
            }); });
            // ===== PRODUCT REVIEWS ENDPOINTS =====
            // Get reviews for a product
            app.get('/api/products/:productId/reviews', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var productId, reviews, reviewsWithUserData, error_4;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            productId = req.params.productId;
                            if (!productId) {
                                return [2 /*return*/, res.status(400).json({
                                        message: 'Product ID is required'
                                    })];
                            }
                            return [4 /*yield*/, storage.getReviewsByProductId(productId)];
                        case 1:
                            reviews = _a.sent();
                            return [4 /*yield*/, Promise.all(reviews.map(function (review) { return __awaiter(_this, void 0, void 0, function () {
                                    var user;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, storage.getUser(review.userId)];
                                            case 1:
                                                user = _a.sent();
                                                return [2 /*return*/, __assign(__assign({}, review), { username: (user === null || user === void 0 ? void 0 : user.username) || 'Anonymous' })];
                                        }
                                    });
                                }); }))];
                        case 2:
                            reviewsWithUserData = _a.sent();
                            res.json({
                                success: true,
                                reviews: reviewsWithUserData
                            });
                            return [3 /*break*/, 4];
                        case 3:
                            error_4 = _a.sent();
                            console.error('Error fetching product reviews:', error_4);
                            res.status(500).json({
                                message: 'Failed to fetch reviews',
                                error: String(error_4)
                            });
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
            // Get rating summary for a product
            app.get('/api/products/:productId/rating', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var productId, rating, error_5;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            productId = req.params.productId;
                            if (!productId) {
                                return [2 /*return*/, res.status(400).json({
                                        message: 'Product ID is required'
                                    })];
                            }
                            return [4 /*yield*/, storage.getProductRating(productId)];
                        case 1:
                            rating = _a.sent();
                            // If no rating exists, return default values
                            if (!rating) {
                                return [2 /*return*/, res.json({
                                        success: true,
                                        rating: {
                                            productId: productId,
                                            averageRating: 0,
                                            totalRatings: 0,
                                            fiveStarCount: 0,
                                            fourStarCount: 0,
                                            threeStarCount: 0,
                                            twoStarCount: 0,
                                            oneStarCount: 0
                                        }
                                    })];
                            }
                            res.json({
                                success: true,
                                rating: rating
                            });
                            return [3 /*break*/, 3];
                        case 2:
                            error_5 = _a.sent();
                            console.error('Error fetching product rating:', error_5);
                            res.status(500).json({
                                message: 'Failed to fetch rating',
                                error: String(error_5)
                            });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Create or update a review
            app.post('/api/products/:productId/reviews', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var productId_1, _a, rating, reviewText, title, allProducts, productExists, user, reviewData, review, error_6;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 5, , 6]);
                            productId_1 = req.params.productId;
                            _a = req.body, rating = _a.rating, reviewText = _a.reviewText, title = _a.title;
                            if (!productId_1) {
                                return [2 /*return*/, res.status(400).json({
                                        message: 'Product ID is required'
                                    })];
                            }
                            // Validate rating
                            if (typeof rating !== 'number' || rating < 1 || rating > 5) {
                                return [2 /*return*/, res.status(400).json({
                                        message: 'Rating must be a number between 1 and 5'
                                    })];
                            }
                            allProducts = getMergedProducts();
                            productExists = allProducts.some(function (product) { return product.id === productId_1; });
                            if (!productExists) {
                                return [2 /*return*/, res.status(404).json({
                                        message: 'Product not found'
                                    })];
                            }
                            return [4 /*yield*/, storage.getUserByUsername('demo')];
                        case 1:
                            user = _b.sent();
                            if (!!user) return [3 /*break*/, 3];
                            return [4 /*yield*/, storage.createUser({
                                    username: 'demo',
                                    email: 'demo@example.com',
                                    password: 'password123'
                                })];
                        case 2:
                            // Create a demo user for testing
                            user = _b.sent();
                            _b.label = 3;
                        case 3:
                            reviewData = insertReviewSchema.parse({
                                userId: user.id,
                                productId: productId_1,
                                rating: rating,
                                reviewText: reviewText,
                                title: title
                            });
                            return [4 /*yield*/, storage.createReview(reviewData)];
                        case 4:
                            review = _b.sent();
                            res.status(201).json({
                                success: true,
                                review: __assign(__assign({}, review), { username: user.username })
                            });
                            return [3 /*break*/, 6];
                        case 5:
                            error_6 = _b.sent();
                            console.error('Error creating review:', error_6);
                            res.status(500).json({
                                message: 'Failed to create review',
                                error: String(error_6)
                            });
                            return [3 /*break*/, 6];
                        case 6: return [2 /*return*/];
                    }
                });
            }); });
            // Update a review
            app.put('/api/reviews/:reviewId', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var reviewId, _a, rating, reviewText, title, existingReview, user, updateData, updatedReview, error_7;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 6, , 7]);
                            reviewId = req.params.reviewId;
                            _a = req.body, rating = _a.rating, reviewText = _a.reviewText, title = _a.title;
                            if (!reviewId) {
                                return [2 /*return*/, res.status(400).json({
                                        message: 'Review ID is required'
                                    })];
                            }
                            return [4 /*yield*/, storage.getReviewById(parseInt(reviewId))];
                        case 1:
                            existingReview = _b.sent();
                            if (!existingReview) {
                                return [2 /*return*/, res.status(404).json({
                                        message: 'Review not found'
                                    })];
                            }
                            return [4 /*yield*/, storage.getUserByUsername('demo')];
                        case 2:
                            user = _b.sent();
                            if (!!user) return [3 /*break*/, 4];
                            return [4 /*yield*/, storage.createUser({
                                    username: 'demo',
                                    email: 'demo@example.com',
                                    password: 'password123'
                                })];
                        case 3:
                            // Create a demo user for testing
                            user = _b.sent();
                            _b.label = 4;
                        case 4:
                            updateData = {};
                            if (rating !== undefined) {
                                if (typeof rating !== 'number' || rating < 1 || rating > 5) {
                                    return [2 /*return*/, res.status(400).json({
                                            message: 'Rating must be a number between 1 and 5'
                                        })];
                                }
                                updateData.rating = rating;
                            }
                            if (reviewText !== undefined) {
                                updateData.reviewText = reviewText;
                            }
                            if (title !== undefined) {
                                updateData.title = title;
                            }
                            return [4 /*yield*/, storage.updateReview(parseInt(reviewId), updateData)];
                        case 5:
                            updatedReview = _b.sent();
                            res.json({
                                success: true,
                                review: __assign(__assign({}, updatedReview), { username: user.username })
                            });
                            return [3 /*break*/, 7];
                        case 6:
                            error_7 = _b.sent();
                            console.error('Error updating review:', error_7);
                            res.status(500).json({
                                message: 'Failed to update review',
                                error: String(error_7)
                            });
                            return [3 /*break*/, 7];
                        case 7: return [2 /*return*/];
                    }
                });
            }); });
            // Delete a review
            app.delete('/api/reviews/:reviewId', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var reviewId, existingReview, success, error_8;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            reviewId = req.params.reviewId;
                            if (!reviewId) {
                                return [2 /*return*/, res.status(400).json({
                                        message: 'Review ID is required'
                                    })];
                            }
                            return [4 /*yield*/, storage.getReviewById(parseInt(reviewId))];
                        case 1:
                            existingReview = _a.sent();
                            if (!existingReview) {
                                return [2 /*return*/, res.status(404).json({
                                        message: 'Review not found'
                                    })];
                            }
                            return [4 /*yield*/, storage.deleteReview(parseInt(reviewId))];
                        case 2:
                            success = _a.sent();
                            if (!success) {
                                return [2 /*return*/, res.status(500).json({
                                        message: 'Failed to delete review'
                                    })];
                            }
                            res.json({
                                success: true,
                                message: 'Review deleted successfully'
                            });
                            return [3 /*break*/, 4];
                        case 3:
                            error_8 = _a.sent();
                            console.error('Error deleting review:', error_8);
                            res.status(500).json({
                                message: 'Failed to delete review',
                                error: String(error_8)
                            });
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
            // Search API endpoint
            app.get('/api/search', function (req, res) {
                try {
                    console.log('Handling /api/search request');
                    var query = req.query.q || '';
                    var page = parseInt(req.query.page) || 1;
                    var limit = parseInt(req.query.limit) || 12;
                    if (!query.trim()) {
                        return res.status(400).json({
                            message: 'Search query is required'
                        });
                    }
                    console.log("Searching for: \"".concat(query, "\" (Page ").concat(page, ", Limit ").concat(limit, ")"));
                    // Get all products
                    var allProducts = getMergedProducts();
                    // Perform the search
                    var searchTerms_1 = query.toLowerCase().split(/\s+/).filter(function (term) { return term.length > 1; });
                    // Score products based on search terms
                    var scoredProducts = allProducts.map(function (product) {
                        var _a, _b, _c, _d, _e;
                        var score = 0;
                        var productName = ((_a = product.productDisplayName) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
                        var productType = ((_b = product.articleType) === null || _b === void 0 ? void 0 : _b.toLowerCase()) || '';
                        var productCategory = ((_c = product.masterCategory) === null || _c === void 0 ? void 0 : _c.toLowerCase()) || '';
                        var productSubCategory = ((_d = product.subCategory) === null || _d === void 0 ? void 0 : _d.toLowerCase()) || '';
                        var productColor = ((_e = product.baseColour) === null || _e === void 0 ? void 0 : _e.toLowerCase()) || '';
                        // Check each search term against product attributes
                        searchTerms_1.forEach(function (term) {
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
                        return __assign(__assign({}, product), { score: score });
                    });
                    // Filter to only products with a positive score and sort by score
                    var matchingProducts = scoredProducts
                        .filter(function (product) { return product.score > 0; })
                        .sort(function (a, b) { return b.score - a.score; });
                    var totalCount = matchingProducts.length;
                    var totalPages = Math.ceil(totalCount / limit);
                    // Paginate the results
                    var startIndex = (page - 1) * limit;
                    var endIndex = page * limit;
                    var paginatedProducts = matchingProducts
                        .slice(startIndex, endIndex)
                        .map(function (_a) {
                        var score = _a.score, product = __rest(_a, ["score"]);
                        return product;
                    }); // Remove score before sending
                    res.json({
                        products: paginatedProducts,
                        totalCount: totalCount,
                        totalPages: totalPages,
                        currentPage: page,
                        query: query
                    });
                    console.log("Found ".concat(totalCount, " matches for \"").concat(query, "\""));
                }
                catch (error) {
                    console.error('Error performing search:', error);
                    res.status(500).json({
                        message: 'Failed to perform search',
                        error: String(error)
                    });
                }
            });
            // Merged products API using the CSV parser
            app.get('/api/merged-products', function (req, res) {
                try {
                    console.log('Handling /api/merged-products request');
                    // Check if search query is present
                    var searchQuery = req.query.search;
                    if (searchQuery && searchQuery.trim()) {
                        // If there's a search query, redirect to the search endpoint
                        var page_1 = req.query.page || '1';
                        var limit_1 = req.query.limit || '12';
                        return res.redirect("/api/search?q=".concat(encodeURIComponent(searchQuery), "&page=").concat(page_1, "&limit=").concat(limit_1));
                    }
                    // Check if all products are requested
                    var showAll = req.query.all === 'true';
                    // Get page and limit from query params (only used if not showing all)
                    var page = parseInt(req.query.page) || 1;
                    var limit = parseInt(req.query.limit) || 12;
                    if (showAll) {
                        console.log('Returning ALL products (no pagination)');
                    }
                    else {
                        console.log("Page: ".concat(page, ", Limit: ").concat(limit));
                    }
                    // Get merged products from CSV data
                    console.log('Calling getMergedProducts()...');
                    var allProducts = getMergedProducts();
                    var totalCount = allProducts.length;
                    console.log("Total products: ".concat(totalCount));
                    // Determine which products to return
                    var productsToReturn = void 0;
                    var responseMetadata = void 0;
                    if (showAll) {
                        // Return all products without pagination
                        productsToReturn = allProducts;
                        responseMetadata = {
                            totalCount: totalCount,
                            showingAll: true
                        };
                        console.log("Returning all ".concat(totalCount, " products"));
                    }
                    else {
                        // Calculate pagination
                        var startIndex = (page - 1) * limit;
                        var endIndex = page * limit;
                        var totalPages = Math.ceil(totalCount / limit);
                        console.log("Pagination: startIndex=".concat(startIndex, ", endIndex=").concat(endIndex, ", totalPages=").concat(totalPages));
                        // Get the products for the current page
                        productsToReturn = allProducts.slice(startIndex, endIndex);
                        console.log("Returning ".concat(productsToReturn.length, " products for this page"));
                        responseMetadata = {
                            totalCount: totalCount,
                            totalPages: totalPages,
                            currentPage: page,
                            showingAll: false
                        };
                    }
                    var response = __assign({ products: productsToReturn }, responseMetadata);
                    res.json(response);
                    console.log('Successfully sent response');
                }
                catch (error) {
                    console.error('Error serving merged products:', error);
                    res.status(500).json({ message: 'Failed to retrieve products', error: String(error) });
                }
            });
            // API routes proxying to Flask backend (catch-all for other API routes)
            app.use("/api/*", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var url, fetchOptions, flaskResponse, responseData, error_9;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            url = "http://localhost:8000".concat(req.originalUrl);
                            fetchOptions = {
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
                            return [4 /*yield*/, fetch(url, fetchOptions)];
                        case 1:
                            flaskResponse = _a.sent();
                            // Copy status and headers from Flask response
                            res.status(flaskResponse.status);
                            flaskResponse.headers.forEach(function (value, key) {
                                // Skip setting the content-encoding header which might cause issues
                                if (key.toLowerCase() !== 'content-encoding') {
                                    res.setHeader(key, value);
                                }
                            });
                            return [4 /*yield*/, flaskResponse.text()];
                        case 2:
                            responseData = _a.sent();
                            res.send(responseData);
                            return [3 /*break*/, 4];
                        case 3:
                            error_9 = _a.sent();
                            console.error('Proxy error:', error_9);
                            res.status(500).json({ message: 'Internal Server Error' });
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
            // Static image serving endpoint for backend data images
            app.use('/images', function (req, res) {
                // Extract filename from the path - remove leading slash and get just the filename
                var filename = req.path.replace(/^\//, '');
                console.log("Image requested: ".concat(filename));
                // First try to find the image in attached_assets/images (primary location)
                var attachedImagePath = path.resolve(process.cwd(), 'attached_assets/images', filename);
                console.log("Looking for image at: ".concat(attachedImagePath));
                if (fs.existsSync(attachedImagePath)) {
                    console.log("Image found in attached_assets: ".concat(attachedImagePath));
                    return res.sendFile(attachedImagePath);
                }
                // If not found in attached_assets, try backend/data/images (fallback location)
                var backendImagePath = path.resolve(process.cwd(), 'backend/data/images', filename);
                console.log("Looking for image at fallback location: ".concat(backendImagePath));
                if (fs.existsSync(backendImagePath)) {
                    console.log("Image found in backend directory: ".concat(backendImagePath));
                    return res.sendFile(backendImagePath);
                }
                // If we have some sample images, let's use 1163.jpg as a fallback
                var sampleImagePath = path.resolve(process.cwd(), 'attached_assets/images', '1163.jpg');
                if (fs.existsSync(sampleImagePath)) {
                    console.log("Using sample image as fallback: ".concat(sampleImagePath));
                    return res.sendFile(sampleImagePath);
                }
                // If image not found in any location, return a 404
                console.log("Image not found: ".concat(filename));
                return res.status(404).send('Image not found');
            });
            httpServer = createServer(app);
            return [2 /*return*/, httpServer];
        });
    });
}
function startFlaskServer() {
    // Make sure attached_assets directory exists
    var assetsDir = path.resolve(process.cwd(), 'attached_assets');
    if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
    }
    // Create images directory if it doesn't exist
    var imagesDir = path.resolve(assetsDir, 'images');
    if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
    }
    // Start Flask server as a child process
    console.log('Starting Flask server...');
    var flaskProcess = spawn('python', [path.resolve(process.cwd(), 'server/app.py')], {
        stdio: 'pipe'
    });
    flaskProcess.stdout.on('data', function (data) {
        console.log("Flask: ".concat(data));
    });
    flaskProcess.stderr.on('data', function (data) {
        console.error("Flask error: ".concat(data));
    });
    flaskProcess.on('close', function (code) {
        console.log("Flask process exited with code ".concat(code));
    });
    return flaskProcess;
}
