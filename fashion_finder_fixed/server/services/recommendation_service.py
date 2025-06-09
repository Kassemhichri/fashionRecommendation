from models.quiz import QuizResponse
from models.interaction import Interaction
from services.product_service import get_all_products, get_product_by_id
import random

class RecommendationService:
    @staticmethod
    def get_recommendations_for_user(user_id, limit=8):
        """Get personalized product recommendations for a user"""
        # Get user's quiz responses
        quiz_responses = QuizResponse.get_by_user_id(user_id)
        quiz_data = {r.question_id: r.response for r in quiz_responses}
        
        # Get user's interactions
        liked_product_ids = Interaction.get_liked_products(user_id)
        
        # Get viewed products
        view_interactions = Interaction.get_user_interactions_by_type(user_id, 'view')
        viewed_product_ids = [i.product_id for i in view_interactions]
        
        # First collect all products
        all_products = get_all_products(filters=None, sort=None, page=1, limit=1000)['products']
        
        # If user has quiz responses, use them for recommendations
        if quiz_data:
            return RecommendationService._get_quiz_based_recommendations(
                all_products, quiz_data, liked_product_ids, viewed_product_ids, limit
            )
        
        # If user has likes but no quiz, use collaborative filtering approach
        if liked_product_ids:
            return RecommendationService._get_collaborative_recommendations(
                all_products, liked_product_ids, viewed_product_ids, limit
            )
        
        # If user has views but no likes or quiz, recommend similar to viewed
        if viewed_product_ids:
            return RecommendationService._get_view_based_recommendations(
                all_products, viewed_product_ids, limit
            )
        
        # Fallback to popular/featured products
        return RecommendationService._get_default_recommendations(all_products, limit)
    
    @staticmethod
    def _get_quiz_based_recommendations(products, quiz_data, liked_product_ids, viewed_product_ids, limit):
        """Get recommendations based on quiz responses"""
        # Style preference mapping
        style_preference = quiz_data.get('style_preference')
        style_mapping = {
            'minimalist': ['Minimalist', 'Clean', 'Simple'],
            'casual': ['Casual', 'Everyday', 'Relaxed'],
            'formal': ['Formal', 'Business', 'Elegant']
        }
        
        # Color preference mapping
        color_preference = quiz_data.get('color_preference')
        color_mapping = {
            'neutral': ['Black', 'White', 'Grey', 'Navy Blue', 'Beige', 'Brown'],
            'vibrant': ['Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple', 'Pink'],
            'pastel': ['Pink', 'Light Blue', 'Mint', 'Lavender', 'Peach', 'Sky Blue']
        }
        
        # Occasion mapping
        occasion = quiz_data.get('occasion')
        occasion_mapping = {
            'everyday': ['Casual'],
            'work': ['Formal'],
            'special': ['Ethnic', 'Formal']
        }
        
        # Score each product based on quiz matches
        scored_products = []
        for product in products:
            # Skip products the user has already viewed or liked
            if product['id'] in viewed_product_ids or product['id'] in liked_product_ids:
                continue
                
            score = 0
            
            # Match style preference
            if style_preference and style_preference in style_mapping:
                for style_keyword in style_mapping[style_preference]:
                    if style_keyword.lower() in product['usage'].lower() or style_keyword.lower() in product['productDisplayName'].lower():
                        score += 3
            
            # Match color preference
            if color_preference and color_preference in color_mapping:
                if product['baseColour'] in color_mapping[color_preference]:
                    score += 2
            
            # Match occasion
            if occasion and occasion in occasion_mapping:
                if product['usage'] in occasion_mapping[occasion]:
                    score += 2
            
            # Add some randomness to recommendations
            score += random.uniform(0, 1)
            
            scored_products.append((product, score))
        
        # Sort by score (descending) and take top products
        scored_products.sort(key=lambda x: x[1], reverse=True)
        top_products = [p[0] for p in scored_products[:limit]]
        
        # Add "isRecommended" flag
        for product in top_products:
            product['isRecommended'] = True
        
        return top_products
    
    @staticmethod
    def _get_collaborative_recommendations(products, liked_product_ids, viewed_product_ids, limit):
        """Get recommendations based on liked products (simple collaborative filtering)"""
        # For a real app, this would be a more sophisticated collaborative filtering algorithm
        # Here we'll just recommend products with similar attributes to the liked ones
        
        # Get the liked products details
        liked_products = [get_product_by_id(pid) for pid in liked_product_ids if get_product_by_id(pid)]
        
        # If no valid liked products, fall back to default recommendations
        if not liked_products:
            return RecommendationService._get_default_recommendations(products, limit)
        
        # Extract key attributes from liked products
        liked_categories = [p['articleType'] for p in liked_products]
        liked_colors = [p['baseColour'] for p in liked_products]
        liked_genders = [p['gender'] for p in liked_products]
        
        # Score each product based on matches with liked attributes
        scored_products = []
        for product in products:
            # Skip products the user has already viewed or liked
            if product['id'] in viewed_product_ids or product['id'] in liked_product_ids:
                continue
            
            score = 0
            
            # Match category
            if product['articleType'] in liked_categories:
                score += 2
            
            # Match color
            if product['baseColour'] in liked_colors:
                score += 1
            
            # Match gender
            if product['gender'] in liked_genders:
                score += 1
            
            # Add some randomness to recommendations
            score += random.uniform(0, 1)
            
            scored_products.append((product, score))
        
        # Sort by score (descending) and take top products
        scored_products.sort(key=lambda x: x[1], reverse=True)
        top_products = [p[0] for p in scored_products[:limit]]
        
        # Add "isRecommended" flag
        for product in top_products:
            product['isRecommended'] = True
        
        return top_products
    
    @staticmethod
    def _get_view_based_recommendations(products, viewed_product_ids, limit):
        """Get recommendations based on viewed products"""
        # Get the viewed products details
        viewed_products = [get_product_by_id(pid) for pid in viewed_product_ids if get_product_by_id(pid)]
        
        # If no valid viewed products, fall back to default recommendations
        if not viewed_products:
            return RecommendationService._get_default_recommendations(products, limit)
        
        # Extract key attributes from viewed products
        viewed_categories = [p['articleType'] for p in viewed_products]
        viewed_colors = [p['baseColour'] for p in viewed_products]
        viewed_genders = [p['gender'] for p in viewed_products]
        
        # Score each product based on matches with viewed attributes
        scored_products = []
        for product in products:
            # Skip products the user has already viewed
            if product['id'] in viewed_product_ids:
                continue
            
            score = 0
            
            # Match category
            if product['articleType'] in viewed_categories:
                score += 2
            
            # Match color
            if product['baseColour'] in viewed_colors:
                score += 1
            
            # Match gender
            if product['gender'] in viewed_genders:
                score += 1
            
            # Add some randomness to recommendations
            score += random.uniform(0, 1)
            
            scored_products.append((product, score))
        
        # Sort by score (descending) and take top products
        scored_products.sort(key=lambda x: x[1], reverse=True)
        top_products = [p[0] for p in scored_products[:limit]]
        
        # Add "isRecommended" flag
        for product in top_products:
            product['isRecommended'] = True
        
        return top_products
    
    @staticmethod
    def _get_default_recommendations(products, limit):
        """Get default recommendations (featured or popular products)"""
        # For a real app, this could be based on overall popularity, trending items, etc.
        # Here we'll just take a random selection to simulate featured products
        selected_products = random.sample(products, min(limit, len(products)))
        
        # Add "isRecommended" flag
        for product in selected_products:
            product['isRecommended'] = True
        
        return selected_products
