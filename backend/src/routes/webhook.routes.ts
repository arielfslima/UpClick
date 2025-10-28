import { Router } from 'express';
import {
  handleWebhook,
  registerWebhook,
  getWebhooks,
  deleteWebhook,
} from '../controllers/webhook.controller';

const router = Router();

router.post('/clickup', handleWebhook);
router.post('/register', registerWebhook);
router.get('/', getWebhooks);
router.delete('/:id', deleteWebhook);

export default router;
