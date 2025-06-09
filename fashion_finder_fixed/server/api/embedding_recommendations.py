"""
API endpoints for embedding-based recommendations
"""

from flask import Blueprint, jsonify, request, session
import os
import json
import time
import threading
from ..services.embedding_recommendation_service import EmbeddingRecommendationService
from ..models.interaction import Interaction

# Initialize blueprint
embedding_recommendations_bp = Blueprint('embedding_recommendations', __name__)

# Global variable to store the recommendation service instance
_recommendation_service = None

# Function to convert a CSV style dictionary to our expected format
def convert_style_to_product(style):
    return {
        "id": style["id"],
        "gender": style["gender"],
        "masterCategory": style["masterCategory"],
        "subCategory": style["subCategory"],
        "articleType": style["articleType"],
        "baseColour": style["baseColour"],
        "season": style["season"],
        "year": style["year"],
        "usage": style["usage"],
        "productDisplayName": style["productDisplayName"],
        "imageUrl": f"/images/{style['id']}.jpg"
    }

# Load product data directly from the styles.csv file
def load_product_data():
    products = []
    try:
        # Find the styles CSV file
        styles_path = os.path.join(os.getcwd(), 'attached_assets', 'styles.csv')
        
        if not os.path.exists(styles_path):
            print(f"Styles CSV file not found at: {styles_path}")
            return []
        
        # Read and parse the CSV file
        with open(styles_path, 'r') as f:
            import csv
            reader = csv.DictReader(f)
            for row in reader:
                products.append(convert_style_to_product(row))
        
        print(f"Successfully loaded {len(products)} products from styles.csv")
        return products
    except Exception as e:
        print(f"Error loading product data from CSV: {e}")
        return []

# Start the recommendation service initialization in the background thread
def initialize_recommendation_service_in_background():
    global _recommendation_service
    
    try:
        print("Starting embedding recommendation service initialization in background...")
        # Load products from styles.csv
        products = load_product_data()
        
        if not products:
            print("No products loaded, cannot initialize recommendation service")
            return
        
        print(f"Initializing recommendation service with {len(products)} products")
        
        # Initialize the service with the products
        _recommendation_service = EmbeddingRecommendationService(
            products=products,
            images_dir="attached_assets/images"
        )
        
        print("Embedding recommendation service initialized successfully")
    except Exception as e:
        print(f"Error initializing recommendation service: {e}")
        _recommendation_service = None

# Initialize blueprint
embedding_recommendations_bp = Blueprint('embedding_recommendations', __name__)

# Global variable to store the recommendation service instance
_recommendation_service = None

def get_recommendation_service():
    """Get or initialize the recommendation service"""
    global _recommendation_service
    
    if _recommendation_service is None:
        # Load products from the merged products file
        merged_products_path = os.path.join('server', 'static', 'data', 'merged_products.json')
        
        try:
            with open(merged_products_path, 'r') as f:
                products = json.load(f)
            
            print(f"Loaded {len(products)} products for recommendations")
            
            # Initialize the service with the products
            _recommendation_service = EmbeddingRecommendationService(
                products=products,
                images_dir="attached_assets/images"
            )
            
            print("Embedding recommendation service initialized successfully")
        except Exception as e:
            print(f"Error initializing recommendation service: {e}")
            return None
    
    return _recommendation_service

@embedding_recommendations_bp.route('/api/embedding-recommendations', methods=['GET'])
def get_embedding_recommendations():
    """Get embedding-based recommendations for the current user"""
    try:
        # Get the recommendation service
        recommendation_service = get_recommendation_service()
        if recommendation_service is None:
            return jsonify({
                'success': False,
                'message': 'Recommendation service not available'
            }), 500
        
        # Get user ID (using a demo user for simplicity)
        user_id = session.get('user_id', 'demo-user-123')
        
        # Get user interactions
        liked_interactions = Interaction.get_user_interactions_by_type(user_id, 'like')
        disliked_interactions = Interaction.get_user_interactions_by_type(user_id, 'dislike')
        
        # Extract product IDs
        liked_product_ids = [interaction.product_id for interaction in liked_interactions]
        disliked_product_ids = [interaction.product_id for interaction in disliked_interactions]
        
        print(f"User {user_id} has liked {len(liked_product_ids)} products and disliked {len(disliked_product_ids)} products")
        
        # If no liked products, return an empty response
        if not liked_product_ids:
            return jsonify({
                'success': True,
                'recommendations': [],
                'recommendationType': 'embedding',
                'message': 'Like some products to get personalized recommendations',
                'basedOn': {}
            })
        
        # Get recommendations
        recommendations = recommendation_service.get_recommendations_for_user(
            liked_product_ids=liked_product_ids,
            disliked_product_ids=disliked_product_ids,
            top_k=8
        )
        
        # Return recommendations with metadata
        return jsonify({
            'success': True,
            'recommendations': recommendations,
            'recommendationType': 'embedding',
            'message': 'Visually similar to your style preferences',
            'basedOn': {
                'likedProducts': liked_product_ids,
                'technology': 'visual embeddings + metadata'
            }
        })
    except Exception as e:
        print(f"Error generating embedding recommendations: {e}")
        return jsonify({
            'success': False,
            'message': f'Failed to generate recommendations: {str(e)}'
        }), 500

@embedding_recommendations_bp.route('/api/embedding-similar/<product_id>', methods=['GET'])
def get_similar_products(product_id):
    """Get visually similar products to a specific product"""
    try:
        # Get the recommendation service
        recommendation_service = get_recommendation_service()
        if recommendation_service is None:
            return jsonify({
                'success': False,
                'message': 'Recommendation service not available'
            }), 500
        
        # Get user ID for getting disliked products
        user_id = session.get('user_id', 'demo-user-123')
        
        # Get disliked products to exclude them
        disliked_interactions = Interaction.get_user_interactions_by_type(user_id, 'dislike')
        disliked_product_ids = [interaction.product_id for interaction in disliked_interactions]
        
        # Get recommendations
        similar_products = recommendation_service.get_recommendations_for_product(
            product_id=product_id,
            top_k=4,
            exclude_ids=disliked_product_ids
        )
        
        # Return similar products
        return jsonify({
            'success': True,
            'similarProducts': similar_products,
            'technology': 'embedding-based similarity'
        })
    except Exception as e:
        print(f"Error finding similar products: {e}")
        return jsonify({
            'success': False,
            'message': f'Failed to find similar products: {str(e)}'
        }), 500