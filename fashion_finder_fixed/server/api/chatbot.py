"""
API endpoint for chatbot functionality
"""

from flask import Blueprint, jsonify, request
from services.chatbot_service import FashionChatbot

# Create blueprint
chatbot_bp = Blueprint('chatbot', __name__)

# Initialize chatbot
chatbot = FashionChatbot()

@chatbot_bp.route('/api/chat', methods=['POST'])
def chat():
    """Process a chat message and return a response"""
    try:
        # Get message from request body
        data = request.get_json()
        message = data.get('message', '')
        
        if not message:
            return jsonify({
                'success': False,
                'message': 'No message provided'
            }), 400
        
        # Get response from chatbot
        response = chatbot.get_response(message)
        
        # Return response
        return jsonify({
            'success': True,
            'response': response
        })
    except Exception as e:
        print(f"Error processing chat message: {e}")
        return jsonify({
            'success': False,
            'message': f'Failed to process message: {str(e)}'
        }), 500
