"""
Image Embedding Service for FashionFinder

This service extracts visual embeddings from product images 
using a pre-trained model like CLIP or ResNet50.
"""

import os
import numpy as np
from PIL import Image
import torch
from torchvision import transforms, models
from torchvision.models import ResNet50_Weights

# Cache for storing computed embeddings to avoid recomputing
embedding_cache = {}

def setup_model():
    """Initialize the model for image embeddings"""
    # Load ResNet50 pre-trained on ImageNet
    model = models.resnet50(weights=ResNet50_Weights.IMAGENET1K_V2)
    # Use the model without the final classification layer
    model = torch.nn.Sequential(*list(model.children())[:-1])
    model.eval()  # Set to evaluation mode
    return model

def get_transform():
    """Get the image transformation pipeline"""
    return transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])

def extract_image_embedding(image_path, model=None, transform=None):
    """Extract embedding from an image file"""
    # Check if embedding already exists in cache
    if image_path in embedding_cache:
        return embedding_cache[image_path]
    
    # Initialize model and transform if not provided
    if model is None:
        model = setup_model()
    if transform is None:
        transform = get_transform()
    
    try:
        # Open and transform the image
        img = Image.open(image_path).convert('RGB')
        # Apply transformation to get tensor
        tensor = transform(img)  # transform returns a PyTorch tensor
        # Add batch dimension
        tensor_batch = tensor.unsqueeze(0)
        
        # Extract features
        with torch.no_grad():
            features = model(tensor_batch)
            features = features.squeeze().cpu().numpy()
            
        # Normalize the features
        embedding = features / np.linalg.norm(features)
        
        # Cache the computed embedding
        embedding_cache[image_path] = embedding
        
        return embedding
    except Exception as e:
        print(f"Error extracting embedding from {image_path}: {e}")
        # Return a zero vector as fallback
        return np.zeros(2048)  # ResNet50 feature dimension

def get_embeddings_for_all_products(products, images_dir):
    """Extract embeddings for all product images"""
    model = setup_model()
    transform = get_transform()
    
    embeddings = {}
    for product in products:
        product_id = product['id']
        image_path = os.path.join(images_dir, f"{product_id}.jpg")
        
        if os.path.exists(image_path):
            embedding = extract_image_embedding(image_path, model, transform)
            embeddings[product_id] = embedding
        else:
            print(f"Warning: Image for product {product_id} not found at {image_path}")
            embeddings[product_id] = np.zeros(2048)  # Default empty embedding
    
    return embeddings

def compute_similarity(embedding1, embedding2):
    """Compute cosine similarity between two embeddings"""
    return np.dot(embedding1, embedding2) / (np.linalg.norm(embedding1) * np.linalg.norm(embedding2))

def find_similar_products(product_id, product_embeddings, products, top_k=10):
    """Find the most similar products based on image embeddings"""
    if product_id not in product_embeddings:
        print(f"Warning: No embedding found for product {product_id}")
        return []
    
    target_embedding = product_embeddings[product_id]
    similarities = []
    
    for pid, embedding in product_embeddings.items():
        if pid != product_id:  # Don't include the query product
            similarity = compute_similarity(target_embedding, embedding)
            similarities.append((pid, similarity))
    
    # Sort by similarity (descending)
    similarities.sort(key=lambda x: x[1], reverse=True)
    
    # Get the top K similar products
    top_similar = similarities[:top_k]
    
    # Return the actual product objects
    similar_products = []
    product_dict = {p['id']: p for p in products}
    
    for pid, similarity in top_similar:
        if pid in product_dict:
            product = product_dict[pid].copy()
            product['similarityScore'] = float(similarity)
            similar_products.append(product)
    
    return similar_products