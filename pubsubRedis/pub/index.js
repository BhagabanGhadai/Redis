const express = require('express');
const app = express();
const PORT = 3000;
const redis = require('ioredis');
const client = new redis({
    host: 'localhost',
    port: 6379,
});
client.on('error', (err) => {
    console.error('Redis error:', err);
});
client.on('connect', () => {
    console.log('Connected to Redis');
})
const publishMessage = async (channel, message) => {
    await client.publish(channel, message);
    console.log(`Message published to channel ${channel}: ${message}`);
  };
  
app.get('/', (req, res) => {
    publishMessage("demoChannel", "hello world");
    res.send('message publishd');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});