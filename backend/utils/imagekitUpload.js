// utils/imagekitUpload.js
// Helper utilities for uploading images to ImageKit
// Used by product controller to handle image uploads

import imagekit from '../config/imagekit.js';

/**
 * Upload a single image file to ImageKit
 * @param {Buffer|Object} file - File buffer (from multer memory storage) or file object
 * @param {string} fileName - Desired filename for the uploaded image
 * @param {string} folder - ImageKit folder path (e.g., '/products')
 * @param {Object} options - Additional upload options (tags, etc.)
 * @returns {Promise<Object>} - ImageKit upload response with URL and fileId
 */
export const uploadImageToImageKit = async (file, fileName, folder = '/products', options = {}) => {
  try {
    let fileBuffer;
    let originalFileName = fileName;

    // Handle different file input types
    if (Buffer.isBuffer(file)) {
      // Direct buffer
      fileBuffer = file;
    } else if (file.buffer) {
      // Multer memory storage buffer
      fileBuffer = file.buffer;
      originalFileName = file.originalname || fileName;
    } else if (file.path) {
      // Multer disk storage - read file from path
      const fs = await import('fs');
      fileBuffer = fs.readFileSync(file.path);
      originalFileName = file.originalname || fileName;
    } else {
      throw new Error('Invalid file format. Expected buffer or multer file object.');
    }

    // Prepare upload parameters
    const uploadParams = {
      file: fileBuffer,
      fileName: originalFileName,
      folder: folder,
      ...options // Allow overriding any ImageKit parameters
    };

    // Upload to ImageKit
    const result = await imagekit.upload(uploadParams);

    return {
      success: true,
      url: result.url, // Public URL from ImageKit
      fileId: result.fileId, // ImageKit file ID (needed for deletion)
      filePath: result.filePath, // File path in ImageKit
      name: result.name,
      size: result.size,
      width: result.width,
      height: result.height,
      fileType: result.fileType
    };
  } catch (error) {
    console.error('ImageKit upload error:', error);
    throw new Error(`Failed to upload image to ImageKit: ${error.message}`);
  }
};

/**
 * Upload multiple images to ImageKit
 * @param {Array} files - Array of file buffers or file objects
 * @param {string} baseFileName - Base filename (will be appended with index)
 * @param {string} folder - ImageKit folder path
 * @param {Object} options - Additional upload options
 * @returns {Promise<Array>} - Array of upload results
 */
export const uploadMultipleImagesToImageKit = async (files, baseFileName, folder = '/products', options = {}) => {
  try {
    const uploadPromises = files.map((file, index) => {
      // Generate unique filename for each image
      const ext = file.originalname ? file.originalname.split('.').pop() : 'jpg';
      const fileName = `${baseFileName}-${index + 1}.${ext}`;
      return uploadImageToImageKit(file, fileName, folder, options);
    });

    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Error uploading multiple images to ImageKit:', error);
    throw error;
  }
};

/**
 * Get ImageKit fileId from URL or filePath
 * ImageKit URLs don't contain fileId directly, so we need to look it up using listFiles
 * @param {string} imageUrl - ImageKit URL or filePath
 * @returns {Promise<string|null>} - FileId if found, null otherwise
 */
export const getImageKitFileId = async (imageUrl) => {
  try {
    if (!imageUrl || typeof imageUrl !== 'string') return null;

    // Extract filePath from URL
    const filePath = extractImageKitFilePath(imageUrl);
    if (!filePath) return null;

    // Extract folder path and filename
    const pathParts = filePath.split('/').filter(p => p);
    const fileName = pathParts[pathParts.length - 1];
    const folderPath = pathParts.length > 1 ? '/' + pathParts.slice(0, -1).join('/') : '/';

    try {
      // List files in the folder and search for matching filePath or name
      // Note: ImageKit listFiles may require pagination for large folders
      const files = await imagekit.listFiles({
        path: folderPath,
        limit: 1000 // Get enough results to find the file
      });

      if (files && Array.isArray(files)) {
        // First, try to find exact match by filePath
        const exactMatch = files.find(file => file.filePath === filePath);
        if (exactMatch && exactMatch.fileId) {
          return exactMatch.fileId;
        }

        // Fallback: find by filename (name field)
        const nameMatch = files.find(file => file.name === fileName);
        if (nameMatch && nameMatch.fileId) {
          return nameMatch.fileId;
        }
      }
    } catch (listError) {
      console.warn(`Could not list files for path ${filePath}:`, listError.message);
      // Continue to return null - deletion will be skipped
    }

    return null;
  } catch (error) {
    console.error(`Error getting fileId from ImageKit URL ${imageUrl}:`, error);
    return null;
  }
};

/**
 * Delete an image from ImageKit using file ID or URL
 * @param {string} fileIdOrUrl - ImageKit file ID or URL
 * @returns {Promise<boolean>} - True if deletion successful
 */
export const deleteImageFromImageKit = async (fileIdOrUrl) => {
  try {
    if (!fileIdOrUrl) {
      console.warn('No fileId or URL provided for ImageKit deletion');
      return false;
    }

    let fileId = fileIdOrUrl;

    // If it's a URL, extract fileId first
    if (isImageKitUrl(fileIdOrUrl)) {
      fileId = await getImageKitFileId(fileIdOrUrl);
      if (!fileId) {
        console.warn(`Could not find fileId for ImageKit URL: ${fileIdOrUrl}`);
        return false;
      }
    }

    // ImageKit deleteFile method requires fileId
    await imagekit.deleteFile(fileId);
    console.log(`Successfully deleted image from ImageKit: ${fileId} (${fileIdOrUrl})`);
    return true;
  } catch (error) {
    console.error(`Error deleting image from ImageKit (${fileIdOrUrl}):`, error);
    // Don't throw - continue even if deletion fails (image might already be deleted)
    return false;
  }
};

/**
 * Extract ImageKit file ID from URL
 * This is a helper to extract fileId from ImageKit URLs if needed
 * Note: ImageKit URLs don't contain fileId directly, so we need to store fileId separately
 * @param {string} imageUrl - ImageKit URL
 * @returns {string|null} - File path or null
 */
export const extractImageKitFilePath = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string') return null;
  
  // ImageKit URLs are in format: https://ik.imagekit.io/your_id/path/to/image.jpg
  // We can extract the path part
  try {
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/').filter(p => p);
    if (pathParts.length > 0) {
      return '/' + pathParts.join('/');
    }
  } catch (e) {
    // Not a valid URL, might be a path already
    if (imageUrl.startsWith('/')) {
      return imageUrl;
    }
  }
  
  return null;
};

/**
 * Check if a URL is an ImageKit URL
 * @param {string} url - URL to check
 * @returns {boolean} - True if it's an ImageKit URL
 */
export const isImageKitUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  const imagekitEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;
  if (!imagekitEndpoint) return false;
  return url.includes(imagekitEndpoint) || url.startsWith('https://ik.imagekit.io/');
};

