// backend/utils/sendEmail.js
const nodemailer = require('nodemailer');
require('dotenv').config(); // Load .env variables from the backend directory root

const sendEmail = async (options) => {
    // 1. Validate environment variables
    const requiredEnv = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_FROM'];
    const missingEnv = requiredEnv.filter(key => !process.env[key]);
    if (missingEnv.length > 0) {
        console.error(`ERROR: Missing required environment variables for email: ${missingEnv.join(', ')}`);
        throw new Error(`Email configuration missing: ${missingEnv.join(', ')}`);
    }

    // 2. Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587', 10),
        // secure: true for 465, false for other ports (like 587 which uses STARTTLS)
        secure: parseInt(process.env.EMAIL_PORT || '587', 10) === 465,
        auth: {
            user: process.env.EMAIL_USER, // Your email address from .env
            pass: process.env.EMAIL_PASS, // Your email App Password from .env
        },
        // Increased timeouts (as requested before, adjust if needed)
        connectionTimeout: 30000,
        greetingTimeout: 30000,
        socketTimeout: 30000,
    });

    // 3. Define the email options - NOW INCLUDES HTML
    const mailOptions = {
        from: process.env.EMAIL_FROM,   // Sender address (e.g., '"Your App" <you@example.com>')
        to: options.email,              // List of recipients
        subject: options.subject,         // Subject line
        text: options.message,          // Plain text body (fallback)
        html: options.html              // **** ADDED: HTML body content ****
    };

    // Optional: Automatically generate a basic text version from HTML if only HTML is provided
    // This helps ensure clients that don't render HTML still see *something*.
    if (!mailOptions.text && mailOptions.html) {
        // This is a very basic conversion, libraries like `html-to-text` offer better results
        mailOptions.text = mailOptions.html.replace(/<style([\s\S]*?)<\/style>/gi, '') // Remove style blocks
                                           .replace(/<script([\s\S]*?)<\/script>/gi, '') // Remove script blocks
                                           .replace(/<[^>]*>?/gm, ' ') // Remove remaining tags, replace with space
                                           .replace(/\s+/g, ' ').trim(); // Collapse whitespace
        console.log("Generated basic text fallback from HTML content.");
    }


    // 4. Send the email
    try {
        console.log(`Attempting to send email via ${process.env.EMAIL_HOST} to ${options.email}...`);
        const info = await transporter.sendMail(mailOptions); // sendMail now uses the object with `html`

        console.log('Message sent successfully!');
        console.log('Message ID: %s', info.messageId);
        // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info)); // Only works with ethereal test accounts

    } catch (error) {
        console.error('Error sending email:', error); // Log the detailed error object

        // Your existing detailed error logging based on codes
        if (error.code === 'ETIMEDOUT' || error.code === 'ESOCKET' || error.code === 'ECONNRESET' || error.code === 'ECONNREFUSED') {
            console.error('Network Error: Connection to the email server failed or timed out. Check firewall/network connectivity and EMAIL_HOST/EMAIL_PORT in .env.');
        } else if (error.code === 'EAUTH' || (error.responseCode && error.responseCode === 535)) {
            console.error('Authentication Error: Invalid Email username or App Password in .env file, or App Password/security settings not configured correctly.');
        } else if (error.code === 'EENVELOPE' || (error.responseCode && (error.responseCode === 550 || error.responseCode === 553 || error.responseCode === 554))) {
             console.error('Envelope Error: Invalid sender or recipient email address format, or sender address rejected by the mail server.');
        } else if (error.response && error.response.includes('TLS')) {
             console.error('TLS Error: Problem establishing secure connection. Check EMAIL_PORT (587 requires secure: false) and ensure TLS is supported/enabled.');
        }

        // Re-throw the error so the calling function knows it failed
        throw new Error(`Email could not be sent. Reason: ${error.message || 'Server Error'}`);
    }
};

module.exports = sendEmail;