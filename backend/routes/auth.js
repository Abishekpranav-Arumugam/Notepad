// backend/routes/auth.js
const express = require('express');
const router = express.Router();
// Removed bcrypt - Firebase handles hashing
const admin = require('firebase-admin'); // Already initialized in server.js
const jwt = require('jsonwebtoken');
// Removed crypto - using Firebase reset links
const sendEmail = require('../utils/sendEmail'); // Still used for notifications
require('dotenv').config();


// @route   POST api/auth/forgot-password
// @desc    Trigger Firebase password reset email
// @access  Public
const APP_NAME = process.env.APP_NAME || "Rice Mart"; // Change this default!

// --- Helper Function to Send YOUR App's JWT ---
// Takes Firebase user info (like uid) and sends your custom JWT
const sendTokenResponse = (firebaseUid, statusCode, res) => {
    // --- Payload now uses Firebase UID ---
    const payload = {
        user: {
            uid: firebaseUid, // Use Firebase UID
        },
    };

    try {
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '1h' }
        );
        res.status(statusCode).json({ token }); // Send the token back
    } catch (err) {
         console.error("JWT Signing Error:", err);
         // Avoid throwing here, send an error response instead
         // Don't send response if headers already sent (edge case)
         if (!res.headersSent) {
            res.status(500).json({ msg: 'Error generating authentication token' });
         }
    }
};


// @route   POST api/auth/signup
// @desc    Register user in Firebase Auth & return YOUR token
// @access  Public
router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username) {
        return res.status(400).json({ msg: 'Please provide username' });
    }
    if (!email) {
        return res.status(400).json({ msg: 'Please provide email' });
    }
    if (!password) {
        return res.status(400).json({ msg: 'Please provide password' });
    }
    if (password.length < 6) {
        return res.status(400).json({ msg: 'Password must be at least 6 characters' });
    }

    try {
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password,
            displayName: username,
        });

        console.log(`Successfully created Firebase user: ${userRecord.uid} for email ${email}`);

        sendTokenResponse(userRecord.uid, 201, res); 

    } catch (err) {
        console.error("Firebase Signup Error:", err);
        if (err.code === 'auth/email-already-exists') {
            return res.status(400).json({ msg: 'Email already registered.' });
        }
        if (err.code === 'auth/invalid-password') {
             return res.status(400).json({ msg: `Password is invalid: ${err.message}` });
        }
         if (err.code === 'auth/invalid-email') {
             return res.status(400).json({ msg: `Email format is invalid: ${err.message}` });
         }
        // Generic error
        res.status(500).json({ msg: 'Server error during user registration' });
    }
});


router.post('/google', async (req, res) => {
    const { token: idToken } = req.body;

    if (!idToken) {
        return res.status(400).json({ msg: 'Firebase ID token is required' });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { uid, email, name, picture } = decodedToken; // name/picture might not be present

        console.log('Google Sign-In Token Verified. Firebase UID:', uid, 'Email:', email);

        sendTokenResponse(uid, 200, res);

    } catch (error) {
        console.error('Error verifying Firebase token during Google Sign-In:', error);
        if (error.code === 'auth/id-token-expired') {
            return res.status(401).json({ msg: 'Firebase token has expired. Please sign in again.' });
        }
        if (error.code && error.code.startsWith('auth/')) {
            // Catch other Firebase verification errors
            return res.status(401).json({ msg: `Invalid Firebase token: ${error.message}` });
        }
        res.status(500).json({ msg: 'Server error during Google sign-in processing' });
    }
});


// @route   POST api/auth/token-signin  <- NEW ROUTE replacing /login
// @desc    Verifies Firebase ID Token (from client-side email/pass login) & issues YOUR JWT
// @access  Public
router.post('/token-signin', async (req, res) => {
    const { token: idToken } = req.body;

    if (!idToken) {
        return res.status(400).json({ msg: 'Firebase ID token is required for login' });
    }

    try {
        // Verify the ID token provided by the client after successful Firebase login
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
        console.log(`Token verified for email/pass login. UID: ${uid}, Email: ${decodedToken.email}`);

        // Issue YOUR application's JWT
        sendTokenResponse(uid, 200, res);

    } catch (error) {
         console.error('Error verifying Firebase token during token sign-in:', error);
        if (error.code === 'auth/id-token-expired') {
            return res.status(401).json({ msg: 'Firebase token has expired. Please sign in again.' });
        }
         if (error.code && error.code.startsWith('auth/')) {
             // Catch other Firebase verification errors
            return res.status(401).json({ msg: `Invalid Firebase token: ${error.message}` });
         }
         res.status(500).json({ msg: 'Server error during token sign-in processing' });
    }
});

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ msg: 'Please provide an email address' });
    }

    try {
        if (!process.env.FRONTEND_URL) {
            console.error("FATAL: FRONTEND_URL environment variable is not set. Cannot generate password reset link.");
            return res.status(500).json({ msg: 'Server configuration error occurred.' });
        }

        const actionCodeSettings = {
            url: `${process.env.FRONTEND_URL}/login?resetSuccess=true`,
            handleCodeInApp: false
        };

        console.log(`Requesting Firebase password reset link for ${email} with continue URL: ${actionCodeSettings.url}`);
        const link = await admin.auth().generatePasswordResetLink(email, actionCodeSettings);
        console.log(`Successfully generated Firebase password reset link for ${email}.`);

        const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        /* Basic CSS Reset */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        table { border-collapse: collapse !important; }
        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; font-family: Arial, sans-serif; }

        /* Main Styles */
        .container {
            padding: 20px;
            background-color: #f4f4f4;
        }
        .content {
            max-width: 600px;
            margin: auto;
            background-color: #ffffff;
            padding: 30px;
            border-radius: 5px;
            line-height: 1.6;
            color: #333333;
        }
        .button {
            display: inline-block;
            padding: 12px 25px;
            margin: 20px 0;
            background-color: #007bff; /* Blue button */
            color: #ffffff !important; /* Ensure text is white */
            text-decoration: none;
            font-weight: bold;
            border-radius: 5px;
            text-align: center;
        }
        .fallback-link {
            margin-top: 15px;
            font-size: 0.9em;
            color: #555555;
        }
        .footer {
            margin-top: 20px;
            font-size: 0.8em;
            color: #777777;
            text-align: center;
        }
        a { /* Make links blue by default */
           color: #007bff;
           text-decoration: none; /* Optional: remove underline */
        }
        a:hover { /* Optional: Add underline on hover */
            text-decoration: underline;
        }
    </style>
</head>
<body style="margin: 0 !important; padding: 0 !important; background-color: #f4f4f4;">
    <div class="container" style="padding: 20px; background-color: #f4f4f4;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
                <td>
                    <div class="content" style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 5px; line-height: 1.6; color: #333333;">
                        <h2 style="color: #333333;">Password Reset Request</h2>
                        <p>Hello,</p>
                        <p>We received a request to reset the password for the ${APP_NAME} account associated with the email address: <strong>${email}</strong>.</p>
                        <p>To reset your password, please click the button below. Please note that this link is time-sensitive and will expire for security reasons.</p>

                        <div style="text-align: center;"> <!-- Center the button -->
                          <a href="${link}" target="_blank" class="button" style="display: inline-block; padding: 12px 25px; margin: 20px 0; background-color: #007bff; color: #ffffff !important; text-decoration: none; font-weight: bold; border-radius: 5px; text-align: center;">Reset Your Password</a>
                        </div>

                        <p class="fallback-link" style="margin-top: 15px; font-size: 0.9em; color: #555555;">
                          If the button above does not work, please copy and paste the following URL into your web browser:<br>
                          <a href="${link}" target="_blank" style="word-break: break-all; color: #007bff;">${link}</a>
                        </p>

                        <p>If you did not request a password reset, you do not need to take any further action and can safely ignore this email. Your account password will remain unchanged.</p>

                        <p>Sincerely,<br>The ${APP_NAME} Team</p>
                    </div>
                    <div class="footer" style="margin-top: 20px; font-size: 0.8em; color: #777777; text-align: center;">
                        <p>This email was sent from ${APP_NAME} regarding your account security.</p>
                        <p>© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
                    </div>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
        `;
        
            try {
                console.log(`Attempting to send password reset link via custom HTML email to ${email}...`);
                await sendEmail({
                    email: email,
                    subject: `Reset Your Password for ${APP_NAME}`, // Dynamic subject
                    // text: message, // Provide a plain text version as fallback if desired
                    html: emailHtml // Send the HTML version
                });
                console.log(`Custom password reset email containing the link sent successfully to ${email}.`);
                res.status(200).json({ msg: 'Password reset link sent. Please check your email (including spam folder) for instructions.' });

            } catch (emailErr) {
                console.error('Failed to send custom email with reset link:', emailErr);
                res.status(500).json({ msg: 'Failed to send password reset email. Please try again later or contact support.' });
            }

        } catch (err) {
             // ... (existing error handling for Firebase link generation remains the same) ...
             console.error('Forgot Password - Firebase Link Generation Error:', err);
              if (err.code === 'auth/missing-continue-uri' || err.code === 'auth/invalid-continue-uri') {
                  console.error("Error related to continue URL. Check actionCodeSettings and Firebase authorized domains.");
                   return res.status(500).json({ msg: 'Server configuration error during password reset.' });
              }
             if (err.code === 'auth/invalid-email') {
                  return res.status(400).json({ msg: 'Invalid email format.' });
             }
              if(err.code !== 'auth/user-not-found'){
                  res.status(500).json({ msg: 'Could not generate password reset link.' });
              } else {
                 res.status(200).json({ msg: 'If an account with that email exists, password reset instructions will be sent.' });
              }
        }
    });

module.exports = router;