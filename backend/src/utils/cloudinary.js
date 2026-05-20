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
    
    // Use 'image' resource type for PDFs so Cloudinary serves them correctly for browser viewing.
    // For other files, use 'auto'.
    const resourceType = isPdf ? 'image' : 'auto';
    const baseName = file.originalname.split('.')[0].replace(/[^a-zA-Z0-9]/g, '');
    const publicId = `${baseName}-${Date.now()}`;

    return {
      folder: 'educonnect/resources',
      allowed_formats: ['pdf', 'jpg', 'jpeg', 'png', 'mp4'],
      resource_type: resourceType,
      public_id: publicId,
    };

  },
});

const upload = multer({ storage, limits: { fileSize: 1024 * 1024 * 1024 } });

module.exports = { cloudinary, upload };