import { Router } from 'express';
import {
  getAllSettings,
  getSettingByKey,
  upsertSetting,
  updateSettings,
  deleteSetting,
} from '../controllers/settings.controller';
import { validate } from '../middleware/validate';
import { updateSettingsSchema } from '../validation/schemas';

const router = Router();

router.get('/', getAllSettings);
router.get('/:key', getSettingByKey);
router.post('/', validate(updateSettingsSchema), upsertSetting);
router.put('/', validate(updateSettingsSchema), updateSettings);
router.delete('/:key', deleteSetting);

export default router;
