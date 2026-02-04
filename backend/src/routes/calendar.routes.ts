import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { getMonthData, getColors } from '../controllers/calendarController.js';

const router = Router();

router.get('/colors', getColors);
router.get('/month/:year/:month', requireAuth, getMonthData);

export default router;
