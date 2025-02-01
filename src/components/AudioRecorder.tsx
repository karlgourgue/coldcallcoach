console.log('API URL:', import.meta.env.VITE_API_URL);

try {
  console.log('Making request to:', `${import.meta.env.VITE_API_URL}/api/analyze-audio`);
  console.log('Request body:', h);
  
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/analyze-audio`, {
    method: 'POST',
    body: h
  });

  console.log('Response status:', response.status);
  const responseText = await response.text();
  console.log('Response text:', responseText);

  if (!response.ok) {
    throw new Error(`Failed to analyze audio: ${response.status} ${responseText}`);
  }
} catch (error) {
  console.error('Error details:', error);
  throw error;
} 