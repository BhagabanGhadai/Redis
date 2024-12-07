const client = require('./redis');
const acquireLock = async (key, value, ttl, retries = 5, retryDelay = 200) => {
  for (let i = 0; i < retries; i++) {
    const result = await client.set(key, value, 'NX', 'EX', ttl);
    if (result === 'OK') {
      console.log(`Lock acquired for key: ${key}`);
      return true;
    }
    const jitter = Math.random() * 100; // Add jitter up to 100ms
    const delay = retryDelay * Math.pow(2, i) + jitter; // Exponential backoff
    console.log(`Failed to acquire lock for key: ${key}. Retrying in ${delay}ms`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  return false;
};

  
  const releaseLock = async (key, value) => {
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    const result = await client.eval(script, 1, key, value);
    return result === 1;
  };
  
module.exports = {
    acquireLock,
    releaseLock
}