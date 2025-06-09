from models.quiz import QuizResponse, QUIZ_QUESTIONS

class QuizService:
    @staticmethod
    def get_quiz_questions():
        """Get all quiz questions"""
        return QUIZ_QUESTIONS
    
    @staticmethod
    def submit_quiz_responses(user_id, responses):
        """Submit user's quiz responses"""
        # Delete previous responses for this user
        QuizResponse.delete_by_user_id(user_id)
        
        # Create new responses
        created_responses = []
        for response in responses:
            question_id = response.get('questionId')
            response_value = response.get('response')
            
            if not question_id or not response_value:
                continue
                
            # Validate that question exists
            valid_question = any(q['id'] == question_id for q in QUIZ_QUESTIONS)
            if not valid_question:
                continue
                
            # Create response in database
            quiz_response = QuizResponse.create(user_id, question_id, response_value)
            created_responses.append(quiz_response)
        
        return created_responses
    
    @staticmethod
    def get_user_quiz_responses(user_id):
        """Get quiz responses for a user"""
        responses = QuizResponse.get_by_user_id(user_id)
        
        # Format responses for frontend
        formatted_responses = []
        for response in responses:
            formatted_responses.append({
                'questionId': response.question_id,
                'response': response.response
            })
            
        return formatted_responses
    
    @staticmethod
    def has_completed_quiz(user_id):
        """Check if user has completed the quiz"""
        responses = QuizResponse.get_by_user_id(user_id)
        return len(responses) > 0
