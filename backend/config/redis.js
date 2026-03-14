import { Redis } from "ioredis";
import dotenv from "dotenv";

dotenv.config();

function buildRedisConfig() {
  if (process.env.REDIS_URL) {
    const url = new URL(process.env.REDIS_URL);
    return {
      connection: {
        host: url.hostname,
        port: Number.parseInt(url.port, 10) || 6379,
        username: url.username || "default",
        password: decodeURIComponent(url.password),
        tls: url.protocol === "rediss:" ? {} : undefined,
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
      },
      client: new Redis(process.env.REDIS_URL, {
        tls: url.protocol === "rediss:" ? {} : undefined,
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
      }),
    };
  }

  const connection = {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number.parseInt(process.env.REDIS_PORT, 10) || 6379,
    username: process.env.REDIS_USERNAME || undefined,
    password: process.env.REDIS_PASSWORD || undefined,
    tls: process.env.REDIS_TLS === "true" ? {} : undefined,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  };

  return {
    connection,
    client: new Redis(connection),
  };
}

const { connection, client } = buildRedisConfig();

export { connection };
export const redis = client;

redis.on("connect", () => console.log("Redis connected"));
redis.on("error", (error) => console.error("Redis error:", error.message));

export default redis;
