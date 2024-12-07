const { acquireLock, releaseLock } = require('./locks');

const processOrder = async (orderId) => {
    const lockKey = `lock:order:${orderId}`;
    const lockValue = `unique_value_${Date.now()}`;
    const ttl = 10; // Time-to-live in seconds
  
    const acquired = await acquireLock(lockKey, lockValue, ttl);
  
    if (acquired) {
      try {
        // Check inventory, update order, etc.
        console.log(`Processing order ${orderId}`);
        // Simulate order processing time
        await new Promise(res => setTimeout(res, 2000));
      } finally {
        // Release the lock after processing
        const released = await releaseLock(lockKey, lockValue);
        if (released) {
          console.log(`Lock released for order ${orderId}`);
        } else {
          console.log(`Failed to release lock for order ${orderId}`);
        }
      }
    } else {
      console.log(`Failed to acquire lock for order ${orderId}. Another request is processing this order.`);
    }
  };
  
  // Simulate multiple requests from the same server
  for (let i = 0; i < 10; i++) {
    processOrder('12345');
  }
  