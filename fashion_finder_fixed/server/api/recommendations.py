from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.recommendation_service import RecommendationService
from services.quiz_service import QuizService

recommendations_bp = Blueprint('recommendations', __name__)

@recommendations_bp.route('', methods=['GET'])
@jwt_required()
def get_recommendations():
    """Get personalized recommendations for the current user"""
    try:
        user_id = get_jwt_identity()
        
        # Check if user has completed the quiz
        has_completed_quiz = QuizService.has_completed_quiz(user_id)
        
        # Get limit from query params
        limit = int(request.args.get('limit', 8))
        
        # Get recommendations
        recommendations = RecommendationService.get_recommendations_for_user(user_id, limit)
        
        # If user hasn't completed the quiz and there are no recommendations
        if not has_completed_quiz and not recommendations:
            return jsonify([]), 200
        
        return jsonify(recommendations), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500
