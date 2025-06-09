from flask import Blueprint, request, jsonify, make_response
from flask_jwt_extended import (
    jwt_required, create_access_token, 
    set_access_cookies, unset_jwt_cookies, get_jwt_identity
)
from services.auth_service import AuthService

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'message': 'No input data provided'}), 400
        
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        
        user = AuthService.register(username, email, password)
        
        # Create access token
        access_token = create_access_token(identity=user['id'])
        
        # Create response with token in cookie
        resp = jsonify({'message': 'User registered successfully', 'user': user})
        set_access_cookies(resp, access_token)
        
        return resp, 201
    except ValueError as e:
        return jsonify({'message': str(e)}), 400
    except Exception as e:
        return jsonify({'message': 'An error occurred during registration'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login a user"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'message': 'No input data provided'}), 400
        
        email = data.get('email')
        password = data.get('password')
        
        result = AuthService.login(email, password)
        
        # Create response with token in cookie
        resp = jsonify({'message': 'Login successful', 'user': result['user']})
        set_access_cookies(resp, result['access_token'])
        
        return resp, 200
    except ValueError as e:
        return jsonify({'message': str(e)}), 401
    except Exception as e:
        return jsonify({'message': 'An error occurred during login'}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Logout a user"""
    resp = jsonify({'message': 'Logout successful'})
    unset_jwt_cookies(resp)
    return resp, 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get the current authenticated user"""
    try:
        user_id = get_jwt_identity()
        user = AuthService.get_current_user(user_id)
        return jsonify(user), 200
    except ValueError as e:
        return jsonify({'message': str(e)}), 404
    except Exception as e:
        return jsonify({'message': 'An error occurred while retrieving user data'}), 500
