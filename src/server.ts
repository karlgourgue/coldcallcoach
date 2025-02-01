import 'dotenv/config';
import express, { Request, Response } from 'express';
import multer from 'multer';
import cors from 'cors';
import serverless from 'serverless-http';
import { analyzeAudio } from './api/analyze';

// Debug logging (will only show first few characters for security)
console.log('API Key loaded:', process.env.OPENAI_API_KEY?.slice(0, 10) + '...');

if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not set in environment variables');
  process.exit(1);
} else if (process.env.OPENAI_API_KEY.includes('your_api')) {
  console.error('OPENAI_API_KEY is still set to placeholder value');
  process.exit(1);
}

const app = express();
const upload = multer({ 
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('audio/')) {
      cb(new Error('Only audio files are allowed'));
      return;
    }
    cb(null, true);
  },
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB max file size
  }
});

app.use(cors());
app.use(express.json());

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

app.post('/api/analyze', upload.single('audio'), async (req: MulterRequest, res: Response): Promise<void> => {
  try {
    console.log('Received request to analyze audio');
    
    if (!req.file) {
      console.error('No file provided in request');
      res.status(400).json({ error: 'No audio file provided' });
      return;
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
    console.error('Error processing audio:', error);
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to analyze audio' });
    }
  }
});

// Error handling middleware for multer errors
app.use((err: any, req: Request, res: Response, next: express.NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File is too large. Maximum size is 25MB.' });
    }
    return res.status(400).json({ error: err.message });
  }
  
  if (err.message === 'Only audio files are allowed') {
    return res.status(400).json({ error: err.message });
  }
  
  next(err);
});

// Wrap the Express app with serverless-http and export the handler
export default serverless(app); 