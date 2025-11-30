// server.js
const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');

dotenv.config();
const app = express();

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Read FRONTEND_URL from env (fall back to localhost for local dev)
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// CORS options
const corsOptions = {
  origin: FRONTEND_URL,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','Accept'],
  credentials: true,
};
app.use(cors(corsOptions));

// Extra manual handler to ensure OPTIONS preflight always succeeds
app.use((req, res, next) => {
  // Mirror allowed origin for the response
  res.header('Access-Control-Allow-Origin', FRONTEND_URL);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');

  // If preflight request, respond immediately
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Serve uploaded images statically (development). For production consider Cloudinary/S3.
app.use('/uploads', express.static(path.join(__dirname, 'src', 'uploads')));

// Routes
const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');

app.use('/auth', authRoutes);
app.use('/products', productRoutes);

// basic health check
app.get('/', (req, res) => res.send('Marketplace API running'));

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
