import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { listHistory, deleteHistory } from '../controllers/historyController.js';

const router = Router();
router.use(requireAuth);
router.get('/', listHistory);
router.delete('/:id', deleteHistory);

export default router;
