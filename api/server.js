// Add CORS middleware configuration
app.use(cors({
  origin: [
    'https://coach.karlgourgue.com',
    // Keep any other allowed origins that already exist
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
})); 