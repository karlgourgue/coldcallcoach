import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { analyzeAudio } from './analyze';
import { errorHandler, ValidationError } from './middleware/errorHandler';

const router = express.Router();

// Set up multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('audio/')) {
      cb(new ValidationError('Only audio files are allowed'));
      return;
    }
    cb(null, true);
  },
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB max file size
  }
});

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Define the /analyze endpoint
router.post('/analyze', upload.single('audio'), async (req: MulterRequest, res: Response, next: NextFunction) => {
  try {
    console.log('Received request to analyze audio');

    if (!req.file) {
      throw new ValidationError('No audio file provided');
    }

    console.log('File details:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Create a File object from the buffer
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
    const audioFile = new File([blob], req.file.originalname, {
      type: req.file.mimetype,
    });

    console.log('Starting audio analysis...');
    const feedback = await analyzeAudio(audioFile);
    console.log('Analysis complete');
    
    res.json(feedback);
  } catch (error) {
    next(error); // Pass errors to the error handling middleware
  }
});

// Apply error handling middleware
router.use(errorHandler);

export default router; 