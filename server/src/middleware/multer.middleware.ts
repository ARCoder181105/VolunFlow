import multer from 'multer';

// Configure multer to store files in memory as buffers
const storage = multer.memoryStorage();

// Create the multer instance with configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB file size limit
  },
});

export default upload;