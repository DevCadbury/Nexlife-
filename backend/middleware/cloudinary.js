import { v2 as cloudinary } from 'cloudinary';

/**
 * Upload an image buffer to Cloudinary.
 *
 * @param {Buffer} fileBuffer  - Raw file buffer from multer memory storage
 * @param {string} mimetype    - MIME type of the file (e.g. 'image/jpeg')
 * @returns {Promise<{ secure_url, public_id, format, bytes, width, height }>}
 */
export async function uploadImage(fileBuffer, mimetype) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'nexlife-products',
        resource_type: 'image',
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
          format: result.format,
          bytes: result.bytes,
          width: result.width,
          height: result.height,
        });
      }
    );
    stream.end(fileBuffer);
  });
}

/**
 * Delete an image from Cloudinary by its public_id.
 *
 * @param {string} publicId  - Cloudinary public_id
 * @returns {Promise<{ success: true }>}
 * @throws If the destroy call returns an error result
 */
export async function deleteImage(publicId) {
  const result = await cloudinary.uploader.destroy(publicId);
  // Cloudinary returns { result: 'ok' } on success, 'not found' on missing asset
  if (result?.result !== 'ok' && result?.result !== 'not found') {
    throw new Error(`Cloudinary delete failed: ${result?.result || 'unknown'}`);
  }
  return { success: true };
}
