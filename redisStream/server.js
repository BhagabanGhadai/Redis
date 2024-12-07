const express = require('express');
const app = express();
const PORT = 3001;
const Redis = require('ioredis');
const client = new Redis({
    host: 'localhost',
    port: 6379,
});

client.on('error', (err) => {
    console.error('Redis error:', err);
});
client.on('connect', () => {
    console.log('Connected to Redis');
})
const consumeMessagesFromStream = async (stream, consumerGroup, consumerName) => {
    // Create consumer group if not exists
    try {
        await client.xgroup('CREATE', stream, consumerGroup, '$', 'MKSTREAM');
    } catch (err) {
        // Ignore error if group already exists
    }

    const readMessages = async () => {
        const messages = await client.xreadgroup('GROUP', consumerGroup, consumerName, 'COUNT', 10, 'BLOCK', 5000, 'STREAMS', stream, '>');
        if (messages) {
            messages.forEach(([stream, entries]) => {
                entries.forEach(([id, fields]) => {
                    console.log(`Received message from stream ${stream}: ${fields[1]}`);
                    // Acknowledge message
                    client.xack(stream, consumerGroup, id);
                });
            });
        }
        readMessages(); // Continue reading messages
    };

    readMessages();
};
consumeMessagesFromStream('demoStream', 'mygroup', 'consumer1');

app.get('/', (req, res) => {
    res.send('message publishd');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});