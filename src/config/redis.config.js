// config redis and init while server is up 
// do not create multiple instance , make it singleton

const { Redis } = require('ioredis')

const redis = new Redis(
    {
        host: "127.0.0.1",
        port: 6379,
        maxRetriesPerRequest: null,
        enableReadyCheck: false
    }
)

redis.on("connect", () => {
  console.log("Redis connected");
});

redis.on("ready", () => {
  console.log("Redis ready");
});

redis.on("error", (err) => {
  console.error("Redis error:", err);
});

redis.on("close", () => {
  console.warn("Redis connection closed");
});

module.exports = { redis };