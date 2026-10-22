const express = require('express');
const router = express.Router();
const { chat } = require('../controllers/aiController');
const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

// Optional authentication middleware for AI chat
const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id);
      if (user) req.user = user;
    } catch (e) {
      // continue without user session
    }
  }
  next();
};

router.post('/chat', optionalAuth, chat);

module.exports = router;
