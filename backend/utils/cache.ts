import { createClient } from 'redis';

const redisClient = createClient({
    url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
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

export default redisClient;
