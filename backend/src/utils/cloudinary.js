const cloudinary = require('cloudinary').v2;
const { localUpload } = require('./localUpload');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = localUpload;

module.exports = { cloudinary, upload };