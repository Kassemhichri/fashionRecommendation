from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.interaction import Interaction

interactions_bp = Blueprint('interactions', __name__)

@interactions_bp.route('/like', methods=['POST'])
@jwt_required()
def toggle_like():
    """Toggle like status for a product"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({'message': 'No input data provided'}), 400
        
        product_id = data.get('productId')
        interaction_type = data.get('interactionType')
        
        if not product_id:
            return jsonify({'message': 'Product ID is required'}), 400
        
        if interaction_type not in ['like', 'dislike']:
            return jsonify({'message': 'Interaction type must be "like" or "dislike"'}), 400
        
        # Delete any existing like/dislike for this product
        Interaction.delete_like_dislike(user_id, product_id)
        
        # Create new interaction
        interaction = Interaction.create(user_id, product_id, interaction_type)
        
        return jsonify({
            'message': f'Product {interaction_type}d successfully',
            'interaction': interaction.to_dict()
        }), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@interactions_bp.route('/view', methods=['POST'])
@jwt_required()
def record_view():
    """Record a product view"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({'message': 'No input data provided'}), 400
        
        product_id = data.get('productId')
        
        if not product_id:
            return jsonify({'message': 'Product ID is required'}), 400
        
        # Create view interaction
        interaction = Interaction.create(user_id, product_id, 'view')
        
        return jsonify({
            'message': 'Product view recorded successfully',
            'interaction': interaction.to_dict()
        }), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@interactions_bp.route('/likes', methods=['GET'])
@jwt_required()
def get_liked_products():
    """Get all products liked by the user"""
    try:
        user_id = get_jwt_identity()
        
        # Get all liked product IDs
        liked_products = Interaction.get_liked_products(user_id)
        
        return jsonify(liked_products), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500
