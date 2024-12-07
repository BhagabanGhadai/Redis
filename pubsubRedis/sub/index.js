const express = require('express');
const app = express();
const PORT = 3001;
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
const subscribeToChannel = (channel) => {
    client.subscribe(channel, (err, count) => {
        if (err) {
            console.error('Failed to subscribe: %s', err.message);
        } else {
            console.log(`Subscribed to ${count} channel(s). Listening for updates on the ${channel} channel.`);
        }
    });

    client.on('message', (channel, message) => {
        console.log(`Received message from channel ${channel}: ${message}`);
    });
};
subscribeToChannel("demoChannel");
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});