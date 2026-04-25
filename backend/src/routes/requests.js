import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { updateRequest, deleteRequest, duplicateRequest } from '../controllers/requestController.js';

const router = Router();
router.use(requireAuth);
router.put('/:id', updateRequest);
router.delete('/:id', deleteRequest);
router.post('/:id/duplicate', duplicateRequest);

export default router;
