from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.product_service import (
    get_all_products, get_product_by_id, 
    get_similar_products, get_featured_products, search_products
)
from models.interaction import Interaction

products_bp = Blueprint('products', __name__)

@products_bp.route('', methods=['GET'])
def get_products():
    """Get products with optional filtering, sorting, and pagination"""
    try:
        # Parse query parameters for filtering
        filters = {}
        
        # Gender filter
        gender = request.args.get('gender')
        if gender:
            filters['gender'] = gender.split(',')
        
        # Category filter
        categories = request.args.get('categories')
        if categories:
            filters['categories'] = categories.split(',')
        
        # Color filter
        colors = request.args.get('colors')
        if colors:
            filters['colors'] = colors.split(',')
        
        # Usage filter
        usage = request.args.get('usage')
        if usage:
            filters['usage'] = usage.split(',')
        
        # Price range filter
        min_price = request.args.get('minPrice')
        max_price = request.args.get('maxPrice')
        if min_price is not None and max_price is not None:
            filters['priceRange'] = [int(min_price), int(max_price)]
        
        # Search filter
        search = request.args.get('search')
        if search:
            filters['search'] = search
        
        # Sorting
        sort = request.args.get('sort', 'recommended')
        
        # Pagination
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 12))
        
        # Get products
        result = get_all_products(filters, sort, page, limit)
        
        # Check if user is logged in to add liked status
        jwt_identity = get_jwt_identity()
        if jwt_identity:
            user_id = jwt_identity
            liked_products = Interaction.get_liked_products(user_id)
            
            for product in result['products']:
                product['isLiked'] = product['id'] in liked_products
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@products_bp.route('/<product_id>', methods=['GET'])
def get_product(product_id):
    """Get a specific product by ID"""
    try:
        product = get_product_by_id(product_id)
        
        if not product:
            return jsonify({'message': 'Product not found'}), 404
        
        # Check if user is logged in to add liked status
        jwt_identity = get_jwt_identity()
        if jwt_identity:
            user_id = jwt_identity
            liked_products = Interaction.get_liked_products(user_id)
            product['isLiked'] = product['id'] in liked_products
        
        return jsonify(product), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@products_bp.route('/<product_id>/similar', methods=['GET'])
def get_similar(product_id):
    """Get similar products to a specific product"""
    try:
        limit = int(request.args.get('limit', 4))
        similar_products = get_similar_products(product_id, limit)
        
        if not similar_products:
            return jsonify([]), 200
        
        # Check if user is logged in to add liked status
        jwt_identity = get_jwt_identity()
        if jwt_identity:
            user_id = jwt_identity
            liked_products = Interaction.get_liked_products(user_id)
            
            for product in similar_products:
                product['isLiked'] = product['id'] in liked_products
        
        return jsonify(similar_products), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@products_bp.route('/featured', methods=['GET'])
def get_featured():
    """Get featured products"""
    try:
        limit = int(request.args.get('limit', 8))
        featured_products = get_featured_products(limit)
        
        # Check if user is logged in to add liked status
        jwt_identity = get_jwt_identity()
        if jwt_identity:
            user_id = jwt_identity
            liked_products = Interaction.get_liked_products(user_id)
            
            for product in featured_products:
                product['isLiked'] = product['id'] in liked_products
        
        return jsonify(featured_products), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@products_bp.route('/search', methods=['GET'])
def search():
    """Search for products"""
    try:
        query = request.args.get('q', '')
        limit = int(request.args.get('limit', 20))
        
        if not query:
            return jsonify({'message': 'Query parameter "q" is required'}), 400
        
        search_results = search_products(query, limit)
        
        # Check if user is logged in to add liked status
        jwt_identity = get_jwt_identity()
        if jwt_identity:
            user_id = jwt_identity
            liked_products = Interaction.get_liked_products(user_id)
            
            for product in search_results:
                product['isLiked'] = product['id'] in liked_products
        
        return jsonify(search_results), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500
