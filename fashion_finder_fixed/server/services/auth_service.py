from models.user import User
from flask_jwt_extended import create_access_token, get_jwt_identity
import re

class AuthService:
    @staticmethod
    def register(username, email, password):
        """Register a new user"""
        # Validate input
        if not username or not email or not password:
            raise ValueError("Username, email, and password are required")
        
        # Username validation
        if len(username) < 3:
            raise ValueError("Username must be at least 3 characters long")
        if not re.match(r'^[a-zA-Z0-9_]+$', username):
            raise ValueError("Username can only contain letters, numbers, and underscores")
        
        # Email validation
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            raise ValueError("Invalid email format")
        
        # Password validation
        if len(password) < 6:
            raise ValueError("Password must be at least 6 characters long")
        
        # Check if user already exists
        if User.get_by_username(username):
            raise ValueError("Username already exists")
        if User.get_by_email(email):
            raise ValueError("Email already exists")
        
        # Create user
        user = User.create_user(username, email, password)
        return user.to_dict()
    
    @staticmethod
    def login(email, password):
        """Login a user"""
        # Validate input
        if not email or not password:
            raise ValueError("Email and password are required")
        
        # Find user
        user = User.get_by_email(email)
        if not user:
            raise ValueError("Invalid email or password")
        
        # Verify password
        if not User.verify_password(user.password, password):
            raise ValueError("Invalid email or password")
        
        # Create access token
        access_token = create_access_token(identity=user.id)
        
        return {
            'user': user.to_dict(),
            'access_token': access_token
        }
    
    @staticmethod
    def get_current_user(user_id):
        """Get current authenticated user"""
        user = User.get_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        
        return user.to_dict()
