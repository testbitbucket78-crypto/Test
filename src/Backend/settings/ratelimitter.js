const rateLimit = require('express-rate-limit');

const dynamicRateLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: (req) => {
    console.log(`Calculating limit for spNumber: ${req.body.spNumber}`);
    return req.body.spNumber ? 10 : 0;
  },
  keyGenerator: (req) => req.body.spNumber || req.ip,
  message: 'Too many requests, please try again later.',
});

module.exports = dynamicRateLimiter;