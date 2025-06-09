import os
import pandas as pd
from utils.csv_loader import CSVLoader

# Global variables to store loaded product data
products_df = None
images_df = None
products_dict = {}

def load_products():
    """Load product data from CSV files"""
    global products_df, images_df, products_dict
    
    # Load CSV data
    data_dir = os.path.join(os.path.dirname(__file__), '../../data')
    products_df = CSVLoader.load_styles(os.path.join(data_dir, 'styles.csv'))
    images_df = CSVLoader.load_images(os.path.join(data_dir, 'images.csv'))
    
    # Create a dictionary of products for quick access
    products_dict = {}
    for _, row in products_df.iterrows():
        product_id = str(row['id'])
        
        # Find corresponding image
        image_url = None
        image_record = images_df[images_df.index == product_id]
        if not image_record.empty:
            image_url = image_record.iloc[0]['image_url']
        
        # Create product dictionary
        products_dict[product_id] = {
            'id': product_id,
            'gender': row['gender'],
            'masterCategory': row['masterCategory'],
            'subCategory': row['subCategory'],
            'articleType': row['articleType'],
            'baseColour': row['baseColour'],
            'season': row['season'],
            'year': row['year'],
            'usage': row['usage'],
            'productDisplayName': row['productDisplayName'],
            'imageUrl': image_url
        }

def get_all_products(filters=None, sort=None, page=1, limit=12):
    """Get all products with optional filtering, sorting, and pagination"""
    global products_dict
    
    if not products_dict:
        load_products()
    
    filtered_products = list(products_dict.values())
    
    # Apply filters
    if filters:
        if 'gender' in filters and filters['gender']:
            genders = filters['gender']
            filtered_products = [p for p in filtered_products if p['gender'] in genders]
        
        if 'categories' in filters and filters['categories']:
            categories = filters['categories']
            filtered_products = [p for p in filtered_products if p['articleType'] in categories]
        
        if 'colors' in filters and filters['colors']:
            colors = filters['colors']
            filtered_products = [p for p in filtered_products if p['baseColour'] in colors]
        
        if 'usage' in filters and filters['usage']:
            usages = filters['usage']
            filtered_products = [p for p in filtered_products if p['usage'] in usages]
        
        if 'search' in filters and filters['search']:
            search_term = filters['search'].lower()
            filtered_products = [p for p in filtered_products if search_term in p['productDisplayName'].lower() 
                               or search_term in p['articleType'].lower() 
                               or search_term in p['baseColour'].lower()]
        
        if 'priceRange' in filters and len(filters['priceRange']) == 2:
            # Since we don't have actual prices, we'll simulate price filtering based on product ID
            min_price, max_price = filters['priceRange']
            filtered_products = [p for p in filtered_products if min_price <= (int(p['id']) % 100 + 30) <= max_price]
    
    # Apply sorting
    if sort:
        if sort == 'price_asc':
            # Simulate price sorting based on product ID
            filtered_products.sort(key=lambda p: int(p['id']) % 100)
        elif sort == 'price_desc':
            # Simulate price sorting based on product ID
            filtered_products.sort(key=lambda p: int(p['id']) % 100, reverse=True)
        elif sort == 'newest':
            # Sort by year and season
            season_order = {'Spring': 0, 'Summer': 1, 'Fall': 2, 'Winter': 3}
            filtered_products.sort(key=lambda p: (int(p['year']), season_order.get(p['season'], 4)), reverse=True)
    
    # Calculate pagination
    total_count = len(filtered_products)
    total_pages = (total_count + limit - 1) // limit
    start_idx = (page - 1) * limit
    end_idx = min(start_idx + limit, total_count)
    
    paginated_products = filtered_products[start_idx:end_idx]
    
    return {
        'products': paginated_products,
        'totalCount': total_count,
        'totalPages': total_pages,
        'currentPage': page
    }

def get_product_by_id(product_id):
    """Get a product by ID"""
    global products_dict
    
    if not products_dict:
        load_products()
    
    product_id = str(product_id)
    if product_id in products_dict:
        return products_dict[product_id]
    
    return None

def get_similar_products(product_id, limit=4):
    """Get similar products based on product attributes"""
    global products_dict
    
    if not products_dict:
        load_products()
    
    product_id = str(product_id)
    if product_id not in products_dict:
        return []
    
    target_product = products_dict[product_id]
    
    # Get products with same gender, articleType, and usage
    similar_products = [
        p for pid, p in products_dict.items() 
        if pid != product_id 
        and p['gender'] == target_product['gender']
        and (p['articleType'] == target_product['articleType'] or p['usage'] == target_product['usage'])
    ]
    
    # Limit the number of similar products
    return similar_products[:limit]

def get_featured_products(limit=8):
    """Get a selection of featured products"""
    global products_dict
    
    if not products_dict:
        load_products()
    
    # For demonstration, we'll just return a selection of products
    # In a real application, this could be based on popularity, newness, etc.
    featured_product_ids = list(products_dict.keys())[:limit]
    
    return [products_dict[pid] for pid in featured_product_ids]

def search_products(query, limit=20):
    """Search products by name, type, color, etc."""
    global products_dict
    
    if not products_dict:
        load_products()
    
    query = query.lower()
    
    # Search in product name, article type, color, etc.
    results = [
        p for p in products_dict.values() 
        if query in p['productDisplayName'].lower() 
        or query in p['articleType'].lower()
        or query in p['baseColour'].lower()
        or query in p['gender'].lower()
        or query in p['usage'].lower()
    ]
    
    return results[:limit]
