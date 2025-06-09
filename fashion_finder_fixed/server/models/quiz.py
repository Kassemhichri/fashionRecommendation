"""
Improved quiz system with simplified questions and better recommendation mapping
"""

import sqlite3
import os
from datetime import datetime

class QuizResponse:
    def __init__(self, id, user_id, question_id, response, created_at=None):
        self.id = id
        self.user_id = user_id
        self.question_id = question_id
        self.response = response
        self.created_at = created_at if created_at else datetime.now()
    
    @staticmethod
    def create(user_id, question_id, response):
        """Create a new quiz response in the database"""
        db_path = os.path.join(os.path.dirname(__file__), '../../data/fashionfinder.db')
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                "INSERT INTO quiz_responses (user_id, question_id, response) VALUES (?, ?, ?)",
                (user_id, question_id, response)
            )
            response_id = cursor.lastrowid
            conn.commit()
            
            # Fetch the created response
            cursor.execute(
                "SELECT id, user_id, question_id, response, created_at FROM quiz_responses WHERE id = ?",
                (response_id,)
            )
            response_data = cursor.fetchone()
            return QuizResponse(*response_data)
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()
    
    @staticmethod
    def get_by_user_id(user_id):
        """Retrieve all quiz responses for a user"""
        db_path = os.path.join(os.path.dirname(__file__), '../../data/fashionfinder.db')
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT id, user_id, question_id, response, created_at FROM quiz_responses WHERE user_id = ?",
            (user_id,)
        )
        responses_data = cursor.fetchall()
        conn.close()
        
        responses = []
        for response_data in responses_data:
            responses.append(QuizResponse(*response_data))
        return responses
    
    @staticmethod
    def delete_by_user_id(user_id):
        """Delete all quiz responses for a user"""
        db_path = os.path.join(os.path.dirname(__file__), '../../data/fashionfinder.db')
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                "DELETE FROM quiz_responses WHERE user_id = ?",
                (user_id,)
            )
            conn.commit()
            return True
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()
    
    def to_dict(self):
        """Convert quiz response object to dictionary"""
        return {
            'id': self.id,
            'userId': self.user_id,
            'questionId': self.question_id,
            'response': self.response,
            'createdAt': self.created_at
        }

# Improved quiz questions with better visual options and clearer mapping to recommendation parameters
QUIZ_QUESTIONS = [
    {
        'id': 'style_preference',
        'question': "What's your preferred style?",
        'description': "This helps us understand your overall fashion aesthetic.",
        'options': [
            {'id': 'casual', 'label': 'Casual & Comfortable', 'imgUrl': '/static/images/quiz/casual_style.jpg'},
            {'id': 'formal', 'label': 'Formal & Elegant', 'imgUrl': '/static/images/quiz/formal_style.jpg'},
            {'id': 'athletic', 'label': 'Athletic & Sporty', 'imgUrl': '/static/images/quiz/athletic_style.jpg'},
            {'id': 'minimalist', 'label': 'Minimalist & Clean', 'imgUrl': '/static/images/quiz/minimalist_style.jpg'},
            {'id': 'bohemian', 'label': 'Bohemian & Free-spirited', 'imgUrl': '/static/images/quiz/bohemian_style.jpg'}
        ]
    },
    {
        'id': 'color_preference',
        'question': 'Which color palette speaks to you?',
        'description': "Colors play a big role in defining your personal style.",
        'options': [
            {'id': 'neutral', 'label': 'Neutral Tones', 'imgUrl': '/static/images/quiz/neutral_colors.jpg'},
            {'id': 'vibrant', 'label': 'Vibrant & Bold', 'imgUrl': '/static/images/quiz/vibrant_colors.jpg'},
            {'id': 'pastel', 'label': 'Soft Pastels', 'imgUrl': '/static/images/quiz/pastel_colors.jpg'},
            {'id': 'monochrome', 'label': 'Black & White', 'imgUrl': '/static/images/quiz/monochrome_colors.jpg'},
            {'id': 'earth', 'label': 'Earth Tones', 'imgUrl': '/static/images/quiz/earth_colors.jpg'}
        ]
    },
    {
        'id': 'occasion',
        'question': 'What are you primarily shopping for?',
        'description': "This helps us recommend items that fit your lifestyle needs.",
        'options': [
            {'id': 'everyday', 'label': 'Everyday Casual', 'imgUrl': '/static/images/quiz/everyday_occasion.jpg'},
            {'id': 'work', 'label': 'Work & Professional', 'imgUrl': '/static/images/quiz/work_occasion.jpg'},
            {'id': 'special', 'label': 'Special Events', 'imgUrl': '/static/images/quiz/special_occasion.jpg'},
            {'id': 'athletic', 'label': 'Workout & Active', 'imgUrl': '/static/images/quiz/athletic_occasion.jpg'},
            {'id': 'lounge', 'label': 'Loungewear & Comfort', 'imgUrl': '/static/images/quiz/lounge_occasion.jpg'}
        ]
    },
    {
        'id': 'fit_preference',
        'question': 'What fit do you typically prefer?',
        'description': "Understanding your fit preference helps us recommend items you'll love wearing.",
        'options': [
            {'id': 'loose', 'label': 'Loose & Relaxed', 'imgUrl': '/static/images/quiz/loose_fit.jpg'},
            {'id': 'regular', 'label': 'Regular & Classic', 'imgUrl': '/static/images/quiz/regular_fit.jpg'},
            {'id': 'fitted', 'label': 'Fitted & Tailored', 'imgUrl': '/static/images/quiz/fitted_fit.jpg'},
            {'id': 'oversized', 'label': 'Oversized & Trendy', 'imgUrl': '/static/images/quiz/oversized_fit.jpg'},
            {'id': 'mixed', 'label': 'Mixed (Depends on Item)', 'imgUrl': '/static/images/quiz/mixed_fit.jpg'}
        ]
    }
]

# Mapping of quiz answers to product attributes for better recommendation accuracy
QUIZ_RECOMMENDATION_MAPPING = {
    'style_preference': {
        'casual': {
            'articleTypes': ['Tshirts', 'Jeans', 'Shorts', 'Casual Shoes'],
            'usages': ['Casual', 'Everyday']
        },
        'formal': {
            'articleTypes': ['Shirts', 'Trousers', 'Blazers', 'Formal Shoes'],
            'usages': ['Formal', 'Office']
        },
        'athletic': {
            'articleTypes': ['Sports Shoes', 'Track Pants', 'Sports Bra', 'Sweatshirts'],
            'usages': ['Sports', 'Active']
        },
        'minimalist': {
            'articleTypes': ['Simple Shirts', 'Basic Tshirts', 'Solid Trousers'],
            'usages': ['Casual', 'Minimal']
        },
        'bohemian': {
            'articleTypes': ['Maxi Dresses', 'Flowy Skirts', 'Printed Tops'],
            'usages': ['Casual', 'Ethnic']
        }
    },
    'color_preference': {
        'neutral': ['Black', 'White', 'Grey', 'Navy Blue', 'Beige', 'Brown'],
        'vibrant': ['Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple', 'Pink'],
        'pastel': ['Pink', 'Light Blue', 'Mint', 'Lavender', 'Peach', 'Sky Blue'],
        'monochrome': ['Black', 'White', 'Grey'],
        'earth': ['Brown', 'Beige', 'Olive', 'Rust', 'Tan']
    },
    'occasion': {
        'everyday': {
            'usages': ['Casual', 'Everyday'],
            'boost_categories': ['Topwear', 'Bottomwear']
        },
        'work': {
            'usages': ['Formal', 'Office'],
            'boost_categories': ['Shirts', 'Trousers', 'Blazers']
        },
        'special': {
            'usages': ['Party', 'Ethnic', 'Formal'],
            'boost_categories': ['Dresses', 'Suits']
        },
        'athletic': {
            'usages': ['Sports', 'Active'],
            'boost_categories': ['Activewear', 'Sports Shoes']
        },
        'lounge': {
            'usages': ['Loungewear', 'Home'],
            'boost_categories': ['Loungewear', 'Sleepwear']
        }
    },
    'fit_preference': {
        'loose': ['Relaxed', 'Loose', 'Comfort'],
        'regular': ['Regular', 'Classic', 'Standard'],
        'fitted': ['Slim', 'Fitted', 'Tailored'],
        'oversized': ['Oversized', 'Baggy', 'Loose'],
        'mixed': [] # No specific preference
    }
}
