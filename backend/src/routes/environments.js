import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  listEnvironments,
  createEnvironment,
  updateEnvironment,
  deleteEnvironment,
} from '../controllers/environmentController.js';

const router = Router();
router.use(requireAuth);
router.get('/', listEnvironments);
router.post('/', createEnvironment);
router.put('/:id', updateEnvironment);
router.delete('/:id', deleteEnvironment);

export default router;
