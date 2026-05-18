import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { listCards, createCard, updateCard, deleteCard, bulkUpdate } from '../controllers/kanbanController.js';

const router = Router();
router.use(requireAuth);

router.get('/', listCards);
router.post('/', createCard);
router.put('/bulk', bulkUpdate);
router.patch('/:id', updateCard);
router.delete('/:id', deleteCard);

export default router;
