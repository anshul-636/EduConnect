/**
 * cloudinaryUpload.js — Multer + Cloudinary storage for production.
 *
 * In production (NODE_ENV=production) files go straight to Cloudinary.
 * In development files are stored locally (existing behaviour).
 *
 * Usage: replace `upload` from localUpload with `upload` from here.
 */

const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { localUpload } = require('./localUpload');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const isProduction = process.env.NODE_ENV === 'production';

let upload;

if (isProduction && process.env.CLOUDINARY_CLOUD_NAME) {
    const storage = new CloudinaryStorage({
        cloudinary,
        params: async (req, file) => ({
            folder: 'educonnect/resources',
            resource_type: 'auto', // handles PDFs, images, etc.
            public_id: `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.]/g, '')}`,
        }),
    });
    upload = multer({ storage, limits: { fileSize: 25 * 1024 * 1024 } });
    console.log('☁️  File uploads → Cloudinary');
} else {
    upload = localUpload;
    if (isProduction) {
        console.warn('⚠️  NODE_ENV=production but CLOUDINARY_CLOUD_NAME is not set — falling back to local storage (files will be lost on redeploy).');
    }
}

module.exports = { upload, cloudinary };