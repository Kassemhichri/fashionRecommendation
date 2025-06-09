from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.quiz_service import QuizService

quiz_bp = Blueprint('quiz', __name__)

@quiz_bp.route('/questions', methods=['GET'])
def get_quiz_questions():
    """Get all quiz questions"""
    try:
        questions = QuizService.get_quiz_questions()
        return jsonify(questions), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@quiz_bp.route('/responses', methods=['POST'])
@jwt_required()
def submit_quiz_responses():
    """Submit user's quiz responses"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data or 'responses' not in data:
            return jsonify({'message': 'No responses provided'}), 400
        
        responses = data.get('responses')
        
        if not isinstance(responses, list):
            return jsonify({'message': 'Responses must be a list of objects'}), 400
        
        created_responses = QuizService.submit_quiz_responses(user_id, responses)
        
        return jsonify({
            'message': 'Quiz responses submitted successfully',
            'count': len(created_responses)
        }), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@quiz_bp.route('/responses', methods=['GET'])
@jwt_required()
def get_quiz_responses():
    """Get quiz responses for current user"""
    try:
        user_id = get_jwt_identity()
        responses = QuizService.get_user_quiz_responses(user_id)
        return jsonify(responses), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@quiz_bp.route('/status', methods=['GET'])
@jwt_required()
def get_quiz_status():
    """Check if user has completed the quiz"""
    try:
        user_id = get_jwt_identity()
        has_completed = QuizService.has_completed_quiz(user_id)
        return jsonify({
            'hasCompleted': has_completed
        }), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500
