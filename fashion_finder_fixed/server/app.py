"""
Integration module for the Flask app with all new features
"""

from flask import Flask, Blueprint
from api.chatbot import chatbot_bp
from api.enhanced_recommendations import enhanced_recommendations_bp
from api.quiz import quiz_bp

def create_app():
    """Create and configure the Flask application"""
    app = Flask(__name__)
    
    # Register blueprints
    app.register_blueprint(chatbot_bp, url_prefix='/api/chat')
    app.register_blueprint(enhanced_recommendations_bp)
    app.register_blueprint(quiz_bp, url_prefix='/api/quiz')
    
    # Add CORS headers
    @app.after_request
    def add_cors_headers(response):
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS'
        return response
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5001, debug=True)
