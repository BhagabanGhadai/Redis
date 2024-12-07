const leakBucket = require('./leakbucktalgo');
const rateLimiterMiddleware = (options) => {
    const {
      windowMs = 15 * 60 * 1000, // 15 minutes
      max = 100, // Maximum tokens
      client,
      standardHeaders = true,
      legacyHeaders = false,
    } = options;
    const refillRate = max / (windowMs / 1000); // Tokens per second
  
    return async (req, res, next) => {
      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

      const allowed = await leakBucket(ip, max, refillRate, client);
  
      if (standardHeaders) {
        res.set('RateLimit-Limit', max);
        res.set('RateLimit-Remaining', Math.max(0, await client.get(`leak_bucket:${ip}`).then(data => JSON.parse(data).tokens)));
        res.set('RateLimit-Reset', Math.ceil(windowMs / 1000));
      }
  
      if (legacyHeaders) {
        res.set('X-RateLimit-Limit', max);
        res.set('X-RateLimit-Remaining', Math.max(0, await client.get(`leak_bucket:${ip}`).then(data => JSON.parse(data).tokens)));
        res.set('X-RateLimit-Reset', Math.ceil(windowMs / 1000));
      }
  
      if (allowed) {
        next(); // Allow the request to proceed
      } else {
        res.status(429).send('Too many requests, please try again later.'); // Rate limit exceeded
      }
    };
  };
  

  module.exports = rateLimiterMiddleware;