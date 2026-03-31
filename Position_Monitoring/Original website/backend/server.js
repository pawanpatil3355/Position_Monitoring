require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// 🟢 Completely open CORS configuration
app.use(cors({
  origin: true, // This automatically allows any origin that requests access
  credentials: true, // Kept this so your /api/auth routes (cookies/sessions) still work
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  // Ensure the ESP32 custom header is still allowed
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
