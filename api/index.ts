import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';

const app = express();

app.use(cors({
  origin: ['https://coach.karlgourgue.com', 'https://coldcallcoach.vercel.app'],
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/api/analyze-audio', async (req, res) => {
  try {
    console.log('Received audio analysis request');
    const response = await openai.audio.transcriptions.create({
      file: req.body,
      model: "whisper-1",
    });
    res.json({ text: response.text });
  } catch (error) {
    console.error('Error analyzing audio:', error);
    res.status(500).json({ error: 'Failed to analyze audio' });
  }
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app; 