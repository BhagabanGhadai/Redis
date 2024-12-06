const express = require('express');
const app = express();
const PORT = 3000;

const rateLimiterMiddleware = require('./ratelimiterMiddleware');
const client = require('./redis');
app.use(express.json());
client.connect().then(() => {
  console.log('Connected to Redis');
})

const limiter = rateLimiterMiddleware({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  client: client,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(limiter); // Apply rate limiter middleware globally

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
