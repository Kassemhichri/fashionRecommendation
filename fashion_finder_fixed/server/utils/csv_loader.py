import pandas as pd
import os

class CSVLoader:
    @staticmethod
    def load_styles(file_path):
        """Load and process the styles.csv file"""
        try:
            df = pd.read_csv(file_path)
            # Ensure the id is a string (for consistency with later lookups)
            df['id'] = df['id'].astype(str)
            # Set id as index for faster lookups
            df.set_index('id', inplace=True)
            return df
        except Exception as e:
            print(f"Error loading styles.csv: {e}")
            # Return empty DataFrame with expected columns
            columns = ['gender', 'masterCategory', 'subCategory', 'articleType', 
                      'baseColour', 'season', 'year', 'usage', 'productDisplayName']
            return pd.DataFrame(columns=columns)
    
    @staticmethod
    def load_images(file_path):
        """Load and process the images.csv file"""
        try:
            # Load CSV with two columns: filename and image_url
            df = pd.read_csv(file_path, header=None, names=['filename', 'image_url'])
            
            # Extract product ID from filename (e.g., "12345.jpg" -> "12345")
            df['product_id'] = df['filename'].apply(lambda x: x.split('.')[0])
            
            # Set product_id as index for faster lookups
            df.set_index('product_id', inplace=True)
            return df
        except Exception as e:
            print(f"Error loading images.csv: {e}")
            # Return empty DataFrame with expected columns
            return pd.DataFrame(columns=['filename', 'image_url'])
