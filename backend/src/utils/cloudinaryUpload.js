
/**
 * cloudinaryUpload.js
 * 
 * In production: uploads go to Cloudinary using memoryStorage + stream upload.
 * In development: falls back to local disk (localUpload).
 * 
 * No multer-storage-cloudinary needed — uses cloudinary v2 SDK directly.
 */

const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');
const { localUpload } = require('./localUpload');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const isProduction = process.env.NODE_ENV === 'production'
    && process.env.CLOUDINARY_CLOUD_NAME;

// Memory storage — we stream the buffer to Cloudinary ourselves
const memoryUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
});

/**
 * Upload a buffer to Cloudinary and return the secure URL.
 * Call this in your controller/service after multer has run.
 * 
 * Usage:
 *   const url = await uploadToCloudinary(req.file.buffer, req.file.originalname);
 */
async function uploadToCloudinary(buffer, originalname) {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'educonnect/resources',
                resource_type: 'auto',
                public_id: `${Date.now()}-${originalname.replace(/[^a-zA-Z0-9.]/g, '')}`,
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url);
            }
        );
        Readable.from(buffer).pipe(uploadStream);
    });
}

// Middleware: in production uses memoryStorage, in dev uses disk
const upload = isProduction ? memoryUpload : localUpload;

module.exports = { upload, uploadToCloudinary, cloudinary };