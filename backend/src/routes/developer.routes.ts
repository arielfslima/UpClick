import { Router } from 'express';
import {
  getAllDevelopers,
  getDeveloperById,
  getDeveloperWithLowestPoints,
  getWeeklyReport,
  addTimeEntry,
} from '../controllers/developer.controller';

const router = Router();

router.get('/', getAllDevelopers);
router.get('/lowest-points', getDeveloperWithLowestPoints);
router.get('/weekly-report', getWeeklyReport);
router.get('/:id', getDeveloperById);
router.post('/time-entry', addTimeEntry);

export default router;
