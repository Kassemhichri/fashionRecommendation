import sqlite3
import os
from datetime import datetime

class Interaction:
    def __init__(self, id, user_id, product_id, interaction_type, created_at=None):
        self.id = id
        self.user_id = user_id
        self.product_id = product_id
        self.interaction_type = interaction_type  # "view", "like", "dislike"
        self.created_at = created_at if created_at else datetime.now()
    
    @staticmethod
    def create(user_id, product_id, interaction_type):
        """Create a new interaction in the database"""
        db_path = os.path.join(os.path.dirname(__file__), '../../data/fashionfinder.db')
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                "INSERT INTO interactions (user_id, product_id, interaction_type) VALUES (?, ?, ?)",
                (user_id, product_id, interaction_type)
            )
            interaction_id = cursor.lastrowid
            conn.commit()
            
            # Fetch the created interaction
            cursor.execute(
                "SELECT id, user_id, product_id, interaction_type, created_at FROM interactions WHERE id = ?",
                (interaction_id,)
            )
            interaction_data = cursor.fetchone()
            return Interaction(*interaction_data)
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()
    
    @staticmethod
    def get_by_user_id(user_id):
        """Retrieve all interactions for a user"""
        db_path = os.path.join(os.path.dirname(__file__), '../../data/fashionfinder.db')
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT id, user_id, product_id, interaction_type, created_at FROM interactions WHERE user_id = ?",
            (user_id,)
        )
        interactions_data = cursor.fetchall()
        conn.close()
        
        interactions = []
        for interaction_data in interactions_data:
            interactions.append(Interaction(*interaction_data))
        return interactions
    
    @staticmethod
    def get_by_user_id_and_product_id(user_id, product_id):
        """Retrieve interactions for a specific user and product"""
        db_path = os.path.join(os.path.dirname(__file__), '../../data/fashionfinder.db')
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT id, user_id, product_id, interaction_type, created_at FROM interactions WHERE user_id = ? AND product_id = ?",
            (user_id, product_id)
        )
        interactions_data = cursor.fetchall()
        conn.close()
        
        interactions = []
        for interaction_data in interactions_data:
            interactions.append(Interaction(*interaction_data))
        return interactions
    
    @staticmethod
    def delete_like_dislike(user_id, product_id):
        """Delete like/dislike interactions for a user and product"""
        db_path = os.path.join(os.path.dirname(__file__), '../../data/fashionfinder.db')
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                "DELETE FROM interactions WHERE user_id = ? AND product_id = ? AND interaction_type IN ('like', 'dislike')",
                (user_id, product_id)
            )
            conn.commit()
            return True
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()
    
    @staticmethod
    def get_liked_products(user_id):
        """Get all products liked by a user"""
        db_path = os.path.join(os.path.dirname(__file__), '../../data/fashionfinder.db')
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT product_id FROM interactions WHERE user_id = ? AND interaction_type = 'like'",
            (user_id,)
        )
        product_ids = [row[0] for row in cursor.fetchall()]
        conn.close()
        
        return product_ids
    
    @staticmethod
    def get_user_interactions_by_type(user_id, interaction_type):
        """Retrieve user interactions of a specific type"""
        db_path = os.path.join(os.path.dirname(__file__), '../../data/fashionfinder.db')
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT id, user_id, product_id, interaction_type, created_at FROM interactions WHERE user_id = ? AND interaction_type = ?",
            (user_id, interaction_type)
        )
        interactions_data = cursor.fetchall()
        conn.close()
        
        interactions = []
        for interaction_data in interactions_data:
            interactions.append(Interaction(*interaction_data))
        return interactions
    
    def to_dict(self):
        """Convert interaction object to dictionary"""
        return {
            'id': self.id,
            'userId': self.user_id,
            'productId': self.product_id,
            'interactionType': self.interaction_type,
            'createdAt': self.created_at
        }
