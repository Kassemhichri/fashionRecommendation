const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

/**
 * Processes the styles.csv and images.csv files to create a merged product dataset
 * @returns {Array} Array of product objects with merged data
 */
function processProductData() {
  try {
    // Read CSV files
    const stylesPath = path.join(process.cwd(), 'data', 'styles.csv');
    const imagesPath = path.join(process.cwd(), 'data', 'images.csv');
    
    // Parse styles.csv
    const stylesContent = fs.readFileSync(stylesPath, 'utf-8');
    const stylesRecords = parse(stylesContent, {
      columns: true,
      skip_empty_lines: true
    });
    
    // Parse images.csv
    const imagesContent = fs.readFileSync(imagesPath, 'utf-8');
    const imagesRecords = parse(imagesContent, {
      columns: ['image', 'url'],
      skip_empty_lines: true,
      from_line: 1 // No header in the images.csv
    });
    
    // Create a map of image IDs to URLs
    const imageMap = new Map();
    imagesRecords.forEach(record => {
      // Extract ID from image filename (e.g., "123.jpg" -> 123)
      const id = parseInt(record.image.split('.')[0], 10);
      imageMap.set(id, record.url);
    });
    
    // Merge styles and images data
    const products = stylesRecords.map(style => {
      // Parse ID as integer
      const id = parseInt(style.id, 10);
      
      // Get image URL from map or use default
      const imageUrl = imageMap.get(id) || `/images/${id}.jpg`;
      
      // Create merged product object
      return {
        id: id,
        gender: style.gender,
        masterCategory: style.masterCategory,
        subCategory: style.subCategory,
        articleType: style.articleType,
        baseColour: style.baseColour,
        season: style.season,
        year: parseInt(style.year, 10),
        usage: style.usage,
        productDisplayName: style.productDisplayName,
        imageUrl: imageUrl
      };
    });
    
    return products;
  } catch (error) {
    console.error('Error processing product data:', error);
    return [];
  }
}

// Export a function that memoizes the product data to avoid reprocessing on every request
let cachedProducts = null;

function getProducts() {
  if (!cachedProducts) {
    cachedProducts = processProductData();
    console.log(`Processed ${cachedProducts.length} products from CSV files`);
  }
  return cachedProducts;
}

module.exports = {
  getProducts
};