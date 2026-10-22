import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'foodswift_super_secret_key_12345', {
    expiresIn: '30d',
  });
};

const isEmail = (val) => {
  return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(val);
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  const { name, emailOrPhone, password, role, address } = req.body;

  try {
    if (!name || !emailOrPhone || !password) {
      res.status(400);
      throw new Error('Please enter name, identifier (email or phone), and password');
    }

    let email = null;
    let phone = null;

    if (isEmail(emailOrPhone)) {
      email = emailOrPhone;
    } else {
      phone = emailOrPhone;
      // Clean up phone number (digits only)
      phone = phone.replace(/\D/g, '');
      if (phone.length < 7) {
        res.status(400);
        throw new Error('Please enter a valid phone number');
      }
      email = `phone_${phone}@foodswift.local`;
    }

    // Check if user exists by email or phone
    const userExists = await User.findOne({
      $or: [{ email }, ...(phone ? [{ phone }] : [])],
    });

    if (userExists) {
      res.status(400);
      throw new Error('A user with this email or phone number already exists');
    }

    const user = await User.create({
      name,
      email,
      phone: phone || '',
      password,
      role: role || 'customer',
      address: address || '',
    });

    if (user) {
      res.status(201).json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email.includes('@foodswift.local') ? '' : user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  const { emailOrPhone, password } = req.body;

  try {
    if (!emailOrPhone || !password) {
      res.status(400);
      throw new Error('Please enter email or phone and password');
    }

    let searchVal = emailOrPhone;
    if (!isEmail(searchVal)) {
      searchVal = searchVal.replace(/\D/g, '');
    }

    const user = await User.findOne({
      $or: [
        { email: emailOrPhone },
        { phone: searchVal },
        { email: `phone_${searchVal}@foodswift.local` },
      ],
    }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email.includes('@foodswift.local') ? '' : user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid email/phone number or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email.includes('@foodswift.local') ? '' : user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};
