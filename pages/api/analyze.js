// This handler processes the request and adds the appropriate CORS headers.
export default async function handler(req, res) {
  // Set CORS header – allow requests from this origin
  res.setHeader('Access-Control-Allow-Origin', 'https://coach.karlgourgue.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Your API logic (e.g., analyzing audio) goes here...
    res.status(200).json({ message: 'Audio analyzed successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
} 