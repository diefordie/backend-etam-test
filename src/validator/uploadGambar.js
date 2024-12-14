const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // Limit to 2MB
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true); // Accept image files
      } else {
        cb(new Error('Only image files are allowed!'), false); // Reject non-images
      }
    },
  });
  