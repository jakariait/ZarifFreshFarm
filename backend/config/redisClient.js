const redis = require('redis');

const client = redis.createClient({
  socket: {
    host: "127.0.0.1",
    port: 6379
  }
});

client.on('error', (err) => {
  console.error('Redis error:', err);
});

client.connect()
  .then(() => console.log('Connected to Redis'))
  .catch(err => console.error('Redis connection failed:', err));

module.exports = client;
