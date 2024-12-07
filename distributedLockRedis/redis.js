const Redis = require('ioredis');
const client = new Redis({
  host: 'localhost',
  port: 6379,
});

client.on('error', (err) => {
  console.error('Redis error:', err);
});

module.exports=client