import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { ApiKey, User } from '../models';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('FATAL: JWT_SECRET environment variable is not set.');
    process.exit(1);
}

const authMiddleware = async (req: any, res: any, next: any) => {
    try {
        // 1. Check for API Key
        const apiKeyHeader = req.headers['x-api-key'];
        if (apiKeyHeader) {
            const parts = apiKeyHeader.split('.');
            if (parts.length !== 2) {
                return res.status(401).json({ error: 'Invalid API Key format' });
            }
            const [keyId, keySecret] = parts;
            
            const apiKeyRecord = await ApiKey.findByPk(keyId);
            if (!apiKeyRecord) {
                return res.status(401).json({ error: 'Invalid API Key' });
            }

            // Check if API key has expired (#10 fix)
            if (apiKeyRecord.expires_at && new Date(apiKeyRecord.expires_at) < new Date()) {
                return res.status(401).json({ error: 'API Key has expired' });
            }

            const isValid = await bcrypt.compare(keySecret, apiKeyRecord.key_hash);
            if (!isValid) {
                return res.status(401).json({ error: 'Invalid API Key' });
            }

            // Update last used
            await apiKeyRecord.update({ last_used_at: new Date() });

            // Fetch user to attach to req
            const user = await User.findByPk(apiKeyRecord.user_id);
            if (!user) {
                return res.status(401).json({ error: 'User for API key no longer exists' });
            }

            req.user = { id: user.id, email: user.email };
            return next();
        }

        // 2. Fallback check for JWT Token
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Access token or API key required' });
        }

        jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
            if (err) {
                return res.status(403).json({ error: 'Invalid or expired token' });
            }

            // Validate JWT payload structure (#11 fix)
            // Reject temp 2FA tokens (which only have `temp_id`, not `id`)
            if (!decoded || !decoded.id || !decoded.email) {
                return res.status(403).json({ error: 'Invalid token payload' });
            }

            req.user = { id: decoded.id, email: decoded.email };
            next();
        });
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

export default authMiddleware;

