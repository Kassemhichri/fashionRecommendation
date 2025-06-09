"""
API endpoint for enhanced AI-powered recommendations
"""

from flask import Blueprint, jsonify, request
from services.enhanced_ai_recommendation_service import EnhancedAIRecommendationService
from services.product_service import get_all_products
import json

# Create blueprint
enhanced_recommendations_bp = Blueprint('enhanced_recommendations', __name__)

# Initialize recommendation service (lazy loading)
_recommendation_service = None

def get_recommendation_service():
    """Get or initialize the recommendation service"""
    global _recommendation_service
    if _recommendation_service is None:
        # Get all products
        products = get_all_products(filters=None, sort=None, page=1, limit=1000)['products']
        # Initialize service
        _recommendation_service = EnhancedAIRecommendationService(products)
    return _recommendation_service

@enhanced_recommendations_bp.route('/api/enhanced-recommendations', methods=['GET'])
def get_enhanced_recommendations():
    """Get enhanced AI-powered recommendations based on user interactions"""
    try:
        # Get query parameters
        user_id = request.args.get('userId', 'demo')
        
        # Get recommendation service
        recommendation_service = get_recommendation_service()
        
        # Get user's interactions from request or database
        liked_product_ids = request.args.get('likedProducts', '').split(',')
        liked_product_ids = [pid for pid in liked_product_ids if pid]
        
        disliked_product_ids = request.args.get('dislikedProducts', '').split(',')
        disliked_product_ids = [pid for pid in disliked_product_ids if pid]
        
        viewed_product_ids = request.args.get('viewedProducts', '').split(',')
        viewed_product_ids = [pid for pid in viewed_product_ids if pid]
        
        # Get recommendations
        recommendations = recommendation_service.get_recommendations_for_user(
            user_id, liked_product_ids, disliked_product_ids, viewed_product_ids
        )
        
        # Return recommendations
        return jsonify({
            'success': True,
            'recommendations': recommendations,
            'recommendationType': 'enhanced-ai',
            'message': 'Enhanced AI-powered recommendations',
            'basedOn': {
                'likes': len(liked_product_ids),
                'dislikes': len(disliked_product_ids),
                'views': len(viewed_product_ids)
            }
        })
    except Exception as e:
        print(f"Error generating enhanced recommendations: {e}")
        return jsonify({
            'success': False,
            'message': f'Failed to generate recommendations: {str(e)}'
        }), 500

@enhanced_recommendations_bp.route('/api/enhanced-recommendations/product/<product_id>', methods=['GET'])
def get_product_recommendations(product_id):
    """Get recommendations similar to a specific product"""
    try:
        # Get recommendation service
        recommendation_service = get_recommendation_service()
        
        # Get recommendations
        recommendations = recommendation_service.get_recommendations_for_product(product_id)
        
        # Return recommendations
        return jsonify({
            'success': True,
            'recommendations': recommendations,
            'recommendationType': 'product-based',
            'message': f'Products similar to {product_id}'
        })
    except Exception as e:
        print(f"Error generating product recommendations: {e}")
        return jsonify({
            'success': False,
            'message': f'Failed to generate recommendations: {str(e)}'
        }), 500

@enhanced_recommendations_bp.route('/api/enhanced-recommendations/quiz', methods=['POST'])
def get_quiz_recommendations():
    """Get recommendations based on quiz answers"""
    try:
        # Get quiz answers from request body
        data = request.get_json()
        quiz_answers = data.get('answers', [])
        
        # Get recommendation service
        recommendation_service = get_recommendation_service()
        
        # Get recommendations
        recommendations = recommendation_service.get_recommendations_from_quiz(quiz_answers)
        
        # Return recommendations
        return jsonify({
            'success': True,
            'recommendations': recommendations,
            'recommendationType': 'quiz-based',
            'message': 'Recommendations based on your quiz answers'
        })
    except Exception as e:
        print(f"Error generating quiz recommendations: {e}")
        return jsonify({
            'success': False,
            'message': f'Failed to generate recommendations: {str(e)}'
        }), 500
