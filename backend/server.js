// backend/server.js
const express = require('express');
const connectDB = require('./config/db'); // Ensure this path is correct
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config(); // For local development

const User = require('./models/User');
// const Message = require('./models/Message');

// --- Firebase Admin Initialization ---
try {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH;

    if (process.env.NODE_ENV === 'production' && process.env.GOOGLE_CLOUD_PROJECT && !serviceAccountPath && !process.env.FIREBASE_CREDENTIALS_JSON) {
        console.log('Attempting to initialize Firebase Admin SDK with GAE default credentials...');
        admin.initializeApp();
        console.log('Firebase Admin SDK Initialized with GAE default credentials.');
    } else if (process.env.FIREBASE_CREDENTIALS_JSON) {
        console.log('Attempting to initialize Firebase Admin SDK with JSON credentials from env var...');
        const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS_JSON);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('Firebase Admin SDK Initialized with JSON credentials.');
    } else if (serviceAccountPath) {
        console.log(`Attempting to initialize Firebase Admin SDK with path: ${serviceAccountPath}`);
        const fullPath = require('path').resolve(__dirname, serviceAccountPath);
        const serviceAccount = require(fullPath);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('Firebase Admin SDK Initialized with service account file path.');
    } else {
        throw new Error('Firebase Admin SDK credentials not configured. Set FIREBASE_SERVICE_ACCOUNT_KEY_PATH, FIREBASE_CREDENTIALS_JSON, or ensure GAE service account has permissions.');
    }
} catch (error) {
    console.error('!!! Firebase Admin SDK Initialization Failed:', error.message, error.stack);
}
// --- End Firebase Admin Initialization ---

const app = express();

connectDB();

app.use(express.json({ extended: false }));

// --- CORS Configuration (Updated Block) ---
const allowedOrigins = [
    'http://localhost:3000' // Always allow local development
];

// Add the production URL from environment variables if it exists
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

const corsOptions = {
  origin: function (origin, callback) {
    // 'origin' is the URL of the site making the request

    // Check if the incoming origin is a Vercel preview URL
    const isVercelPreview = origin && origin.endsWith('.vercel.app');

    // Allow the request if:
    // 1. It has no origin (like Postman, curl, server-to-server)
    // 2. Its origin is in our explicit `allowedOrigins` list
    // 3. Its origin is a Vercel preview URL
    if (!origin || allowedOrigins.includes(origin) || isVercelPreview) {
      if (isVercelPreview && !allowedOrigins.includes(origin)) {
        console.log(`CORS: Allowing Vercel preview origin: ${origin}`);
      }
      callback(null, true);
    } else {
      console.warn(`CORS: Blocking origin '${origin}'`);
      callback(new Error(`Origin '${origin}' not allowed by CORS`));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
// --- End CORS Configuration ---

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/protected', require('./routes/protected'));
app.use('/api/notes', require('./routes/notes'));

app.get('/', (req, res) => res.send('Backend API for Samplereact is Running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server for Samplereact started on port ${PORT}`);
  console.log(`Allowed CORS origins: ${allowedOrigins.join(', ')}`);
  if (process.env.NODE_ENV === 'production') {
    console.log('...and all Vercel preview domains (*.vercel.app)');
  }
});