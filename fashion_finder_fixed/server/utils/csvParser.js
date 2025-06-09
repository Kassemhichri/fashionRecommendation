import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

/**
 * Parse a CSV file and return the data as an array of objects
 * @param filePath Path to the CSV file
 * @returns Array of objects representing the CSV data
 */
export function parseCSV(filePath) {
  try {
    // For styles.csv, let's do a more flexible parse
    if (filePath.includes('styles.csv')) {
      // Read the file content
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const lines = fileContent.split('\n');
      
      // First line is the header
      const headers = lines[0].split(',');
      
      // Process remaining lines
      const result = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        // Simple split by comma - not perfect but will get us started
        const columns = lines[i].split(',');
        
        // Make sure we have exactly the number of columns we need
        if (columns.length >= headers.length) {
          // If we have too many columns, consolidate the last ones
          if (columns.length > headers.length) {
            const consolidatedLastColumn = columns.slice(headers.length - 1).join(' ');
            columns.splice(headers.length - 1, columns.length - headers.length + 1, consolidatedLastColumn);
          }
          
          // Create object from headers and columns
          const record = {};
          headers.forEach((header, index) => {
            record[header.trim()] = columns[index].trim();
          });
          
          result.push(record);
        }
      }
      
      return result;
    } else {
      // Regular CSV parsing for other files
      const fileContent = fs.readFileSync(filePath, 'utf8');
      return parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });
    }
  } catch (error) {
    console.error(`Error parsing CSV file ${filePath}:`, error);
    return [];
  }
}

/**
 * Parse styles.csv and map to image files in the images folder
 * @returns Array of merged product data
 */
export function getMergedProducts() {
  console.log('Starting CSV merge process...');
  
  // Try to find styles.csv file or alternatives
  let stylesPath = '';
  const possibleStylePaths = [
    path.resolve(process.cwd(), 'attached_assets', 'styles.csv')
  ];
  
  for (const potentialPath of possibleStylePaths) {
    if (fs.existsSync(potentialPath)) {
      stylesPath = potentialPath;
      console.log('Found styles CSV file at:', stylesPath);
      break;
    }
  }
  
  if (!stylesPath) {
    console.error('No styles CSV file found. Checked paths:', possibleStylePaths);
    return [];
  }
  
  console.log('Parsing styles CSV file...');
  const styles = parseCSV(stylesPath);
  console.log(`Successfully parsed ${styles.length} style records`);
  
  // Use a single primary image directory
  const primaryImageDir = path.resolve(process.cwd(), 'attached_assets', 'images');
  // Fallback directories in case the primary doesn't exist
  const fallbackImageDirs = [
    path.resolve(process.cwd(), 'backend', 'data', 'images'),
    path.resolve(process.cwd(), 'server', 'static', 'images')
  ];
  
  // Use the primary directory if it exists, otherwise check fallbacks
  let activeImageDir = '';
  if (fs.existsSync(primaryImageDir)) {
    activeImageDir = primaryImageDir;
    console.log('Using primary image directory:', primaryImageDir);
  } else {
    // Check fallback directories
    for (const dir of fallbackImageDirs) {
      if (fs.existsSync(dir)) {
        activeImageDir = dir;
        console.log('Using fallback image directory:', dir);
        break;
      }
    }
  }
  
  if (!activeImageDir) {
    console.error('No image directory found. Checked these locations:', 
      [primaryImageDir, ...fallbackImageDirs]);
    return [];
  }
  
  // Create merged products with direct image path references
  console.log('Creating product objects with image paths...');
  
  // Build a map of product ID -> image exists flags
  const productImageMap = new Map();
  
  // Get a list of available image files from the active directory
  try {
    const files = fs.readdirSync(activeImageDir)
      .filter(file => file.endsWith('.jpg') || file.endsWith('.png'))
      .map(file => {
        // Extract the ID from the filename (remove extension)
        const productId = file.replace(/\.(jpg|png)$/i, '');
        return { productId, filename: file };
      });
      
    console.log(`Found ${files.length} image files in ${activeImageDir}`);
    
    // Mark these products as having images
    files.forEach(file => {
      productImageMap.set(file.productId, true);
    });
  } catch (error) {
    console.error(`Error reading images directory ${activeImageDir}:`, error);
  }
  
  console.log(`Found images for ${productImageMap.size} unique product IDs`);
  
  // Choose a fallback image from the active directory
  let fallbackImage = '1163.jpg'; // Default fallback image ID
  let fallbackImageExists = false;
  
  // Check if our preferred fallback exists
  if (fs.existsSync(path.join(activeImageDir, fallbackImage))) {
    fallbackImageExists = true;
    console.log(`Found fallback image at ${path.join(activeImageDir, fallbackImage)}`);
  } 
  // If not, pick the first available image as fallback
  else if (productImageMap.size > 0) {
    fallbackImage = `${Array.from(productImageMap.keys())[0]}.jpg`;
    fallbackImageExists = true;
    console.log(`Using first available image as fallback: ${fallbackImage}`);
  }
  
  if (!fallbackImageExists) {
    console.error('No fallback image available. Products will have missing images.');
  }
  
  // Map styles to products with image URLs
  const mergedProducts = styles.map((style) => {
    // Check if image exists for this product ID 
    const hasImage = productImageMap.has(style.id);
    
    if (hasImage) {
      console.log(`Found image for product ID ${style.id}`);
    }
    
    return {
      ...style,
      imageUrl: hasImage 
        ? `/images/${style.id}.jpg` 
        : `/images/${fallbackImage}`  // Use the fallback image
    };
  });

  console.log(`Successfully created ${mergedProducts.length} merged product records`);
  if (mergedProducts.length > 0) {
    console.log('Sample of first merged product:', JSON.stringify(mergedProducts[0], null, 2));
  }

  return mergedProducts;
}
