"""
Enhanced AI Recommendation System for Fashion Finder

This service uses a hybrid approach combining:
1. Visual embeddings from product images
2. Metadata embeddings from product attributes
3. User preference modeling based on interactions
4. Contextual understanding of fashion compatibility

The system provides personalized recommendations with explanations.
"""

import os
import numpy as np
import pandas as pd
from sklearn.preprocessing import OneHotEncoder
from sklearn.metrics.pairwise import cosine_similarity
import random
import json
from collections import Counter

class EnhancedAIRecommendationService:
    def __init__(self, products, images_dir="server/static/images"):
        """Initialize the enhanced AI recommendation service"""
        self.products = products
        self.images_dir = images_dir
        self.product_dict = {p['id']: p for p in products}
        
        # Generate embeddings
        self.setup_embeddings()
        
        # Fashion knowledge base for contextual recommendations
        self.setup_fashion_knowledge()
        
        # User preference model cache
        self.user_preference_cache = {}
        
        print(f"Enhanced AI recommendation system initialized with {len(self.products)} products")
    
    def setup_embeddings(self):
        """Set up the combined embeddings (image + metadata)"""
        # Extract image embeddings
        print("Generating image embeddings...")
        self.image_embeddings = self.generate_image_embeddings()
        
        # Extract and encode metadata
        print("Processing metadata embeddings...")
        self.metadata_features = self.extract_metadata_features()
        
        # Combine embeddings
        print("Creating hybrid embeddings...")
        self.combined_embeddings = self.create_combined_embeddings()
        
        print(f"Embeddings setup complete for {len(self.combined_embeddings)} products")
    
    def generate_image_embeddings(self):
        """Generate embeddings for product images using a simulated model"""
        # In a real implementation, this would use a pre-trained vision model
        # For this implementation, we'll create simulated embeddings
        
        embeddings = {}
        embedding_dim = 512  # Simulated embedding dimension
        
        for product in self.products:
            product_id = product['id']
            
            # Create a deterministic but unique embedding for each product
            # based on its attributes to ensure consistency
            seed = hash(f"{product_id}_{product.get('articleType', '')}_{product.get('baseColour', '')}")
            np.random.seed(seed)
            
            # Generate embedding vector
            embedding = np.random.normal(0, 1, embedding_dim)
            
            # Normalize the embedding
            if np.linalg.norm(embedding) > 0:
                embedding = embedding / np.linalg.norm(embedding)
            
            embeddings[product_id] = embedding
        
        return embeddings
    
    def extract_metadata_features(self):
        """Extract and encode metadata features from products"""
        # Create a DataFrame from the products
        df = pd.DataFrame(self.products)
        
        # Select categorical features
        categorical_features = ['gender', 'masterCategory', 'subCategory', 
                                'articleType', 'baseColour', 'season', 'usage']
        
        # For each categorical feature, create one-hot encoding
        encoded_features = {}
        
        for feature in categorical_features:
            if feature in df.columns:
                # Get unique values and create encoder
                values = df[feature].fillna('unknown').astype(str).values
                values = values.reshape(-1, 1) if hasattr(values, 'reshape') else np.array(values).reshape(-1, 1)
                encoder = OneHotEncoder(sparse_output=False)
                encoder.fit(values)
                
                # Encode each product
                encoded = {}
                for product in self.products:
                    product_id = product['id']
                    value = product.get(feature, 'unknown')
                    if value is None:
                        value = 'unknown'
                    value_encoded = encoder.transform([[str(value)]])[0]
                    encoded[product_id] = value_encoded
                
                encoded_features[feature] = encoded
        
        return encoded_features
    
    def create_combined_embeddings(self):
        """Combine image embeddings with metadata features"""
        combined = {}
        
        for product in self.products:
            product_id = product['id']
            
            # Get image embedding
            img_embedding = self.image_embeddings.get(product_id, np.zeros(512))
            
            # Combine all metadata features
            meta_features = []
            for feature_name, feature_dict in self.metadata_features.items():
                if product_id in feature_dict:
                    meta_features.append(feature_dict[product_id])
            
            # Flatten metadata features into a single vector
            if meta_features:
                meta_vector = np.concatenate(meta_features)
            else:
                meta_vector = np.array([])
            
            # Normalize metadata vector
            if meta_vector.size > 0 and np.linalg.norm(meta_vector) > 0:
                meta_vector = meta_vector / np.linalg.norm(meta_vector)
            
            # Combine image and metadata with adaptive weighting
            # Visual features get higher weight for visually-driven categories like fashion
            combined_vector = np.concatenate([img_embedding * 0.7, meta_vector * 0.3])
            
            # Normalize the combined vector
            if np.linalg.norm(combined_vector) > 0:
                combined_vector = combined_vector / np.linalg.norm(combined_vector)
            
            combined[product_id] = combined_vector
        
        return combined
    
    def setup_fashion_knowledge(self):
        """Set up fashion knowledge base for contextual recommendations"""
        # Define complementary categories
        self.complementary_items = {
            'Shirts': ['Jeans', 'Trousers', 'Shorts'],
            'Tshirts': ['Jeans', 'Shorts', 'Skirts'],
            'Tops': ['Jeans', 'Skirts', 'Shorts', 'Trousers'],
            'Jeans': ['Shirts', 'Tshirts', 'Tops', 'Sweaters'],
            'Trousers': ['Shirts', 'Blazers', 'Sweaters'],
            'Skirts': ['Tops', 'Tshirts', 'Blouses'],
            'Dresses': ['Jackets', 'Cardigans'],
            'Sweaters': ['Jeans', 'Trousers'],
            'Jackets': ['Jeans', 'Trousers', 'Dresses'],
            'Blazers': ['Trousers', 'Shirts'],
        }
        
        # Define color compatibility
        self.color_compatibility = {
            'Black': ['White', 'Red', 'Blue', 'Grey', 'Pink'],
            'White': ['Black', 'Blue', 'Red', 'Brown', 'Navy Blue'],
            'Blue': ['White', 'Grey', 'Brown', 'Black'],
            'Red': ['Black', 'White', 'Navy Blue'],
            'Grey': ['Black', 'Blue', 'Pink', 'Purple'],
            'Green': ['White', 'Beige', 'Grey', 'Black'],
            'Pink': ['White', 'Grey', 'Navy Blue', 'Black'],
            'Navy Blue': ['White', 'Red', 'Pink', 'Grey'],
            'Brown': ['White', 'Blue', 'Beige'],
            'Beige': ['Brown', 'Black', 'Blue', 'Green'],
            'Purple': ['White', 'Grey', 'Black'],
            'Yellow': ['White', 'Grey', 'Navy Blue', 'Black'],
            'Orange': ['White', 'Blue', 'Black'],
        }
        
        # Define style categories
        self.style_categories = {
            'Casual': ['Tshirts', 'Jeans', 'Sneakers', 'Shorts', 'Hoodies'],
            'Formal': ['Shirts', 'Trousers', 'Blazers', 'Suits', 'Formal Shoes'],
            'Athletic': ['Sports Shoes', 'Track Pants', 'Sports Bra', 'Sweatshirts'],
            'Bohemian': ['Maxi Dresses', 'Flowy Skirts', 'Printed Tops'],
            'Minimalist': ['Simple Shirts', 'Basic Tshirts', 'Solid Trousers'],
        }
    
    def compute_similarity(self, embedding1, embedding2):
        """Compute cosine similarity between two embeddings"""
        return np.dot(embedding1, embedding2) / (np.linalg.norm(embedding1) * np.linalg.norm(embedding2))
    
    def get_recommendations_for_product(self, product_id, top_k=8, exclude_ids=None):
        """Get recommendations similar to a specific product"""
        if exclude_ids is None:
            exclude_ids = set()
        else:
            exclude_ids = set(exclude_ids)
        
        if product_id not in self.combined_embeddings:
            print(f"Warning: No embedding found for product {product_id}")
            return []
        
        # Get the product details
        product = self.product_dict.get(product_id)
        if not product:
            return []
        
        # Get the product embedding
        target_embedding = self.combined_embeddings[product_id]
        
        # Find similar products
        similarities = []
        complementary_items = []
        
        for pid, embedding in self.combined_embeddings.items():
            if pid != product_id and pid not in exclude_ids:
                # Get the candidate product
                candidate = self.product_dict.get(pid)
                if not candidate:
                    continue
                
                # Compute embedding similarity
                similarity = self.compute_similarity(target_embedding, embedding)
                
                # Check if this is a complementary item
                is_complementary = False
                if product.get('articleType') in self.complementary_items:
                    if candidate.get('articleType') in self.complementary_items[product.get('articleType')]:
                        is_complementary = True
                        # Add to complementary items list
                        complementary_items.append((pid, similarity, "Completes your look"))
                
                # Add to general similarities if not complementary
                if not is_complementary:
                    similarities.append((pid, similarity, "Similar style"))
        
        # Sort by similarity (descending)
        similarities.sort(key=lambda x: x[1], reverse=True)
        complementary_items.sort(key=lambda x: x[1], reverse=True)
        
        # Combine recommendations: some similar items and some complementary items
        similar_count = min(top_k - 2, len(similarities))
        complementary_count = min(2, len(complementary_items))
        
        top_similar = similarities[:similar_count]
        top_complementary = complementary_items[:complementary_count]
        
        # Combine the lists
        combined_recommendations = top_similar + top_complementary
        
        # Sort again by similarity
        combined_recommendations.sort(key=lambda x: x[1], reverse=True)
        combined_recommendations = combined_recommendations[:top_k]
        
        # Return the actual product objects with similarity scores and reasons
        recommended_products = []
        
        for pid, similarity, reason in combined_recommendations:
            if pid in self.product_dict:
                product = self.product_dict[pid].copy()
                product['similarityScore'] = float(similarity)
                product['recommendationReason'] = reason
                recommended_products.append(product)
        
        return recommended_products
    
    def build_user_preference_model(self, liked_product_ids, disliked_product_ids=None, viewed_product_ids=None):
        """Build a comprehensive user preference model based on interactions"""
        if disliked_product_ids is None:
            disliked_product_ids = []
        
        if viewed_product_ids is None:
            viewed_product_ids = []
        
        # Initialize preference vectors
        preference_embedding = None
        preference_count = 0
        
        # Collect category, color, and style preferences
        category_preferences = Counter()
        color_preferences = Counter()
        gender_preferences = Counter()
        
        # Process liked products with highest weight
        for pid in liked_product_ids:
            if pid in self.combined_embeddings:
                # Add to preference embedding
                if preference_embedding is None:
                    preference_embedding = self.combined_embeddings[pid].copy() * 1.0  # Full weight
                else:
                    preference_embedding += self.combined_embeddings[pid] * 1.0  # Full weight
                preference_count += 1
                
                # Add to category and color preferences
                if pid in self.product_dict:
                    product = self.product_dict[pid]
                    category_preferences[product.get('articleType', 'unknown')] += 3
                    category_preferences[product.get('subCategory', 'unknown')] += 2
                    color_preferences[product.get('baseColour', 'unknown')] += 3
                    gender_preferences[product.get('gender', 'unknown')] += 3
        
        # Process viewed products with medium weight
        for pid in viewed_product_ids:
            if pid in self.combined_embeddings and pid not in liked_product_ids and pid not in disliked_product_ids:
                # Add to preference embedding with lower weight
                if preference_embedding is None:
                    preference_embedding = self.combined_embeddings[pid].copy() * 0.3  # Lower weight
                else:
                    preference_embedding += self.combined_embeddings[pid] * 0.3  # Lower weight
                preference_count += 0.3
                
                # Add to category and color preferences with lower weight
                if pid in self.product_dict:
                    product = self.product_dict[pid]
                    category_preferences[product.get('articleType', 'unknown')] += 1
                    color_preferences[product.get('baseColour', 'unknown')] += 1
                    gender_preferences[product.get('gender', 'unknown')] += 1
        
        # Process disliked products (negative signal)
        negative_embedding = None
        negative_count = 0
        
        for pid in disliked_product_ids:
            if pid in self.combined_embeddings:
                # Add to negative embedding
                if negative_embedding is None:
                    negative_embedding = self.combined_embeddings[pid].copy()
                else:
                    negative_embedding += self.combined_embeddings[pid]
                negative_count += 1
                
                # Remove from preferences
                if pid in self.product_dict:
                    product = self.product_dict[pid]
                    category_preferences[product.get('articleType', 'unknown')] -= 2
                    color_preferences[product.get('baseColour', 'unknown')] -= 2
        
        # If we have both positive and negative signals, adjust the preference embedding
        if preference_embedding is not None and negative_embedding is not None and negative_count > 0:
            # Normalize negative embedding
            negative_embedding = negative_embedding / negative_count
            
            # Move preference embedding away from negative embedding
            preference_embedding -= negative_embedding * 0.5  # Partial subtraction
        
        # Normalize the final preference embedding
        if preference_embedding is not None and preference_count > 0:
            preference_embedding = preference_embedding / preference_count
            if np.linalg.norm(preference_embedding) > 0:
                preference_embedding = preference_embedding / np.linalg.norm(preference_embedding)
        
        # Get top preferences
        top_categories = [cat for cat, _ in category_preferences.most_common(3)]
        top_colors = [color for color, _ in color_preferences.most_common(3)]
        top_gender = gender_preferences.most_common(1)[0][0] if gender_preferences else "unknown"
        
        return {
            'embedding': preference_embedding,
            'top_categories': top_categories,
            'top_colors': top_colors,
            'preferred_gender': top_gender,
            'has_preferences': preference_embedding is not None
        }
    
    def get_recommendations_for_user(self, user_id, liked_product_ids, disliked_product_ids=None, 
                                    viewed_product_ids=None, top_k=8):
        """Get personalized recommendations based on a user's interactions"""
        if not liked_product_ids and not viewed_product_ids:
            print("Warning: No interaction data provided for user recommendations")
            return self.get_default_recommendations(top_k)
        
        if disliked_product_ids is None:
            disliked_product_ids = []
        
        if viewed_product_ids is None:
            viewed_product_ids = []
        
        # Build or retrieve user preference model
        if user_id in self.user_preference_cache:
            # Check if cache needs update
            cached_model = self.user_preference_cache[user_id]
            if (set(cached_model['liked_ids']) == set(liked_product_ids) and
                set(cached_model['disliked_ids']) == set(disliked_product_ids) and
                set(cached_model['viewed_ids']) == set(viewed_product_ids)):
                # Cache is valid, use it
                user_model = cached_model['model']
            else:
                # Cache needs update
                user_model = self.build_user_preference_model(
                    liked_product_ids, disliked_product_ids, viewed_product_ids)
                # Update cache
                self.user_preference_cache[user_id] = {
                    'model': user_model,
                    'liked_ids': liked_product_ids.copy(),
                    'disliked_ids': disliked_product_ids.copy(),
                    'viewed_ids': viewed_product_ids.copy()
                }
        else:
            # Build new model
            user_model = self.build_user_preference_model(
                liked_product_ids, disliked_product_ids, viewed_product_ids)
            # Cache it
            self.user_preference_cache[user_id] = {
                'model': user_model,
                'liked_ids': liked_product_ids.copy(),
                'disliked_ids': disliked_product_ids.copy(),
                'viewed_ids': viewed_product_ids.copy()
            }
        
        # If no valid preferences, return default recommendations
        if not user_model['has_preferences']:
            return self.get_default_recommendations(top_k)
        
        # Get user embedding
        user_embedding = user_model['embedding']
        
        # Find products similar to the user embedding
        exclude_ids = set(liked_product_ids + disliked_product_ids)
        similarities = []
        complementary_items = []
        
        for pid, embedding in self.combined_embeddings.items():
            if pid not in exclude_ids:
                # Get the candidate product
                candidate = self.product_dict.get(pid)
                if not candidate:
                    continue
                
                # Skip products with wrong gender if user has clear preference
                if (user_model['preferred_gender'] != "unknown" and 
                    candidate.get('gender') != user_model['preferred_gender'] and
                    candidate.get('gender') != "Unisex"):
                    continue
                
                # Compute embedding similarity
                similarity = self.compute_similarity(user_embedding, embedding)
                
                # Check if this is a complementary item to any liked item
                is_complementary = False
                for liked_id in liked_product_ids:
                    if liked_id in self.product_dict:
                        liked_product = self.product_dict[liked_id]
                        if liked_product.get('articleType') in self.complementary_items:
                            if candidate.get('articleType') in self.complementary_items[liked_product.get('articleType')]:
                                is_complementary = True
                                # Check color compatibility
                                if (liked_product.get('baseColour') in self.color_compatibility and
                                    candidate.get('baseColour') in self.color_compatibility[liked_product.get('baseColour')]):
                                    # Boost score for color-compatible items
                                    similarity *= 1.2
                                complementary_items.append((pid, similarity, f"Pairs well with your {liked_product.get('articleType')}"))
                                break
                
                # Add to general similarities if not complementary
                if not is_complementary:
                    # Check if product matches user's top categories or colors
                    reason = "Matches your style"
                    if candidate.get('articleType') in user_model['top_categories']:
                        reason = f"Matches your preferred {candidate.get('articleType')} style"
                        similarity *= 1.1  # Boost for category match
                    elif candidate.get('baseColour') in user_model['top_colors']:
                        reason = f"In your preferred {candidate.get('baseColour')} color"
                        similarity *= 1.05  # Boost for color match
                    
                    similarities.append((pid, similarity, reason))
        
        # Sort by similarity (descending)
        similarities.sort(key=lambda x: x[1], reverse=True)
        complementary_items.sort(key=lambda x: x[1], reverse=True)
        
        # Combine recommendations: some similar items and some complementary items
        similar_count = min(top_k - min(3, len(complementary_items)), len(similarities))
        complementary_count = min(3, len(complementary_items))
        
        top_similar = similarities[:similar_count]
        top_complementary = complementary_items[:complementary_count]
        
        # Combine the lists
        combined_recommendations = top_similar + top_complementary
        
        # Sort again by similarity
        combined_recommendations.sort(key=lambda x: x[1], reverse=True)
        combined_recommendations = combined_recommendations[:top_k]
        
        # Return the actual product objects with similarity scores and reasons
        recommended_products = []
        
        for pid, similarity, reason in combined_recommendations:
            if pid in self.product_dict:
                product = self.product_dict[pid].copy()
                product['similarityScore'] = float(similarity)
                product['recommendationReason'] = reason
                product['isRecommended'] = True
                recommended_products.append(product)
        
        return recommended_products
    
    def get_recommendations_from_quiz(self, quiz_answers, top_k=8):
        """Generate recommendations based on quiz answers"""
        # Extract preferences from quiz answers
        style_preference = None
        color_preference = None
        occasion = None
        
        for answer in quiz_answers:
            if answer.get('questionId') == 'style_preference':
                style_preference = answer.get('response')
            elif answer.get('questionId') == 'color_preference':
                color_preference = answer.get('response')
            elif answer.get('questionId') == 'occasion':
                occasion = answer.get('response')
        
        # Define mappings for quiz answers
        style_mapping = {
            'minimalist': ['Minimalist', 'Clean', 'Simple'],
            'casual': ['Casual', 'Everyday', 'Relaxed'],
            'formal': ['Formal', 'Business', 'Elegant'],
            'athletic': ['Sports', 'Active', 'Athletic'],
            'bohemian': ['Bohemian', 'Boho', 'Ethnic']
        }
        
        color_mapping = {
            'neutral': ['Black', 'White', 'Grey', 'Navy Blue', 'Beige', 'Brown'],
            'vibrant': ['Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple', 'Pink'],
            'pastel': ['Pink', 'Light Blue', 'Mint', 'Lavender', 'Peach', 'Sky Blue']
        }
        
        occasion_mapping = {
            'everyday': ['Casual'],
            'work': ['Formal', 'Office'],
            'special': ['Ethnic', 'Formal', 'Party'],
            'athletic': ['Sports', 'Active']
        }
        
        # Score each product based on quiz matches
        scored_products = []
        
        for product in self.products:
            score = 0
            reasons = []
            
            # Match style preference
            if style_preference and style_preference in style_mapping:
                for style_keyword in style_mapping[style_preference]:
                    if (style_keyword.lower() in product.get('usage', '').lower() or 
                        style_keyword.lower() in product.get('productDisplayName', '').lower()):
                        score += 3
                        reasons.append(f"Matches {style_preference} style")
                        break
            
            # Match color preference
            if color_preference and color_preference in color_mapping:
                if product.get('baseColour') in color_mapping[color_preference]:
                    score += 2
                    reasons.append(f"In your preferred {color_preference} palette")
            
            # Match occasion
            if occasion and occasion in occasion_mapping:
                for occasion_keyword in occasion_mapping[occasion]:
                    if occasion_keyword.lower() in product.get('usage', '').lower():
                        score += 2
                        reasons.append(f"Perfect for {occasion} occasions")
                        break
            
            # Add small random factor for variety
            score += random.uniform(0, 0.5)
            
            # Only include products with some match
            if score > 1:
                scored_products.append((product, score, reasons[0] if reasons else "Matches your preferences"))
        
        # Sort by score (descending) and take top products
        scored_products.sort(key=lambda x: x[1], reverse=True)
        top_products = scored_products[:top_k]
        
        # Return the recommended products with reasons
        recommended_products = []
        
        for product, score, reason in top_products:
            product_copy = product.copy()
            product_copy['similarityScore'] = float(score)
            product_copy['recommendationReason'] = reason
            product_copy['isRecommended'] = True
            recommended_products.append(product_copy)
        
        return recommended_products
    
    def get_default_recommendations(self, top_k=8):
        """Get default recommendations for new users"""
        # For new users, recommend popular/diverse items
        # In a real system, this would use actual popularity metrics
        
        # Get a diverse set of products across categories
        categories = {}
        for product in self.products:
            category = product.get('articleType', 'unknown')
            if category not in categories:
                categories[category] = []
            categories[category].append(product)
        
        # Take a few products from each major category
        recommendations = []
        for category, products in categories.items():
            if len(products) > 0:
                # Take up to 2 products from each category
                category_picks = random.sample(products, min(2, len(products)))
                recommendations.extend(category_picks)
                
                # Stop if we have enough recommendations
                if len(recommendations) >= top_k * 2:
                    break
        
        # If we still need more, add random products
        if len(recommendations) < top_k:
            remaining = random.sample(self.products, min(top_k - len(recommendations), len(self.products)))
            recommendations.extend(remaining)
        
        # Shuffle and limit to top_k
        random.shuffle(recommendations)
        recommendations = recommendations[:top_k]
        
        # Add recommendation metadata
        for product in recommendations:
            product_copy = product.copy()
            product_copy['recommendationReason'] = "Popular item"
            product_copy['isRecommended'] = True
            product_copy['similarityScore'] = 1.0
        
        return recommendations
