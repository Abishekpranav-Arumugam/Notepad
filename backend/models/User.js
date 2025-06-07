// \backend\models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide username'],
    unique: true,
    trim: true,
  },
  email: { // Assuming you add an email field during signup or later
    type: String,
    required: [true, 'Please provide email'],
    match: [ // Basic email format validation
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email',
    ],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: 6,
    select: false, // Don't send password back by default on queries
  },
  // --- Fields for Password Reset ---
  passwordResetToken: String,
  passwordResetExpires: Date,
  // --- End Password Reset Fields ---
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// --- Existing Pre-save hook for hashing password ---
UserSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  // Delete password confirm field if you have one
  // this.passwordConfirm = undefined;

  // Clear reset token fields if password is changed directly (not via reset flow)
  // Check if it's being changed *and* not via the reset mechanism
  if (this.isModified('password') && this.passwordResetToken) {
    this.passwordResetToken = undefined;
    this.passwordResetExpires = undefined;
  }

  next();
});

// --- Existing Method to compare password ---
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// --- Method to generate and hash password reset token ---
// Using crypto instead of another library
const crypto = require('crypto');

UserSchema.methods.getResetPasswordToken = function () {
  // 1. Generate token (raw, random bytes)
  const resetToken = crypto.randomBytes(32).toString('hex'); // Secure random string

  // 2. Hash token (for storing in DB - more secure than storing raw token)
  // Use SHA256 for hashing the token (bcrypt is overkill here)
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // 3. Set token expiration time (e.g., 10 minutes)
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 mins in milliseconds

  // 4. Return the *unhashed* token (to be sent via email)
  return resetToken;
};


module.exports = mongoose.model('User', UserSchema);