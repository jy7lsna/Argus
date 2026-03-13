import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import crypto from 'crypto';
import { User, Organization, ApiKey } from '../models';

const JWT_SECRET = process.env.JWT_SECRET || 'argus-secret-key-change-in-production';

const AuthService = {
    /**
     * Register a new user and organization
     */
    register: async ({ email, password, name, organization }: any) => {
        // Check if user exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            throw new Error('User already exists');
        }

        // Get or create organization
        const [org] = await Organization.findOrCreate({
            where: { name: organization }
        });

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            email,
            password: hashedPassword,
            name,
            organization_id: org.id
        });

        // Generate token
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                organization: org.name
            }
        };
    },

    /**
     * Authenticate a user and return a token
     */
    login: async ({ email, password }: any) => {
        const user = await User.findOne({
            where: { email },
            include: [Organization]
        });

        if (!user) {
            throw new Error('Invalid credentials');
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            throw new Error('Invalid credentials');
        }

        if (user.is_two_factor_enabled) {
            // Give a temporary token valid for 5 minutes just for 2FA verification
            const tempToken = jwt.sign({ temp_id: user.id }, JWT_SECRET, { expiresIn: '5m' });
            return {
                requires2FA: true,
                tempToken
            };
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                organization: user.organization ? user.organization.name : null
            }
        };
    },

    /**
     * Complete 2FA Login
     */
    login2FA: async ({ tempToken, token }: any) => {
        try {
            const decoded: any = jwt.verify(tempToken, JWT_SECRET);
            const user = await User.findByPk(decoded.temp_id, { include: [Organization] });
            
            if (!user || (!user.is_two_factor_enabled)) {
                throw new Error('Invalid Two-Factor Session');
            }

            const verified = speakeasy.totp.verify({
                secret: user.two_factor_secret,
                encoding: 'base32',
                token
            });

            if (!verified) {
                throw new Error('Invalid Two-Factor Token');
            }

            const authToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

            return {
                token: authToken,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    organization: user.organization ? user.organization.name : null
                }
            };
        } catch (error) {
            throw new Error('Two-Factor Authentication failed');
        }
    },

    /**
     * Generate 2FA Secret for a user
     */
    generate2FA: async (userId: number) => {
        const user = await User.findByPk(userId);
        if (!user) throw new Error('User not found');

        const secret = speakeasy.generateSecret({
            name: `Argus Platform (${user.email})`
        });

        // Save secret to user
        await user.update({ two_factor_secret: secret.base32 });

        // Generate QR code
        const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url || '');

        return {
            secret: secret.base32,
            qrCodeUrl
        };
    },

    /**
     * Verify and Enable 2FA for a user
     */
    verify2FA: async (userId: number, token: string) => {
        const user = await User.findByPk(userId);
        if (!user) throw new Error('User not found');

        const verified = speakeasy.totp.verify({
            secret: user.two_factor_secret,
            encoding: 'base32',
            token
        });

        if (verified) {
            await user.update({ is_two_factor_enabled: true });
            return { success: true, message: '2FA enabled successfully' };
        } else {
            throw new Error('Invalid token');
        }
    },

    /**
     * Generate a new API Key for a user
     */
    generateApiKey: async (userId: number, name: string) => {
        const plainSecret = crypto.randomBytes(32).toString('hex');
        const keyHash = await bcrypt.hash(plainSecret, 10);

        const apiKey = await ApiKey.create({
            user_id: userId,
            name,
            key_hash: keyHash
        });

        return {
            id: apiKey.id,
            name: apiKey.name,
            key: `${apiKey.id}.${plainSecret}`, // Composite key
            createdAt: apiKey.createdAt
        };
    },

    /**
     * List user API Keys
     */
    listApiKeys: async (userId: number) => {
        const keys = await ApiKey.findAll({
            where: { user_id: userId },
            attributes: ['id', 'name', 'last_used_at', 'expires_at', 'createdAt']
        });
        return keys;
    },

    /**
     * Revoke an API Key
     */
    revokeApiKey: async (userId: number, keyId: string) => {
        const result = await ApiKey.destroy({
            where: {
                id: keyId,
                user_id: userId
            }
        });

        if (result === 0) {
            throw new Error('API Key not found or does not belong to user');
        }

        return { success: true };
    },

    /**
     * Get user details by ID
     */
    getUserById: async (id: string | number) => {
        const user = await User.findByPk(id, {
            include: [Organization]
        });

        if (!user) {
            throw new Error('User not found');
        }

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            organization: user.organization ? user.organization.name : null
        };
    }
};

export default AuthService;
