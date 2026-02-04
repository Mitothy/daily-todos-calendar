import { Router } from 'express';
import { googleAuth, refreshToken, authStatus, logout } from '../controllers/authController.js';

const router = Router();

router.post('/google', googleAuth);
router.post('/refresh', refreshToken);
router.get('/status', authStatus);
router.post('/logout', logout);

export default router;
