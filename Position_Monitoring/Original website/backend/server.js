require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Define allowed frontends
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL // Make sure this is set in your Render environment variables!
];

// Single, clean CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // 1. Allow requests with no origin (like your ESP32 or Postman)
    if (!origin) return callback(null, true);

    // 2. Allow allowed frontend domains
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } 
    
    // 3. Actually block unauthorized origins (Good security practice)
    else {
      console.log("❌ Blocked by CORS:", origin);
      return callback(new Error('Not allowed by CORS')); 
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  // 🟢 CRITICAL FIX: Added 'x-esp32-key' so your ESP32 requests are accepted
  allowedHeaders: ["Content-Type", "Authorization", "x-esp32-key"] 
}));

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/esp32'));
app.use('/api', require('./routes/student'));
app.use('/api', require('./routes/teacher'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB & Start Server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
