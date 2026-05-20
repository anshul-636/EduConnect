const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const ext = file.originalname.split('.').pop();
    const isPdf = file.mimetype === 'application/pdf';
    
    // For raw files (like PDF), we must embed the extension in the public_id itself
    // to ensure it downloads with the correct file type.
    const baseName = file.originalname.split('.')[0].replace(/[^a-zA-Z0-9]/g, '');
    const publicId = `${baseName}-${Date.now()}${isPdf ? '.pdf' : ''}`;

    return {
      folder: 'educonnect/resources',
      allowed_formats: ['pdf', 'jpg', 'jpeg', 'png', 'mp4'],
      resource_type: isPdf ? 'raw' : 'auto',
      public_id: publicId,
    };
  },
});

const upload = multer({ storage, limits: { fileSize: 1024 * 1024 * 1024 } });

module.exports = { cloudinary, upload };