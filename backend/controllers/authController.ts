import AuthService from '../services/authService';
import { clearAuthCookie, setAuthCookie } from '../utils/authCookies';

const AuthController = {
    register: async (req: any, res: any) => {
        try {
            const { email, password, name, organization } = req.body;

            if (!email || !password || !name || !organization) {
                return res.status(400).json({ error: 'Email, password, name, and organization are required' });
            }

            const result = await AuthService.register({ email, password, name, organization });
            setAuthCookie(res, result.token);
            res.json(result);
        } catch (error: any) {
            console.error('Registration failed:', error.message);
            const safeMessages = [
                'User already exists',
                'Password must be at least 8 characters long',
                'Password must contain uppercase, lowercase, and a digit'
            ];
            const msg = safeMessages.includes(error.message) ? error.message : 'Registration failed';
            res.status(400).json({ error: msg });
        }
    },

    login: async (req: any, res: any) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            }

            const result = await AuthService.login({ email, password });
            if (result.token) {
                setAuthCookie(res, result.token);
            }
            res.json(result);
        } catch (error: any) {
            console.error('Login failed:', error.message);
            res.status(401).json({ error: 'Invalid credentials' });
        }
    },

    me: async (req: any, res: any) => {
        try {
            const user = await AuthService.getUserById(req.user.id);
            res.json(user);
        } catch (error) {
            res.status(401).json({ error: 'Not authenticated' });
        }
    },

    login2FA: async (req: any, res: any) => {
        try {
            const { tempToken, token } = req.body;
            if (!tempToken || !token) {
                return res.status(400).json({ error: 'tempToken and token are required' });
            }
            const result = await AuthService.login2FA({ tempToken, token });
            setAuthCookie(res, result.token);
            res.json(result);
        } catch (error: any) {
            console.error('2FA Login failed:', error.message);
            res.status(401).json({ error: 'Two-Factor Authentication failed' });
        }
    },

    logout: async (req: any, res: any) => {
        clearAuthCookie(res);
        res.json({ success: true });
    },

    generate2FA: async (req: any, res: any) => {
        try {
            const userId = req.user.id;
            const result = await AuthService.generate2FA(userId);
            res.json(result);
        } catch (error: any) {
            console.error('Generate 2FA failed:', error.message);
            res.status(400).json({ error: '2FA setup failed' });
        }
    },

    verify2FA: async (req: any, res: any) => {
        try {
            const userId = req.user.id;
            const { token } = req.body;
            if (!token) {
                return res.status(400).json({ error: 'Token is required' });
            }
            const result = await AuthService.verify2FA(userId, token);
            res.json(result);
        } catch (error: any) {
            console.error('Verify 2FA failed:', error.message);
            res.status(400).json({ error: 'Invalid verification token' });
        }
    },

    generateApiKey: async (req: any, res: any) => {
        try {
            const userId = req.user.id;
            const { name } = req.body;
            if (!name) return res.status(400).json({ error: 'Key name is required' });
            const result = await AuthService.generateApiKey(userId, name);
            res.json(result);
        } catch (error: any) {
            console.error('Generate API Key failed:', error.message);
            res.status(400).json({ error: 'Failed to generate API key' });
        }
    },

    listApiKeys: async (req: any, res: any) => {
        try {
            const userId = req.user.id;
            const result = await AuthService.listApiKeys(userId);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: 'Failed to list API keys' });
        }
    },

    revokeApiKey: async (req: any, res: any) => {
        try {
            const userId = req.user.id;
            const keyId = req.params.id;
            const result = await AuthService.revokeApiKey(userId, keyId);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: 'Failed to revoke API key' });
        }
    }
};

export default AuthController;
