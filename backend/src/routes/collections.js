import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  listCollections,
  createCollection,
  getCollection,
  updateCollection,
  deleteCollection,
  shareCollection,
  getSharedCollection,
} from '../controllers/collectionController.js';
import {
  createRequest,
  updateRequest,
  deleteRequest,
  duplicateRequest,
} from '../controllers/requestController.js';

const router = Router();

router.get('/shared/:token', getSharedCollection);

router.use(requireAuth);
router.get('/', listCollections);
router.post('/', createCollection);
router.get('/:id', getCollection);
router.put('/:id', updateCollection);
router.delete('/:id', deleteCollection);
router.post('/:id/share', shareCollection);
router.post('/:id/requests', createRequest);

export default router;
