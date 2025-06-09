"""
Simple chatbot service for Fashion Finder
"""

import re
import random
from datetime import datetime

class FashionChatbot:
    def __init__(self):
        """Initialize the chatbot with fashion knowledge"""
        # Define fashion knowledge base
        self.fashion_knowledge = {
            'styles': {
                'casual': 'Casual style is relaxed, comfortable, and suitable for everyday wear.',
                'formal': 'Formal style is elegant and sophisticated, suitable for professional or special occasions.',
                'athletic': 'Athletic style focuses on comfortable, functional clothing suitable for sports and active lifestyles.',
                'bohemian': 'Bohemian style is free-spirited and characterized by mixed patterns, flowy fabrics, and earthy elements.',
                'minimalist': 'Minimalist style focuses on simplicity, clean lines, and a neutral color palette.'
            },
            'occasions': {
                'work': 'For work, consider professional attire like blazers, button-up shirts, trousers, or appropriate dresses.',
                'casual': 'For casual outings, jeans, t-shirts, casual dresses, and comfortable shoes work well.',
                'formal': 'For formal events, consider suits, formal dresses, dress shoes, and elegant accessories.',
                'date': 'For dates, try something that makes you feel confident - perhaps a nice shirt or blouse with jeans or a casual dress.',
                'workout': 'For workouts, choose moisture-wicking fabrics, comfortable athletic shoes, and clothes that allow movement.'
            },
            'seasonal': {
                'summer': 'For summer, lightweight fabrics like cotton and linen help stay cool. Consider shorts, t-shirts, sundresses, and sandals.',
                'winter': 'For winter, focus on layering with sweaters, jackets, scarves, and boots to stay warm while looking stylish.',
                'spring': 'For spring, light layers work well as the weather transitions. Try light jackets, cardigans, and versatile pieces.',
                'fall': 'For fall, layering is key with items like light sweaters, jackets, boots, and clothes in warm autumn colors.'
            },
            'care': {
                'washing': 'Always check garment care labels. Separate colors, use appropriate water temperatures, and consider hand washing delicate items.',
                'drying': 'Some items should be air-dried to prevent shrinking or damage. Always check the care label.',
                'ironing': 'Iron clothes inside out when possible, and use the appropriate temperature setting for the fabric.',
                'storage': 'Hang structured items like blazers, fold knits to prevent stretching, and store seasonal items properly.'
            }
        }
        
        # Define greeting responses
        self.greetings = [
            "Hello! How can I help with your fashion questions today?",
            "Hi there! Looking for fashion advice?",
            "Welcome to Fashion Finder! What can I help you with?",
            "Hey! I'm here to help with your style questions."
        ]
        
        # Define fallback responses
        self.fallbacks = [
            "I'm not sure I understand. Could you ask about fashion styles, outfit recommendations, or clothing care?",
            "I didn't quite catch that. I can help with fashion advice, outfit ideas, or how to care for your clothes.",
            "Sorry, I'm still learning! Try asking about different styles, what to wear for occasions, or seasonal fashion tips.",
            "I'm a fashion assistant, so I'm best at answering questions about clothing, styles, and outfit recommendations."
        ]
        
        # Define response patterns
        self.patterns = [
            # Greetings
            (r'\b(hi|hello|hey|greetings)\b', self._handle_greeting),
            
            # Questions about styles
            (r'what is (casual|formal|athletic|bohemian|minimalist) style', self._handle_style_question),
            (r'tell me about (casual|formal|athletic|bohemian|minimalist) style', self._handle_style_question),
            (r'how (can|do) I (dress|look) (casual|formal|athletic|bohemian|minimalist)', self._handle_style_question),
            
            # Questions about occasions
            (r'what (should|can) I wear (to|for) (work|casual|formal|date|workout)', self._handle_occasion_question),
            (r'how (should|do) I dress for (work|casual|formal|date|workout)', self._handle_occasion_question),
            (r'outfit (ideas|suggestions) for (work|casual|formal|date|workout)', self._handle_occasion_question),
            
            # Seasonal fashion
            (r'what (should|can) I wear (in|during) (summer|winter|spring|fall)', self._handle_seasonal_question),
            (r'(summer|winter|spring|fall) fashion tips', self._handle_seasonal_question),
            (r'how (should|do) I dress (in|during) (summer|winter|spring|fall)', self._handle_seasonal_question),
            
            # Clothing care
            (r'how (should|do) I (wash|dry|iron|store) (my clothes|clothing)', self._handle_care_question),
            (r'(washing|drying|ironing|storage) tips for clothes', self._handle_care_question),
            (r'how to (take care of|maintain) (my clothes|clothing)', self._handle_care_question),
            
            # Recommendations
            (r'recommend', self._handle_recommendation_request),
            (r'suggest', self._handle_recommendation_request),
            (r'find me', self._handle_recommendation_request),
            
            # Quiz
            (r'(style )?quiz', self._handle_quiz_question),
            (r'take (a|the) quiz', self._handle_quiz_question),
            (r'how (can|do) I find my style', self._handle_quiz_question),
            
            # Help
            (r'help', self._handle_help_request),
            (r'what can you do', self._handle_help_request),
            (r'how (can|do) you (help|work)', self._handle_help_request)
        ]
    
    def get_response(self, message):
        """Generate a response to the user's message"""
        # Convert message to lowercase for easier matching
        message = message.lower()
        
        # Try to match the message against our patterns
        for pattern, handler in self.patterns:
            match = re.search(pattern, message)
            if match:
                return handler(match, message)
        
        # If no pattern matches, return a fallback response
        return random.choice(self.fallbacks)
    
    def _handle_greeting(self, match, message):
        """Handle greeting messages"""
        return random.choice(self.greetings)
    
    def _handle_style_question(self, match, message):
        """Handle questions about fashion styles"""
        style = match.group(1).lower()
        if style in self.fashion_knowledge['styles']:
            return self.fashion_knowledge['styles'][style]
        return f"I don't have specific information about {style} style, but I can tell you about casual, formal, athletic, bohemian, or minimalist styles."
    
    def _handle_occasion_question(self, match, message):
        """Handle questions about what to wear for different occasions"""
        occasion = match.group(3).lower()
        if occasion in self.fashion_knowledge['occasions']:
            return self.fashion_knowledge['occasions'][occasion]
        return f"I don't have specific recommendations for {occasion}, but I can suggest outfits for work, casual outings, formal events, dates, or workouts."
    
    def _handle_seasonal_question(self, match, message):
        """Handle questions about seasonal fashion"""
        season = match.group(3).lower()
        if season in self.fashion_knowledge['seasonal']:
            return self.fashion_knowledge['seasonal'][season]
        return f"I don't have specific information about {season} fashion, but I can tell you about summer, winter, spring, or fall fashion."
    
    def _handle_care_question(self, match, message):
        """Handle questions about clothing care"""
        care_type = match.group(2).lower()
        if care_type == "wash":
            care_type = "washing"
        elif care_type == "dry":
            care_type = "drying"
        elif care_type == "iron":
            care_type = "ironing"
        elif care_type == "store":
            care_type = "storage"
            
        if care_type in self.fashion_knowledge['care']:
            return self.fashion_knowledge['care'][care_type]
        return "For clothing care, I can provide tips on washing, drying, ironing, and storage. Always check the care label on your garments for specific instructions."
    
    def _handle_recommendation_request(self, match, message):
        """Handle requests for fashion recommendations"""
        return "I'd be happy to help you find something! You can try our style quiz for personalized recommendations, or browse our collection using the filters. What kind of items are you looking for today?"
    
    def _handle_quiz_question(self, match, message):
        """Handle questions about the style quiz"""
        return "Our style quiz helps find your perfect fashion matches! It's quick and fun - just answer a few questions about your preferences, and we'll recommend items tailored to your style. Would you like to take it now?"
    
    def _handle_help_request(self, match, message):
        """Handle help requests"""
        return "I'm your Fashion Finder assistant! I can help with:\n- Fashion advice and style information\n- Outfit recommendations for different occasions\n- Seasonal fashion tips\n- Clothing care guidance\n- Finding products that match your style\nJust ask me anything about fashion, or try our style quiz for personalized recommendations!"
