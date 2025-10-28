import { Router } from 'express';
import {
  getAllTasks,
  getTaskById,
  syncTasks,
  getTaskStats,
} from '../controllers/task.controller';

const router = Router();

router.get('/', getAllTasks);
router.get('/stats', getTaskStats);
router.get('/:id', getTaskById);
router.post('/sync', syncTasks);

export default router;
