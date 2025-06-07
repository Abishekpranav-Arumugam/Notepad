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
        // When running on GAE, the path is relative to the service root (the 'backend' folder)
        const fullPath = require('path').resolve(__dirname, serviceAccountPath); // More robust path resolution
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
    // Consider if the app can run without Firebase Admin. If not, process.exit(1) might be appropriate.
}
// --- End Firebase Admin Initialization ---

const app = express();

connectDB();

app.use(express.json({ extended: false }));

// --- CORS Configuration ---
const allowedOrigins = [];

if (process.env.NODE_ENV === 'production' && process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
  console.log(`CORS: Production mode. Allowing origin: ${process.env.FRONTEND_URL}`);
} else {
  // For local development, allow common frontend dev ports
  allowedOrigins.push('http://localhost:3000'); // Create React App default
  // Add any other local dev ports if needed, e.g., 'http://localhost:5173' for Vite
  console.log(`CORS: Development mode. Allowing origins: ${allowedOrigins.join(', ')}`);
}

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    // OR if the origin is in our allowed list
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS: Origin '${origin}' not allowed. Allowed origins: ${allowedOrigins.join(', ')}`);
      callback(new Error(`Origin '${origin}' not allowed by CORS`));
    }
  },
  credentials: true, // Important if you're dealing with cookies or Authorization headers
};
app.use(cors(corsOptions));
// --- End CORS Configuration ---

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/protected', require('./routes/protected'));
app.use('/api/notes', require('./routes/notes'));

app.get('/', (req, res) => res.send('Backend API for Samplereact is Running'));

const PORT = process.env.PORT || 5000; // GAE provides PORT
app.listen(PORT, () => {
  console.log(`Server for Samplereact started on port ${PORT}`);
  if (process.env.NODE_ENV === 'production') {
    console.log(`Backend expecting frontend requests from: ${process.env.FRONTEND_URL}`);
  }
});