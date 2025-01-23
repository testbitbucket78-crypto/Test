const rateLimit = require('express-rate-limit');

const dynamicRateLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: (req) => {
    console.log(`Calculating limit for SPID: ${req.body.spId}`);
    return req.body.spId ? 30 : 0;
  },
  keyGenerator: (req) => req.body.spId || req.ip,
  message: 'Too many requests, please try again later.',
});

module.exports = dynamicRateLimiter;