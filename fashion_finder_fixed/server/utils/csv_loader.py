import pandas as pd
import os

class CSVLoader:
    @staticmethod
    def load_styles(file_path):
        """Load and process the styles.csv file"""
        try:
            df = pd.read_csv(file_path)
            df['id'] = df['id'].astype(str)
            df.set_index('id', inplace=True)
            return df
        except Exception as e:
            print(f"Error loading styles.csv: {e}")
            columns = ['gender', 'masterCategory', 'subCategory', 'articleType',
                      'baseColour', 'season', 'year', 'usage', 'productDisplayName']
            return pd.DataFrame(columns=columns)

    @staticmethod
    def load_images(file_path):
        """Load and process the images.csv file"""
        try:
            df = pd.read_csv(file_path, header=None, names=['filename', 'image_url'])
            df['product_id'] = df['filename'].apply(lambda x: x.split('.')[0])
            df.set_index('product_id', inplace=True)
            return df
        except Exception as e:
            print(f"Error loading images.csv: {e}")
            return pd.DataFrame(columns=['filename', 'image_url'])
