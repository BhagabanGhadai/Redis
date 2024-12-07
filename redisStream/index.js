const express = require('express');
const app = express();
const PORT = 3000;
const Redis = require('ioredis');
const clinet = new Redis({
  host: 'localhost',
  port: 6379,
});

clinet.on('error', (err) => {
  console.error('Redis error:', err);
});
clinet.on('connect', () => {
  console.log('Connected to Redis');
})
const addMessageToStream = async (stream, message) => {
    await clinet.xadd(stream, '*', 'message', message);
    console.log(`Message added to stream ${stream}: ${message}`);
  };
  
app.get('/', (req, res) => {
    addMessageToStream('demoStream', 'hello world');
    res.send('message publishd');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});