import { Router } from 'express';
import upload from '../middleware/multer.middleware.js';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

const router = Router();

// The route will be POST /api/upload
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  // Create a stream from the file buffer
  const stream = cloudinary.uploader.upload_stream(
    {
      folder: 'volunflow', // Optional: save files in a specific folder in Cloudinary
      resource_type: 'auto',
    },
    (error, result) => {
      if (error) {
        console.error('Cloudinary Upload Error:', error);
        return res.status(500).json({ message: 'Failed to upload image.' });
      }
      if (!result) {
        return res.status(500).json({ message: 'Cloudinary did not return a result.' });
      }

      // Send back the secure URL of the uploaded image
      res.status(201).json({ url: result.secure_url });
    }
  );

  // Pipe the file buffer into the Cloudinary upload stream
  streamifier.createReadStream(req.file.buffer).pipe(stream);
});

export default router;