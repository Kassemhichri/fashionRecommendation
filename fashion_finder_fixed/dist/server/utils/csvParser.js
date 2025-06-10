var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
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
            var fileContent = fs.readFileSync(filePath, 'utf8');
            var lines = fileContent.split('\n');
            // First line is the header
            var headers = lines[0].split(',');
            // Process remaining lines
            var result = [];
            var _loop_1 = function (i) {
                if (!lines[i].trim())
                    return "continue";
                // Simple split by comma - not perfect but will get us started
                var columns = lines[i].split(',');
                // Make sure we have exactly the number of columns we need
                if (columns.length >= headers.length) {
                    // If we have too many columns, consolidate the last ones
                    if (columns.length > headers.length) {
                        var consolidatedLastColumn = columns.slice(headers.length - 1).join(' ');
                        columns.splice(headers.length - 1, columns.length - headers.length + 1, consolidatedLastColumn);
                    }
                    // Create object from headers and columns
                    var record_1 = {};
                    headers.forEach(function (header, index) {
                        record_1[header.trim()] = columns[index].trim();
                    });
                    result.push(record_1);
                }
            };
            for (var i = 1; i < lines.length; i++) {
                _loop_1(i);
            }
            return result;
        }
        else {
            // Regular CSV parsing for other files
            var fileContent = fs.readFileSync(filePath, 'utf8');
            return parse(fileContent, {
                columns: true,
                skip_empty_lines: true,
                trim: true
            });
        }
    }
    catch (error) {
        console.error("Error parsing CSV file ".concat(filePath, ":"), error);
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
    var stylesPath = '';
    var possibleStylePaths = [
        path.resolve(process.cwd(), 'attached_assets', 'styles.csv')
    ];
    for (var _i = 0, possibleStylePaths_1 = possibleStylePaths; _i < possibleStylePaths_1.length; _i++) {
        var potentialPath = possibleStylePaths_1[_i];
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
    var styles = parseCSV(stylesPath);
    console.log("Successfully parsed ".concat(styles.length, " style records"));
    // Use a single primary image directory
    var primaryImageDir = path.resolve(process.cwd(), 'attached_assets', 'images');
    // Fallback directories in case the primary doesn't exist
    var fallbackImageDirs = [
        path.resolve(process.cwd(), 'backend', 'data', 'images'),
        path.resolve(process.cwd(), 'server', 'static', 'images')
    ];
    // Use the primary directory if it exists, otherwise check fallbacks
    var activeImageDir = '';
    if (fs.existsSync(primaryImageDir)) {
        activeImageDir = primaryImageDir;
        console.log('Using primary image directory:', primaryImageDir);
    }
    else {
        // Check fallback directories
        for (var _a = 0, fallbackImageDirs_1 = fallbackImageDirs; _a < fallbackImageDirs_1.length; _a++) {
            var dir = fallbackImageDirs_1[_a];
            if (fs.existsSync(dir)) {
                activeImageDir = dir;
                console.log('Using fallback image directory:', dir);
                break;
            }
        }
    }
    if (!activeImageDir) {
        console.error('No image directory found. Checked these locations:', __spreadArray([primaryImageDir], fallbackImageDirs, true));
        return [];
    }
    // Create merged products with direct image path references
    console.log('Creating product objects with image paths...');
    // Build a map of product ID -> image exists flags
    var productImageMap = new Map();
    // Get a list of available image files from the active directory
    try {
        var files = fs.readdirSync(activeImageDir)
            .filter(function (file) { return file.endsWith('.jpg') || file.endsWith('.png'); })
            .map(function (file) {
            // Extract the ID from the filename (remove extension)
            var productId = file.replace(/\.(jpg|png)$/i, '');
            return { productId: productId, filename: file };
        });
        console.log("Found ".concat(files.length, " image files in ").concat(activeImageDir));
        // Mark these products as having images
        files.forEach(function (file) {
            productImageMap.set(file.productId, true);
        });
    }
    catch (error) {
        console.error("Error reading images directory ".concat(activeImageDir, ":"), error);
    }
    console.log("Found images for ".concat(productImageMap.size, " unique product IDs"));
    // Choose a fallback image from the active directory
    var fallbackImage = '1163.jpg'; // Default fallback image ID
    var fallbackImageExists = false;
    // Check if our preferred fallback exists
    if (fs.existsSync(path.join(activeImageDir, fallbackImage))) {
        fallbackImageExists = true;
        console.log("Found fallback image at ".concat(path.join(activeImageDir, fallbackImage)));
    }
    // If not, pick the first available image as fallback
    else if (productImageMap.size > 0) {
        fallbackImage = "".concat(Array.from(productImageMap.keys())[0], ".jpg");
        fallbackImageExists = true;
        console.log("Using first available image as fallback: ".concat(fallbackImage));
    }
    if (!fallbackImageExists) {
        console.error('No fallback image available. Products will have missing images.');
    }
    // Map styles to products with image URLs
    var mergedProducts = styles.map(function (style) {
        // Check if image exists for this product ID 
        var hasImage = productImageMap.has(style.id);
        if (hasImage) {
            console.log("Found image for product ID ".concat(style.id));
        }
        return __assign(__assign({}, style), { imageUrl: hasImage
                ? "/images/".concat(style.id, ".jpg")
                : "/images/".concat(fallbackImage) // Use the fallback image
         });
    });
    console.log("Successfully created ".concat(mergedProducts.length, " merged product records"));
    if (mergedProducts.length > 0) {
        console.log('Sample of first merged product:', JSON.stringify(mergedProducts[0], null, 2));
    }
    return mergedProducts;
}
