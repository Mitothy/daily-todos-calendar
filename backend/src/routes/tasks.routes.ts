import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  getTasks,
  createTasks,
  toggleTaskCompletion,
  updateTaskTitle,
  bulkUpdateTasks,
  deleteTasks,
} from '../controllers/tasksController.js';

const router = Router();

router.use(requireAuth);

router.get('/:date', getTasks);
router.post('/:date', createTasks);
router.patch('/:date/:taskId/toggle', toggleTaskCompletion);
router.patch('/:date/:taskId/title', updateTaskTitle);
router.put('/:date', bulkUpdateTasks);
router.delete('/:date', deleteTasks);

export default router;
