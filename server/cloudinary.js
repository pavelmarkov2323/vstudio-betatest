const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

console.log('Cloudinary env:', process.env.CLOUDINARY_CLOUD_NAME, process.env.CLOUDINARY_API_KEY ? 'key set' : 'no key', process.env.CLOUDINARY_API_SECRET ? 'secret set' : 'no secret');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    public_id: (req, file) => {
      if (!req.session || !req.session.userId) {
        console.error('No userId in session for public_id generation');
        return `user_unknown_${Date.now()}`;
      }
      return `user_${req.session.userId}`;
    }
  },
});

module.exports = { cloudinary, storage };