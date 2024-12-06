const leakBucket = async (ip, capacity, refillRate, client) => {
    const currentTime = Date.now();
    const bucketKey = `leak_bucket:${ip}`;
  
    // Fetch current bucket state from Redis
    const bucket = await client.get(bucketKey);
    let tokens = capacity;
    let lastTime = currentTime;
  
    if (bucket) {
      const parsed = JSON.parse(bucket);
      tokens = parsed.tokens;
      lastTime = parsed.lastTime;
    }
  
    // Calculate time elapsed and refill the bucket
    const elapsedTime = (currentTime - lastTime) / 1000;
    const newTokens = Math.min(capacity, tokens + Math.floor(elapsedTime * refillRate));
  
    if (newTokens < 1) {
      // If no tokens are available, reject the request
      return false;
    }
  
    // Update the bucket with reduced tokens and current time
    await client.set(bucketKey, JSON.stringify({
      tokens: newTokens - 1,
      lastTime: currentTime
    }));
  
    // Accept the request
    return true;
  };
  

module.exports = leakBucket;