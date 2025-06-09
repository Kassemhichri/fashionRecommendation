"""
Simple API endpoints for embedding-based recommendations
"""

from flask import Blueprint, jsonify, request, session
import os
import json
from ..models.interaction import Interaction
from ..simple_embeddings import get_visual_recommendations, get_similar_items

# Initialize blueprint
simple_embeddings_bp = Blueprint('simple_embeddings_api', __name__)

@simple_embeddings_bp.route('/api/embedding-recommendations-status', methods=['GET'])
def get_embedding_service_status():
    """Get the status of the embedding recommendation service"""
    return jsonify({
        'status': 'ready',
        'message': 'Visual recommendation system is ready',
        'productsWithEmbeddings': -1,  # Not applicable for simple system
        'totalProducts': -1  # Not applicable for simple system
    })

@simple_embeddings_bp.route('/api/embedding-recommendations', methods=['GET'])
def get_embedding_recommendations():
    """Get embedding-based recommendations for the current user"""
    try:
        # For demo/testing, use fixed seed products
        seed_products = ['1546', '1541', '1548', '1552', '1555', '1560']
        disliked = ['1579', '1584', '1570', '1583']
        
        # Check if we should fetch products from request query parameters
        liked_param = request.args.get('liked')
        disliked_param = request.args.get('disliked')
        
        if liked_param:
            liked_product_ids = liked_param.split(',')
        else:
            # Use seed products if no liked products provided
            liked_product_ids = seed_products
        
        if disliked_param:
            disliked_product_ids = disliked_param.split(',')
        else:
            # Use fixed disliked products if none provided
            disliked_product_ids = disliked
        
        print(f"Generating visual recommendations with {len(liked_product_ids)} liked products")
        
        # If no liked products, return an empty response
        if not liked_product_ids:
            return jsonify({
                'success': True,
                'recommendations': [],
                'recommendationType': 'visual',
                'message': 'Like some products to get personalized recommendations',
                'basedOn': {}
            })
        
        # Get recommendations
        recommendations = get_visual_recommendations(
            liked_product_ids=liked_product_ids,
            disliked_product_ids=disliked_product_ids,
            top_k=8
        )
        
        # Return recommendations with metadata
        return jsonify({
            'success': True,
            'recommendations': recommendations,
            'recommendationType': 'visual',
            'message': 'Visually similar to your style preferences',
            'basedOn': {
                'likedProducts': liked_product_ids,
                'technology': 'visual similarity'
            }
        })
    except Exception as e:
        print(f"Error generating visual recommendations: {e}")
        return jsonify({
            'success': False,
            'message': f'Failed to generate recommendations: {str(e)}'
        }), 500

@simple_embeddings_bp.route('/api/embedding-similar/<product_id>', methods=['GET'])
def get_similar_products(product_id):
    """Get visually similar products to a specific product"""
    try:
        # For demo/testing, use fixed disliked products
        disliked_product_ids = ['1579', '1584', '1570', '1583']
        
        # Check if we should fetch disliked products from query parameters
        disliked_param = request.args.get('disliked')
        if disliked_param:
            disliked_product_ids = disliked_param.split(',')
        
        print(f"Finding similar products to {product_id}")
        
        # Get recommendations
        similar_products = get_similar_items(
            product_id=product_id,
            exclude_ids=disliked_product_ids,
            top_k=4
        )
        
        # Return similar products
        return jsonify({
            'success': True,
            'similarProducts': similar_products,
            'technology': 'visual similarity'
        })
    except Exception as e:
        print(f"Error finding similar products: {e}")
        return jsonify({
            'success': False,
            'message': f'Failed to find similar products: {str(e)}'
        }), 500