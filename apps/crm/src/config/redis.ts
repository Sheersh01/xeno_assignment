import Redis from 'ioredis';

const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
const redisPassword = process.env.REDIS_PASSWORD;

export const connection = process.env.REDIS_URL 
  ? new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null, keepAlive: 10000 })
  : new Redis({
      host: redisHost,
      port: redisPort,
      password: redisPassword,
      tls: redisPassword ? {} : undefined,
      maxRetriesPerRequest: null,
      keepAlive: 10000,
    });

// Suppress verbose ECONNRESET logs from Upstash dropping idle connections
connection.on('error', (err: any) => {
  if (err.code !== 'ECONNRESET') {
    console.error('[Redis Error]', err.message);
  }
});
