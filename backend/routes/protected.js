// backend/routes/protected.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth'); // Import the auth middleware
const admin = require('firebase-admin'); // Import Firebase Admin

// @route   GET api/protected
// @desc    Get user data from Firebase Auth
// @access  Private (Requires valid JWT)
router.get('/', authMiddleware, async (req, res) => {
    try {
        // req.user.uid is set by the authMiddleware using Firebase UID from JWT
        const uid = req.user.uid;

        // Fetch user data directly from Firebase Authentication
        const userRecord = await admin.auth().getUser(uid);

        // Select ONLY the data you want to send back to the frontend
        const userData = {
            uid: userRecord.uid,
            email: userRecord.email,
            username: userRecord.displayName, // Use displayName as username
            emailVerified: userRecord.emailVerified,
            creationTime: userRecord.metadata.creationTime,
            lastSignInTime: userRecord.metadata.lastSignInTime,
            // photoURL: userRecord.photoURL, // Uncomment if needed
            // Add any custom claims if you set them: userRecord.customClaims
        };

        res.json({
             msg: 'Successfully accessed protected route!',
             user: userData // Send sanitized Firebase user data
        });

    } catch (err) {
        console.error("Error fetching user data from Firebase:", err);
         if (err.code === 'auth/user-not-found') {
             return res.status(404).json({ msg: 'User associated with token not found in Firebase.' });
         }
        res.status(500).json({ msg: 'Server Error retrieving user data' });
    }
});

module.exports = router;