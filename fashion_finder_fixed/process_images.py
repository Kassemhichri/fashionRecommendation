#!/usr/bin/env python3
"""
FashionFinder Image Processor

This script helps process and rename images for the FashionFinder application.
It supports various methods of extracting product IDs from filenames and can
process images in bulk.
"""

import os
import sys
import shutil
import re
import csv
from pathlib import Path

def create_directory(directory):
    """Create directory if it doesn't exist"""
    if not os.path.exists(directory):
        os.makedirs(directory)
        print(f"Created directory: {directory}")

def read_product_ids_from_csv(csv_path):
    """Read product IDs from styles.csv file"""
    product_ids = []
    try:
        with open(csv_path, 'r', encoding='utf-8') as file:
            reader = csv.reader(file)
            next(reader)  # Skip header
            for row in reader:
                if row and row[0]:  # Ensure row has data and ID exists
                    product_ids.append(row[0])
        print(f"Read {len(product_ids)} product IDs from {csv_path}")
        return product_ids
    except Exception as e:
        print(f"Error reading CSV file: {e}")
        return []

def extract_id_from_filename(filename, pattern=None):
    """
    Extract product ID from filename using pattern
    
    Options:
    1. Extract numeric portion (default)
    2. Use regex pattern
    3. Manual entry
    """
    if pattern:
        match = re.search(pattern, filename)
        if match:
            return match.group(1)
    
    # Default: try to extract any numeric sequence
    match = re.search(r'(\d+)', filename)
    if match:
        return match.group(1)
    
    return None

def process_images(source_dir, target_dir, pattern=None, csv_path=None):
    """Process images from source directory to target directory"""
    create_directory(target_dir)
    
    # Get list of valid product IDs if CSV provided
    valid_ids = set()
    if csv_path and os.path.exists(csv_path):
        valid_ids = set(read_product_ids_from_csv(csv_path))
    
    files = os.listdir(source_dir)
    image_files = [f for f in files if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
    
    if not image_files:
        print(f"No image files found in {source_dir}")
        return
    
    print(f"Found {len(image_files)} image files to process")
    
    processed = 0
    skipped = 0
    
    for image_file in image_files:
        # Extract ID from filename
        product_id = extract_id_from_filename(image_file, pattern)
        
        if not product_id:
            print(f"Could not extract ID from: {image_file}")
            skipped += 1
            continue
        
        # Check if ID exists in CSV (if CSV was provided)
        if valid_ids and product_id not in valid_ids:
            print(f"ID {product_id} not found in styles.csv, skipping: {image_file}")
            skipped += 1
            continue
        
        # Copy and rename image
        source_path = os.path.join(source_dir, image_file)
        target_path = os.path.join(target_dir, f"{product_id}.jpg")
        
        try:
            shutil.copy2(source_path, target_path)
            print(f"Processed: {image_file} -> {product_id}.jpg")
            processed += 1
        except Exception as e:
            print(f"Error processing {image_file}: {e}")
            skipped += 1
    
    print(f"\nSummary: Processed {processed} images, Skipped {skipped} images")

def main():
    """Main function"""
    print("FashionFinder Image Processor")
    print("============================\n")
    
    # Define paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    source_dir = os.path.join(script_dir, "source-images")
    target_dir = os.path.join(script_dir, "attached_assets", "images")
    csv_path = os.path.join(script_dir, "attached_assets", "styles.csv")
    
    # Create source directory if it doesn't exist
    create_directory(source_dir)
    
    # Check if source directory has images
    if not os.path.exists(source_dir) or not os.listdir(source_dir):
        print(f"Please place your product images in the '{source_dir}' directory.")
        print("Then run this script again.")
        input("Press Enter to exit...")
        return
    
    # User input for pattern
    print("\nHow would you like to extract product IDs from filenames?")
    print("1. Auto-detect numeric IDs (e.g., 'product15970.jpg' -> '15970')")
    print("2. Use a regex pattern")
    print("3. Process all images and validate against styles.csv")
    
    choice = input("\nEnter your choice (1-3): ")
    
    pattern = None
    validate_csv = False
    
    if choice == "2":
        pattern = input("Enter regex pattern (use capture group for ID, e.g., 'product_([0-9]+)_.*'): ")
    elif choice == "3":
        validate_csv = True
        if not os.path.exists(csv_path):
            print(f"styles.csv not found at {csv_path}")
            csv_path = input("Enter path to styles.csv (or press Enter to skip validation): ")
            if not csv_path:
                validate_csv = False
    
    # Process images
    csv_path_to_use = csv_path if validate_csv else None
    process_images(source_dir, target_dir, pattern, csv_path_to_use)
    
    print("\nImage processing complete!")
    print(f"Product images have been saved to: {target_dir}")
    print("You can now run the FashionFinder application with your product images.")
    
    input("\nPress Enter to exit...")

if __name__ == "__main__":
    main()