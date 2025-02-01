app.post('/api/analyze-audio', async (req, res) => {
  try {
    // Add some logging to debug
    console.log('Received audio analysis request');
    // ... rest of the endpoint code ...
  } catch (error) {
    console.error('Error analyzing audio:', error);
    res.status(500).json({ error: 'Failed to analyze audio' });
  }
}); 