"""
Simple embedding recommendations for FashionFinder

This module provides a simplified version of the embedding recommendation system
that doesn't rely on heavy ML libraries to make it more reliable.
"""

import os
import json
import csv
import random
import math
from collections import Counter

# Store recommendations in memory
_cached_recommendations = {}

def load_product_data():
    """Load product data from styles.csv"""
    products = []
    try:
        # Find the styles CSV file
        styles_path = os.path.join(os.getcwd(), 'attached_assets', 'styles.csv')
        
        if not os.path.exists(styles_path):
            print(f"Styles CSV file not found at: {styles_path}")
            return []
        
        # Read and parse the CSV file
        with open(styles_path, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Convert the CSV row to our product format
                product = {
                    "id": row["id"],
                    "gender": row["gender"],
                    "masterCategory": row["masterCategory"],
                    "subCategory": row["subCategory"],
                    "articleType": row["articleType"],
                    "baseColour": row["baseColour"],
                    "season": row["season"],
                    "year": row["year"],
                    "usage": row["usage"],
                    "productDisplayName": row["productDisplayName"],
                    "imageUrl": f"/images/{row['id']}.jpg"
                }
                products.append(product)
        
        print(f"Successfully loaded {len(products)} products from styles.csv")
        return products
    except Exception as e:
        print(f"Error loading product data from CSV: {e}")
        return []

def get_product_similarity(product1, product2):
    """Calculate a simple similarity score between two products"""
    score = 0
    
    # Compare categorical fields with exact matching
    if product1["gender"] == product2["gender"]:
        score += 10
    
    if product1["masterCategory"] == product2["masterCategory"]:
        score += 20
    
    if product1["subCategory"] == product2["subCategory"]:
        score += 15
    
    if product1["articleType"] == product2["articleType"]:
        score += 25
    
    if product1["baseColour"] == product2["baseColour"]:
        score += 10
    
    if product1["season"] == product2["season"]:
        score += 5
    
    if product1["usage"] == product2["usage"]:
        score += 15
    
    # Simple text similarity for product name
    words1 = set(product1["productDisplayName"].lower().split())
    words2 = set(product2["productDisplayName"].lower().split())
    common_words = words1.intersection(words2)
    score += len(common_words) * 5
    
    return score

def get_similar_products(product_id, products, top_k=4, exclude_ids=None):
    """Get similar products to a specific product"""
    if exclude_ids is None:
        exclude_ids = set()
    else:
        exclude_ids = set(exclude_ids)
    
    # Convert product_id to string to ensure consistent comparison
    product_id = str(product_id)
    exclude_ids = {str(id) for id in exclude_ids}
    
    # Find the target product
    target_product = None
    for product in products:
        if str(product["id"]) == product_id:
            target_product = product
            break
    
    if target_product is None:
        print(f"Product {product_id} not found")
        return []
    
    # Calculate similarity scores
    similarities = []
    for product in products:
        pid = str(product["id"])
        if pid != product_id and pid not in exclude_ids:
            similarity = get_product_similarity(target_product, product)
            similarities.append((product, similarity))
    
    # Sort by similarity score (descending)
    similarities.sort(key=lambda x: x[1], reverse=True)
    
    # Get the top K similar products
    result = []
    for product, score in similarities[:top_k]:
        product_copy = product.copy()
        product_copy["similarityScore"] = score
        product_copy["recommendationReason"] = "Similar style and category"
        result.append(product_copy)
    
    return result

def get_user_preferences(liked_products, products):
    """Extract user preferences from liked products"""
    preferences = {
        "categories": Counter(),
        "subCategories": Counter(),
        "articleTypes": Counter(),
        "colors": Counter(),
        "genders": Counter(),
        "usages": Counter(),
        "seasons": Counter()
    }
    
    # Build a map of product IDs to products
    product_map = {str(p["id"]): p for p in products}
    
    # Count occurrences of each attribute in liked products
    for product_id in liked_products:
        product_id = str(product_id)
        if product_id in product_map:
            product = product_map[product_id]
            preferences["categories"][product["masterCategory"]] += 1
            preferences["subCategories"][product["subCategory"]] += 1
            preferences["articleTypes"][product["articleType"]] += 1
            preferences["colors"][product["baseColour"]] += 1
            preferences["genders"][product["gender"]] += 1
            preferences["usages"][product["usage"]] += 1
            preferences["seasons"][product["season"]] += 1
    
    # Get the most common values for each preference
    top_preferences = {
        "categories": [cat for cat, _ in preferences["categories"].most_common(3)],
        "subCategories": [subcat for subcat, _ in preferences["subCategories"].most_common(3)],
        "articleTypes": [art for art, _ in preferences["articleTypes"].most_common(3)],
        "colors": [color for color, _ in preferences["colors"].most_common(3)],
        "genders": [gender for gender, _ in preferences["genders"].most_common(1)],
        "usages": [usage for usage, _ in preferences["usages"].most_common(2)],
        "seasons": [season for season, _ in preferences["seasons"].most_common(2)]
    }
    
    return top_preferences

def score_product_by_preferences(product, preferences):
    """Score a product based on user preferences"""
    score = 0
    
    # Score based on category
    if product["masterCategory"] in preferences["categories"]:
        score += 20
    
    # Score based on sub-category
    if product["subCategory"] in preferences["subCategories"]:
        score += 15
    
    # Score based on article type
    if product["articleType"] in preferences["articleTypes"]:
        score += 25
    
    # Score based on color
    if product["baseColour"] in preferences["colors"]:
        score += 10
    
    # Score based on gender (higher weight)
    if product["gender"] in preferences["genders"]:
        score += 30
    
    # Score based on usage
    if product["usage"] in preferences["usages"]:
        score += 15
    
    # Score based on season
    if product["season"] in preferences["seasons"]:
        score += 5
    
    # Add a small random factor to break ties and add variety (5% randomness)
    score += random.uniform(0, score * 0.05)
    
    return score

def get_recommendation_reasons(product, preferences):
    """Generate recommendation reasons based on matched preferences"""
    reasons = []
    
    if product["masterCategory"] in preferences["categories"]:
        reasons.append(f"Same category: {product['masterCategory']}")
    
    if product["subCategory"] in preferences["subCategories"]:
        reasons.append(f"Same subcategory: {product['subCategory']}")
    
    if product["articleType"] in preferences["articleTypes"]:
        reasons.append(f"Same type: {product['articleType']}")
    
    if product["baseColour"] in preferences["colors"]:
        reasons.append(f"Preferred color: {product['baseColour']}")
    
    if product["gender"] in preferences["genders"]:
        reasons.append(f"Same gender: {product['gender']}")
    
    if product["usage"] in preferences["usages"]:
        reasons.append(f"Same usage: {product['usage']}")
    
    if product["season"] in preferences["seasons"]:
        reasons.append(f"Same season: {product['season']}")
    
    # Add keyword-based reasons
    product_name = product["productDisplayName"].lower()
    style_keywords = [word for word in product_name.split() if len(word) > 3]
    if style_keywords:
        reasons.append(f"Style keywords: {', '.join(style_keywords)}")
    
    # Return up to 5 most important reasons
    return reasons[:5]

def get_recommendations(liked_product_ids, disliked_product_ids=None, top_k=8):
    """Get recommendations based on a user's preferences"""
    # Initialize default values
    if disliked_product_ids is None:
        disliked_product_ids = []
    
    # Convert all IDs to strings for consistent comparison
    liked_product_ids = [str(id) for id in liked_product_ids]
    disliked_product_ids = [str(id) for id in disliked_product_ids]
    
    # Load all products
    all_products = load_product_data()
    if not all_products:
        print("No products loaded, cannot generate recommendations")
        return []
    
    # Check if we have any liked products
    if not liked_product_ids:
        print("No liked products, returning random recommendations")
        # Return a few random products as recommendations
        random_products = random.sample(all_products, min(top_k, len(all_products)))
        for product in random_products:
            product["recommendationReason"] = "Popular product"
            product["similarityScore"] = 50  # Arbitrary score for random recommendations
        return random_products
    
    # Cache key based on the sorted list of liked and disliked products
    cache_key = f"{','.join(sorted(liked_product_ids))}-{','.join(sorted(disliked_product_ids))}"
    
    # Check if we have cached recommendations for this user
    if cache_key in _cached_recommendations:
        print(f"Using cached recommendations for user with {len(liked_product_ids)} liked products")
        return _cached_recommendations[cache_key]
    
    # Analyze user preferences
    preferences = get_user_preferences(liked_product_ids, all_products)
    print(f"User preferences: {preferences}")
    
    # Find the top category from user likes
    top_categories = preferences.get("categories", [])
    
    # Check if user has a strong preference for footwear
    footwear_count = sum(1 for pid in liked_product_ids 
                       if any(p["id"] == pid and p["masterCategory"] == "Footwear" 
                             for p in all_products))
    print(f"User footwear preference: {footwear_count}/{len(liked_product_ids)} liked items are footwear. "
          f"Focus on footwear: {footwear_count > len(liked_product_ids) / 3}")
    
    # Score products based on user preferences
    product_scores = []
    for product in all_products:
        product_id = str(product["id"])
        
        # Skip already liked products
        if product_id in liked_product_ids:
            print(f"Excluding already liked product {product_id} from recommendations")
            continue
        
        # Skip disliked products
        if product_id in disliked_product_ids:
            print(f"Excluding disliked product {product_id} from recommendations")
            continue
        
        # Score the product
        score = score_product_by_preferences(product, preferences)
        product_scores.append((product, score))
    
    # Sort by score (descending)
    product_scores.sort(key=lambda x: x[1], reverse=True)
    
    # Get the top candidates
    top_candidates = product_scores[:min(top_k * 2, len(product_scores))]
    print(f"Top recommendation candidates:")
    for i, (product, score) in enumerate(top_candidates[:3]):
        reasons = get_recommendation_reasons(product, preferences)
        print(f"{i+1}. {product['productDisplayName']} (Score: {score:.2f}) Reasons: {', '.join(reasons)}")
    
    # Select the final recommendations with consideration of variety
    # Try to include some products from different categories
    recommendations = []
    selected_categories = set()
    
    # First, take the top recommendations
    for product, score in top_candidates:
        # Skip if we already have enough recommendations
        if len(recommendations) >= top_k:
            break
        
        # Add variety by limiting too many items from the same category
        category = product["masterCategory"]
        if category in selected_categories and len(selected_categories) >= 3:
            # Skip if we already have 3 different categories and this is a repeat
            continue
        
        # Add this product to recommendations
        product_copy = product.copy()
        product_copy["similarityScore"] = score
        
        # Generate recommendation reasons
        reasons = get_recommendation_reasons(product, preferences)
        reason_str = ", ".join(reasons[:3])  # Take just the top 3 reasons
        product_copy["recommendationReason"] = reason_str
        
        recommendations.append(product_copy)
        selected_categories.add(category)
    
    # If we still need more recommendations, include more without category diversity check
    if len(recommendations) < top_k:
        for product, score in top_candidates:
            if len(recommendations) >= top_k:
                break
                
            # Skip already selected products
            if any(r["id"] == product["id"] for r in recommendations):
                continue
                
            # Add this product
            product_copy = product.copy()
            product_copy["similarityScore"] = score
            
            # Generate recommendation reasons
            reasons = get_recommendation_reasons(product, preferences)
            reason_str = ", ".join(reasons[:3])
            product_copy["recommendationReason"] = reason_str
            
            recommendations.append(product_copy)
    
    # Cache the recommendations
    _cached_recommendations[cache_key] = recommendations
    
    return recommendations

# Public API Functions
def get_visual_recommendations(liked_product_ids, disliked_product_ids=None, top_k=8):
    """Get visual similarity recommendations based on user likes"""
    return get_recommendations(liked_product_ids, disliked_product_ids, top_k)

def get_similar_items(product_id, exclude_ids=None, top_k=4):
    """Get similar products based on visual similarity"""
    products = load_product_data()
    return get_similar_products(product_id, products, top_k, exclude_ids)