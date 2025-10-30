import { Router } from 'express';
import {
  getAllDevelopers,
  getDeveloperById,
  getDeveloperWithLowestPoints,
  getWeeklyReport,
  addTimeEntry,
} from '../controllers/developer.controller';
import { validate } from '../middleware/validate';
import {
  addTimeEntrySchema,
  getDeveloperByIdSchema,
  weeklyReportSchema,
} from '../validation/schemas';

const router = Router();

router.get('/', getAllDevelopers);
router.get('/lowest-points', getDeveloperWithLowestPoints);
router.get('/weekly-report', validate(weeklyReportSchema), getWeeklyReport);
router.get('/:id', validate(getDeveloperByIdSchema), getDeveloperById);
router.post('/time-entry', validate(addTimeEntrySchema), addTimeEntry);

export default router;
