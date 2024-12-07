const Redis = require('ioredis');
const redisInstances = [
  new Redis({ host: 'localhost', port: 6379 }),
  new Redis({ host: 'localhost', port: 6380 }),
  new Redis({ host: 'localhost', port: 6381 }),
];

redisInstances.forEach((client, index) => {
  client.on('error', (err) => {
    console.error(`Redis ${index} error:`, err);
  });
});
const acquireRedlock = async (key, value, ttl) => {
    const startTime = Date.now();
    const quorom = Math.floor(redisInstances.length / 2) + 1;
    let acquired = 0;
  
    for (const client of redisInstances) {
      try {
        const result = await client.set(key, value, 'NX', 'PX', ttl);
        if (result === 'OK') {
          acquired++;
        }
      } catch (err) {
        console.error('Error acquiring lock:', err);
      }
    }
  
    const elapsedTime = Date.now() - startTime;
    if (acquired >= quorom && elapsedTime < ttl) {
      return true;
    }
  
    // If lock wasn't acquired in the majority or time exceeded, release any acquired locks
    await releaseRedlock(key, value);
    return false;
  };
  
  const releaseRedlock = async (key, value) => {
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    for (const client of redisInstances) {
      try {
        await client.eval(script, 1, key, value);
      } catch (err) {
        console.error('Error releasing lock:', err);
      }
    }
  };
  const processOrder = async (orderId) => {
    const lockKey = `lock:order:${orderId}`;
    const lockValue = `unique_value_${Date.now()}`;
    const ttl = 10000; // Time-to-live in milliseconds
  
    const acquired = await acquireRedlock(lockKey, lockValue, ttl);
  
    if (acquired) {
      try {
        // Check inventory, update order, etc.
        console.log(`Processing order ${orderId}`);
        // Simulate order processing time
        await new Promise(res => setTimeout(res, 2000));
      } finally {
        await releaseRedlock(lockKey, lockValue);
        console.log(`Lock released for order ${orderId}`);
      }
    } else {
      console.log(`Failed to acquire lock for order ${orderId}. Another request is processing this order.`);
    }
  };
  
  // Simulate multiple requests from the same server
  for (let i = 0; i < 10; i++) {
    processOrder(Date.now().toString());
  }
    