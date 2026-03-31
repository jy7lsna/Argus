import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || (process.env.REDIS_HOST ? `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT || 6379}` : null);

let redisClient: ReturnType<typeof createClient> | null = null;

if (redisUrl) {
    redisClient = createClient({
        url: redisUrl,
        socket: {
            reconnectStrategy: (retries: number) => {
                if (retries > 3) {
                    console.warn('⚠️  Redis unavailable — caching disabled. App will continue without cache.');
                    return false; // Stop reconnecting
                }
                return Math.min(retries * 500, 3000);
            }
        }
    });

    redisClient.on('error', (err) => {
        console.warn('⚠️  Redis error:', err.message || 'unknown error');
    });

    // Connect to Redis on initialization
    redisClient.connect().catch(() => {
        // Silent fail - App continues without cache
    });
} else {
    console.log('ℹ️  No Redis configuration found. Starting in Redis-free cache mode.');
}

export default redisClient;
