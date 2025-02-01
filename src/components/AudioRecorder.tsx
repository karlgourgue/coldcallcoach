console.log('API URL:', import.meta.env.VITE_API_URL);

const response = await fetch(`${import.meta.env.VITE_API_URL}/api/analyze-audio`, {
  method: 'POST',
  body: h
}); 