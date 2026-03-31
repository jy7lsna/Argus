import express from 'express';
import AuthController from '../controllers/authController';
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/login/2fa', AuthController.login2FA);
router.post('/logout', AuthController.logout);
router.get('/me', authMiddleware, AuthController.me);

router.post('/2fa/generate', authMiddleware, AuthController.generate2FA);
router.post('/2fa/verify', authMiddleware, AuthController.verify2FA);

router.post('/api-keys', authMiddleware, AuthController.generateApiKey);
router.get('/api-keys', authMiddleware, AuthController.listApiKeys);
router.delete('/api-keys/:id', authMiddleware, AuthController.revokeApiKey);

export default router;
