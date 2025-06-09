"""
Embedding-based Recommendation Service for FashionFinder

This service combines metadata with visual embeddings to create
comprehensive product feature vectors for better recommendations.
"""

import os
import numpy as np
from sklearn.preprocessing import OneHotEncoder
import pandas as pd
from .image_embedding_service_new import get_embeddings_for_all_products, compute_similarity

class EmbeddingRecommendationService:
    def __init__(self, products, images_dir="attached_assets/images"):
        """Initialize the recommendation service"""
        self.products = products
        self.images_dir = images_dir
        self.product_dict = {p['id']: p for p in products}
        
        # Generate embeddings (this can be slow for large product catalogs)
        self.setup_embeddings()
    
    def setup_embeddings(self):
        """Set up the combined embeddings (image + metadata)"""
        # Extract image embeddings
        print("Extracting image embeddings...")
        self.image_embeddings = get_embeddings_for_all_products(self.products, self.images_dir)
        
        # Extract and encode metadata
        print("Processing metadata...")
        self.metadata_features = self.extract_metadata_features()
        
        # Combine embeddings
        print("Combining embeddings...")
        self.combined_embeddings = self.create_combined_embeddings()
        
        print(f"Embeddings setup complete for {len(self.combined_embeddings)} products")
    
    def extract_metadata_features(self):
        """Extract and encode metadata features from products"""
        # Create a DataFrame from the products
        df = pd.DataFrame(self.products)
        
        # Select categorical features
        categorical_features = ['gender', 'masterCategory', 'subCategory', 
                                'articleType', 'baseColour', 'season', 'usage']
        
        # For each categorical feature, create one-hot encoding
        encoded_features = {}
        
        for feature in categorical_features:
            if feature in df.columns:
                # Get unique values and create encoder
                values = df[feature].fillna('unknown').astype(str).values
                values = values.reshape(-1, 1) if hasattr(values, 'reshape') else np.array(values).reshape(-1, 1)
                encoder = OneHotEncoder(sparse_output=False)
                encoder.fit(values)
                
                # Encode each product
                encoded = {}
                for product in self.products:
                    product_id = product['id']
                    value = product.get(feature, 'unknown')
                    if value is None:
                        value = 'unknown'
                    value_encoded = encoder.transform([[str(value)]])[0]
                    encoded[product_id] = value_encoded
                
                encoded_features[feature] = encoded
        
        return encoded_features
    
    def create_combined_embeddings(self):
        """Combine image embeddings with metadata features"""
        combined = {}
        
        for product in self.products:
            product_id = product['id']
            
            # Get image embedding
            img_embedding = self.image_embeddings.get(product_id, np.zeros(2048))
            
            # Combine all metadata features
            meta_features = []
            for feature_name, feature_dict in self.metadata_features.items():
                if product_id in feature_dict:
                    meta_features.append(feature_dict[product_id])
            
            # Flatten metadata features into a single vector
            if meta_features:
                meta_vector = np.concatenate(meta_features)
            else:
                meta_vector = np.array([])
            
            # Normalize metadata vector
            if meta_vector.size > 0 and np.linalg.norm(meta_vector) > 0:
                meta_vector = meta_vector / np.linalg.norm(meta_vector)
            
            # Combine image and metadata (you can adjust weights here)
            combined_vector = np.concatenate([img_embedding * 0.7, meta_vector * 0.3])
            
            # Normalize the combined vector
            if np.linalg.norm(combined_vector) > 0:
                combined_vector = combined_vector / np.linalg.norm(combined_vector)
            
            combined[product_id] = combined_vector
        
        return combined
    
    def get_recommendations_for_product(self, product_id, top_k=10, exclude_ids=None):
        """Get recommendations similar to a specific product"""
        if exclude_ids is None:
            exclude_ids = set()
        else:
            exclude_ids = set(exclude_ids)
        
        if product_id not in self.combined_embeddings:
            print(f"Warning: No embedding found for product {product_id}")
            return []
        
        target_embedding = self.combined_embeddings[product_id]
        similarities = []
        
        for pid, embedding in self.combined_embeddings.items():
            if pid != product_id and pid not in exclude_ids:
                similarity = compute_similarity(target_embedding, embedding)
                similarities.append((pid, similarity))
        
        # Sort by similarity (descending)
        similarities.sort(key=lambda x: x[1], reverse=True)
        
        # Get the top K similar products
        top_similar = similarities[:top_k]
        
        # Return the actual product objects with similarity scores
        similar_products = []
        
        for pid, similarity in top_similar:
            if pid in self.product_dict:
                product = self.product_dict[pid].copy()
                product['similarityScore'] = float(similarity)
                product['recommendationReason'] = "Visually similar"
                similar_products.append(product)
        
        return similar_products
    
    def get_recommendations_for_user(self, liked_product_ids, disliked_product_ids=None, top_k=10):
        """Get recommendations based on a user's liked products"""
        if not liked_product_ids:
            print("Warning: No liked products provided for user recommendations")
            return []
        
        if disliked_product_ids is None:
            disliked_product_ids = []
        
        # Create a combined user preference vector from liked products
        user_embedding = None
        count = 0
        
        for pid in liked_product_ids:
            if pid in self.combined_embeddings:
                if user_embedding is None:
                    user_embedding = self.combined_embeddings[pid].copy()
                else:
                    user_embedding += self.combined_embeddings[pid]
                count += 1
        
        if user_embedding is None or count == 0:
            print("Warning: Could not create user embedding from liked products")
            return []
        
        # Normalize the user embedding
        user_embedding = user_embedding / count
        if np.linalg.norm(user_embedding) > 0:
            user_embedding = user_embedding / np.linalg.norm(user_embedding)
        
        # Find products similar to the user embedding
        exclude_ids = set(liked_product_ids + disliked_product_ids)
        similarities = []
        
        for pid, embedding in self.combined_embeddings.items():
            if pid not in exclude_ids:
                similarity = compute_similarity(user_embedding, embedding)
                similarities.append((pid, similarity))
        
        # Sort by similarity (descending)
        similarities.sort(key=lambda x: x[1], reverse=True)
        
        # Get the top K similar products
        top_similar = similarities[:top_k]
        
        # Return the actual product objects with similarity scores
        recommended_products = []
        
        for pid, similarity in top_similar:
            if pid in self.product_dict:
                product = self.product_dict[pid].copy()
                product['similarityScore'] = float(similarity)
                product['recommendationReason'] = "Based on your style preferences"
                recommended_products.append(product)
        
        return recommended_products