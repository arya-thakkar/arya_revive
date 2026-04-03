const rateLimit = require('express-rate-limit');

const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, 
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts, please wait 15 minutes.' },
});

const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI request limit reached, please try again in an hour.' },
});

module.exports = { rateLimiter, authRateLimiter, aiRateLimiter };
