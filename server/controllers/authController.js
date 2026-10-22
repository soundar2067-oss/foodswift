const User = require('../models/User');
const { signToken } = require('../utils/jwt');

// Send JWT in cookie and JSON response
const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id, user.role);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  res.cookie('token', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    user,
  });
};

// Register customer or partner
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, dietaryPreference } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Default registration role is customer unless specific role chosen
    const userRole = ['customer', 'restaurant', 'delivery'].includes(role) ? role : 'customer';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      role: userRole,
      dietaryPreference: dietaryPreference || 'any',
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password').populate('restaurant');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. No user found with this email.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account suspended. Please contact administrator.',
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// Logout user
exports.logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

// Get current user profile
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('restaurant');
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Update profile
exports.updateMe = async (req, res, next) => {
  try {
    const fieldsToUpdate = {};
    if (req.body.name) fieldsToUpdate.name = req.body.name;
    if (req.body.phone) fieldsToUpdate.phone = req.body.phone;
    if (req.body.dietaryPreference) fieldsToUpdate.dietaryPreference = req.body.dietaryPreference;
    if (req.body.avatar) fieldsToUpdate.avatar = req.body.avatar;

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Forgot password placeholder for demo
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase() });
  if (!user) {
    return res.status(404).json({ success: false, message: 'No account registered with this email.' });
  }

  res.status(200).json({
    success: true,
    message: 'Password reset link sent to registered email (Demo mode: reset token generated).',
    resetToken: 'demo-reset-token-' + Date.now(),
  });
};

// Reset password
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// ─── Mobile OTP (Demo / Simulated) ────────────────────────────────────────────

// Generate a 6-digit OTP and "send" it (demo: returned in response body)
exports.sendOtp = async (req, res, next) => {
  try {
    const { mobileNumber } = req.body;
    if (!mobileNumber) {
      return res.status(400).json({ success: false, message: 'Please provide a mobile number.' });
    }

    // Normalize: keep only digits, must be 10 digits
    const digits = mobileNumber.replace(/\D/g, '');
    if (digits.length !== 10) {
      return res.status(400).json({ success: false, message: 'Enter a valid 10-digit Indian mobile number.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Upsert OTP into user if they exist (phone field), or store in a temp record
    // We store against mobileNumber field for any user who has it, else we just return OTP
    await User.updateMany(
      { mobileNumber: digits },
      { $set: { otpCode: otp, otpExpiry: expiry } }
    );

    // In production: call Twilio / MSG91 here
    // For DEMO: return OTP in response so examiner can test without SMS
    console.log(`[FoodSwift OTP] Mobile: ${digits} → OTP: ${otp} (expires in 5 min)`);

    res.status(200).json({
      success: true,
      message: `OTP sent to +91 ${digits.slice(0, 5)}XXXXX (Demo mode — OTP shown below)`,
      // DEMO ONLY — remove this field in production
      demoOtp: otp,
    });
  } catch (error) {
    next(error);
  }
};

// Verify OTP → log in or complete registration
exports.verifyOtp = async (req, res, next) => {
  try {
    const { mobileNumber, otp, name, email, password, dietaryPreference } = req.body;

    if (!mobileNumber || !otp) {
      return res.status(400).json({ success: false, message: 'Mobile number and OTP are required.' });
    }

    const digits = mobileNumber.replace(/\D/g, '');

    // Find user with this mobile number, selecting OTP fields
    let user = await User.findOne({ mobileNumber: digits }).select('+otpCode +otpExpiry +password');

    // ── Case 1: Login via OTP (user must already exist with this mobile) ──────
    if (!name && !email) {
      if (!user) {
        return res.status(404).json({ success: false, message: 'No account found with this mobile number. Please register first.' });
      }

      if (!user.otpCode || user.otpCode !== otp) {
        return res.status(400).json({ success: false, message: 'Invalid OTP. Please check and try again.' });
      }
      if (!user.otpExpiry || new Date() > user.otpExpiry) {
        return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
      }

      user.isPhoneVerified = true;
      user.otpCode = undefined;
      user.otpExpiry = undefined;
      await user.save({ validateBeforeSave: false });

      return sendTokenResponse(user, 200, res);
    }

    // ── Case 2: Register with OTP ─────────────────────────────────────────────
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required for registration.' });
    }

    // Validate OTP — must have been sent (temporarily stored somewhere)
    // During registration, OTP was stored against any temp user or we use a server-side memory map
    // Simplest approach: we stored it on ANY user with this mobile; if none, use module-level store
    const storedEntry = otpStore[digits];
    if (!storedEntry) {
      return res.status(400).json({ success: false, message: 'OTP not found. Please request a new OTP.' });
    }
    if (storedEntry.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP. Please check and try again.' });
    }
    if (new Date() > storedEntry.expiry) {
      delete otpStore[digits];
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    delete otpStore[digits];

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: digits,
      mobileNumber: digits,
      isPhoneVerified: true,
      dietaryPreference: dietaryPreference || 'any',
    });

    return sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// In-memory OTP store for new registrations (before user doc exists)
// Key: 10-digit mobile string, Value: { otp, expiry }
const otpStore = {};

// Revised sendOtp that also stores in otpStore for new registrations
// (We patch the exported function to update otpStore as well)
const _originalSendOtp = exports.sendOtp;
exports.sendOtp = async (req, res, next) => {
  try {
    const { mobileNumber } = req.body;
    if (!mobileNumber) {
      return res.status(400).json({ success: false, message: 'Please provide a mobile number.' });
    }

    const digits = mobileNumber.replace(/\D/g, '');
    if (digits.length !== 10) {
      return res.status(400).json({ success: false, message: 'Enter a valid 10-digit Indian mobile number.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    // Store in memory for new registrations
    otpStore[digits] = { otp, expiry };

    // Also store in existing user doc if found
    await User.updateMany({ mobileNumber: digits }, { $set: { otpCode: otp, otpExpiry: expiry } });

    console.log(`[FoodSwift OTP] +91${digits} → OTP: ${otp} (5 min)`);

    res.status(200).json({
      success: true,
      message: `OTP sent to +91${digits.slice(0, 5)}XXXXX (Demo mode)`,
      demoOtp: otp, // Remove in production
    });
  } catch (error) {
    next(error);
  }
};
