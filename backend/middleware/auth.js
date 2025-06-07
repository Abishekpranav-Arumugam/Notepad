const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function (req, res, next) {
    console.log("Auth Middleware: Received headers:", req.headers); // Log all headers

    const authHeader = req.header('Authorization');

    if (!authHeader) {
        console.error("Auth Middleware: No Authorization header found.");
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        console.error("Auth Middleware: Invalid token format.");
        return res.status(401).json({ msg: 'Token format is invalid (must be "Bearer <token>"), authorization denied' });
    }
    const token = parts[1];
    // console.log("Auth Middleware: Received Token:", token); // Log token if needed (be careful in production)

    try {
        console.log("Auth Middleware: Verifying token...");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Auth Middleware: Token Verified. Decoded Payload:", decoded); // Log decoded payload

        // --- Expect Firebase uid in the payload ---
        if (!decoded.user || !decoded.user.uid) {
            console.error("Auth Middleware: Invalid JWT payload structure (missing user.uid):", decoded);
            return res.status(401).json({ msg: 'Token payload is invalid, authorization denied' });
        }

        // Attach user object with Firebase uid
        req.user = {
            uid: decoded.user.uid
        };
        console.log("Auth Middleware: Attached req.user:", req.user);
        next(); // Proceed to the next middleware/route handler

    } catch (err) {
        console.error("Auth Middleware: Token Verification Error:", err.message);
        // Send specific error message based on JWT error type
        if (err.name === 'TokenExpiredError') {
            res.status(401).json({ msg: 'Token has expired' });
        } else if (err.name === 'JsonWebTokenError') {
            res.status(401).json({ msg: 'Token is invalid' });
        } else {
            res.status(401).json({ msg: 'Token is not valid or session error' });
        }
    }
};